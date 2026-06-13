# Codex Spec: 04-app-shell

## Purpose
Create the main HTML application shell — the single-page app entry point that loads all CSS, JS, and SVG resources. This is the `index.html` file that ties everything together.

## Dependencies
- All other specs (this is the integration point)

## Output Files
- `index.html` — Main SPA entry point

## HTML Structure

```html
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cell Markers Explorer</title>
  <meta name="description" content="Interactive cell marker reference: explore human and mouse cell markers through anatomical drill-down navigation.">

  <!-- CSS -->
  <link rel="stylesheet" href="css/styles.css">

  <!-- Favicon -->
  <link rel="icon" href="svg/icons/favicon.svg" type="image/svg+xml">
</head>
<body>
  <!-- Skip link for accessibility -->
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <!-- Header -->
  <header id="app-header" role="banner">
    <div class="header-left">
      <h1 class="app-title">Cell Markers Explorer</h1>
      <span class="version-badge" id="version-badge">v1.0.0</span>
    </div>
    <div class="header-center">
      <!-- Search bar (spec 10) -->
      <div id="search-container" class="search-container" role="search">
        <input type="search" id="search-input" placeholder="Search markers, cell types..." aria-label="Search cell markers">
        <button id="search-button" aria-label="Search">
          <!-- Search icon SVG -->
        </button>
        <div id="search-results" class="search-results" role="listbox" hidden></div>
      </div>
    </div>
    <div class="header-right">
      <!-- Species toggle (spec 13) -->
      <div id="species-toggle" class="species-toggle" role="radiogroup" aria-label="Species">
        <button class="species-btn active" data-species="human" role="radio" aria-checked="true">Human</button>
        <button class="species-btn" data-species="mouse" role="radio" aria-checked="false">Mouse</button>
      </div>
      <!-- Dark mode toggle -->
      <button id="theme-toggle" class="theme-toggle" aria-label="Toggle dark mode">
        <!-- Sun/moon icon -->
      </button>
    </div>
  </header>

  <!-- Breadcrumb navigation -->
  <nav id="breadcrumb" class="breadcrumb" aria-label="Navigation breadcrumb">
    <ol class="breadcrumb-list">
      <li class="breadcrumb-item"><a href="#/">Body</a></li>
    </ol>
  </nav>

  <!-- Main content area -->
  <main id="main-content" role="main">
    <!-- Views rendered dynamically by router -->
    <div id="view-body-map" class="view active">
      <!-- Body map SVG injected here (spec 07) -->
    </div>
    <div id="view-organ" class="view" hidden>
      <!-- Organ view (spec 08) -->
    </div>
    <div id="view-cell" class="view" hidden>
      <!-- Cell detail view (spec 09) -->
    </div>
    <div id="view-search" class="view" hidden>
      <!-- Search results view (spec 10) -->
    </div>
    <div id="view-compare" class="view" hidden>
      <!-- Compare view (spec 11) -->
    </div>
  </main>

  <!-- Compare tray (floating) -->
  <aside id="compare-tray" class="compare-tray" hidden aria-label="Compare tray">
    <h3>Compare (<span id="compare-count">0</span>)</h3>
    <div id="compare-items" class="compare-items"></div>
    <button id="compare-open-btn" disabled>Compare Markers</button>
    <button id="compare-clear-btn" hidden>Clear All</button>
  </aside>

  <!-- Footer -->
  <footer id="app-footer" role="contentinfo">
    <div class="footer-left">
      <span>Data sources: Labome, CellMarker 2.0, PanglaoDB</span>
      <span class="update-badge" id="update-badge">Updated: 2024-06-27</span>
    </div>
    <div class="footer-right">
      <a href="https://www.labome.com/method/Cell-Markers.html" target="_blank" rel="noopener">Labome</a>
      <a href="http://bio-bigdata.hrbmu.edu.cn/CellMarker/" target="_blank" rel="noopener">CellMarker 2.0</a>
      <a href="https://panglaodb.se/" target="_blank" rel="noopener">PanglaoDB</a>
    </div>
  </footer>

  <!-- JS (deferred) -->
  <script src="js/datastore.js" defer></script>
  <script src="js/router.js" defer></script>
  <script src="js/body-map.js" defer></script>
  <script src="js/organ-view.js" defer></script>
  <script src="js/cell-view.js" defer></script>
  <script src="js/search.js" defer></script>
  <script src="js/compare.js" defer></script>
  <script src="js/export.js" defer></script>
  <script src="js/species-toggle.js" defer></script>
  <script src="js/links.js" defer></script>
  <script src="js/update-badge.js" defer></script>
  <!-- app.js MUST be last: it instantiates every class above (see spec 18-app-init) -->
  <script src="js/app.js" defer></script>
</body>
</html>
```

## CSS Classes
- `.skip-link` — Off-screen until focused, for keyboard users
- `.view` — Base view class; `.active` shows the view
- `.compare-tray` — Fixed bottom-right floating panel
- `.breadcrumb` — Horizontal breadcrumb with `>` separators

## View Switching Logic
- Only one `.view` has `.active` at a time
- Router (spec 06) manages which view is active
- Transitions: fade-in (0.2s opacity)

## Keyboard Shortcuts
- `/` — Focus search input
- `Escape` — Clear search / go back
- `Backspace` — Navigate back (when not in input)
- `1-9` — Navigate breadcrumb levels (if available)
- `C` — Open compare view
- `H` — Go home (body map)

## Meta Tags
- Open Graph: title, description, image (screenshot)
- Twitter Card: summary_large_image

## Edge Cases
- JS disabled: show noscript message with link to Labome
- Data load failure: show error state with retry button
- Very small screens (< 360px): stack header elements vertically

## Test Criteria
- [ ] HTML validates at validator.w3.org
- [ ] All view containers exist
- [ ] Skip link works (Tab + Enter skips to main)
- [ ] Keyboard shortcuts work
- [ ] Responsive at 320px, 768px, 1200px
- [ ] Dark mode toggle switches `data-theme` on `<html>`
- [ ] Species toggle switches active button
