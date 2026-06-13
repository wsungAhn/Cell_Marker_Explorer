# Orchestration Loop — Protocol Contract

A file-based message queue that lets **Codex (implementer)** and **Claude (supervisor/auditor)** run as an autonomous loop with no shared mutable state (each side writes only its own side → no races).

```
        supervisor (Claude)                         implementer (Codex)
   ┌───────────────────────────┐               ┌───────────────────────────┐
   │ 1. drop TASK-NN-*.md  ─────┼──► inbox/ ────┼─► 2. codex-runner picks it │
   │                           │               │    runs Codex on the task │
   │ 5. audit REPORT + files   │◄── outbox/ ◄───┼── 3. writes outbox/NN/...  │
   │    move to review/        │   (.done)     │      + REPORT.md + .done   │
   │ 6. pass → assemble into   │               │    4. archives the prompt  │
   │    live tree + commit;    │               │       waits for next       │
   │    fail → re-issue task ──┼──► inbox/ ─────┼─►  (loop)                  │
   └───────────────────────────┘               └───────────────────────────┘
```

## Directories

| Path | Owner (writes) | Purpose |
|---|---|---|
| `orchestration/inbox/TASK-*.md` | **Supervisor** | Active task prompts. Codex consumes oldest-first (lexical order = handoff order). |
| `orchestration/inbox/.processed/` | codex-runner | Consumed prompts archived here. |
| `orchestration/outbox/<id>/` | **Codex** | Deliverables (mirroring final paths, e.g. `js/datastore.js`) + `REPORT.md` + `.done` sentinel. |
| `orchestration/outbox/<id>/.claimed` | **Supervisor** | Marker the supervisor created when it pulled this task for review (prevents re-processing). |
| `orchestration/logs/<id>.log` | codex-runner | Full Codex run output. |
| `review/pending/<id>/` | **Supervisor** | Deliverable under audit (moved out of outbox). |
| `review/accepted/<id>/` | **Supervisor** | Passed audit (then assembled into the live `js/ css/ svg/ updater/` tree + committed). |
| `review/rejected/<id>/` | **Supervisor** | Failed audit; feedback written; corrective TASK re-issued to inbox. |

## The handshake (atomic signals via file presence)

1. **Supervisor → Codex:** write `inbox/TASK-NN-name.md`. (The task id `NN` is the token right after `TASK-`.)
2. **Codex (codex-runner.sh):** picks the oldest `inbox/TASK-*.md`, runs Codex, writes everything into `outbox/NN/`, writes `outbox/NN/REPORT.md`, then writes `outbox/NN/.done` **last** (atomic "complete" signal), then `mv`s the prompt to `.processed/`.
3. **Supervisor (supervisor-watch.sh):** blocks until an `outbox/*/.done` exists without a sibling `.claimed`. On hit, it `touch`es `.claimed`, audits `REPORT.md` + the files against the spec's Test Criteria and the dataset.
4. **Pass:** supervisor moves the files into the live tree, commits, and drops the **next** `inbox/TASK-*.md`. **Fail:** supervisor moves to `review/rejected/<id>/`, writes feedback, and drops a corrective `inbox/TASK-NN-...-fix.md`.
5. Both watchers keep looping. Create `orchestration/STOP` to halt the Codex side cleanly.

## Running it (on the main system, after `git pull`)

```bash
# Terminal A — Codex side (needs the `codex` CLI installed & authed):
bash orchestration/codex-runner.sh          # edit CODEX_CMD at top to match your Codex version

# Supervisor side — Claude watches via supervisor-watch.sh between audits.
```

`codex-runner.sh` is the **orchestration file**: it is the only thing you start for Codex to begin working automatically. It auto-picks up `TASK-01-datastore.md` (already queued in the inbox) the moment it starts.

## Invariants (do not violate)

- Codex writes **only** under `orchestration/outbox/<active id>/`. Never the live tree, never another id, never `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, or git.
- Supervisor writes **only** the inbox, `.claimed` markers, `review/`, the live tree, and git.
- One task in flight at a time. The next inbox task appears only after the current one is accepted (or a fix is issued).
- `.done` is written last and is the single source of "ready"; `.claimed` is the single source of "already pulled".
