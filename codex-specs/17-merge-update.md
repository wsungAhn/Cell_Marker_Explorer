# Codex Spec: 17-merge-update

## Purpose
Create the merge and update script that takes scraped data from `data/scraped/` and merges it into the main `data/cell-markers.json` dataset. Handles conflict resolution, new cell type/marker addition, changelog generation, and validation.

## Dependencies
- `01-data-schema.md` (schema validation)
- `16-scraper.md` (scraped data format)

## Output Files
- `updater/merge.py` — Main merge script
- `updater/validate.py` — Schema validation script
- `data/changelog.json` — Version changelog

## Merge Script API

```python
class DatasetMerger:
    def __init__(self, dataset_path: str, scraped_dir: str, config: dict)

    # Load data
    def load_current_dataset(self) -> dict
    def load_scraped_files(self, since_date: str = None) -> list[dict]

    # Merge operations
    def merge_scraped_data(self, scraped: list[dict]) -> MergeResult
    def merge_cell_type(self, existing: dict, new: dict) -> dict
    def merge_markers(self, existing_markers: dict, new_markers: dict) -> dict

    # Conflict resolution
    def resolve_marker_conflict(self, marker: str, existing: dict, new: dict) -> dict
    def fuzzy_match_marker(self, marker_a: str, marker_b: str) -> float

    # New entity handling
    def add_new_cell_type(self, cell_type: dict, suggested_organ: str, suggested_microstructure: str) -> dict
    def create_review_queue_item(self, cell_type: dict, source: str) -> dict

    # Version management
    def bump_version(self, change_type: str) -> str  # 'major', 'minor', 'patch'
    def update_metadata(self) -> None

    # Changelog
    def generate_changelog_entry(self, merge_result: MergeResult) -> dict
    def save_changelog(self, entry: dict) -> None

    # Output
    def save_dataset(self) -> None
    def save_review_queue(self, items: list[dict]) -> None

    # Validation
    def validate_dataset(self) -> list[str]  # returns list of validation errors


class MergeResult:
    cell_types_added: int
    cell_types_modified: int
    cell_types_removed: int
    markers_added: int
    markers_modified: int
    markers_removed: int
    conflicts: list[dict]
    review_queue: list[dict]
    details: dict
```

## Merge Algorithm

### Step 1: Load Current Dataset
```python
dataset = load_current_dataset()  # data/cell-markers.json
current_version = dataset["metadata"]["version"]  # e.g. "1.0.0"
```

### Step 2: Load Scraped Files
```python
scraped_files = load_scraped_files(since_date=last_scrape_date)
# Returns list of dicts from data/scraped/*.json
```

### Step 3: Match Cell Types
For each cell type in scraped data:
1. Try exact match on `name` against existing cell types
2. Try match on `aliases`
3. Try fuzzy match (Levenshtein distance < 0.3) on name
4. If no match: add to review queue (new cell type)

### Step 4: Merge Markers
For matched cell types:
```python
def merge_markers(existing, new):
    # Positive markers
    for marker in new["positive"]:
        if marker not in existing["positive"] and marker not in existing["negative"]:
            # New marker — add it
            existing["positive"].append(marker)
            result.markers_added += 1
        elif marker in existing["negative"]:
            # Conflict: marker was negative, now positive
            resolved = resolve_marker_conflict(marker, existing, new)
            result.conflicts.append(resolved)

    # Same for negative markers
    # ...
    return existing
```

### Step 5: Conflict Resolution
Based on `config.merge_rules.conflict_resolution`:

| Strategy | Behavior |
|----------|----------|
| `prefer_labome` | Labome data wins conflicts |
| `prefer_newest` | Most recently scraped data wins |
| `prefer_existing` | Keep existing data, log conflict |
| `manual` | Add to review queue for human decision |

### Step 6: New Cell Types
If `config.merge_rules.auto_add_new_cell_types` is `true`:
- Auto-add with suggested organ/microstructure placement
- Log as added in changelog

If `false` (default):
- Add to review queue file: `data/review_queue.json`
- Review queue format:
```json
{
  "items": [
    {
      "type": "new_cell_type",
      "source": "cellmarker2",
      "name": "New Cell Type Name",
      "suggested_organ": "liver",
      "suggested_microstructure": "hepatic-lobule",
      "markers": { "human": { "positive": [...], "negative": [...] }, "mouse": {...} },
      "status": "pending_review",
      "notes": "Auto-matched to liver based on marker similarity"
    }
  ]
}
```

