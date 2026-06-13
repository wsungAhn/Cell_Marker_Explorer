# SUPERVISOR.md — Supervisor (Claude) Runbook

How the supervisor side of the loop operates. **Mode: fully autonomous.** No per-task check-ins with the user. The user is contacted exactly **once — the final report** when the whole build is done (or when the loop is truly stuck and cannot self-recover). Everything in between is automatic, with rigorous version control and a per-task progress trail that is submitted in the final report.

## 0. Operating mode
- **Unattended.** Run the audit→assemble→commit→next-task loop without asking the user between tasks.
- **One in flight.** Exactly one task in the inbox at a time; issue the next only after the current is accepted (or a fix is issued).
- **Self-recovering.** On a failed audit, do NOT stop and ask — write feedback and re-issue a corrective task automatically (up to the retry cap, §4).
- **Escalate only when stuck.** Contact the user mid-run ONLY if a task exhausts its retry cap or a blocker is outside the loop's power (e.g. a data error, a missing dependency the specs can't resolve). Otherwise, silence until the final report.

## 1. The supervisor loop (per task)
1. `bash orchestration/supervisor-watch.sh` → blocks until `outbox/<id>/.done` with no `.claimed`.
2. `touch outbox/<id>/.claimed` (take ownership).
3. **Audit** (§3). Read `outbox/<id>/REPORT.md`, the deliverable(s), and `logs/<id>.log`. Check against the spec's Test Criteria + the dataset. For pure-logic JS (datastore, router, export, links, search), actually execute checks (node/python) against `data/cell-markers.json`. For SVG, structurally verify required ids/groups; note visual items needing a human glance in the progress record.
4. **Verdict:**
   - **PASS** → §2 assemble + commit + tag + push. Update ledger + progress record. Issue next task.
   - **FAIL** → §4 reject + re-issue.
5. Loop until all 18 tasks accepted, then §5 finalize.

## 2. Version-control policy (확실하게)
**One atomic commit + one tag per accepted task. Push every time. The remote always reflects exact progress and is restorable to any task boundary.**

- **Assemble:** move accepted files from `outbox/<id>/<path>` → live tree `<path>` (copy into `review/accepted/<id>/` first as the archived record).
- **Commit (one per task):**
  ```
  feat(task-NN): <deliverable> per spec <NN-name>

  Audit: <one-line result, key checks that passed>
  Codex report: <digest of REPORT.md — assumptions, flags>
  Fixes: <0, or N rounds + what changed>

  Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
  ```
- **Tag (one per task):** lightweight `task-NN` at that commit (e.g. `git tag task-01`). Re-issued fixes still collapse to the single accepting commit/tag.
- **Push:** `git push origin main --tags` after every accepted task.
- **Milestone tags (annotated):** at phase boundaries — `m1-data-layer` (after 05/datastore), `m2-assets` (after SVGs), `m3-shell` (after 04+15), `m4-views` (after 06–14), `m5-features` (19+18 wired), `m6-pipeline` (16–17). Final: `app-v1.0.0` when everything integrates.
- **Never** rewrite history, force-push, or commit rejected/transient `outbox/`, `review/pending|rejected/`, or `logs/` (gitignored).

## 3. Audit checklist (every task)
- [ ] Only the in-scope file(s) present in `outbox/<id>/` (no scope creep, no other id touched).
- [ ] Every Test-Criteria item in the named spec satisfied (or explicitly flagged as needs-human, e.g. SVG aesthetics).
- [ ] All ids / paths / class names / event names cross-checked against `data/cell-markers.json` and the spec — downstream modules depend on exact strings.
- [ ] No prohibited content (no `import`/`export`, no deps/CDN/framework, no `innerHTML` for data, no off-palette colors, no invented ids).
- [ ] No-build sanity: works by static-serving `index.html` (once enough modules exist).
- [ ] `REPORT.md` assumptions/flags reviewed; any flag affecting other tasks recorded in the ledger.

## 4. Failure handling (autonomous, capped)
- Move the drop to `review/rejected/<id>/round-K/`. Write `review/rejected/<id>/FEEDBACK-K.md`: exactly which criteria failed + the fix required (cite spec lines / dataset facts).
- Re-issue `inbox/TASK-NN-fix-K.md` = original task + a "## Corrections required" section quoting the feedback. Remove the stale `.claimed`/sentinel handling by using the next `<id>` convention `NN` reused (same id, new round subfolder in outbox).
- **Retry cap: 3 rounds.** If still failing after round 3, STOP that task, mark ledger `BLOCKED`, and escalate to the user (the only mid-run contact) with the specifics.

## 5. Finalize → the single user report
When all 18 tasks are accepted and a final integration smoke check passes:
1. Tag `app-v1.0.0` (annotated), push.
2. Write `FINAL-REPORT.md` (tracked) aggregating **every task's progress record** (§6): per task — spec, deliverable, verdict, fix rounds, commit SHA, tag, key audit notes, any human-glance items. Plus: overall counts, the milestone tag map, anything still flagged for the user.
3. Push, then send the user ONE message: done + summary + link to `FINAL-REPORT.md` + the restorable tag list.

## 6. Per-task progress trail (submitted in final report)
For every task, append a record to `orchestration/progress/NN.md` (tracked) the moment it is accepted — this is the durable trail aggregated into `FINAL-REPORT.md`. Template: `orchestration/progress/_TEMPLATE.md`. Also keep the live ledger `orchestration/LOOP.md` current (status, commit, tag per task).
