# Codex Task 01 — Datastore module

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Create **`js/datastore.js`** — and nothing else. Do not create or edit any other file. Do not touch `data/`, `index.html`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, or git.

## Contract
Implement exactly per **`codex-specs/05-datastore.md`**. Key non-negotiables:
- A **global class `CellMarkersDatastore`** (no `import`/`export`; this loads via `<script defer>` and must be reachable as a global per reconciliation R3). `js/app.js` will `new CellMarkersDatastore()` later.
- Implement the full public API in the spec: `load()`, metadata getters, tissue-system/organ/microstructure/cell-type queries, marker queries (`findCellTypesByMarker`, `findCellTypesByMarkers`), `search()`, navigation helpers (`getBreadcrumb`, `getPathForCellType`), species state (`setSpecies`/`getSpecies`/`onSpeciesChange`), and `onDataLoaded`.
- Build the indices described in the spec (`cellTypeById`, `organById`, `microstructureById`, `markerIndex` split by species, `searchIndex`).
- Default data URL `data/cell-markers.json`. Load via `fetch()`. The data shape is authoritative — match it (top-level `metadata` + `tissue_systems[]`; cell types under `tissue_systems[].organs[].microstructures[].cell_types[]`).
- Search behavior, scoring, and species-awareness per the spec's Search Algorithm section.
- Vanilla JS only. No dependencies. No network calls other than the `fetch()` of the local JSON.

## Verify against the real data before declaring done
These must hold against `data/cell-markers.json`:
- `getTissueSystems()` → **12** items.
- `getCellTypeById('hepatocyte')` → the hepatocyte object.
- `findCellTypesByMarker('CD68', 'human')` → includes macrophage/Kupffer-type cells.
- `search('FOXP3')` → returns the Treg cell type.
- `search('liver')` → returns the liver organ + hepatocyte + Kupffer cell.
- Species change fires the registered callback.
- `getPathForCellType('hepatocyte')` → `{ tissueSystemId:'digestive', organId:'liver', microstructureId:'lobule', cellTypeId:'hepatocyte' }` (confirm exact ids from the data).

## Done when
Every checkbox in spec 05's **Test Criteria** is satisfiable and the checks above pass against the real dataset. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
