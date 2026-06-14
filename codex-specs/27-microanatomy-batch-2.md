# Codex Spec: 27-microanatomy-batch-2

## Purpose
Redraw microanatomy SVGs for the digestive system organs (stomach, small intestine, large intestine, liver, pancreas) at textbook histology quality. Each SVG must accurately depict the organ's microanatomy with correctly proportioned tissue layers, glandular structures, and regional boundaries.

## Dependencies
- `03-microanatomy-svgs.md` (original microanatomy spec)
- `24-microstructure-id-reconcile.md` (use canonical IDs, not svg_region_id)
- `15-css-styles.md` (microanatomy CSS, hover states)

## Output Files
- `svg/microanatomy/stomach.svg`
- `svg/microanatomy/small-intestine.svg`
- `svg/microanatomy/large-intestine.svg`
- `svg/microanatomy/liver.svg`
- `svg/microanatomy/pancreas.svg`

## Quality Target
Same as spec 26: textbook histology illustration quality (Junqueira's Basic Histology / Alberts' Molecular Biology style). Clean vector lines, correct tissue proportions, labeled regions, no photorealism.

## Common SVG Structure
Same template as spec 26. ViewBox `0 0 600 400`, tissue system color `#D4A574` at 25–40% opacity.

---

## 1. stomach.svg — Stomach Wall Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the stomach wall showing the mucosa with gastric glands, submucosa, muscularis externa, and serosa. The focus is on the gastric glands in the mucosa, which contain parietal cells and chief cells.

### Regions

#### `id="gastric-glands"` — Gastric Glands
- **Location:** The mucosal layer (upper ~35% of the SVG), specifically the glandular portion extending from the gastric pits down to the muscularis mucosae
- **Shape:** The mucosa has a surface epithelium at the top with gastric pits (funnel-shaped invaginations), and below the pits, the gastric glands extend as tubular structures down to the muscularis mucosae. Show 3–4 gastric glands in cross-section.
- **Histology:**
  - **Surface mucous cells:** Tall columnar cells lining the surface and gastric pits — show as a row of columnar cells with pale mucous granules at the apex
  - **Gastric pits:** Short funnel-shaped channels leading from the surface to the gland neck — show 2–3 pits
  - **Neck mucous cells:** At the neck of each gland, smaller mucous-secreting cells
  - **Parietal cells:** Large, round/oval cells with eosinophilic (pink-staining) cytoplasm — located primarily in the neck and upper body of the gland. Show 4–6 parietal cells per gland, larger than surrounding cells, with a distinctive "fried egg" appearance (large pale cytoplasm, small dark nucleus). These cells secrete HCl.
  - **Chief cells:** Smaller, basophilic (blue-staining) cells clustered at the base of the gland — show 3–5 chief cells per gland at the bottom, with dark-staining zymogen granules at the apex and basally located nuclei. These cells secrete pepsinogen.
  - **Enteroendocrine cells:** Small cells at the base of the glands (optional, decorative)
  - **Stem cells:** At the neck region (isthmus) — small undifferentiated cells (optional, decorative)
  - **Muscularis mucosae:** Thin band (~3px) of smooth muscle at the base of the mucosa, separating it from the submucosa
- **Fill:** `#D4A574` at 35% opacity
- **Clickable area:** The entire mucosal layer from the surface epithelium to the muscularis mucosae

### Structural Context (not clickable)
- **Submucosa:** Layer below the muscularis mucosae (~15% of SVG height) — loose connective tissue with blood vessels and Meissner's plexus
- **Muscularis externa:** Thick layer (~30% of SVG height) — three layers of smooth muscle (oblique, circular, longitudinal) with Auerbach's plexus between them. Show as bands of smooth muscle fibers.
- **Serosa:** Thin outer layer (~5% of SVG height) — simple squamous mesothelium
- Labels: "Mucosa", "Submucosa", "Muscularis Externa", "Serosa" on the left side with brackets
- Labels: "Parietal cell" and "Chief cell" with leader lines pointing to representative cells
- Label "Gastric pit" and "Muscularis mucosae"

---

## 2. small-intestine.svg — Small Intestine Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the small intestinal wall showing villi projecting into the lumen and crypts of Lieberkühn extending down to the muscularis mucosae. This is the most complex digestive organ SVG with two distinct clickable microstructures.

### Regions

