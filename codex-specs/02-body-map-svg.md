# Codex Spec: 02-body-map-svg

## Purpose
Create the main interactive body map SVG — the primary navigation element of the app. Users click on body regions to drill into tissue systems. The SVG must be anatomically realistic, with clearly defined clickable regions for each tissue system.

## Dependencies
- `01-data-schema.md` (for tissue system IDs and body_map_region values)

## Output Files
- `svg/body-map.svg` — Main interactive body map

## SVG Requirements

### Viewport
- viewBox: `0 0 600 900` (portrait orientation, human figure)
- Default display: centered, responsive (scales to container width)

### Anatomical Regions
The SVG must contain a realistic human body outline with the following clickable regions, each wrapped in a `<g>` element with the corresponding tissue system ID:

| Region | Tissue System | SVG Group ID | Approximate Body Area |
|--------|--------------|--------------|----------------------|
| Head/Brain | Nervous | `nervous` | Cranium |
| Neck | Endocrine | `endocrine` | Thyroid/parathyroid area |
| Chest (left) | Cardiovascular | `cardiovascular` | Heart area |
| Chest (right) | Respiratory | `respiratory` | Lung area |
| Chest (center) | Lymphatic/Immune | `lymphatic` | Thymus/mediastinum |
| Abdomen (upper) | Digestive | `digestive` | Stomach/liver/pancreas |
| Abdomen (lower) | Urinary | `urinary` | Kidney area |
| Flanks | Musculoskeletal | `musculoskeletal` | Torso muscles |
| Pelvis | Reproductive | `reproductive` | Ovary/uterus/testis area |
| Skin (outline) | Integumentary | `integumentary` | Body outline/skin |
| Eyes | Sensory | `sensory` | Eye region |
| Blood (overlay) | Circulating Immune | `circulating-immune` | Bloodstream overlay |

### SVG Structure
```xml
<svg viewBox="0 0 600 900" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect class="bg" width="600" height="900" fill="var(--bg-primary)"/>

  <!-- Body outline (integumentary) -->
  <g id="integumentary" class="body-region" data-tissue-system="integumentary">
    <path d="..." class="region-path" fill="#F5D5C8" stroke="#000" stroke-width="1.5"/>
  </g>

  <!-- Head region (nervous) -->
  <g id="nervous" class="body-region" data-tissue-system="nervous">
    <path d="..." class="region-path" fill="#F5E6A3" stroke="#000" stroke-width="1"/>
  </g>

  <!-- ... additional regions ... -->

  <!-- Labels -->
  <g id="labels" class="labels-layer">
    <text class="region-label" data-for="nervous" x="..." y="...">Brain</text>
    <!-- ... -->
  </g>
</svg>
```

### Styling Requirements
- Each region `<path>` uses the tissue system color as fill
- Hover: brighten fill by 15%, add glow filter (`var(--hover-glow)`)
- Active/selected: stroke-width increases to 3px, accent-blue stroke
- Labels: 12px sans-serif, positioned to avoid overlap
- Regions must have `pointer-events: all` even when overlapping
- Z-order: skin/integumentary at back, organs on top

### Interaction Data Attributes
Every clickable `<g>` must have:
- `id` = tissue system ID
- `data-tissue-system` = tissue system ID
- `class="body-region"`

### Accessibility
- Each region needs `<title>` and `<desc>` elements for screen readers
- `role="button"` on clickable groups
- `aria-label` describing the tissue system
- `tabindex="0"` for keyboard navigation
- Focus outline matches hover glow style

### Responsive Behavior
- SVG scales to fit container (max-width: 600px)
- On mobile (< 768px): labels hide, regions remain clickable
- On desktop: labels visible, tooltip on hover

## Edge Cases
- Overlapping regions (e.g., heart overlaps with lung area): use z-ordering and smaller sub-paths
- Small regions (thyroid, eyes): ensure minimum 44x44px touch target
- Blood/circulating immune: use a semi-transparent overlay or pulsing vein pattern

## Test Criteria
- [ ] SVG validates at validator.w3.org
- [ ] All 12 tissue system IDs have corresponding `<g>` elements
- [ ] Each `<g>` has `data-tissue-system` attribute
- [ ] Hover effect works (CSS or JS-driven)
- [ ] Click on each region fires navigation event
- [ ] Keyboard tab navigates through all regions
- [ ] SVG renders correctly at 320px, 600px, and 1200px widths
- [ ] No overlapping labels at default zoom
