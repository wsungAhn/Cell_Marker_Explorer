# Codex Spec: 24-microstructure-id-reconcile

## Purpose
Reconcile the 24 microstructures where `id` differs from `svg_region_id`. The current split creates a maintenance burden: the data references microstructures by `id` (e.g., `cerebral-cortex`) while the SVG elements use `svg_region_id` (e.g., `cortex`). This spec unifies them by renaming SVG elements to match the canonical `id` and removing the redundant `svg_region_id` field.

## Dependencies
- `01-data-schema.md` (defines microstructure schema)
- `02-body-map-svg.md` (SVG element naming)
- `03-microanatomy-svgs.md` (SVG region IDs)
- `05-datastore.md` (index building uses `svg_region_id`)
- `25-body-map-svg-redraw.md` (SVGs will be redrawn — apply ID changes there too)

## Problem

24 microstructures have `id ≠ svg_region_id`:

| Tissue System | Organ | `id` (canonical) | `svg_region_id` (old) |
|---|---|---|---|
| nervous | brain | `cerebral-cortex` | `cortex` |
| nervous | brain | `brain-microglia` | `microglia` |
| nervous | spinal-cord | `spinal-cord-white-matter` | `white-matter` |
| nervous | spinal-cord | `spinal-cord-gray-matter` | `gray-matter` |
| nervous | peripheral-nerve | `peripheral-nerve-sheath` | `nerve-sheath` |
| cardiovascular | blood-vessels | `vessel-intima` | `intima` |
| cardiovascular | blood-vessels | `vessel-media` | `media` |
| cardiovascular | blood-vessels | `vessel-adventitia` | `adventitia` |
| digestive | small-intestine | `intestinal-villi` | `villi` |
| digestive | small-intestine | `intestinal-crypt` | `crypt` |
| digestive | liver | `hepatic-lobule` | `lobule` |
| digestive | liver | `hepatic-sinusoids` | `sinusoids` |
| digestive | pancreas | `pancreatic-acini` | `acini` |
| digestive | pancreas | `islets-of-langerhans` | `islets` |
| lymphatic | thymus | `thymic-cortex` | `cortex` |
| lymphatic | thymus | `thymic-medulla` | `medulla` |
| endocrine | thyroid | `thyroid-follicle` | `follicle` |
| endocrine | adrenal | `adrenal-cortex` | `cortex` |
| endocrine | adrenal | `adrenal-medulla` | `medulla` |
| musculoskeletal | bone | `bone-marrow-cavity` | `marrow-cavity` |
| reproductive | ovary | `ovarian-follicle` | `follicle` |
| urinary | kidney | `nephron-tubules` | `tubules` |
| circulating-immune | blood | `blood-leukocytes` | `leukocytes` |
| circulating-immune | cell-lines | `cell-lines-misc` | `cell-lines` |

**Why this matters:** The short `svg_region_id` values (e.g., `cortex`, `medulla`) are ambiguous across organs — `cortex` could mean cerebral cortex, thymic cortex, or adrenal cortex. The canonical `id` values are organ-qualified and unambiguous.

## Changes

### 1. cell-markers.json — Remove `svg_region_id` field

For every microstructure in the dataset, remove the `svg_region_id` field. The `id` field becomes the sole identifier used for both data lookups and SVG element targeting.

**Before:**
```json
{
  "id": "cerebral-cortex",
  "svg_region_id": "cortex",
  "name": "Cerebral Cortex",
  "cell_types": [...]
}
```

**After:**
```json
{
  "id": "cerebral-cortex",
  "name": "Cerebral Cortex",
  "cell_types": [...]
}
```

### 2. SVG files — Rename region elements

In every microanatomy SVG, rename the `id` attribute on clickable region groups from the old `svg_region_id` value to the canonical `id` value.

**Before (e.g., brain.svg):**
```xml
<g id="cortex" class="microstructure-region" data-organ="brain">
  ...
</g>
```

**After:**
```xml
<g id="cerebral-cortex" class="microstructure-region" data-organ="brain">
  ...
</g>
```

Full rename map for SVG element `id` attributes:

| SVG File | Old `id` | New `id` |
|---|---|---|
| brain.svg | `cortex` | `cerebral-cortex` |
| brain.svg | `microglia` | `brain-microglia` |
| spinal-cord.svg | `white-matter` | `spinal-cord-white-matter` |
| spinal-cord.svg | `gray-matter` | `spinal-cord-gray-matter` |
| peripheral-nerve.svg | `nerve-sheath` | `peripheral-nerve-sheath` |
| blood-vessels.svg | `intima` | `vessel-intima` |
| blood-vessels.svg | `media` | `vessel-media` |
| blood-vessels.svg | `adventitia` | `vessel-adventitia` |
| small-intestine.svg | `villi` | `intestinal-villi` |
| small-intestine.svg | `crypt` | `intestinal-crypt` |
| liver.svg | `lobule` | `hepatic-lobule` |
| liver.svg | `sinusoids` | `hepatic-sinusoids` |
| pancreas.svg | `acini` | `pancreatic-acini` |
| pancreas.svg | `islets` | `islets-of-langerhans` |
| thymus.svg | `cortex` | `thymic-cortex` |
| thymus.svg | `medulla` | `thymic-medulla` |
| thyroid.svg | `follicle` | `thyroid-follicle` |
| adrenal.svg | `cortex` | `adrenal-cortex` |
| adrenal.svg | `medulla` | `adrenal-medulla` |
| bone.svg | `marrow-cavity` | `bone-marrow-cavity` |
| ovary.svg | `follicle` | `ovarian-follicle` |
| kidney.svg | `tubules` | `nephron-tubules` |
| blood.svg | `leukocytes` | `blood-leukocytes` |
| cell-lines.svg | `cell-lines` | `cell-lines-misc` |

