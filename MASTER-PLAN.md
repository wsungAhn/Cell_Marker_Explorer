# Interactive Cell Marker Explorer — Master Plan (v3)

> **Project**: A multi-file interactive web application for exploring cell markers through a realistic human body anatomy drill-down, with a semi-automated data refresh pipeline.
> **Data source**: Labome (Cell Markers, T/B Cell Markers, Macrophage Markers, Stem Cell Markers) — last updated 2024-06-27, plus CellMarker 2.0, PanglaoDB, and other public databases
> **Workflow**: Biomni compiles data + writes Codex-ready specs → User feeds specs to Codex → Assemble & test
> **Maintenance**: Python scraper runs every 6 months → merge script updates JSON with versioning + changelog

---

## 0. Reconciliation Notes (v3.1 — supervisor audit, 2026-06-13)

The original plan (v3) and the `codex-specs/` drifted apart in a few places. The audit below resolves each conflict; **where the plan and a spec disagree, these decisions win.** The live dataset `data/cell-markers.json` is the single source of truth for all IDs, counts, and structure.

| # | Topic | v3 plan said | Reconciled decision (v3.1) |
|---|---|---|---|
| R1 | Microanatomy SVG count | ~15 files (§1) | **27 files** — one per organ in the dataset, incl. `blood.svg` + `cell-lines.svg`. See updated `03-microanatomy-svgs.md`. |
| R2 | CSS architecture | 9 separate CSS files (§1) | **Single `css/styles.css`** (no imports), per specs 04 + 15. The 9-file list in §1 is superseded. |
| R3 | JS module system | "ES modules via `<script type=module>`" (§6.1/6.3) | **Global classes loaded with `<script defer>`** in dependency order, instantiated by `js/app.js`, per spec 04. No `import`/`export`. |
| R4 | `js/app.js` | Listed as central init/event-bus, but **no spec exists** | **Open item — spec `18-app-init.md` to be written** before Phase 4 (shell). Defines load order, datastore→router→view wiring, event bus, loading/error states, and data-driven version/update badges. |
| R5 | `js/update-badge.js` + changelog modal | Listed in §1/§3.6/§5.6, omitted from spec 04 script list, no spec | **Deferred for v1.** Minimal data-driven badges (version + last-updated, read from `metadata`) fold into `app.js` (R4). The clickable changelog modal is a v1.1 enhancement unless re-scoped. |
| R6 | Tissue system count | "11" in several headings | **12** — the dataset adds `circulating-immune`. Spec 01/02 already use 12; treat 12 as correct. |
| R7 | Marker symbol casing in spec examples | examples show e.g. `ALB` | Cosmetic only — **real data wins** (dataset uses `Albumin`). Do not "correct" the data to match examples. |
| R8 | Search example path (spec 10) | `#/circulating-immune/blood/blood-leukocytes/...` | Microstructure id is **`leukocytes`**, so the real path is `#/circulating-immune/blood/leukocytes/<cell>`. Example text only; routing derives from data. |

**Counts confirmed against the dataset:** 12 tissue systems · 27 organs · 42 microstructures · 121 cell types · 1381 marker entries · 27 microanatomy SVGs + 1 body-map SVG. Data integrity check passed (no duplicate IDs, no missing required fields, all 27 SVG refs accounted for).

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
│   └── print.css               # Print-friendly styles
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
│   │   ├── liver.svg
│   │   ├── skin.svg
│   │   ├── lung.svg
│   │   ├── intestine.svg
│   │   ├── kidney.svg
│   │   ├── bone.svg
│   │   ├── brain.svg
│   │   ├── heart.svg
│   │   ├── lymph-node.svg
│   │   ├── spleen.svg
│   │   ├── bone-marrow.svg
│   │   ├── eye.svg
│   │   ├── testis.svg
│   │   ├── ovary.svg
│   │   └── blood-vessel.svg
│   └── icons/
│       ├── organ-icons/
│       └── cell-icons/
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
    ├── 16-scraper.md            # Python scraper specification
    └── 17-merge-update.md       # Merge + update pipeline specification
