# Codex Spec: 26-microanatomy-batch-1

## Purpose
Redraw microanatomy SVGs for the integumentary, nervous, cardiovascular, and respiratory systems at textbook histology quality. Each SVG must accurately depict the organ's microanatomy with correctly proportioned tissue layers, cell arrangements, and regional boundaries. Clickable microstructure regions use canonical `id` values (per spec 24).

## Dependencies
- `03-microanatomy-svgs.md` (original microanatomy spec)
- `24-microstructure-id-reconcile.md` (use canonical IDs, not svg_region_id)
- `15-css-styles.md` (microanatomy CSS, hover states)

## Output Files
- `svg/microanatomy/skin.svg`
- `svg/microanatomy/brain.svg`
- `svg/microanatomy/spinal-cord.svg`
- `svg/microanatomy/peripheral-nerve.svg`
- `svg/microanatomy/heart.svg`
- `svg/microanatomy/blood-vessels.svg`
- `svg/microanatomy/lung.svg`

## Quality Target
Textbook histology illustration quality (Junqueira's Basic Histology / Alberts' Molecular Biology style):
- Clean vector lines, no photorealism, no gradient fills
- Correct tissue proportions and layer thicknesses
- Labeled regions with subtle boundary lines
- Cell types shown as simplified shapes in their correct anatomical positions
- Outlines in dark gray (#333), region fills in tissue system colors at 30–40% opacity

## Common SVG Structure

Each microanatomy SVG follows this template:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 400"
     class="microanatomy-svg" role="img" aria-label="[Organ name] microanatomy">
  
  <!-- Background -->
  <rect width="600" height="400" fill="var(--bg-primary, #FAF9F3)"/>
  
  <!-- Organ title -->
  <text x="300" y="24" text-anchor="middle" class="organ-title">[Organ Name]</text>
  
  <!-- Clickable microstructure regions -->
  <g id="[microstructure-id]" class="microstructure-region" data-organ="[organ-id]">
    <!-- Anatomical drawing of this region -->
  </g>
  
  <!-- Non-clickable structural context (boundaries, labels) -->
  <g class="structural-context">
    <!-- Boundary lines, region labels -->
  </g>
</svg>
```

---

## 1. skin.svg — Skin Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
The skin is a stratified organ viewed in cross-section, showing three distinct layers from superficial to deep. The cross-section should be oriented with the epidermis at the top and the hypodermis at the bottom, as in a standard histology slide.

### Regions

#### `id="epidermis"` — Epidermis
- **Location:** Top ~15% of the SVG (superficial layer)
- **Shape:** Irregular wavy bottom border (dermal-epidermal junction with rete ridges/dermal papillae interdigitating). The top border is flat (skin surface).
- **Histology:** Stratified squamous epithelium, shown as 4–5 layers of cells:
  - **Stratum basale** (bottom row): Small cuboidal cells, single row, darkly shaded — contains keratinocyte stem cells and Langerhans cells
  - **Stratum spinosum** (middle rows): Larger polygonal cells with "spines" (desmosomal connections), 2–3 rows
  - **Stratum granulosum** (1 row above spinosum): Flattened cells with granules
  - **Stratum corneum** (top layers): Flattened anucleate cells, 2–3 rows, lighter shading
- **Fill:** `#F5D5C8` at 35% opacity
- **Clickable area:** The entire epidermal layer from stratum basale to stratum corneum

#### `id="dermis"` — Dermis
- **Location:** Middle ~45% of the SVG
- **Shape:** Bounded superiorly by the wavy dermal-epidermal junction (interlocking with epidermis) and inferiorly by a relatively flat border with the hypodermis
- **Histology:** Dense irregular connective tissue:
  - **Papillary dermis** (upper 1/5): Thin, loose connective tissue, lighter shade, contains dermal papillae that project into the epidermis
  - **Reticular dermis** (lower 4/5): Dense, thicker collagen bundles, darker shade
  - Show 2–3 cross-sectioned blood vessels (small circles with thin walls) in the dermis
  - Show 1–2 hair follicles as tube-like structures extending from the epidermis down into the dermis (optional, adds anatomical context)
  - Show 1 sweat gland as a coiled tubular structure in the lower dermis (optional)
- **Fill:** `#F5D5C8` at 25% opacity (lighter than epidermis to show it's a different layer)
- **Clickable area:** The entire dermal layer

#### `id="hypodermis"` — Hypodermis (Subcutaneous Adipose)
- **Location:** Bottom ~40% of the SVG
- **Shape:** Relatively flat superior border (abutting reticular dermis), flat bottom border
- **Histology:** Subcutaneous adipose tissue:
  - **Adipocytes:** Large, round, signet-ring cells — each is a large clear circle (lipid droplet) with a thin crescent of cytoplasm and a flattened nucleus at the periphery. Show 15–20 adipocytes in a cluster.
  - **Connective tissue septa:** Thin fibrous bands dividing adipocytes into lobules
  - Show 1–2 larger blood vessels (arterioles/venules) running through the septa
- **Fill:** `#F5D5C8` at 20% opacity (lightest shade, deepest layer)
- **Clickable area:** The entire hypodermis

### Structural Context
- Dashed lines separating the three layers with labels: "Epidermis", "Dermis", "Hypodermis"
- A small arrow or bracket indicating the stratum basale within the epidermis
- Hair follicle and sweat gland are decorative (not clickable)

---

## 2. brain.svg — Brain Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A coronal (frontal) cross-section through the brain at the level of the thalamus, showing the cerebral cortex, cerebellum (inset or separate view), choroid plexus, and microglia distribution. The main view shows the cerebral hemispheres; the cerebellum is shown as an inset in the lower-right corner.

### Regions

#### `id="cerebral-cortex"` — Cerebral Cortex
- **Location:** Outer rim of each cerebral hemisphere (top ~10% of the hemisphere cross-section)
- **Shape:** Two C-shaped cortical ribbons (left and right hemispheres) following the contour of the brain surface. Each ribbon is ~30px thick with a wavy outer border (gyri/sulci pattern).
- **Histology:** Six-layered neocortex (shown as simplified layers):
  - **Molecular layer (I):** Thin, cell-sparse, at the surface
  - **External granular layer (II):** Small dense cells
  - **External pyramidal layer (III):** Medium pyramidal cells — show 3–4 triangular cell bodies with apical dendrites pointing toward the surface
  - **Internal granular layer (IV):** Dense small granule cells
  - **Internal pyramidal layer (V):** Large pyramidal cells (Betz cells) — show 2–3 large triangular cell bodies
  - **Multiform layer (VI):** Mixed small cells transitioning to white matter
  - The white matter (center of each hemisphere) is NOT a separate clickable region but is shown as lighter tissue
- **Fill:** `#F5E6A3` at 35% opacity
- **Clickable area:** The entire cortical ribbon on both hemispheres

#### `id="cerebellum"` — Cerebellum
- **Location:** Inset in the lower-right corner (~150×120px box with a thin border)
- **Shape:** Cross-section of cerebellar folia (leaf-like folds)
- **Histology:**
  - **Molecular layer:** Outer, pale, cell-sparse layer of each folium
  - **Purkinje cell layer:** Single row of large flask-shaped cells at the junction of molecular and granular layers — show 4–5 Purkinje cell bodies with elaborate dendritic trees extending into the molecular layer (fan-shaped)
  - **Granular layer:** Inner, dark, densely packed small granule cells
  - **White matter:** Core of each folium (lighter)
  - Show 3–4 folia (folds) in the inset
- **Fill:** `#F5E6A3` at 35% opacity
- **Clickable area:** The entire cerebellum inset

#### `id="choroid-plexus"` — Choroid Plexus
- **Location:** Within the lateral ventricles (the dark spaces in the center of each hemisphere)
- **Shape:** Frond-like/ cauliflower-like projections into the ventricular space
- **Histology:**
  - **Epithelium:** Single layer of cuboidal cells (choroid plexus epithelial cells) surrounding a core of loose connective tissue and blood vessels
  - Show 2–3 frond-like projections, each with a central blood vessel core and surrounding epithelial cells
  - The ventricular space (CSF) surrounds the projections
- **Fill:** `#F5E6A3` at 35% opacity
- **Clickable area:** The choroid plexus fronds

#### `id="brain-microglia"` — Brain Microglia
- **Location:** Distributed throughout the brain parenchyma (both cortex and white matter)
- **Shape:** Small, ramified (branching) cells scattered across the brain cross-section
- **Histology:**
  - Microglia are small cells with elongated nuclei and thin branching processes
  - Show 6–8 microglia distributed across the cortical ribbon and white matter
  - Each microglia: small dark oval nucleus (~4px) with 3–4 thin branching processes extending outward
  - These are NOT a separate anatomical region but a distributed cell population — the clickable area is a transparent overlay covering the entire brain cross-section
- **Fill:** `#F5E6A3` at 15% opacity (very light, since it overlaps with cortex)
- **Clickable area:** Transparent overlay covering the entire brain parenchyma
- **Implementation note:** This region overlaps with `cerebral-cortex`. Use `pointer-events: fill` on the cortex and place the microglia overlay behind it in z-order, OR use a separate interaction mechanism (e.g., a small "Microglia" button/label that activates the microglia view). The simplest approach: make microglia a separate labeled region in the white matter area (between the two cortical ribbons) where it doesn't overlap with the cortex clickable area.

---

## 3. spinal-cord.svg — Spinal Cord Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A transverse (axial) cross-section through the spinal cord at a mid-thoracic level, showing the characteristic butterfly-shaped gray matter surrounded by white matter, with the central canal in the middle.

### Regions

#### `id="spinal-cord-white-matter"` — White Matter
- **Location:** Outer region of the spinal cord cross-section, surrounding the gray matter
- **Shape:** Roughly circular outline (the cord's outer boundary) with the butterfly-shaped gray matter cut out of the center. The white matter forms three funiculi on each side: dorsal (posterior), lateral, and ventral (anterior).
- **Histology:**
  - Nerve fibers (myelinated axons) shown as a field of small circles (myelin sheaths) with central dots (axons)
  - Show a subtle texture of small circles (~2px diameter) filling the white matter area
  - Dorsal funiculi are slightly larger at thoracic levels
  - Show the dorsal median septum and ventral median fissure as thin lines dividing left and right
- **Fill:** `#F5E6A3` at 25% opacity
- **Clickable area:** The entire white matter region (outer ring minus gray matter butterfly)

#### `id="spinal-cord-gray-matter"` — Gray Matter
- **Location:** Central butterfly/H-shaped region
- **Shape:** Classic butterfly shape with:
  - **Dorsal horns** (posterior): Narrower, extending toward the dorsolateral surface
  - **Ventral horns** (anterior): Broader, extending toward the ventrolateral surface
  - **Central canal:** Small circle (~4px) at the center of the crossbar
  - **Gray commissure:** Thin bar connecting left and right halves, passing ventral to the central canal
- **Histology:**
  - Multipolar neurons (motor neurons) in the ventral horns: show 3–4 large cell bodies with multiple dendrites
  - Smaller interneurons scattered throughout
  - Ependymal cells lining the central canal: show a ring of small cuboidal cells around the central canal
  - Substantia gelatinosa (dorsal horn tip): slightly different shading
- **Fill:** `#F5E6A3` at 35% opacity (darker than white matter to show the gray/white distinction)
- **Clickable area:** The entire butterfly-shaped gray matter

### Structural Context
- Label "White Matter" and "Gray Matter" with leader lines
- Label "Dorsal Horn" and "Ventral Horn" on the gray matter
- Label "Central Canal" with an arrow
- Show the meninges (dura, arachnoid, pia) as thin concentric lines around the cord (decorative, not clickable)

---

## 4. peripheral-nerve.svg — Peripheral Nerve Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A transverse cross-section through a peripheral nerve (e.g., sciatic nerve), showing the multi-fascicular structure with epineurium, perineurium, and endoneurium layers.

### Regions

#### `id="peripheral-nerve-sheath"` — Nerve Sheath
- **Location:** The entire nerve cross-section
- **Shape:** Roughly circular/oval outline containing multiple fascicles (bundles of nerve fibers)
- **Histology:**
  - **Epineurium:** Outermost dense connective tissue layer surrounding the entire nerve — thick band (~8px) around the perimeter, containing fat cells and blood vessels
  - **Perineurium:** Thin concentric layer (~3px) surrounding each individual fascicle — show 4–6 fascicles, each surrounded by perineurium
  - **Endoneurium:** Delicate connective tissue within each fascicle, between individual nerve fibers
  - **Myelinated axons:** Within each fascicle, show 15–20 small circles (myelin sheaths) with central dots (axons). Myelin sheaths are clear/ring-like, axons are small dark dots.
  - **Schwann cell nuclei:** Occasional elongated nuclei at the periphery of myelin sheaths — show 2–3 per fascicle
  - **Non-myelinated fibers:** Small groups of small axons wrapped by a single Schwann cell (Remak bundle) — show 1–2 clusters
- **Fill:** `#F5E6A3` at 30% opacity
- **Clickable area:** The entire nerve cross-section (all sheath layers are one clickable region)

### Structural Context
- Label "Epineurium", "Perineurium", "Endoneurium" with leader lines
- Label "Myelinated Axon" and "Schwann Cell Nucleus" on representative structures
- Show a small blood vessel in the epineurium (decorative)

---

## 5. heart.svg — Heart Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A frontal (anterior) section through the heart showing the four chambers, valves, and myocardial wall. The focus is on the myocardium as the clickable microstructure.

### Regions

#### `id="myocardium"` — Myocardium
- **Location:** The muscular wall of the heart, surrounding all four chambers
- **Shape:** The heart is shown in frontal section with:
  - **Right atrium** (upper right): Thin-walled chamber
  - **Right ventricle** (lower right): Moderate wall thickness (~15px)
  - **Left atrium** (upper left): Thin-walled chamber
  - **Left ventricle** (lower left): Thick wall (~35px), forming the apex
  - **Interventricular septum:** Thick wall between the ventricles
  - **Valves:** Thin leaflet shapes at the AV junctions (tricuspid right, mitral left) and at the great vessel openings (pulmonary, aortic)
- **Histology:**
  - **Cardiomyocytes:** Show the myocardial wall texture as branching, anastomosing chains of rectangular cells with central nuclei and intercalated discs at cell junctions. At this scale, show the texture as a field of slightly elongated cells with periodic dark lines (intercalated discs).
  - **Cardiac macrophages:** Show 2–3 small irregular cells within the myocardial wall (smaller than cardiomyocytes, with darker nuclei)
  - **Endocardium:** Thin inner lining of the chambers (not separately clickable)
  - **Epicardium:** Thin outer lining (not separately clickable)
- **Fill:** `#E8A0A0` at 35% opacity
- **Clickable area:** The entire myocardial wall (all four chamber walls + septum)

### Structural Context
- Label chambers: "RA", "RV", "LA", "LV" (or full names)
- Label "Myocardium" with a bracket along the left ventricular wall
- Show the coronary arteries as two small vessels on the epicardial surface (decorative)
- Show the aorta and pulmonary artery exiting from their respective ventricles (decorative)

---

## 6. blood-vessels.svg — Blood Vessel Wall Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through a medium-sized muscular artery (e.g., femoral artery), showing the three concentric layers (tunicae) of the vessel wall. A small vein may be shown adjacent for comparison (decorative).

### Regions

#### `id="vessel-intima"` — Vessel Intima (Endothelium)
- **Location:** Innermost layer, lining the lumen
- **Shape:** Thin ring (~5–8px thick) immediately surrounding the circular lumen (the open space in the center)
- **Histology:**
  - **Endothelial cells:** Single layer of flat, elongated cells lining the lumen. Show as a thin continuous band with occasional elongated nuclei bulging into the lumen.
  - **Subendothelial layer:** Thin layer of loose connective tissue (barely visible at this scale)
  - **Internal elastic lamina (IEL):** Wavy bright line at the outer border of the intima — show as a scalloped/wavy line (~2px thick, slightly brighter than surrounding tissue)
- **Fill:** `#E8A0A0` at 30% opacity
- **Clickable area:** The intimal ring from the lumen to the IEL

#### `id="vessel-media"` — Vessel Media
- **Location:** Middle layer, between the internal and external elastic laminae
- **Shape:** Thick ring (~40–50px thick) surrounding the intima. This is the thickest layer in a muscular artery.
- **Histology:**
  - **Smooth muscle cells:** Circularly arranged (circumferential) — show as a field of elongated cells oriented perpendicular to the radius (wrapped around the vessel). At this scale, show 4–5 concentric rings of smooth muscle cell nuclei (elongated ovals).
  - **External elastic lamina (EEL):** Wavy line at the outer border of the media — thinner and less distinct than the IEL
  - Between the IEL and EEL, the media is the muscular layer
- **Fill:** `#E8A0A0` at 35% opacity
- **Clickable area:** The media ring from the IEL to the EEL

#### `id="vessel-adventitia"` — Vessel Adventitia
- **Location:** Outermost layer, surrounding the media
- **Shape:** Moderate ring (~20–25px thick) outside the EEL, blending with surrounding connective tissue
- **Histology:**
  - **Loose connective tissue:** Collagen fibers and elastic fibers, less organized than the media
  - **Vasa vasorum:** Small blood vessels (2–3 tiny circles) within the adventitia supplying the vessel wall
  - **Nervi vasorum:** Small nerve bundle (optional, decorative)
  - **Pericytes:** Show 2–3 small pericyte nuclei adjacent to the vasa vasorum capillaries
- **Fill:** `#E8A0A0` at 25% opacity (lighter than media, showing it's less dense)
- **Clickable area:** The adventitial ring from the EEL to the outer edge

### Structural Context
- Label "Lumen" in the center
- Label "Intima", "Media", "Adventitia" with brackets
- Label "IEL" and "EEL" on the elastic laminae
- Show a small vein adjacent (thinner wall, wider lumen, less organized layers) — decorative only

---

## 7. lung.svg — Lung Microanatomy

**ViewBox:** `0 0 600 400`

### Anatomical Description
A composite view showing both the bronchial tree and the alveolar region. The upper portion shows a cross-section through a bronchus; the lower portion shows the alveolar parenchyma at higher magnification. A dashed line or zoom indicator connects the two views.

### Regions

#### `id="bronchi"` — Bronchi
- **Location:** Upper ~45% of the SVG
- **Shape:** Cross-section through a medium-sized bronchus (circular/oval with a cartilaginous wall)
- **Histology:**
  - **Epithelium:** Pseudostratified ciliated columnar epithelium lining the lumen — show as a row of tall columnar cells with cilia at the apical surface (short hair-like projections), with basal nuclei at different heights (pseudostratified appearance). Include 2–3 goblet cells (lighter, wider cells with mucus droplets).
  - **Basement membrane:** Thin line below the epithelium
  - **Lamina propria:** Loose connective tissue below the basement membrane
  - **Smooth muscle:** Thin band of circular smooth muscle (~5px)
  - **Cartilage plates:** 3–4 C-shaped or irregular hyaline cartilage plates in the wall — show as areas with chondrocytes in lacunae (small circles within a pale matrix)
  - **Neuroendocrine cells:** Show 1–2 small cells at the base of the epithelium (neuroendocrine bodies) — smaller than surrounding epithelial cells, with granular cytoplasm
  - **Bronchial glands:** 1–2 seromucous glands in the submucosa (optional)
- **Fill:** `#D5E8F0` at 35% opacity
- **Clickable area:** The entire bronchial cross-section

#### `id="alveoli"` — Alveoli
- **Location:** Lower ~55% of the SVG
- **Shape:** A cluster of alveoli (air sacs) — show as a honeycomb-like network of thin-walled polyhedral spaces
- **Histology:**
  - **Alveolar walls (interalveolar septa):** Extremely thin walls (~2–3px) containing capillaries
  - **Type I pneumocytes:** Extremely thin, flattened cells covering ~95% of the alveolar surface — show as barely visible thin lines on the alveolar walls
  - **Type II pneumocytes:** Cuboidal cells, larger and more prominent, scattered among the Type I cells — show 3–4 cuboidal cells with lamellar bodies (small dots in cytoplasm) at the alveolar surface
  - **Alveolar macrophages (dust cells):** Show 2–3 large irregular cells within the alveolar spaces or crawling on the alveolar walls — larger than pneumocytes, with vacuolated cytoplasm (phagocytosed particles)
  - **Capillaries:** Show 4–5 small blood vessels within the interalveolar septa (tiny circles with red blood cells inside)
  - Show 8–12 alveolar spaces in a cluster
- **Fill:** `#D5E8F0` at 30% opacity
- **Clickable area:** The entire alveolar region

### Structural Context
- Label "Bronchus" and "Alveoli" on their respective regions
- A dashed line or magnifying glass icon connecting the bronchus to the alveolar region (indicating the bronchial tree continues to the alveoli)
- Label "Type I" and "Type II" pneumocytes and "Macrophage" on representative cells in the alveolar region
- Label "Cilia" and "Goblet cell" in the bronchial epithelium

---

## CSS Additions

No new CSS classes needed beyond the existing `.microstructure-region` hover styles from spec 15. However, verify:

1. Hover highlights work with the new canonical IDs (e.g., `#cerebral-cortex` instead of `#cortex`)
2. The brain microglia overlay doesn't block clicks on the cerebral cortex — use `pointer-events: none` on the microglia overlay and handle its click via a separate UI element (button or label)
3. The lung SVG's two-region layout (bronchi + alveoli) renders correctly with the existing CSS

## Accessibility
- Each SVG has `role="img"` and `aria-label`
- Each microstructure region has `tabindex="0"` and `aria-label` (e.g., `aria-label="Cerebral cortex - click to explore cell types"`)
- Focus outlines match hover highlights

## Edge Cases
- **Brain microglia overlap:** The microglia region overlaps with the cerebral cortex. Solution: place the microglia clickable area in the white matter region (between the cortical ribbons) where it doesn't conflict with the cortex. Add a small "Microglia" label in the white matter area.
- **Lung composite view:** The bronchi and alveoli are at different magnifications. Use a visual separator (dashed line or zoom indicator) to make this clear.
- **Skin layer boundaries:** The dermal-epidermal junction is wavy (rete ridges). Ensure the wavy boundary is shared between the epidermis and dermis `<path>` elements so there's no gap or overlap.

## Test Criteria
- [ ] All 7 SVGs render correctly with anatomically accurate proportions
- [ ] Each microstructure region is clickable and navigates to the correct cell type list
- [ ] SVG element IDs match canonical microstructure IDs (per spec 24)
- [ ] Hover highlights use the correct tissue system color
- [ ] Brain: cerebral cortex, cerebellum, choroid plexus, and microglia are all independently clickable
- [ ] Spinal cord: white matter and gray matter are distinct clickable regions
- [ ] Blood vessels: intima, media, and adventitia are three concentric clickable rings
- [ ] Lung: bronchi and alveoli are two distinct clickable regions
- [ ] Skin: epidermis, dermis, and hypodermis are three stacked clickable layers
- [ ] All SVGs are valid and render in Chrome, Firefox, Safari
- [ ] Illustrations look like textbook histology, not cartoons
