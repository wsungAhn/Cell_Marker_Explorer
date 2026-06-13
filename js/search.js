/* global window, document, clearTimeout, setTimeout */
(function (global) {
  'use strict';

  var SUGGESTION_LIMIT = 8;
  var DEBOUNCE_MS = 200;
  var FILTERS = {
    all: 'All',
    markers: 'Markers',
    cellTypes: 'Cell Types'
  };
  var TYPE_LABELS = {
    cell_type: 'Cell Type',
    tissue_system: 'Tissue System',
    microstructure: 'Microstructure',
    organ: 'Organ',
    marker: 'Marker'
  };

  class SearchController {
    constructor(datastore, router) {
      this.datastore = datastore;
      this.router = router;
      this.input = null;
      this.button = null;
      this.suggestionsContainer = null;
      this.debounceTimer = null;
      this.suggestionItems = [];
      this.selectedSuggestionIndex = -1;
      this.currentFilter = 'all';
      this.currentQuery = '';
      this.currentResults = [];

      global.searchView = this;
    }

    init() {
      this.input = document.getElementById('search-input');
      this.button = document.getElementById('search-button');
      this.suggestionsContainer = document.getElementById('search-results');

      if (!this.input || !this.button || !this.suggestionsContainer) {
        return;
      }

      this.input.setAttribute('aria-autocomplete', 'list');
      this.input.setAttribute('aria-controls', 'search-results');
      this.input.setAttribute('aria-expanded', 'false');

      this.input.addEventListener('input', () => {
        var query = this.input.value;
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.showSuggestions(query);
        }, DEBOUNCE_MS);
      });

      this.input.addEventListener('keydown', (event) => {
        this.handleInputKeydown(event);
      });

      this.button.addEventListener('click', () => {
        this.navigateToSearch(this.input.value);
      });

      this.suggestionsContainer.addEventListener('click', (event) => {
        var option = event.target.closest('[role="option"]');
        if (!option || !this.suggestionsContainer.contains(option)) {
          return;
        }
        this.activateSuggestion(option);
      });

      document.addEventListener('click', (event) => {
        var searchContainer = document.getElementById('search-container');
        if (searchContainer && !searchContainer.contains(event.target)) {
          this.hideSuggestions();
        }
      });
    }

    performSearch(query) {
      if (!this.datastore || typeof this.datastore.search !== 'function') {
        return [];
      }

      var parsed = this.parseSpeciesPrefix(query);
      var species = parsed.species || this.getCurrentSpecies();
      if (parsed.species && typeof this.datastore.setSpecies === 'function') {
        this.datastore.setSpecies(parsed.species);
      }

      if (!parsed.query) {
        return [];
      }

      return this.datastore.search(parsed.query, { species: species });
    }

    render(route) {
      var container = document.getElementById('view-search');
      var query = route && route.params ? route.params.query || '' : '';
      this.currentQuery = query;
      this.currentFilter = 'all';

      if (this.input) {
        this.input.value = query;
      }

      if (!container) {
        return;
      }

      container.textContent = '';
      var section = this.createElement('section', 'search-results-view');
      var header = this.createElement('header', 'search-results-header');
      var title = this.createElement('h2', null, query ? 'Search: "' + query + '"' : 'Search');
      var count = this.createElement('p', 'search-result-count');

      this.currentResults = this.performSearch(query);
      count.textContent = this.currentResults.length + (this.currentResults.length === 1 ? ' result' : ' results');

      header.appendChild(title);
      if (query) {
        header.appendChild(count);
      }
      section.appendChild(header);

      if (!query.trim()) {
        section.appendChild(this.createElement('p', 'empty-message', 'Enter a search term to find markers, cell types, organs, or tissue systems.'));
        container.appendChild(section);
        return;
      }

      section.appendChild(this.renderFilterTabs());
      var resultsContainer = this.createElement('div', 'search-results-list');
      section.appendChild(resultsContainer);
      container.appendChild(section);
      this.renderResults(this.currentResults, resultsContainer);
    }

    renderResults(results, container) {
      if (!container) {
        return;
      }

      container.textContent = '';
      var filtered = this.filterResults(results || []);

      if (filtered.length === 0) {
        container.appendChild(this.createElement('p', 'empty-message', 'No results found. Try different marker symbols or cell type names.'));
        return;
      }

      filtered.forEach((result) => {
        container.appendChild(this.renderResultCard(result));
      });
    }

    showSuggestions(query) {
      if (!this.suggestionsContainer) {
        return;
      }

      var trimmed = (query || '').trim();
      this.suggestionsContainer.textContent = '';
      this.suggestionItems = [];
      this.selectedSuggestionIndex = -1;

      if (!trimmed) {
        this.hideSuggestions();
        return;
      }

      var results = this.performSearch(trimmed);
      if (trimmed.length === 1) {
        results = results.filter((result) => {
          return result.matchField === 'marker' &&
            String(result.matchSnippet || '').toLowerCase().indexOf(trimmed.toLowerCase()) === 0;
        });
      }
      results = results.slice(0, SUGGESTION_LIMIT);
      results.forEach((result, index) => {
        var suggestion = this.renderSuggestion(result, index);
        this.suggestionsContainer.appendChild(suggestion);
        this.suggestionItems.push(suggestion);
      });

      var showAll = this.createElement('div', 'search-suggestion search-all');
      showAll.setAttribute('role', 'option');
      showAll.setAttribute('tabindex', '-1');
      showAll.setAttribute('data-query', trimmed);
      showAll.setAttribute('id', 'search-suggestion-all');
      showAll.appendChild(document.createTextNode('Show all results for "' + trimmed + '" ->'));
      this.suggestionsContainer.appendChild(showAll);
      this.suggestionItems.push(showAll);

      this.suggestionsContainer.hidden = false;
      if (this.input) {
        this.input.setAttribute('aria-expanded', 'true');
        this.input.removeAttribute('aria-activedescendant');
      }
    }

    hideSuggestions() {
      if (!this.suggestionsContainer) {
        return;
      }

      this.suggestionsContainer.hidden = true;
      this.suggestionsContainer.textContent = '';
      this.suggestionItems = [];
      this.selectedSuggestionIndex = -1;

      if (this.input) {
        this.input.setAttribute('aria-expanded', 'false');
        this.input.removeAttribute('aria-activedescendant');
      }
    }

    navigateToResult(result) {
      if (!result || !result.path) {
        return;
      }
      this.hideSuggestions();
      this.navigate(result.path);
    }

    handleInputKeydown(event) {
      if (event.key === 'ArrowDown') {
        if (!this.suggestionItems.length) {
          this.showSuggestions(this.input.value);
        }
        this.moveSuggestionFocus(1);
        event.preventDefault();
        return;
      }

      if (event.key === 'ArrowUp') {
        this.moveSuggestionFocus(-1);
        event.preventDefault();
        return;
      }

      if (event.key === 'Enter') {
        if (this.selectedSuggestionIndex >= 0 && this.suggestionItems[this.selectedSuggestionIndex]) {
          this.activateSuggestion(this.suggestionItems[this.selectedSuggestionIndex]);
        } else {
          this.navigateToSearch(this.input.value);
        }
        event.preventDefault();
        return;
      }

      if (event.key === 'Escape') {
        this.hideSuggestions();
        event.preventDefault();
      }
    }

    moveSuggestionFocus(direction) {
      if (!this.suggestionItems.length) {
        return;
      }

      this.selectedSuggestionIndex += direction;
      if (this.selectedSuggestionIndex < 0) {
        this.selectedSuggestionIndex = this.suggestionItems.length - 1;
      } else if (this.selectedSuggestionIndex >= this.suggestionItems.length) {
        this.selectedSuggestionIndex = 0;
      }

      this.suggestionItems.forEach((item, index) => {
        var selected = index === this.selectedSuggestionIndex;
        item.classList.toggle('focused', selected);
        item.setAttribute('aria-selected', selected ? 'true' : 'false');
        if (selected && this.input) {
          this.input.setAttribute('aria-activedescendant', item.id);
          item.scrollIntoView({ block: 'nearest' });
        }
      });
    }

    activateSuggestion(option) {
      var query = option.getAttribute('data-query');
      var path = option.getAttribute('data-path');
      if (query) {
        this.navigateToSearch(query);
        return;
      }
      if (path) {
        this.navigateToResult({ path: path });
      }
    }

    navigateToSearch(query) {
      var trimmed = (query || '').trim();
      if (!trimmed) {
        this.hideSuggestions();
        return;
      }
      this.hideSuggestions();
      this.navigate('#/search/' + encodeURIComponent(trimmed));
    }

    navigate(path) {
      if (this.router && typeof this.router.navigate === 'function') {
        this.router.navigate(path);
      } else {
        global.location.hash = path;
      }
    }

    renderSuggestion(result, index) {
      var suggestion = this.createElement('div', 'search-suggestion');
      var type = this.normalizeType(result.type);
      suggestion.setAttribute('role', 'option');
      suggestion.setAttribute('tabindex', '-1');
      suggestion.setAttribute('aria-selected', 'false');
      suggestion.setAttribute('data-path', result.path || '');
      suggestion.setAttribute('id', 'search-suggestion-' + index);

      suggestion.appendChild(this.createElement('span', 'suggestion-type ' + type, this.getTypeLabel(result.type)));
      suggestion.appendChild(this.createElement('span', 'suggestion-name', result.name || result.id || 'Untitled result'));
      suggestion.appendChild(this.createElement('span', 'suggestion-path', this.getPathSnippet(result)));
      return suggestion;
    }

    renderFilterTabs() {
      var wrapper = this.createElement('div', 'search-filter-tabs');
      wrapper.setAttribute('role', 'tablist');
      wrapper.setAttribute('aria-label', 'Search result filters');

      Object.keys(FILTERS).forEach((filterKey) => {
        var button = this.createElement('button', 'search-filter-tab', FILTERS[filterKey]);
        button.type = 'button';
        button.setAttribute('role', 'tab');
        button.setAttribute('aria-selected', this.currentFilter === filterKey ? 'true' : 'false');
        button.classList.toggle('active', this.currentFilter === filterKey);
        button.addEventListener('click', () => {
          this.currentFilter = filterKey;
          wrapper.querySelectorAll('.search-filter-tab').forEach((tab) => {
            var active = tab === button;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-selected', active ? 'true' : 'false');
          });
          var resultsContainer = wrapper.parentElement ? wrapper.parentElement.querySelector('.search-results-list') : null;
          this.renderResults(this.currentResults, resultsContainer);
        });
        wrapper.appendChild(button);
      });

      return wrapper;
    }

    renderResultCard(result) {
      var card = this.createElement('article', 'search-result-card');
      var type = this.normalizeType(result.type);
      card.setAttribute('data-path', result.path || '');
      card.setAttribute('tabindex', '0');

      card.appendChild(this.createElement('div', 'result-type-badge ' + type, this.getTypeLabel(result.type)));
      card.appendChild(this.createElement('div', 'result-name', result.name || result.id || 'Untitled result'));
      card.appendChild(this.createElement('div', 'result-path', this.getResultPathText(result)));

      if (result.type === 'cell_type') {
        card.appendChild(this.renderMarkerTags(result));
      }

      card.addEventListener('click', () => {
        this.navigateToResult(result);
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          this.navigateToResult(result);
        }
      });

      return card;
    }

    renderMarkerTags(result) {
      var wrapper = this.createElement('div', 'result-markers');
      var markers = this.getMarkersForResult(result).slice(0, 8);

      if (!markers.length) {
        return wrapper;
      }

      markers.forEach((marker) => {
        var tag = this.createElement('button', 'marker-tag positive', marker);
        tag.type = 'button';
        tag.addEventListener('click', (event) => {
          event.stopPropagation();
          this.navigateToResult(result);
        });
        wrapper.appendChild(tag);
      });

      return wrapper;
    }

    filterResults(results) {
      if (this.currentFilter === 'markers') {
        return this.buildMarkerSummaryResults(results);
      }
      if (this.currentFilter === 'cellTypes') {
        return results.filter((result) => result.type === 'cell_type');
      }
      return results;
    }

    buildMarkerSummaryResults(results) {
      var groups = new Map();
      results.forEach((result) => {
        if (result.matchField !== 'marker') {
          return;
        }
        var marker = result.matchSnippet || this.currentQuery;
        var key = String(marker || '').toLowerCase();
        if (!groups.has(key)) {
          groups.set(key, {
            type: 'marker',
            id: key,
            name: marker,
            path: result.path,
            cellTypeCount: 0
          });
        }
        groups.get(key).cellTypeCount += 1;
      });
      return Array.from(groups.values());
    }

    getCurrentSpecies() {
      if (this.datastore && typeof this.datastore.getSpecies === 'function') {
        return this.datastore.getSpecies();
      }
      return 'human';
    }

    parseSpeciesPrefix(query) {
      var trimmed = (query || '').trim();
      var match = trimmed.match(/^(human|mouse)\s+(.+)$/i);
      if (!match) {
        return { query: trimmed, species: null };
      }
      return {
        query: match[2].trim(),
        species: match[1].toLowerCase()
      };
    }

    getTypeLabel(type) {
      return TYPE_LABELS[type] || TYPE_LABELS[this.normalizeType(type)] || String(type || 'Result');
    }

    normalizeType(type) {
      return String(type || 'result').replace(/_/g, '-');
    }

    getPathSnippet(result) {
      if (result.matchSnippet && result.matchField === 'marker') {
        return 'Marker: ' + result.matchSnippet;
      }
      return this.getBreadcrumbText(result.path, result.type === 'cell_type');
    }

    getResultPathText(result) {
      if (result.type === 'marker') {
        return 'Found in ' + result.cellTypeCount + (result.cellTypeCount === 1 ? ' cell type' : ' cell types');
      }
      return this.getBreadcrumbText(result.path, result.type === 'cell_type');
    }

    getBreadcrumbText(path, omitLast) {
      if (this.datastore && typeof this.datastore.getBreadcrumb === 'function') {
        var breadcrumbs = this.datastore.getBreadcrumb(path);
        if (omitLast) {
          breadcrumbs = breadcrumbs.slice(0, -1);
        }
        if (breadcrumbs.length) {
          return breadcrumbs.map((item) => item.label).join(' > ');
        }
      }
      return String(path || '').replace(/^#\//, '').split('/').filter(Boolean).join(' > ');
    }

    getMarkersForResult(result) {
      if (!this.datastore || typeof this.datastore.getMarkersForCellType !== 'function' || !result || !result.id) {
        return [];
      }
      var markers = this.datastore.getMarkersForCellType(result.id, this.getCurrentSpecies());
      return markers && Array.isArray(markers.positive) ? markers.positive : [];
    }

    createElement(tagName, className, text) {
      var element = document.createElement(tagName);
      if (className) {
        element.className = className;
      }
      if (text !== undefined && text !== null) {
        element.textContent = text;
      }
      return element;
    }
  }

  global.SearchController = SearchController;
})(typeof window !== 'undefined' ? window : globalThis);
