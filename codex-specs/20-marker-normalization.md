# Codex Spec: 20-marker-normalization

## Purpose
Normalize 53 markers with nomenclature issues in `cell-markers.json`. Three categories of problems: (1) expression-level suffixes (`CD14++`, `CD3-`, `IgD+`) that should be captured in a new `expression_level` field rather than embedded in the marker name, (2) Greek letters spelled out (`Alpha-SMA`, `TGF-beta`, `PDGFRalpha`) that should use canonical gene symbols, and (3) full-name prefixes (`cGMP-dependent protein kinase`) that should be replaced with gene symbols.

## Dependencies
- `01-data-schema.md` (schema extension for `expression_level`)
- `14-links.md` (alias map updates)

## Output Files
- `data/cell-markers.json` — normalized markers + new `expression_level` fields
- `updater/normalize_markers.py` — Python script that applies the replacement map
- `js/links.js` — updated `MARKER_ALIASES` map with old→new mappings for search

## Schema Addition: `expression_level` field

### Current marker format (in `markers.human.positive[]` and `markers.human.negative[]`):
```json
"positive": ["CD14++", "CD8+", "FOXP3"]
```

### New marker format:
Markers remain as strings in the `positive`/`negative` arrays, but expression-level qualifiers are stripped from the name. A parallel `expression_levels` object maps marker names to their qualifier.

```json
"positive": ["CD14", "CD8", "FOXP3"],
"negative": ["CD16", "CD3"],
"expression_levels": {
  "CD14": "high",
  "CD8": "positive",
  "CD16": "negative",
  "CD3": "negative"
}
```

### `expression_levels` field rules
- Optional object at the `markers.human` and `markers.mouse` level
- Keys are marker names (after normalization), values are one of:
  - `"high"` — was `++` or `high` (e.g., `CD14++` → `CD14` with level `"high"`)
  - `"low"` — was `low` or `dim` (e.g., `CD38low` → `CD38` with level `"low"`)
  - `"positive"` — was `+` without `++` (e.g., `CD8+` → `CD8` with level `"positive"`)
  - `"negative"` — was `-` (e.g., `CD3-` → `CD3` with level `"negative"`)
- Only markers that HAD a qualifier get an entry — plain markers like `FOXP3` have no entry
- This field is informational for display; the `positive`/`negative` arrays remain the primary data

### Display in cell-view.js
When rendering marker tags, if `expression_levels[marker]` exists:
- `"high"`: show tag with `++` badge (e.g., `CD14` with small `++` superscript)
- `"low"`: show tag with `low` badge (e.g., `CD38` with small `low` superscript)
- `"positive"`: show tag normally (the `+` is implied by being in the positive array)
- `"negative"`: show tag in negative style (the `-` is implied by being in the negative array)

So the display logic is:
```javascript
function renderMarkerTag(marker, arrayType, expressionLevels) {
  var level = expressionLevels[marker];
  var tag = createTag(marker, arrayType);
  if (level === 'high') tag.dataset.expressionLevel = 'high';
  if (level === 'low') tag.dataset.expressionLevel = 'low';
  return tag;
}
```

CSS for expression badges:
```css
.marker-tag[data-expression-level="high"]::after {
  content: '++';
  font-size: 9px;
  vertical-align: super;
  margin-left: 1px;
  opacity: 0.7;
}
.marker-tag[data-expression-level="low"]::after {
  content: 'low';
  font-size: 9px;
  vertical-align: super;
  margin-left: 1px;
  opacity: 0.7;
}
```

## Complete Replacement Map

### Human markers — suffix normalization

| Current | Normalized name | Target array | expression_level |
|---------|----------------|-------------|-----------------|
| `CD14++` | `CD14` | positive | `high` |
| `CD16-` | `CD16` | negative | `negative` |
| `CD16++` | `CD16` | positive | `high` |
| `CD3-` | `CD3` | negative | `negative` |
| `CD8+` | `CD8` | positive | `positive` |
| `CD11b-` | `CD11b` | negative | `negative` |
| `CD20-` | `CD20` | negative | `negative` |
| `CD23-` | `CD23` | negative | `negative` |
| `CD24-` | `CD24` | negative | `negative` |
| `CD27+` | `CD27` | positive | `positive` |
| `CD27-` | `CD27` | negative | `negative` |
| `CD45RA-` | `CD45RA` | negative | `negative` |
| `CD138-` | `CD138` | negative | `negative` |
| `CCR7-` | `CCR7` | negative | `negative` |
| `IgA+` | `IgA` | positive | `positive` |
| `IgD+` | `IgD` | positive | `positive` |
| `IgD-` | `IgD` | negative | `negative` |
| `IgG+` | `IgG` | positive | `positive` |
| `IgM+` | `IgM` | positive | `positive` |
| `IgM-` | `IgM` | negative | `negative` |
| `Lin-` | `Lin` | negative | `negative` |
| `SIRPa+` | `SIRPA` | positive | `positive` |
| `SIRPa-` | `SIRPA` | negative | `negative` |
| `CD38low` | `CD38` | positive | `low` |

### Mouse markers — suffix normalization

