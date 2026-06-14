# Codex Spec: 25-body-map-svg-redraw

## Purpose
Redraw the body map SVG at textbook anatomical quality. The current body map is a simplified schematic that does not accurately represent human anatomy. This spec produces a new SVG with correct proportions, anatomical landmarks, and 12 clickable tissue system regions — including the **chest region split** (chest-left for cardiovascular, chest-right for respiratory) to resolve the current ambiguity where both systems share `body_map_region: "chest"`.

## Dependencies
- `02-body-map-svg.md` (original body map spec)
- `24-microstructure-id-reconcile.md` (SVG element IDs must use canonical IDs)
- `15-css-styles.md` (body map CSS, hover states, tissue system colors)

## Output Files
- `svg/body-map.svg` — replace existing file

## Design Requirements

### Quality Target
Textbook anatomical illustration quality, comparable to:
- Netter's Atlas of Human Anatomy (clean vector style)
- Junqueira's Basic Histology (organ positioning)
- Alberts' Molecular Biology of the Cell (schematic clarity)

**Style:** Clean vector lines, correct anatomical proportions, no photorealism, no gradient fills. Outlines in dark gray (#333), region fills in tissue system colors (semi-transparent), labels optional (hover reveals system name).

### ViewBox and Dimensions
- `viewBox="0 0 400 800"` — portrait orientation, 1:2 aspect ratio
- Human figure centered, ~60px margin on all sides
- Figure occupies roughly 280×680 within the viewBox

### Anatomical Proportions
Follow standard anatomical proportions for an adult human:
- **Head:** ~1/8 of total body height (~85px), oval/egg-shaped, slightly wider at cranium
- **Neck:** ~15px tall, narrower than head
- **Torso:** ~2.5 head heights (~210px), shoulders at ~1/3 down from top
- **Arms:** Extend from shoulders, hands reach mid-thigh
- **Legs:** ~3.5 head heights from hip to sole, ~50% of total height
- **Overall:** 7.5 head heights total (standard anatomical canon)

### Figure Pose
- **Anterior view** (facing viewer)
- Arms slightly abducted (~15° from body) — enough to show lateral torso
- Legs together with slight gap
- Neutral standing position
- No facial features (head is a clean oval)

## Clickable Regions

Each tissue system has a clickable region on the body map. Regions are `<g>` groups with `class="body-region"` and `id` matching the `body_map_region` value from the data.

### Region Definitions

#### 1. Integumentary System — `id="skin"`
- **Location:** Full body outline (the skin IS the outer boundary)
- **Shape:** A thin band (~8px) following the entire body contour — from scalp around head, down neck, along shoulders, arms, torso, legs, to feet
- **Fill:** `#F5D5C8` at 30% opacity (so it doesn't overwhelm other regions)
- **Anatomical note:** Skin covers everything; represented as a border/outline region rather than a filled area. On hover, the entire outline highlights.
- **Implementation:** Use the same `<path>` as the body outline but with a thick stroke and no fill, or a separate path offset inward by ~8px

#### 2. Nervous System — `id="head+spine"`
- **Location:** Head (brain) + spinal column
- **Shape:**
  - **Brain region:** Oval filling the cranial vault (upper 2/3 of head oval), centered slightly posterior
  - **Spinal cord:** Narrow strip (~12px wide) running from base of skull down the vertebral column to the sacrum
  - Both are a single `<g>` group so they highlight together
- **Fill:** `#F5E6A3` at 40% opacity
- **Anatomical note:** Brain sits in the cranial cavity above the orbits; spinal cord runs within the vertebral canal, posterior to the torso midline

#### 3. Cardiovascular System — `id="chest-left"`
- **Location:** Left chest (anatomical left = viewer's right, but use anatomical convention: patient's left)
- **Shape:**
  - Heart silhouette: slightly left-of-center in the mediastinum, roughly the size of a fist, with the apex pointing left-downward
  - Great vessels: aortic arch curving from heart upward and left, superior vena cava to the right of the arch
  - Coronary vessels on the heart surface (optional, subtle)
  - Region extends from the sternum leftward to the mid-axillary line, superiorly to the clavicles, inferiorly to the diaphragm
- **Fill:** `#E8A0A0` at 40% opacity
- **Anatomical note:** The heart lies in the middle mediastinum, 2/3 to the left of the midline. The aortic arch passes over the left pulmonary artery. The region should clearly occupy the LEFT chest, distinct from the right lung area.

#### 4. Respiratory System — `id="chest-right"`
- **Location:** Right chest + trachea
- **Shape:**
  - **Trachea:** Midline tube from the larynx (C6 level) down to the carina (T4 level), ~10px wide
  - **Right lung:** Large triangular region filling the right hemithorax — broad base at the diaphragm, apex at the right clavicle. The right lung has 3 lobes (separated by horizontal and oblique fissures) — show fissure lines as subtle dashed paths
  - **Left lung:** Also shown (smaller, 2 lobes) but the CLICKABLE REGION is the right side. The left lung is drawn for anatomical completeness but is part of the same group.
  - Region extends from midline rightward to the lateral chest wall
- **Fill:** `#D5E8F0` at 40% opacity
- **Anatomical note:** Right lung is slightly larger than left (3 lobes vs 2, left lung has cardiac notch). Trachea bifurcates at the carina (T4/T5 level) into right and left main bronchi.

**CRITICAL — Chest split:** The cardiovascular and respiratory regions must NOT overlap. The dividing line is approximately the midline of the mediastinum. Cardiovascular occupies the left hemithorax (heart + great vessels), respiratory occupies both lungs + trachea but the clickable region is `chest-right`. On hover, both lungs + trachea highlight together.

#### 5. Digestive System — `id="abdomen"`
- **Location:** Abdominal cavity
- **Shape:**
  - **Stomach:** J-shaped, in the left upper quadrant, below the diaphragm
  - **Small intestine:** Coiled mass occupying the central abdomen
  - **Large intestine:** Frame-like arrangement — ascending colon (right), transverse colon (across top), descending colon (left), sigmoid colon (lower left)
  - **Liver:** Large right upper quadrant organ, below right diaphragm
  - **Pancreas:** Elongated retroperitoneal organ across the upper abdomen, behind the stomach
  - All organs are a single `<g>` group
- **Fill:** `#D4A574` at 35% opacity
- **Anatomical note:** Stomach is J-shaped with the greater curvature on the left. Liver occupies most of the right upper quadrant and extends across the midline. Small intestine is centrally located. Large intestine frames the perimeter.

#### 6. Lymphatic/Immune System — `id="lymph-nodes+spleen"`
- **Location:** Scattered — lymph nodes in neck, axillae, groin, and mesentery; spleen in left upper quadrant; thymus in anterior mediastinum; bone marrow in bones
- **Shape:**
  - **Spleen:** Oval in the left upper quadrant, lateral to the stomach, below the diaphragm
  - **Thymus:** Small triangular shape in the anterior superior mediastinum (above the heart)
  - **Lymph node clusters:** Small circles (4–6px radius) at:
    - Cervical nodes (along the neck, bilateral)
    - Axillary nodes (armpits, bilateral)
    - Inguinal nodes (groin, bilateral)
    - Mesenteric nodes (central abdomen, near small intestine)
  - **Bone marrow:** Small dots within the femur/hip bones (optional, subtle)
  - All elements are a single `<g>` group
- **Fill:** `#C8D5E0` at 40% opacity
- **Anatomical note:** Spleen is the largest lymphoid organ, ~12cm in life, tucked under the left diaphragm. Thymus is prominent in childhood, atrophied in adults — show it small. Lymph nodes are bean-shaped but represented as small circles at this scale.

#### 7. Endocrine System — `id="neck+abdomen"`
- **Location:** Thyroid (neck) + Adrenal glands (abdomen)
- **Shape:**
  - **Thyroid:** Butterfly-shaped gland on the anterior neck, straddling the trachea at the C5–T1 level. Two lateral lobes connected by a thin isthmus. Each lobe is ~15px tall, ~10px wide.
  - **Adrenal glands:** Small triangular/pyramidal glands sitting atop each kidney (suprarenal). Right adrenal is more pyramidal, left more crescent-shaped. Each ~8px tall.
  - Both are a single `<g>` group
- **Fill:** `#E0C8E8` at 40% opacity
- **Anatomical note:** Thyroid isthmus crosses the midline anterior to trachea rings 2–4. Adrenals are retroperitoneal, superior to the kidneys. The right adrenal is between the liver and right kidney, the left between the stomach/spleen and left kidney.

#### 8. Musculoskeletal System — `id="limbs+trunk"`
- **Location:** Skeleton + muscles throughout the body
- **Shape:**
  - **Spine:** Series of small rectangles (vertebral bodies) from C1 to sacrum, midline posterior
  - **Ribcage:** Curved ribs from the spine around to the sternum (12 pairs, show ~8 visible pairs in anterior view)
  - **Pelvis:** Broad butterfly-shaped bone at the base of the torso
  - **Femurs:** Long bones from hip to knee
  - **Tibias:** Long bones from knee to ankle
  - **Humeri:** Upper arm bones from shoulder to elbow
  - **Radii/ulnae:** Forearm bones from elbow to wrist
  - **Skull outline:** Around the brain region
  - All skeletal elements are a single `<g>` group
- **Fill:** `#D5C8B8` at 25% opacity (low opacity to not obscure other regions)
- **Anatomical note:** In anterior view, the ribcage is prominent. The sternum is midline. Pelvis is broad with iliac crests. Long bones follow the limb contours. This region should be drawn BEHIND other regions (lower z-order) since bones are deep structures.

#### 9. Reproductive System — `id="pelvis"`
- **Location:** Pelvic cavity
- **Shape:**
  - **Ovaries:** Small oval organs (6px × 4px) on either side of the uterus, in the lateral pelvis
  - **Uterus:** Pear-shaped midline organ between ovaries (female anatomy shown as default)
  - **Testes:** Shown in the scrotum below the pelvis (if male anatomy overlay, but use female as default since ovary has more cell types)
  - **Prostate:** Small donut-shaped gland below the bladder (if shown)
  - All reproductive organs are a single `<g>` group
- **Fill:** `#F0C8D8` at 40% opacity
- **Anatomical note:** Ovaries are lateral to the uterus, connected by fallopian tubes. Uterus sits posterior to the bladder. For this app, show female reproductive anatomy as the primary view (ovary has 3 cell types vs testis 2).

#### 10. Urinary System — `id="flank+pelvis"`
- **Location:** Kidneys (flank) + bladder (pelvis)
- **Shape:**
  - **Kidneys:** Bilateral bean-shaped organs in the retroperitoneum, T12–L3 level. Right kidney slightly lower than left (liver pushes it down). Each ~25px tall, ~15px wide, with the hilum facing medially.
  - **Ureters:** Thin tubes (~3px) from each kidney hilum down to the bladder
  - **Bladder:** Small oval in the anterior pelvis, midline
  - All are a single `<g>` group
- **Fill:** `#E8D5A0` at 40% opacity
- **Anatomical note:** Kidneys are retroperitoneal at the posterior abdominal wall. The right kidney is 1–2cm lower than the left due to the liver. Ureters run retroperitoneally along the psoas muscles to the bladder.

#### 11. Sensory System — `id="head"`
- **Location:** Eyes (and by extension, ears/nose — but only eye has data)
- **Shape:**
  - **Eyes:** Two small circles (~8px radius) on the face, at the midline of the head oval, bilaterally
  - Only the eye region needs to be clickable (only organ with data)
- **Fill:** `#C8E8D8` at 40% opacity
- **Anatomical note:** Eyes sit in the orbits, roughly at the midpoint of the head height. At body-map scale, they are small but should be visible and clickable.

#### 12. Circulating Immune Cells — `id="blood"`
- **Location:** Bloodstream (distributed throughout the body via blood vessels)
- **Shape:**
  - **Major vessels:** Aorta (from heart, arching left, descending along the spine), vena cava (parallel to aorta), and major branches (carotids, subclavians, iliacs, femorals)
  - Represented as a network of vessel paths throughout the body
  - This is a distributed system — the clickable region is the vessel network
- **Fill:** `#C8D5E0` at 30% opacity (low to not obscure other regions)
- **Anatomical note:** The aorta arches over the left hilum and descends posterior to the heart along the left side of the spine. The IVC runs to the right of the aorta. Major branches go to the head, arms, and legs. At body-map scale, show the aortic arch, descending aorta, and 4–6 major branches.

## SVG Structure

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 800" 
     class="body-map-svg" role="img" aria-label="Human body map for cell marker exploration">
  
  <!-- Background figure (body outline) -->
  <g id="body-outline" class="body-outline">
    <path d="..." fill="#FAF9F3" stroke="#333" stroke-width="1.5"/>
  </g>
  
  <!-- Clickable regions (ordered back-to-front for z-ordering) -->
  <!-- Layer 1: Deep structures (musculoskeletal, circulating immune) -->
  <g id="limbs+trunk" class="body-region" data-tissue-system="musculoskeletal">
    <!-- Skeleton elements -->
  </g>
  <g id="blood" class="body-region" data-tissue-system="circulating-immune">
    <!-- Vessel network -->
  </g>
  
  <!-- Layer 2: Internal organs -->
  <g id="head+spine" class="body-region" data-tissue-system="nervous">
    <!-- Brain + spinal cord -->
  </g>
  <g id="chest-left" class="body-region" data-tissue-system="cardiovascular">
    <!-- Heart + great vessels -->
  </g>
  <g id="chest-right" class="body-region" data-tissue-system="respiratory">
    <!-- Lungs + trachea -->
  </g>
  <g id="abdomen" class="body-region" data-tissue-system="digestive">
    <!-- GI organs -->
  </g>
  <g id="lymph-nodes+spleen" class="body-region" data-tissue-system="lymphatic">
    <!-- Spleen, thymus, lymph nodes -->
  </g>
  <g id="neck+abdomen" class="body-region" data-tissue-system="endocrine">
    <!-- Thyroid, adrenals -->
  </g>
  <g id="flank+pelvis" class="body-region" data-tissue-system="urinary">
    <!-- Kidneys, ureters, bladder -->
  </g>
  <g id="pelvis" class="body-region" data-tissue-system="reproductive">
    <!-- Ovaries, uterus -->
  </g>
  <g id="head" class="body-region" data-tissue-system="sensory">
    <!-- Eyes -->
  </g>
  
  <!-- Layer 3: Surface (skin) — on top -->
  <g id="skin" class="body-region" data-tissue-system="integumentary">
    <!-- Body outline stroke -->
  </g>
</svg>
```

## Data Change: Chest Region Split

Update `cell-markers.json`:

**Before:**
```json
{
  "id": "cardiovascular",
  "body_map_region": "chest",
  ...
},
{
  "id": "respiratory",
  "body_map_region": "chest",
  ...
}
```

**After:**
```json
{
  "id": "cardiovascular",
  "body_map_region": "chest-left",
  ...
},
{
  "id": "respiratory",
  "body_map_region": "chest-right",
  ...
}
```

## CSS Considerations

The existing body map CSS (from spec 15) uses `.body-region` for hover states. Verify that:

1. Hover highlights work with the new region IDs
2. The `data-system` attribute is used for color mapping (not the `id`)
3. The skin region hover doesn't interfere with underlying regions — use `pointer-events: stroke` for the skin region so clicks pass through to organs underneath
4. Overlapping regions (musculoskeletal behind organs) use appropriate z-ordering via SVG paint order (later elements paint on top)

Add CSS for the skin region's pointer-events:
```css
.body-region[data-tissue-system="integumentary"] {
  pointer-events: stroke; /* Only the outline stroke is clickable, not the fill */
  fill: none;
  stroke-width: 8;
}
```

## Accessibility
- `role="img"` on the SVG
- `aria-label="Human body map for cell marker exploration"`
- Each region has `aria-label` describing the system (e.g., `aria-label="Cardiovascular system - click to explore"`)
- `tabindex="0"` on each region for keyboard navigation
- Focus outline matches the hover highlight style

## Edge Cases
- **Overlapping regions:** Musculoskeletal and circulating immune are deep structures that overlap with surface organs. They should be drawn first (lower z-order) and have lower opacity so they don't obscure organs.
- **Skin region:** The skin covers everything. Use `pointer-events: stroke` so clicking inside the body hits the organ underneath, not the skin. Only clicking the body outline border activates the skin region.
- **Small regions:** Eyes and adrenals are very small at body-map scale. Ensure they have a minimum clickable area of 24×24px (add invisible hit areas if needed).
- **Mobile touch targets:** All regions must be at least 44×44px per WCAG 2.5.5. Add invisible expanded hit areas for small regions (thyroid, adrenals, eyes).

## Test Criteria
- [ ] Body map renders with correct anatomical proportions (7.5 head heights)
- [ ] All 12 tissue system regions are clickable and navigate to the correct system
- [ ] Cardiovascular (`chest-left`) and respiratory (`chest-right`) are distinct, non-overlapping regions
- [ ] Hover highlights use the correct tissue system color
- [ ] Skin region click only activates on the body outline border, not on internal organs
- [ ] Small regions (eyes, adrenals, thyroid) have expanded touch targets
- [ ] No region IDs overlap or conflict
- [ ] `cell-markers.json` updated: cardiovascular `body_map_region` = `"chest-left"`, respiratory = `"chest-right"`
- [ ] Keyboard navigation works (Tab through regions, Enter to select)
- [ ] SVG is valid and renders correctly in Chrome, Firefox, Safari
- [ ] Body map looks like a textbook anatomical illustration, not a cartoon
