# Codex Spec: 29-organ-icon-svgs

## Purpose
Create 27 organ icon SVGs at textbook anatomical quality. These icons appear in the organ selection panel (after choosing a tissue system) and serve as visual identifiers for each organ. They must be anatomically recognizable, not generic or cartoonish.

## Dependencies
- (none — organ icons are NEW in v1.1.0; no v1.0.0 original)
- `15-css-styles.md` (organ icon CSS, hover states)

## Output Files
All files in `svg/icons/`:
- `skin.svg`, `brain.svg`, `spinal-cord.svg`, `peripheral-nerve.svg`
- `heart.svg`, `blood-vessels.svg`, `lung.svg`
- `stomach.svg`, `small-intestine.svg`, `large-intestine.svg`, `liver.svg`, `pancreas.svg`
- `bone-marrow.svg`, `thymus.svg`, `spleen.svg`, `lymph-nodes.svg`
- `thyroid.svg`, `adrenal.svg`
- `skeletal-muscle.svg`, `bone.svg`
- `ovary.svg`, `testis.svg`, `prostate.svg`
- `kidney.svg`
- `eye.svg`
- `blood.svg`, `cell-lines.svg`

## Design Requirements

### Common Specifications
- **ViewBox:** `0 0 64 64` (square, 64×64)
- **Style:** Clean vector line art, single-color fill using the tissue system color at 60% opacity, outline in `#333` (1.5px stroke)
- **Background:** Transparent (no background rect — the CSS provides the background)
- **Sizing:** Icons are displayed at 48×48px in the UI (CSS scales from 64×64 viewBox)
- **Recognizability:** Each icon must be immediately identifiable as the specific organ by anyone with basic anatomy knowledge
- **Consistency:** All icons use the same stroke weight, fill opacity, and level of detail

### SVG Template
```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <title>[Organ Name]</title>
  <!-- Organ shape -->
  <path d="..." fill="[tissue-color]" fill-opacity="0.6" stroke="#333" stroke-width="1.5" stroke-linejoin="round"/>
  <!-- Internal detail lines (subtle, thinner stroke) -->
  <path d="..." fill="none" stroke="#333" stroke-width="0.75" stroke-linecap="round"/>
</svg>
```

---

## Individual Organ Icon Descriptions

### 1. skin.svg — Skin
- **Shape:** A curved cross-section showing three layers (epidermis, dermis, hypodermis) — like a wedge/slice of the skin wall
- **Details:** Wavy line at the dermal-epidermal junction; thin top layer (epidermis), thicker middle (dermis), bottom with 2–3 round adipocytes
- **Color:** `#F5D5C8`

### 2. brain.svg — Brain
- **Shape:** Lateral view of the brain — the classic brain silhouette with the cerebrum (large, convoluted upper portion), cerebellum (smaller, ridged posterior portion), and brainstem
- **Details:** 3–4 sulci lines on the cerebrum; 2–3 horizontal lines on the cerebellum; thin brainstem tapering down
- **Color:** `#F5E6A3`

### 3. spinal-cord.svg — Spinal Cord
- **Shape:** A short segment of the spinal cord in anterior view — cylindrical with a slight bulge at the cervical enlargement, with spinal nerve roots exiting bilaterally at 2–3 levels
- **Details:** Central longitudinal line (central canal); 2–3 pairs of nerve rootlets exiting laterally; slight taper toward the bottom
- **Color:** `#F5E6A3`

### 4. peripheral-nerve.svg — Peripheral Nerves
- **Shape:** A Y-shaped branching nerve — a single nerve trunk that bifurcates into two branches
- **Details:** Thin lines within the trunk showing fascicles; slight bulge at the bifurcation point (ganglion area)
- **Color:** `#F5E6A3`

### 5. heart.svg — Heart
- **Shape:** Classic heart shape (anatomical, not Valentine) — the conical heart with the base (atria) at the top and apex pointing left-downward, with the aorta and pulmonary artery exiting from the top
- **Details:** Atria at the top (two bumps); interventricular sulcus as a diagonal line; aortic arch curving over the top; two vessel openings at the base
- **Color:** `#E8A0A0`

### 6. blood-vessels.svg — Blood Vessels
- **Shape:** Cross-section of an artery — concentric circles showing the three layers (intima, media, adventitia) with a central lumen
- **Details:** 3 concentric rings; small dot at the center (lumen); inner ring slightly wavy (internal elastic lamina)
- **Color:** `#E8A0A0`

### 7. lung.svg — Lung
- **Shape:** Right lung in lateral view — triangular/conical with the broad base (diaphragmatic surface) at the bottom and apex at the top, with the medial (hilar) surface on the left
- **Details:** Two horizontal fissure lines (horizontal and oblique fissures) dividing the lung into 3 lobes; small circle at the hilum (bronchus)
- **Color:** `#D5E8F0`

