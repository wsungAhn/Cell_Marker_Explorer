# Interactive Cell Marker Explorer — Master Plan (v4)

> **Project**: A multi-file interactive web application for exploring cell markers through a realistic human body anatomy drill-down, with a semi-automated data refresh pipeline.
> **Data source**: Labome (Cell Markers, T/B Cell Markers, Macrophage Markers, Stem Cell Markers) — last updated 2024-06-27, plus CellMarker 2.0, PanglaoDB, and other public databases
> **Workflow**: Biomni compiles data + writes Codex-ready specs → User feeds specs to Codex → Assemble & test
> **Maintenance**: Python scraper runs every 6 months → merge script updates JSON with versioning + changelog
> **Current version**: v1.0.0 deployed at https://wsungahn.github.io/Cell_Marker_Explorer/
> **Upgrade target**: v1.1.0 — content gap fixes + SVG redraws at textbook histology quality

---

## 1. Project Structure

```
cell-markers-explorer/
├── index.html                  # Main entry point — loads all modules
├── MASTER-PLAN.md              # This file — full architecture & execution plan
├── css/
│   ├── main.css                # Layout, typography, CSS variables, color scheme
│   ├── body-map.css            # Body SVG styling, hover/click effects, zoom
│   ├── microanatomy.css        # Micro-anatomy SVG styling, region highlights
│   ├── components.css          # Cards, badges, tables, breadcrumbs, modals, toggle
│   ├── search.css              # Search bar + results dropdown
│   ├── compare.css             # Comparison table styling
│   ├── responsive.css          # Mobile/tablet breakpoints
│   ├── dark-mode.css           # Dark mode overrides via CSS variables
│   ├── print.css               # Print-friendly styles
│   └── styles.css              # Combined stylesheet (v1.0.0 single-file output)
├── js/
│   ├── app.js                  # Main init, event bus, global state (species, current view)
│   ├── datastore.js            # Loads JSON, query methods (getByOrgan, getByCellType, search, compare)
│   ├── router.js               # Hash-based navigation, URL state, back/forward
│   ├── body-map.js             # Body SVG interaction handlers, region highlighting
│   ├── organ-view.js           # Organ cards + micro-anatomy SVG rendering
│   ├── cell-view.js            # Cell type list + detail panel
│   ├── search.js               # Search index builder + UI logic
│   ├── compare.js              # Multi-select + comparison table
│   ├── export.js               # CSV generation + download
│   ├── species-toggle.js       # Species switch + re-render trigger
│   ├── links.js                # UniProt + Labome URL generation
│   └── update-badge.js         # Shows "data updated" badge in header with date + changelog summary
├── data/
│   ├── cell-markers.json       # Full hierarchical dataset (human + mouse) — THE live dataset
│   ├── changelog.json          # Version history: each update's additions, modifications, deletions
│   └── scraped/                # Raw scraped data (intermediate, not served to browser)
│       ├── labome-cell-markers.json
│       ├── labome-tb-cell-markers.json
│       ├── labome-macrophage-markers.json
│       ├── labome-stem-cell-markers.json
│       ├── cellmarker2.tsv
│       └── panglaodb.tsv
├── svg/
│   ├── body-map.svg            # Realistic human body with clickable tissue-system regions
│   ├── microanatomy/
│   │   ├── skin.svg
│   │   ├── brain.svg
│   │   ├── spinal-cord.svg
│   │   ├── peripheral-nerve.svg
│   │   ├── heart.svg
│   │   ├── blood-vessels.svg
│   │   ├── lung.svg
│   │   ├── stomach.svg
│   │   ├── small-intestine.svg
│   │   ├── large-intestine.svg
│   │   ├── liver.svg
│   │   ├── pancreas.svg
│   │   ├── bone-marrow.svg
│   │   ├── thymus.svg
│   │   ├── spleen.svg
│   │   ├── lymph-nodes.svg
│   │   ├── thyroid.svg
│   │   ├── adrenal.svg
│   │   ├── skeletal-muscle.svg
│   │   ├── bone.svg
│   │   ├── ovary.svg
│   │   ├── testis.svg
│   │   ├── prostate.svg
│   │   ├── kidney.svg
│   │   ├── eye.svg
│   │   ├── blood.svg
│   │   └── cell-lines.svg
│   └── icons/
│       ├── favicon.svg         # Cell-themed favicon (NEW in v1.1.0)
│       ├── skin.svg
│       ├── brain.svg
│       ├── spinal-cord.svg
│       ├── peripheral-nerve.svg
│       ├── heart.svg
│       ├── blood-vessels.svg
│       ├── lung.svg
│       ├── stomach.svg
│       ├── small-intestine.svg
│       ├── large-intestine.svg
│       ├── liver.svg
│       ├── pancreas.svg
│       ├── bone-marrow.svg
│       ├── thymus.svg
│       ├── spleen.svg
│       ├── lymph-nodes.svg
│       ├── thyroid.svg
│       ├── adrenal.svg
│       ├── skeletal-muscle.svg
│       ├── bone.svg
│       ├── ovary.svg
│       ├── testis.svg
│       ├── prostate.svg
│       ├── kidney.svg
│       ├── eye.svg
│       ├── blood.svg
│       └── cell-lines.svg
├── updater/                    # Python data refresh pipeline
│   ├── requirements.txt
│   ├── scraper.py              # Scrapes Labome + other sources → data/scraped/
│   ├── merge.py                # Merges scraped data into cell-markers.json + changelog
│   ├── validate.py             # Validates JSON schema, checks for duplicates/conflicts
│   ├── config.yaml             # Source URLs, scraping schedule, merge rules
│   └── README.md               # How to run the updater
└── codex-specs/                # Codex-ready markdown specifications
    ├── 01-data-schema.md
    ├── 02-body-map-svg.md
    ├── 03-microanatomy-svgs.md
    ├── 04-app-shell.md
    ├── 05-datastore.md
    ├── 06-router.md
    ├── 07-body-map.md
    ├── 08-organ-view.md
    ├── 09-cell-view.md
    ├── 10-search.md
    ├── 11-compare.md
    ├── 12-export.md
    ├── 13-species-toggle.md
    ├── 14-links.md
    ├── 15-css-styles.md
    ├── 16-scraper.md
    ├── 17-merge-update.md
    ├── 21-citations-table.md       # NEW v1.1.0
    ├── 20-marker-normalization.md  # NEW v1.1.0
    ├── 22-favicon.md               # NEW v1.1.0
    ├── 23-loading-spinner.md       # NEW v1.1.0
    ├── 24-microstructure-id-reconcile.md  # NEW v1.1.0
    ├── 25-body-map-svg-redraw.md   # NEW v1.1.0
    ├── 26-microanatomy-batch-1.md  # NEW v1.1.0
    ├── 27-microanatomy-batch-2.md  # NEW v1.1.0
    ├── 28-microanatomy-batch-3.md  # NEW v1.1.0
    └── 29-organ-icon-svgs.md       # NEW v1.1.0
```

