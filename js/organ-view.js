(function () {
  'use strict';

  class OrganView {
    constructor(container, datastore, router) {
      this.container = container;
      this.datastore = datastore;
      this.router = router;
      this.currentRoute = null;
      this.currentOrgan = null;
      this.currentTissueSystem = null;
      this.renderToken = 0;

      if (this.datastore && typeof this.datastore.onSpeciesChange === 'function') {
        this.datastore.onSpeciesChange(() => {
          if (this.currentRoute) {
            this.render(this.currentRoute);
          }
        });
      }

      window.organView = this;
    }

    render(route) {
      this.currentRoute = route;
      this.currentOrgan = null;
      this.currentTissueSystem = null;
      this.renderToken += 1;

      if (!this.container) {
        return;
      }

      this.container.textContent = '';

      if (!route || !route.type) {
        this.renderError('Unable to render this view.');
        return;
      }

      if (route.type === 'tissue-system') {
        this.renderTissueSystem(route);
        return;
      }

      if (route.type === 'organ') {
        this.renderOrgan(route, this.renderToken);
        return;
      }

      this.renderError('Unsupported organ view route.');
    }

    activate() {
      if (!this.container) {
        return;
      }
      this.container.hidden = false;
      this.container.classList.add('active');
    }

    deactivate() {
      if (!this.container) {
        return;
      }
      this.container.classList.remove('active');
      this.container.hidden = true;
    }

    highlightMicrostructure(microstructureId) {
      if (!this.container || !microstructureId) {
        return;
      }

      const regions = this.container.querySelectorAll('g.microstructure-region[data-microstructure]');
      Array.prototype.forEach.call(regions, (region) => {
        region.classList.remove('selected');
        region.classList.remove('highlighted');
        region.classList.remove('is-highlighted');
        region.setAttribute('aria-pressed', 'false');
      });

      const target = this.findSvgRegion(microstructureId);
      if (target) {
        target.classList.add('selected');
        target.classList.add('is-highlighted');
        target.setAttribute('aria-pressed', 'true');
      }

      const sections = this.container.querySelectorAll('[id^="ms-section-"]');
      Array.prototype.forEach.call(sections, (section) => {
        section.classList.remove('selected');
        section.classList.remove('is-highlighted');
      });

      const microstructure = this.findMicrostructure(microstructureId);
      const sectionId = microstructure ? microstructure.id : microstructureId;
      const section = document.getElementById('ms-section-' + sectionId);
      if (section) {
        section.classList.add('is-highlighted');
      }
    }

    renderTissueSystem(route) {
      const tissueSystemId = route.params && route.params.tissueSystemId;
      const tissueSystem = this.datastore.getTissueSystem(tissueSystemId);
      if (!tissueSystem) {
        this.renderError('Tissue system not found.');
        return;
      }

      this.currentTissueSystem = tissueSystem;

      const header = document.createElement('header');
      header.className = 'organ-view-header';

      const title = document.createElement('h2');
      title.textContent = tissueSystem.name;
      header.appendChild(title);

      if (tissueSystem.description) {
        const description = document.createElement('p');
        description.className = 'organ-view-description';
        description.textContent = tissueSystem.description;
        header.appendChild(description);
      }

      const list = document.createElement('div');
      list.className = 'organ-card-grid';
      list.setAttribute('aria-label', tissueSystem.name + ' organs');

      (tissueSystem.organs || []).forEach((organ) => {
        list.appendChild(this.createOrganCard(tissueSystem.id, organ));
      });

      this.container.appendChild(header);
      this.container.appendChild(list);
    }

    renderOrgan(route, token) {
      const params = route.params || {};
      const tissueSystem = this.datastore.getTissueSystem(params.tissueSystemId);
      const organ = this.datastore.getOrgan(params.tissueSystemId, params.organId);

      if (!tissueSystem || !organ) {
        this.renderError('Organ not found.');
        return;
      }

      this.currentTissueSystem = tissueSystem;
      this.currentOrgan = organ;

      const fragment = document.createDocumentFragment();
      fragment.appendChild(this.createOrganHeader(organ));

      const layout = document.createElement('div');
      layout.className = 'organ-detail-layout';

      const svgPanel = document.createElement('section');
      svgPanel.className = 'microanatomy-panel';
      svgPanel.setAttribute('aria-label', organ.name + ' microanatomy diagram');

      const svgStatus = document.createElement('p');
      svgStatus.className = 'microanatomy-status';
      svgStatus.textContent = 'Loading microanatomy diagram...';
      svgPanel.appendChild(svgStatus);

      const listPanel = document.createElement('section');
      listPanel.className = 'cell-types-panel';
      listPanel.setAttribute('aria-label', organ.name + ' cell types');
      listPanel.appendChild(this.createMicrostructureList(tissueSystem, organ));

      layout.appendChild(svgPanel);
      layout.appendChild(listPanel);
      fragment.appendChild(layout);
      this.container.appendChild(fragment);

      this.loadMicroanatomySvg(organ, svgPanel, token);
    }

    createOrganCard(tissueSystemId, organ) {
      const card = document.createElement('article');
      card.className = 'organ-card';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.dataset.organId = organ.id;

      if (organ.icon) {
        const icon = document.createElement('img');
        icon.className = 'organ-card-icon';
        icon.src = organ.icon;
        icon.alt = '';
        icon.setAttribute('aria-hidden', 'true');
        icon.setAttribute('loading', 'lazy');
        icon.width = 48;
        icon.height = 48;
        card.appendChild(icon);
      }

      const title = document.createElement('h3');
      title.className = 'organ-card-title';
      title.textContent = organ.name;
      card.appendChild(title);

      if (organ.description) {
        const description = document.createElement('p');
        description.className = 'organ-card-description';
        description.textContent = organ.description;
        card.appendChild(description);
      }

      const count = document.createElement('p');
      count.className = 'organ-card-meta';
      const microstructureCount = organ.microstructures ? organ.microstructures.length : 0;
      count.textContent = microstructureCount + ' microstructure' + (microstructureCount === 1 ? '' : 's');
      card.appendChild(count);

      const navigate = () => {
        this.router.navigate('#/' + tissueSystemId + '/' + organ.id);
      };

      card.addEventListener('click', navigate);
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          navigate();
        }
      });

      return card;
    }

    createOrganHeader(organ) {
      const header = document.createElement('header');
      header.className = 'organ-view-header';

      const titleRow = document.createElement('div');
      titleRow.className = 'organ-view-title-row';

      const title = document.createElement('h2');
      title.textContent = organ.name;
      titleRow.appendChild(title);

      const species = document.createElement('span');
      species.className = 'species-badge';
      species.textContent = 'Species: ' + this.formatSpecies(this.getSpecies());
      titleRow.appendChild(species);

      header.appendChild(titleRow);

      if (organ.description) {
        const description = document.createElement('p');
        description.className = 'organ-view-description';
        description.textContent = organ.description;
        header.appendChild(description);
      }

      return header;
    }

    createMicrostructureList(tissueSystem, organ) {
      const wrapper = document.createElement('div');
      wrapper.className = 'microstructure-list';

      const microstructures = organ.microstructures || [];
      if (microstructures.length === 1) {
        wrapper.appendChild(this.createFlatMicrostructureSection(tissueSystem, organ, microstructures[0]));
        return wrapper;
      }

      microstructures.forEach((microstructure, index) => {
        wrapper.appendChild(this.createCollapsibleMicrostructureSection(tissueSystem, organ, microstructure, index === 0));
      });

      return wrapper;
    }

    createFlatMicrostructureSection(tissueSystem, organ, microstructure) {
      const section = document.createElement('section');
      section.className = 'microstructure-section flat';
      section.id = 'ms-section-' + microstructure.id;
      section.dataset.microstructureId = microstructure.id;

      const heading = document.createElement('h3');
      heading.className = 'microstructure-title';
      heading.textContent = microstructure.name;
      section.appendChild(heading);

      if (microstructure.description) {
        const description = document.createElement('p');
        description.className = 'microstructure-description';
        description.textContent = microstructure.description;
        section.appendChild(description);
      }

      section.appendChild(this.createCellTypeList(tissueSystem, organ, microstructure));
      return section;
    }

    createCollapsibleMicrostructureSection(tissueSystem, organ, microstructure, open) {
      const details = document.createElement('details');
      details.className = 'microstructure-section';
      details.id = 'ms-section-' + microstructure.id;
      details.dataset.microstructureId = microstructure.id;
      details.open = open;

      const summary = document.createElement('summary');
      summary.className = 'microstructure-summary';
      summary.textContent = microstructure.name;
      summary.addEventListener('click', () => {
        this.highlightMicrostructure(microstructure.id);
      });
      details.appendChild(summary);

      if (microstructure.description) {
        const description = document.createElement('p');
        description.className = 'microstructure-description';
        description.textContent = microstructure.description;
        details.appendChild(description);
      }

      details.appendChild(this.createCellTypeList(tissueSystem, organ, microstructure));
      return details;
    }

    createCellTypeList(tissueSystem, organ, microstructure) {
      const list = document.createElement('div');
      list.className = 'cell-type-list';
      list.setAttribute('role', 'list');

      (microstructure.cell_types || []).forEach((cellType) => {
        list.appendChild(this.createCellTypeItem(tissueSystem, organ, microstructure, cellType));
      });

      return list;
    }

    createCellTypeItem(tissueSystem, organ, microstructure, cellType) {
      const item = document.createElement('div');
      item.className = 'cell-type-item';
      item.dataset.cellTypeId = cellType.id;
      item.setAttribute('role', 'listitem');
      item.setAttribute('tabindex', '0');

      const name = document.createElement('div');
      name.className = 'cell-type-name';
      name.textContent = cellType.name;
      item.appendChild(name);

      item.appendChild(this.createMarkerList(cellType));

      const source = document.createElement('div');
      source.className = 'cell-type-source';
      source.textContent = 'Source: ' + this.formatSource(cellType.source);
      item.appendChild(source);

      const navigate = () => {
        this.router.navigate('#/' + tissueSystem.id + '/' + organ.id + '/' + microstructure.id + '/' + cellType.id);
      };

      item.addEventListener('click', navigate);
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          navigate();
        }
      });

      return item;
    }

    createMarkerList(cellType) {
      const markersNode = document.createElement('div');
      markersNode.className = 'cell-type-markers';

      const species = this.getSpecies();
      const markers = this.datastore.getMarkersForCellType(cellType.id, species) || { positive: [], negative: [] };
      const positiveMarkers = markers.positive || [];

      if (positiveMarkers.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'marker-empty';
        empty.textContent = 'No markers available for ' + this.formatSpecies(species);
        markersNode.appendChild(empty);
        return markersNode;
      }

      positiveMarkers.slice(0, 3).forEach((marker) => {
        const markerTag = document.createElement('span');
        markerTag.className = 'marker-tag positive';
        markerTag.textContent = marker;
        markersNode.appendChild(markerTag);
      });

      if (positiveMarkers.length > 3) {
        const more = document.createElement('span');
        more.className = 'marker-more';
        more.textContent = '+' + (positiveMarkers.length - 3) + ' more';
        markersNode.appendChild(more);
      }

      return markersNode;
    }

    loadMicroanatomySvg(organ, svgPanel, token) {
      const svgPath = this.getMicroanatomyPath(organ);
      if (!svgPath) {
        this.showSvgFailure(svgPanel);
        return;
      }

      fetch(svgPath)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Unable to load SVG');
          }
          return response.text();
        })
        .then((svgText) => {
          if (token !== this.renderToken || !this.currentOrgan || this.currentOrgan.id !== organ.id) {
            return;
          }
          svgPanel.textContent = '';
          const wrapper = document.createElement('div');
          wrapper.className = 'microanatomy-svg-wrapper';
          wrapper.innerHTML = svgText;
          svgPanel.appendChild(wrapper);
          this.bindSvgRegions();
        })
        .catch(() => {
          if (token !== this.renderToken) {
            return;
          }
          this.showSvgFailure(svgPanel);
        });
    }

    bindSvgRegions() {
      const regions = this.container.querySelectorAll('g.microstructure-region[data-microstructure]');
      Array.prototype.forEach.call(regions, (region) => {
        region.addEventListener('click', (event) => {
          this.onMicrostructureRegionSelect(event.currentTarget.dataset.microstructure);
        });
        region.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.onMicrostructureRegionSelect(event.currentTarget.dataset.microstructure);
          }
        });
      });
    }

    onMicrostructureRegionSelect(regionId) {
      const microstructure = this.findMicrostructure(regionId);
      const microstructureId = microstructure ? microstructure.id : regionId;
      this.highlightMicrostructure(microstructureId);
      this.expandSection(microstructureId);

      const section = document.getElementById('ms-section-' + microstructureId);
      if (section && typeof section.scrollIntoView === 'function') {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }

    expandSection(microstructureId) {
      const section = document.getElementById('ms-section-' + microstructureId);
      if (section && section.tagName.toLowerCase() === 'details') {
        section.open = true;
      }
    }

    findMicrostructure(idOrRegionId) {
      if (!this.currentOrgan || !idOrRegionId) {
        return null;
      }

      const microstructures = this.currentOrgan.microstructures || [];
      for (let i = 0; i < microstructures.length; i += 1) {
        if (microstructures[i].id === idOrRegionId) {
          return microstructures[i];
        }
      }
      return null;
    }

    findSvgRegion(idOrRegionId) {
      const microstructure = this.findMicrostructure(idOrRegionId);
      const regionId = microstructure ? microstructure.id : idOrRegionId;
      const regions = this.container.querySelectorAll('g.microstructure-region[data-microstructure]');

      for (let i = 0; i < regions.length; i += 1) {
        if (regions[i].dataset.microstructure === regionId || regions[i].dataset.microstructure === idOrRegionId) {
          return regions[i];
        }
      }
      return null;
    }

    showSvgFailure(svgPanel) {
      svgPanel.textContent = '';
      const message = document.createElement('p');
      message.className = 'microanatomy-status error';
      message.textContent = 'Microanatomy diagram could not be loaded. Cell types are still available below.';
      svgPanel.appendChild(message);
    }

    renderError(messageText) {
      const error = document.createElement('section');
      error.className = 'organ-view-error';
      error.setAttribute('role', 'alert');

      const heading = document.createElement('h2');
      heading.textContent = messageText;
      error.appendChild(heading);

      const link = document.createElement('a');
      link.href = '#/';
      link.textContent = 'Return to body map';
      link.addEventListener('click', (event) => {
        event.preventDefault();
        this.router.navigate('#/');
      });
      error.appendChild(link);

      this.container.appendChild(error);
    }

    getMicroanatomyPath(organ) {
      if (!organ || !organ.microanatomy_svg) {
        return '';
      }
      const parts = organ.microanatomy_svg.split('/');
      const basename = parts[parts.length - 1];
      return basename ? 'svg/microanatomy/' + basename : '';
    }

    getSpecies() {
      if (this.datastore && typeof this.datastore.getSpecies === 'function') {
        return this.datastore.getSpecies();
      }
      return 'human';
    }

    formatSpecies(species) {
      if (!species) {
        return '';
      }
      return species.charAt(0).toUpperCase() + species.slice(1);
    }

    formatSource(source) {
      if (!source) {
        return 'Unknown';
      }
      return source.charAt(0).toUpperCase() + source.slice(1);
    }
  }

  window.OrganView = OrganView;
})();
