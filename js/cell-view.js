(function () {
  'use strict';

  var SPECIES = ['human', 'mouse'];
  var SPECIES_LABELS = {
    human: 'Human',
    mouse: 'Mouse'
  };

  class CellView {
    constructor(container, datastore, router) {
      this.container = container;
      this.datastore = datastore;
      this.router = router;
      this.currentRoute = null;
      this.active = false;
      this.activeSpecies = this.getCurrentSpecies();

      if (this.datastore && typeof this.datastore.onSpeciesChange === 'function') {
        this.datastore.onSpeciesChange((species) => {
          this.activeSpecies = species || this.activeSpecies;
          if (this.active && this.currentRoute) {
            this.render(this.currentRoute);
          }
        });
      }

      window.cellView = this;
    }

    render(route) {
      this.currentRoute = route;
      this.activeSpecies = this.getCurrentSpecies();
      this.clearContainer();

      if (!route || !route.params) {
        this.renderError('Cell view route is missing.', '#/');
        return;
      }

      if (route.type === 'microstructure') {
        this.renderMicrostructure(route);
        return;
      }

      if (route.type === 'cell-type') {
        this.renderCellType(route);
        return;
      }

      this.renderError('Unsupported cell view route.', '#/');
    }

    activate() {
      this.active = true;
      if (this.container) {
        this.container.hidden = false;
        this.container.classList.add('active');
      }
    }

    deactivate() {
      this.active = false;
      if (this.container) {
        this.container.classList.remove('active');
        this.container.hidden = true;
      }
    }

    renderMicrostructure(route) {
      var context = this.getContext(route.params);
      if (!context.microstructure) {
        this.renderError('Microstructure not found.', this.getOrganPath(route.params));
        return;
      }

      var section = this.createElement('section', 'cell-list-view');
      section.appendChild(this.renderBreadcrumb(context, null));

      var header = this.createElement('header', 'cell-list-header');
      var title = this.createElement('h2', null, context.microstructure.name);
      var description = this.createElement('p', 'cell-list-description', context.microstructure.description || '');
      header.appendChild(title);
      if (context.microstructure.description) {
        header.appendChild(description);
      }
      section.appendChild(header);

      var cells = Array.isArray(context.microstructure.cell_types) ? context.microstructure.cell_types : [];
      if (!cells.length) {
        section.appendChild(this.createElement('p', 'empty-message', 'No cell types available for this microstructure.'));
      } else {
        var list = this.createElement('div', 'cell-type-list');
        cells.forEach((cellType) => {
          list.appendChild(this.renderCellTypeCard(context, cellType));
        });
        section.appendChild(list);
      }

      this.container.appendChild(section);
    }

    renderCellType(route) {
      var context = this.getContext(route.params);
      var cellType = context.cellType;

      if (!cellType) {
        this.renderError('Cell type not found.', this.getMicrostructurePath(route.params), 'Back to cell types');
        return;
      }

      var article = this.createElement('article', 'cell-detail-view');
      article.appendChild(this.renderBreadcrumb(context, cellType));
      article.appendChild(this.renderCellHeader(context, cellType));
      article.appendChild(this.renderSpeciesMarkers(cellType));
      article.appendChild(this.renderExternalLinks(cellType));
      article.appendChild(this.renderReferences(cellType));
      article.appendChild(this.renderProvenance(cellType));
      this.container.appendChild(article);
    }

    renderCellTypeCard(context, cellType) {
      var card = this.createElement('article', 'cell-type-card');
      var button = this.createElement('button', 'cell-type-card-link');
      button.type = 'button';
      button.setAttribute('data-cell-type-id', cellType.id);

      var title = this.createElement('h3', null, cellType.name || cellType.id);
      var description = this.createElement('p', 'cell-type-card-description', cellType.description || '');
      var markers = this.getMarkers(cellType, this.activeSpecies).positive.slice(0, 6);
      var markerWrap = this.createElement('div', 'cell-type-card-markers');

      if (markers.length) {
        markers.forEach((marker) => {
          markerWrap.appendChild(this.createElement('span', 'marker-preview-tag', marker));
        });
      } else {
        markerWrap.appendChild(this.createElement('span', 'muted', 'No key positive markers for ' + SPECIES_LABELS[this.activeSpecies]));
      }

      button.appendChild(title);
      if (cellType.description) {
        button.appendChild(description);
      }
      button.appendChild(markerWrap);
      button.addEventListener('click', () => {
        this.navigate(this.buildCellTypePath(context.tissueSystem, context.organ, context.microstructure, cellType));
      });

      card.appendChild(button);
      return card;
    }

    renderBreadcrumb(context, cellType) {
      var nav = this.createElement('nav', 'breadcrumb');
      nav.setAttribute('aria-label', 'Breadcrumb');

      this.appendBreadcrumbLink(nav, 'Body', '#/');
      if (context.tissueSystem) {
        this.appendBreadcrumbLink(nav, context.tissueSystem.name, '#/' + encodeURIComponent(context.tissueSystem.id));
      }
      if (context.organ) {
        this.appendBreadcrumbLink(nav, context.organ.name, this.buildOrganPath(context.tissueSystem, context.organ));
      }
      if (context.microstructure) {
        this.appendBreadcrumbLink(nav, context.microstructure.name, this.buildMicrostructurePath(context.tissueSystem, context.organ, context.microstructure));
      }
      if (cellType) {
        var current = this.createElement('span', 'breadcrumb-current', cellType.name || cellType.id);
        current.setAttribute('aria-current', 'page');
        nav.appendChild(current);
      }

      return nav;
    }

    renderCellHeader(context, cellType) {
      var header = this.createElement('header', 'cell-detail-header');
      var title = this.createElement('h2', 'cell-type-name', cellType.name || cellType.id);
      var aliases = Array.isArray(cellType.aliases) ? cellType.aliases : [];
      var description = this.createElement('p', 'cell-type-description', cellType.description || '');
      var actions = this.createElement('div', 'cell-actions');

      header.appendChild(title);

      if (aliases.length) {
        var aliasLine = this.createElement('p', 'cell-type-aliases');
        aliasLine.appendChild(this.createElement('span', 'label', 'Aliases: '));
        aliasLine.appendChild(document.createTextNode(aliases.join(', ')));
        header.appendChild(aliasLine);
      }

      if (cellType.description) {
        header.appendChild(description);
      }

      actions.appendChild(this.renderCompareButton(cellType));
      actions.appendChild(this.renderExportButton(cellType));
      header.appendChild(actions);

      return header;
    }

    renderCompareButton(cellType) {
      var button = this.createElement('button', 'compare-add-btn');
      var compareController = this.getCompareController();
      var isInCompare = compareController && typeof compareController.isInCompare === 'function' && compareController.isInCompare(cellType.id);

      button.type = 'button';
      button.setAttribute('data-cell-type-id', cellType.id);
      button.disabled = Boolean(isInCompare);

      var icon = this.createElement('span', 'compare-icon', isInCompare ? '✓' : '+');
      icon.setAttribute('aria-hidden', 'true');
      button.appendChild(icon);
      button.appendChild(document.createTextNode(isInCompare ? ' In Compare' : ' Add to Compare'));

      if (compareController && typeof compareController.addCellType === 'function') {
        button.addEventListener('click', () => {
          compareController.addCellType(cellType.id);
          button.disabled = true;
          button.textContent = '';
          var doneIcon = this.createElement('span', 'compare-icon', '✓');
          doneIcon.setAttribute('aria-hidden', 'true');
          button.appendChild(doneIcon);
          button.appendChild(document.createTextNode(' In Compare'));
        });
      } else {
        button.disabled = true;
        button.title = 'Compare module unavailable';
      }

      return button;
    }

    renderExportButton(cellType) {
      var button = this.createElement('button', 'cell-export-btn', 'Export CSV');
      var exporter = this.getExportController();

      button.type = 'button';
      if (exporter && typeof exporter.exportCellType === 'function') {
        button.addEventListener('click', () => {
          exporter.exportCellType(cellType.id, this.getCurrentSpecies(), 'csv');
        });
      } else {
        button.disabled = true;
        button.title = 'Export module unavailable';
      }

      return button;
    }

    renderSpeciesMarkers(cellType) {
      var section = this.createElement('section', 'species-marker-section');
      var heading = this.createElement('h3', null, 'Markers');
      var tabs = this.createElement('div', 'species-tabs');
      var panels = this.createElement('div', 'species-marker-panels');

      tabs.setAttribute('role', 'tablist');
      section.appendChild(heading);

      SPECIES.forEach((species) => {
        var tab = this.createElement('button', 'species-tab', SPECIES_LABELS[species]);
        tab.type = 'button';
        tab.setAttribute('role', 'tab');
        tab.setAttribute('data-species', species);
        tab.setAttribute('aria-selected', species === this.activeSpecies ? 'true' : 'false');
        if (species === this.activeSpecies) {
          tab.classList.add('active');
        }
        tab.addEventListener('click', () => {
          this.setActiveSpeciesTab(section, species);
        });
        tabs.appendChild(tab);
        panels.appendChild(this.renderSpeciesPanel(cellType, species));
      });

      section.appendChild(tabs);
      section.appendChild(panels);
      return section;
    }

    renderSpeciesPanel(cellType, species) {
      var markers = this.getMarkers(cellType, species);
      var panel = this.createElement('section', 'species-marker-panel');
      panel.setAttribute('data-species', species);
      panel.setAttribute('role', 'tabpanel');
      if (species === this.activeSpecies) {
        panel.classList.add('active');
      }

      panel.appendChild(this.createElement('h4', null, SPECIES_LABELS[species] + ' Markers'));

      if (!markers.positive.length && !markers.negative.length) {
        panel.appendChild(this.createElement('p', 'empty-message', 'No markers available for ' + SPECIES_LABELS[species].toLowerCase()));
        return panel;
      }

      panel.appendChild(this.renderMarkerGroup('Positive', markers.positive, species, 'positive', markers.expression_levels));
      panel.appendChild(this.renderMarkerGroup('Negative', markers.negative, species, 'negative', markers.expression_levels));
      return panel;
    }

    renderMarkerGroup(label, markers, species, type, expressionLevels) {
      var group = this.createElement('div', 'marker-group marker-group-' + type);
      group.appendChild(this.createElement('h5', null, label));

      if (!markers.length) {
        group.appendChild(this.createElement('p', 'empty-message', 'No ' + label.toLowerCase() + ' markers listed.'));
        return group;
      }

      var grid = this.createElement('div', 'marker-grid');
      markers.forEach((marker) => {
        var chip = this.createElement('button', 'marker-tag ' + type, marker);
        var expressionLevel = expressionLevels && expressionLevels[marker];
        chip.type = 'button';
        chip.setAttribute('data-marker', marker);
        chip.setAttribute('data-species', species);
        if (expressionLevel === 'high' || expressionLevel === 'low') {
          chip.dataset.expressionLevel = expressionLevel;
        }
        chip.title = 'Click to find other cell types expressing ' + marker;
        chip.addEventListener('click', () => {
          this.navigate('#/search/' + encodeURIComponent(marker));
        });
        grid.appendChild(chip);
      });

      group.appendChild(grid);
      return group;
    }

    renderExternalLinks(cellType) {
      var section = this.createElement('section', 'links-section');
      var heading = this.createElement('h3', null, 'External Links');
      var grid = this.createElement('div', 'links-grid');

      section.appendChild(heading);

      SPECIES.forEach((species) => {
        var markers = this.getMarkers(cellType, species).positive;
        markers.forEach((marker) => {
          grid.appendChild(this.renderMarkerLinks(marker, species));
        });
      });

      if (!grid.children.length) {
        section.appendChild(this.createElement('p', 'empty-message', 'No external links available.'));
      } else {
        section.appendChild(grid);
      }

      return section;
    }

    renderMarkerLinks(marker, species) {
      var group = this.createElement('div', 'link-group');
      var links = this.getLinks(marker, species);
      group.setAttribute('data-marker', marker);
      group.setAttribute('data-species', species);
      group.appendChild(this.createElement('span', 'link-marker', marker + ' (' + SPECIES_LABELS[species] + ')'));

      links.forEach((link) => {
        var anchor = this.createElement('a', 'db-link');
        var label = link.database || link.name || 'External Link';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener';
        anchor.appendChild(this.createElement('span', 'db-name', label));
        group.appendChild(anchor);
      });

      return group;
    }

    renderReferences(cellType) {
      var section = this.createElement('section', 'references-section');
      var heading = this.createElement('h3', null, 'References');
      var references = Array.isArray(cellType.references) ? cellType.references : [];

      section.appendChild(heading);

      if (!references.length) {
        section.appendChild(this.createElement('p', 'empty-message', 'No references available'));
        return section;
      }

      var list = this.createElement('ol', 'references-list');
      references.forEach((reference) => {
        list.appendChild(this.renderReferenceItem(reference));
      });
      section.appendChild(list);
      return section;
    }

    renderReferenceItem(reference) {
      var citation = this.datastore && typeof this.datastore.getCitation === 'function'
        ? this.datastore.getCitation(reference)
        : null;

      if (!citation) {
        return this.renderUnresolvedReference(reference);
      }

      var item = this.createElement('li', 'reference-item');
      var titleUrl = this.getCitationUrl(citation);
      item.setAttribute('data-ref-id', String(reference));

      if (citation.authors) {
        item.appendChild(this.createElement('span', 'ref-authors', citation.authors));
        item.appendChild(document.createTextNode(' '));
      }

      if (titleUrl && citation.title) {
        var titleLink = this.createElement('a', 'ref-title', citation.title);
        titleLink.href = titleUrl;
        titleLink.target = '_blank';
        titleLink.rel = 'noopener';
        item.appendChild(titleLink);
      } else {
        item.appendChild(this.createElement('span', 'ref-title', citation.title || citation.raw_text || 'Reference ' + reference));
      }

      if (citation.journal) {
        item.appendChild(document.createTextNode(' '));
        item.appendChild(this.createElement('span', 'ref-journal', citation.journal));
      }

      if (citation.year) {
        item.appendChild(document.createTextNode(' '));
        item.appendChild(this.createElement('span', 'ref-year', '(' + citation.year + ')'));
      }

      if (citation.doi) {
        item.appendChild(document.createTextNode(' '));
        var doi = this.createElement('a', 'ref-doi', 'doi:' + citation.doi);
        doi.href = 'https://doi.org/' + citation.doi;
        doi.target = '_blank';
        doi.rel = 'noopener';
        item.appendChild(doi);
      }

      return item;
    }

    renderUnresolvedReference(reference) {
      var item = this.createElement('li', 'reference-item reference-unresolved');
      item.setAttribute('data-ref-id', String(reference));
      item.appendChild(this.createElement('span', 'ref-id', 'Reference ' + reference));
      item.appendChild(document.createTextNode(' '));
      item.appendChild(this.createElement('span', 'ref-note', 'Citation details pending'));
      return item;
    }

    renderProvenance(cellType) {
      var section = this.createElement('section', 'provenance muted');
      section.appendChild(this.createElement('h3', null, 'Provenance'));
      section.appendChild(this.createElement('p', null, 'Source: ' + (cellType.source || 'unknown')));
      section.appendChild(this.createElement('p', null, 'Added: ' + (cellType.added_in_version || 'unknown')));
      section.appendChild(this.createElement('p', null, 'Last modified: ' + (cellType.last_modified_version || 'unknown')));
      return section;
    }

    renderError(message, backPath, backLabel) {
      var section = this.createElement('section', 'cell-view-error');
      var heading = this.createElement('h2', null, 'Unable to show cell view');
      var text = this.createElement('p', null, message);
      var link = this.createElement('button', 'back-link', backLabel || 'Back to organ');

      link.type = 'button';
      link.addEventListener('click', () => {
        this.navigate(backPath || '#/');
      });

      section.appendChild(heading);
      section.appendChild(text);
      section.appendChild(link);
      this.container.appendChild(section);
    }

    setActiveSpeciesTab(root, species) {
      this.activeSpecies = species;
      Array.prototype.forEach.call(root.querySelectorAll('.species-tab'), (tab) => {
        var isActive = tab.getAttribute('data-species') === species;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
      Array.prototype.forEach.call(root.querySelectorAll('.species-marker-panel'), (panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-species') === species);
      });
    }

    getContext(params) {
      var tissueSystem = this.datastore && typeof this.datastore.getTissueSystem === 'function'
        ? this.datastore.getTissueSystem(params.tissueSystemId)
        : null;
      var organ = this.datastore && typeof this.datastore.getOrgan === 'function'
        ? this.datastore.getOrgan(params.tissueSystemId, params.organId)
        : null;
      var microstructure = this.datastore && typeof this.datastore.getMicrostructure === 'function'
        ? this.datastore.getMicrostructure(params.tissueSystemId, params.organId, params.microstructureId)
        : null;
      var cellType = null;

      if (params.cellTypeId && this.datastore && typeof this.datastore.getCellType === 'function') {
        cellType = this.datastore.getCellType({
          tissueSystemId: params.tissueSystemId,
          organId: params.organId,
          microstructureId: params.microstructureId,
          cellTypeId: params.cellTypeId
        });
      }

      if (!cellType && params.cellTypeId && microstructure && Array.isArray(microstructure.cell_types)) {
        cellType = microstructure.cell_types.find(function (candidate) {
          return candidate.id === params.cellTypeId;
        }) || null;
      }

      return {
        tissueSystem: tissueSystem,
        organ: organ,
        microstructure: microstructure,
        cellType: cellType
      };
    }

    getMarkers(cellType, species) {
      var empty = { positive: [], negative: [], expression_levels: {} };
      if (!cellType || !cellType.markers || !cellType.markers[species]) {
        return empty;
      }

      var expressionLevels = cellType.markers[species].expression_levels;
      return {
        positive: Array.isArray(cellType.markers[species].positive) ? cellType.markers[species].positive : [],
        negative: Array.isArray(cellType.markers[species].negative) ? cellType.markers[species].negative : [],
        expression_levels: expressionLevels && typeof expressionLevels === 'object' ? expressionLevels : {}
      };
    }

    getLinks(marker, species) {
      var linksModule = window.links || null;

      if (linksModule && typeof linksModule.getLinks === 'function') {
        return linksModule.getLinks(marker, species) || [];
      }

      if (window.LinksModule && typeof window.LinksModule.getLinks === 'function') {
        return window.LinksModule.getLinks(marker, species) || [];
      }

      if (typeof window.LinksModule === 'function') {
        var linksModuleInstance = new window.LinksModule();
        if (linksModuleInstance && typeof linksModuleInstance.getLinks === 'function') {
          return linksModuleInstance.getLinks(marker, species) || [];
        }
      }

      if (typeof window.LinksGenerator === 'function') {
        var generator = new window.LinksGenerator();
        if (generator && typeof generator.getLinks === 'function') {
          return generator.getLinks(marker, species) || [];
        }
      }

      return this.getFallbackLinks(marker, species);
    }

    getFallbackLinks(marker, species) {
      var encoded = encodeURIComponent(marker);
      var taxonId = species === 'mouse' ? '10090' : '9606';
      return [
        {
          database: 'UniProt',
          url: 'https://www.uniprot.org/uniprot/?query=gene:' + encoded + '+organism:' + taxonId,
          marker: marker,
          species: species
        },
        {
          database: 'CellMarker 2.0',
          url: 'http://bio-bigdata.hrbmu.edu.cn/CellMarker/search/' + encoded,
          marker: marker,
          species: species
        },
        {
          database: 'PanglaoDB',
          url: 'https://panglaodb.se/search.html?query=' + encoded,
          marker: marker,
          species: species
        }
      ];
    }

    resolveSource(reference) {
      var sources = this.datastore && typeof this.datastore.getSources === 'function'
        ? this.datastore.getSources()
        : [];
      sources = Array.isArray(sources) ? sources : [];
      var refNumber = Number(reference);

      if (Number.isInteger(refNumber) && refNumber >= 1 && refNumber <= sources.length) {
        return sources[refNumber - 1];
      }

      if (typeof reference === 'string') {
        return sources.find(function (source) {
          return source.title === reference || source.url === reference || source.doi === reference;
        }) || null;
      }

      return null;
    }

    getCitationUrl(citation) {
      if (!citation) {
        return '';
      }
      if (citation.url) {
        return citation.url;
      }
      if (citation.pmid) {
        return 'https://pubmed.ncbi.nlm.nih.gov/' + encodeURIComponent(citation.pmid) + '/';
      }
      if (citation.doi) {
        return 'https://doi.org/' + citation.doi;
      }
      return '';
    }

    getCompareController() {
      return window.compareTray || window.compare || null;
    }

    getExportController() {
      return window.exporter || window['export'] || null;
    }

    getCurrentSpecies() {
      if (this.datastore && typeof this.datastore.getSpecies === 'function') {
        return this.datastore.getSpecies();
      }
      return 'human';
    }

    getOrganPath(params) {
      if (params && params.tissueSystemId && params.organId) {
        return '#/' + encodeURIComponent(params.tissueSystemId) + '/' + encodeURIComponent(params.organId);
      }
      return '#/';
    }

    getMicrostructurePath(params) {
      if (params && params.tissueSystemId && params.organId && params.microstructureId) {
        return '#/' + encodeURIComponent(params.tissueSystemId) + '/' + encodeURIComponent(params.organId) + '/' + encodeURIComponent(params.microstructureId);
      }
      return this.getOrganPath(params);
    }

    buildOrganPath(tissueSystem, organ) {
      return '#/' + encodeURIComponent(tissueSystem.id) + '/' + encodeURIComponent(organ.id);
    }

    buildMicrostructurePath(tissueSystem, organ, microstructure) {
      return this.buildOrganPath(tissueSystem, organ) + '/' + encodeURIComponent(microstructure.id);
    }

    buildCellTypePath(tissueSystem, organ, microstructure, cellType) {
      return this.buildMicrostructurePath(tissueSystem, organ, microstructure) + '/' + encodeURIComponent(cellType.id);
    }

    appendBreadcrumbLink(nav, label, path) {
      var link = this.createElement('button', 'breadcrumb-link', label);
      link.type = 'button';
      link.addEventListener('click', () => {
        this.navigate(path);
      });
      nav.appendChild(link);
    }

    navigate(path) {
      if (this.router && typeof this.router.navigate === 'function') {
        this.router.navigate(path);
      } else {
        window.location.hash = path;
      }
    }

    clearContainer() {
      if (!this.container) {
        return;
      }
      while (this.container.firstChild) {
        this.container.removeChild(this.container.firstChild);
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

  window.CellView = CellView;
})();