#### `id="intestinal-villi"` — Intestinal Villi
- **Location:** The finger-like projections extending from the mucosal surface into the lumen (upper ~30% of the SVG)
- **Shape:** 4–5 finger-like (or leaf-like) projections rising from the mucosal surface. Each villus is ~60–80px tall and ~20–25px wide at the base, tapering slightly toward the tip.
- **Histology:**
  - **Enterocytes (absorptive cells):** Tall columnar cells with a prominent brush border (microvilli) at the apical surface — show as a row of columnar cells lining each villus, with a thin dense line at the apex representing the brush border/striated border. Each enterocyte has a basally located oval nucleus.
  - **Goblet cells:** Interspersed among enterocytes — show 1–2 per villus as pale, vacuolated cells with a goblet shape (narrow base, wide apical mucus cup)
  - **Core of each villus:** Contains a central lacteal (small lymphatic vessel, thin-walled tube) and a capillary network (small blood vessels). Show 1 lacteal and 2–3 capillaries in the core of each villus.
- **Fill:** `#D4A574` at 35% opacity
- **Clickable area:** The entire villus region (all villi + the surface epithelium between them)

#### `id="intestinal-crypt"` — Intestinal Crypt (Crypt of Lieberkühn)
- **Location:** The glandular portion of the mucosa, between the villus bases, extending down to the muscularis mucosae (middle ~20% of the SVG)
- **Shape:** Tubular glands (crypts) opening between the villus bases and extending downward. Show 3–4 crypts as test-tube-shaped invaginations.
- **Histology:**
  - **Paneth cells:** Large pyramidal cells at the base of each crypt — show 3–4 Paneth cells per crypt, with bright eosinophilic (large red/pink) granules in the apical cytoplasm and basally located nuclei. These are the most distinctive cells in the crypt.
  - **Intestinal stem cells:** Small undifferentiated cells at the crypt base (position +4 to +5 from the bottom) — show 2–3 small cells with large nuclei and scant cytoplasm at the base of each crypt, just above the Paneth cells
  - **Tuft cells:** Rare cells with a tuft of long microvilli at the apical surface — show 1 tuft cell per crypt as a cell with a distinctive apical tuft (bundle of thin lines extending into the lumen)
  - **Goblet cells:** Interspersed throughout the crypt — show 1–2 per crypt
  - **Transit-amplifying cells:** Rapidly dividing cells in the mid-crypt region — show as a band of smaller cells with mitotic figures (optional)
  - **Muscularis mucosae:** Thin band at the base of the crypts
- **Fill:** `#D4A574` at 30% opacity (slightly lighter than villi to distinguish the two regions)
- **Clickable area:** The entire crypt region from the villus bases to the muscularis mucosae

### Structural Context (not clickable)
- **Submucosa:** Layer below the muscularis mucosae — show Brunner's glands (duodenal submucosal glands) as clusters of mucous-secreting cells (optional, adds anatomical context)
- **Muscularis externa:** Inner circular and outer longitudinal smooth muscle layers with myenteric plexus between them
- **Serosa/adventitia:** Outer layer
- Labels: "Villus", "Crypt", "Submucosa", "Muscularis Externa"
- Labels: "Enterocyte", "Paneth cell", "Stem cell", "Tuft cell", "Goblet cell" with leader lines
- Label "Lacteal" and "Brush border" on the villus

---

## 3. large-intestine.svg — Large Intestine (Colon) Cross-Section

**ViewBox:** `0 0 600 400`

### Anatomical Description
A cross-section through the colonic wall showing the characteristic flat mucosa (no villi) with deep crypts, numerous goblet cells, and the muscularis externa with its distinctive taeniae coli.

### Regions

#### `id="colonic-epithelium"` — Colonic Epithelium
- **Location:** The mucosal layer (upper ~35% of the SVG)
- **Shape:** The colonic surface is FLAT (no villi, unlike the small intestine) — this is a key distinguishing feature. The surface epithelium is a flat line at the top, with crypts of Lieberkühn extending straight down from the surface to the muscularis mucosae. Show 4–5 crypts as straight test-tube-shaped glands.
- **Histology:**
  - **Colonocytes (absorptive cells):** Tall columnar cells lining the surface and upper crypt — show as a row of columnar cells with a thin brush border at the apex and basally located nuclei. Less prominent brush border than small intestinal enterocytes.
  - **Goblet cells:** Very numerous in the colon (more than in the small intestine) — show 2–3 goblet cells per crypt, increasing in density toward the crypt base. Each goblet cell is pale/vacuolated with a mucus cup.
  - **Crypt base:** Contains stem cells and Paneth-like cells (Paneth cells are rare/absent in normal adult colon, but stem cells are present)
  - **Surface epithelium:** Flat sheet of colonocytes and goblet cells at the luminal surface
- **Fill:** `#D4A574` at 35% opacity
- **Clickable area:** The entire mucosal layer (surface epithelium + crypts)

