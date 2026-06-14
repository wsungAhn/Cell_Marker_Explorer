# Codex Spec: 23-loading-spinner

## Purpose
Add CSS for the loading spinner that `app.js` creates dynamically but has no styling for. Currently the loading state shows an invisible `.loading-spinner` element.

## Dependencies
- `04-app-shell.md` (app.js creates `.loading-state` and `.loading-spinner` elements)
- `15-css-styles.md` (additions to `css/styles.css`)

## Output Files
- `css/styles.css` — append loading spinner styles

## CSS to Add

Append the following to the end of `css/styles.css`, before the `@media` queries:

```css
/* ── Loading state ── */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  gap: 16px;
}

.loading-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border-color);
  border-top-color: var(--accent-blue);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

## How app.js Uses These Classes

From `app.js` (already implemented, no JS changes needed):

```javascript
// Creates this DOM structure while data loads:
var loading = document.createElement('div');
loading.id = 'app-loading-state';
loading.className = 'loading-state';
loading.setAttribute('role', 'status');
loading.setAttribute('aria-live', 'polite');

var spinner = document.createElement('div');
spinner.className = 'loading-spinner';
spinner.setAttribute('aria-hidden', 'true');

var message = document.createElement('p');
message.textContent = 'Loading cell marker data...';

loading.appendChild(spinner);
loading.appendChild(message);
```

The spinner is removed once data loads (`removeLoadingState()`).

## Dark Mode
The spinner automatically adapts to dark mode because it uses CSS custom properties:
- `var(--border-color)`: switches from `#D0CEC8` (light) to `#444444` (dark)
- `var(--accent-blue)`: stays `#0279EE` in both themes (already high contrast on dark)

No additional dark-mode overrides needed.

## Accessibility
- `role="status"` + `aria-live="polite"` on the container (already in app.js) announces loading state to screen readers
- `aria-hidden="true"` on the spinner hides the animation from assistive technology (it's decorative)
- The text "Loading cell marker data..." is the accessible content

## Edge Cases
- Very slow loads: spinner animates indefinitely — acceptable behavior
- Data load failure: `renderLoadError()` replaces the spinner with an error panel (already implemented in app.js)
- Reduced motion preference: add a `prefers-reduced-motion` override:

```css
@media (prefers-reduced-motion: reduce) {
  .loading-spinner {
    animation: none;
    border-top-color: var(--accent-blue);
    /* Show a static half-filled circle instead of spinning */
  }
}
```

## Test Criteria
- [ ] Loading spinner is visible when app starts (before data loads)
- [ ] Spinner rotates smoothly at ~1.25 rotations/second
- [ ] "Loading cell marker data..." text appears below spinner
- [ ] Spinner disappears once data loads
- [ ] Spinner adapts to dark mode (border colors switch)
- [ ] `prefers-reduced-motion` stops the animation
- [ ] Screen reader announces loading state via `aria-live`
