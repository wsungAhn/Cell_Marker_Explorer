# Codex Task 10 — Search (js/search.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/search.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/search.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/10-search.md`**. Key non-negotiables:
- A **global class `SearchController`** (no `import`/`export`; IIFE → window-reachable). Constructor `(datastore, router)`.
- API: `init()` (bind `#search-input` + `#search-button`), `performSearch(query)` (delegate to `datastore.search(query, {species})`), `renderResults(results, container)`, `showSuggestions(query)`, `hideSuggestions()`, `navigateToResult(result)`.
- **Router contract:** the search VIEW (`#view-search`) is rendered on route `search`. Expose a global instance the router can find as **`searchView`** with a `render(route)` method that reads `route.params.query` and renders the full results view into `#view-search`. (One class can serve both the header controller and the view renderer, or expose `window.searchView` with `render`.) app.js (16) calls `init()` and assigns the global.
- Header behavior: typing debounced **200ms** → `showSuggestions` dropdown `#search-results` with **top 8** matches (type badge + name + path snippet); Enter on input → `router.navigate('#/search/' + encodeURIComponent(query))`; "Show all results" option → same; suggestion click → navigate to that result's `path`.
- Dropdown keyboard nav: ArrowDown/Up move focus, Enter selects, Escape closes.
- Full results view: header "Search: <q>" + count; filter tabs **All / Markers / Cell Types**; result cards `.search-result-card[data-path]` with `.result-type-badge`, `.result-name`, `.result-path`, and `.marker-tag` chips for cell types.
- Species-aware: pass current `datastore.getSpecies()`; optional "mouse <marker>" species-prefix auto-detect per spec.
- Marker tag click in results → navigate to that cell type (use result.path).
- Edge cases: empty query → no suggestions/results; no results → "No results found" message; escape special chars for display (use textContent, never innerHTML).
- **All DOM via createElement/textContent — NO innerHTML.** Vanilla JS only.

## Verify before done
- `node --check` passes; global class, no real import/export; `performSearch('CD68')` (with a loaded datastore) returns results including macrophage cell types; `performSearch('FOXP3')` includes treg-cell; Enter builds `#/search/<query>`. Cross-check against `data/cell-markers.json` via datastore.

## Done when
Every checkbox in spec 10's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
