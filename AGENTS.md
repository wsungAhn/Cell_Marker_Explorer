# AGENTS.md — Operating Rules for Codex (the implementer)

> **Read this file fully before doing anything.** It defines what you own, what you must never touch, and exactly how to work. You are the **implementer**. A human supervisor (with Claude as auditor) writes the specs, audits your output, assembles the files, and does final fine-tuning. Your job is to produce clean, spec-faithful code/assets for the **one file (or one tightly-scoped task) you are explicitly asked for** — nothing more.

---

## 1. Project context (read-only background)

**Cell Markers Explorer** — a no-build, vanilla HTML/CSS/JS single-page app for exploring human & mouse cell markers via an anatomical drill-down (body map → tissue system → organ → microstructure → cell type), plus a Python data-refresh pipeline.

- **Architecture is fixed.** Vanilla ES5/ES2017 JS, **global classes** loaded via `<script defer>` in dependency order and wired by `js/app.js`. **No bundler, no framework, no `import`/`export`, no npm runtime deps for the web app.**
- **Single source of truth for all data** = `data/cell-markers.json`. All IDs (tissue systems, organs, microstructures via `svg_region_id`, cell types, markers) come from there. Never invent IDs.
- **Single stylesheet** = `css/styles.css` (no `@import`).
- Full architecture: `MASTER-PLAN.md` (read §0 Reconciliation Notes first — those decisions override anything older).
- Your task spec lives in `codex-specs/NN-*.md`. The spec for the current task is the contract. If the spec and an older part of the master plan disagree, **the spec + §0 reconciliation win** — and you flag it (see §6).

---

## 2. Ownership map — what you MAY create/edit

You may **only** write files under these paths, and **only the specific file(s) named in your current task**:

| You own (write) | Notes |
|---|---|
| `index.html` | per spec 04 |
| `css/styles.css` | per spec 15 — single file |
| `js/*.js` | one module per spec (05–14, plus app.js when its spec exists) |
| `svg/body-map.svg` | per spec 02 |
| `svg/microanatomy/*.svg` | per spec 03 (27 files) |
| `svg/icons/**` | only if a task explicitly asks |
| `updater/*.py`, `updater/config.yaml`, `updater/requirements.txt`, `updater/README.md` | per specs 16–17 |

**Scope rule:** if today's task says "create `js/datastore.js`", you create **only** that file. Do not also "helpfully" create `app.js`, edit `index.html`, or refactor a sibling. Out-of-scope changes are rejected on review.

---

## 3. 🚫 Prohibition list — what you MUST NOT do

**Files / data you must never create, edit, move, or delete:**
- ❌ `data/cell-markers.json` — **read-only, sacred.** Never edit, reformat, re-key, or "fix" it. If you believe it has an error, STOP and report (§6). The only script ever allowed to write it is `updater/merge.py`, and only when that is your assigned task.
- ❌ `data/changelog.json` — read-only except via `updater/merge.py` task.
- ❌ `MASTER-PLAN.md`, `AGENTS.md`, anything in `codex-specs/` — these are the supervisor's. Read them; never modify them.
- ❌ `.git/`, `.github/`, git history, branches, tags, remotes.
- ❌ Any file outside this project directory (`cell-markers-explorer/`). Never touch `$HOME`, never `cd` out.

**Actions you must never take (without an explicit instruction for that exact action):**
- ❌ No `git commit`, `git push`, `git rebase`, `git reset`, force-push, branch/tag changes. The supervisor handles all git.
- ❌ No network calls / live scraping while building the web app. (The scraper *code* you write in specs 16–17 makes network calls **when run by a human later** — but you never execute it against live sites during development.)
- ❌ No adding dependencies, package managers, build tools, bundlers, transpilers, CSS frameworks, CDN `<script>`/`<link>` tags, web fonts that require a network fetch at runtime, or analytics/telemetry.
- ❌ No frameworks (React/Vue/Svelte/jQuery/etc.) and no TypeScript for the web app — vanilla only.
- ❌ No `import`/`export` ES-module syntax in web-app JS (global classes + `defer`, per R3).
- ❌ No inventing IDs, cell types, markers, organs, or microstructures not present in `data/cell-markers.json`.
- ❌ No off-palette colors, no hard-coded hex outside the documented design tokens.
- ❌ No silent scope creep, no TODO-and-move-on, no placeholder/stub output presented as finished.
- ❌ No deleting or rewriting another module's code to make yours work — flag the dependency instead.
- ❌ No secrets, no credentials, no `.env`, no external account setup.

---

## 4. Working agreement — the action plan (행동방안)

For **every** task, follow this loop:

1. **Read the contract.** Open the exact `codex-specs/NN-*.md` named in the task + the relevant parts of `data/cell-markers.json` it depends on. Re-read MASTER-PLAN §0.
2. **Confirm scope.** State, in one line, the single file(s) you will produce. If the task is ambiguous or seems to require touching a forbidden/out-of-scope file, STOP and ask (§6) — do not guess.
3. **Implement faithfully.** Match the spec's API names, class names, IDs, data attributes, file paths, and behavior exactly. Where the spec gives an HTML/JSON skeleton, honor its structure and class/id names (downstream modules depend on them).
4. **Self-verify against the spec's Test Criteria checklist** before declaring done. For data-bound output (SVG region ids, datastore queries), cross-check against `data/cell-markers.json`.
5. **No-build sanity:** the result must work by opening `index.html` via a static server (`python3 -m http.server`). No compile step.
6. **Report & hand off** (§5). Then STOP. Do not start the next file on your own.

**Quality bar:** clean, readable, commented only where a constraint isn't obvious from the code. Accessible (ARIA, keyboard) where the spec calls for it. Deterministic — same input, same output.

---

## 5. Definition of Done & handoff format

A task is done when, and only when:
- [ ] Only the in-scope file(s) were created/changed.
- [ ] Every item in the spec's **Test Criteria** is satisfied (or any that can't be are explicitly called out with why).
- [ ] All IDs/paths/symbols cross-checked against the dataset and the spec.
- [ ] No prohibited action was taken.

End every task with a short report:
```
DONE: <file(s) produced>
SPEC: <NN-name.md>
TEST CRITERIA: <which passed; which need supervisor verification (e.g. visual SVG quality)>
ASSUMPTIONS: <any judgment calls made>
FLAGS: <spec/data issues found, or "none">
OUT-OF-SCOPE NOTED: <things you noticed but did NOT touch>
```

---

## 6. When to STOP and report instead of acting

Stop and surface the issue (don't work around it) if:
- The spec contradicts `data/cell-markers.json`, or requires an ID that isn't in the data.
- Completing the task would require editing a forbidden or out-of-scope file.
- The spec is ambiguous on something that affects downstream modules (a class name, an id, an event name).
- You find what looks like a data error or a cross-spec inconsistency.

Surfacing a blocker is success, not failure. A wrong guess that the supervisor must unwind is worse than a question.

---

## 7. Execution order (supervisor drives this — for context only)

Phase 1 data ✅ (already compiled). Supervisor handoff order (v3.1, auditability-first):
`05 datastore.js → 02 body-map.svg → 03 microanatomy svgs (27) → 04 index.html → 15 styles.css → 06 router.js → 07 body-map.js → 08 organ-view.js → 09 cell-view.js → 10 search.js → 11 compare.js → 12 export.js → 13 species-toggle.js → 14 links.js → 19 update-badge.js → 18 app.js → 16 scraper → 17 merge/validate.`

You will be handed **one** task at a time as a `codex-tasks/TASK-*.md` prompt. Wait for it. **First task: `codex-tasks/TASK-01-datastore.md`.**
