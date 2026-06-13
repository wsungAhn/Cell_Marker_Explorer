(function () {
  'use strict';

  var MAX_COMPARE_ITEMS = 6;
  var SPECIES = ['human', 'mouse'];
  var SPECIES_LABELS = {
    human: 'Human',
    mouse: 'Mouse'
  };
  var STATUS_LABELS = {
    positive: '+',
    negative: '-',
    'not-listed': '·'
  };

  class CompareController {
    constructor(datastore, router) {
      this.datastore = datastore;
      this.router = router;
      this.selectedIds = [];
      this.selectionCallbacks = [];
      this.showNegative = false;
      this.sortMode = 'shared';
      this.currentSpecies = this.getCurrentSpecies();
      this.minShared = 1;

      this.tray = document.getElementById('compare-tray');
      this.itemsContainer = document.getElementById('compare-items');
      this.countNode = document.getElementById('compare-count');
      this.openButton = document.getElementById('compare-open-btn');
      this.clearButton = document.getElementById('compare-clear-btn');
      this.view = document.getElementById('view-compare');

      this.bindTrayEvents();
      this.bindSpeciesEvents();
      this.renderTray();

      window.compareController = this;
      window.compareTray = this;
      window.compareView = this;
      window.compare = this;
    }

    addCellType(cellTypeId) {
      var id = this.normalizeId(cellTypeId);
      if (!id || this.isInCompare(id)) {
        return;
      }
      if (!this.getCellType(id)) {
        this.warn('Cannot add unknown cell type: ' + id);
        return;
      }
      if (this.selectedIds.length >= MAX_COMPARE_ITEMS) {
        this.warn('You can compare up to ' + MAX_COMPARE_ITEMS + ' cell types at a time.');
        return;
      }

      this.selectedIds.push(id);
      this.renderTray();
      this.notifySelectionChange();
    }

    removeCellType(cellTypeId) {
      var id = this.normalizeId(cellTypeId);
      var nextIds = this.selectedIds.filter(function (selectedId) {
        return selectedId !== id;
      });
      if (nextIds.length === this.selectedIds.length) {
        return;
      }
      this.selectedIds = nextIds;
      this.renderTray();
      this.notifySelectionChange();
    }

    clearAll() {
      if (!this.selectedIds.length) {
        this.renderTray();
        return;
      }
      this.selectedIds = [];
      this.renderTray();
      this.notifySelectionChange();
      if (this.isCompareRouteActive()) {
        this.navigate('#/');
      }
    }

    getSelectedIds() {
      return this.selectedIds.slice();
    }

    isInCompare(cellTypeId) {
      var id = this.normalizeId(cellTypeId);
      return this.selectedIds.indexOf(id) !== -1;
    }

    renderTray() {
      if (!this.tray) {
        return;
      }

      if (this.countNode) {
        this.countNode.textContent = String(this.selectedIds.length);
      }

      if (this.itemsContainer) {
        this.clearNode(this.itemsContainer);
        this.selectedIds.forEach((id) => {
          var cellType = this.getCellType(id);
          this.itemsContainer.appendChild(this.renderTrayItem(id, cellType));
        });
      }

      if (this.openButton) {
        this.openButton.disabled = this.selectedIds.length === 0;
      }
      if (this.clearButton) {
        this.clearButton.hidden = this.selectedIds.length === 0;
      }

      if (this.selectedIds.length > 0) {
        this.showTray();
      } else {
        this.hideTray();
      }
    }

    showTray() {
      if (this.tray) {
        this.tray.hidden = false;
        this.tray.setAttribute('aria-hidden', 'false');
      }
    }

    hideTray() {
      if (this.tray) {
        this.tray.hidden = true;
        this.tray.setAttribute('aria-hidden', 'true');
      }
    }

    renderCompareView(cellTypeIds) {
      var ids = this.normalizeIds(cellTypeIds).filter((id) => Boolean(this.getCellType(id)));
      if (ids.length > MAX_COMPARE_ITEMS) {
        ids = ids.slice(0, MAX_COMPARE_ITEMS);
        this.warn('Only the first ' + MAX_COMPARE_ITEMS + ' cell types are shown.');
      }

      if (ids.length === 0) {
        this.navigate('#/');
        return;
      }

      var previousIds = this.selectedIds.join(',');
      this.selectedIds = ids.slice();
      this.renderTray();
      if (previousIds !== this.selectedIds.join(',')) {
        this.notifySelectionChange();
      }

      if (!this.view) {
        return;
      }

      this.currentSpecies = this.normalizeSpecies(this.currentSpecies);
      this.clearNode(this.view);

      var section = this.createElement('section', 'compare-view');
      section.appendChild(this.renderCompareHeader(ids));

      if (ids.length === 1) {
        section.appendChild(this.createElement('p', 'empty-message', 'Add more cell types to compare marker patterns side-by-side.'));
      }

      var rows = this.buildComparisonRows(ids, this.currentSpecies, this.showNegative);
      rows = this.filterRowsByMinShared(rows);
      this.sortRows(rows, this.sortMode);

      if (!rows.some(function (row) { return row.sharedAcrossAll; })) {
        section.appendChild(this.createElement('p', 'empty-message', 'No shared positive markers.'));
      }

      section.appendChild(this.renderTable(ids, rows));
      this.view.appendChild(section);
    }

    onSelectionChange(callback) {
      if (typeof callback !== 'function') {
        return function noop() {};
      }
      this.selectionCallbacks.push(callback);
      return () => {
        this.selectionCallbacks = this.selectionCallbacks.filter(function (existing) {
          return existing !== callback;
        });
      };
    }

    render(route) {
      var ids = route && route.params && Array.isArray(route.params.cellTypeIds)
        ? route.params.cellTypeIds
        : [];
      this.renderCompareView(ids);
    }

    bindTrayEvents() {
      if (this.openButton) {
        this.openButton.addEventListener('click', () => {
          var ids = this.getSelectedIds();
          if (!ids.length) {
            return;
          }
          this.navigate('#/compare/' + ids.map(encodeURIComponent).join(','));
        });
      }

      if (this.clearButton) {
        this.clearButton.addEventListener('click', () => {
          this.clearAll();
        });
      }
    }

    bindSpeciesEvents() {
      if (this.datastore && typeof this.datastore.onSpeciesChange === 'function') {
        this.datastore.onSpeciesChange((species) => {
          this.currentSpecies = this.normalizeSpecies(species);
          if (this.isCompareRouteActive()) {
            this.renderCompareView(this.selectedIds);
          }
        });
      }
    }

    renderTrayItem(id, cellType) {
      var item = this.createElement('div', 'tray-item');
      var name = this.createElement('span', 'tray-item-name', cellType && cellType.name ? cellType.name : id);
      var remove = this.createElement('button', 'tray-item-remove', '×');

      item.setAttribute('data-id', id);
      remove.type = 'button';
      remove.setAttribute('aria-label', 'Remove ' + id);
      remove.addEventListener('click', () => {
        this.removeCellType(id);
      });

      item.appendChild(name);
      item.appendChild(remove);
      return item;
    }

    renderCompareHeader(ids) {
      var header = this.createElement('header', 'compare-header');
      var title = this.createElement('h2', null, 'Marker Comparison');
      var controls = this.createElement('div', 'compare-controls');

      controls.appendChild(this.renderShowNegativeControl(ids));
      controls.appendChild(this.renderSpeciesSelect(ids));
      controls.appendChild(this.renderSortSelect(ids));
      controls.appendChild(this.renderMinSharedControl(ids));
      controls.appendChild(this.renderExportButton(ids));

      header.appendChild(title);
      header.appendChild(controls);
      return header;
    }

    renderShowNegativeControl(ids) {
      var label = this.createElement('label', 'compare-control');
      var checkbox = this.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'compare-show-negative';
      checkbox.checked = this.showNegative;
      checkbox.addEventListener('change', () => {
        this.showNegative = checkbox.checked;
        this.renderCompareView(ids);
      });
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(' Show negative markers'));
      return label;
    }

    renderSpeciesSelect(ids) {
      var label = this.createElement('label', 'compare-control');
      var select = this.createElement('select');
      select.id = 'compare-species';

      SPECIES.forEach((species) => {
        var option = this.createElement('option', null, SPECIES_LABELS[species]);
        option.value = species;
        option.selected = species === this.currentSpecies;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        this.currentSpecies = this.normalizeSpecies(select.value);
        if (this.datastore && typeof this.datastore.setSpecies === 'function') {
          this.datastore.setSpecies(this.currentSpecies);
        } else {
          this.renderCompareView(ids);
        }
      });

      label.appendChild(document.createTextNode('Species: '));
      label.appendChild(select);
      return label;
    }

    renderSortSelect(ids) {
      var label = this.createElement('label', 'compare-control');
      var select = this.createElement('select');
      var options = [
        { value: 'shared', label: 'By shared markers' },
        { value: 'unique', label: 'By uniqueness' },
        { value: 'alpha', label: 'Alphabetical' }
      ];

      select.id = 'compare-sort';
      options.forEach((item) => {
        var option = this.createElement('option', null, item.label);
        option.value = item.value;
        option.selected = item.value === this.sortMode;
        select.appendChild(option);
      });

      select.addEventListener('change', () => {
        this.sortMode = select.value;
        this.renderCompareView(ids);
      });

      label.appendChild(document.createTextNode('Sort: '));
      label.appendChild(select);
      return label;
    }

    renderMinSharedControl(ids) {
      var label = this.createElement('label', 'compare-control');
      var slider = this.createElement('input');
      var value = this.createElement('span', 'compare-min-shared-value', String(this.minShared));

      slider.type = 'range';
      slider.id = 'compare-min-shared';
      slider.min = '1';
      slider.max = String(Math.max(ids.length, 1));
      slider.value = String(Math.min(this.minShared, ids.length || 1));
      this.minShared = Number(slider.value);

      slider.addEventListener('input', () => {
        this.minShared = Number(slider.value) || 1;
        value.textContent = String(this.minShared);
        this.renderCompareView(ids);
      });

      label.appendChild(document.createTextNode('Min shared: '));
      label.appendChild(slider);
      label.appendChild(value);
      return label;
    }

    renderExportButton(ids) {
      var button = this.createElement('button', null, 'Export CSV');
      var exporter = this.getExporter();

      button.id = 'compare-export-csv';
      button.type = 'button';

      if (exporter && typeof exporter.exportCompare === 'function') {
        button.addEventListener('click', () => {
          exporter.exportCompare(ids, this.currentSpecies, 'csv', this.showNegative);
        });
      } else {
        button.disabled = true;
        button.title = 'Export module unavailable';
      }

      return button;
    }

    renderTable(ids, rows) {
      var container = this.createElement('div', 'compare-table-container');
      var table = this.createElement('table', 'compare-table');
      table.id = 'compare-table';

      table.appendChild(this.renderTableHead(ids));
      table.appendChild(this.renderTableBody(ids, rows));
      container.appendChild(table);
      return container;
    }

    renderTableHead(ids) {
      var thead = this.createElement('thead');
      var row = this.createElement('tr');
      row.appendChild(this.createElement('th', null, 'Marker'));

      ids.forEach((id) => {
        var cellType = this.getCellType(id);
        row.appendChild(this.createElement('th', null, cellType && cellType.name ? cellType.name : id));
      });

      thead.appendChild(row);
      return thead;
    }

    renderTableBody(ids, rows) {
      var tbody = this.createElement('tbody');

      if (!rows.length) {
        var emptyRow = this.createElement('tr');
        var emptyCell = this.createElement('td', 'empty-message', 'No markers match the current filters.');
        emptyCell.colSpan = ids.length + 1;
        emptyRow.appendChild(emptyCell);
        tbody.appendChild(emptyRow);
        return tbody;
      }

      rows.forEach((comparisonRow) => {
        var row = this.createElement('tr');
        if (comparisonRow.sharedAcrossAll) {
          row.classList.add('row-shared');
        }

        row.appendChild(this.createElement('td', 'marker-name', comparisonRow.marker));
        ids.forEach((id) => {
          var status = comparisonRow.statusById[id] || 'not-listed';
          row.appendChild(this.createElement('td', 'cell-' + status, STATUS_LABELS[status]));
        });
        tbody.appendChild(row);
      });

      return tbody;
    }

    buildComparisonRows(ids, species, includeNegative) {
      var markerMap = new Map();
      var markerSetsById = {};

      ids.forEach((id) => {
        var markerSet = this.getMarkers(id, species);
        markerSetsById[id] = {
          positive: this.arrayToMarkerSet(markerSet.positive),
          negative: this.arrayToMarkerSet(markerSet.negative)
        };

        markerSet.positive.forEach(function (marker) {
          if (marker) {
            markerMap.set(marker, true);
          }
        });
        if (includeNegative) {
          markerSet.negative.forEach(function (marker) {
            if (marker) {
              markerMap.set(marker, true);
            }
          });
        }
      });

      return Array.from(markerMap.keys()).map((marker) => {
        var statusById = {};
        var positiveCount = 0;
        var listedCount = 0;

        ids.forEach((id) => {
          var sets = markerSetsById[id];
          var status = 'not-listed';
          if (sets.positive.has(marker)) {
            status = 'positive';
            positiveCount += 1;
            listedCount += 1;
          } else if (sets.negative.has(marker)) {
            status = 'negative';
            listedCount += 1;
          }
          statusById[id] = status;
        });

        return {
          marker: marker,
          statusById: statusById,
          positiveCount: positiveCount,
          listedCount: listedCount,
          sharedAcrossAll: positiveCount === ids.length,
          uniquePositive: positiveCount === 1
        };
      });
    }

    filterRowsByMinShared(rows) {
      var minShared = Number(this.minShared) || 1;
      return rows.filter(function (row) {
        return row.positiveCount >= minShared;
      });
    }

    sortRows(rows, sortMode) {
      rows.sort(function (a, b) {
        if (sortMode === 'alpha') {
          return a.marker.localeCompare(b.marker);
        }
        if (sortMode === 'unique') {
          if (a.uniquePositive !== b.uniquePositive) {
            return a.uniquePositive ? -1 : 1;
          }
          if (a.positiveCount !== b.positiveCount) {
            return a.positiveCount - b.positiveCount;
          }
          return a.marker.localeCompare(b.marker);
        }
        if (a.sharedAcrossAll !== b.sharedAcrossAll) {
          return a.sharedAcrossAll ? -1 : 1;
        }
        if (a.positiveCount !== b.positiveCount) {
          return b.positiveCount - a.positiveCount;
        }
        if (a.listedCount !== b.listedCount) {
          return b.listedCount - a.listedCount;
        }
        return a.marker.localeCompare(b.marker);
      });
      return rows;
    }

    normalizeIds(ids) {
      var seen = {};
      var source = Array.isArray(ids) ? ids : [];
      return source.map((id) => this.normalizeId(id)).filter(function (id) {
        if (!id || seen[id]) {
          return false;
        }
        seen[id] = true;
        return true;
      });
    }

    normalizeId(id) {
      return id === undefined || id === null ? '' : String(id).trim();
    }

    normalizeSpecies(species) {
      return SPECIES.indexOf(species) !== -1 ? species : 'human';
    }

    arrayToMarkerSet(markers) {
      var set = new Set();
      (Array.isArray(markers) ? markers : []).forEach(function (marker) {
        if (marker) {
          set.add(marker);
        }
      });
      return set;
    }

    getMarkers(cellTypeId, species) {
      if (!this.datastore || typeof this.datastore.getMarkersForCellType !== 'function') {
        return { positive: [], negative: [] };
      }
      var markers = this.datastore.getMarkersForCellType(cellTypeId, species);
      return {
        positive: markers && Array.isArray(markers.positive) ? markers.positive : [],
        negative: markers && Array.isArray(markers.negative) ? markers.negative : []
      };
    }

    getCellType(cellTypeId) {
      if (this.datastore && typeof this.datastore.getCellTypeById === 'function') {
        return this.datastore.getCellTypeById(cellTypeId);
      }
      return null;
    }

    getCurrentSpecies() {
      if (this.datastore && typeof this.datastore.getSpecies === 'function') {
        return this.normalizeSpecies(this.datastore.getSpecies());
      }
      return 'human';
    }

    getExporter() {
      return window.exporter || window['export'] || null;
    }

    notifySelectionChange() {
      var ids = this.getSelectedIds();
      this.selectionCallbacks.slice().forEach(function (callback) {
        callback(ids);
      });
      if (typeof window.CustomEvent === 'function') {
        window.dispatchEvent(new window.CustomEvent('compare:change', { detail: ids }));
      }
    }

    isCompareRouteActive() {
      var route = this.router && typeof this.router.getCurrentRoute === 'function'
        ? this.router.getCurrentRoute()
        : null;
      return route && route.type === 'compare';
    }

    navigate(path) {
      if (this.router && typeof this.router.navigate === 'function') {
        this.router.navigate(path);
      } else {
        window.location.hash = path;
      }
    }

    warn(message) {
      if (typeof window.showToast === 'function') {
        window.showToast(message);
      } else if (typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn(message);
      }
    }

    clearNode(node) {
      while (node && node.firstChild) {
        node.removeChild(node.firstChild);
      }
    }

    createElement(tagName, className, text) {
      var element = document.createElement(tagName);
      if (className) {
        className.split(' ').forEach(function (name) {
          if (name) {
            element.classList.add(name);
          }
        });
      }
      if (text !== undefined && text !== null) {
        element.textContent = text;
      }
      return element;
    }
  }

  window.CompareController = CompareController;
})();
