# Codex Spec: 07-body-map

## Purpose
Create the body map view controller — the landing page of the app. Renders the interactive body map SVG, handles click/hover on tissue system regions, and navigates to the tissue system view on selection.

## Dependencies
- `02-body-map-svg.md` (SVG asset)
- `05-datastore.md` (tissue system data)
- `06-router.md` (navigation)

## Output Files
- `js/body-map.js`

## API

```javascript
class BodyMapView {
  constructor(container: HTMLElement, datastore: CellMarkersDatastore, router: Router)

  // Lifecycle
  render(): void  // inject SVG, bind events
  activate(): void  // show view
  deactivate(): void  // hide view, cleanup

  // Interaction
  highlightRegion(tissueSystemId: string): void
  clearHighlight(): void

  // Animation
  pulseRegion(tissueSystemId: string): void  // brief pulse animation for navigation feedback
}
```

## Render Logic

1. Load `svg/body-map.svg` via `fetch()` and inject into `#view-body-map`
2. For each tissue system in datastore:
   - Find the `<g>` element matching `data-tissue-system`
   - Apply tissue system color as fill
   - Bind click handler → `router.navigate('#/' + tissueSystemId)`
   - Bind hover handler → highlight region + show tooltip
3. Position labels based on SVG coordinates
4. Set up keyboard navigation (Tab through regions, Enter to select)

## Click Handler
```javascript
function onRegionClick(event) {
  const group = event.currentTarget;
  const tissueSystemId = group.dataset.tissueSystem;
  router.navigate(`#/${tissueSystemId}`);
}
```

## Hover Handler
```javascript
function onRegionEnter(event) {
  const group = event.currentTarget;
  const ts = datastore.getTissueSystem(group.dataset.tissueSystem);
  // Brighten fill
  group.querySelector('.region-path').style.filter = 'brightness(1.15)';
  // Show tooltip
  showTooltip(event, `${ts.name}\n${ts.organs.length} organs`);
}

function onRegionLeave(event) {
  const group = event.currentTarget;
  group.querySelector('.region-path').style.filter = '';
  hideTooltip();
}
```

## Tooltip
- Position: follows mouse, offset 15px right and down
- Content: Tissue system name + organ count
- Style: dark background, white text, rounded corners, max-width 200px
- Disappear on mouse leave

## Responsive Behavior
- Desktop (> 768px): SVG centered, labels visible, tooltip on hover
- Mobile (<= 768px): SVG full-width, labels hidden, tap to select (no hover)
- Very small (< 480px): SVG scales down, regions still tappable

## Animation
- Initial load: regions fade in sequentially (50ms stagger)
- Region pulse: scale(1.02) + brightness(1.2) for 300ms, then return
- Selected region: persistent glow until navigation completes

## Edge Cases
- SVG load failure: show fallback text list of tissue systems
- Touch devices: no hover, use touchstart for highlight + tap for navigate
- Screen reader: announce tissue system name on focus

## Test Criteria
- [ ] Body map SVG renders on load
- [ ] Clicking each region navigates to correct tissue system
- [ ] Hover shows tooltip with tissue system info
- [ ] Keyboard Tab navigates through regions
- [ ] Enter on focused region navigates
- [ ] SVG scales correctly on mobile
- [ ] Tooltip doesn't overflow viewport
