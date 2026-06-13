# Codex Task 06 — Hash Router (js/router.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/router.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/router.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/06-router.md`**. Key non-negotiables:
- A **global class `Router`** (no `import`/`export`; loaded via `<script defer>`, reachable as a global; `js/app.js` will `new Router(datastore)`). Constructor takes a `CellMarkersDatastore` instance.
- Full public API: `start()` (listen to `hashchange`), `navigate(path)` (update hash, no reload), `goBack()`, `goForward()`, `getCurrentRoute()`, `getCurrentPath()`, `onRouteChange(cb)`.
- **`resolveRoute(hash)`** exactly per the spec's logic — returns `{ type, params, path }` with the 7 route types: `body-map` (`#/`), `tissue-system`, `organ`, `microstructure`, `cell-type` (anatomical drill-down by segment count), `search` (`#/search/:query`), `compare` (`#/compare/:ids` → `cellTypeIds` array split on comma). Strip leading `#/`, split on `/`, filter empty.
- On route change: hide all `.view` (remove `.active`, set `hidden`), show target view (`.active`, remove `hidden`), call the view's `render(route)` if present, update `#breadcrumb` (Body → tissue system → organ → … using datastore name lookups), scroll main to top. Fire `onRouteChange` callbacks.
- Keyboard: `Backspace` (not in input) → `history.back()`; `Escape` → up one level; `Alt+Left`/`Alt+Right` → back/forward.
- Edge cases: invalid ids redirect to nearest valid parent (or body map); empty hash → `#/`; debounce rapid hashchanges (100ms).
- The route `path` format must match what datastore.search() emits: `#/<tissueSystem>/<organ>/<microstructure>/<cellType>` (datastore is already accepted — match its fragment shape and `getTissueSystem`/`getOrganById`/`getMicrostructureById`/`getCellTypeById` lookups for breadcrumb).
- Vanilla JS only. No dependencies.

## Verify before done
- `resolveRoute('#/')` → type `body-map`; `resolveRoute('#/digestive/liver/hepatic-lobule/hepatocyte')` → type `cell-type` with all 4 params; `#/search/FOXP3` → search; `#/compare/hepatocyte,kupffer-cell` → compare with `cellTypeIds=['hepatocyte','kupffer-cell']`. Confirm these against the real ids in `data/cell-markers.json`.

## Done when
Every checkbox in spec 06's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
