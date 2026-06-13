# Codex Spec: 10-search

## Purpose
Create the search functionality — a global search bar in the header and a search results view. Users can search for cell types, markers, organs, or tissue systems by name or marker symbol.

## Dependencies
- `04-app-shell.md` (search input in header)
- `05-datastore.md` (search API)
- `06-router.md` (navigation to results)

## Output Files
- `js/search.js`

## API

```javascript
class SearchController {
  constructor(datastore: CellMarkersDatastore, router: Router)

  // Initialize
  init(): void  // bind to #search-input, #search-button

  // Search
  performSearch(query: string): SearchResult[]
  renderResults(results: SearchResult[], container: HTMLElement): void

  // Autocomplete
  showSuggestions(query: string): void
  hideSuggestions(): void

  // Navigation
  navigateToResult(result: SearchResult): void
}
```

## Search Input Behavior

### Typing (debounced 200ms)
1. User types in `#search-input`
2. After 200ms of inactivity, call `showSuggestions(query)`
3. Show dropdown `#search-results` with top 8 matches
4. Each suggestion shows: type icon + name + path snippet

### Suggestion Dropdown
```html
<div id="search-results" class="search-results" role="listbox">
  <div class="search-suggestion" role="option" data-path="#/digestive/liver/hepatic-lobule/hepatocyte">
    <span class="suggestion-type cell-type">Cell</span>
    <span class="suggestion-name">Hepatocyte</span>
    <span class="suggestion-path">Digestive > Liver > Hepatic Lobule</span>
  </div>
  <!-- ... more suggestions ... -->
  <div class="search-suggestion search-all" role="option" data-query="FOXP3">
    Show all results for "FOXP3" →
  </div>
</div>
```

### Enter / Click
- If suggestion selected: navigate to that result's path
- If Enter on input: navigate to `#/search/{query}` for full results view
- If "Show all results" clicked: navigate to `#/search/{query}`

### Keyboard Navigation in Dropdown
- Arrow Down: next suggestion
- Arrow Up: previous suggestion
- Enter: select focused suggestion
- Escape: close dropdown

## Full Search Results View

### Layout
```
+------------------------------------------+
| Search: "CD68"                           |
| 23 results                               |
+------------------------------------------+
| [Filter: All | Markers | Cell Types]     |
+------------------------------------------+
|                                          |
|  MARKER: CD68                            |
|  Found in 8 cell types                   |
|                                          |
|  CELL TYPE: M1 Macrophage                |
|  Digestive > Liver > Hepatic Lobule      |
|  Markers: CD68, CD86, CD80, MHC-II...   |
|                                          |
|  CELL TYPE: Kupffer Cell                 |
|  Lymphatic > Liver > Hepatic Lobule      |
|  Markers: CD68, CD163L, CLEC4G...       |
|                                          |
|  ...                                     |
+------------------------------------------+
```

### Result Card
```html
<div class="search-result-card" data-path="#/...">
  <div class="result-type-badge marker">Marker</div>
  <div class="result-name">CD68</div>
  <div class="result-path">Found in 8 cell types</div>
</div>

<div class="search-result-card" data-path="#/circulating-immune/blood/blood-leukocytes/m1-macrophage">
  <div class="result-type-badge cell-type">Cell Type</div>
  <div class="result-name">M1 Macrophage</div>
  <div class="result-path">Circulating Immune > Blood > Leukocytes</div>
  <div class="result-markers">
    <span class="marker-tag positive">CD68</span>
    <span class="marker-tag positive">CD86</span>
    <span class="marker-tag positive">CD80</span>
  </div>
</div>
```

### Filter Tabs
- **All**: Show all result types
- **Markers**: Show only marker matches (grouped by marker, showing cell types)
- **Cell Types**: Show only cell type matches

## Search Algorithm (delegated to datastore)
- Tokenize query on spaces, commas, slashes
- Match against: marker names, cell type names, aliases, organ names, tissue system names
- Scoring: exact match (10) > prefix match (7) > substring match (4) > alias match (3)
- Species-aware: if species toggle is set, prioritize that species' markers

## Edge Cases
- Empty query: no suggestions, no results
- Very short query (1 char): only show suggestions for markers starting with that char
- No results: show "No results found" with suggestion to try different terms
- Special characters in query: escape for safe display
- Query with species prefix (e.g. "mouse Cd68"): auto-detect and switch species

## Test Criteria
- [ ] Typing in search shows suggestions after 200ms
- [ ] Suggestion dropdown shows top 8 results
- [ ] Clicking suggestion navigates to correct view
- [ ] Enter navigates to full search results
- [ ] Full search view shows all matching results
- [ ] Filter tabs work (All / Markers / Cell Types)
- [ ] Keyboard navigation works in dropdown
- [ ] No results message displays correctly
- [ ] Search is species-aware
