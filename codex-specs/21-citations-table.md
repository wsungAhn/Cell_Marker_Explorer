# Codex Spec: 21-citations-table

## Purpose
Add a citations lookup table to the dataset and wire it into the cell detail view so that reference numbers (1–157) resolve to actual publications with titles, authors, DOIs, and links. Currently the cell view shows "Reference 31" with zero context — this task makes references useful.

## Dependencies
- `01-data-schema.md` (schema extension)
- `05-datastore.md` (new `getCitation()` method)
- `09-cell-view.md` (updated references rendering)
- `14-links.md` (PubMed/DOI link generation)

## Output Files
- `data/cell-markers.json` — add `metadata.citations[]` array
- `js/datastore.js` — add `getCitation(id)` and `getCitationsForCellType(cellTypeId)` methods
- `js/cell-view.js` — update references section to render structured citations

## Schema Addition

### `metadata.citations[]`
```json
{
  "id": 1,
  "authors": "Zhang Y, Wang X, et al.",
  "title": "PD-L1 expression in gastric cancer and its correlation with clinical outcomes",
  "journal": "J Immunother Cancer",
  "year": 2020,
  "doi": "10.1136/jitc-2019-000123",
  "pmid": "32112345",
  "url": "https://pubmed.ncbi.nlm.nih.gov/32112345/",
  "source_page": "labome_cell_markers"
}
```

### Field Rules
- `id` (required, integer): Matches the numbers in `cellType.references[]`
- `authors` (required, string): First author + "et al." or full author list if short
- `title` (required, string): Full article title
- `journal` (optional, string): Journal abbreviation
- `year` (optional, integer): Publication year
- `doi` (optional, string): DOI without the `https://doi.org/` prefix
- `pmid` (optional, string): PubMed ID
- `url` (optional, string): Direct link (PubMed, DOI resolver, or publisher)
- `source_page` (required, string): Which Labome page this citation came from — one of: `labome_cell_markers`, `labome_tb_cell_markers`, `labome_macrophage_markers`, `labome_stem_cell_markers`

## Scraping Instructions (Codex executes at build time)

### Step 1: Fetch each Labome page
```
https://www.labome.com/method/Cell-Markers.html
https://www.labome.com/method/T-Cell-Markers-and-B-Cell-Markers.html
https://www.labome.com/method/Macrophage-Markers.html
https://www.labome.com/review/stemcells.html
```

### Step 2: Find the references section
Each Labome page has a numbered references section near the bottom, typically in an `<ol>` or `<div>` with numbered entries like:
```html
<li value="1">Zhang Y, et al. <a href="...">PD-L1 expression...</a> J Immunother Cancer. 2020;8(1):e000123.</li>
```

### Step 3: Parse each reference
For each `<li>` in the references list:
1. Extract the number from `value` attribute or from the text prefix
2. Extract author names (text before the first period or title link)
3. Extract title (from `<a>` text or from text between periods)
4. Extract journal name and year (typically after the title, before the closing `</li>`)
5. Extract DOI/PMID from any `<a href>` links (look for `doi.org/`, `pubmed`, `ncbi.nlm.nih.gov`)
6. Set `source_page` based on which Labome page was being parsed

### Step 4: Handle ID conflicts across pages
Labome pages may share some citations (same number = same paper) or may have independent numbering. Strategy:
1. First check if the same reference number on different pages refers to the same paper (compare title/author text)
2. If same paper: keep one entry, merge any additional metadata from the other page
3. If different papers with same number: offset the second page's IDs by +1000 (e.g., page B ref 1 becomes id 1001) and update all `cellType.references[]` arrays for cell types sourced from page B accordingly

### Step 5: Validate
- Every `id` in `citations[]` must be referenced by at least one `cellType.references[]` entry
- Every number in any `cellType.references[]` must have a matching `citations[].id`
- No duplicate `id` values in `citations[]`

## Datastore API Addition

```javascript
// Add to _buildIndices():
this.citationById = new Map();
if (this.data && this.data.metadata && this.data.metadata.citations) {
  this.data.metadata.citations.forEach(function(c) {
    this.citationById.set(c.id, c);
  }.bind(this));
}

// New methods:
getCitation(id) {
  return this.citationById.get(id) || null;
}

getCitationsForCellType(cellTypeId) {
  var cellType = this.getCellTypeById(cellTypeId);
  if (!cellType || !cellType.references) return [];
  var self = this;
  return cellType.references.map(function(refId) {
    return self.getCitation(refId);
  }).filter(Boolean);
}
```

## Cell View Updates

### New rendering:
```html
<div class="references-section">
  <h3>References</h3>
  <ol class="references-list">
    <li class="reference-item" data-ref-id="31">
      <span class="ref-authors">Zhang Y, et al.</span>
      <a class="ref-title" href="https://pubmed.ncbi.nlm.nih.gov/32112345/" target="_blank" rel="noopener">
        PD-L1 expression in gastric cancer and its correlation with clinical outcomes
      </a>
      <span class="ref-journal">J Immunother Cancer</span>
      <span class="ref-year">(2020)</span>
      <a class="ref-doi" href="https://doi.org/10.1136/jitc-2019-000123" target="_blank" rel="noopener">
        doi:10.1136/jitc-2019-000123
      </a>
    </li>
  </ol>
</div>
```

### Fallback for unresolvable references:
```html
<li class="reference-item reference-unresolved" data-ref-id="31">
  <span class="ref-id">Reference 31</span>
  <span class="ref-note">Citation details pending</span>
</li>
```

### CSS additions:
```css
.references-list { list-style: decimal; padding-left: 24px; }
.reference-item { margin-bottom: 8px; font-size: 13px; line-height: 1.5; }
.ref-authors { font-weight: 600; }
.ref-title { color: var(--accent-blue); text-decoration: none; }
.ref-title:hover { text-decoration: underline; }
.ref-journal { font-style: italic; color: var(--text-secondary); }
.ref-year { color: var(--text-muted); }
.ref-doi { font-family: var(--font-mono); font-size: 11px; color: var(--text-muted); }
.reference-unresolved { color: var(--text-muted); font-style: italic; }
```

## Edge Cases
- Labome pages may be temporarily down: retry with backoff (3 attempts, 5s delay)
- Reference numbering conflicts across pages: offset or deduplicate as described in Step 4
- Some references may have only `raw_text` (no structured fields): render as plain text
- Cell types with empty `references[]` (20 cell types): show "No references available"
- Very long author lists: truncate to first author + "et al." after 3 authors

## Test Criteria
- [ ] `metadata.citations` array exists in `cell-markers.json`
- [ ] Every `cellType.references[]` number has a matching citation entry
- [ ] `getCitation(31)` returns a structured citation object
- [ ] `getCitationsForCellType('hepatocyte')` returns array of citation objects
- [ ] Cell view renders citations with title, authors, journal, year, DOI link
- [ ] Unresolvable references show "Citation details pending" fallback
- [ ] Cell types with no references show "No references available"
- [ ] External links (PubMed, DOI) open in new tab
