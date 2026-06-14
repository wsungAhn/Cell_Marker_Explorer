# Asset Track Research — free medical SVG for v1.x textbook redraws

Goal: replace codex-drawn microanatomy (25) + organ icons (27) with textbook-quality, **clickable** vector SVG. The app needs each microstructure as a `<g class="microstructure-region" id="<canonical microstructure id>">` — so any asset must be groupable + id-able.

## Candidate sources (license-vetted)

| Source | License | Format | Notes |
|--------|---------|--------|-------|
| **NIH BioArt (NIAID)** | **Public Domain** | SVG + PNG | Best license. Cells/organelles, microbes, some anatomical. Direct SVG download. |
| **BioIcons** (github duerrsimon/bioicons) | CC-BY / CC0 | SVG | Biology clip art incl. cells & organs. Direct SVG, Inkscape-friendly. |
| **SciDraw** | CC-BY | SVG | Biology vector clip art, similar to BioIcons. |
| **Servier Medical Art (SMART)** | CC-BY 4.0 | **PPTX / PNG only** (no direct SVG) | 3000+ pro medical illustrations, broad anatomy. SVG requires extracting from PPTX — extra step. Lower priority for that reason. |

## The real constraint (important)
- These are **general illustration libraries**, not a 1:1 match for our 27-organ × specific-microstructure model (e.g. `hepatic-lobule`, `hepatic-sinusoids`). 
- Whatever the source, we must **manually**: pick/compose the right illustration per organ, group each microstructure into a `<g>`, assign the **canonical microstructure id**, add `class="microstructure-region"` + `data-microstructure` + a11y, and keep `viewBox` consistent (organ-view fetches `svg/microanatomy/<organ>.svg`).
- So the asset track is **labor-intensive** (sourcing + region mapping), but yields higher visual fidelity than codex. Organ *icons* (27, 64×64) are simpler and more directly findable.

## Recommended approach
1. **Pilot with 1 organ (liver)** using NIH BioArt / BioIcons SVG → build `liver.svg` with `hepatic-lobule` + `hepatic-sinusoids` regions mapped to canonical ids. Verify quality + effort + organ-view click flow.
2. If the pilot is worth it, expand organ-by-organ (or batch by tissue system, matching specs 26/27/28).
3. Organ icons (spec 29) can run in parallel — simpler, BioIcons/NIH likely cover most.
4. Keep current codex/functional SVGs live until each replacement is verified (no regression).

## Status
- Current microanatomy SVGs are **functional** (canonical ids, clickable) — only visual fidelity is pending. No rush; pilot-first to gauge ROI.

## Sources
- [Servier Medical Art](https://smart.servier.com/) ([what-you-can-do / CC-BY 4.0](https://smart.servier.com/what-you-can-do-and-how-to-credit/))
- [BioIcons](https://github.com/duerrsimon/bioicons)
- [Free/open-source scientific illustration roundup (NIH BioArt, SciDraw, etc.)](https://blog.stephenturner.us/p/free-open-source-images-tools-scientific-illustrations)
