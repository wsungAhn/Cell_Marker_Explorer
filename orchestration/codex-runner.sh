#!/usr/bin/env bash
# =============================================================================
# codex-runner.sh — Codex-side autonomous loop (the orchestration file)
#
# Run this ONCE on the main system (where the `codex` CLI is installed). It then
# watches orchestration/inbox/ for new TASK-*.md prompts dropped by the
# supervisor (Claude), runs Codex non-interactively on each, and writes Codex's
# deliverables + completion report into orchestration/outbox/<task-id>/.
#
#   bash orchestration/codex-runner.sh
#
# Stop it cleanly by creating the file  orchestration/STOP  (or Ctrl-C).
# =============================================================================
set -uo pipefail

# ---- Resolve project root (this script lives in <root>/orchestration) --------
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

INBOX="orchestration/inbox"
PROCESSED="orchestration/inbox/.processed"
OUTBOX="orchestration/outbox"
LOGS="orchestration/logs"
STOP="orchestration/STOP"

# ---- CONFIG: adjust for your Codex CLI version -------------------------------
# CODEX_CMD receives the prompt on stdin and must run fully non-interactively
# (no approval prompts) so the loop never blocks.
#
# Codex CLI 0.137+ : `codex exec -C <dir> -s <sandbox> -`  (no more --full-auto)
#   sandbox modes: read-only | workspace-write | danger-full-access
#   workspace-write = can write inside <root>, no network/outside writes (safe default).
# Override either via env: CODEX_BIN=/path/to/codex  SANDBOX_MODE=workspace-write
POLL_SECONDS="${POLL_SECONDS:-15}"
SANDBOX_MODE="${SANDBOX_MODE:-workspace-write}"

# Resolve a *working* codex binary: prefer PATH, fall back to the bundled CLI
# inside Codex.app (Homebrew cask link may be broken).
CODEX_BIN="${CODEX_BIN:-}"
if [ -z "$CODEX_BIN" ]; then
  if command -v codex >/dev/null 2>&1 && codex --version >/dev/null 2>&1; then
    CODEX_BIN="$(command -v codex)"
  elif [ -x "/Applications/Codex.app/Contents/Resources/codex" ]; then
    CODEX_BIN="/Applications/Codex.app/Contents/Resources/codex"
  else
    echo "FATAL: no working codex CLI found on PATH or in Codex.app." >&2
    exit 1
  fi
fi
CODEX_CMD=("$CODEX_BIN" exec -C "$ROOT" -s "$SANDBOX_MODE" -)

log() { printf '[%s] %s\n' "$(date -u +%H:%M:%S)" "$*"; }

mkdir -p "$INBOX" "$PROCESSED" "$OUTBOX" "$LOGS"

log "codex-runner started. Codex: $CODEX_BIN  (sandbox=$SANDBOX_MODE)"
log "Watching $INBOX (poll ${POLL_SECONDS}s). Create $STOP to halt."

while true; do
  [ -f "$STOP" ] && { log "STOP file found — exiting."; rm -f "$STOP"; exit 0; }

  # Oldest unprocessed task prompt (numeric/lexical order = handoff order)
  TASK="$(ls -1 "$INBOX"/TASK-*.md 2>/dev/null | sort | head -n1 || true)"
  if [ -z "${TASK:-}" ]; then
    sleep "$POLL_SECONDS"; continue
  fi

  BASE="$(basename "$TASK" .md)"                 # e.g. TASK-01-datastore
  ID="$(printf '%s' "$BASE" | sed -E 's/^TASK-([A-Za-z0-9]+).*/\1/')"  # e.g. 01
  DEST="$OUTBOX/$ID"
  LOGFILE="$LOGS/$ID.log"
  mkdir -p "$DEST"

  log "Picked $BASE  (task id=$ID)  ->  $DEST"

  # Compose the prompt Codex actually runs. The task file + AGENTS.md are the
  # contract; Codex must write deliverables into $DEST mirroring final paths.
  PROMPT="$(cat <<EOF
You are the implementer for the Cell Markers Explorer project.
1. Read AGENTS.md (project root) IN FULL and obey it — especially the ownership map, prohibition list, and §8 loop protocol.
2. Read orchestration/README.md (the loop contract).
3. Your task for this run is in: $TASK
   --- BEGIN TASK ---
$(cat "$TASK")
   --- END TASK ---
4. Write ALL deliverable file(s) into the directory '$DEST/' mirroring their final project path (e.g. js/datastore.js -> $DEST/js/datastore.js). Do NOT write into the live js/ css/ svg/ updater/ tree. Do NOT touch data/, codex-specs/, MASTER-PLAN.md, AGENTS.md, git, or any other inbox/outbox task.
5. Write your completion report to '$DEST/REPORT.md' using the AGENTS.md §5 handoff format.
6. Then stop. Do not start any other task.
EOF
)"

  # Run Codex non-interactively; capture everything.
  log "Running Codex…"
  if printf '%s' "$PROMPT" | "${CODEX_CMD[@]}" >"$LOGFILE" 2>&1; then
    STATUS="ok"
  else
    STATUS="codex_exit_nonzero"
    log "WARNING: Codex exited non-zero (see $LOGFILE). Still finalizing for supervisor review."
  fi

  # Safety net: ensure a report exists so the supervisor's watcher always fires.
  if [ ! -f "$DEST/REPORT.md" ]; then
    {
      echo "# REPORT (auto-generated stub — Codex did not write REPORT.md)"
      echo
      echo "TASK: $BASE"
      echo "RUNNER_STATUS: $STATUS"
      echo "NOTE: Review $LOGFILE and $DEST/ contents manually."
    } > "$DEST/REPORT.md"
  fi

  # Sentinel written LAST = atomic 'this task is complete' signal for the supervisor.
  printf 'task=%s\nstatus=%s\nfinished_utc=%s\n' "$ID" "$STATUS" "$(date -u +%FT%TZ)" > "$DEST/.done"

  # Archive the consumed prompt so it is not picked up again.
  mv "$TASK" "$PROCESSED/$BASE.md"
  log "Task $ID finalized -> $DEST/.done  (prompt archived). Awaiting supervisor."

  sleep "$POLL_SECONDS"
done
