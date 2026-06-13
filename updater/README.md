# Cell Markers Explorer Updater

This directory contains the offline-friendly refresh pipeline for
`data/cell-markers.json`.

## Pipeline

1. `scraper.py` fetches configured sources and writes merge-ready JSON into
   `data/scraped/`.
2. `merge.py` reads the current dataset plus scraped JSON, matches existing
   cell types, merges markers, queues unknown cell types, bumps the dataset
   version, updates metadata, and prepends an entry to `data/changelog.json`.
3. `validate.py` checks the final dataset contract from
   `codex-specs/01-data-schema.md`.

The web app's single source of truth remains `data/cell-markers.json`.
`data/changelog.json` must keep the existing shape:

```json
{
  "updates": []
}
```

## Scraped Input Shape

Each scraped file should be a JSON object like:

```json
{
  "source": "labome_cell_markers",
  "scrape_date": "20241227",
  "url": "https://www.labome.com/method/Cell-Markers.html",
  "cell_types": [
    {
      "name": "White Adipocyte",
      "markers": {
        "human": { "positive": ["LEP"], "negative": [] },
        "mouse": { "positive": ["Lep"], "negative": [] }
      },
      "aliases": ["White fat cell"],
      "references": [1],
      "raw_text": "source excerpt"
    }
  ]
}
```

## Merge Usage

```bash
python updater/merge.py
python updater/merge.py --dry-run
python updater/merge.py --scraped data/scraped/labome_cell_markers_20241227.json
python updater/merge.py --dataset data/cell-markers.json --scraped-dir data/scraped
```

`--dry-run` performs the merge in memory, validates the result, prints a JSON
summary, and makes no file changes.

The merge uses a dataset lock file during writes, creates a backup before
saving the dataset, and validates before writing.

## Review Queue

By default, new cell types are not auto-added. They are written to
`data/review_queue.json`:

```bash
python updater/merge.py --review-queue
python updater/merge.py --approve-item "New Cell Type Name"
python updater/merge.py --reject-item "New Cell Type Name"
```

Approval and rejection currently update the queue item status. Curated
placement into the dataset should be reviewed before a future merge run.

## Validation Usage

```bash
python updater/validate.py
python updater/validate.py --file data/cell-markers.json
```

Validation errors fail with a non-zero exit code. Marker nomenclature issues
are warnings because the live dataset includes curated symbols and protein
names that do not always fit simple species casing rules.

## Configuration

`updater/config.yaml` controls:

- `schedule.interval_months`: metadata `next_scheduled_update` interval.
- `sources`: scraper source URLs and output names.
- `output.directory`: scraped output directory.
- `merge_rules.conflict_resolution`: `prefer_labome`, `prefer_newest`,
  `prefer_existing`, or `manual`.
- `merge_rules.auto_add_new_markers`: add new markers to matched cell types.
- `merge_rules.auto_add_new_cell_types`: add new cell types directly instead
  of queueing them for review.

## Schedule

Run the scraper and merge pipeline every six months, matching the project
metadata schedule:

```bash
python updater/scraper.py --force
python updater/merge.py --dry-run
python updater/merge.py
python updater/validate.py --file data/cell-markers.json
```

Always inspect `data/review_queue.json` after a merge and resolve pending
items before treating the refresh as complete.
