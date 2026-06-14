(function (global) {
  'use strict';

  var VALID_SPECIES = { human: true, mouse: true };
  var DEFAULT_LIMIT = 50;
  var MARKER_ALIASES = {
    'VE-cadherin': 'CDH5',
    'c-Kit': 'KIT',
    'Langerin': 'CD207',
    'DEC-205': 'LY75',
    'DC-SIGN': 'CD209',
    'DC-LAMP': 'CD208',
    'B220': 'CD45R',
    'Fc\u03b5RI': 'FCER1A',
    '2B4': 'CD244',
    'Ly-6G': 'LY6G',
    'F4/80': 'ADGRE1',
    'Gr-1': 'LY6G',
    'Mac-1': 'ITGAM',
    'Sca-1': 'LY6A',
    'PD-1': 'PDCD1',
    'CTLA-4': 'CTLA4',
    'GITR': 'TNFRSF18',
    'OX40': 'TNFRSF4',
    'TIM-1': 'HAVCR1',
    'NG2': 'CSPG4',
    'Podoplanin': 'PDPN',
    'Thrombomodulin': 'THBD',
    'Endomucin': 'EMCN',
    'Iba1': 'AIF1',
    'cTnI': 'TNNI3',
    'cTnT': 'TNNT2',
    'Alpha-SMA': 'ACTA2',
    'Alpha-smooth muscle actin': 'ACTA2',
    'Alpha-gustducin': 'GNAT3',
    'Integrin alpha 8': 'ITGA8',
    'PDGFRalpha': 'PDGFRA',
    'TGF-beta': 'TGFB1',
    'TNF-alpha': 'TNF',
    'TCRalpha/beta': 'TRAC/TRBC1',
    'TCRbeta': 'TRBC1',
    'cGMP-dependent protein kinase': 'PRKG1',
    'Pro-SFTPC': 'SFTPC'
  };

  class CellMarkersDatastore {
    constructor() {
      this.data = null;
      this.species = 'human';
      this.loaded = false;

      this.cellTypeById = new Map();
      this.organById = new Map();
      this.microstructureById = new Map();
      this.citationById = new Map();
      this.markerIndex = {
        human: new Map(),
        mouse: new Map()
      };
      this.searchIndex = [];

      this.tissueSystemById = new Map();
      this.cellTypePathById = new Map();
      this.organPathById = new Map();
      this.microstructurePathById = new Map();

      this.speciesCallbacks = [];
      this.dataLoadedCallbacks = [];
    }

    async load(url = 'data/cell-markers.json') {
      var response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to load cell marker data: ' + response.status + ' ' + response.statusText);
      }

      this.data = await response.json();
      this._buildIndices();
      this.loaded = true;
      this._notifyDataLoaded();
    }

    getVersion() {
      return this.data && this.data.metadata ? this.data.metadata.version : '';
    }

    getLastUpdated() {
      return this.data && this.data.metadata ? this.data.metadata.last_updated : '';
    }

    getSources() {
      return this.data && this.data.metadata && Array.isArray(this.data.metadata.sources)
        ? this.data.metadata.sources
        : [];
    }

    getCitation(id) {
      if (id === null || id === undefined) {
        return null;
      }
      return this.citationById.get(id) ||
        this.citationById.get(Number(id)) ||
        this.citationById.get(String(id)) ||
        null;
    }

    getCitationsForCellType(cellTypeId) {
      var cellType = this.getCellTypeById(cellTypeId);
      if (!cellType || !Array.isArray(cellType.references)) {
        return [];
      }

      return cellType.references
        .map((referenceId) => this.getCitation(referenceId))
        .filter(Boolean);
    }

    getTissueSystems() {
      return this.data && Array.isArray(this.data.tissue_systems) ? this.data.tissue_systems : [];
    }

    getTissueSystem(id) {
      return this.tissueSystemById.get(id) || null;
    }

    getOrgan(tissueSystemId, organId) {
      var tissueSystem = this.getTissueSystem(tissueSystemId);
      if (!tissueSystem || !Array.isArray(tissueSystem.organs)) {
        return null;
      }
      return this._findById(tissueSystem.organs, organId);
    }

    getOrganById(organId) {
      return this.organById.get(organId) || null;
    }

    getMicrostructure(tissueSystemId, organId, microstructureId) {
      var organ = this.getOrgan(tissueSystemId, organId);
      if (!organ || !Array.isArray(organ.microstructures)) {
        return null;
      }
      return this._findById(organ.microstructures, microstructureId);
    }

    getMicrostructureById(microstructureId) {
      return this.microstructureById.get(microstructureId) || null;
    }

    getCellType(path) {
      if (!path) {
        return null;
      }
      var microstructure = this.getMicrostructure(path.tissueSystemId, path.organId, path.microstructureId);
      if (!microstructure || !Array.isArray(microstructure.cell_types)) {
        return null;
      }
      return this._findById(microstructure.cell_types, path.cellTypeId);
    }

    getCellTypeById(cellTypeId) {
      return this.cellTypeById.get(cellTypeId) || null;
    }

    getMarkersForCellType(cellTypeId, species) {
      var resolvedSpecies = this._normalizeSpecies(species || this.species);
      var cellType = this.getCellTypeById(cellTypeId);
      var markerSet = cellType && cellType.markers ? cellType.markers[resolvedSpecies] : null;
      return {
        positive: markerSet && Array.isArray(markerSet.positive) ? markerSet.positive : [],
        negative: markerSet && Array.isArray(markerSet.negative) ? markerSet.negative : []
      };
    }

    findCellTypesByMarker(marker, species) {
      var resolvedSpecies = this._normalizeSpecies(species || this.species);
      var normalizedMarker = this._normalizeMarker(marker);
      if (!normalizedMarker) {
        return [];
      }

      var ids = this.markerIndex[resolvedSpecies].get(normalizedMarker);
      if (!ids) {
        return [];
      }

      return Array.from(ids)
        .map((cellTypeId) => this.getCellTypeById(cellTypeId))
        .filter(Boolean);
    }

    findCellTypesByMarkers(markers, species, mode) {
      var markerList = Array.isArray(markers) ? markers : [];
      var resolvedMode = mode === 'all' ? 'all' : 'any';
      if (markerList.length === 0) {
        return [];
      }

      var resultSets = markerList.map((marker) => {
        return new Set(this.findCellTypesByMarker(marker, species).map((cellType) => cellType.id));
      });

      var ids;
      if (resolvedMode === 'all') {
        ids = Array.from(resultSets[0] || []).filter((cellTypeId) => {
          return resultSets.every((set) => set.has(cellTypeId));
        });
      } else {
        var union = new Set();
        resultSets.forEach((set) => {
          set.forEach((cellTypeId) => union.add(cellTypeId));
        });
        ids = Array.from(union);
      }

      return ids.map((cellTypeId) => this.getCellTypeById(cellTypeId)).filter(Boolean);
    }

    search(query, options) {
      var trimmed = (query || '').trim();
      if (!trimmed) {
        return [];
      }

      var opts = options || {};
      var species = this._normalizeSpecies(opts.species || this.species);
      var limit = Number.isFinite(opts.limit) && opts.limit > 0 ? opts.limit : DEFAULT_LIMIT;
      var tokens = this._tokenize(trimmed);
      if (tokens.length === 0) {
        return [];
      }

      var resultMap = new Map();
      tokens.forEach((token) => {
        this._addMarkerSearchResults(resultMap, token, species);
        this.searchIndex.forEach((entry) => {
          this._scoreSearchEntry(resultMap, entry, token, species);
        });
      });

      return Array.from(resultMap.values())
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }
          return a.name.localeCompare(b.name);
        })
        .slice(0, limit)
        .map((result) => {
          return {
            type: result.type,
            id: result.id,
            name: result.name,
            path: result.path,
            matchField: result.matchField,
            matchSnippet: result.matchSnippet
          };
        });
    }

    getBreadcrumb(path) {
      var parts = this._parsePath(path);
      var breadcrumbs = [];
      var tissueSystem = parts[0] ? this.getTissueSystem(parts[0]) : null;
      var organ = parts[1] ? this.getOrgan(parts[0], parts[1]) : null;
      var microstructure = parts[2] ? this.getMicrostructure(parts[0], parts[1], parts[2]) : null;
      var cellType = parts[3] ? this.getCellType({
        tissueSystemId: parts[0],
        organId: parts[1],
        microstructureId: parts[2],
        cellTypeId: parts[3]
      }) : null;

      if (tissueSystem) {
        breadcrumbs.push({ label: tissueSystem.name, path: this._fragment(parts[0]) });
      }
      if (organ) {
        breadcrumbs.push({ label: organ.name, path: this._fragment(parts[0], parts[1]) });
      }
      if (microstructure) {
        breadcrumbs.push({ label: microstructure.name, path: this._fragment(parts[0], parts[1], parts[2]) });
      }
      if (cellType) {
        breadcrumbs.push({ label: cellType.name, path: this._fragment(parts[0], parts[1], parts[2], parts[3]) });
      }

      return breadcrumbs;
    }

    getPathForCellType(cellTypeId) {
      var path = this.cellTypePathById.get(cellTypeId);
      return path ? Object.assign({}, path) : null;
    }

    setSpecies(species) {
      var resolvedSpecies = this._normalizeSpecies(species);
      if (resolvedSpecies === this.species) {
        return;
      }
      this.species = resolvedSpecies;
      this.speciesCallbacks.forEach((callback) => callback(resolvedSpecies));
    }

    getSpecies() {
      return this.species;
    }

    onSpeciesChange(callback) {
      if (typeof callback === 'function') {
        this.speciesCallbacks.push(callback);
      }
    }

    onDataLoaded(callback) {
      if (typeof callback !== 'function') {
        return;
      }
      this.dataLoadedCallbacks.push(callback);
      if (this.loaded) {
        callback();
      }
    }

    _buildIndices() {
      this.cellTypeById.clear();
      this.organById.clear();
      this.microstructureById.clear();
      this.citationById.clear();
      this.markerIndex.human.clear();
      this.markerIndex.mouse.clear();
      this.searchIndex = [];
      this.tissueSystemById.clear();
      this.cellTypePathById.clear();
      this.organPathById.clear();
      this.microstructurePathById.clear();

      if (this.data && this.data.metadata && Array.isArray(this.data.metadata.citations)) {
        this.data.metadata.citations.forEach((citation) => {
          if (!citation || citation.id === null || citation.id === undefined) {
            return;
          }
          this.citationById.set(citation.id, citation);
          this.citationById.set(String(citation.id), citation);
        });
      }

      this.getTissueSystems().forEach((tissueSystem) => {
        this._setWithDuplicateWarning(this.tissueSystemById, tissueSystem.id, tissueSystem, 'tissue system');
        this._addSearchEntry('tissue_system', tissueSystem.id, tissueSystem.name, this._fragment(tissueSystem.id), [
          { field: 'name', value: tissueSystem.name },
          { field: 'description', value: tissueSystem.description }
        ], 70);

        (tissueSystem.organs || []).forEach((organ) => {
          var organPath = {
            tissueSystemId: tissueSystem.id,
            organId: organ.id
          };
          this._setWithDuplicateWarning(this.organById, organ.id, organ, 'organ');
          this.organPathById.set(organ.id, organPath);
          this._addSearchEntry('organ', organ.id, organ.name, this._fragment(tissueSystem.id, organ.id), [
            { field: 'name', value: organ.name },
            { field: 'description', value: organ.description },
            { field: 'tissue_system', value: tissueSystem.name }
          ], 80);

          (organ.microstructures || []).forEach((microstructure) => {
            var microstructurePath = {
              tissueSystemId: tissueSystem.id,
              organId: organ.id,
              microstructureId: microstructure.id
            };
            this._setWithDuplicateWarning(this.microstructureById, microstructure.id, microstructure, 'microstructure');
            this.microstructurePathById.set(microstructure.id, microstructurePath);
            this._addSearchEntry('microstructure', microstructure.id, microstructure.name, this._fragment(tissueSystem.id, organ.id, microstructure.id), [
              { field: 'name', value: microstructure.name },
              { field: 'description', value: microstructure.description },
              { field: 'organ', value: organ.name },
              { field: 'tissue_system', value: tissueSystem.name }
            ], 75);

            (microstructure.cell_types || []).forEach((cellType) => {
              var cellTypePath = {
                tissueSystemId: tissueSystem.id,
                organId: organ.id,
                microstructureId: microstructure.id,
                cellTypeId: cellType.id
              };
              this._setWithDuplicateWarning(this.cellTypeById, cellType.id, cellType, 'cell type');
              this.cellTypePathById.set(cellType.id, cellTypePath);
              this._indexCellTypeMarkers(cellType);
              this._addSearchEntry('cell_type', cellType.id, cellType.name, this._fragment(tissueSystem.id, organ.id, microstructure.id, cellType.id), [
                { field: 'name', value: cellType.name },
                { field: 'aliases', value: (cellType.aliases || []).join(' ') },
                { field: 'marker_aliases', value: this._getMarkerAliasesForCellType(cellType).join(' ') },
                { field: 'description', value: cellType.description },
                { field: 'organ', value: organ.name },
                { field: 'microstructure', value: microstructure.name },
                { field: 'tissue_system', value: tissueSystem.name }
              ], 90);
            });
          });
        });
      });
    }

    _indexCellTypeMarkers(cellType) {
      ['human', 'mouse'].forEach((species) => {
        var markerSet = cellType.markers && cellType.markers[species] ? cellType.markers[species] : {};
        var markers = []
          .concat(markerSet.positive || [])
          .concat(markerSet.negative || []);

        markers.forEach((marker) => {
          this._addMarkerIndexEntry(species, marker, cellType.id);
          this._getMarkerAliasesForCanonical(marker).forEach((alias) => {
            this._addMarkerIndexEntry(species, alias, cellType.id);
          });
        });
      });
    }

    _addMarkerIndexEntry(species, marker, cellTypeId) {
      var normalizedMarker = this._normalizeMarker(marker);
      if (!normalizedMarker) {
        return;
      }
      if (!this.markerIndex[species].has(normalizedMarker)) {
        this.markerIndex[species].set(normalizedMarker, new Set());
      }
      this.markerIndex[species].get(normalizedMarker).add(cellTypeId);
    }

    _getMarkerAliasesForCellType(cellType) {
      var aliases = [];
      ['human', 'mouse'].forEach((species) => {
        var markerSet = cellType.markers && cellType.markers[species] ? cellType.markers[species] : {};
        var markers = []
          .concat(markerSet.positive || [])
          .concat(markerSet.negative || []);

        markers.forEach((marker) => {
          this._getMarkerAliasesForCanonical(marker).forEach((alias) => {
            if (aliases.indexOf(alias) === -1) {
              aliases.push(alias);
            }
          });
        });
      });
      return aliases;
    }

    _getMarkerAliasesForCanonical(marker) {
      var normalizedMarker = this._normalizeMarker(marker);
      var aliases = [];
      Object.keys(MARKER_ALIASES).forEach((alias) => {
        if (this._normalizeMarker(MARKER_ALIASES[alias]) === normalizedMarker) {
          aliases.push(alias);
        }
      });
      return aliases;
    }

    _addSearchEntry(type, id, name, path, fields, baseScore) {
      this.searchIndex.push({
        type: type,
        id: id,
        name: name || id,
        path: path,
        fields: fields.map((field) => {
          return {
            field: field.field,
            value: field.value || '',
            normalized: this._normalizeText(field.value || '')
          };
        }),
        baseScore: baseScore
      });
    }

    _addMarkerSearchResults(resultMap, token, species) {
      var exactIds = this.markerIndex[species].get(this._normalizeMarker(token));
      if (exactIds) {
        exactIds.forEach((cellTypeId) => {
          var cellType = this.getCellTypeById(cellTypeId);
          var path = this.getPathForCellType(cellTypeId);
          if (cellType && path) {
            this._mergeResult(resultMap, {
              type: 'cell_type',
              id: cellType.id,
              name: cellType.name,
              path: this._fragment(path.tissueSystemId, path.organId, path.microstructureId, path.cellTypeId),
              matchField: 'marker',
              matchSnippet: token,
              score: 140
            });
          }
        });
      }

      this.markerIndex[species].forEach((ids, normalizedMarker) => {
        if (normalizedMarker === this._normalizeMarker(token) || normalizedMarker.indexOf(this._normalizeMarker(token)) !== 0) {
          return;
        }
        ids.forEach((cellTypeId) => {
          var cellType = this.getCellTypeById(cellTypeId);
          var path = this.getPathForCellType(cellTypeId);
          if (cellType && path) {
            this._mergeResult(resultMap, {
              type: 'cell_type',
              id: cellType.id,
              name: cellType.name,
              path: this._fragment(path.tissueSystemId, path.organId, path.microstructureId, path.cellTypeId),
              matchField: 'marker',
              matchSnippet: normalizedMarker,
              score: 120
            });
          }
        });
      });
    }

    _scoreSearchEntry(resultMap, entry, token) {
      var normalizedToken = this._normalizeText(token);
      entry.fields.forEach((field) => {
        if (!field.normalized || field.normalized.indexOf(normalizedToken) === -1) {
          return;
        }

        var score = entry.baseScore;
        if (field.normalized === normalizedToken) {
          score += 35;
        } else if (field.normalized.indexOf(normalizedToken) === 0) {
          score += 20;
        } else {
          score += 10;
        }
        if (field.field === 'name') {
          score += 15;
        } else if (field.field === 'aliases') {
          score += 10;
        }

        this._mergeResult(resultMap, {
          type: entry.type,
          id: entry.id,
          name: entry.name,
          path: entry.path,
          matchField: field.field,
          matchSnippet: this._snippet(field.value, token),
          score: score
        });
      });
    }

    _mergeResult(resultMap, result) {
      var key = result.type + ':' + result.id + ':' + result.path;
      var existing = resultMap.get(key);
      if (!existing || result.score > existing.score) {
        resultMap.set(key, result);
      }
    }

    _setWithDuplicateWarning(map, id, value, label) {
      if (!id) {
        return;
      }
      if (map.has(id) && typeof console !== 'undefined' && typeof console.warn === 'function') {
        console.warn('Duplicate ' + label + ' id "' + id + '"; last one wins.');
      }
      map.set(id, value);
    }

    _findById(items, id) {
      for (var i = 0; i < items.length; i += 1) {
        if (items[i].id === id) {
          return items[i];
        }
      }
      return null;
    }

    _normalizeSpecies(species) {
      if (!VALID_SPECIES[species]) {
        throw new Error('Unsupported species: ' + species);
      }
      return species;
    }

    _normalizeMarker(marker) {
      return String(marker || '').trim().toLowerCase();
    }

    _normalizeText(value) {
      return String(value || '').toLowerCase();
    }

    _tokenize(value) {
      return String(value || '')
        .split(/[\s,\/]+/)
        .map((token) => token.trim())
        .filter(Boolean);
    }

    _parsePath(path) {
      return String(path || '')
        .replace(/^#/, '')
        .replace(/^\//, '')
        .split('/')
        .filter(Boolean);
    }

    _fragment() {
      return '#/' + Array.prototype.slice.call(arguments).filter(Boolean).join('/');
    }

    _snippet(value, token) {
      var text = String(value || '');
      var normalizedText = text.toLowerCase();
      var normalizedToken = String(token || '').toLowerCase();
      var index = normalizedText.indexOf(normalizedToken);
      if (index === -1) {
        return text;
      }

      var start = Math.max(0, index - 20);
      var end = Math.min(text.length, index + normalizedToken.length + 20);
      return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    }

    _notifyDataLoaded() {
      this.dataLoadedCallbacks.forEach((callback) => callback());
    }
  }

  global.CellMarkersDatastore = CellMarkersDatastore;
})(typeof window !== 'undefined' ? window : globalThis);
