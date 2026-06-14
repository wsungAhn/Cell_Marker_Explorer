# Codex Spec: 28-microanatomy-batch-3

## Purpose
Redraw microanatomy SVGs for the lymphatic/immune, endocrine, musculoskeletal, reproductive, urinary, and sensory systems at textbook histology quality. Each SVG must accurately depict the organ's microanatomy with correctly proportioned tissue layers, cell arrangements, and regional boundaries.

## Dependencies
- `03-microanatomy-svgs.md` (original microanatomy spec)
- `24-microstructure-id-reconcile.md` (use canonical IDs, not svg_region_id)
- `15-css-styles.md` (microanatomy CSS, hover states)

## Output Files
- `svg/microanatomy/bone-marrow.svg`
- `svg/microanatomy/thymus.svg`
- `svg/microanatomy/spleen.svg`
- `svg/microanatomy/lymph-nodes.svg`
- `svg/microanatomy/thyroid.svg`
- `svg/microanatomy/adrenal.svg`
- `svg/microanatomy/skeletal-muscle.svg`
- `svg/microanatomy/bone.svg`
- `svg/microanatomy/ovary.svg`
- `svg/microanatomy/testis.svg`
- `svg/microanatomy/prostate.svg`
- `svg/microanatomy/kidney.svg`
- `svg/microanatomy/eye.svg`

## Quality Target
Same as specs 26–27: textbook histology illustration quality (Junqueira's Basic Histology / Alberts' Molecular Biology style). Clean vector lines, correct tissue proportions, labeled regions, no photorealism.

## Common SVG Structure
Same template as specs 26–27. ViewBox `0 0 600 400`, each organ uses its tissue system color at 25–40% opacity.

---

## 1. bone-marrow.svg — Bone Marrow Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the medullary cavity of a long bone, showing the hematopoietic (red) marrow with its mixed population of developing blood cells, adipocytes, and sinusoidal capillaries.

### Regions

#### `id="hematopoietic-niche"` — Hematopoietic Niche
- **Location:** The entire marrow cavity interior (central ~70% of the SVG)
- **Shape:** Irregular area bounded by the bone (cortical shell) on the outside. The marrow is a heterogeneous tissue with islands of hematopoietic cells interspersed with fat cells.
- **Histology:**
  - **Hematopoietic stem cells (HSCs):** Rare, located near the endosteal surface (inner bone wall) and near sinusoids — show 2–3 small, undifferentiated cells with large nuclei and scant cytoplasm, positioned near the bone surface and near capillary walls
  - **Myeloid lineage cells (developing neutrophils, eosinophils, basophils):** Show clusters of cells at various stages of maturation:
    - **Myeloblasts → promyelocytes → myelocytes → metamyelocytes → band cells → segmented neutrophils:** Show a gradient from large immature cells (large nucleus, prominent nucleolus) to smaller mature cells with segmented/lobed nuclei. Show 4–5 cells in this progression.
    - **Eosinophil lineage:** Show 2–3 cells with bilobed nuclei and bright eosinophilic granules (large pink/red dots in cytoplasm)
    - **Basophil lineage:** Show 1–2 cells with bilobed nuclei and large basophilic granules (large blue/purple dots)
  - **Monocyte lineage:** Show 1–2 large cells with kidney-shaped nuclei and pale cytoplasm (monoblasts → promonocytes → monocytes)
  - **Mast cells:** Show 1–2 oval cells filled with dense purple granules (metachromatic staining)
  - **Sinusoidal capillaries:** 3–4 thin-walled, irregular vascular channels — show as channels with thin endothelial walls and blood cells within
  - **Adipocytes:** 4–6 large, round, signet-ring cells (large clear lipid droplet with thin peripheral cytoplasm) interspersed among the hematopoietic islands
  - **Megakaryocytes:** 1–2 very large cells (~20px diameter) with multilobed nuclei, positioned near sinusoids — these are the largest cells in the marrow
  - **Endosteal surface:** The inner bone surface lining the cavity — thin layer of osteoblasts (decorative)
- **Fill:** `#C8D5E0` at 30% opacity
- **Clickable area:** The entire marrow cavity

### Structural Context
- **Cortical bone:** Thick band (~20px) around the perimeter — dense bone with osteons (Haversian systems) shown as concentric rings with central canals
- **Endosteum:** Thin cellular layer on the inner bone surface
- Labels: "Hematopoietic island", "Sinusoid", "Adipocyte", "Megakaryocyte"
- Label "Cortical bone" on the outer shell

---

## 2. thymus.svg — Thymus Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through a thymic lobule showing the dark-staining cortex (dense with immature T cells) and the pale-staining medulla (fewer cells, more mature), separated by the corticomedullary junction. Hassall's corpuscles are a distinctive feature of the medulla.

