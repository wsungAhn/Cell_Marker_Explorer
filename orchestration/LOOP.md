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
| 10 | 10-search | js/search.js | **accepted** | 0 | df79fdd | task-10 |
| 11 | 11-compare | js/compare.js | **accepted** | 0 | 7f8ef40 | task-11 |
| 12 | 12-export | js/export.js | **accepted** | 0 | 1558243 | task-12 |
| 13 | 13-species-toggle | js/species-toggle.js | **accepted** | 0 | a6f9e0a | task-13 |
| 14 | 14-links | js/links.js | **accepted** | 0 | e88ebf3 | task-14 |
| 15 | 19-update-badge | js/update-badge.js | **accepted** | 0 | d5cfb75 | task-15 |
| 16 | 18-app-init | js/app.js | **accepted** | 0 | f9984f4 | task-16 |
| 17 | 16-scraper | updater/scraper.py + config.yaml + requirements.txt | **accepted** | 0 | 1dd1260 | task-17 |
| 18 | 17-merge-update | updater/merge.py + validate.py + README.md | **accepted** | 0 | 07994ba | task-18 |

**Status legend:** pending → queued → codex_working → awaiting_review → **accepted** (assembled+committed+tagged+pushed) / rejected (fix re-issued, ≤3 rounds) / BLOCKED (escalate to user).

**Milestone tags (annotated):** m1-data-layer · m2-assets · m3-shell · m4-views · m5-features · m6-pipeline · **app-v1.0.0** (final).

**Current pointer:** ✅ COMPLETE — all 18 tasks accepted, app-v1.0.0 tagged, FINAL-REPORT.md published. Deferred (see FINAL-REPORT §5): task-09 references data gap; task-17 live scrape.

---

# Loop Ledger — v1.1.0 upgrade

Fully autonomous (same policy). v1.1.0 MODIFIES existing files — Codex writes modified copies into outbox; supervisor audits + swaps into live tree. One atomic commit + `task-NN` tag per accepted task. SVG visual quality is human-glance (structure/id audited automatically). Milestones: `m7-data-normalize` (after id-reconcile), `m8-svg-redraw` (after icons), `m9-citations-ui`, `app-v1.1.0` (final).

| task | spec | deliverable | status | fixes | commit | tag |
|------|------|-------------|--------|-------|--------|-----|
| 19 | 20-marker-normalization | data normalize + normalize_markers.py + links.js + styles.css + cell-view.js | **accepted** | 0 | 31030b2 | task-19 |
| 20 | 24-microstructure-id-reconcile | data (rm svg_region_id) + organ-view.js + SVG element renames | **queued (in inbox)** | 0 | — | — |
| 21 | 25-body-map-svg-redraw | svg/body-map.svg (redraw + chest split) + data body_map_region | pending | 0 | — | — |
| 22 | 26-microanatomy-batch-1 | 7 microanatomy SVGs (integ/nervous/cardio/resp) | pending | 0 | — | — |
| 23 | 27-microanatomy-batch-2 | 5 microanatomy SVGs (digestive) | pending | 0 | — | — |
| 24 | 28-microanatomy-batch-3 | 13 microanatomy SVGs (lymph/endo/musc/repro/urin/sensory) | pending | 0 | — | — |
| 25 | 29-organ-icon-svgs | 27 organ icon SVGs | pending | 0 | — | — |
| 26 | 21-citations-table | metadata.citations + datastore methods + cell-view + scraper | pending | 0 | — | — |
| 27 | 22-favicon | svg/icons/favicon.svg | pending | 0 | — | — |
| 28 | 23-loading-spinner | css/styles.css loading spinner | pending | 0 | — | — |
| 29 | version-bump (supervisor) | metadata.version 1.1.0 + changelog.json 1.1.0 entry | pending | 0 | — | — |

**v1.1.0 pointer:** `20` (microstructure id-reconcile queued). Scope-gap noted (task-19): datastore old-name search alias -> fold into task 26.
