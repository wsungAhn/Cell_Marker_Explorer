# Codex Spec: 15-css-styles

## Purpose
Create the complete CSS stylesheet for the Cell Markers Explorer application. Implements the Phylo design system with light/dark mode support, responsive layout, and all component styles.

## Dependencies
- `04-app-shell.md` (HTML structure and class names)
- All other specs (references CSS classes defined in each)

## Output Files
- `css/styles.css` — Main stylesheet (single file, no imports)

## CSS Custom Properties (Design Tokens)

```css
:root {
  /* Light theme (default) */
  --bg-primary: #FAF9F3;
  --bg-secondary: #ECE9E2;
  --bg-tertiary: #F5F4EE;
  --text-primary: #000000;
  --text-secondary: #555555;
  --text-muted: #888888;
  --accent-blue: #0279EE;
  --accent-green: #75A025;
  --accent-lime: #E9ED4C;
  --accent-orange: #FF9400;
  --accent-pink: #FD9BED;
  --marker-positive: #E9ED4C;
  --marker-negative: #FF9400;
  --border-color: #D0CEC8;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.16);
  --hover-glow: 0 0 12px rgba(2,121,238,0.4);
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --transition-speed: 0.3s;
  --font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
  --header-height: 64px;
  --breadcrumb-height: 40px;
  --tray-width: 280px;
}

[data-theme="dark"] {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2A2A2A;
  --bg-tertiary: #222222;
  --text-primary: #ECE9E2;
  --text-secondary: #AAAAAA;
  --text-muted: #777777;
  --border-color: #444444;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.4);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.5);
  --hover-glow: 0 0 12px rgba(2,121,238,0.6);
  --marker-positive: #9EA326;
  --marker-negative: #CC7700;
}
```

## Layout

### Global
```css
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; font-family: var(--font-sans); background: var(--bg-primary); color: var(--text-primary); }
#app-header { position: sticky; top: 0; z-index: 100; height: var(--header-height); }
#breadcrumb { height: var(--breadcrumb-height); }
#main-content { min-height: calc(100vh - var(--header-height) - var(--breadcrumb-height) - 48px); }
```

### Header
```css
#app-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 24px; background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
}
.header-left { flex: 0 0 auto; }
.header-center { flex: 1 1 auto; max-width: 480px; margin: 0 24px; }
.header-right { flex: 0 0 auto; display: flex; gap: 12px; align-items: center; }
```

### Breadcrumb
```css
.breadcrumb { padding: 8px 24px; background: var(--bg-tertiary); border-bottom: 1px solid var(--border-color); }
.breadcrumb-list { display: flex; list-style: none; gap: 8px; font-size: 14px; }
.breadcrumb-item + .breadcrumb-item::before { content: '›'; margin-right: 8px; color: var(--text-muted); }
.breadcrumb-item a { color: var(--accent-blue); text-decoration: none; }
.breadcrumb-item a:hover { text-decoration: underline; }
.breadcrumb-item.current { color: var(--text-secondary); font-weight: 500; }
```

### Views
```css
.view { display: none; padding: 24px; max-width: 1200px; margin: 0 auto; }
.view.active { display: block; animation: fadeIn 0.2s ease; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
```

### Two-Column Layout (Organ View)
```css
.organ-layout { display: grid; grid-template-columns: 3fr 2fr; gap: 24px; }
@media (max-width: 768px) { .organ-layout { grid-template-columns: 1fr; } }
```

## Component Styles

### Search
```css
.search-container { position: relative; width: 100%; }
#search-input {
  width: 100%; padding: 8px 40px 8px 16px; border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); background: var(--bg-primary); font-size: 14px;
  transition: border-color var(--transition-speed);
}
#search-input:focus { border-color: var(--accent-blue); outline: none; box-shadow: var(--hover-glow); }
.search-results {
  position: absolute; top: 100%; left: 0; right: 0; z-index: 200;
  background: var(--bg-primary); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); box-shadow: var(--shadow-md);
  max-height: 400px; overflow-y: auto;
}
.search-suggestion { padding: 8px 16px; cursor: pointer; display: flex; gap: 8px; align-items: center; }
.search-suggestion:hover, .search-suggestion.focused { background: var(--bg-secondary); }
```

### Species Toggle
```css
.species-toggle { display: flex; border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; }
.species-btn {
  padding: 6px 16px; border: none; background: var(--bg-primary);
  font-size: 13px; cursor: pointer; transition: all var(--transition-speed);
}
.species-btn.active { background: var(--accent-blue); color: white; }
```

