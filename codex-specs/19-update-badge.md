# Codex Spec: 19-update-badge

## Purpose
Create `js/update-badge.js` — the data-version badge in the footer plus a clickable **changelog modal**. It reads `metadata` from the loaded dataset and `data/changelog.json`, shows the current version + last-updated date, indicates when a scheduled update is overdue, and opens a modal summarizing what changed in each version.

> **AUDIT NOTE (v3.1):** Reconciliation R5 — promoted from "deferred" to **v1 scope** (incl. the changelog modal) per supervisor decision. All version/date text is data-driven; nothing hard-coded.

## Dependencies
- `04-app-shell.md` (footer `#update-badge`, `#version-badge`)
- `05-datastore.md` (`getVersion()`, `getLastUpdated()`, metadata access)
- `15-css-styles.md` (modal + badge styles live in the single `css/styles.css`)
- `18-app-init.md` (instantiated and `init()`-ed during boot)

## Output Files
- `js/update-badge.js`

## API
```javascript
class UpdateBadge {
  constructor(datastore /* CellMarkersDatastore */)
  init()                         // populate badges, bind click, fetch changelog
  async loadChangelog(url = 'data/changelog.json')
  renderBadge()                  // footer #update-badge text + overdue indicator
  openModal()                    // build + show changelog modal
  closeModal()                   // hide + cleanup focus
  isUpdateOverdue() /* bool */   // metadata.next_scheduled_update < today
}
```

## Behavior

### Badges
- Footer `#update-badge` text: `Data v{version} — Updated {last_updated}` from datastore metadata.
- Header `#version-badge`: `v{version}` (app.js may also set this; setting it here is fine — keep them consistent and idempotent).
- If `isUpdateOverdue()`, append a subtle indicator (e.g. a dot + `aria-label="Update available"`); never block the UI.

### Changelog modal
- Clicking `#update-badge` (or pressing Enter when it's focused) opens a modal listing entries from `changelog.json`, newest first. Per entry show: `version`, `date`, `description`, and the `changes` summary (cell types added/modified/removed, markers added/…). If `details.added_cell_types` etc. exist, list them collapsibly.
- Modal is accessible: `role="dialog"`, `aria-modal="true"`, labelled by its title, focus trapped while open, `Escape` closes, focus returns to the badge on close, background scroll locked, click-on-backdrop closes.
- Build DOM with safe methods (`textContent`/`createElement`) — **never** inject changelog strings via `innerHTML` (avoid HTML-injection from data).

### Modal markup (reference)
```html
<div class="modal-backdrop" id="changelog-modal" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="changelog-title">
    <header class="modal-header">
      <h2 id="changelog-title">Changelog</h2>
      <button class="modal-close" aria-label="Close changelog">×</button>
    </header>
    <div class="modal-body">
      <!-- one <section> per version, generated -->
    </div>
  </div>
</div>
```
Create the backdrop/modal container lazily on first open (it is not in `index.html`), or append once during `init()`.

## Edge Cases
- `changelog.json` missing/unfetchable: badge still renders from datastore metadata; modal shows "No changelog available."
- `next_scheduled_update` null: never overdue.
- Date compare uses the dataset/today date as plain ISO strings (no locale parsing pitfalls).
- Repeated open/close must not stack listeners or duplicate the modal node.

## Test Criteria
- [ ] Footer badge shows version + last-updated from the dataset (not hard-coded).
- [ ] Clicking the badge opens the modal with entries newest-first.
- [ ] Modal is keyboard-accessible: Escape closes, focus trapped, focus returns to badge.
- [ ] Overdue indicator appears only when `next_scheduled_update` is in the past.
- [ ] No `innerHTML` used for changelog content.
- [ ] Missing changelog degrades gracefully.
