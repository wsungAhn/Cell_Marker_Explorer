# Codex Task 12 — Export (js/export.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/export.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/export.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/12-export.md`**. Key non-negotiables:
- A **global class `ExportController`** (no `import`/`export`; IIFE → window-reachable). Constructor `(datastore)`.
- API: `exportCellType(id, species, format)`, `exportCompare(ids, species, format, includeNegative)`, `exportOrgan(organId, species, format)`, `exportTissueSystem(tsId, species, format)`, `exportAll(species, format)`, `generateCSV(data, headers)`, `generateTSV(data, headers)`, `download(content, filename, mimeType)`.
- **Expose for downstream callers:** cell-view (09) and compare (11) call `window.exporter`/`window["export"]` with `.exportCellType(...)` / `.exportCompare(...)`. Make the instance discoverable under those names (app.js will assign; ensure the class supports both method names exactly).
- CSV/TSV per spec's exact layouts (single cell: key/value header block + Marker,Type rows; compare: Marker + one column per cell type with +/−/·; organ/bulk: the column sets shown).
- **RFC 4180**: fields with comma/quote/newline double-quoted; embedded `"` escaped as `""`; marker lists within a field semicolon-separated; **UTF-8 BOM** prefix for Excel.
- `download()` via Blob + object URL + temporary `<a>` (per spec); filename conventions exactly as listed (`{id}_{species}_markers.csv`, `compare_{ids}_{species}.csv`, etc.).
- Markers via `datastore.getMarkersForCellType(id, species)`; statuses for compare = positive(+)/negative(−)/not-listed(·).
- Edge cases: no markers for species → empty marker fields; special chars preserved; Blob-unsupported fallback (new window).
- Vanilla JS only. No dependencies. (DOM only inside `download`.)

## Verify before done
- `node --check` passes; global class, no real import/export. With a loaded datastore (stub `download` to capture output): `exportCellType('hepatocyte','human','csv')` produces CSV starting with BOM, includes the cell name + a `Marker,Type` section with its positive markers; `generateCSV` escapes a field containing a comma/quote correctly; TSV uses tabs. Cross-check hepatocyte markers against `data/cell-markers.json`.

## Done when
Every checkbox in spec 12's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