### Regions

#### `id="thymic-cortex"` — Thymic Cortex
- **Location:** Outer region of the lobule (upper ~55% of the SVG)
- **Shape:** The cortex forms a dense, dark-staining outer zone surrounding the paler medulla. In cross-section, the cortex appears as a thick rim around the medulla.
- **Histology:**
  - **Dense lymphocyte population:** The cortex is packed with immature T cells (thymocytes) — show as a dense field of small, darkly staining lymphocytes (small circles with dark nuclei, ~3px each). The density should be noticeably higher than the medulla.
  - **DN thymocytes (double-negative):** Early thymocytes in the subcapsular zone (outermost cortex) — show as a band of slightly larger cells at the very outer edge
  - **DP thymocytes (double-positive):** The vast majority of cortical thymocytes — show as the dense field of small lymphocytes throughout the cortex
  - **Cortical thymic epithelial cells (cTECs):** Scattered pale-staining cells with large nuclei and eosinophilic cytoplasm, acting as "nurse cells" — show 3–4 larger, paler cells among the dense lymphocytes, some with clusters of lymphocytes attached (thymic nurse cells)
  - **Macrophages:** Scattered throughout, often containing apoptotic debris (tingible body macrophages) — show 2–3 cells with phagocytosed debris (dark inclusions)
- **Fill:** `#C8D5E0` at 35% opacity
- **Clickable area:** The entire cortical region

#### `id="thymic-medulla"` — Thymic Medulla
- **Location:** Inner region of the lobule (lower ~45% of the SVG)
- **Shape:** The medulla is a paler, less dense central area. It may appear as a continuous central region connecting adjacent lobules.
- **Histology:**
  - **Sparse lymphocyte population:** Fewer lymphocytes than the cortex — show as a less dense field of small cells with more space between them
  - **Medullary thymic epithelial cells (mTECs):** More prominent than cTECs, with pale eosinophilic cytoplasm — show 4–5 larger cells scattered throughout
  - **Thymic tuft cells:** Rare chemosensory cells within the medulla — show 1–2 small cells with an apical tuft of microvilli (bundle of thin lines), positioned among the mTECs
  - **Hassall's corpuscles:** 2–3 distinctive concentric lamellated structures — each is a cluster of flattened epithelial cells arranged in concentric layers (like an onion), with a central hyalinized/eosinophilic core. These are pathognomonic for the thymus. Show each corpuscle as 3–4 concentric rings with a bright center, ~15–20px diameter.
  - **Dendritic cells:** Scattered antigen-presenting cells (optional, decorative)
- **Fill:** `#C8D5E0` at 25% opacity (lighter than cortex, reflecting the pale staining)
- **Clickable area:** The entire medullary region

### Structural Context
- **Capsule:** Thin connective tissue layer around the lobule
- **Trabeculae:** Thin connective tissue septa dividing the lobule (decorative)
- **Corticomedullary junction:** The boundary between cortex and medulla — show as a subtle boundary line
- Labels: "Cortex", "Medulla", "Hassall's corpuscle"
- Label "Thymic epithelial cell" and "Tuft cell" with leader lines

---

## 3. spleen.svg — Spleen Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the spleen showing the white pulp (lymphoid tissue) and red pulp (blood-filled sinusoids and cords). The white pulp appears as pale islands surrounded by the dark red pulp.

### Regions

#### `id="white-pulp"` — White Pulp
- **Location:** 1–2 circular/oval islands of lymphoid tissue within the splenic parenchyma
- **Shape:** Each white pulp area is organized around a central arteriole (central artery) and consists of:
  - **Periarteriolar lymphoid sheath (PALS):** T-cell zone surrounding the central arteriole — show as a cuff of small lymphocytes around a small artery
  - **Lymphoid follicle:** B-cell zone, often eccentric to the PALS — show as a rounded cluster of lymphocytes, potentially with a germinal center (paler center with larger cells)
  - **Marginal zone:** Transition zone between white pulp and red pulp — show as a lighter ring around the white pulp with macrophages and marginal zone B cells
- **Histology:**
  - **Splenic macrophages:** Show 2–3 macrophages in the marginal zone — larger cells with irregular shape and phagocytic inclusions
  - **Central arteriole:** Small thick-walled artery at the center of the PALS — show as a small vessel with a muscular wall
  - **Follicular dendritic cells:** Within the germinal center (if shown) — subtle network of pale cells
- **Fill:** `#C8D5E0` at 35% opacity
- **Clickable area:** The entire white pulp island (PALS + follicle + marginal zone)

