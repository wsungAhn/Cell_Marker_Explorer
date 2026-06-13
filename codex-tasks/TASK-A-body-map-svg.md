# Codex Task 01 — Body Map SVG

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`svg/body-map.svg`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/svg/body-map.svg`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live `svg/` tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/02-body-map-svg.md`**. Key non-negotiables:
- `viewBox="0 0 600 900"`, portrait human figure, anatomically plausible, clean medical-illustration style on the app background.
- Exactly **12** clickable tissue-system regions, each a `<g>` with **all three**: `id="<tissueSystemId>"`, `data-tissue-system="<tissueSystemId>"`, `class="body-region"`. The 12 ids (verify against `data/cell-markers.json` → `tissue_systems[*].id` and each system's `body_map_region`):
  `integumentary, nervous, cardiovascular, respiratory, lymphatic, digestive, urinary, musculoskeletal, reproductive, endocrine, sensory, circulating-immune`
- Each region filled with its tissue-system color (see spec 02 / spec 01 color table), using the documented palette only.
- Per-region accessibility: `<title>` + `<desc>`, `role="button"`, `tabindex="0"`, `aria-label`.
- A `<g id="labels" class="labels-layer">` with `<text class="region-label" data-for="<id>">` labels, positioned to avoid overlap.
- Use CSS variables (e.g. `var(--bg-primary)`, `var(--hover-glow)`) where spec 02 shows them; no off-palette hard-coded colors.
- Pure static SVG markup — no embedded `<script>`, no external refs.

## Done when
Every checkbox in spec 02's **Test Criteria** is satisfiable. Self-verify the 12 ids against the dataset. Then report in the `AGENTS.md` §5 handoff format and STOP — do not start the microanatomy SVGs.