---

## 2. v1.1.0 Upgrade Summary

### 2.1 Content Gaps Identified (from deployed site review)

| # | Gap | Impact | Spec |
|---|-----|--------|------|
| 1 | No citations table — references show "Reference N" with no context | Users can't verify marker sources | 21 |
| 2 | 53 markers with nomenclature issues (suffix, Greek letters, lowercase) | Inconsistent display, broken UniProt links | 20 |
| 3 | No favicon (404 on svg/icons/favicon.svg) | Browser tab shows default icon | 22 |
| 4 | No loading spinner CSS despite app.js creating the element | Invisible loading state | 23 |
| 5 | 24 microstructures have id ≠ svg_region_id | Maintenance burden, ambiguous short IDs | 24 |
| 6 | Cardiovascular + Respiratory share body_map_region "chest" | Can't distinguish on body map | 25 |

### 2.2 SVG Quality Issues (user requirement)

All SVGs (body map, 25 microanatomy diagrams, 27 organ icons) need to be redrawn at textbook histology quality. The current images are not accurate for showing structure and morphology.

| SVG Set | Count | Spec | Quality Target |
|---------|-------|------|----------------|
| Body map | 1 | 25 | Netter's Atlas style, correct proportions, chest region split |
| Microanatomy batch 1 (integumentary, nervous, cardiovascular, respiratory) | 7 | 26 | Junqueira's Histology style, correct tissue layers |
| Microanatomy batch 2 (digestive) | 5 | 27 | Junqueira's Histology style, correct glandular architecture |
| Microanatomy batch 3 (lymphatic, endocrine, musculoskeletal, reproductive, urinary, sensory) | 13 | 28 | Junqueira's Histology style, correct cell arrangements |
| Organ icons | 27 | 29 | Textbook anatomical style, 64×64 viewBox |

### 2.3 New Data Fields

