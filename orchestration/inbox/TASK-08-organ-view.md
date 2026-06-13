# Codex Task 08 — Organ View (js/organ-view.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/organ-view.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/organ-view.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/08-organ-view.md`**. Key non-negotiables:
- A **global class `OrganView`** (no `import`/`export`; window-reachable via IIFE like the other modules; sets a global instance `organView` for the router). Constructor `(container, datastore, router)`. Container is `#view-organ`.
- `render(route)`, `activate()`, `deactivate()`, `highlightMicrostructure(id)`.
- **The router routes TWO route types to this view** (`#view-organ`) — handle BOTH in `render(route)`:
  - **`tissue-system`** (`#/<tissueSystemId>`): show the tissue system name + a clickable list of its **organs**; each organ click → `router.navigate('#/<tissueSystemId>/<organId>')`. (Spec 08's diagram focuses on organ detail; this organ-list mode is required by the router contract — keep it simple: a titled list/grid of organ cards.)
  - **`organ`** (`#/<tissueSystemId>/<organId>`): the full organ detail per spec 08 — two-column (desktop) / stacked (mobile): left = organ's microanatomy SVG fetched from `svg/microanatomy/<organ.microanatomy_svg basename>`; right = collapsible per-microstructure sections listing cell types.
- Organ detail specifics: organ name + description header; for each microstructure a collapsible section (`id="ms-section-<msId>"`); each cell type as `.cell-type-item[data-cell-type-id]` with `.cell-type-name`, up to **3** positive `.marker-tag.positive` (species-aware via `datastore.getMarkersForCellType(id, species)`) + `.marker-more` "+N more", `.cell-type-source`; click/Enter → `router.navigate` to cell detail (`#/<ts>/<organ>/<ms>/<cellTypeId>`).
- SVG region click (`g.microstructure-region`, `data-microstructure`) → highlight + scrollIntoView the matching `ms-section-<id>` + expand it.
- **Species-aware**: subscribe to `datastore.onSpeciesChange` to re-render markers; current species from `datastore.getSpecies()`.
- All data-derived DOM via `createElement`/`textContent` (NO `innerHTML` for data; injecting the fetched microanatomy SVG markup is fine).
- Edge cases: single-microstructure organ → flat list (no collapsible); organ not found → error + link to body map; SVG load failure → list only; cell type with no markers for species → "No markers available for <species>".
- Vanilla JS only. No dependencies.

## Verify before done
- `node --check` passes; global class, no import/export; both `tissue-system` and `organ` route types handled; marker tags use `getMarkersForCellType` (species-aware) capped at 3 + "+N more"; organ→SVG basename derived from dataset `organs[].microanatomy_svg`. Cross-check organ/microstructure/cell ids against `data/cell-markers.json`.

## Done when
Every checkbox in spec 08's **Test Criteria** is satisfiable AND the `tissue-system` organ-list mode works. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
