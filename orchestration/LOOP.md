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

Fully autonomous (same policy). v1.1.0 MODIFIES existing files — Codex writes modified copies into outbox; supervisor audits + swaps into live tree. One atomic commit + `task-NN` tag per accepted task. **RESTRUCTURED (user decision):** textbook SVG REDRAWS go to a separate **medical-asset track (codex 외, free CC vector assets)** — deferred; the codex loop continues with the non-SVG / functional work. Milestones: `m7-data-normalize` (done), `m8-citations-ui`, `app-v1.1.0` (final).

## Codex track (active loop)
| task | spec | deliverable | status | fixes | commit | tag |
|------|------|-------------|--------|-------|--------|-----|
| 19 | 20-marker-normalization | data normalize + normalize_markers.py + links.js + styles.css + cell-view.js | **accepted** | 0 | 31030b2 | task-19 |
| 20 | 24-microstructure-id-reconcile | data (rm svg_region_id) + organ-view.js (+ validate.py/01-schema patches) | **accepted** | 0 | 3f1035c | task-20 |
| — | 24 §2 svg id rename | microanatomy region ids → canonical (15 files, 42/42) | **done** | 0 | d27714c | — |
| 21 | 25-body-map-svg-redraw | svg/body-map.svg (redraw + chest split) + data | **accepted** (codex; visual may be upgraded by asset track) | 0 | 2f2e363 | task-21 |
| 22 | 21-citations-table | metadata.citations + datastore methods + cell-view + scraper (+ task-19 old-name search alias) | **accepted** | 0 | 60bd401 | task-22 |
| 23 | 23-loading-spinner | css/styles.css loading spinner | **accepted** | 0 | d9651ac | task-23 |
| 24 | 22-favicon | svg/icons/favicon.svg (simple decorative icon — codex OK) | **accepted** (supervisor direct) | 0 | 659484a | task-24 |
| 25 | version-bump (supervisor) | metadata.version 1.1.0 + changelog.json 1.1.0 entry | pending | 0 | — | — |

## Medical-asset track (DEFERRED — codex 외, free CC medical vector assets, manual region mapping)
| spec | deliverable | status |
|------|-------------|--------|
| 26 | 7 microanatomy SVGs (integ/nervous/cardio/resp) — textbook redraw | DEFERRED (asset sourcing) |
| 27 | 5 microanatomy SVGs (digestive) — textbook redraw | DEFERRED |
| 28 | 13 microanatomy SVGs (lymph/endo/musc/repro/urin/sensory) — textbook redraw | DEFERRED |
| 29 | 27 organ icon SVGs — textbook redraw | DEFERRED |
| 25(visual) | body-map textbook upgrade (optional; codex version is functional) | OPTIONAL |

**v1.1.0 pointer:** `24` (favicon queued, codex). loading spinner CSS done.
