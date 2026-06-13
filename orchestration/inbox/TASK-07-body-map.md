# Codex Task 07 — Body Map View (js/body-map.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/body-map.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/body-map.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/07-body-map.md`**. Key non-negotiables:
- A **global class `BodyMapView`** (no `import`/`export`; window-reachable; loaded via `<script defer>`). Constructor `(container, datastore, router)`.
- Full API: `render(route)` (fetch `svg/body-map.svg`, inject into `#view-body-map`, bind events; accept an optional `route` arg since the router calls `render(route)`), `activate()`, `deactivate()`, `highlightRegion(id)`, `clearHighlight()`, `pulseRegion(id)`.
- For each tissue system: find the `<g data-tissue-system="<id>">` in the injected SVG, bind **click → `router.navigate('#/' + tissueSystemId)`**, hover → brighten `.region-path` + tooltip (name + organ count via `datastore.getTissueSystem(id)`), keyboard (Tab through regions, Enter selects).
- Tooltip follows mouse (offset 15px), dark bg/white text, max-width 200px, hides on leave and must not overflow viewport.
- Responsive: mobile (≤768px) hides labels, tap to select (no hover); touch devices use touchstart for highlight.
- **SVG load failure → fallback**: render a plain clickable text list of tissue systems (each navigating to `#/<id>`). Build DOM via `createElement`/`textContent`, NOT `innerHTML`, for any data-derived content (injecting the fetched SVG markup itself is fine).
- Animations: sequential region fade-in (50ms stagger), `pulseRegion` scale(1.02)+brightness for ~300ms.
- Expose a global instance hook compatible with the router: the router resolves the body-map renderer as a global named **`bodyMapView`** (or `bodyMap`), or as a `render` method on the `#view-body-map` element. Make `BodyMapView` instances discoverable that way (app.js task 16 will instantiate and assign `window.bodyMapView`). Just ensure the class + `render(route)` contract holds.
- Vanilla JS only. No dependencies.

## Verify before done
- `node --check` passes. Class is global, no import/export. Click handler calls `router.navigate('#/' + id)` with `data-tissue-system` value. Fallback path exists for fetch failure. The 12 tissue-system ids it binds to come from the datastore / SVG `data-tissue-system` (match `data/cell-markers.json`).

## Done when
Every checkbox in spec 07's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