### 8. stomach.svg — Stomach
- **Shape:** J-shaped stomach in anterior view — the fundus bulging upward-left, the body curving down, and the pyloric region narrowing to the right
- **Details:** Greater curvature on the left (longer, more curved); lesser curvature on the right (shorter, straighter); pyloric sphincter as a slight narrowing at the distal end
- **Color:** `#D4A574`

### 9. small-intestine.svg — Small Intestine
- **Shape:** A coiled loop of intestine — show 2–3 loops of a tubular structure, like a simplified intestinal coil
- **Details:** The tube has a visible wall thickness; lumen shown as a lighter interior; slight finger-like projections (villi) on the inner surface (optional at this scale)
- **Color:** `#D4A574`

### 10. large-intestine.svg — Large Intestine (Colon)
- **Shape:** The characteristic frame-like shape of the colon — ascending colon (right), transverse colon (top), descending colon (left), and sigmoid colon (bottom), forming an inverted U
- **Details:** Haustral sacculations as 3–4 slight bulges along each segment; appendiceal tag at the cecum (lower right); rectum at the bottom
- **Color:** `#D4A574`

### 11. liver.svg — Liver
- **Shape:** Anterior view of the liver — the large, wedge-shaped organ with the right lobe (larger) and left lobe (smaller), with the falciform ligament dividing them
- **Details:** Falciform ligament as a thin line at the top; rounded right lobe; pointed left lobe; gallbladder as a small teardrop at the inferior margin (optional)
- **Color:** `#D4A574`

### 12. pancreas.svg — Pancreas
- **Shape:** The elongated, lobulated pancreas in anterior view — head (right, within the C-loop of duodenum), body (crossing midline), tail (extending left toward the spleen)
- **Details:** Lobulated surface texture (small bumps along the edge); the head is the thickest part; the tail tapers; small circle for the main pancreatic duct running through the center (optional)
- **Color:** `#D4A574`

### 13. bone-marrow.svg — Bone Marrow
- **Shape:** Cross-section of a long bone showing the marrow cavity — a ring of cortical bone (outer) with the marrow-filled cavity (inner)
- **Details:** Thick outer ring (cortical bone); inner area with 2–3 small circles (adipocytes) and 2–3 dots (hematopoietic cells); 1–2 small circles for osteons in the cortex
- **Color:** `#C8D5E0`

### 14. thymus.svg — Thymus
- **Shape:** Bilobed organ in anterior view — two irregular, triangular/oval lobes side by side, connected at the lower midline
- **Details:** Each lobe has a darker outer zone (cortex) and lighter inner zone (medulla); thin isthmus connecting the lobes at the bottom
- **Color:** `#C8D5E0`

### 15. spleen.svg — Spleen
- **Shape:** Oval/fist-shaped organ in lateral view — the spleen is roughly oval with a convex lateral surface and a concave medial (hilar) surface
- **Details:** Hilum as a slight indentation on the medial surface; 1–2 small circles at the hilum (vessels); subtle texture suggesting white pulp islands (optional)
- **Color:** `#C8D5E0`

### 16. lymph-nodes.svg — Lymph Nodes
- **Shape:** A small bean-shaped/reniform organ — the classic lymph node shape with a hilum (indentation) on one side
- **Details:** Hilum indentation on the concave side; 1–2 small lines at the hilum (efferent lymphatics); afferent vessels as thin lines entering the convex side (optional)
- **Color:** `#C8D5E0`

### 17. thyroid.svg — Thyroid
- **Shape:** Butterfly-shaped gland in anterior view — two lateral lobes connected by a thin isthmus across the midline, wrapping around the trachea
- **Details:** Each lobe is roughly oval/pyramidal; isthmus is a thin band crossing the midline; small circle for the trachea behind the isthmus (optional context)
- **Color:** `#E0C8E8`

### 18. adrenal.svg — Adrenal Gland
- **Shape:** Pyramidal (right) or crescent/semilunar (left) shape — show one adrenal gland in cross-section, triangular with a rounded top
- **Details:** Outer zone (cortex) as a thicker ring; inner zone (medulla) as a smaller, differently-shaded core; the cortex is ~2/3 of the cross-section, medulla ~1/3
- **Color:** `#E0C8E8`

### 19. skeletal-muscle.svg — Skeletal Muscle
- **Shape:** A bundled muscle in longitudinal view — a spindle/fusiform shape (thick in the middle, tapering at both ends) with tendons at the tips
- **Details:** 3–4 longitudinal lines within the muscle belly (muscle fibers/fascicles); thin tendon extensions at both ends; subtle cross-striations (alternating thin lines perpendicular to the fiber direction)
- **Color:** `#D5C8B8`

