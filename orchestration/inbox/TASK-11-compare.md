# Codex Task 11 — Compare (js/compare.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/compare.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/compare.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/11-compare.md`**. Key non-negotiables:
- A **global class `CompareController`** (no `import`/`export`; IIFE → window-reachable). Constructor `(datastore, router)`.
- API: `addCellType(id)`, `removeCellType(id)`, `clearAll()`, `getSelectedIds()`, `isInCompare(id)`, `renderTray()`, `showTray()`, `hideTray()`, `renderCompareView(ids)`, `onSelectionChange(cb)`.
- **Router contract:** compare VIEW (`#view-compare`) is rendered on route `compare`. Expose the instance so the router finds a global **`compareView`** with `render(route)` that reads `route.params.cellTypeIds` and calls `renderCompareView`. **Also expose the tray controller as `window.compareTray` (and/or `compare`)** because cell-view (task 09) calls `window.compareTray`/`compare` `.addCellType(id)` / `.isInCompare(id)`. (Simplest: one CompareController instance assigned to `window.compareController`, `window.compareTray`, `window.compareView` by app.js; ensure the class implements both `addCellType`/`isInCompare` AND `render(route)`.)
- Tray (`#compare-tray`, `#compare-items`, `#compare-count`, `#compare-open-btn`, `#compare-clear-btn`): show when ≥1 added; `.tray-item[data-id]` with name + remove ×; **max 6** (warn if more); "Compare Markers" → `router.navigate('#/compare/' + ids.join(','))`; "Clear All" → clear + hide; persists across navigation (in-memory until cleared/reload).
- Compare view: union of all markers across selected cell types for current species; per cell type status **positive (+) / negative (−) / not-listed (·)**; sort modes shared/unique/alpha; "show negative" toggle (default off); species selector; shared-across-all rows highlighted (`.row-shared`); cells `.cell-positive`/`.cell-negative`/`.cell-not-listed` per spec 15 CSS. Export CSV button wires to global exporter (task 12) if present, else graceful.
- Edge cases: 0 ids → redirect body map; 1 id → show its markers + suggest adding more; no shared positives → message.
- Markers via `datastore.getMarkersForCellType(id, species)`. All DOM via createElement/textContent — **no innerHTML**. Vanilla JS only.

## Verify before done
- `node --check` passes; global class, no real import/export. With a loaded datastore: `addCellType` updates `getSelectedIds`; `isInCompare` reflects it; max 6 enforced; the union-table logic yields +/−/· statuses (spot-check hepatocyte vs kupffer-cell on a shared marker like CD68/marker present in one). `render(route)` reads `route.params.cellTypeIds`.

## Done when
Every checkbox in spec 11's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