### 3. organ-view.js — Remove `svg_region_id` usage (the ONLY JS file that references it)

> **CODEBASE NOTE (verified against the deployed v1.0.0 source):** `datastore.js` already indexes microstructures by canonical `id` (`microstructureById`, built from `ms.id`); it does **not** use `svg_region_id` and has **no** `microstructureBySvgId` map. The only JavaScript that reads `svg_region_id` is `js/organ-view.js`, in 4 places. Fix those, not the datastore.

Current `organ-view.js` references (line numbers from v1.0.0):
- `section.dataset.svgRegionId = microstructure.svg_region_id || '';` (~L272)
- `details.dataset.svgRegionId = microstructure.svg_region_id || '';` (~L295)
- `microstructures[i].id === idOrRegionId || microstructures[i].svg_region_id === idOrRegionId` (~L470) — the dual-match fallback
- `const regionId = microstructure ? microstructure.svg_region_id : idOrRegionId;` (~L479)

**Changes:** The redrawn SVGs (specs 25–28) emit `<g id="<canonical microstructure id>">` and `data-microstructure="<canonical id>"`, so the SVG region click value now equals `microstructure.id`. Therefore:
- Replace the `data-svg-region-id` dataset writes (L272, L295) with the canonical id, or drop them — downstream code keys off `microstructure.id`. If a `data-microstructure` attribute is needed by the click handler, set it to `microstructure.id`.
- Simplify the lookup (L470) to a single match: `microstructures[i].id === idOrRegionId` (remove the `|| ... svg_region_id ===` fallback).
- Replace L479 with `const regionId = microstructure ? microstructure.id : idOrRegionId;`.

After this, no JS references `svg_region_id` at all.

### 4. datastore.js — No change required

`datastore.js` is already canonical-`id`-based (`microstructureById`, `getMicrostructureById(id)`, `getMicrostructure(ts, organ, ms)`). It contains no `svg_region_id` reference and no `microstructureBySvgId` map. **Do not add or modify a `microstructureBySvgId` map** — it does not exist. Leave datastore as-is (optionally add a doc comment that microstructure SVG element IDs now equal `microstructure.id`).

### 5. app.js / links.js / search.js — Verify clean (expected: no changes)

In the deployed v1.0.0 source these files do **not** reference `svg_region_id` (verified). After fixing organ-view.js, run `grep -rn svg_region_id js/` and confirm **zero** results. Deep-link/route paths already use the canonical microstructure id:
```
#/{tissue_system_id}/{organ_id}/{microstructure_id}
```
where `microstructure_id` is the canonical `id` (e.g., `cerebral-cortex`, not `cortex`).

## Execution Order

This spec should be executed **before** specs 25–29 (SVG redraws) so that the new SVGs use the canonical IDs from the start. If specs 25–29 are executed first, apply the renames to the new SVGs instead.

## Edge Cases

- **Ambiguous short IDs:** `cortex` appears in brain.svg, thymus.svg, and adrenal.svg. After this change, each has a unique ID (`cerebral-cortex`, `thymic-cortex`, `adrenal-cortex`), eliminating the ambiguity.
- **CSS selectors:** If any CSS rules target SVG elements by old IDs (e.g., `#cortex`), update them to the new IDs. Search `styles.css` for `#cortex`, `#medulla`, `#follicle`, `#intima`, `#media`, `#adventitia`, `#villi`, `#crypt`, `#lobule`, `#sinusoids`, `#acini`, `#islets`, `#leukocytes`, `#tubules`, `#marrow-cavity`, `#nerve-sheath`, `#microglia`, `#white-matter`, `#gray-matter`, `#cell-lines`.
- **Keyboard navigation:** If `keyboard.js` references `svg_region_id`, update to `id`.
- **Search index:** If `search.js` indexes `svg_region_id`, remove that field from the index.

## Test Criteria
- [ ] No microstructure in `cell-markers.json` has a `svg_region_id` field
- [ ] Every SVG region group `id` matches the corresponding microstructure `id` in the data
- [ ] Clicking a microanatomy region navigates to the correct cell type list
- [ ] Deep links using canonical IDs (e.g., `#/nervous/brain/cerebral-cortex`) work correctly
- [ ] No JavaScript errors in console related to `svg_region_id`
- [ ] Search for `svg_region_id` across all JS/CSS/HTML files returns zero results
