# Loop Ledger (supervisor-maintained)

Single human-readable record of loop progress. The supervisor (Claude) updates this on every state change. The runner does NOT read it — file presence in inbox/outbox is the real signal; this is the audit trail. **Mode: fully autonomous** (see `SUPERVISOR.md`) — user is contacted only at the final report. One atomic commit + `task-NN` tag per accepted task; pushed every time.

| id | spec | deliverable | status | fixes | commit | tag |
|----|------|-------------|--------|-------|--------|-----|
| 01 | 05-datastore | js/datastore.js | **accepted** | 0 | 07f5638 | task-01 |
| 02 | 02-body-map-svg | svg/body-map.svg | **accepted** | 0 | 6f85f0d | task-02 |
| 03 | 03-microanatomy-svgs | svg/microanatomy/*.svg (27) | **accepted** | 0 | cf706ae | task-03 |
| 04 | 04-app-shell | index.html | **queued (in inbox)** | 0 | — | — |
| 05 | 15-css-styles | css/styles.css | pending | 0 | — | — |
| 06 | 06-router | js/router.js | pending | 0 | — | — |
| 07 | 07-body-map | js/body-map.js | pending | 0 | — | — |
| 08 | 08-organ-view | js/organ-view.js | pending | 0 | — | — |
| 09 | 09-cell-view | js/cell-view.js | pending | 0 | — | — |
| 10 | 10-search | js/search.js | pending | 0 | — | — |
| 11 | 11-compare | js/compare.js | pending | 0 | — | — |
| 12 | 12-export | js/export.js | pending | 0 | — | — |
| 13 | 13-species-toggle | js/species-toggle.js | pending | 0 | — | — |
| 14 | 14-links | js/links.js | pending | 0 | — | — |
| 15 | 19-update-badge | js/update-badge.js | pending | 0 | — | — |
| 16 | 18-app-init | js/app.js | pending | 0 | — | — |
| 17 | 16-scraper | updater/scraper.py + config.yaml + requirements.txt | pending | 0 | — | — |
| 18 | 17-merge-update | updater/merge.py + validate.py + README.md | pending | 0 | — | — |

**Status legend:** pending → queued → codex_working → awaiting_review → **accepted** (assembled+committed+tagged+pushed) / rejected (fix re-issued, ≤3 rounds) / BLOCKED (escalate to user).

**Milestone tags (annotated):** m1-data-layer · m2-assets · m3-shell · m4-views · m5-features · m6-pipeline · **app-v1.0.0** (final).

**Current pointer:** `04` (app-shell index.html queued in inbox, awaiting Codex). Milestones reached: `m2-assets` (after task-03). Per-task durable records: `orchestration/progress/NN.md`. Final aggregate: `FINAL-REPORT.md`.
