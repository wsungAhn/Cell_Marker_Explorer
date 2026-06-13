# Codex Task 09 — Cell View (js/cell-view.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/cell-view.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/cell-view.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/09-cell-view.md`**. Key non-negotiables:
- A **global class `CellView`** (no `import`/`export`; IIFE → window-reachable; sets global instance `cellView` for the router). Constructor `(container, datastore, router)`. Container is `#view-cell`.
- `render(route)`, `activate()`, `deactivate()`.
- **The router routes TWO route types here** (`#view-cell`) — handle BOTH in `render(route)`:
  - **`microstructure`** (`#/<ts>/<organ>/<ms>`): list the cell types within that microstructure (name + key positive markers, click → cell detail `#/<ts>/<organ>/<ms>/<cellTypeId>`). Use `datastore.getMicrostructure(...)` / its `cell_types`.
  - **`cell-type`** (`#/<ts>/<organ>/<ms>/<cellTypeId>`): full single-cell detail per spec 09.
- Cell detail content: name, aliases, description; **positive** markers as clickable `.marker-tag.positive` chips and **negative** as `.marker-tag.negative` (distinct/muted); **both species** side-by-side (desktop) / tabbed (mobile), active tab = `datastore.getSpecies()`; marker tag click → `router.navigate('#/search/' + encodeURIComponent(marker))`; references (map `cellType.references` → `metadata.sources` entries with title + DOI); provenance (`source`, `added_in_version`, `last_modified_version`, muted).
- **Add to Compare** button `.compare-add-btn[data-cell-type-id]` and **Export** button — wire to global modules if present (`window.compareTray`/`compare` for add; `window.exporter`/`export` for CSV) but degrade gracefully if absent (button exists, no-op or disabled). External links: prefer a global links module (`window.links`/`LinksModule`, spec 14) to build UniProt/CellMarker/PanglaoDB links; if absent, generate per spec 09's URL templates (UniProt organism 9606 human / 10090 mouse).
- **CRITICAL data fact (see progress/08):** URL/route path microstructure segment uses **`microstructure.id`** (NOT `svg_region_id`). Build all navigation paths with `microstructure.id`. 24 microstructures differ between the two.
- All data-derived DOM via `createElement`/`textContent` — NO `innerHTML`.
- Edge cases: cell not found → error + link back to organ; no markers for species → "No markers available for <species>"; species-aware re-render via `datastore.onSpeciesChange`.
- Vanilla JS only. No dependencies.

## Verify before done
- `node --check` passes; global class, no import/export; both `microstructure` and `cell-type` route types handled; marker tag click → `#/search/<marker>`; references map to metadata.sources; navigation uses microstructure.id. Cross-check a real cell (e.g. hepatocyte under digestive/liver/hepatic-lobule) against `data/cell-markers.json`.

## Done when
Every checkbox in spec 09's **Test Criteria** is satisfiable AND the `microstructure` cell-list mode works. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
