# Codex Spec: 11-compare

## Purpose
Create the marker comparison feature — allows users to select multiple cell types and compare their markers side-by-side in a table. This is one of the most useful features for researchers deciding on marker panels.

## Dependencies
- `05-datastore.md` (marker data)
- `06-router.md` (compare route)
- `09-cell-view.md` (add-to-compare button)
- `12-export.md` (export comparison)

## Output Files
- `js/compare.js`

## API

```javascript
class CompareController {
  constructor(datastore: CellMarkersDatastore, router: Router)

  // Tray management
  addCellType(cellTypeId: string): void
  removeCellType(cellTypeId: string): void
  clearAll(): void
  getSelectedIds(): string[]
  isInCompare(cellTypeId: string): boolean

  // Tray UI
  renderTray(): void  // update #compare-tray contents
  showTray(): void
  hideTray(): void

  // Compare view
  renderCompareView(cellTypeIds: string[]): void

  // Events
  onSelectionChange(callback: (ids: string[]) => void): void
}
```

## Compare Tray (Floating Panel)

### Position
- Fixed, bottom-right corner
- Width: 280px
- Shows when at least 1 cell type is added
- Collapsible (minimize to just count badge)

### Tray HTML
```html
<aside id="compare-tray" class="compare-tray">
  <div class="tray-header">
    <h3>Compare (<span id="compare-count">2</span>)</h3>
    <button class="tray-minimize" aria-label="Minimize">_</button>
  </div>
  <div class="tray-items" id="compare-items">
    <div class="tray-item" data-id="hepatocyte">
      <span class="tray-item-name">Hepatocyte</span>
      <button class="tray-item-remove" aria-label="Remove hepatocyte">×</button>
    </div>
    <div class="tray-item" data-id="kupffer-cell">
      <span class="tray-item-name">Kupffer Cell</span>
      <button class="tray-item-remove" aria-label="Remove kupffer-cell">×</button>
    </div>
  </div>
  <div class="tray-actions">
    <button id="compare-open-btn">Compare Markers</button>
    <button id="compare-clear-btn">Clear All</button>
  </div>
</aside>
```

### Tray Behavior
- Max 6 cell types in compare (show warning if trying to add more)
- "Compare Markers" button: navigates to `#/compare/id1,id2,id3`
- "Clear All": removes all, hides tray
- Remove (×): removes individual cell type
- Tray persists across navigation (until cleared or page reload)

## Compare View

### Layout
```
+----------------------------------------------------------+
| Marker Comparison                                         |
| [Export CSV] [Export TSV]                                 |
+----------------------------------------------------------+
| Marker        | Hepatocyte | Kupffer Cell | M1 Macrophage|
+----------------------------------------------------------+
| CD68          |     -      |      +       |      +       |
| CD86          |     -      |      -       |      +       |
| ASGR1         |     +      |      -       |      -       |
| HP            |     +      |      -       |      -       |
| CD163         |     -      |      +       |      -       |
| MHC-II        |     -      |      +       |      +       |
+----------------------------------------------------------+
| Positive only | [ ] Show negative markers               |
| Species: [Human ▾]                                       |
+----------------------------------------------------------+
```

### Table Generation Algorithm
1. Collect all markers from selected cell types for current species
2. Build union of all marker names
3. For each marker, determine status per cell type: positive (+), negative (-), not listed (·)
4. Sort markers: shared positive first, then partial, then unique

### Table Cell Styling
- Positive (+): green/lime background, bold `+`
- Negative (-): orange background, bold `-`
- Not listed (·): gray, dimmed `·`
- Shared across all: highlight row with subtle background

### Sorting Options
- **By shared markers**: markers present in all cell types first
- **By uniqueness**: markers unique to one cell type first
- **Alphabetical**: A-Z by marker name

### Filter Options
- **Show negative markers**: toggle (default: off, only show positive + not-listed)
- **Species selector**: dropdown (Human / Mouse)
- **Min shared count**: slider (show markers shared by at least N cell types)

## Compare View HTML
```html
<div id="view-compare" class="view" hidden>
  <div class="compare-header">
    <h2>Marker Comparison</h2>
    <div class="compare-controls">
      <label><input type="checkbox" id="compare-show-negative"> Show negative markers</label>
      <select id="compare-species">
        <option value="human">Human</option>
        <option value="mouse">Mouse</option>
      </select>
      <select id="compare-sort">
        <option value="shared">By shared markers</option>
        <option value="unique">By uniqueness</option>
        <option value="alpha">Alphabetical</option>
      </select>
      <button id="compare-export-csv">Export CSV</button>
    </div>
  </div>
  <div class="compare-table-container">
    <table id="compare-table" class="compare-table">
      <!-- Generated dynamically -->
    </table>
  </div>
</div>
```

## Edge Cases
- 0 cell types: redirect to body map
- 1 cell type: show that cell type's markers (no comparison needed, suggest adding more)
- Cell types from different organs: works fine, just compare markers
- No shared markers: show "No shared positive markers" message above table
- All markers shared: highlight that these cell types are very similar

## Test Criteria
- [ ] Adding cell type to compare updates tray
- [ ] Tray shows correct count and names
- [ ] "Compare Markers" navigates to compare view
- [ ] Compare table shows correct +/·/- for each marker
- [ ] Shared markers highlighted
- [ ] Sort options change table order
- [ ] "Show negative markers" toggle works
- [ ] Species selector switches marker data
- [ ] Export CSV works from compare view
- [ ] Max 6 cell types enforced
- [ ] Clear all works
