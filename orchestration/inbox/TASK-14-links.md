# Codex Task 14 — External DB Links (js/links.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/links.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/links.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/14-links.md`**. Key non-negotiables:
- A **global class `LinksGenerator`** (no `import`/`export`; IIFE → window-reachable; **also expose an instance as `window.links`** because cell-view (09) resolves links via `window.links`/`LinksModule`). Constructor `()`.
- API: `getLinks(marker, species)` → `MarkerLink[]`, `getUniProtLink(symbol, species)`, `getCellMarkerLink(marker)`, `getPanglaoDBLink(marker)`, `getNCBIGeneLink(symbol, species)`, `renderLinksSection(markers, species)` → HTMLElement.
- Link templates EXACT per spec: UniProt (`?query=gene:{SYMBOL}+organism:{TAXON}`, human 9606 / mouse 10090), NCBI Gene (`?term={SYMBOL}+Homo+sapiens`/`+Mus+musculus`), CellMarker 2.0 (`/CellMarker/search/{MARKER}`), PanglaoDB (`?query={MARKER}`).
- Marker parsing: CD numbers (`CD68`, `CD45RA`) → NCBI (not UniProt gene); **fusion markers with `/`** (e.g. `VE-cadherin/CD144`) → generate links for each part; **known alias map** (the spec's `MARKER_ALIASES`: VE-cadherin→CDH5, c-Kit→KIT, F4/80→ADGRE1, etc.) resolve to gene symbol; `Lin-` and non-gene markers → skip UniProt/NCBI, only CellMarker/PanglaoDB.
- All `<a>` links `target="_blank" rel="noopener"`. `renderLinksSection` builds DOM via createElement/textContent (NO innerHTML); `.links-section`/`.links-grid`/`.link-group[data-marker]`/`.db-link` classes per spec.
- Vanilla JS only. No dependencies.

## Verify before done
- `node --check` passes; global class + `window.links` instance; no real import/export. Spot-check: `getUniProtLink('FOXP3','mouse')` uses taxon 10090; `getLinks('CD68','human')` includes an NCBI link; `getLinks('VE-cadherin/CD144','human')` yields links for both parts and resolves VE-cadherin→CDH5; `getLinks('Lin-','human')` skips UniProt/NCBI; all links contain `rel="noopener"` (or set via attribute).

## Done when
Every checkbox in spec 14's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
