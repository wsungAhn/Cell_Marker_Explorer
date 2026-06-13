# Codex Spec: 03-microanatomy-svgs

## Purpose
Create microanatomy SVG diagrams for each organ. These diagrams show the internal structure of an organ at the tissue/histology level, with clickable regions corresponding to microstructures. Users click microstructure regions to see cell types.

> **AUDIT NOTE (v3.1):** This spec was reconciled against the live dataset `data/cell-markers.json`, which is the **single source of truth**. The dataset references **27** microanatomy SVGs (not 15 as in MASTER-PLAN §1, nor 25 as in the previous draft of this spec). The two previously-missing files are `blood.svg` and `cell-lines.svg`. The complete per-organ region table below is generated directly from the dataset — **every `<g>` `id` MUST exactly match the `svg_region_id` value in the data.** Do not invent, rename, add, or omit regions.

## Dependencies
- `01-data-schema.md` (for microstructure IDs and `svg_region_id` values)
- `02-body-map-svg.md` (for visual style consistency)

## Output Files (27 total — one per organ)
```
svg/microanatomy/skin.svg
svg/microanatomy/brain.svg
svg/microanatomy/spinal-cord.svg
svg/microanatomy/peripheral-nerve.svg
svg/microanatomy/heart.svg
svg/microanatomy/blood-vessels.svg
svg/microanatomy/lung.svg
svg/microanatomy/stomach.svg
svg/microanatomy/small-intestine.svg
svg/microanatomy/large-intestine.svg
svg/microanatomy/liver.svg
svg/microanatomy/pancreas.svg
svg/microanatomy/bone-marrow.svg
svg/microanatomy/thymus.svg
svg/microanatomy/spleen.svg
svg/microanatomy/lymph-nodes.svg
svg/microanatomy/thyroid.svg
svg/microanatomy/adrenal.svg
svg/microanatomy/skeletal-muscle.svg
svg/microanatomy/bone.svg
svg/microanatomy/ovary.svg
svg/microanatomy/testis.svg
svg/microanatomy/prostate.svg
svg/microanatomy/kidney.svg
svg/microanatomy/eye.svg
svg/microanatomy/blood.svg
svg/microanatomy/cell-lines.svg
```

## SVG Template

### Viewport
- viewBox: `0 0 800 600` (landscape, showing cross-section)
- Consistent across all organ SVGs

### Structure
```xml
<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="group" aria-label="Liver microanatomy">
  <!-- Organ outline -->
  <path class="organ-outline" d="..." fill="var(--bg-secondary)" stroke="#000" stroke-width="2"/>

  <!-- Microstructure regions: id MUST equal the data's svg_region_id -->
  <g id="lobule" class="microstructure-region" data-microstructure="lobule"
     role="button" tabindex="0" aria-label="Hepatic Lobule">
    <path d="..." class="region-path" fill="#D4A574" stroke="#000" stroke-width="1"/>
    <title>Hepatic Lobule</title>
    <desc>The functional unit of the liver.</desc>
  </g>

  <!-- Labels -->
  <g class="labels-layer">
    <text class="region-label" data-for="lobule" x="..." y="...">Hepatic Lobule</text>
  </g>
</svg>
```

### Required attributes on each clickable `<g>`
- `id` = the microstructure's **`svg_region_id`** (exact match, case-sensitive)
- `data-microstructure` = same value as `id`
- `class="microstructure-region"`
- `role="button"`, `tabindex="0"`, `aria-label` = microstructure display name
- a child `<title>` (and ideally `<desc>`) for screen readers

## Complete Per-Organ Region Mapping (source of truth — from dataset)

> Region fill colors use the parent **tissue system color** (see `01-data-schema.md` color table); shade siblings slightly differently for visual separation. The `id`/`data-microstructure` values below are **non-negotiable**.

### Nervous system (golden `#F5E6A3`)
**brain.svg** (4 regions)
| `id` (= svg_region_id) | Display name | Visual hint |
|---|---|---|
| `cortex` | Cerebral Cortex | Outer gray-matter band |
| `cerebellum` | Cerebellum | Foliated structure at base |
| `choroid-plexus` | Choroid Plexus | Ventricular tuft |
| `microglia` | Brain Microglia | Scattered stellate cells overlay |

**spinal-cord.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `white-matter` | White Matter | Outer ring |
| `gray-matter` | Gray Matter | Inner butterfly/H shape |

**peripheral-nerve.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `nerve-sheath` | Nerve Sheath | Concentric perineurium around axon bundles |

