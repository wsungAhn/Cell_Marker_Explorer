# Codex Task 16 — App Entry Point (js/app.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/app.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/app.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/18-app-init.md`**. Key non-negotiables:
- **No `import`/`export`** — `app.js` is the LAST `<script defer>` in index.html; every other class is already a global (`CellMarkersDatastore`, `Router`, `BodyMapView`, `OrganView`, `CellView`, `SearchController`, `CompareController`, `ExportController`, `SpeciesToggle`, `LinksGenerator`, `UpdateBadge`).
- **Event bus**: global `AppBus = new EventTarget()` + `emit`/`on`; canonical events `data:loaded`, `route:change`, `species:change`, `compare:change`, `app:error`.
- **AppState** holds UI/session state only (currentSpecies/currentRoute/compareIds); datastore is the data source of truth.
- **Boot sequence (strict order):** loading state in `#main-content` → `new CellMarkersDatastore()` → `await datastore.load()` (on failure: error panel §5 + emit `app:error` + STOP) → instantiate router, links, speciesToggle, compare, exporter, search, bodyMap(`#view-body-map`), organView(`#view-organ`), cellView(`#view-cell`), updateBadge → `speciesToggle.init(); search.init(); updateBadge.init();` → `router.onRouteChange(dispatchView); router.start();` → wire keyboard shortcuts → remove loading state.
- **Router→view dispatch** per spec table: body-map→`#view-body-map` bodyMap.render()/activate(); tissue-system/organ/microstructure→`#view-organ` organView.render(route); cell-type→`#view-cell` cellView.render(route); search→`#view-search` search.renderResults/render; compare→`#view-compare` compare.renderCompareView(route.params.cellTypeIds). (Note: router.js already finds global view instances + switches `.view`; ensure app.js assigns the instances to the globals the router expects — `window.bodyMapView`/`organView`/`cellView`/`searchView`/`compareView`/`compareTray`/`exporter`/`links`/`speciesToggle`/`updateBadge` — and dispatch is consistent, not double-rendering destructively.)
- **Loading & error states**: spinner/"Loading…"; data-load failure → error panel with **Retry** (re-runs boot cleanly, no duplicate listeners) + Labome fallback link.
- **Global keyboard shortcuts** (guard against input/textarea/contenteditable): `/` focus search, `Escape` clear/up-level, `Backspace` back, `C` compare, `H` home(`#/`).
- **Badges**: `#version-badge` from `datastore.getVersion()`; footer/changelog delegated to UpdateBadge. No hard-coded version/date.
- Expose `window.App = { datastore, router, ... }` for debugging only.
- Edge cases: missing module class → fail loudly to console + `app:error`, don't half-boot; Retry re-entrancy safe.
- Vanilla JS only.

## Verify before done
- `node --check` passes; no import/export; defines AppBus + emit/on + the 5 event names; boot instantiates all 11 modules in order; dispatchView maps all route types; assigns the globals the router resolves; keyboard handler guards text inputs; version badge from datastore (not hard-coded). (Full boot is browser-only; supervisor will run an integration smoke after assembly.)

## Done when
Every checkbox in spec 18's **Test Criteria** is satisfiable (browser-verifiable ones at integration smoke). Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
