# Codex Task 17 — Scraper Pipeline (updater/scraper.py + config.yaml + requirements.txt)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your deliverables for this task
Produce **`updater/scraper.py`**, **`updater/config.yaml`**, **`updater/requirements.txt`** — and nothing else. **Output location (loop rule §8):** write them under **`orchestration/outbox/<id>/updater/`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/16-scraper.md`**. Key non-negotiables:
- `config.yaml` exactly per spec (schedule, the 4 Labome pages + cellmarker2 + panglaodb sources with rate limits, output dir `data/scraped`, merge_rules, logging).
- `requirements.txt` per spec (requests, beautifulsoup4, pyyaml, jsonschema, lxml, tqdm with the given version floors).
- `scraper.py` architecture per spec: `BaseScraper` + `LabomeScraper` / `CellMarker2Scraper` / `PanglaoDBScraper` + `main()`. Per-source output JSON shape exactly as the spec's "Output Format" (source, scrape_date, url, cell_types[] with markers.human/mouse positive/negative, aliases, references, raw_text). Output files to `data/scraped/{source}_{date}.json` with date_format from config.
- CLI flags: `--source <name>`, `--dry-run` (no file output), `--force` (ignore schedule). Use `argparse`.
- Error handling: network errors → retry 3× exponential backoff; parse errors → log warning + skip that cell type, never crash; respect `rate_limit_seconds`; check/respect robots.txt; logging to `updater/scraper.log` at configured level.

## Project Python conventions (global rules — follow strictly)
- A one-line module-purpose comment at the very top of `scraper.py`.
- snake_case functions, PascalCase classes, **type hints required** on function signatures.
- **Every external call (network, file I/O, yaml/json parse) wrapped in try/except with logging** — no bare unguarded I/O.
- No magic numbers — pull retry counts / backoff / rate limits from config or named constants.
- Must be import-safe and runnable offline: importing the module and running `--dry-run`/`--help` must NOT perform network calls or crash (network only happens inside an actual scrape run).

## Verify before done
- `python3 -m py_compile updater/scraper.py` passes; `config.yaml` loads via `yaml.safe_load`; `python3 updater/scraper.py --help` and `--dry-run` work without network access (argparse + guarded run); classes/methods match the spec signatures. (Live scraping against the real sites is NOT expected in this environment — code correctness + offline safety only.)

## Done when
Every checkbox in spec 16's **Test Criteria** that is verifiable offline is satisfiable, and the code is structured for the live-network criteria. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
