# Codex Spec: 22-favicon

## Purpose
Create a cell-themed favicon SVG to replace the missing `svg/icons/favicon.svg` that `index.html` currently references (causing a 404).

## Dependencies
- `04-app-shell.md` (references `svg/icons/favicon.svg`)

## Output Files
- `svg/icons/favicon.svg`

## Design Specification

### Concept
A simplified cell icon — circular cell membrane with a smaller circular nucleus, using the Phylo color palette. Must be recognizable at 16×16 and 32×32 pixels.

### SVG Code
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- Cell membrane -->
  <circle cx="16" cy="16" r="14" fill="#FAF9F3" stroke="#75A025" stroke-width="2"/>
  <!-- Nucleus -->
  <circle cx="16" cy="16" r="6" fill="#75A025"/>
  <!-- Nucleolus (small dot) -->
  <circle cx="18" cy="14" r="2" fill="#FAF9F3" opacity="0.6"/>
</svg>
```

### Design Rationale
- **Cream fill (#FAF9F3)** for cell body: matches `--bg-primary`, reads well on browser tab bars (both light and dark)
- **Green stroke/fill (#75A025)** for membrane and nucleus: matches `--accent-green`, the Phylo brand color
- **Nucleolus dot**: adds biological detail without clutter at small sizes
- **viewBox 0 0 32 32**: standard favicon size, scales cleanly to 16×16

### Alternative: Multi-size favicon
If browser support requires it, also create a 16×16 variant:
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">
  <circle cx="8" cy="8" r="7" fill="#FAF9F3" stroke="#75A025" stroke-width="1.5"/>
  <circle cx="8" cy="8" r="3" fill="#75A025"/>
</svg>
```
(Simpler — no nucleolus at this size, too small to see)

## index.html Verification
Confirm that `index.html` has:
```html
<link rel="icon" href="svg/icons/favicon.svg" type="image/svg+xml">
```
If the path is different, adjust the SVG file location to match.

## Edge Cases
- Dark browser theme: cream fill may be hard to see on dark tab bars. Consider adding a thin dark outline: `stroke="#333" stroke-width="0.5"` on the outer circle in addition to the green stroke.
- Safari may not support SVG favicons — add a `<link rel="apple-touch-icon">` with a 180×180 PNG alternative if needed (out of scope for this spec, but note for future).

## Test Criteria
- [ ] `svg/icons/favicon.svg` exists and is valid SVG
- [ ] Favicon renders in browser tab on Chrome, Firefox, Edge
- [ ] Recognizable as a cell at 16×16 and 32×32
- [ ] No 404 in browser console for favicon
- [ ] Colors match Phylo palette