### Structural Context (not clickable)
- **Red pulp:** The surrounding tissue filling most of the SVG — consists of splenic cords (Billroth's cords, cords of tissue with macrophages and blood cells) and splenic sinusoids (venous channels). Show as a field of blood-filled spaces (sinusoids) and cords between them.
- **Capsule and trabeculae:** Connective tissue framework (decorative)
- Labels: "White pulp", "Red pulp", "PALS", "Follicle", "Marginal zone", "Central artery"

---

## 4. lymph-nodes.svg — Lymph Node Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through a lymph node showing the cortex (with follicles), paracortex (T-cell zone), and medulla (with medullary cords and sinuses). The germinal centers of the follicles are the clickable region.

### Regions

#### `id="germinal-center"` — Germinal Center
- **Location:** The pale centers of 2–3 lymphoid follicles in the outer cortex
- **Shape:** Each germinal center is a circular/oval area (~40–50px diameter) within a darker follicle (the mantle zone). The germinal center is where B-cell proliferation and selection occur.
- **Histology:**
  - **Centroblasts:** Large, proliferating B cells in the dark zone (one pole of the germinal center) — show as larger cells with large pale nuclei and prominent nucleoli, densely packed
  - **Centrocytes:** Smaller B cells in the light zone (opposite pole) — show as smaller cells with irregular nuclei
  - **T follicular helper (Tfh) cells:** Scattered T cells within the germinal center — show 2–3 smaller cells with dark nuclei among the B cells
  - **T follicular regulatory (Tfr) cells:** Regulatory T cells within the germinal center — show 1–2 cells similar to Tfh but fewer
  - **Follicular dendritic cells (FDCs):** Pale cells with dendritic processes, forming a network — show 2–3 cells with thin branching extensions, retaining antigen-antibody complexes on their surface
  - **Tingible body macrophages:** Macrophages containing apoptotic debris — show 1–2 cells with dark inclusions (phagocytosed nuclei)
  - **Mantle zone:** Ring of small, dark lymphocytes (naive B cells) surrounding the germinal center — not separately clickable but shown as the darker ring around the pale center
- **Fill:** `#C8D5E0` at 30% opacity
- **Clickable area:** The germinal center areas (the pale centers of the follicles)

### Structural Context (not clickable)
- **Cortex:** Outer region containing the follicles
- **Paracortex:** T-cell zone below the cortex — show as a region of diffuse lymphocytes without follicular organization
- **Medulla:** Inner region with medullary cords (lymphocyte-containing tissue) and medullary sinuses (lymph-filled channels)
- **Capsule, subcapsular sinus, trabeculae:** Structural framework
- **Afferent lymphatics:** Vessels entering the capsule (decorative)
- **Hilum:** Region where blood vessels and efferent lymphatics exit (decorative)
- Labels: "Germinal center", "Mantle zone", "Paracortex", "Medulla", "Subcapsular sinus"

---

## 5. thyroid.svg — Thyroid Gland Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the thyroid gland showing the characteristic follicular architecture — numerous spherical follicles of varying size filled with colloid, lined by follicular epithelial cells (thyrocytes).

### Regions

#### `id="thyroid-follicle"` — Thyroid Follicle
- **Location:** The entire thyroid parenchyma — a field of follicles filling the SVG
- **Shape:** 8–12 spherical/oval follicles of varying size (20–50px diameter). Each follicle consists of a ring of epithelial cells surrounding a central lumen filled with colloid (thyroglobulin).
- **Histology:**
  - **Thyrocytes (follicular cells):** Simple cuboidal epithelium lining each follicle — show as a single layer of cuboidal cells (roughly square-shaped) surrounding the colloid. In active glands, the cells are taller (columnar); in inactive glands, they are flatter (squamous). Show them as cuboidal (intermediate activity).
  - **Colloid:** Homogeneous eosinophilic (pink) material filling the follicle lumen — show as a solid pale pink fill inside each follicle. The colloid represents stored thyroglobulin.
  - **Reabsorption vacuoles:** Small scalloped areas at the colloid-periphery — show 2–3 small notches at the edge of the colloid in some follicles, indicating active hormone reabsorption
  - **Parafollicular cells (C cells):** Occasional larger, pale-staining cells between or embedded in the follicle wall — show 2–3 C cells as larger, paler cells outside the follicular epithelium. These secrete calcitonin (decorative, not a separate clickable region).
  - **Capillaries:** Small blood vessels in the interfollicular connective tissue — show 3–4 tiny vessels between follicles
- **Fill:** `#E0C8E8` at 35% opacity
- **Clickable area:** The entire field of follicles (all follicles + interfollicular tissue)

### Structural Context
- **Interfollicular connective tissue:** Thin septa between follicles containing capillaries
- **Capsule:** Thin connective tissue around the gland (decorative)
- Labels: "Follicle", "Colloid", "Thyrocyte", "C cell"
- Label "Reabsorption vacuole" on a scalloped colloid edge

---

## 6. adrenal.svg — Adrenal Gland Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the adrenal gland showing the outer cortex (three zones) and inner medulla. The cortex is lipid-rich and yellow in life; the medulla is chromaffin tissue. This is a classic concentric-layer histology diagram.

### Regions

#### `id="adrenal-cortex"` — Adrenal Cortex
- **Location:** Outer ~65% of the gland cross-section (three concentric zones)
- **Shape:** The cortex forms three concentric zones around the medulla, like the layers of an onion:
  - **Zona glomerulosa** (outermost): Thin (~15px), just below the capsule. Cells arranged in arc-like clusters (glomeruli = little balls).
  - **Zona fasciculata** (middle): Thickest zone (~50px). Cells arranged in parallel cords (fascicles = bundles) radiating toward the medulla. These are the largest cortical cells with vacuolated (lipid-rich) "spongiocyte" cytoplasm.
  - **Zona reticularis** (innermost): Thin (~15px), adjacent to the medulla. Cells arranged in a network (reticulum = net) of anastomosing cords.
- **Histology:**
  - **Zona glomerulosa cells:** Small, round cells with round nuclei and moderate eosinophilic cytoplasm, arranged in ovoid clusters. Show 4–5 clusters of 3–4 cells each.
  - **Zona fasciculata cells:** Large, pale cells (spongiocytes) with vacuolated cytoplasm (lipid droplets) and central nuclei — show as two parallel columns of large pale cells with clear cytoplasm. These are the most distinctive cells — very pale due to lipid extraction during processing.
  - **Zona reticularis cells:** Smaller cells with darker, more eosinophilic cytoplasm and some lipofuscin granules — show as a network of smaller, darker cells. Some cells have pyknotic (condensed) nuclei.
  - **Sinusoidal capillaries:** Between the cell cords — show as thin channels running between the fascicles
- **Fill:** `#E0C8E8` at 35% opacity
- **Clickable area:** The entire cortical region (all three zones)

#### `id="adrenal-medulla"` — Adrenal Medulla
- **Location:** Inner ~35% of the gland cross-section (central core)
- **Shape:** The medulla forms the central core of the gland, surrounded by the zona reticularis. It has an irregular boundary with the cortex.
- **Histology:**
  - **Chromaffin cells:** Large, polygonal cells arranged in nests/cords — show as a cluster of 10–15 large cells with basophilic (purple/brown after chromaffin reaction) cytoplasm and round/oval nuclei. These cells secrete epinephrine and norepinephrine.
  - **Two chromaffin cell types:** Some cells are larger with more vacuolated cytoplasm (epinephrine-secreting), others are smaller with more granular cytoplasm (norepinephrine-secreting) — show a mix of both types
  - **Venous sinusoids:** Large, irregular vascular channels — show 2–3 large thin-walled vessels among the chromaffin cells
  - **Ganglion cells:** Occasional large neurons (optional, decorative) — show 1 large cell with prominent nucleolus
- **Fill:** `#E0C8E8` at 25% opacity (lighter than cortex, medulla stains differently)
- **Clickable area:** The entire medullary region

### Structural Context
- **Capsule:** Thin connective tissue around the gland
- **Central vein:** Large vein in the medulla (decorative)
- Labels: "Zona glomerulosa", "Zona fasciculata", "Zona reticularis", "Medulla"
- Label "Chromaffin cell" and "Spongiocyte" with leader lines

---

## 7. skeletal-muscle.svg — Skeletal Muscle Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A composite view showing skeletal muscle in both cross-section (upper portion) and longitudinal section (lower portion) to illustrate the striated appearance and fiber organization.

### Regions

#### `id="muscle-fiber"` — Muscle Fiber
- **Location:** The entire muscle tissue area (both cross-section and longitudinal views)
- **Shape:**
  - **Cross-section (upper half):** Multiple polygonal fibers (muscle cells) packed together, each surrounded by a thin connective tissue layer (endomysium). Show 8–12 polygonal fibers in cross-section, each ~30–40px diameter.
  - **Longitudinal section (lower half):** Parallel elongated fibers with visible striations (alternating A bands and I bands). Show 4–5 parallel fibers running horizontally.
- **Histology:**
  - **Cross-section features:**
    - Each fiber is a polygonal shape (not round — they're packed tightly)
    - Multiple peripheral nuclei (2–3 per fiber) pressed against the sarcolemma (cell membrane) — show as small dark ovals at the periphery of each fiber
    - Dot-like myofibrils in cross-section (punctate pattern within each fiber) — show as a field of tiny dots within each fiber
    - Endomysium: thin connective tissue between fibers
    - Capillaries: 1–2 small blood vessels between fibers
  - **Longitudinal section features:**
    - Striation pattern: alternating dark (A band) and light (I band) stripes across each fiber — show as regular alternating bands perpendicular to the fiber length
    - Z lines (Z discs): Thin dark lines at the center of each I band
    - Peripheral nuclei: elongated nuclei at the edges of the fibers
    - **Myocytes (skeletal muscle fibers):** The main contractile cells — very long, multinucleated, striated
    - **Satellite cells:** Small, flattened cells with a single nucleus, located between the sarcolemma and the basal lamina — show 2–3 satellite cells as small, dark, crescent-shaped cells pressed against the outside of fiber membranes. These are the muscle stem cells.
- **Fill:** `#D5C8B8` at 35% opacity
- **Clickable area:** The entire muscle tissue area (both views)

### Structural Context
- **Perimysium:** Thicker connective tissue dividing fibers into fascicles (decorative)
- **Epimysium:** Outer connective tissue around the whole muscle (decorative)
- Labels: "Cross-section", "Longitudinal section"
- Label "Muscle fiber", "Nucleus (peripheral)", "Satellite cell", "Striations"
- A dashed line or label indicating the two viewing planes

---

## 8. bone.svg — Bone Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through a long bone showing the cortical bone (compact bone with osteons) and the medullary cavity (bone marrow). The focus is on the bone marrow cavity as the clickable region, with the surrounding bone architecture shown for context.

### Regions

#### `id="bone-marrow-cavity"` — Bone Marrow Cavity
- **Location:** The central medullary cavity (inner ~50% of the SVG)
- **Shape:** The marrow cavity is bounded by the endosteal surface of the cortical bone. It contains hematopoietic tissue and adipocytes.
- **Histology:**
  - **Mesenchymal stem cells (MSCs):** Rare, spindle-shaped cells in the marrow stroma — show 2–3 small elongated cells near the endosteal surface and near blood vessels
  - **Osteoblasts:** Lining the endosteal surface (inner bone surface) — show as a row of cuboidal/columnar cells along the inner bone wall, with basophilic cytoplasm. These are bone-forming cells.
  - **Osteoclasts:** Large multinucleated cells on the bone surface (in Howship's lacunae/resorption bays) — show 1–2 very large cells (~15px) with 3–4 nuclei each, positioned in shallow depressions on the endosteal surface. These are bone-resorbing cells.
  - **Hematopoietic cells:** Scattered developing blood cells (decorative, similar to bone-marrow.svg)
  - **Sinusoids:** Thin-walled vascular channels (decorative)
  - **Adipocytes:** Large clear fat cells (decorative)
- **Fill:** `#D5C8B8` at 30% opacity
- **Clickable area:** The entire marrow cavity

### Structural Context (not clickable)
- **Cortical bone:** Thick band (~25px) around the perimeter showing osteon (Haversian system) architecture:
  - **Osteons:** 3–4 circular structures, each with concentric lamellae (rings) around a central Haversian canal (small circle with blood vessel inside)
  - **Interstitial lamellae:** Fragments of old osteons between current ones
  - **Volkmann's canals:** Horizontal channels connecting Haversian canals (optional)
  - **Outer/inner circumferential lamellae:** Layers at the periosteal and endosteal surfaces
- **Periosteum:** Thin layer on the outer bone surface
- **Endosteum:** Thin layer on the inner bone surface (where osteoblasts/osteoclasts sit)
- Labels: "Cortical bone", "Osteon", "Haversian canal", "Marrow cavity"
- Label "Osteoblast", "Osteoclast", "MSC" with leader lines

---

## 9. ovary.svg — Ovary Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the ovary showing the cortex with follicles at various stages of development (primordial, primary, secondary, mature/Graafian) and the medulla with blood vessels. The ovarian follicle is the clickable region.

### Regions

#### `id="ovarian-follicle"` — Ovarian Follicle
- **Location:** The ovarian cortex (outer ~60% of the SVG), containing follicles at various stages
- **Shape:** Show 3–4 follicles at different stages:
  - **Primordial follicles:** Very small (~5px), numerous, at the outer cortex — show as a cluster of 6–8 tiny circles, each with a single flat cell surrounding a small oocyte
  - **Primary follicle:** Medium (~25px), with a single layer of cuboidal granulosa cells around the oocyte — show 1 primary follicle with the oocyte (large central cell with large nucleus) surrounded by a single ring of cuboidal granulosa cells, with the zona pellucida (pink band) between the oocyte and granulosa cells
  - **Secondary (antral) follicle:** Large (~50px), with multiple layers of granulosa cells and a fluid-filled antrum — show 1 secondary follicle with:
    - Oocyte at one pole (eccentric)
    - Cumulus oophorus (mound of granulosa cells supporting the oocyte)
    - Antrum (large fluid-filled space, shown as a clear area)
    - Multiple layers of granulosa cells surrounding the antrum
    - Theca interna (inner layer of steroidogenic cells, outside the granulosa)
    - Theca externa (outer connective tissue layer)
  - **Corpus luteum** (optional): Large structure replacing a ruptured follicle — show as a large (~60px) structure with luteinized granulosa cells (large, eosinophilic) and theca lutein cells (smaller, less eosinophilic)
- **Histology:**
  - **Granulosa cells:** Cuboidal/columnar cells surrounding the oocyte and lining the antrum — show with round nuclei and pale cytoplasm
  - **Large luteal cells:** (In corpus luteum) Large, polygonal cells with abundant eosinophilic cytoplasm — show 4–5 large pale cells if corpus luteum is included
  - **Germ cells (oocytes):** Large central cells with prominent nuclei and nucleoli — show in each follicle
  - **Zona pellucida:** Pink band between oocyte and granulosa cells in primary/secondary follicles
- **Fill:** `#F0C8D8` at 35% opacity
- **Clickable area:** The entire follicle-containing cortex (all follicles at all stages)

### Structural Context
- **Ovarian medulla:** Inner region with large blood vessels and connective tissue (decorative)
- **Tunica albuginea:** Thin fibrous layer under the surface epithelium (decorative)
- **Surface epithelium (germinal epithelium):** Single layer of flat/cuboidal cells on the surface (decorative)
- Labels: "Primordial follicle", "Primary follicle", "Secondary follicle", "Granulosa cells", "Oocyte", "Antrum", "Theca"

---

## 10. testis.svg — Testis Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the testis showing the seminiferous tubules (the site of spermatogenesis) and the interstitial tissue (containing Leydig cells).

### Regions

#### `id="seminiferous-tubule"` — Seminiferous Tubule
- **Location:** The bulk of the testis parenchyma — show 2–3 cross-sectioned seminiferous tubules
- **Shape:** Each tubule is a circular/oval cross-section (~80–100px diameter) with a thick wall of germ cells in various stages of development, surrounding a central lumen.
- **Histology:**
  - **Sertoli cells:** Tall columnar "nurse" cells extending from the basement membrane to the lumen — show 2–3 Sertoli cells per tubule as large, irregular cells with pale cytoplasm and large oval nuclei with prominent nucleoli, spanning the full thickness of the germinal epithelium. Their cytoplasm envelops the developing germ cells.
  - **Germ cells (spermatogenic lineage):** Arranged in layers from the basement membrane to the lumen:
    - **Spermatogonia:** Basal cells on the basement membrane — small round cells with dark nuclei
    - **Primary spermatocytes:** Large cells with large nuclei (often in meiotic prophase) — show 2–3 large cells in the mid-layer
    - **Secondary spermatocytes:** Smaller, transient (rarely seen in section) — optional
    - **Spermatids:** Small cells near the lumen, in various stages of maturation — show as a cluster of small cells with condensing nuclei
    - **Spermatozoa:** In the lumen — show as small flagellated structures in the tubule lumen
  - **Basement membrane:** Thin band around each tubule
  - **Myoid cells (peritubular):** Flat contractile cells outside the basement membrane (decorative)
- **Fill:** `#F0C8D8` at 35% opacity
- **Clickable area:** The entire seminiferous tubule cross-sections

### Structural Context
- **Interstitial tissue:** Between the tubules, containing Leydig cells (large eosinophilic cells with Reinke crystals — optional) and blood vessels
- **Tunica albuginea:** Thick fibrous capsule around the testis (decorative)
- Labels: "Seminiferous tubule", "Sertoli cell", "Spermatogonia", "Spermatocyte", "Spermatids", "Lumen"
- Label "Leydig cells" in the interstitial tissue

---

## 11. prostate.svg — Prostate Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the prostate gland showing the complex glandular architecture with prostatic glands of varying size and shape, embedded in a fibromuscular stroma.

### Regions

#### `id="prostate-epithelium"` — Prostate Epithelium
- **Location:** The epithelial lining of the prostatic glands throughout the gland
- **Shape:** Show 4–6 glands of varying shape — some are small and round, others are large and irregular with papillary infoldings (characteristic of the prostate). The glands are embedded in a dense fibromuscular stroma.
- **Histology:**
  - **Prostatic epithelial cells:** Two cell types lining each gland:
    - **Secretory (luminal) cells:** Tall columnar cells lining the gland lumen — show as a row of columnar cells with pale, vacuolated cytoplasm and basally located nuclei. These are the predominant cell type.
    - **Basal cells:** Small, flat cells along the basement membrane — show as a row of small, dark cells beneath the secretory cells. The presence of a basal cell layer distinguishes benign from malignant glands.
  - **Prostatic concretions (corpora amylacea):** 1–2 round, laminated, eosinophilic structures in the gland lumens — these are a distinctive feature of the aging prostate. Show as concentrically laminated circles (~10–15px) in some gland lumens.
  - **Gland lumens:** Variable — some contain prostatic secretions (pale eosinophilic material)
- **Fill:** `#F0C8D8` at 35% opacity
- **Clickable area:** The glandular epithelium throughout the prostate (all glands)

### Structural Context
- **Fibromuscular stroma:** Dense connective tissue with smooth muscle bundles between the glands — this is a distinctive feature of the prostate (more smooth muscle than other glands). Show as bands of smooth muscle between glands.
- **Capsule:** Fibrous capsule around the prostate (decorative)
- **Prostatic urethra:** Midline channel (optional, decorative)
- Labels: "Gland", "Secretory cells", "Basal cells", "Stroma", "Corpora amylacea"

---

## 12. kidney.svg — Kidney Microanatomy

**ViewBox:** `0 0 600 400`

### Anatomical Description
A composite view showing the renal cortex with glomeruli and tubules. The upper portion shows a glomerulus at higher magnification; the lower portion shows the tubular architecture.

### Regions

#### `id="glomerulus"` — Glomerulus
- **Location:** Upper ~50% of the SVG, showing 1–2 glomeruli at higher magnification
- **Shape:** Each glomerulus is a spherical structure (~60–80px diameter) consisting of a tuft of capillaries surrounded by Bowman's capsule.
- **Histology:**
  - **Bowman's capsule:** Double-walled structure:
    - **Parietal layer:** Simple squamous epithelium forming the outer wall — thin flat cells
    - **Visceral layer (podocytes):** Complex epithelial cells with foot processes wrapping around the capillaries — show 3–4 podocyte cell bodies (large, pale nuclei) perched on the outside of the capillary tuft, with primary processes extending down to the capillary surface. At this scale, the foot processes are too small to see individually, but show the podocyte cell bodies prominently.
    - **Bowman's space (urinary space):** Clear space between the parietal and visceral layers
  - **Capillary loops:** 6–8 capillary loops within the glomerular tuft — show as thin-walled vessels with red blood cells inside, forming the lobulated tuft
  - **Mesangial cells:** 2–3 cells within the capillary tuft, between the capillary loops — show as smaller cells with darker nuclei, providing structural support. Mesangial matrix surrounds these cells.
  - **Afferent arteriole:** Small vessel entering the glomerulus at the vascular pole (decorative)
  - **Efferent arteriole:** Small vessel exiting at the vascular pole (decorative)
- **Fill:** `#E8D5A0` at 35% opacity
- **Clickable area:** The entire glomerulus (capillary tuft + Bowman's capsule)

#### `id="nephron-tubules"` — Nephron Tubules
- **Location:** Lower ~50% of the SVG, showing the tubular architecture of the cortex
- **Shape:** Cross-sections and longitudinal sections of proximal and distal tubules
- **Histology:**
  - **Proximal convoluted tubules (PCT):** Show 3–4 cross-sections — each is a round/oval structure with:
    - Tall cuboidal epithelial cells with eosinophilic (pink) cytoplasm
    - Prominent brush border at the apical surface (dense microvilli, shown as a fuzzy/thick line at the lumen border)
    - Basal striations (mitochondria, shown as vertical lines at the base of cells)
    - Round basal nuclei
    - Small, irregular lumen (often appears collapsed)
    - These are the most abundant tubules in the cortex
  - **Distal convoluted tubules (DCT):** Show 2–3 cross-sections — each is a round/oval structure with:
    - Shorter cuboidal cells with less eosinophilic (paler) cytoplasm
    - NO brush border (smooth apical surface — key distinction from PCT)
    - Fewer basal striations
    - More nuclei visible per cross-section (cells are smaller, so more fit around the lumen)
    - Larger, more open lumen than PCT
  - **Collecting ducts:** Show 1–2 cross-sections — tall columnar cells with pale cytoplasm and distinct cell borders (decorative)
  - **Peritubular capillaries:** Small blood vessels between the tubules (decorative)
- **Fill:** `#E8D5A0` at 30% opacity
- **Clickable area:** The entire tubular region (all PCT + DCT cross-sections)

### Structural Context
- **Renal interstitium:** Thin connective tissue between tubules
- Labels: "Glomerulus", "Bowman's space", "Podocyte", "Mesangial cell"
- Labels: "Proximal tubule", "Distal tubule" with distinguishing features noted
- Label "Brush border" on the PCT and "No brush border" on the DCT

---

## 13. eye.svg — Eye Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A horizontal cross-section through the eyeball showing the three layers (fibrous, vascular, neural) and the optical structures. The retina is the clickable microstructure.

### Regions

#### `id="retina"` — Retina
- **Location:** The inner neural layer lining the posterior 2/3 of the eyeball
- **Shape:** A thin (~15px) layer following the inner contour of the eyeball. The retina is shown in a small inset at higher magnification to reveal its layered structure.
- **Histology (inset, ~200×150px):**
  - **Retinal layers (from outside to inside):**
    1. **Retinal pigment epithelium (RPE):** Single layer of cuboidal cells with melanin granules — show as a row of dark cells at the outer edge
    2. **Photoreceptor layer (rods and cones):** Outer segments and inner segments — show as a dense field of thin vertical lines (rods, more numerous) and thicker lines (cones, fewer)
    3. **Outer nuclear layer:** Nuclei of photoreceptors — show as a dense band of small dark nuclei
    4. **Outer plexiform layer:** Synaptic connections — show as a thin pale band
    5. **Inner nuclear layer:** Nuclei of bipolar, horizontal, and amacrine cells — show as a band of medium-sized nuclei
    6. **Inner plexiform layer:** Synaptic connections — show as a thicker pale band
    7. **Ganglion cell layer:** Cell bodies of retinal ganglion cells — show as a row of large neurons with prominent nuclei and nucleoli
    8. **Nerve fiber layer:** Axons of ganglion cells converging toward the optic disc — show as thin lines running along the inner surface
    9. **Inner limiting membrane:** Thin boundary with the vitreous (decorative)
  - **Retinal ganglion cells:** The key cell type — show 2–3 large ganglion cells in layer 7 with large round nuclei, prominent nucleoli, and Nissl substance (granular cytoplasm)
- **Fill:** `#C8E8D8` at 35% opacity
- **Clickable area:** The entire retinal layer (both in the eyeball view and the inset)

### Structural Context (not clickable)
- **Eyeball cross-section:**
  - **Sclera:** Thick white outer coat (fibrous layer)
  - **Choroid:** Vascular layer between sclera and retina — show as a thin pigmented layer
  - **Cornea:** Transparent front window (decorative)
  - **Iris and lens:** Anterior structures (decorative)
  - **Vitreous body:** Clear gel filling the eyeball (decorative)
  - **Optic nerve:** Exiting at the posterior pole (decorative)
- **Inset:** Higher magnification of the retinal layers with labels
- Labels on eyeball: "Sclera", "Choroid", "Retina", "Lens", "Optic nerve"
- Labels on inset: "RPE", "Photoreceptors", "Outer nuclear", "Inner nuclear", "Ganglion cell layer", "Nerve fiber layer"

---

## CSS Considerations
Same as specs 26–27. Verify hover highlights work with canonical IDs:
- `#thymic-cortex` (not `#cortex`)
- `#thymic-medulla` (not `#medulla`)
- `#thyroid-follicle` (not `#follicle`)
- `#adrenal-cortex` (not `#cortex`)
- `#adrenal-medulla` (not `#medulla`)
- `#bone-marrow-cavity` (not `#marrow-cavity`)
- `#ovarian-follicle` (not `#follicle`)
- `#nephron-tubules` (not `#tubules`)

## Accessibility
Same as specs 26–27. Each SVG has `role="img"`, `aria-label`, and each region has `tabindex="0"` and `aria-label`.

## Edge Cases
- **Adrenal cortex/medulla overlap:** The cortex surrounds the medulla concentrically. Ensure the boundary between zona reticularis and medulla is clean with no gap.
- **Thymus cortex/medulla boundary:** The corticomedullary junction should be a clear boundary line.
- **Kidney glomerulus/tubules:** These are in different parts of the SVG (glomeruli upper, tubules lower). No overlap.
- **Eye retina:** The retina is a thin layer in the eyeball view but shown in detail in the inset. Both should be clickable and navigate to the same cell type list.

## Test Criteria
- [ ] All 13 SVGs render correctly with anatomically accurate proportions
- [ ] Each microstructure region is clickable and navigates to the correct cell type list
- [ ] SVG element IDs match canonical microstructure IDs (per spec 24)
- [ ] Thymus: cortex and medulla are two distinct clickable regions
- [ ] Adrenal: cortex (3 zones) and medulla are two distinct clickable regions
- [ ] Kidney: glomerulus and nephron tubules are two distinct clickable regions
- [ ] Ovary: follicles at multiple stages are shown in the cortex
- [ ] Testis: seminiferous tubule cross-sections show the germ cell hierarchy
- [ ] Eye: retina is clickable both in the eyeball view and the inset
- [ ] Hover highlights use the correct tissue system colors
- [ ] All SVGs are valid and render in Chrome, Firefox, Safari
- [ ] Illustrations look like textbook histology, not cartoons