### Structural Context (not clickable)
- **Submucosa:** Loose connective tissue with blood vessels and lymphoid aggregates (show 1 lymphoid aggregate as a cluster of small cells)
- **Muscularis externa:** Inner circular layer (complete) + outer longitudinal layer (aggregated into three taeniae coli — show as thickened bands of longitudinal muscle at intervals)
- **Serosa:** Outer layer with fat tags (appendices epiploicae) — show 1–2 small fat deposits on the serosal surface
- Labels: "Surface epithelium", "Crypt", "Submucosa", "Muscularis Externa", "Taenia coli"
- Label "Colonocyte" and "Goblet cell" with leader lines
- Note: The flat surface (no villi) is the key visual distinction from the small intestine

---

## 4. liver.svg — Liver Microanatomy

**ViewBox:** `0 0 600 400`

### Anatomical Description
A classic hepatic lobule diagram showing the hexagonal lobule arrangement with central veins, portal triads at the corners, hepatocyte plates, and sinusoids. This is one of the most recognizable histology diagrams.

### Regions

#### `id="hepatic-lobule"` — Hepatic Lobule
- **Location:** The central hexagonal area of the SVG, representing one complete hepatic lobule
- **Shape:** Classic hexagonal lobule (~250px diameter) with:
  - **Central vein** at the center: Small circular vessel (~15px diameter)
  - **Hepatocyte plates:** Radial cords of hepatocytes extending from the central vein to the portal triads at each corner — show 6–8 plates radiating outward like spokes of a wheel
  - **Portal triads** at 3 of the 6 hexagonal corners (alternating): Each triad contains a branch of the hepatic artery (small thick-walled vessel), portal vein (larger thin-walled vessel), and bile duct (small vessel with cuboidal epithelium). Show 3 portal triads.
- **Histology:**
  - **Hepatocytes:** Large polygonal cells with central round nuclei (some binucleate) and eosinophilic cytoplasm. Show hepatocytes arranged in 1–2 cell-thick plates (cords) radiating from the central vein. Each hepatocyte is ~12–15px, with a round nucleus (~5px).
  - **Kupffer cells:** Specialized macrophages attached to the sinusoid walls — show 3–4 Kupffer cells as smaller, irregular cells with darker nuclei, positioned along the sinusoid walls between hepatocyte plates
  - **Sinusoids:** Capillary channels between the hepatocyte plates — shown as the spaces between the cords (these are the hepatic sinusoids, clickable separately)
  - **Space of Disse:** Perisinusoidal space between hepatocytes and sinusoid endothelium (not visible at this scale, but conceptually present)
- **Fill:** `#D4A574` at 35% opacity
- **Clickable area:** The hepatocyte plates and central vein (the parenchymal tissue of the lobule, excluding the sinusoid spaces)

#### `id="hepatic-sinusoids"` — Hepatic Sinusoids
- **Location:** The vascular channels between the hepatocyte plates, throughout the lobule
- **Shape:** A network of irregular channels running between the hepatocyte cords from the portal triads toward the central vein. The sinusoids converge on the central vein.
- **Histology:**
  - **Sinusoid endothelial cells (LSECs):** Extremely thin, fenestrated endothelial cells lining the sinusoids — show as thin lines along the sinusoid walls with occasional small gaps (fenestrations, ~1px holes)
  - **Hepatic stellate cells (Ito cells):** Perisinusoidal cells in the Space of Disse — show 2–3 stellate cells as small star-shaped cells with lipid droplets (small circles in cytoplasm) positioned between the sinusoid wall and the hepatocyte plate
  - **Blood flow:** Show the direction of blood flow with subtle arrows from the portal triads toward the central vein (decorative)
- **Fill:** `#D4A574` at 20% opacity (lighter, since these are vascular spaces, not solid tissue)
- **Clickable area:** The sinusoid channels throughout the lobule

### Structural Context
- Label "Central Vein" at the center
- Label "Portal Triad" at each of the 3 triads, with sub-labels "Hepatic Artery", "Portal Vein", "Bile Duct"
- Label "Hepatocyte plate" on one representative cord
- Label "Sinusoid" on one representative channel
- Label "Kupffer cell" and "Stellate cell" with leader lines
- Show bile canaliculi as thin lines between adjacent hepatocytes (decorative, showing bile flow toward the portal triad)
- The hexagonal lobule boundary is shown as a thin dashed line

---

## 5. pancreas.svg — Pancreas Microanatomy

**ViewBox:** `0 0 600 400`

### Anatomical Description
A composite view showing both the exocrine pancreas (acini) and the endocrine pancreas (islets of Langerhans). The acini make up ~98% of the pancreatic volume; the islets are scattered among the acini as pale-staining clusters.

### Regions

