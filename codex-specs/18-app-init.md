# Codex Spec: 18-app-init

## Purpose
Create `js/app.js` — the application entry point that boots the app: loads data, instantiates every module in the correct order, wires them together via a small event bus, manages global app state, renders the data-driven version/update badges, and handles global loading/error states and keyboard shortcuts. This is the file that turns a pile of independent modules into a running app.

> **AUDIT NOTE (v3.1):** Added in reconciliation R4 — the original plan referenced `app.js` everywhere but had no spec. Architecture is **global classes + `<script defer>`** (R3): no `import`/`export`. `app.js` is the **last** script in `index.html`, so every other class is already defined as a global when it runs.

## Dependencies
- `04-app-shell.md` (DOM containers, header controls, footer badges)
- `05-datastore.md` (`CellMarkersDatastore`)
- `06-router.md` (`Router`)
- `07`–`14` view/feature controllers (`BodyMapView`, `OrganView`, `CellView`, `SearchController`, `CompareController`, `ExportController`, `SpeciesToggle`, `LinksGenerator`)
- `19-update-badge.md` (`UpdateBadge`)

## Output Files
- `js/app.js`

## Responsibilities

### 1. Event bus
Provide a tiny global pub/sub used by all modules (no framework). Implement as a global singleton, e.g.:
```javascript
const AppBus = new EventTarget();
function emit(type, detail) { AppBus.dispatchEvent(new CustomEvent(type, { detail })); }
function on(type, handler) { AppBus.addEventListener(type, handler); }
```
Canonical event names (document these — other modules rely on them):
- `data:loaded`
- `route:change` (detail: `Route`)
- `species:change` (detail: `'human' | 'mouse'`)
- `compare:change` (detail: `string[]` of cell type ids)
- `app:error` (detail: `{ message, error }`)

### 2. Global state
```javascript
const AppState = {
  currentSpecies: 'human',   // mirrors datastore; persisted to localStorage by spec 13
  currentRoute: null,        // set on route:change
  compareIds: [],            // mirrors compare tray
};
```
`datastore` is the single source of truth for *data*; `AppState` only holds UI/session state.

### 3. Boot sequence (strict order)
```
1. Show a loading state in #main-content.
2. const datastore = new CellMarkersDatastore();
3. await datastore.load();            // 'data/cell-markers.json'
   - on failure: render the error state (§5), emit 'app:error', STOP boot.
4. Instantiate (data is ready):
     const router        = new Router(datastore);
     const links         = new LinksGenerator();
     const speciesToggle = new SpeciesToggle(datastore);
     const compare       = new CompareController(datastore, router);
     const exporter      = new ExportController(datastore);
     const search        = new SearchController(datastore, router);
     const bodyMap       = new BodyMapView(document.getElementById('view-body-map'), datastore, router);
     const organView     = new OrganView(document.getElementById('view-organ'), datastore, router);
     const cellView      = new CellView(document.getElementById('view-cell'), datastore, router);
     const updateBadge   = new UpdateBadge(datastore);   // spec 19
5. Init the feature controllers that bind to existing DOM:
     speciesToggle.init(); search.init(); updateBadge.init();
6. Register the router→view dispatch (§4) and start the router:
     router.onRouteChange(dispatchView);
     router.start();   // resolves current hash (default '#/')
7. Wire global keyboard shortcuts (§6).
8. Remove loading state.
```
Expose the instances on a single namespace for debugging only: `window.App = { datastore, router, ... }`. Do **not** rely on globals for inter-module calls beyond what the specs already define.

### 4. Router → view dispatch
On each `route:change`, hide all `.view`, show the target view, and call its `render(route)`:
| route.type | container | call |
|---|---|---|
| `body-map` | `#view-body-map` | `bodyMap.render()` (first time) / `bodyMap.activate()` |
| `tissue-system` / `organ` / `microstructure` | `#view-organ` | `organView.render(route)` |
| `cell-type` | `#view-cell` | `cellView.render(route)` |
| `search` | `#view-search` | `search.renderResults(...)` |
| `compare` | `#view-compare` | `compare.renderCompareView(route.params.cellTypeIds)` |
Update the breadcrumb (router already builds items) and scroll `#main-content` to top.

### 5. Loading & error states
- **Loading:** lightweight spinner / "Loading cell marker data…" inside `#main-content`.
- **Data load failure:** replace `#main-content` with an error panel: message, a "Retry" button (re-runs boot from step 1), and a fallback link to Labome. Honor the `04` noscript requirement separately.

### 6. Global keyboard shortcuts (per spec 04)
`/` focus search · `Escape` clear search / go up one level · `Backspace` (not in input) back · `C` open compare · `H` home (`#/`). Guard so shortcuts never fire while typing in an input/textarea/contenteditable.

### 7. Badges
Set the header `#version-badge` from `datastore.getVersion()` and delegate the footer update badge + changelog modal to `UpdateBadge` (spec 19). No hard-coded version/date strings in `app.js`.

## Edge Cases
- A module class is missing/undefined: fail loudly to console + `app:error`, don't half-boot.
- `hashchange` before boot completes: router.start() runs only after instantiation (step 6).
- Re-entrancy on Retry: ensure a second boot tears down/reuses cleanly (no duplicate event listeners).

## Test Criteria
- [ ] Opening `index.html` via a static server boots to the body map with no console errors.
- [ ] Deep link (e.g. `#/digestive/liver/lobule/hepatocyte`) renders the right view on load.
- [ ] Species toggle, search, compare, export all function end-to-end.
- [ ] Simulated data-load failure shows the error panel with a working Retry.
- [ ] Keyboard shortcuts work and never fire while typing in the search box.
- [ ] `#version-badge` shows the version from the dataset (not hard-coded).
