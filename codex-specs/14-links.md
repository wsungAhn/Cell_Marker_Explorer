# Codex Spec: 14-links

## Purpose
Create the external database link generator — generates links to UniProt, CellMarker 2.0, PanglaoDB, and other databases for each marker. These links appear in the cell detail view and allow researchers to quickly look up detailed protein/gene information.

## Dependencies
- `05-datastore.md` (marker names, species)

## Output Files
- `js/links.js`

## API

```javascript
class LinksGenerator {
  constructor()

  // Generate all links for a marker
  getLinks(marker: string, species: 'human' | 'mouse'): MarkerLink[]

  // Individual link generators
  getUniProtLink(geneSymbol: string, species: 'human' | 'mouse'): string
  getCellMarkerLink(marker: string): string
  getPanglaoDBLink(marker: string): string
  getNCBIGeneLink(geneSymbol: string, species: 'human' | 'mouse'): string

  // Render links section
  renderLinksSection(markers: string[], species: 'human' | 'mouse'): HTMLElement
}
```

## Type Definitions

```typescript
interface MarkerLink {
  database: string;       // e.g. 'UniProt', 'CellMarker 2.0'
  url: string;
  icon?: string;          // path to database icon SVG
  marker: string;
  species: 'human' | 'mouse';
}
```

## Link Templates

### UniProt
```
https://www.uniprot.org/uniprot/?query=gene:{SYMBOL}+organism:{TAXON_ID}
```
- Human taxon ID: 9606
- Mouse taxon ID: 10090
- Only generate for gene symbols (not CD numbers like "CD68" — those go to NCBI)

### NCBI Gene
```
https://www.ncbi.nlm.nih.gov/gene/?term={SYMBOL}+{ORGANISM}
```
- Human: `+Homo+sapiens`
- Mouse: `+Mus+musculus`
- Generate for all markers (gene symbols and CD numbers)

### CellMarker 2.0
```
http://bio-bigdata.hrbmu.edu.cn/CellMarker/search/{MARKER}
```
- Species-agnostic search
- Generate for all markers

### PanglaoDB
```
https://panglaodb.se/search.html?query={MARKER}
```
- Species-agnostic search
- Generate for all markers

## Marker Name Parsing

### Gene Symbols
- Human: all uppercase, may contain digits (e.g. `ASGR1`, `FOXP3`, `UCP1`)
- Mouse: first letter uppercase, rest lowercase (e.g. `Asgr1`, `Foxp3`, `Ucp1`)
- For UniProt/NCBI links: use the gene symbol as-is

### CD Numbers
- Format: `CD` followed by digits, optionally with suffix (e.g. `CD68`, `CD45RA`, `CD146`)
- For UniProt: search by CD designation (e.g. `gene:CD68`)
- For NCBI: search by common name
- For CellMarker/PanglaoDB: use CD number as-is

### Fusion Markers (slash notation)
- e.g. `VE-cadherin/CD144`, `c-Kit/CD117`
- Generate separate links for each part
- `VE-cadherin` → UniProt gene search for `CDH5`
- `CD144` → NCBI search for `CD144`

### Special Markers
- `Lin-` (lineage negative): no external link (not a specific gene)
- `FcεRI`: link to FCER1A gene
- `2B4`: link to CD244/SLAMF4
- `Ly-6G`: link to LYG6 gene (mouse-specific)

## Known Aliases Map
```javascript
const MARKER_ALIASES = {
  'VE-cadherin': 'CDH5',
  'c-Kit': 'KIT',
  'Langerin': 'CD207',
  'DEC-205': 'LY75',
  'DC-SIGN': 'CD209',
  'DC-LAMP': 'CD208',
  'B220': 'CD45R',
  'FcεRI': 'FCER1A',
  '2B4': 'CD244',
  'Ly-6G': 'LY6G',
  'F4/80': 'ADGRE1',
  'Gr-1': 'LY6G',
  'Mac-1': 'ITGAM',
  'Sca-1': 'LY6A',
  'PD-1': 'PDCD1',
  'CTLA-4': 'CTLA4',
  'GITR': 'TNFRSF18',
  'OX40': 'TNFRSF4',
  'TIM-1': 'HAVCR1',
  'NG2': 'CSPG4',
  'Podoplanin': 'PDPN',
  'Thrombomodulin': 'THBD',
  'Endomucin': 'EMCN',
  'Iba1': 'AIF1',
  'cTnI': 'TNNI3',
  'cTnT': 'TNNT2',
  'Alpha-SMA': 'ACTA2',
  'Pro-SFTPC': 'SFTPC',
};
```

## Links Section HTML
```html
<div class="links-section">
  <h3>External Links</h3>
  <div class="links-grid">
    <div class="link-group" data-marker="CD68">
      <span class="link-marker">CD68</span>
      <a href="https://www.ncbi.nlm.nih.gov/gene/?term=CD68+Homo+sapiens"
         target="_blank" rel="noopener" class="db-link">
        <span class="db-name">NCBI Gene</span>
      </a>
      <a href="http://bio-bigdata.hrbmu.edu.cn/CellMarker/search/CD68"
         target="_blank" rel="noopener" class="db-link">
        <span class="db-name">CellMarker 2.0</span>
      </a>
      <a href="https://panglaodb.se/search.html?query=CD68"
         target="_blank" rel="noopener" class="db-link">
        <span class="db-name">PanglaoDB</span>
      </a>
    </div>
  </div>
</div>
```

## Edge Cases
- Marker with no known gene symbol (e.g. `Lin-`): skip UniProt/NCBI, only show CellMarker/PanglaoDB
- Marker alias not in map: use marker name as-is for search
- External site down: links still generated (no pre-validation)
- Mouse-specific markers (Ly-6G, F4/80): use mouse taxon ID for UniProt

## Test Criteria
- [ ] UniProt links use correct taxon IDs for human/mouse
- [ ] CD numbers generate NCBI links
- [ ] Fusion markers generate links for both parts
- [ ] Known aliases resolve to correct gene symbols
- [ ] All links open in new tab with rel="noopener"
- [ ] Lin- and other non-gene markers handled gracefully
- [ ] Links section renders correctly in cell view
