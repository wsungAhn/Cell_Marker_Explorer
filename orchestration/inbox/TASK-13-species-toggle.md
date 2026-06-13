# Codex Task 13 — Species Toggle (js/species-toggle.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/species-toggle.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/species-toggle.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/13-species-toggle.md`**. Key non-negotiables:
- A **global class `SpeciesToggle`** (no `import`/`export`; IIFE → window-reachable; expose instance e.g. `window.speciesToggle`). Constructor `(datastore)`.
- API: `init()` (bind the two `#species-toggle .species-btn[data-species]` buttons), `getSpecies()`, `setSpecies(species)`, `onSpeciesChange(cb)`.
- Toggle click / keyboard select: update active button `.active` class + `aria-checked`, call **`datastore.setSpecies(newSpecies)`** (datastore fires its speciesChange → views already subscribe via `datastore.onSpeciesChange`). This module is the UI control; the datastore is the source of truth for species state.
- **localStorage**: persist species preference; on `init()` read it and apply (default `'human'` if absent/unavailable). Wrap localStorage access in try/catch (unavailable → default human, no persistence).
- Keyboard: Tab to group, Left/Right arrows switch Human/Mouse, Enter/Space select.
- Debounce rapid re-render triggers (100ms) — but persist/aria update immediately.
- Vanilla JS only. No dependencies. DOM via standard APIs (no innerHTML for data).

## Verify before done
- `node --check` passes; global class, no import/export. With a loaded datastore + stubbed localStorage/document: `setSpecies('mouse')` calls `datastore.setSpecies` (datastore.getSpecies() becomes 'mouse') and writes localStorage; `getSpecies()` reflects it; `init()` with a stored 'mouse' applies mouse; localStorage throwing → defaults to human without crashing.

## Done when
Every checkbox in spec 13's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