| Current | Normalized name | Target array | expression_level |
|---------|----------------|-------------|-----------------|
| `Ccr7-` | `Ccr7` | negative | `negative` |
| `Cd11b-` | `Cd11b` | negative | `negative` |
| `Cd138-` | `Cd138` | negative | `negative` |
| `Cd16-` | `Cd16` | negative | `negative` |
| `Cd20-` | `Cd20` | negative | `negative` |
| `Cd23-` | `Cd23` | negative | `negative` |
| `Cd24-` | `Cd24` | negative | `negative` |
| `Cd27+` | `Cd27` | positive | `positive` |
| `Cd27-` | `Cd27` | negative | `negative` |
| `Cd3-` | `Cd3` | negative | `negative` |
| `Cd45ra-` | `Cd45ra` | negative | `negative` |
| `Cd8+` | `Cd8` | positive | `positive` |
| `Igd+` | `Igd` | positive | `positive` |
| `Igd-` | `Igd` | negative | `negative` |
| `Igm+` | `Igm` | positive | `positive` |
| `Igm-` | `Igm` | negative | `negative` |
| `Sirpa+` | `Sirpa` | positive | `positive` |
| `Sirpa-` | `Sirpa` | negative | `negative` |
| `Cd34low` | `Cd34` | positive | `low` |
| `Ly6chi` | `Ly6c` | positive | `high` |
| `Ly6clo` | `Ly6c` | positive | `low` |

### Greek letter / gene symbol normalizations (both species where applicable)

| Current | Normalized | Rationale |
|---------|-----------|-----------|
| `Alpha-SMA/ACTA2` | `ACTA2` | Gene symbol is canonical; alias preserved in links.js |
| `Alpha-smooth muscle actin/ACTA2` | `ACTA2` | Duplicate variant, same gene |
| `Alpha-gustducin` | `GNAT3` | Gene symbol for gustducin alpha subunit |
| `Integrin alpha 8/ITGA8` | `ITGA8` | Gene symbol is canonical |
| `PDGFRalpha` | `PDGFRA` | Gene symbol |
| `TGF-beta` | `TGFB1` | Gene symbol for TGF-beta 1 |
| `TNF-alpha` | `TNF` | Gene symbol (TNF encodes TNF-alpha) |
| `TCRalpha/beta` | `TRAC/TRBC1` | Gene symbols for TCR alpha/beta constant regions |
| `TCRbeta` | `TRBC1` | Gene symbol for TCR beta constant region 1 |
| `cGMP-dependent protein kinase` | `PRKG1` | Gene symbol |
| `cTnI/TNNI3` | `TNNI3` | Gene symbol is canonical |
| `cTnT/TNNT2` | `TNNT2` | Gene symbol is canonical |

## Python Normalization Script

`updater/normalize_markers.py`:
1. Load `cell-markers.json`
2. For each cell type, for each species:
   a. Scan `positive[]` and `negative[]` for markers matching the replacement map
   b. Replace the marker name with the normalized version
   c. If the target array differs from the current array, move the marker
   d. If the marker had a suffix qualifier, add entry to `expression_levels`
   e. Remove duplicates (e.g., if `CD27` appears in both positive and negative after normalization, keep the one from the replacement map's target array)
3. Save updated `cell-markers.json`
4. Print summary: N markers normalized, N moved between arrays, N expression_levels added

## links.js Alias Map Updates

Add old→new mappings so search still finds markers by their old names:

```javascript
// Add to MARKER_ALIASES in links.js:
'Alpha-SMA': 'ACTA2',
'Alpha-smooth muscle actin': 'ACTA2',
'Alpha-gustducin': 'GNAT3',
'Integrin alpha 8': 'ITGA8',
'PDGFRalpha': 'PDGFRA',
'TGF-beta': 'TGFB1',
'TNF-alpha': 'TNF',
'TCRalpha/beta': 'TRAC/TRBC1',
'TCRbeta': 'TRBC1',
'cGMP-dependent protein kinase': 'PRKG1',
'cTnI': 'TNNI3',
'cTnT': 'TNNT2',
```

Also update the datastore's search index to include old marker names as searchable aliases so users who type "TGF-beta" still find the relevant cell types.

## Edge Cases
- `CD38low` in HSC positive markers: normalize to `CD38` with `expression_level: "low"`, keep in positive array
- `CD34low` in mouse HSC: same treatment
- `Ly6chi` / `Ly6clo` in mouse monocytes: normalize to `Ly6c` with `high`/`low` levels
- Marker appearing in both positive and negative after normalization (e.g., `CD27+` and `CD27-` in different cell types): each cell type gets its own `expression_levels` entry — no conflict
- Same marker name appearing twice in same array after normalization: remove duplicate
- `Lin` (lineage negative): keep as `Lin` — it's a standard immunology shorthand, not a gene symbol

## Test Criteria
- [ ] No marker in the dataset ends with `+`, `-`, `++`, or contains `low`/`high`/`dim` as a suffix
- [ ] No marker contains spelled-out Greek letters (`alpha`, `beta` as words)
- [ ] `expression_levels` field exists on cell types that had qualified markers
- [ ] `CD14` appears in positive array for classical monocytes with `expression_levels.CD14 = "high"`
- [ ] `CD3` appears in negative array for NK cells with `expression_levels.CD3 = "negative"`
- [ ] `TGFB1` replaces `TGF-beta` in M2c/M2d macrophages
- [ ] `ACTA2` replaces `Alpha-SMA/ACTA2` in smooth muscle cells
- [ ] Search for "TGF-beta" still returns M2c/M2d macrophages (via alias)
- [ ] `normalize_markers.py` runs without errors and produces summary
- [ ] No duplicate markers within any single positive/negative array
