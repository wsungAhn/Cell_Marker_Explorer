(function () {
  'use strict';

  var BOM = '\ufeff';
  var POSITIVE = '+';
  var NEGATIVE = '−';
  var NOT_LISTED = '·';

  function normalizeSpecies(species) {
    return species === 'mouse' ? 'mouse' : 'human';
  }

  function normalizeFormat(format) {
    return format === 'tsv' ? 'tsv' : 'csv';
  }

  function titleCaseSpecies(species) {
    return normalizeSpecies(species).charAt(0).toUpperCase() + normalizeSpecies(species).slice(1);
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function joinMarkers(markers) {
    return ensureArray(markers).join('; ');
  }

  function includesValue(values, target) {
    return ensureArray(values).indexOf(target) !== -1;
  }

  function addUnique(list, seen, values) {
    ensureArray(values).forEach(function (value) {
      if (!seen[value]) {
        seen[value] = true;
        list.push(value);
      }
    });
  }

  function getMimeType(format) {
    return format === 'tsv'
      ? 'text/tab-separated-values;charset=utf-8'
      : 'text/csv;charset=utf-8';
  }

  function getExtension(format) {
    return format === 'tsv' ? 'tsv' : 'csv';
  }

  function ExportController(datastore) {
    this.datastore = datastore;

    if (typeof window !== 'undefined') {
      if (!window.exporter) {
        window.exporter = this;
      }
      if (!window['export']) {
        window['export'] = this;
      }
    }
  }

  ExportController.prototype.exportCellType = function (cellTypeId, species, format) {
    var activeSpecies = normalizeSpecies(species);
    var activeFormat = normalizeFormat(format);
    var context = this._getCellContext(cellTypeId);
    var markers = this._getMarkers(cellTypeId, activeSpecies);
    var rows = [
      ['Cell Type', context.cellType ? context.cellType.name : cellTypeId],
      ['Species', titleCaseSpecies(activeSpecies)],
      ['Tissue System', context.tissueSystem ? context.tissueSystem.name : ''],
      ['Organ', context.organ ? context.organ.name : ''],
      ['Microstructure', context.microstructure ? context.microstructure.name : ''],
      ['Source', context.cellType && context.cellType.source ? context.cellType.source : ''],
      ['Version', this._getVersion()],
      ['', ''],
      ['Marker', 'Type']
    ];

    markers.positive.forEach(function (marker) {
      rows.push([marker, 'positive']);
    });
    markers.negative.forEach(function (marker) {
      rows.push([marker, 'negative']);
    });

    var content = this._generateDelimitedRows(rows, activeFormat === 'tsv' ? '\t' : ',');
    this.download(
      content,
      cellTypeId + '_' + activeSpecies + '_markers.' + getExtension(activeFormat),
      getMimeType(activeFormat)
    );
  };

  ExportController.prototype.exportCompare = function (cellTypeIds, species, format, includeNegative) {
    var activeSpecies = normalizeSpecies(species);
    var activeFormat = normalizeFormat(format);
    var ids = ensureArray(cellTypeIds);
    var contexts = ids.map(this._getCellContext.bind(this));
    var markerList = [];
    var seen = {};

    contexts.forEach(function (context) {
      var markers = this._getMarkers(context.cellType ? context.cellType.id : context.cellTypeId, activeSpecies);
      addUnique(markerList, seen, markers.positive);
      if (includeNegative) {
        addUnique(markerList, seen, markers.negative);
      }
    }, this);

    var headers = ['Marker'].concat(contexts.map(function (context) {
      return context.cellType ? context.cellType.name : context.cellTypeId;
    }));

    var data = markerList.map(function (marker) {
      var row = { Marker: marker };
      contexts.forEach(function (context) {
        var cellId = context.cellType ? context.cellType.id : context.cellTypeId;
        var cellName = context.cellType ? context.cellType.name : cellId;
        var markers = this._getMarkers(cellId, activeSpecies);
        if (includesValue(markers.positive, marker)) {
          row[cellName] = POSITIVE;
        } else if (includesValue(markers.negative, marker)) {
          row[cellName] = NEGATIVE;
        } else {
          row[cellName] = NOT_LISTED;
        }
      }, this);
      return row;
    }, this);

    var content = activeFormat === 'tsv'
      ? this.generateTSV(data, headers)
      : this.generateCSV(data, headers);
    this.download(
      content,
      'compare_' + ids.join('_') + '_' + activeSpecies + '.' + getExtension(activeFormat),
      getMimeType(activeFormat)
    );
  };

  ExportController.prototype.exportOrgan = function (organId, species, format) {
    var activeSpecies = normalizeSpecies(species);
    var activeFormat = normalizeFormat(format);
    var rows = this._collectRows({
      species: activeSpecies,
      organId: organId,
      includeTissueSystem: false,
      includeOrgan: false,
      includeVersion: false
    });
    var headers = ['Cell Type', 'Microstructure', 'Positive Markers', 'Negative Markers', 'Source'];
    var content = activeFormat === 'tsv'
      ? this.generateTSV(rows, headers)
      : this.generateCSV(rows, headers);

    this.download(
      content,
      organId + '_' + activeSpecies + '_markers.' + getExtension(activeFormat),
      getMimeType(activeFormat)
    );
  };

  ExportController.prototype.exportTissueSystem = function (tissueSystemId, species, format) {
    var activeSpecies = normalizeSpecies(species);
    var activeFormat = normalizeFormat(format);
    var rows = this._collectRows({
      species: activeSpecies,
      tissueSystemId: tissueSystemId,
      includeTissueSystem: false,
      includeOrgan: true,
      includeVersion: false
    });
    var headers = ['Organ', 'Microstructure', 'Cell Type', 'Positive Markers', 'Negative Markers', 'Source'];
    var content = activeFormat === 'tsv'
      ? this.generateTSV(rows, headers)
      : this.generateCSV(rows, headers);

    this.download(
      content,
      tissueSystemId + '_' + activeSpecies + '_markers.' + getExtension(activeFormat),
      getMimeType(activeFormat)
    );
  };

  ExportController.prototype.exportAll = function (species, format) {
    var activeSpecies = normalizeSpecies(species);
    var activeFormat = normalizeFormat(format);
    var rows = this._collectRows({
      species: activeSpecies,
      includeTissueSystem: true,
      includeOrgan: true,
      includeVersion: true
    });
    var headers = [
      'Tissue System',
      'Organ',
      'Microstructure',
      'Cell Type',
      'Positive Markers',
      'Negative Markers',
      'Source',
      'Version'
    ];
    var content = activeFormat === 'tsv'
      ? this.generateTSV(rows, headers)
      : this.generateCSV(rows, headers);

    this.download(
      content,
      'all_cell_markers_' + activeSpecies + '.' + getExtension(activeFormat),
      getMimeType(activeFormat)
    );
  };

  ExportController.prototype.generateCSV = function (data, headers) {
    return this._generateDelimitedObjects(data, headers, ',');
  };

  ExportController.prototype.generateTSV = function (data, headers) {
    return this._generateDelimitedObjects(data, headers, '\t');
  };

  ExportController.prototype.download = function (content, filename, mimeType) {
    if (typeof Blob !== 'undefined' && typeof document !== 'undefined') {
      var blob = new Blob([content], { type: mimeType });
      var urlFactory = (typeof URL !== 'undefined' && URL) ||
        (typeof webkitURL !== 'undefined' && webkitURL);

      if (urlFactory && typeof urlFactory.createObjectURL === 'function') {
        var url = urlFactory.createObjectURL(blob);
        var anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);

        if (typeof urlFactory.revokeObjectURL === 'function') {
          urlFactory.revokeObjectURL(url);
        }
        return;
      }
    }

    if (typeof window !== 'undefined' && typeof window.open === 'function') {
      var fallbackWindow = window.open('', '_blank');
      if (fallbackWindow && fallbackWindow.document) {
        fallbackWindow.document.open();
        fallbackWindow.document.write('<pre>' + this._escapeHtml(content) + '</pre>');
        fallbackWindow.document.close();
        return;
      }
    }

    throw new Error('Browser does not support file downloads or fallback windows.');
  };

  ExportController.prototype._generateDelimitedObjects = function (data, headers, delimiter) {
    var rows = [headers].concat(ensureArray(data).map(function (item) {
      return headers.map(function (header) {
        return item && Object.prototype.hasOwnProperty.call(item, header)
          ? {
            value: item[header],
            forceQuote: delimiter === ',' && /Markers$/.test(header) && item[header] !== ''
          }
          : '';
      });
    }));
    return this._generateDelimitedRows(rows, delimiter);
  };

  ExportController.prototype._generateDelimitedRows = function (rows, delimiter) {
    var lines = ensureArray(rows).map(function (row) {
      return ensureArray(row).map(function (field) {
        return this._escapeDelimitedField(field, delimiter);
      }, this).join(delimiter);
    }, this);
    return BOM + lines.join('\r\n');
  };

  ExportController.prototype._escapeDelimitedField = function (value, delimiter) {
    if (value === null || value === undefined) {
      return '';
    }

    var forceQuote = value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')
      ? value.forceQuote
      : false;
    var rawValue = value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')
      ? value.value
      : value;
    var text = String(rawValue);
    var shouldQuote = forceQuote ||
      text.indexOf('"') !== -1 ||
      text.indexOf('\n') !== -1 ||
      text.indexOf('\r') !== -1 ||
      text.indexOf(delimiter) !== -1;

    if (shouldQuote) {
      return '"' + text.replace(/"/g, '""') + '"';
    }
    return text;
  };

  ExportController.prototype._escapeHtml = function (value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  ExportController.prototype._collectRows = function (options) {
    var rows = [];
    var version = this._getVersion();
    var tissueSystems = this._getTissueSystems();

    tissueSystems.forEach(function (tissueSystem) {
      if (options.tissueSystemId && tissueSystem.id !== options.tissueSystemId) {
        return;
      }

      ensureArray(tissueSystem.organs).forEach(function (organ) {
        if (options.organId && organ.id !== options.organId) {
          return;
        }

        ensureArray(organ.microstructures).forEach(function (microstructure) {
          ensureArray(microstructure.cell_types).forEach(function (cellType) {
            var markers = this._getMarkers(cellType.id, options.species);
            var row = {};

            if (options.includeTissueSystem) {
              row['Tissue System'] = tissueSystem.name;
            }
            if (options.includeOrgan) {
              row.Organ = organ.name;
            }
            row.Microstructure = microstructure.name;
            row['Cell Type'] = cellType.name;
            row['Positive Markers'] = joinMarkers(markers.positive);
            row['Negative Markers'] = joinMarkers(markers.negative);
            row.Source = cellType.source || '';
            if (options.includeVersion) {
              row.Version = version;
            }

            rows.push(row);
          }, this);
        }, this);
      }, this);
    }, this);

    return rows;
  };

  ExportController.prototype._getCellContext = function (cellTypeId) {
    var context = {
      cellTypeId: cellTypeId,
      tissueSystem: null,
      organ: null,
      microstructure: null,
      cellType: this._getCellType(cellTypeId)
    };
    var path = this.datastore && typeof this.datastore.getPathForCellType === 'function'
      ? this.datastore.getPathForCellType(cellTypeId)
      : null;

    if (path) {
      context.tissueSystem = this._getTissueSystem(path.tissueSystemId);
      context.organ = this._getOrgan(path.tissueSystemId, path.organId);
      context.microstructure = this._getMicrostructure(
        path.tissueSystemId,
        path.organId,
        path.microstructureId
      );
      return context;
    }

    this._getTissueSystems().some(function (tissueSystem) {
      return ensureArray(tissueSystem.organs).some(function (organ) {
        return ensureArray(organ.microstructures).some(function (microstructure) {
          return ensureArray(microstructure.cell_types).some(function (cellType) {
            if (cellType.id === cellTypeId) {
              context.tissueSystem = tissueSystem;
              context.organ = organ;
              context.microstructure = microstructure;
              context.cellType = cellType;
              return true;
            }
            return false;
          });
        });
      });
    });

    return context;
  };

  ExportController.prototype._getTissueSystems = function () {
    if (this.datastore && typeof this.datastore.getTissueSystems === 'function') {
      return ensureArray(this.datastore.getTissueSystems());
    }
    if (this.datastore && this.datastore.data) {
      return ensureArray(this.datastore.data.tissue_systems);
    }
    return [];
  };

  ExportController.prototype._getTissueSystem = function (tissueSystemId) {
    if (this.datastore && typeof this.datastore.getTissueSystem === 'function') {
      return this.datastore.getTissueSystem(tissueSystemId);
    }
    var systems = this._getTissueSystems();
    for (var i = 0; i < systems.length; i += 1) {
      if (systems[i].id === tissueSystemId) {
        return systems[i];
      }
    }
    return null;
  };

  ExportController.prototype._getOrgan = function (tissueSystemId, organId) {
    if (this.datastore && typeof this.datastore.getOrgan === 'function') {
      var scopedOrgan = this.datastore.getOrgan(tissueSystemId, organId);
      if (scopedOrgan) {
        return scopedOrgan;
      }
    }
    if (this.datastore && typeof this.datastore.getOrganById === 'function') {
      return this.datastore.getOrganById(organId);
    }

    var tissueSystem = this._getTissueSystem(tissueSystemId);
    var organs = tissueSystem ? ensureArray(tissueSystem.organs) : [];
    for (var i = 0; i < organs.length; i += 1) {
      if (organs[i].id === organId) {
        return organs[i];
      }
    }
    return null;
  };

  ExportController.prototype._getMicrostructure = function (tissueSystemId, organId, microstructureId) {
    if (this.datastore && typeof this.datastore.getMicrostructure === 'function') {
      var scopedMicrostructure = this.datastore.getMicrostructure(tissueSystemId, organId, microstructureId);
      if (scopedMicrostructure) {
        return scopedMicrostructure;
      }
    }
    if (this.datastore && typeof this.datastore.getMicrostructureById === 'function') {
      return this.datastore.getMicrostructureById(microstructureId);
    }

    var organ = this._getOrgan(tissueSystemId, organId);
    var microstructures = organ ? ensureArray(organ.microstructures) : [];
    for (var i = 0; i < microstructures.length; i += 1) {
      if (microstructures[i].id === microstructureId) {
        return microstructures[i];
      }
    }
    return null;
  };

  ExportController.prototype._getCellType = function (cellTypeId) {
    if (this.datastore && typeof this.datastore.getCellTypeById === 'function') {
      return this.datastore.getCellTypeById(cellTypeId);
    }
    var context = { cellType: null };
    this._getTissueSystems().some(function (tissueSystem) {
      return ensureArray(tissueSystem.organs).some(function (organ) {
        return ensureArray(organ.microstructures).some(function (microstructure) {
          return ensureArray(microstructure.cell_types).some(function (cellType) {
            if (cellType.id === cellTypeId) {
              context.cellType = cellType;
              return true;
            }
            return false;
          });
        });
      });
    });
    return context.cellType;
  };

  ExportController.prototype._getMarkers = function (cellTypeId, species) {
    var activeSpecies = normalizeSpecies(species);
    if (this.datastore && typeof this.datastore.getMarkersForCellType === 'function') {
      var markers = this.datastore.getMarkersForCellType(cellTypeId, activeSpecies) || {};
      return {
        positive: ensureArray(markers.positive),
        negative: ensureArray(markers.negative)
      };
    }

    var cellType = this._getCellType(cellTypeId);
    var speciesMarkers = cellType && cellType.markers ? cellType.markers[activeSpecies] : null;
    return {
      positive: speciesMarkers ? ensureArray(speciesMarkers.positive) : [],
      negative: speciesMarkers ? ensureArray(speciesMarkers.negative) : []
    };
  };

  ExportController.prototype._getVersion = function () {
    if (this.datastore && typeof this.datastore.getVersion === 'function') {
      return this.datastore.getVersion() || '';
    }
    if (this.datastore && this.datastore.data && this.datastore.data.metadata) {
      return this.datastore.data.metadata.version || '';
    }
    return '';
  };

  if (typeof window !== 'undefined') {
    window.ExportController = ExportController;
  }

  if (typeof globalThis !== 'undefined') {
    globalThis.ExportController = ExportController;
  }
}());
