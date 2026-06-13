# Codex Spec: 06-router

## Purpose
Create a hash-based SPA router that maps URL fragments to views and manages navigation state. The router enables deep linking, browser back/forward, and URL sharing.

## Dependencies
- `04-app-shell.md` (view containers)
- `05-datastore.md` (path resolution)

## Output Files
- `js/router.js`

## URL Scheme

### Routes
| Pattern | View | Example |
|---------|------|---------|
| `#/` | Body map | `#/` |
| `#/:tissueSystemId` | Organ list | `#/digestive` |
| `#/:tissueSystemId/:organId` | Organ detail (microanatomy) | `#/digestive/liver` |
| `#/:tissueSystemId/:organId/:microstructureId` | Cell type list | `#/digestive/liver/hepatic-lobule` |
| `#/:tissueSystemId/:organId/:microstructureId/:cellTypeId` | Cell detail | `#/digestive/liver/hepatic-lobule/hepatocyte` |
| `#/search/:query` | Search results | `#/search/FOXP3` |
| `#/compare/:cellTypeIds` | Compare view | `#/compare/hepatocyte,kupffer-cell` |

## API

```javascript
class Router {
  constructor(datastore: CellMarkersDatastore)

  // Initialize router
  start(): void  // listen to hashchange

  // Navigation
  navigate(path: string): void  // update hash without full reload
  goBack(): void
  goForward(): void

  // Current state
  getCurrentRoute(): Route
  getCurrentPath(): string[]

  // Subscriptions
  onRouteChange(callback: (route: Route) => void): void
}

interface Route {
  type: 'body-map' | 'tissue-system' | 'organ' | 'microstructure' | 'cell-type' | 'search' | 'compare';
  params: {
    tissueSystemId?: string;
    organId?: string;
    microstructureId?: string;
    cellTypeId?: string;
    query?: string;
    cellTypeIds?: string[];
  };
  path: string;  // full hash path
}
```

## Route Resolution Logic

```javascript
function resolveRoute(hash: string): Route {
  const path = hash.replace(/^#\/?/, '');  // strip leading #/
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) {
    return { type: 'body-map', params: {}, path: '#/' };
  }

  if (segments[0] === 'search') {
    return { type: 'search', params: { query: segments.slice(1).join('/') }, path };
  }

  if (segments[0] === 'compare') {
    return { type: 'compare', params: { cellTypeIds: segments[1].split(',') }, path };
  }

  // Anatomical drill-down
  const [tissueSystemId, organId, microstructureId, cellTypeId] = segments;

  if (cellTypeId) return { type: 'cell-type', params: { tissueSystemId, organId, microstructureId, cellTypeId }, path };
  if (microstructureId) return { type: 'microstructure', params: { tissueSystemId, organId, microstructureId }, path };
  if (organId) return { type: 'organ', params: { tissueSystemId, organId }, path };
  return { type: 'tissue-system', params: { tissueSystemId }, path };
}
```

## View Switching
On route change:
1. Determine target view from route type
2. Hide all `.view` elements (remove `.active`, set `hidden`)
3. Show target view (add `.active`, remove `hidden`)
4. Call view's `render(route)` method
5. Update breadcrumb
6. Scroll to top of main content

## Breadcrumb Update
```javascript
function updateBreadcrumb(route: Route) {
  const items = [];
  items.push({ label: 'Body', path: '#/' });

  if (route.params.tissueSystemId) {
    const ts = datastore.getTissueSystem(route.params.tissueSystemId);
    items.push({ label: ts.name, path: `#/${ts.id}` });
  }
  if (route.params.organId) {
    const organ = datastore.getOrganById(route.params.organId);
    items.push({ label: organ.name, path: `#/${route.params.tissueSystemId}/${organ.id}` });
  }
  // ... etc for microstructure and cell type
}
```

## Keyboard Navigation
- `Backspace` (not in input): `history.back()`
- `Escape`: navigate up one level (remove last segment)
- `Alt+Left`: `history.back()`
- `Alt+Right`: `history.forward()`

## Edge Cases
- Invalid tissue system ID in URL: redirect to body map with toast notification
- Invalid organ/microstructure/cell ID: redirect to nearest valid parent
- Empty hash: treat as `#/`
- Multiple hash changes in rapid succession: debounce (100ms)

## Test Criteria
- [ ] `#/` shows body map view
- [ ] `#/digestive/liver/hepatic-lobule/hepatocyte` shows cell detail
- [ ] Browser back button navigates correctly
- [ ] Breadcrumb updates on every route change
- [ ] Invalid IDs redirect to parent with notification
- [ ] `#/search/FOXP3` shows search view
- [ ] `#/compare/hepatocyte,kupffer-cell` shows compare view
- [ ] URL can be shared and opens to correct view
