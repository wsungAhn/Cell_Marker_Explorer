# Loop Ledger (supervisor-maintained)

Single human-readable record of loop progress. The supervisor (Claude) updates this on every state change. The runner does NOT read it — file presence in inbox/outbox is the real signal; this is the audit trail.

| id | spec | deliverable | status | notes |
|----|------|-------------|--------|-------|
| 01 | 05-datastore | js/datastore.js | **queued (in inbox)** | first task; auditability-first |
| 02 | 02-body-map-svg | svg/body-map.svg | pending | prompt ready: codex-tasks/TASK-A-body-map-svg.md |
| 03 | 03-microanatomy-svgs | svg/microanatomy/*.svg (27) | pending | |
| 04 | 04-app-shell | index.html | pending | |
| 05 | 15-css-styles | css/styles.css | pending | |
| 06 | 06-router | js/router.js | pending | |
| 07 | 07-body-map | js/body-map.js | pending | |
| 08 | 08-organ-view | js/organ-view.js | pending | |
| 09 | 09-cell-view | js/cell-view.js | pending | |
| 10 | 10-search | js/search.js | pending | |
| 11 | 11-compare | js/compare.js | pending | |
| 12 | 12-export | js/export.js | pending | |
| 13 | 13-species-toggle | js/species-toggle.js | pending | |
| 14 | 14-links | js/links.js | pending | |
| 15 | 19-update-badge | js/update-badge.js | pending | |
| 16 | 18-app-init | js/app.js | pending | wires everything; built last |
| 17 | 16-scraper | updater/scraper.py + config.yaml + requirements.txt | pending | |
| 18 | 17-merge-update | updater/merge.py + validate.py + README.md | pending | |

**Status legend:** pending → queued (in inbox) → codex_working → awaiting_review → accepted (assembled+committed) / rejected (fix re-issued).

**Current pointer:** `01` (awaiting Codex on the main system).
