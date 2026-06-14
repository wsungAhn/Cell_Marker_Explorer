# Codex Spec: 01-data-schema

## Purpose
Define and validate the JSON schema for `data/cell-markers.json`. This spec ensures the dataset conforms to a strict contract so all downstream components (datastore, search, compare, export) can rely on consistent structure.

## Dependencies
- None (foundational spec)

## Output Files
- `js/data-schema.js` — JavaScript schema validator (optional, for runtime validation)
- Schema documentation embedded in this spec

## JSON Schema Definition

### Top-Level Structure
```json
{
  "metadata": { ... },
  "tissue_systems": [ ... ]
}
```

### Metadata Schema
```json
{
  "version": "semver string (e.g. '1.0.0')",
  "last_updated": "ISO 8601 date (e.g. '2024-06-27')",
  "next_scheduled_update": "ISO 8601 date or null",
  "sources": [
    {
      "title": "string",
      "url": "string (URL)",
      "doi": "string or null",
      "last_scraped": "ISO 8601 date or null"
    }
  ]
}
```

### Tissue System Schema
```json
{
  "id": "lowercase-hyphenated (e.g. 'integumentary')",
  "name": "Display name (e.g. 'Integumentary System')",
  "body_map_region": "SVG region ID for body map click target",
  "color": "Hex color for tissue system accent",
  "description": "1-2 sentence description",
  "organs": [ ... ]
}
```

### Organ Schema
```json
{
  "id": "lowercase-hyphenated (e.g. 'liver')",
  "name": "Display name",
  "icon": "path to organ icon SVG (e.g. 'svg/icons/organ-icons/liver.svg')",
  "microanatomy_svg": "path to microanatomy SVG (e.g. 'svg/microanatomy/liver.svg')",
  "description": "1-2 sentence description",
  "microstructures": [ ... ]
}
```

### Microstructure Schema
```json
{
  "id": "lowercase-hyphenated (e.g. 'hepatic-lobule') — also the SVG region element id (v1.1.0: svg_region_id removed)",
  "name": "Display name",
  "description": "1-2 sentence description",
  "cell_types": [ ... ]
}
```

### Cell Type Schema
```json
{
  "id": "lowercase-hyphenated (e.g. 'hepatocyte')",
  "name": "Display name",
  "description": "1-3 sentence description",
  "markers": {
    "human": {
      "positive": ["UPPERCASE gene symbols and CD numbers (e.g. 'ASGR1', 'CD68')"],
      "negative": ["UPPERCASE gene symbols and CD numbers"]
    },
    "mouse": {
      "positive": ["Title-case gene symbols (e.g. 'Asgr1'), CD numbers species-agnostic"],
      "negative": ["Title-case gene symbols, CD numbers"]
    }
  },
  "aliases": ["Alternative names (e.g. 'HSC', 'LSEC')"],
  "references": ["Reference IDs from sources array (integers or strings)"],
  "source": "Provenance tag (e.g. 'labome', 'cellmarker2', 'panglaodb')",
  "added_in_version": "semver",
  "last_modified_version": "semver"
}
```

### Marker Nomenclature Rules
- Human gene symbols: UPPERCASE (e.g. `ASGR1`, `FOXP3`)
- Mouse gene symbols: Title-case first letter (e.g. `Asgr1`, `Foxp3`)
- CD numbers: Species-agnostic, use `CD##` format (e.g. `CD68`, `CD45`)
- Fusion markers: Use slash notation (e.g. `VE-cadherin/CD144`, `c-Kit/CD117`)
- Negative markers: Only include well-established negative markers (not just "absence of positive")

### ID Convention
- All IDs: lowercase, hyphenated
- Examples: `hepatic-lobule`, `cd4-t-cell`, `white-adipocyte`, `m2a-macrophage`
- Must be unique within their parent collection

### Tissue System Colors
| System | Hex |
|--------|-----|
| Integumentary | #F5D5C8 |
| Nervous | #F5E6A3 |
| Cardiovascular | #E8A0A0 |
| Respiratory | #D5E8F0 |
| Digestive | #D4A574 |
| Lymphatic/Immune | #C8D5E0 |
| Endocrine | #E0C8E8 |
| Musculoskeletal | #D5C8B8 |
| Reproductive | #F0C8D8 |
| Urinary | #E8D5A0 |
| Sensory | #C8E8D8 |
| Circulating Immune | #C8D5E0 |

## Validation Rules
1. Every `id` must be unique within its parent array
2. Every `body_map_region` must match an SVG element ID in the body map
3. Every microstructure `id` must match the `<g id>` of its clickable region in the organ's microanatomy SVG (v1.1.0: canonical `id` replaces the removed `svg_region_id`)
4. `version` must follow semver (MAJOR.MINOR.PATCH)
5. `markers.human.positive` and `markers.mouse.positive` must not be empty arrays (every cell type must have at least one positive marker in at least one species)
6. No duplicate markers within the same array (e.g. no `CD68` appearing twice in `markers.human.positive`)

## Edge Cases
- Cell types with mouse-only markers (e.g. Ly-6G, F4/80): human arrays may be empty
- Cell types with human-only markers: mouse arrays may be empty
- Some markers are complexes or heterodimers (e.g. `TCRalpha/beta`): store as single string with slash
- References array may be empty for newly added cell types pending literature curation

## Test Criteria
- [ ] `data/cell-markers.json` parses without error
- [ ] All tissue system IDs are unique
- [ ] All organ IDs are unique within their tissue system
- [ ] All microstructure IDs are unique within their organ
- [ ] All cell type IDs are unique within their microstructure
- [ ] No cell type has both empty human.positive and empty mouse.positive
- [ ] All hex colors are valid 6-digit hex
- [ ] Version string matches semver regex