```

---

## 2. Data Architecture

### 2.1 JSON Schema

File: `data/cell-markers.json`

```json
{
  "metadata": {
    "version": "1.0.0",
    "last_updated": "2024-06-27",
    "next_scheduled_update": "2024-12-27",
    "sources": [
      {
        "title": "Cell Markers",
        "url": "https://www.labome.com/method/Cell-Markers.html",
        "doi": "10.13070/mm.en.3.183",
        "last_scraped": "2024-06-27"
      },
      {
        "title": "T Cell Markers and B Cell Markers",
        "url": "https://www.labome.com/method/T-Cell-Markers-and-B-Cell-Markers.html",
        "last_scraped": "2024-06-27"
      },
      {
        "title": "Macrophage Markers",
        "url": "https://www.labome.com/method/Macrophage-Markers.html",
        "last_scraped": "2024-06-27"
      },
      {
        "title": "Stem Cell Markers",
        "url": "https://www.labome.com/review/stemcells.html",
        "last_scraped": "2024-06-27"
      },
      {
        "title": "CellMarker 2.0",
        "url": "http://bio-bigdata.hrbmu.edu.cn/CellMarker/",
        "last_scraped": null
      },
      {
        "title": "PanglaoDB",
        "url": "https://panglaodb.se/",
        "last_scraped": null
      }
    ]
  },
  "tissue_systems": [
    {
      "id": "digestive",
      "name": "Digestive System",
      "body_map_region": "abdomen",
      "color": "#D4A574",
      "description": "System responsible for food processing and nutrient absorption.",
      "organs": [
        {
          "id": "liver",
          "name": "Liver",
          "icon": "svg/icons/organ-icons/liver.svg",
          "microanatomy_svg": "svg/microanatomy/liver.svg",
          "description": "The largest internal organ, responsible for metabolism, detoxification, and protein synthesis.",
          "microstructures": [
            {
              "id": "hepatic-lobule",
              "name": "Hepatic Lobule",
              "svg_region_id": "lobule",
              "description": "The functional unit of the liver, hexagonal in shape with a central vein.",
              "cell_types": [
                {
                  "id": "hepatocyte",
                  "name": "Hepatocyte",
                  "description": "Parenchymal cells of the liver responsible for metabolism, detoxification, and protein synthesis.",
                  "markers": {
                    "human": {
                      "positive": ["HP", "ASGR1", "Albumin", "CYP3A4"],
                      "negative": []
                    },
                    "mouse": {
                      "positive": ["Alb", "Asgr1", "Cyp3a11"],
                      "negative": []
                    }
                  },
                  "aliases": ["Liver parenchymal cell"],
                  "references": [21],
                  "antibody_links": {},
                  "source": "labome",
                  "added_in_version": "1.0.0",
                  "last_modified_version": "1.0.0"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### 2.2 Changelog Schema

File: `data/changelog.json`

```json
{
  "updates": [
    {
      "version": "1.0.0",
      "date": "2024-06-27",
      "description": "Initial dataset compiled from Labome sources.",
      "sources_scraped": [
        "labome-cell-markers",
        "labome-tb-cell-markers",
        "labome-macrophage-markers",
        "labome-stem-cell-markers"
      ],
      "changes": {
        "cell_types_added": 100,
        "cell_types_modified": 0,
        "cell_types_removed": 0,
        "markers_added": 500,
        "markers_modified": 0,
        "markers_removed": 0,
        "new_organs": 30,
        "new_microstructures": 50
      },
      "details": {
        "added_cell_types": ["hepatocyte", "kupffer-cell"],
        "modified_cell_types": [],
        "removed_cell_types": []
      }
    }
  ]
}
```

### 2.3 ID Conventions

- All IDs: lowercase, hyphenated (e.g., `hepatic-lobule`, `cd4-t-cell`)
- Tissue system IDs: `integumentary`, `nervous`, `cardiovascular`, `respiratory`, `digestive`, `lymphatic`, `endocrine`, `musculoskeletal`, `reproductive`, `urinary`, `sensory`
- Organ IDs: `skin`, `brain`, `spinal-cord`, `heart`, `blood-vessels`, `lung`, `trachea`, `stomach`, `small-intestine`, `large-intestine`, `liver`, `pancreas`, `spleen`, `lymph-nodes`, `thymus`, `bone-marrow`, `thyroid`, `adrenal`, `skeletal-muscle`, `bone`, `ovary`, `testis`, `uterus`, `prostate`, `kidney`, `bladder`, `eye`, `ear`, `tonsils`
- SVG region IDs: match microstructure IDs for programmatic linking
- Version: semver (MAJOR.MINOR.PATCH) — MINOR for new cell types/markers, PATCH for corrections, MAJOR for schema changes

### 2.4 Data Scope

| Level | Count | Details |
|-------|-------|---------|
| Tissue Systems | 11 | Integumentary through Sensory |
| Organs | ~30 | See ID list above |
| Microstructures | ~50 | Anatomical sub-compartments per organ |
| Cell Types | ~100+ | All from Labome + anatomical mapping |
| Markers | ~500+ | Gene symbols, CD numbers, protein names |
| Species | 2 | Human + Mouse (with species-specific markers where data available) |

---

## 3. Data Refresh Pipeline

### 3.1 Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────────┐
│  scraper.py  │────▶│ data/scraped/ │────▶│  merge.py    │────▶│ cell-markers.json │
│  (every 6mo) │     │  (raw data)   │     │  (smart merge)│     │ + changelog.json  │
└─────────────┘     └──────────────┘     └──────────────┘     └──────────────────┘
                                                │
                                                ▼
                                        ┌──────────────┐
                                        │ validate.py  │
                                        │ (schema check)│
                                        └──────────────┘
```

### 3.2 Scraper (`updater/scraper.py`)

**Sources scraped**:

| Source | URL | Data Format | Scraping Method |
|--------|-----|-------------|-----------------|
| Labome Cell Markers | labome.com/method/Cell-Markers.html | HTML | BeautifulSoup HTML parsing |
| Labome T/B Cell Markers | labome.com/method/T-Cell-Markers-and-B-Cell-Markers.html | HTML | BeautifulSoup HTML parsing |
| Labome Macrophage Markers | labome.com/method/Macrophage-Markers.html | HTML | BeautifulSoup HTML parsing |
| Labome Stem Cell Markers | labome.com/review/stemcells.html | HTML | BeautifulSoup HTML parsing |
| CellMarker 2.0 | bio-bigdata.hrbmu.edu.cn/CellMarker/ | TSV/XLSX download | Direct download + parse |
| PanglaoDB | panglaodb.se/ | TSV download | Direct download + parse |

**Scraping logic per source**:
1. **Labome**: Fetch HTML → parse section headers (cell type names) → extract marker lists from text + tables → output structured JSON to `data/scraped/labome-*.json`
2. **CellMarker 2.0**: Download latest TSV → parse rows (cell type, tissue, marker, species) → output to `data/scraped/cellmarker2.tsv`
3. **PanglaoDB**: Download marker TSV → parse rows (cell type, tissue, marker, species, specificity score) → output to `data/scraped/panglaodb.tsv`

**Configuration** (`updater/config.yaml`):
```yaml
schedule:
  interval_months: 6

sources:
  labome:
    base_url: "https://www.labome.com/method/"
    pages:
      - name: "Cell Markers"
        url: "Cell-Markers.html"
        output: "data/scraped/labome-cell-markers.json"
      - name: "T Cell Markers and B Cell Markers"
        url: "T-Cell-Markers-and-B-Cell-Markers.html"
        output: "data/scraped/labome-tb-cell-markers.json"
      - name: "Macrophage Markers"
        url: "Macrophage-Markers.html"
        output: "data/scraped/labome-macrophage-markers.json"
      - name: "Stem Cell Markers"
        url: "Stem-Cell-Markers.html"
        output: "data/scraped/labome-stem-cell-markers.json"
    check_modified: true
    delay_between_requests: 2

  cellmarker2:
    download_url: "http://bio-bigdata.hrbmu.edu.cn/CellMarker/download/Cell_marker_All.xlsx"
    output: "data/scraped/cellmarker2.tsv"

  panglaodb:
    download_url: "https://panglaodb.se/markers/PanglaoDB_markers.tsv"
    output: "data/scraped/panglaodb.tsv"

merge_rules:
  conflict_resolution: "prefer_labome"
  panglaodb_min_specificity: 0.5
  auto_add_new_cell_types: false
  auto_add_new_markers: true
```

**Output format** (Labome scraped JSON):
```json
{
  "source": "labome-cell-markers",
  "scraped_date": "2024-12-27",
  "page_last_modified": "2024-12-15",
  "cell_types": [
    {
      "name": "Hepatocyte",
      "section": "Other cell types",
      "markers": {
        "human": { "positive": ["HP", "ASGR1"], "negative": [] },
        "mouse": { "positive": ["Alb", "Asgr1"], "negative": [] }
      },
      "description": "Parenchymal cells of the liver...",
      "references": [21]
    }
  ]
}
```

### 3.3 Merge Script (`updater/merge.py`)

**Merge logic**:

1. **Load** current `cell-markers.json` + all scraped files from `data/scraped/`
2. **Match** scraped cell types to existing entries by name/alias fuzzy matching
3. **For matched cell types**:
   - Compare marker lists
   - New markers → add with `source` attribution and `added_in_version`
   - Changed markers → flag for review (don't auto-modify)
   - Removed markers → flag for review (don't auto-remove)
4. **For unmatched cell types** (new from secondary sources):
   - If `auto_add_new_cell_types: false` → write to review queue file
   - If `auto_add_new_cell_types: true` → add to appropriate organ/microstructure
5. **Update** `metadata.version` (bump MINOR for additions, PATCH for corrections)
6. **Update** `metadata.last_updated` and `metadata.next_scheduled_update`
7. **Update** `metadata.sources[*].last_scraped`
8. **Write** `changelog.json` entry with diff summary
9. **Write** updated `cell-markers.json`
10. **Write** review queue (if any) to `data/scraped/review-queue.json`

**Review queue format** (`data/scraped/review-queue.json`):
```json
{
  "generated_date": "2024-12-27",
  "items": [
    {
      "type": "new_cell_type",
      "source": "cellmarker2",
      "name": "Tuft cell",
      "suggested_organ": "small-intestine",
      "suggested_microstructure": "intestinal-crypt",
      "markers": { "human": { "positive": ["DCLK1", "TRPM5"] } },
      "status": "pending_review",
      "notes": "Already exists in dataset as 'tuft-cell' under epithelial. Consider merging."
    },
    {
      "type": "marker_conflict",
      "cell_type_id": "hepatocyte",
      "existing_marker": "ASGR1",
      "conflicting_source": "panglaodb",
      "conflicting_data": "ASGR1 listed as negative in PanglaoDB for human hepatocyte",
      "status": "pending_review"
    }
  ]
}
```

### 3.4 Validator (`updater/validate.py`)

Runs after merge to ensure data integrity:
- JSON schema validation (required fields present, correct types)
- Duplicate ID detection (no two cell types with same ID)
- Orphan reference check (cell types referencing non-existent organs)
- Marker nomenclature validation (human uppercase, mouse title-case for gene symbols)
- SVG region ID cross-reference (all microstructure IDs have matching SVG regions)

### 3.5 Running the Pipeline

```bash
# Full pipeline (scrape + merge + validate)
cd updater
pip install -r requirements.txt
python scraper.py          # Step 1: Scrape all sources
python merge.py            # Step 2: Merge into cell-markers.json
python validate.py         # Step 3: Validate the result

# Or run individually
python scraper.py --source labome    # Scrape only Labome
python merge.py --dry-run            # Preview changes without writing
python validate.py --fix             # Auto-fix simple issues
```

### 3.6 Update Badge in Web UI

The `js/update-badge.js` module reads `metadata.last_updated` and `metadata.version` from the loaded JSON and displays:
- A small badge in the header: "Data v1.2.0 — Updated 2024-12-27"
- Clicking the badge opens a changelog modal showing what changed in the latest update
- If `next_scheduled_update` is past due, shows a subtle "Update available" indicator

---

## 4. Visual Design

### 4.1 Anatomy SVG — Body Map

- **File**: `svg/body-map.svg`
- **View**: Front-facing human body, anatomically realistic proportions
- **Regions**: 11 clickable `<g>` groups, each containing `<path>` elements for the tissue system's body area
- **Interaction**: Hover = glow + label tooltip, Click = zoom + navigate to tissue system
- **Style**: Medical illustration — clean outlines, soft pastel fills per tissue system, white background

### 4.2 Micro-anatomy SVGs

- **Files**: `svg/microanatomy/*.svg`
- **Style**: Simplified histological cross-sections — anatomically accurate structure, clean vector lines, labeled regions
- **Interaction**: Each labeled region is a clickable `<g>` matching a microstructure ID
- **Hover**: Region highlight + tooltip with microstructure name

### 4.3 Navigation Flow

```
Body Map → click tissue system
  → Tissue System View (organ cards in grid, each with icon + name)
    → click organ
      → Organ View (micro-anatomy SVG + cell type preview list)
        → click microstructure region on SVG
          → Cell Types List (cards with marker count badges)
            → click cell type
              → Cell Detail Panel (full marker table, description, references, links)
```

Every level:
- Breadcrumb: `Body > Digestive > Liver > Hepatic Lobule > Hepatocytes`
- Back button + Escape key
- CSS fade/slide transitions

### 4.4 Color Scheme (CSS Variables)

```css
:root {
  --bg-primary: #FAF9F3;
  --bg-secondary: #ECE9E2;
  --text-primary: #000000;
  --text-secondary: #555555;
  --accent-blue: #0279EE;
  --accent-green: #75A025;
  --accent-lime: #E9ED4C;
  --accent-orange: #FF9400;
  --accent-pink: #FD9BED;
  --marker-positive: #E9ED4C;
  --marker-negative: #FF9400;
  --marker-species: #0279EE;
  --hover-glow: 0 0 12px rgba(2, 121, 238, 0.4);
  --transition-speed: 0.3s;
}
```

Tissue system colors (pastel):
- Integumentary: #F5D5C8 (skin tone)
- Nervous: #F5E6A3 (golden)
- Cardiovascular: #E8A0A0 (red-pink)
- Respiratory: #D5E8F0 (light blue)
- Digestive: #D4A574 (brown)
- Lymphatic: #C8D5E0 (blue-gray)
- Endocrine: #E0C8E8 (lavender)
- Musculoskeletal: #D5C8B8 (tan)
- Reproductive: #F0C8D8 (pink)
- Urinary: #E8D5A0 (yellow)
- Sensory: #C8E8D8 (mint)

---

## 5. Features

### 5.1 Species Toggle
- Header toggle switch: Human ↔ Mouse
- Switching re-renders all marker displays
- Differing markers get species badge (H/M)
- Species-specific cell types shown/hidden

### 5.2 Search Bar
- Global search in header
- Searches: cell type names, marker names (gene symbols, CD numbers), organ names, microstructure names, aliases
- Dropdown results categorized by type (Cell Type / Marker / Organ)
- Click result → navigate to that view
- Partial matching + alias support

### 5.3 Marker Comparison Table
- "Compare" button on cell type cards
- Select 2+ cell types → side-by-side marker table
- Overlapping markers highlighted
- Sortable by marker name, presence/absence
- Exportable to CSV

### 5.4 CSV Export
- Button in header + in detail views
- Options: current cell type, current organ, full dataset
- Fields: cell_type, marker, species, direction (positive/negative), description
- Downloads as `cell-markers-[scope].csv`

### 5.5 Antibody Database Links
- Each marker in detail view has external links:
  - UniProt: `https://www.uniprot.org/uniprot/?query=gene:{SYMBOL}+organism:{SPECIES_ID}`
  - Labome: `https://www.labome.com/product/search?q={SYMBOL}`
- Opens in new tab

### 5.6 Data Update Badge
- Header badge: "Data v1.2.0 — Updated 2024-12-27"
- Click → changelog modal with latest update details
- "Update available" indicator if scheduled update is overdue

### 5.7 Additional UX
- **Keyboard nav**: Arrow keys browse lists, Enter selects, Escape goes back
- **URL state**: Hash routing — `#/digestive/liver/hepatic-lobule/hepatocyte`
- **Responsive**: Desktop (full SVG), Tablet (scaled SVG), Mobile (card list fallback)
- **Dark mode**: Toggle in header, CSS variable swap
- **Print**: CSS print styles for marker tables

---

## 6. Technical Architecture

### 6.1 No build step (web app)

- Vanilla HTML + CSS + JavaScript
- ES modules loaded via `<script type="module">`
- No framework, no bundler
- Serve with any static server: `python -m http.server` or VS Code Live Server

### 6.2 Python pipeline (updater)

- Python 3.9+
- Dependencies: `requests`, `beautifulsoup4`, `pyyaml`, `jsonschema`
- Run manually or via cron/CI every 6 months
- Output: updated `cell-markers.json` + `changelog.json`

### 6.3 Module Communication (web app)

- **Event bus** in `app.js`: custom events for navigation, species change, compare selection
- **Global state**: `{ currentSpecies: 'human', currentView: 'body-map', navigationStack: [] }`
- **DataStore** is the single source of truth for data queries
- **Router** reads/writes URL hash, triggers navigation events

### 6.4 Module Dependency Graph

```
app.js
 ├── datastore.js  (loads cell-markers.json)
 ├── router.js     (hash navigation)
 ├── body-map.js   (SVG interaction)
 ├── organ-view.js (organ cards + micro-anatomy)
 ├── cell-view.js  (cell list + detail)
 ├── search.js     (search index + UI)
 ├── compare.js    (comparison table)
 ├── export.js     (CSV generation)
 ├── species-toggle.js (species switch)
 ├── links.js      (URL generation)
 └── update-badge.js (data version badge + changelog modal)
```

All modules import from `datastore.js` for data and `app.js` for event bus.

---

## 7. Codex Spec Execution Order

| Phase | Spec File | What Codex Generates | Dependencies |
|-------|-----------|---------------------|--------------|
| 1 | 01-data-schema.md | (Biomni builds JSON directly) | — |
| 2 | 02-body-map-svg.md | `svg/body-map.svg` | 01 |
| 3 | 03-microanatomy-svgs.md | `svg/microanatomy/*.svg` | 01 |
| 4 | 04-app-shell.md | `index.html` | 02, 03 |
| 5 | 15-css-styles.md | All CSS files | 04 |
| 6 | 05-datastore.md | `js/datastore.js` | 01 |
| 7 | 06-router.md | `js/router.js` | 04 |
| 8 | 07-body-map.md | `js/body-map.js` | 05, 06 |
| 9 | 08-organ-view.md | `js/organ-view.js` | 05, 06 |
| 10 | 09-cell-view.md | `js/cell-view.js` | 05, 06 |
| 11 | 10-search.md | `js/search.js` | 05 |
| 12 | 11-compare.md | `js/compare.js` | 05, 09 |
| 13 | 12-export.md | `js/export.js` | 05 |
| 14 | 13-species-toggle.md | `js/species-toggle.js` | 05 |
| 15 | 14-links.md | `js/links.js` | — |
| 16 | 16-scraper.md | `updater/scraper.py` + `config.yaml` + `requirements.txt` | 01 |
| 17 | 17-merge-update.md | `updater/merge.py` + `validate.py` + `README.md` | 01, 16 |

---

## 8. Assumptions & Risks

- **Data accuracy**: Labome data as of 2024-06-27. Included with attribution.
- **Micro-anatomy mapping**: Requires domain knowledge beyond Labome — using standard histology references.
- **SVG quality**: Codex generates SVG markup from detailed descriptions. May need iteration.
- **Orphan cell types**: Jurkat cells, etc. placed under "Cell Lines / Other" accessible from body map.
- **Marker nomenclature**: Human gene symbols are uppercase (e.g., ASGR1), mouse are title-case (e.g., Asgr1). CD numbers are species-agnostic.
- **Browser support**: Modern browsers (Chrome, Firefox, Safari, Edge). No IE11.
- **Scraping reliability**: Labome page structure may change. Scraper uses flexible CSS selectors with fallbacks. If scraping fails, the existing dataset remains intact.
- **Source conflicts**: When Labome and CellMarker/PanglaoDB disagree on a marker, Labome wins by default. Conflicts are flagged in the review queue for manual curation.
- **6-month cadence**: Configurable in `config.yaml`. Can be run more frequently if desired.

---

## 9. How to Use This Project

### Building the web app
1. **Review** this MASTER-PLAN.md and all files in `codex-specs/`
2. **Feed each spec** to Codex in the execution order above
3. **Place generated files** in the correct directories per the project structure
4. **Compile data**: `data/cell-markers.json` is provided by Biomni (not Codex)
5. **Serve**: `cd cell-markers-explorer && python -m http.server 8000`
6. **Open**: `http://localhost:8000`
7. **Test**: Verify all navigation paths, search, compare, export, species toggle

### Running the data updater
1. `cd updater && pip install -r requirements.txt`
2. `python scraper.py` — fetches latest data from all sources
3. `python merge.py` — merges into cell-markers.json (use `--dry-run` to preview)
4. `python validate.py` — validates the result
5. Review `data/scraped/review-queue.json` for any conflicts needing manual curation
6. Reload the web app to see updated data
