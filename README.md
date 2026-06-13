# Cell Markers Explorer

An interactive, no-build web app for exploring human & mouse cell markers through an anatomical drill-down — **body map → tissue system → organ → microstructure → cell type** — with search, marker comparison, CSV export, species toggle, and a Python data-refresh pipeline.

> Data: Labome (Cell Markers, T/B Cell, Macrophage, Stem Cell) + CellMarker 2.0 + PanglaoDB. Last compiled 2024-06-27.

## Status

Scaffolding stage. Data is compiled (`data/cell-markers.json`); specs are in `codex-specs/`; implementation is produced one module at a time by the implementer agent per `AGENTS.md`.

**Dataset:** 12 tissue systems · 27 organs · 42 microstructures · 121 cell types · 1381 marker entries.

## Run (once built)

No build step — vanilla HTML/CSS/JS.

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

## Data updater (later)

```bash
cd updater && pip install -r requirements.txt
python scraper.py && python merge.py && python validate.py
```
