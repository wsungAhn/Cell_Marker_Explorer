# Codex Spec: 16-scraper

## Purpose
Create the Python web scraper that periodically fetches cell marker data from Labome, CellMarker 2.0, and PanglaoDB. The scraper outputs structured JSON files to `data/scraped/` for the merge script to process.

## Dependencies
- `01-data-schema.md` (output must conform to schema)
- `config.yaml` (scraping configuration)

## Output Files
- `updater/scraper.py` — Main scraper script
- `updater/config.yaml` — Configuration file
- `updater/requirements.txt` — Python dependencies
- `data/scraped/labome_cell_markers_{date}.json`
- `data/scraped/labome_tb_cell_markers_{date}.json`
- `data/scraped/labome_macrophage_markers_{date}.json`
- `data/scraped/labome_stem_cell_markers_{date}.json`
- `data/scraped/cellmarker2_{date}.json`
- `data/scraped/panglaodb_{date}.json`

## Configuration (config.yaml)

```yaml
schedule:
  interval_months: 6
  next_run: "2024-12-27"

sources:
  labome:
    pages:
      - name: "Cell Markers"
        url: "https://www.labome.com/method/Cell-Markers.html"
        output: "labome_cell_markers"
      - name: "T Cell and B Cell Markers"
        url: "https://www.labome.com/method/T-Cell-Markers-and-B-Cell-Markers.html"
        output: "labome_tb_cell_markers"
      - name: "Macrophage Markers"
        url: "https://www.labome.com/method/Macrophage-Markers.html"
        output: "labome_macrophage_markers"
      - name: "Stem Cell Markers"
        url: "https://www.labome.com/review/stemcells.html"
        output: "labome_stem_cell_markers"
    rate_limit_seconds: 2

  cellmarker2:
    url: "http://bio-bigdata.hrbmu.edu.cn/CellMarker/"
    search_url: "http://bio-bigdata.hrbmu.edu.cn/CellMarker/search/"
    output: "cellmarker2"
    rate_limit_seconds: 1

  panglaodb:
    url: "https://panglaodb.se/"
    api_url: "https://panglaodb.se/api/v1/"
    output: "panglaodb"
    rate_limit_seconds: 1

output:
  directory: "data/scraped"
  date_format: "%Y%m%d"

merge_rules:
  conflict_resolution: "prefer_labome"  # When markers conflict, prefer Labome data
  auto_add_new_markers: true             # Automatically add new markers to existing cell types
  auto_add_new_cell_types: false         # Require manual review for new cell types
  marker_match_threshold: 0.8            # Fuzzy match threshold for marker name variants

logging:
  level: "INFO"
  file: "updater/scraper.log"
```

## Scraper Architecture

```python
class BaseScraper:
    """Base class for all scrapers."""
    def __init__(self, config: dict)
    async def fetch_page(self, url: str) -> str
    def save_output(self, data: dict, source_name: str) -> str
    def log(self, message: str, level: str = "INFO")

class LabomeScraper(BaseScraper):
    """Scrapes Labome cell marker pages."""
    def scrape_cell_markers(self) -> dict
    def scrape_tb_cell_markers(self) -> dict
    def scrape_macrophage_markers(self) -> dict
    def scrape_stem_cell_markers(self) -> dict
    def parse_marker_table(self, html: str, cell_type: str) -> list[dict]
    def extract_cell_type_section(self, html: str) -> list[dict]

class CellMarker2Scraper(BaseScraper):
    """Scrapes CellMarker 2.0 database."""
    def scrape_all(self) -> dict
    def search_marker(self, marker: str) -> list[dict]
    def download_bulk_data(self) -> dict

class PanglaoDBScraper(BaseScraper):
    """Scrapes PanglaoDB."""
    def scrape_all(self) -> dict
    def search_marker(self, marker: str) -> list[dict]
    def get_cell_type_markers(self, cell_type: str) -> dict

def main():
    """Run all scrapers based on config."""
    config = load_config("updater/config.yaml")
    results = {}
    # Run Labome scraper
    # Run CellMarker2 scraper
    # Run PanglaoDB scraper
    # Save all outputs
    # Print summary
```

## Labome Scraping Strategy

### Page Structure
Labome pages have consistent HTML structure:
- Cell types are in `<h2>` or `<h3>` sections
- Markers are in tables with columns: Marker, Species, Function, References
- Some markers are in bullet lists instead of tables

### Parsing Logic
1. Fetch page HTML with `requests`
2. Parse with `BeautifulSoup`
3. Find all cell type sections (h2/h3 headings)
4. For each section:
   - Extract cell type name from heading
   - Find associated table or list
   - Parse marker names, separating positive/negative
   - Extract species information
   - Extract reference numbers
5. Build structured output dict

### Output Format (per source)
```json
{
  "source": "labome_cell_markers",
  "scrape_date": "20241227",
  "url": "https://www.labome.com/method/Cell-Markers.html",
  "cell_types": [
    {
      "name": "White Adipocyte",
      "markers": {
        "human": {
          "positive": ["LEP", "HOXC8", "HOXC9", "PLIN1"],
          "negative": []
        },
        "mouse": {
          "positive": ["Lep", "Hoxc8", "Hoxc9", "Plin1"],
          "negative": []
        }
      },
      "aliases": ["White fat cell"],
      "references": [1, 2, 3, 4],
      "raw_text": "Leptin (LEP) [1], HOXC8 [2]..."
    }
  ]
}
```

## CellMarker 2.0 Scraping Strategy
- Download bulk data file if available (TSV format)
- Alternatively, search for each known marker and collect results
- Map CellMarker 2.0 cell type names to our internal IDs

## PanglaoDB Scraping Strategy
- Use PanglaoDB API endpoint if available
- Alternatively, scrape search results for known markers
- PanglaoDB provides species-specific marker lists

## Error Handling
- Network errors: retry 3 times with exponential backoff
- Parse errors: log warning, skip that cell type, continue
- Rate limiting: respect configured rate_limit_seconds
- robots.txt: check and respect

## Requirements (requirements.txt)
```
requests>=2.31.0
beautifulsoup4>=4.12.0
pyyaml>=6.0
jsonschema>=4.20.0
lxml>=4.9.0
tqdm>=4.66.0
```

## CLI Usage
```bash
# Run all scrapers
python updater/scraper.py

# Run specific source
python updater/scraper.py --source labome

# Dry run (no file output)
python updater/scraper.py --dry-run

# Force run (ignore schedule)
python updater/scraper.py --force
```

## Edge Cases
- Labome page structure changes: log warning, attempt best-effort parsing
- CellMarker 2.0 / PanglaoDB API changes: fall back to HTML scraping
- Duplicate cell types across sources: keep all, merge script handles dedup
- Markers with ambiguous species: flag for manual review
- Very large pages: stream parsing instead of loading entire HTML

## Test Criteria
- [ ] Scraper runs without errors on all configured sources
- [ ] Output files are valid JSON matching schema
- [ ] Rate limiting is respected
- [ ] Network errors are handled with retries
- [ ] Parse errors are logged and don't crash the scraper
- [ ] Output includes scrape_date and source URL
- [ ] CLI flags work correctly