| Field | Location | Description | Spec |
|-------|----------|-------------|------|
| `metadata.citations[]` | cell-markers.json | Citation records with authors, title, journal, year, doi, pmid, url, source_page | 21 |
| `markers.human.expression_levels` | cell-markers.json | Object mapping marker name to "high"/"low"/"positive"/"negative" | 20 |
| `markers.mouse.expression_levels` | cell-markers.json | Same for mouse markers | 20 |
| `body_map_region: "chest-left"` | cell-markers.json | Cardiovascular system region (was "chest") | 25 |
| `body_map_region: "chest-right"` | cell-markers.json | Respiratory system region (was "chest") | 25 |

### 2.4 Removed Fields

| Field | Location | Reason | Spec |
|-------|----------|--------|------|
| `svg_region_id` | cell-markers.json (all microstructures) | Redundant — SVG element IDs now match canonical `id` | 24 |

---

## 3. v1.1.0 Codex Spec Execution Order

Specs must be executed in dependency order. Some can run in parallel.

```
Phase 1: Data normalization (must run first — other specs depend on corrected data)
  └── 20-marker-normalization.md
       └── 24-microstructure-id-reconcile.md (depends on 20 for marker name changes)

Phase 2: SVG redraws (can run in parallel after Phase 1)
  ├── 25-body-map-svg-redraw.md (includes chest region split)
  ├── 26-microanatomy-batch-1.md (integumentary, nervous, cardiovascular, respiratory)
  ├── 27-microanatomy-batch-2.md (digestive)
  ├── 28-microanatomy-batch-3.md (lymphatic, endocrine, musculoskeletal, reproductive, urinary, sensory)
  └── 29-organ-icon-svgs.md (27 organ icons)

Phase 3: Citations + UI fixes (can run in parallel, after Phase 1)
  ├── 21-citations-table.md (citation scraping + rendering)
  ├── 22-favicon.md (simple SVG icon)
  └── 23-loading-spinner.md (CSS addition)

Phase 4: Version bump
  └── Update metadata.version to "1.1.0" in cell-markers.json
  └── Add v1.1.0 entry to changelog.json
```

### Dependency Graph

```
20 ──→ 24 ──→ 25 (body map redraw uses canonical IDs + chest split)
              ├── 26 (microanatomy batch 1 uses canonical IDs)
              ├── 27 (microanatomy batch 2 uses canonical IDs)
              ├── 28 (microanatomy batch 3 uses canonical IDs)
              └── 29 (organ icons)

20 ──→ 21 (citations table uses normalized marker names)
24 ──→ 21 (citations rendering uses canonical microstructure IDs)

22 (no dependencies)
23 (no dependencies)
```

---

## 4. Data Architecture (v1.1.0 updates)

### 4.1 JSON Schema Changes

#### New: `metadata.citations[]`

```json
{
  "metadata": {
    "citations": [
      {
        "id": 1,
        "authors": "Zhang et al.",
        "title": "Cell markers in immunology",
        "journal": "Nature Reviews Immunology",
        "year": 2023,
        "doi": "10.1038/s41577-023-00001",
        "pmid": "12345678",
        "url": "https://doi.org/10.1038/s41577-023-00001",
        "source_page": "labome_cell_markers"
      }
    ]
  }
}
```

#### New: `expression_levels` on markers

```json
{
  "markers": {
    "human": {
      "positive": ["CD14", "CD16"],
      "negative": [],
      "expression_levels": {
        "CD14": "high",
        "CD16": "low"
      }
    }
  }
}
```

#### Changed: `body_map_region` for chest split

```json
{ "id": "cardiovascular", "body_map_region": "chest-left" }
{ "id": "respiratory", "body_map_region": "chest-right" }
```

#### Removed: `svg_region_id` from all microstructures

```json
// BEFORE
{ "id": "cerebral-cortex", "svg_region_id": "cortex", "name": "Cerebral Cortex" }

// AFTER
{ "id": "cerebral-cortex", "name": "Cerebral Cortex" }
```

### 4.2 Marker Normalization (53 replacements)

Full list in spec 20. Key categories:
- **Suffix markers:** CD14++ → CD14 (expression_level: "high"), CD16- → CD16 (expression_level: "negative")
- **Greek letters:** Alpha-SMA/ACTA2 → ACTA2, TGF-beta → TGFB1, PDGFRalpha → PDGFRA
- **Gene symbol replacements:** cGMP-dependent protein kinase → PRKG1, cTnI/TNNI3 → TNNI3

### 4.3 ID Conventions (unchanged from v3)

