# Codex Spec: 12-export

## Purpose
Create the data export feature — allows users to export marker data as CSV or TSV files. Supports exporting a single cell type, a comparison table, or all visible data.

## Dependencies
- `05-datastore.md` (data access)
- `09-cell-view.md` (single cell export button)
- `11-compare.md` (comparison table export)

## Output Files
- `js/export.js`

## API

```javascript
class ExportController {
  constructor(datastore: CellMarkersDatastore)

  // Single cell type export
  exportCellType(cellTypeId: string, species: 'human' | 'mouse', format: 'csv' | 'tsv'): void

  // Compare table export
  exportCompare(cellTypeIds: string[], species: 'human' | 'mouse', format: 'csv' | 'tsv', includeNegative: boolean): void

  // Bulk export
  exportOrgan(organId: string, species: 'human' | 'mouse', format: 'csv' | 'tsv'): void
  exportTissueSystem(tissueSystemId: string, species: 'human' | 'mouse', format: 'csv' | 'tsv'): void
  exportAll(species: 'human' | 'mouse', format: 'csv' | 'tsv'): void

  // Utility
  generateCSV(data: object[], headers: string[]): string
  generateTSV(data: object[], headers: string[]): string
  download(content: string, filename: string, mimeType: string): void
}
```

## CSV/TSV Format

### Single Cell Type Export
```csv
Cell Type,Hepatocyte
Species,Human
Tissue System,Digestive System
Organ,Liver
Microstructure,Hepatic Lobule
Source,labome
Version,1.0.0
,
Marker,Type
HP,positive
ASGR1,positive
ALB,positive
CYP3A4,positive
```

### Compare Table Export
```csv
Marker,Hepatocyte,Kupffer Cell,M1 Macrophage
CD68,-,+,+
CD86,-,-,+
ASGR1,+,-,-
HP,+,-,-
CD163,-,+,-
MHC-II,-,+,+
```

### Organ Export
```csv
Cell Type,Microstructure,Positive Markers,Negative Markers,Source
Hepatocyte,Hepatic Lobule,"HP; ASGR1; ALB; CYP3A4",,labome
Kupffer Cell,Hepatic Lobule,"CD68; CD163L; CLEC4G; CD163",,labome
Liver Sinusoidal Endothelial Cell,Hepatic Sinusoids,"LYVE-1; CD32b; STAB2; CLEC4G",,labome
```

### Bulk Export (All)
```csv
Tissue System,Organ,Microstructure,Cell Type,Positive Markers,Negative Markers,Source,Version
Integumentary,Skin,Epidermis,Keratinocyte,"KRT1; KRT5; KRT10; KRT14; KRT15; KRT16; E-cadherin; EpCAM",,labome,1.0.0
...
```

## Download Implementation
```javascript
download(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
```

## Filename Convention
- Single cell: `{cellTypeId}_{species}_markers.csv`
- Compare: `compare_{cellTypeIds}_{species}.csv`
- Organ: `{organId}_{species}_markers.csv`
- Tissue system: `{tissueSystemId}_{species}_markers.csv`
- All: `all_cell_markers_{species}.csv`

## CSV Generation Rules
- Use RFC 4180 format
- Fields containing commas, quotes, or newlines are double-quoted
- Double quotes within fields are escaped as `""`
- Marker lists within a field are semicolon-separated
- UTF-8 encoding with BOM for Excel compatibility

## Edge Cases
- Cell type with no markers for selected species: export with empty marker fields
- Very large export (all data): may take a few seconds, show progress indicator
- Special characters in marker names (slashes, hyphens): preserve as-is
- Browser doesn't support Blob download: show data in a new window for manual copy

## Test Criteria
- [ ] Single cell type export produces valid CSV
- [ ] Compare export produces valid CSV with correct +/-
- [ ] Organ export includes all cell types in that organ
- [ ] Bulk export includes all cell types
- [ ] TSV format uses tabs correctly
- [ ] Download triggers browser save dialog
- [ ] CSV opens correctly in Excel (BOM present)
- [ ] Special characters in markers are properly escaped
- [ ] Empty marker fields handled correctly
