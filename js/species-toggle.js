(function (global) {
  'use strict';

  var STORAGE_KEY = 'cell-markers-species';
  var DEFAULT_SPECIES = 'human';
  var VALID_SPECIES = { human: true, mouse: true };
  var DEBOUNCE_MS = 100;

  class SpeciesToggle {
    constructor(datastore) {
      this.datastore = datastore;
      this.currentSpecies = DEFAULT_SPECIES;
      this.callbacks = [];
      this.buttons = [];
      this.group = null;
      this.pendingSpecies = null;
      this.debounceTimer = null;
      this.initialized = false;

      global.speciesToggle = this;
    }

    init() {
      var doc = global.document;
      this.group = doc ? doc.getElementById('species-toggle') : null;
      this.buttons = this.group
        ? Array.prototype.slice.call(this.group.querySelectorAll('.species-btn[data-species]'))
        : [];

      this.buttons.forEach((button) => {
        button.addEventListener('click', () => {
          this.setSpecies(button.getAttribute('data-species'));
        });
      });

      if (this.group) {
        this.group.addEventListener('keydown', (event) => this.handleKeydown(event));
      }

      this.initialized = true;
      this.setSpecies(this.readStoredSpecies(), { immediate: true, force: true });
    }

    getSpecies() {
      if (this.datastore && typeof this.datastore.getSpecies === 'function') {
        return this.normalizeSpecies(this.datastore.getSpecies()) || this.currentSpecies || DEFAULT_SPECIES;
      }
      return this.currentSpecies;
    }

    setSpecies(species, options) {
      var resolvedSpecies = this.normalizeSpecies(species);
      var opts = options || {};

      if (!resolvedSpecies) {
        return;
      }

      this.currentSpecies = resolvedSpecies;
      this.updateButtons(resolvedSpecies);
      this.writeStoredSpecies(resolvedSpecies);
      this.applySpecies(resolvedSpecies);

      if (opts.immediate) {
        this.clearPendingNotification();
        this.notifyCallbacks(resolvedSpecies);
        return;
      }

      this.pendingSpecies = resolvedSpecies;
      this.clearDebounceTimer();
      this.debounceTimer = global.setTimeout(() => {
        var nextSpecies = this.pendingSpecies;
        this.pendingSpecies = null;
        this.debounceTimer = null;
        this.notifyCallbacks(nextSpecies);
      }, DEBOUNCE_MS);
    }

    onSpeciesChange(callback) {
      if (typeof callback === 'function') {
        this.callbacks.push(callback);
      }
    }

    handleKeydown(event) {
      var key = event.key || event.code;

      if (key === 'ArrowLeft' || key === 'Left' || key === 'ArrowRight' || key === 'Right') {
        event.preventDefault();
        this.setSpecies(this.getAdjacentSpecies(key));
        this.focusActiveButton();
        return;
      }

      if (key === 'Enter' || key === ' ' || key === 'Spacebar') {
        var targetSpecies = event.target && event.target.getAttribute
          ? event.target.getAttribute('data-species')
          : this.currentSpecies;
        event.preventDefault();
        this.setSpecies(targetSpecies);
      }
    }

    applySpecies(species) {
      var resolvedSpecies = this.normalizeSpecies(species);

      if (!resolvedSpecies) {
        return;
      }

      if (this.datastore && typeof this.datastore.setSpecies === 'function') {
        this.datastore.setSpecies(resolvedSpecies);
      }
    }

    notifyCallbacks(species) {
      var resolvedSpecies = this.normalizeSpecies(species);

      if (!resolvedSpecies) {
        return;
      }

      this.callbacks.forEach((callback) => callback(resolvedSpecies));
    }

    updateButtons(species) {
      this.buttons.forEach((button) => {
        var isActive = button.getAttribute('data-species') === species;
        button.classList.toggle('active', isActive);
        button.setAttribute('aria-checked', isActive ? 'true' : 'false');
        button.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    }

    getAdjacentSpecies(key) {
      if (key === 'ArrowLeft' || key === 'Left') {
        return this.currentSpecies === 'mouse' ? 'human' : 'mouse';
      }
      return this.currentSpecies === 'human' ? 'mouse' : 'human';
    }

    focusActiveButton() {
      var activeButton = this.buttons.find((button) => button.getAttribute('data-species') === this.currentSpecies);

      if (activeButton && typeof activeButton.focus === 'function') {
        activeButton.focus();
      }
    }

    readStoredSpecies() {
      try {
        if (!global.localStorage) {
          return DEFAULT_SPECIES;
        }
        return this.normalizeSpecies(global.localStorage.getItem(STORAGE_KEY)) || DEFAULT_SPECIES;
      } catch (error) {
        return DEFAULT_SPECIES;
      }
    }

    writeStoredSpecies(species) {
      try {
        if (global.localStorage) {
          global.localStorage.setItem(STORAGE_KEY, species);
        }
      } catch (error) {
        // localStorage can be unavailable in private or restricted contexts.
      }
    }

    normalizeSpecies(species) {
      return VALID_SPECIES[species] ? species : null;
    }

    clearPendingNotification() {
      this.pendingSpecies = null;
      this.clearDebounceTimer();
    }

    clearDebounceTimer() {
      if (this.debounceTimer) {
        global.clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }
    }
  }

  global.SpeciesToggle = SpeciesToggle;
})(window);
