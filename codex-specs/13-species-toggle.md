# Codex Spec: 13-species-toggle

## Purpose
Create the species toggle control — switches between Human and Mouse marker data across the entire application. This is a global state that affects all views simultaneously.

## Dependencies
- `04-app-shell.md` (toggle buttons in header)
- `05-datastore.md` (species state management)

## Output Files
- `js/species-toggle.js`

## API

```javascript
class SpeciesToggle {
  constructor(datastore: CellMarkersDatastore)

  init(): void  // bind to #species-toggle buttons
  getSpecies(): 'human' | 'mouse'
  setSpecies(species: 'human' | 'mouse'): void
  onSpeciesChange(callback: (species: string) => void): void
}
```

## UI Design

### Toggle Buttons
```html
<div id="species-toggle" class="species-toggle" role="radiogroup" aria-label="Species">
  <button class="species-btn active" data-species="human" role="radio" aria-checked="true">
    <span class="species-icon">🧑</span> Human
  </button>
  <button class="species-btn" data-species="mouse" role="radio" aria-checked="false">
    <span class="species-icon">🐭</span> Mouse
  </button>
</div>
```

### Styling
- Active button: filled background (`var(--accent-blue)`), white text
- Inactive button: outlined, secondary text color
- Transition: 0.2s background-color
- Segmented control appearance (two buttons joined with rounded corners)

## Behavior

### Toggle Click
1. Update active button class and `aria-checked`
2. Call `datastore.setSpecies(newSpecies)`
3. Datastore fires `speciesChange` event
4. All subscribed views re-render with new species data

### Views Affected by Species Change
| View | What Changes |
|------|-------------|
| Organ view (08) | Marker tags in cell type list |
| Cell view (09) | Marker tables, external links |
| Compare view (11) | Comparison table data |
| Search (10) | Search results prioritize selected species |
| Body map (07) | No change (tissue systems are species-agnostic) |

### Re-render Strategy
- Views subscribe to `datastore.onSpeciesChange()`
- On change: each view calls its own `render()` or `updateMarkers()` method
- No full page reload — only marker data sections update
- Smooth transition: fade-out old markers (0.15s), fade-in new (0.15s)

## Keyboard Support
- Tab to toggle group
- Left/Right arrow to switch between Human/Mouse
- Enter/Space to select

## URL State
- Species is NOT encoded in URL hash (it's a UI preference)
- Species preference is saved to `localStorage`
- On page load: read from localStorage, default to "human"

## Edge Cases
- Cell type with no markers for selected species: show "No [species] markers available" message
- Rapid toggling: debounce re-renders (100ms)
- localStorage unavailable: default to human, no persistence

## Test Criteria
- [ ] Clicking Human/Mouse switches active species
- [ ] All views update markers on species change
- [ ] Species preference persists in localStorage
- [ ] Keyboard navigation works (Tab + Arrow)
- [ ] ARIA attributes update correctly
- [ ] Cell types without species markers show appropriate message
- [ ] Rapid toggling doesn't cause rendering errors