### Marker Tags
```css
.marker-tag {
  display: inline-block; padding: 2px 8px; border-radius: var(--radius-sm);
  font-size: 12px; font-family: var(--font-mono); cursor: pointer;
  border: 1px solid transparent; transition: all var(--transition-speed);
}
.marker-tag.positive { background: var(--marker-positive); color: #333; border-color: rgba(0,0,0,0.1); }
.marker-tag.negative { background: var(--marker-negative); color: white; }
.marker-tag:hover { transform: scale(1.05); box-shadow: var(--shadow-sm); }
```

### Compare Tray
```css
.compare-tray {
  position: fixed; bottom: 16px; right: 16px; z-index: 150;
  width: var(--tray-width); background: var(--bg-primary);
  border: 1px solid var(--border-color); border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg); padding: 12px;
}
.tray-item { display: flex; justify-content: space-between; align-items: center; padding: 4px 0; }
.tray-item-remove { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; }
```

### Compare Table
```css
.compare-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.compare-table th { background: var(--bg-secondary); padding: 8px 12px; text-align: left; position: sticky; top: 0; }
.compare-table td { padding: 6px 12px; border-bottom: 1px solid var(--border-color); }
.compare-table .cell-positive { color: var(--accent-green); font-weight: bold; }
.compare-table .cell-negative { color: var(--accent-orange); font-weight: bold; }
.compare-table .cell-not-listed { color: var(--text-muted); }
.compare-table .row-shared { background: rgba(117,160,37,0.08); }
```

### Cell Type List Items
```css
.cell-type-item {
  padding: 12px; border: 1px solid var(--border-color); border-radius: var(--radius-md);
  cursor: pointer; transition: all var(--transition-speed); margin-bottom: 8px;
}
.cell-type-item:hover { border-color: var(--accent-blue); box-shadow: var(--hover-glow); }
.cell-type-name { font-weight: 600; font-size: 15px; }
.cell-type-markers { margin-top: 4px; display: flex; flex-wrap: wrap; gap: 4px; }
```

### Version Badge
```css
.version-badge {
  font-size: 11px; padding: 2px 6px; background: var(--bg-tertiary);
  border-radius: var(--radius-sm); color: var(--text-muted); font-family: var(--font-mono);
}
```

### Skip Link
```css
.skip-link { position: absolute; top: -40px; left: 0; background: var(--accent-blue); color: white; padding: 8px; z-index: 1000; }
.skip-link:focus { top: 0; }
```

### Dark Mode Toggle
```css
.theme-toggle {
  background: none; border: 1px solid var(--border-color); border-radius: var(--radius-md);
  padding: 6px 10px; cursor: pointer; font-size: 18px;
}
.theme-toggle:hover { border-color: var(--accent-blue); }
```

### Footer
```css
#app-footer {
  padding: 12px 24px; background: var(--bg-secondary); border-top: 1px solid var(--border-color);
  display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);
}
#app-footer a { color: var(--accent-blue); text-decoration: none; margin-left: 12px; }
```

## Responsive Breakpoints
```css
@media (max-width: 768px) {
  #app-header { flex-wrap: wrap; height: auto; padding: 12px; }
  .header-center { order: 3; max-width: 100%; margin: 8px 0 0; }
  .view { padding: 16px; }
  .organ-layout { grid-template-columns: 1fr; }
  .compare-tray { width: calc(100% - 32px); left: 16px; }
}
@media (max-width: 480px) {
  .species-btn { padding: 4px 10px; font-size: 12px; }
  .marker-tag { font-size: 11px; padding: 1px 6px; }
}
```

## Animations
```css
@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.02); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { transform: translateY(10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
```

## Print Styles
```css
@media print {
  #app-header, #breadcrumb, .compare-tray, .theme-toggle, .species-toggle { display: none; }
  .view { padding: 0; }
  .marker-tag { border: 1px solid #000; }
}
```

## Test Criteria
- [ ] Light theme renders correctly
- [ ] Dark theme renders correctly (all custom properties switch)
- [ ] Responsive at 320px, 480px, 768px, 1200px
- [ ] Marker tags have correct positive/negative colors
- [ ] Compare table is readable
- [ ] Print styles hide navigation elements
- [ ] Animations are smooth (no jank)
- [ ] Focus styles visible for keyboard navigation