#### `id="pancreatic-acini"` — Pancreatic Acini
- **Location:** The bulk of the SVG (~80% of the area), surrounding the islets
- **Shape:** A field of serous acini — each acinus is a small grape-like cluster of pyramidal cells arranged around a central lumen. Show 15–20 acini in a field.
- **Histology:**
  - **Acinar cells:** Pyramidal cells with basally located nuclei and intensely eosinophilic (pink/red) zymogen granules at the apical pole. The basal cytoplasm is basophilic (blue-gray) due to rough ER. Show each acinar cell with:
    - Dark basophilic base (rough ER, ~40% of cell height)
    - Bright eosinophilic apex (zymogen granules, ~60% of cell height)
    - Round basal nucleus
  - **Acinar lumen:** Tiny central space in each acinus where secretions collect
  - **Centroacinar cells:** Small, pale cells extending into the acinar lumen — show 1–2 centroacinar cells as lighter-staining cells at the center of some acini (the initial cells of the intercalated duct)
  - **Intercalated ducts:** Small ducts draining individual acini — thin tubules with low cuboidal epithelium
- **Fill:** `#D4A574` at 35% opacity
- **Clickable area:** The entire acinar field (all acini + intercalated ducts)

#### `id="islets-of-langerhans"` — Islets of Langerhans
- **Location:** 2–3 circular/oval clusters scattered among the acini, each ~40–60px diameter
- **Shape:** Pale-staining (lighter than surrounding acini) circular/oval clusters with a rich capillary network. The islets stand out from the darker acinar tissue.
- **Histology:**
  - **Beta cells:** The most numerous cell type (~60–70% of islet cells), located centrally within the islet. Show as a cluster of ~8–10 cells in the center of each islet, with insulin granules (small dots in cytoplasm). These cells secrete insulin.
  - **Alpha cells:** ~20–25% of islet cells, located at the periphery of the islet (mantle distribution). Show as 3–4 cells around the outer rim of the islet, slightly smaller than beta cells, with glucagon granules. These cells secrete glucagon.
  - **Delta cells:** ~5–10% of islet cells, scattered among the alpha and beta cells. Show as 1–2 small cells, fewer than alpha cells, with somatostatin granules. These cells secrete somatostatin.
  - **Capillaries:** Rich fenestrated capillary network throughout the islet — show 3–4 small blood vessels within each islet (islets are highly vascularized)
- **Fill:** `#D4A574` at 25% opacity (lighter than acini, reflecting the pale staining of islets in H&E)
- **Clickable area:** The entire islet clusters (all 2–3 islets)

### Structural Context
- Label "Acinus" on one representative acinus with a leader line
- Label "Islet of Langerhans" on one islet
- Within the islet, label "β cells" (center), "α cells" (periphery), "δ cells" (scattered)
- Label "Centroacinar cell" and "Intercalated duct" in the acinar region
- Show the contrast between the dark acinar tissue and the pale islet tissue — this is the most distinctive feature of pancreatic histology

---

## CSS Considerations
Same as spec 26. Verify hover highlights work with canonical IDs:
- `#intestinal-villi` (not `#villi`)
- `#intestinal-crypt` (not `#crypt`)
- `#hepatic-lobule` (not `#lobule`)
- `#hepatic-sinusoids` (not `#sinusoids`)
- `#pancreatic-acini` (not `#acini`)
- `#islets-of-langerhans` (not `#islets`)

## Accessibility
Same as spec 26. Each SVG has `role="img"`, `aria-label`, and each region has `tabindex="0"` and `aria-label`.

## Edge Cases
- **Liver overlapping regions:** The hepatic lobule (parenchyma) and sinusoids (vascular spaces) are intermingled. The sinusoids are the channels BETWEEN the hepatocyte plates. Make the hepatocyte plates the primary clickable layer and the sinusoid spaces a secondary layer. Use `pointer-events: fill` on the lobule region and handle sinusoid clicks via the sinusoid spaces between the plates.
- **Pancreas islet/acini boundary:** The islets are clearly demarcated from the acini by their lighter staining. Ensure the boundary is clean with no gap or overlap.
- **Small intestine villi/crypt boundary:** The villi project upward from the surface, and the crypts extend downward from the surface. The boundary between them is at the mucosal surface (the "mouth" of the crypt where it opens between villus bases). Ensure this shared boundary is clean.

## Test Criteria
- [ ] All 5 SVGs render correctly with anatomically accurate proportions
- [ ] Each microstructure region is clickable and navigates to the correct cell type list
- [ ] SVG element IDs match canonical microstructure IDs (per spec 24)
- [ ] Stomach: gastric glands are clickable, showing parietal and chief cells in correct positions
- [ ] Small intestine: villi and crypts are two distinct clickable regions
- [ ] Large intestine: flat surface (no villi) is clearly different from small intestine
- [ ] Liver: hepatic lobule and sinusoids are two distinct clickable regions within the hexagonal lobule
- [ ] Pancreas: acini and islets are two distinct clickable regions with correct cell distributions
- [ ] Hover highlights use the correct tissue system color (#D4A574)
- [ ] All SVGs are valid and render in Chrome, Firefox, Safari
- [ ] Illustrations look like textbook histology, not cartoons
