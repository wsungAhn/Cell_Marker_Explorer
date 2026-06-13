# Codex Task 04 — App Shell (index.html)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`index.html`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/index.html`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/04-app-shell.md`** (the spec shows the full HTML skeleton). Key non-negotiables:
- Valid HTML5 document, `<html lang="en" data-theme="light">`, proper `<head>` meta (charset, viewport, description, OG/Twitter card), `<link rel="stylesheet" href="css/styles.css">`, favicon link.
- All structural ids present exactly as in the spec: `app-header`, `search-container`/`search-input`/`search-button`/`search-results`, `species-toggle` (with two `.species-btn[data-species]` radios), `theme-toggle`, `version-badge`, `breadcrumb`, `main-content`, and the **five view containers** `view-body-map` (`.view active`), `view-organ`, `view-cell`, `view-search`, `view-compare` (the latter four `hidden`), `compare-tray` (with `compare-count`/`compare-items`/`compare-open-btn`/`compare-clear-btn`), `app-footer`, `update-badge`.
- Accessibility: `.skip-link` to `#main-content`, landmark roles (`banner`/`search`/`main`/`contentinfo`), `aria-label`s, radio `aria-checked` on species buttons.
- **Script load order is critical** — all `<script defer>` in this exact order: datastore, router, body-map, organ-view, cell-view, search, compare, export, species-toggle, links, update-badge, and **app.js LAST** (it instantiates every class; see spec 18). Reference `js/<name>.js` paths.
- `<noscript>` fallback message with a Labome link (JS-disabled edge case).
- No inline frameworks/CDNs; vanilla only. No build step. Static-servable as-is.

## Verify before done
- HTML parses (well-formed); all five `view-*` containers + header/breadcrumb/footer/compare-tray ids present.
- Exactly the 12 script tags above, `app.js` last, all `defer`.
- `data-theme` on `<html>`; species toggle has human(active)+mouse buttons.

## Done when
Every checkbox in spec 04's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
