# Codex Spec: 08-organ-view

## Purpose
Create the organ detail view — shows the microanatomy SVG for the selected organ with clickable microstructure regions, plus a list of cell types within each microstructure.

## Dependencies
- `03-microanatomy-svgs.md` (SVG assets)
- `05-datastore.md` (organ/microstructure/cell data)
- `06-router.md` (navigation)

## Output Files
- `js/organ-view.js`

## API

```javascript
class OrganView {
  constructor(container: HTMLElement, datastore: CellMarkersDatastore, router: Router)

  render(route: Route): void
  activate(): void
  deactivate(): void
  highlightMicrostructure(microstructureId: string): void
}
```

## Layout

```
+------------------------------------------+
| [Organ Name]              [Species: H/M] |
| [Organ description]                      |
+------------------------------------------+
|                    |                      |
|   Microanatomy     |   Cell Types List   |
|      SVG           |                      |
|                    |   > Microstructure 1 |
|   [clickable       |     - Cell Type A   |
|    regions]        |     - Cell Type B   |
|                    |   > Microstructure 2 |
|                    |     - Cell Type C   |
+------------------------------------------+
```

### Desktop (> 768px): Two-column layout
- Left: Microanatomy SVG (60% width)
- Right: Cell types list (40% width)

### Mobile (<= 768px): Stacked
- Top: Microanatomy SVG (full width, max 400px height)
- Bottom: Cell types list

## Render Logic

1. Get organ data from datastore using `route.params.organId`
2. Load organ's microanatomy SVG via `fetch()`
3. Render SVG in left panel
4. For each microstructure in the organ:
   - Create a collapsible section with microstructure name
   - List all cell types within, showing:
     - Cell type name
     - Key markers (first 3 positive markers, species-aware)
     - Click → navigate to cell detail
5. Bind SVG click handlers on microstructure regions
6. Bind list item click handlers

## Microanatomy SVG Interaction
```javascript
function onMicrostructureClick(event) {
  const group = event.currentTarget;
  const msId = group.dataset.microstructure;
  // Highlight in SVG
  highlightMicrostructure(msId);
  // Scroll to corresponding section in cell types list
  document.getElementById(`ms-section-${msId}`)?.scrollIntoView({ behavior: 'smooth' });
  // Expand that section if collapsed
  expandSection(msId);
}
```

## Cell Type List Item
```html
<div class="cell-type-item" data-cell-type-id="hepatocyte" tabindex="0">
  <div class="cell-type-name">Hepatocyte</div>
  <div class="cell-type-markers">
    <span class="marker-tag positive">HP</span>
    <span class="marker-tag positive">ASGR1</span>
    <span class="marker-tag positive">ALB</span>
    <span class="marker-more">+2 more</span>
  </div>
  <div class="cell-type-source">Source: Labome</div>
</div>
```

## Marker Tags
- Positive markers: green/lime background (`var(--marker-positive)`)
- Negative markers: orange background (`var(--marker-negative)`)
- Truncate to 3 visible markers, show "+N more" for remainder

## Collapsible Sections
- Each microstructure is a collapsible `<details>/<summary>` or JS-toggled section
- Click on SVG region expands corresponding section
- Click on section header highlights SVG region

## Edge Cases
- Organ with single microstructure: no collapsible, show flat list
- Organ not found in datastore: show error, link back to body map
- SVG load failure: show cell types list only (no diagram)
- Cell type with no markers for current species: show "No markers available for [species]"

## Test Criteria
- [ ] Organ view renders with correct organ name and description
- [ ] Microanatomy SVG loads and displays
- [ ] Clicking SVG region scrolls to and expands corresponding section
- [ ] Cell type list shows correct markers for selected species
- [ ] Clicking cell type navigates to cell detail view
- [ ] Collapsible sections expand/collapse correctly
- [ ] Responsive layout works on mobile
