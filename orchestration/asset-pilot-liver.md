# Asset Track Pilot — liver.svg

- **Verdict:** PASS — pilot validates the approach.
- **Method chosen:** asset-INFORMED lightweight redraw (not direct asset embedding).

## What the pilot proved
- NIH BioArt 565 "Liver Lobule" (CC-BY 4.0) downloaded & inspected: professional quality BUT 1.69 MB / 4902 paths / **cell-level** structure (Endothelial_Cell, Blood_Cell…) — incompatible with our **microstructure-level** clickable-region model and far too heavy for the app.
- Conclusion: direct asset embedding is impractical (weight + dimension mismatch). The viable path is a **lightweight hand-redraw informed by the asset's anatomy**.
- Result `svg/microanatomy/liver.svg`: **4.5 KB** (99.7% smaller), anatomically correct classic hepatic lobule (hexagon, central vein, 6 portal triads = portal vein/hepatic artery/bile duct, radiating hepatocyte cords, sinusoid channels), canonical region ids (`hepatic-lobule`, `hepatic-sinusoids`), organ-view integration verified (regions ↔ ms-sections).

## Attribution (CC-BY 4.0)
Anatomy informed by: Human Reference Atlas (2024). Liver Lobule. NIAID NIH BIOART Source. bioart.niaid.nih.gov/bioart/565 (CC-BY 4.0).

## Scope remaining
- 26 more microanatomy organs + 27 organ icons could follow the same hand-redraw method.
