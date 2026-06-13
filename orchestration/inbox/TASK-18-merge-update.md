# Codex Task 18 — Merge & Validate Pipeline (updater/merge.py + validate.py + README.md)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your deliverables for this task
Produce **`updater/merge.py`**, **`updater/validate.py`**, **`updater/README.md`** — and nothing else. **Output location (loop rule §8):** write them under **`orchestration/outbox/<id>/updater/`** and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

(Note: spec 17 lists `data/changelog.json` as an output, but it ALREADY EXISTS in the live tree with shape `{ "updates": [...] }` and is read by the app's update-badge. Do NOT regenerate or overwrite it here — `merge.py` must **append/prepend new entries to the existing `{updates:[...]}` structure**, preserving prior entries. Do not ship a changelog.json in your outbox.)

## Contract
Implement exactly per **`codex-specs/17-merge-update.md`** (and conform output to `codex-specs/01-data-schema.md`). Key non-negotiables:
- `merge.py`: `DatasetMerger` + `MergeResult` per spec — load current dataset + scraped files, match cell types (exact → alias → fuzzy <0.3), merge markers, conflict resolution per `config.merge_rules.conflict_resolution` (prefer_labome/prefer_newest/prefer_existing/manual), new cell types → `data/review_queue.json` when `auto_add_new_cell_types` false, semver bump (new types→minor, markers→patch, schema→major), metadata update (version/last_updated/next_scheduled_update +6mo), **append** changelog entry to existing `{updates:[...]}`, backup before save, file lock for concurrent runs.
- `validate.py`: `DatasetValidator` + `ValidationResult(errors/warnings/info)` per spec — JSON parses, required fields (schema 01), ID uniqueness within parent, every cell type ≥1 positive marker in ≥1 species, semver, no dup markers in an array, referential integrity, marker nomenclature (human UPPERCASE / mouse Title-case as warnings).
- `README.md`: document the updater pipeline (scraper → merge → validate), CLI usage, config, review-queue workflow, schedule.
- CLI: `merge.py` `--dry-run`/`--scraped <file>`/`--review-queue`/`--approve-item`/`--reject-item`; `validate.py` `--file <path>` (default `data/cell-markers.json`). argparse.

## Project Python conventions (global rules — follow strictly)
- Top module-purpose comment; snake_case funcs / PascalCase classes; **type hints required**; **every external call (file I/O, json/yaml parse) in try/except with logging**; no magic numbers (semver rules / fuzzy threshold / +6mo as named constants or config).
- Import-safe & offline: importing modules and running `--help`/`--dry-run`/`validate.py --file` must not require network. `--dry-run` makes **no file changes**.

## Verify before done
- `python3 -m py_compile` passes for both. **`python3 validate.py --file data/cell-markers.json` runs and reports the CURRENT live dataset as valid (no errors)** — the shipped dataset must pass your own validator. `merge.py --dry-run` makes no file changes and works offline. `merge.py --help` / `validate.py --help` work. Conform changelog append to the existing `{updates:[...]}` shape.

## Done when
Every checkbox in spec 17's **Test Criteria** verifiable offline is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — this is the final module.
