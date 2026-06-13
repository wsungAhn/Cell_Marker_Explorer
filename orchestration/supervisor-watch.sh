#!/usr/bin/env bash
# =============================================================================
# supervisor-watch.sh — Supervisor-side (Claude) watcher helper
#
# Blocks until Codex finalizes a task (an outbox/<id>/.done sentinel appears
# that the supervisor has not yet claimed), then prints the task id + report
# path and EXITS. The supervisor (Claude) wraps this: on each return it audits
# the deliverable, moves it to review/, assembles on pass, and drops the next
# TASK into the inbox — then calls this again. That closes the loop.
#
#   bash orchestration/supervisor-watch.sh            # wait once, then exit
#   bash orchestration/supervisor-watch.sh --list     # just print ready tasks
# =============================================================================
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT"
OUTBOX="orchestration/outbox"
POLL_SECONDS="${POLL_SECONDS:-15}"

ready() {
  # A task is 'ready for review' when .done exists but .claimed does not.
  for d in "$OUTBOX"/*/; do
    [ -f "$d/.done" ] && [ ! -f "$d/.claimed" ] && printf '%s\n' "${d%/}"
  done
}

if [ "${1:-}" = "--list" ]; then ready; exit 0; fi

while true; do
  HIT="$(ready | sort | head -n1 || true)"
  if [ -n "${HIT:-}" ]; then
    ID="$(basename "$HIT")"
    echo "READY task=$ID dir=$HIT report=$HIT/REPORT.md"
    exit 0
  fi
  sleep "$POLL_SECONDS"
done
