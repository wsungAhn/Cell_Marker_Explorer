# Codex Task 05 — CSS Stylesheet (css/styles.css)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`css/styles.css`** — a single file, and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/css/styles.css`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/15-css-styles.md`** (the spec gives the full token set + component styles). Key non-negotiables:
- **Design tokens on `:root`** exactly as in the spec, including the ones other modules depend on: `--bg-primary/secondary/tertiary`, `--text-primary/secondary/muted`, `--accent-blue` (#0279EE), `--marker-positive`/`--marker-negative`, `--hover-glow`, `--border-color`, radii, shadows, `--header-height`, `--breadcrumb-height`, `--tray-width`, fonts.
- **`[data-theme="dark"]` override block** that switches all themeable tokens (the theme-toggle flips `data-theme` on `<html>`).
- Component styles for the shell that index.html (task 04) and the SVGs (02/03) reference: `.skip-link` (off-screen until `:focus`), `#app-header`/`.header-left/center/right`, `.breadcrumb`/`.breadcrumb-item`, `.view` (`display:none`) + `.view.active` (fadeIn 0.2s), `.organ-layout` grid, `.search-container`/`#search-input`/`.search-results`/`.search-suggestion`, `.species-toggle`/`.species-btn.active`, `.marker-tag.positive`/`.negative`, `.compare-tray`/`.tray-item`, `.compare-table` (+ cell-positive/negative/not-listed, row-shared), `.cell-type-item`, `.version-badge`, `.theme-toggle`, `#app-footer`.
- **`.body-region` and `.microstructure-region` hover/focus styles** must use `var(--hover-glow)` and `var(--accent-blue)` (the SVGs from tasks 02/03 expect these to drive their hover/active appearance).
- Responsive `@media` at 768px and 480px; `@media print` hiding nav/header/tray/toggles; keyframes `fadeIn`/`pulse`/`slideUp`; visible `:focus` styles for keyboard nav.
- **Single file, no `@import`, no CDN/font-CDN `@import`, no external URLs.** Vanilla CSS only.

## Verify before done
- File parses as CSS (no syntax errors); `:root` defines all tokens above; `[data-theme="dark"]` present; `.view.active`, `.skip-link:focus`, `.marker-tag.positive/.negative`, `.species-btn.active` all present; `--hover-glow`/`--accent-blue` referenced by region hover styles.

## Done when
Every checkbox in spec 15's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