### 20. bone.svg — Bone
- **Shape:** A long bone (e.g., femur) in anterior view — shaft (diaphysis) with expanded ends (epiphyses)
- **Details:** Expanded proximal and distal epiphyses; narrower diaphysis; 2–3 concentric circles in the shaft cross-section suggesting osteons (optional); small line at each end for the epiphyseal plate (growth plate, optional)
- **Color:** `#D5C8B8`

### 21. ovary.svg — Ovary
- **Shape:** Oval/ellipsoid organ in lateral view — the ovary is roughly almond-shaped
- **Details:** 2–3 small circles on the surface representing follicles at various stages; one larger circle (Graafian follicle); surface is slightly lobulated
- **Color:** `#F0C8D8`

### 22. testis.svg — Testis
- **Shape:** Oval organ in lateral view — the testis is an oval with a smooth surface, with the epididymis as a C-shaped structure along the posterior border
- **Details:** Epididymis as a comma-shaped structure along one side; vas deferens as a thin tube exiting from the epididymis tail (optional)
- **Color:** `#F0C8D8`

### 23. prostate.svg — Prostate
- **Shape:** Rounded/triangular organ in axial cross-section — the prostate is roughly cone-shaped (base at the bladder, apex inferiorly), but in cross-section appears as a rounded triangle
- **Details:** Small circle in the center (prostatic urethra); 2–3 small dots around the urethra (glandular ducts); fibromuscular texture suggested by thin lines
- **Color:** `#F0C8D8`

### 24. kidney.svg — Kidney
- **Shape:** Classic bean-shaped organ — the kidney is the prototypical bean shape with a convex lateral border and a concave medial border (hilum)
- **Details:** Hilum indentation on the medial side; 2–3 small lines at the hilum (renal artery, vein, ureter); subtle radial lines from the hilum outward (medullary pyramids, optional)
- **Color:** `#E8D5A0`

### 25. eye.svg — Eye
- **Shape:** Horizontal cross-section through the eyeball — the classic eye diagram showing the spherical eyeball with the lens and iris in the anterior segment
- **Details:** Spherical outline; lens as a biconvex shape in the anterior segment; iris as two thin lines flanking the lens; cornea as a slight bulge at the anterior pole; optic nerve exiting the posterior pole as a short stalk; retina as a thin inner layer (optional at this scale)
- **Color:** `#C8E8D8`

### 26. blood.svg — Blood
- **Shape:** A drop of blood or a cluster of blood cells — show 3–4 red blood cells (biconcave discs, shown as circles with a central pallor) and 1–2 white blood cells (larger, with lobed nuclei)
- **Details:** RBCs as circles with a lighter center (biconcave shape); 1 neutrophil with a segmented nucleus; 1 lymphocyte as a small circle with a large dark nucleus
- **Color:** `#C8D5E0`

### 27. cell-lines.svg — Cell Lines / Other
- **Shape:** A generic cultured cell — a rounded/irregular cell on a flat surface (culture dish), with a large nucleus and spreading cytoplasm
- **Details:** Cell body as an irregular polygon; nucleus as a large oval; 2–3 small dots in the cytoplasm (organelles); thin line at the bottom representing the culture surface
- **Color:** `#C8D5E0`

---

## CSS Considerations

The organ icons are displayed in the organ selection panel. Verify:

1. Icons are displayed at 48×48px (CSS scales from 64×64 viewBox)
2. Hover state adds a subtle glow or border using the tissue system color
3. Selected state uses a stronger highlight
4. Icons have `alt` text or `aria-label` matching the organ name
5. Dark mode: icons remain visible — the `#333` stroke works on both light and dark backgrounds

## Accessibility
- Each SVG has a `<title>` element with the organ name
- The `<img>` or `<object>` element referencing the SVG has an `alt` attribute
- Icons are keyboard-focusable in the organ selection panel

## Edge Cases
- **Blood and cell-lines** share the same tissue system color (`#C8D5E0`) as the lymphatic system. This is correct — they're all immune-related.
- **Blood-vessels icon** is a cross-section, which is a different view than the other organ icons (most are external views). This is intentional — the cross-section is the most recognizable representation of a blood vessel.
- **Large-intestine icon** shows the entire colon frame, which is more of a schematic than a single organ view. This is the standard way to represent the colon in anatomical illustrations.

## Test Criteria
- [ ] All 27 organ icon SVGs exist in `svg/icons/`
- [ ] Each icon is valid SVG with `viewBox="0 0 64 64"`
- [ ] Each icon is immediately recognizable as the specific organ
- [ ] Icons use the correct tissue system color at 60% fill opacity
- [ ] All icons have consistent stroke weight (1.5px outline, 0.75px detail lines)
- [ ] Icons render clearly at 48×48px display size
- [ ] Each SVG has a `<title>` element
- [ ] Icons look like textbook anatomical illustrations, not generic clip art
