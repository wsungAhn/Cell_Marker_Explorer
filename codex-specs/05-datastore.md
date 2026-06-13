# Codex Spec: 05-datastore

## Purpose
Create the data loading and access layer. This module fetches `cell-markers.json`, builds lookup indices, and provides a clean API for all other modules to query cell markers data without direct JSON access.

## Dependencies
- `01-data-schema.md` (data structure)
- `04-app-shell.md` (loads before other JS modules)

## Output Files
- `js/datastore.js`

## API

```javascript
class CellMarkersDatastore {
  constructor()

  // Load data
  async load(url = 'data/cell-markers.json'): Promise<void>

  // Metadata
  getVersion(): string
  getLastUpdated(): string
  getSources(): Source[]

  // Tissue system queries
  getTissueSystems(): TissueSystem[]
  getTissueSystem(id: string): TissueSystem | null

  // Organ queries
  getOrgan(tissueSystemId: string, organId: string): Organ | null
  getOrganById(organId: string): Organ | null  // search across all tissue systems

  // Microstructure queries
  getMicrostructure(tissueSystemId: string, organId: string, microstructureId: string): Microstructure | null
  getMicrostructureById(microstructureId: string): Microstructure | null

  // Cell type queries
  getCellType(path: { tissueSystemId, organId, microstructureId, cellTypeId }): CellType | null
  getCellTypeById(cellTypeId: string): CellType | null  // global search

  // Marker queries
  getMarkersForCellType(cellTypeId: string, species: 'human' | 'mouse'): { positive: string[], negative: string[] }
  findCellTypesByMarker(marker: string, species: 'human' | 'mouse'): CellType[]  // reverse lookup
  findCellTypesByMarkers(markers: string[], species: 'human' | 'mouse', mode: 'any' | 'all'): CellType[]

  // Search
  search(query: string, options?: { species?, limit? }): SearchResult[]
  // Searches across: cell type names, aliases, marker names, tissue system names, organ names, microstructure names

  // Navigation helpers
  getBreadcrumb(path: string): BreadcrumbItem[]
  getPathForCellType(cellTypeId: string): PathObject | null

  // Species
  setSpecies(species: 'human' | 'mouse'): void
  getSpecies(): 'human' | 'mouse'
  onSpeciesChange(callback: (species: string) => void): void  // subscribe

  // Events
  onDataLoaded(callback: () => void): void
}
```

## Type Definitions

```typescript
interface Source {
  title: string;
  url: string;
  doi?: string;
  last_scraped?: string;
}

interface TissueSystem {
  id: string;
  name: string;
  body_map_region: string;
  color: string;
  description: string;
  organs: Organ[];
}

interface Organ {
  id: string;
  name: string;
  icon: string;
  microanatomy_svg: string;
  description: string;
  microstructures: Microstructure[];
}

interface Microstructure {
  id: string;
  name: string;
  svg_region_id: string;
  description: string;
  cell_types: CellType[];
}

interface CellType {
  id: string;
  name: string;
  description: string;
  markers: {
    human: { positive: string[]; negative: string[] };
    mouse: { positive: string[]; negative: string[] };
  };
  aliases: string[];
  references: (string | number)[];
  source: string;
  added_in_version: string;
  last_modified_version: string;
}

interface SearchResult {
  type: 'cell_type' | 'marker' | 'tissue_system' | 'organ' | 'microstructure';
  id: string;
  name: string;
  path: string;  // URL fragment like #/digestive/liver/hepatic-lobule/hepatocyte
  matchField: string;  // which field matched
  matchSnippet: string;  // highlighted snippet
}

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface PathObject {
  tissueSystemId: string;
  organId: string;
  microstructureId: string;
  cellTypeId: string;
}
```

## Index Building
On `load()`, build these indices for fast lookup:
1. **cellTypeById**: `Map<string, CellType>` — global cell type lookup
2. **organById**: `Map<string, Organ>` — global organ lookup
3. **microstructureById**: `Map<string, Microstructure>` — global microstructure lookup
4. **markerIndex**: `Map<string, Set<string>>` — marker name → set of cell type IDs (separate for human/mouse)
5. **searchIndex**: Pre-tokenized name/alias/description tokens for fuzzy search

## Search Algorithm
1. Tokenize query (split on spaces, commas, slashes)
2. For each token, check:
   - Exact match on marker name (highest priority)
   - Prefix match on marker name
   - Substring match on cell type name/alias
   - Substring match on organ/microstructure name
3. Score results by match quality and type priority (marker > cell_type > organ)
4. Return top 50 results (configurable via `limit`)

## Edge Cases
- Data file not found: throw error, app shows error state
- Duplicate IDs: log warning, last one wins
- Empty search query: return empty results
- Marker search with species filter: only search that species' markers
- Cell type with no markers for selected species: return empty arrays

## Test Criteria
- [ ] `load()` resolves successfully with valid JSON
- [ ] `getTissueSystems()` returns 12 items
- [ ] `getCellTypeById('hepatocyte')` returns correct cell type
- [ ] `findCellTypesByMarker('CD68', 'human')` returns all macrophage types
- [ ] `search('FOXP3')` returns Treg cell
- [ ] `search('liver')` returns liver organ + hepatocyte + Kupffer cell
- [ ] Species change fires callback
- [ ] `getPathForCellType()` returns correct navigation path
