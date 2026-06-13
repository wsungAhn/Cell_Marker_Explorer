# Codex Task 15 — Update Badge + Changelog Modal (js/update-badge.js)

You are the **implementer** for the Cell Markers Explorer project. Before doing anything, read `AGENTS.md` in the project root in full and follow it. Read `MASTER-PLAN.md` §0 (reconciliation notes).

## Your single deliverable for this task
Produce **`js/update-badge.js`** — and nothing else. **Output location (loop rule §8):** write it to **`orchestration/outbox/<id>/js/update-badge.js`** (the runner gives you the id) and your report to **`orchestration/outbox/<id>/REPORT.md`**. Do **not** write into the live tree or touch `data/`, `codex-specs/`, `MASTER-PLAN.md`, `AGENTS.md`, the inbox, or git. Do not create the `.done` sentinel — the runner does that.

## Contract
Implement exactly per **`codex-specs/19-update-badge.md`**. Key non-negotiables:
- A **global class `UpdateBadge`** (no `import`/`export`; IIFE → window-reachable; expose instance e.g. `window.updateBadge`). Constructor `(datastore)`.
- API: `init()`, `async loadChangelog(url='data/changelog.json')`, `renderBadge()`, `openModal()`, `closeModal()`, `isUpdateOverdue()`.
- Footer `#update-badge` text: `Data v{version} — Updated {last_updated}` from `datastore.getVersion()`/`getLastUpdated()`. Header `#version-badge`: `v{version}` (idempotent). All version/date text **data-driven, nothing hard-coded**.
- **`data/changelog.json` real shape is `{ "updates": [ { version, date, description, sources_scraped, changes, details } ] }`** — read `.updates`, render entries **newest-first**. Per entry show version, date, description, and `changes` summary; `details.*` (e.g. added_cell_types) listed collapsibly if present.
- `isUpdateOverdue()`: true when `metadata.next_scheduled_update` (ISO string) < today (plain ISO string compare, no locale parsing). Current data: `next_scheduled_update = "2024-12-27"` → overdue today. If null → never overdue. Overdue → subtle dot + `aria-label="Update available"`, never block UI.
- Changelog modal: created lazily (not in index.html) or appended once in init (no duplicate node / no stacked listeners on repeated open/close). Accessible: `role="dialog"`, `aria-modal="true"`, labelled by title, focus trapped, `Escape` closes, focus returns to badge, background scroll locked, backdrop click closes.
- **NEVER use `innerHTML` for changelog content** — build with `createElement`/`textContent` (HTML-injection safety).
- Edge cases: changelog missing/unfetchable → badge still renders from metadata, modal shows "No changelog available."; repeated open/close safe.
- Vanilla JS only. No dependencies.

## Verify before done
- `node --check` passes; global class + instance; no real import/export; no innerHTML. With a loaded datastore: `renderBadge()` text includes `v1.0.0` and `2024-06-27`; `isUpdateOverdue()` returns true for next_scheduled_update `2024-12-27` vs a 2026 today (and false when null); `loadChangelog` reads `{updates:[...]}`.

## Done when
Every checkbox in spec 19's **Test Criteria** is satisfiable. Report in the `AGENTS.md` §5 handoff format and STOP — do not start any other module.