### Integumentary system (skin tone `#F5D5C8`)
**skin.svg** (3 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `epidermis` | Epidermis | Top layered strip |
| `dermis` | Dermis | Middle thick layer |
| `hypodermis` | Hypodermis (Subcutaneous Adipose) | Bottom adipose layer |

### Cardiovascular system (red-pink `#E8A0A0`)
**heart.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `myocardium` | Myocardium | Thick muscle wall (whole organ clickable) |

**blood-vessels.svg** (3 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `intima` | Vessel Intima (Endothelium) | Inner endothelial lining |
| `media` | Vessel Media | Middle smooth-muscle layer |
| `adventitia` | Vessel Adventitia | Outer connective tissue |

### Respiratory system (light blue `#D5E8F0`)
**lung.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `alveoli` | Alveoli | Grape-like air sacs |
| `bronchi` | Bronchi | Branching airway with epithelial lining |

### Digestive system (brown `#D4A574`)
**stomach.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `gastric-glands` | Gastric Glands | Tubular glands in mucosa |

**small-intestine.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `villi` | Intestinal Villi | Finger-like projections |
| `crypt` | Intestinal Crypt (Crypt of Lieberkuhn) | Base of villi |

**large-intestine.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `colonic-epithelium` | Colonic Epithelium | Straight crypts, flat surface |

**liver.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `lobule` | Hepatic Lobule | Hexagonal lobule with central vein |
| `sinusoids` | Hepatic Sinusoids | Channels between hepatocyte plates |

**pancreas.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `acini` | Pancreatic Acini | Berry-cluster exocrine units |
| `islets` | Islets of Langerhans | Pale endocrine islands |

### Lymphatic / Immune system (blue-gray `#C8D5E0`)
**bone-marrow.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `hematopoietic-niche` | Hematopoietic Niche | Central cavity with mixed cells |

**thymus.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `cortex` | Thymic Cortex | Dense outer zone |
| `medulla` | Thymic Medulla | Pale inner zone with Hassall's corpuscles |

**spleen.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `white-pulp` | White Pulp | Lymphoid sheath around arteriole |

**lymph-nodes.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `germinal-center` | Germinal Center | Circular follicle center |

### Endocrine system (lavender `#E0C8E8`)
**thyroid.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `follicle` | Thyroid Follicle | Colloid-filled sphere ringed by cells |

**adrenal.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `cortex` | Adrenal Cortex | Outer zonated band |
| `medulla` | Adrenal Medulla | Inner chromaffin core |

### Musculoskeletal system (tan `#D5C8B8`)
**skeletal-muscle.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `muscle-fiber` | Muscle Fiber | Striated fiber bundle |

**bone.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `marrow-cavity` | Bone Marrow Cavity | Central cavity inside cortical bone |

### Reproductive system (pink `#F0C8D8`)
**ovary.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `follicle` | Ovarian Follicle | Oocyte ringed by granulosa cells |

**testis.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `seminiferous-tubule` | Seminiferous Tubule | Coiled tubule cross-section |

**prostate.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `prostate-epithelium` | Prostate Epithelium | Glandular acinar lining |

### Urinary system (yellow `#E8D5A0`)
**kidney.svg** (2 regions)
| `id` | Display name | Visual hint |
|---|---|---|
| `glomerulus` | Glomerulus | Circular capillary tuft in cortex |
| `tubules` | Nephron Tubules | Tubular structures |

### Sensory system (mint `#C8E8D8`)
**eye.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `retina` | Retina | Layered photoreceptor/ganglion strip |

### Circulating Immune system (blue-gray `#C8D5E0`)
**blood.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `leukocytes` | Blood Leukocytes | Field of circulating white-blood-cell shapes (this region hosts 37 cell types — make the click target generous) |

**cell-lines.svg** (1 region)
| `id` | Display name | Visual hint |
|---|---|---|
| `cell-lines` | Miscellaneous Cell Lines | Abstract culture-flask / dish motif |

## Styling
- Region fills: tissue system color (lighter shade per sibling region)
- Hover: brighten + glow (same as body map)
- Active: blue stroke, 2px
- Labels: 11px sans-serif, positioned inside or beside regions, no overlap
- Organ outline: 2px black stroke
- All colors via CSS variables / the documented hex palette — no hard-coded off-palette colors

## Accessibility
- `<title>` and `<desc>` per region
- `role="button"`, `tabindex="0"`, `aria-label`
- Keyboard navigation order matches visual top-to-bottom

## Edge Cases
- Single-microstructure organs (heart, stomach, large-intestine, peripheral-nerve, spleen, lymph-nodes, thyroid, skeletal-muscle, bone, ovary, testis, prostate, eye, blood, cell-lines): the whole organ outline IS the one clickable region — still wrap it in the `<g>` with the correct `id`.
- Some `id` values repeat **across different files** (`cortex` in brain/thymus/adrenal; `medulla` in thymus/adrenal; `follicle` in thyroid/ovary). This is fine — IDs only need to be unique *within a single SVG file*.
- Very small regions: ensure 44×44px minimum touch target.
- Overlapping microstructures: use z-ordering.

## Test Criteria
- [ ] All **27** organ SVGs exist in `svg/microanatomy/`
- [ ] Each SVG contains `<g>` elements whose `id` exactly matches the `svg_region_id` values listed above (verify against `data/cell-markers.json`)
- [ ] No extra or missing regions per organ
- [ ] Hover/click interactions work
- [ ] SVGs render at 400px and 800px widths
- [ ] Keyboard navigation works
- [ ] No overlapping labels