- All IDs: lowercase, hyphenated
- SVG element IDs now match canonical microstructure IDs (no more svg_region_id)
- Version: semver — v1.1.0 for this upgrade (MINOR: new features + content improvements)

### 4.4 Data Scope (v1.1.0)

| Level | Count | Details |
|-------|-------|---------|
| Tissue Systems | 12 | Integumentary through Circulating Immune |
| Organs | 27 | All with microanatomy SVGs |
| Microstructures | 42 | Distributed across 27 organs (1–4 per organ) |
| Cell Types | 121 | 101 with references, 20 without |
| Marker Entries | 1,381 | 691 human pos + 15 human neg + 657 mouse pos + 18 mouse neg |
| Unique Markers (human) | 706 | After normalization |
| Citations | ~156 | To be scraped from Labome source pages |

---

## 5. Visual Design (v1.1.0 updates)

### 5.1 Body Map SVG — Redrawn

- **File**: `svg/body-map.svg`
- **ViewBox**: `0 0 400 800` (portrait, 1:2 aspect ratio)
- **Quality**: Textbook anatomical illustration (Netter's Atlas style)
- **Proportions**: 7.5 head heights, correct anatomical canon
- **Pose**: Anterior view, arms slightly abducted
- **Regions**: 12 clickable tissue system regions (was 11 — circulating immune added)
- **Chest split**: `chest-left` (cardiovascular) and `chest-right` (respiratory) — no longer share "chest"
- **Z-ordering**: Deep structures (musculoskeletal, circulating immune) drawn first; surface (skin) drawn last
- **Skin region**: `pointer-events: stroke` so clicks pass through to organs underneath

### 5.2 Microanatomy SVGs — Redrawn

- **Files**: `svg/microanatomy/*.svg` (25 files)
- **ViewBox**: `0 0 600 400` (landscape)
- **Quality**: Textbook histology (Junqueira's / Alberts style)
- **Content**: Correct tissue layers, cell arrangements, glandular structures
- **Regions**: Clickable microstructure groups using canonical IDs (per spec 24)
- **Labels**: Region names, cell type names, structural landmarks

### 5.3 Organ Icons — Redrawn

- **Files**: `svg/icons/*.svg` (27 files)
- **ViewBox**: `0 0 64 64` (square)
- **Quality**: Textbook anatomical style, immediately recognizable
- **Style**: Single-color fill (tissue system color at 60% opacity), #333 outline (1.5px stroke)

### 5.4 New UI Elements

- **Citations table**: `<ol class="references-list">` in cell detail view with linked titles, authors, journal, year, DOI
- **Expression level badges**: `.marker-tag[data-expression-level]::after` shows ++, +, or - suffixes
- **Loading spinner**: `.loading-spinner` with `@keyframes spin` animation
- **Favicon**: Cell icon (cream circle + green nucleus) in browser tab

---

## 6. Features (unchanged from v3)

Species toggle, search, comparison table, CSV export, antibody links, data update badge, keyboard nav, URL state, responsive, dark mode, print — all as described in v3.

---

## 7. Technical Architecture (unchanged from v3)

No-build web app, Python pipeline, event bus, module dependency graph — all as described in v3.

### 7.1 Datastore Changes (v1.1.0)

- **New method**: `getCitation(id)` — returns citation record by ID
- **New method**: `getCitationsForCellType(cellTypeId)` — returns all citations referenced by a cell type
- **New index**: `citationById` Map in `_buildIndices()`
- **Changed**: `microstructureBySvgId` Map now uses `ms.id` instead of `ms.svg_region_id`
- **New**: `expression_levels` accessible via marker lookup methods

---

## 8. v1.0.0 Codex Spec Execution Order (completed)

| Phase | Spec File | What Codex Generates | Status |
|-------|-----------|---------------------|--------|
| 1 | 01-data-schema.md | JSON schema definition | Done |
| 2 | 02-body-map-svg.md | `svg/body-map.svg` | Done |
| 3 | 03-microanatomy-svgs.md | `svg/microanatomy/*.svg` | Done |
| 4 | 04-app-shell.md | `index.html` | Done |
| 5 | 15-css-styles.md | All CSS files | Done |
| 6 | 05-datastore.md | `js/datastore.js` | Done |
| 7 | 06-router.md | `js/router.js` | Done |
| 8 | 07-body-map.md | `js/body-map.js` | Done |
| 9 | 08-organ-view.md | `js/organ-view.js` | Done |
| 10 | 09-cell-view.md | `js/cell-view.js` | Done |
| 11 | 10-search.md | `js/search.js` | Done |
| 12 | 11-compare.md | `js/compare.js` | Done |
| 13 | 12-export.md | `js/export.js` | Done |
| 14 | 13-species-toggle.md | `js/species-toggle.js` | Done |
| 15 | 14-links.md | `js/links.js` | Done |
| 16 | 16-scraper.md | `updater/scraper.py` + `config.yaml` + `requirements.txt` | Done |
| 17 | 17-merge-update.md | `updater/merge.py` + `validate.py` + `README.md` | Done |

**Result**: 18/18 tasks passed with 0 fix rounds. Deployed at https://wsungahn.github.io/Cell_Marker_Explorer/

---

## 9. v1.1.0 Codex Spec Execution Order

| Phase | Spec File | What Codex Generates | Dependencies |
|-------|-----------|---------------------|--------------|
| 1 | 20-marker-normalization.md | Normalized marker names + expression_levels in JSON + CSS | — |
| 2 | 24-microstructure-id-reconcile.md | Remove svg_region_id, rename SVG elements, update datastore.js | 20 |
| 3a | 25-body-map-svg-redraw.md | Redrawn body-map.svg + chest split in JSON | 24 |
| 3b | 26-microanatomy-batch-1.md | 7 microanatomy SVGs (integumentary, nervous, cardiovascular, respiratory) | 24 |
| 3c | 27-microanatomy-batch-2.md | 5 microanatomy SVGs (digestive) | 24 |
| 3d | 28-microanatomy-batch-3.md | 13 microanatomy SVGs (lymphatic, endocrine, musculoskeletal, reproductive, urinary, sensory) | 24 |
| 3e | 29-organ-icon-svgs.md | 27 organ icon SVGs | — |
| 4a | 21-citations-table.md | Citation scraping + rendering + datastore methods | 20, 24 |
| 4b | 22-favicon.md | `svg/icons/favicon.svg` | — |
| 4c | 23-loading-spinner.md | CSS for loading spinner | — |
| 5 | Version bump | Update version to 1.1.0 in JSON + changelog | All above |

---

## 10. Assumptions & Risks

- **SVG quality**: Codex generates SVG markup from detailed anatomical descriptions in specs 25–29. May need iteration to achieve textbook quality.
- **Citation scraping**: Labome page structure may change. Spec 19 includes fallback selectors.
- **Citation ID conflicts**: If same reference number appears on different Labome pages with different papers, offset by +1000.
- **Expression level inference**: Suffix markers (CD14++, CD16-) are converted to expression_level values. Non-suffix markers default to "positive" or "negative" based on their list placement.
- **Chest region split**: Changing body_map_region from "chest" to "chest-left"/"chest-right" requires updating both the JSON and the SVG. The body map SVG must clearly show two distinct clickable regions.
- **Microstructure ID reconciliation**: 24 SVG element renames + removal of svg_region_id field. All JS/CSS references to svg_region_id must be updated.
- **Browser support**: Modern browsers (Chrome, Firefox, Safari, Edge). No IE11.
- **Marker normalization**: 53 marker replacements. The Python normalization script (described in spec 20) handles the bulk replacement. Manual review recommended for edge cases.

---

## 11. How to Use This Project

### Building the web app (v1.0.0 — already deployed)
1. Review MASTER-PLAN.md and all files in `codex-specs/`
2. Feed each spec to Codex in the execution order (section 8)
3. Place generated files in the correct directories
4. Compile data: `data/cell-markers.json` is provided by Biomni
5. Serve: `cd cell-markers-explorer && python -m http.server 8000`
6. Open: `http://localhost:8000`
7. Test: Verify all navigation paths, search, compare, export, species toggle

### Upgrading to v1.1.0
1. Execute v1.1.0 specs in the order described in section 9
2. Phase 1 (data normalization) must complete before any other phase
3. Phase 2 (SVG redraws) can run in parallel — assign different specs to different Codex sessions
4. Phase 3 (citations + UI fixes) can also run in parallel
5. Phase 4 (version bump) after all other specs are complete
6. Test all changes against the deployed v1.0.0 site
7. Deploy v1.1.0 to GitHub Pages

### Running the data updater
1. `cd updater && pip install -r requirements.txt`
2. `python scraper.py` — fetches latest data from all sources
3. `python merge.py` — merges into cell-markers.json (use `--dry-run` to preview)
4. `python validate.py` — validates the result
5. Review `data/scraped/review-queue.json` for any conflicts needing manual curation
6. Reload the web app to see updated data
