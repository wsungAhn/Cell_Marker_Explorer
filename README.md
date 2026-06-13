# Cell Markers Explorer

An interactive, no-build web app for exploring human & mouse cell markers through an anatomical drill-down — **body map → tissue system → organ → microstructure → cell type** — with search, marker comparison, CSV export, species toggle, and a Python data-refresh pipeline.

> **🔗 Live: https://wsungahn.github.io/Cell_Marker_Explorer/**

> Data: Labome (Cell Markers, T/B Cell, Macrophage, Stem Cell) + CellMarker 2.0 + PanglaoDB. Last compiled 2024-06-27.

## Status

**v1.0.0 — complete.** All 18 build tasks accepted and the app is verified end-to-end in the browser. See `FINAL-REPORT.md` for the per-task trail, milestone tags, and deferred items.

**Dataset:** 12 tissue systems · 27 organs · 42 microstructures · 121 cell types · 1381 marker entries.

## Run

No build step — vanilla HTML/CSS/JS. Use the live URL above, or serve locally:

```bash
cd cell-markers-explorer
python3 -m http.server 8000
# open http://localhost:8000
```

## Repository layout

- `MASTER-PLAN.md` — full architecture & execution plan (read §0 reconciliation notes first).
- `AGENTS.md` — operating rules for the implementer agent (ownership, prohibitions, workflow).
- `codex-specs/` — per-file build specifications (the implementer's contracts).
- `data/` — `cell-markers.json` (live dataset, source of truth) + `changelog.json`.
- `css/`, `js/`, `svg/` — web app (produced from specs).
- `updater/` — Python scrape → merge → validate pipeline (runs every ~6 months).

## Data updater

Offline-correct; first live scrape→merge run is a Phase-1.5 step (needs network + deps).

```bash
cd updater && pip install -r requirements.txt
python validate.py --file ../data/cell-markers.json   # passes today
python scraper.py --dry-run && python merge.py --dry-run
```