### Step 7: Version Bump
- New cell types added: minor version bump (1.0.0 → 1.1.0)
- Markers added/modified: patch version bump (1.0.0 → 1.0.1)
- Breaking schema changes: major version bump (1.0.0 → 2.0.0)

### Step 8: Update Metadata
```python
dataset["metadata"]["version"] = new_version
dataset["metadata"]["last_updated"] = today
dataset["metadata"]["next_scheduled_update"] = today + 6 months
# Update source last_scraped dates
```

### Step 9: Generate Changelog
```json
{
  "updates": [
    {
      "version": "1.0.1",
      "date": "2024-12-27",
      "description": "Added 3 new markers, updated 5 cell types from Labome refresh",
      "sources_scraped": ["labome_cell_markers", "labome_macrophage_markers"],
      "changes": {
        "cell_types_added": 0,
        "cell_types_modified": 5,
        "cell_types_removed": 0,
        "markers_added": 3,
        "markers_modified": 1,
        "markers_removed": 0
      },
      "details": {
        "added_cell_types": [],
        "modified_cell_types": [
          {
            "id": "m1-macrophage",
            "changes": ["Added marker: IDO", "Changed marker: NOS2 (confirmed)"]
          }
        ],
        "removed_cell_types": []
      }
    }
  ]
}
```

### Step 10: Validate and Save
```python
errors = validate_dataset(dataset)
if errors:
    log_errors(errors)
    # Save backup of current dataset
    save_backup(dataset_path)
    # Save new dataset with validation warnings
save_dataset(dataset)
save_changelog(changelog_entry)
```

## Validation Script (validate.py)

```python
class DatasetValidator:
    def __init__(self, schema_path: str = None)

    def validate(self, dataset: dict) -> ValidationResult
    def validate_metadata(self, metadata: dict) -> list[str]
    def validate_tissue_systems(self, tissue_systems: list) -> list[str]
    def validate_organs(self, organs: list) -> list[str]
    def validate_cell_types(self, cell_types: list) -> list[str]
    def validate_markers(self, markers: dict) -> list[str]
    def check_id_uniqueness(self, items: list, key: str) -> list[str]
    def check_referential_integrity(self, dataset: dict) -> list[str]

class ValidationResult:
    errors: list[str]     # Must fix before save
    warnings: list[str]   # Should review
    info: list[str]       # FYI
```

### Validation Rules
1. JSON parses without error
2. All required fields present (per schema in spec 01)
3. All IDs are unique within their parent
4. Every cell type has at least one positive marker in at least one species
5. Version follows semver
6. No duplicate markers within same array
7. All source URLs are valid
8. Marker nomenclature follows rules (human UPPERCASE, mouse Title-case)

## CLI Usage
```bash
# Run merge with all scraped files
python updater/merge.py

# Run merge with specific scraped file
python updater/merge.py --scraped data/scraped/labome_cell_markers_20241227.json

# Dry run (no file changes)
python updater/merge.py --dry-run

# Validate current dataset
python updater/validate.py

# Validate specific file
python updater/validate.py --file data/cell-markers.json

# Review queue management
python updater/merge.py --review-queue
python updater/merge.py --approve-item "new-cell-type-id"
python updater/merge.py --reject-item "new-cell-type-id"
```

## Edge Cases
- Scraped file with no matching cell types: all go to review queue
- Marker name variants (e.g., "CD68" vs "CD-68"): fuzzy match and merge
- Species mismatch in scraped data: flag for review
- Empty scraped files: skip with warning
- Dataset corruption on save: restore from backup
- Concurrent merge runs: file lock mechanism

## Test Criteria
- [ ] Merge script runs without errors
- [ ] New markers are added to correct cell types
- [ ] Conflicts are resolved per configured strategy
- [ ] New cell types go to review queue when auto_add is false
- [ ] Version is bumped correctly
- [ ] Changelog entry is generated
- [ ] Metadata is updated
- [ ] Validation catches schema violations
- [ ] Dry run makes no file changes
- [ ] Backup is created before save
- [ ] Review queue approve/reject works
