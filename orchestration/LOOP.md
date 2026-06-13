# Loop Ledger (supervisor-maintained)

Single human-readable record of loop progress. The supervisor (Claude) updates this on every state change. The runner does NOT read it — file presence in inbox/outbox is the real signal; this is the audit trail. **Mode: fully autonomous** (see `SUPERVISOR.md`) — user is contacted only at the final report. One atomic commit + `task-NN` tag per accepted task; pushed every time.

| id | spec | deliverable | status | fixes | commit | tag |
|----|------|-------------|--------|-------|--------|-----|
| 01 | 05-datastore | js/datastore.js | **accepted** | 0 | 07f5638 | task-01 |
| 02 | 02-body-map-svg | svg/body-map.svg | **accepted** | 0 | 6f85f0d | task-02 |
| 03 | 03-microanatomy-svgs | svg/microanatomy/*.svg (27) | **accepted** | 0 | 25aeef5 | task-03 |
| 04 | 04-app-shell | index.html | **accepted** | 0 | c0513bb | task-04 |
| 05 | 15-css-styles | css/styles.css | **accepted** | 0 | caecb11 | task-05 |
| 06 | 06-router | js/router.js | **accepted** | 0 | d4b8cde | task-06 |
| 07 | 07-body-map | js/body-map.js | **accepted** | 0 | d56491a | task-07 |
| 08 | 08-organ-view | js/organ-view.js | **accepted** | 0 | f9d6470 | task-08 |
| 09 | 09-cell-view | js/cell-view.js | **accepted** | 0 | 69b69ad | task-09 |
| 10 | 10-search | js/search.js | **accepted** | 0 | 90ef725 | task-10 |
| 11 | 11-compare | js/compare.js | **queued (in inbox)** | 0 | — | — |
| 12 | 12-export | js/export.js | pending | 0 | — | — |
| 13 | 13-species-toggle | js/species-toggle.js | pending | 0 | — | — |
| 14 | 14-links | js/links.js | pending | 0 | — | — |
| 15 | 19-update-badge | js/update-badge.js | pending | 0 | — | — |
| 16 | 18-app-init | js/app.js | pending | 0 | — | — |
| 17 | 16-scraper | updater/scraper.py + config.yaml + requirements.txt | pending | 0 | — | — |
| 18 | 17-merge-update | updater/merge.py + validate.py + README.md | pending | 0 | — | — |

**Status legend:** pending → queued → codex_working → awaiting_review → **accepted** (assembled+committed+tagged+pushed) / rejected (fix re-issued, ≤3 rounds) / BLOCKED (escalate to user).

**Milestone tags (annotated):** m1-data-layer · m2-assets · m3-shell · m4-views · m5-features · m6-pipeline · **app-v1.0.0** (final).

**Current pointer:** `11` (js/compare.js queued in inbox, awaiting Codex). Data gap flagged (task-09): cellType.references (1–157) lack a citation table; only 6 metadata.sources — see progress/09, escalate in final report. Milestones reached: `m2-assets` (after task-03), `m3-shell` (after task-05). Per-task durable records: `orchestration/progress/NN.md`. Final aggregate: `FINAL-REPORT.md`.
