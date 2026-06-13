/* global window, document, history */

class Router {
  constructor(datastore) {
    this.datastore = datastore;
    this.currentRoute = null;
    this.routeChangeCallbacks = [];
    this.hashChangeTimer = null;
    this.started = false;
    this.boundHashChange = this.handleHashChange.bind(this);
    this.boundKeydown = this.handleKeydown.bind(this);
    this.viewIds = {
      'body-map': 'view-body-map',
      'tissue-system': 'view-organ',
      organ: 'view-organ',
      microstructure: 'view-cell',
      'cell-type': 'view-cell',
      search: 'view-search',
      compare: 'view-compare'
    };
  }

  start() {
    if (this.started) return;
    this.started = true;
    window.addEventListener('hashchange', this.boundHashChange);
    document.addEventListener('keydown', this.boundKeydown);

    if (!window.location.hash) {
      this.navigate('#/');
      return;
    }

    this.handleHashChange();
  }

  navigate(path) {
    const nextHash = this.normalizeHash(path);
    if (window.location.hash === nextHash) {
      this.handleHashChange();
      return;
    }
    window.location.hash = nextHash;
  }

  goBack() {
    history.back();
  }

  goForward() {
    history.forward();
  }

  getCurrentRoute() {
    return this.currentRoute;
  }

  getCurrentPath() {
    if (!this.currentRoute) return [];
    return this.currentRoute.path.replace(/^#\/?/, '').split('/').filter(Boolean);
  }

  onRouteChange(callback) {
    if (typeof callback !== 'function') return function noop() {};
    this.routeChangeCallbacks.push(callback);
    return () => {
      this.routeChangeCallbacks = this.routeChangeCallbacks.filter((cb) => cb !== callback);
    };
  }

  resolveRoute(hash) {
    const normalizedHash = this.normalizeHash(hash);
    const path = normalizedHash.replace(/^#\/?/, '');
    const segments = path.split('/').filter(Boolean);

    if (segments.length === 0) {
      return { type: 'body-map', params: {}, path: '#/' };
    }

    if (segments[0] === 'search') {
      return {
        type: 'search',
        params: { query: decodeURIComponent(segments.slice(1).join('/')) },
        path: normalizedHash
      };
    }

    if (segments[0] === 'compare') {
      const ids = segments[1] ? segments[1].split(',').filter(Boolean) : [];
      return {
        type: 'compare',
        params: { cellTypeIds: ids.map((id) => decodeURIComponent(id)) },
        path: normalizedHash
      };
    }

    const tissueSystemId = segments[0];
    const organId = segments[1];
    const microstructureId = segments[2];
    const cellTypeId = segments[3];

    if (cellTypeId) {
      return {
        type: 'cell-type',
        params: { tissueSystemId, organId, microstructureId, cellTypeId },
        path: normalizedHash
      };
    }
    if (microstructureId) {
      return {
        type: 'microstructure',
        params: { tissueSystemId, organId, microstructureId },
        path: normalizedHash
      };
    }
    if (organId) {
      return {
        type: 'organ',
        params: { tissueSystemId, organId },
        path: normalizedHash
      };
    }
    return {
      type: 'tissue-system',
      params: { tissueSystemId },
      path: normalizedHash
    };
  }

  handleHashChange() {
    window.clearTimeout(this.hashChangeTimer);
    this.hashChangeTimer = window.setTimeout(() => {
      const route = this.resolveRoute(window.location.hash || '#/');
      const validRoute = this.validateRoute(route);

      if (validRoute.path !== route.path) {
        this.notifyInvalidRoute(route, validRoute);
        this.navigate(validRoute.path);
        return;
      }

      this.applyRoute(validRoute);
    }, 100);
  }

  validateRoute(route) {
    if (route.type === 'body-map' || route.type === 'search') return route;

    if (route.type === 'compare') {
      const validIds = route.params.cellTypeIds.filter((id) => this.datastore.getCellTypeById(id));
      if (validIds.length === route.params.cellTypeIds.length) return route;
      if (validIds.length === 0) return { type: 'body-map', params: {}, path: '#/' };
      return { type: 'compare', params: { cellTypeIds: validIds }, path: `#/compare/${validIds.join(',')}` };
    }

    const params = route.params;
    const tissueSystem = this.datastore.getTissueSystem(params.tissueSystemId);
    if (!tissueSystem) return { type: 'body-map', params: {}, path: '#/' };

    if (route.type === 'tissue-system') return route;

    const organ = this.findOrganInTissueSystem(tissueSystem, params.organId);
    if (!organ) {
      return {
        type: 'tissue-system',
        params: { tissueSystemId: tissueSystem.id },
        path: `#/${tissueSystem.id}`
      };
    }

    if (route.type === 'organ') return route;

    const microstructure = this.findMicrostructureInOrgan(organ, params.microstructureId);
    if (!microstructure) {
      return {
        type: 'organ',
        params: { tissueSystemId: tissueSystem.id, organId: organ.id },
        path: `#/${tissueSystem.id}/${organ.id}`
      };
    }

    if (route.type === 'microstructure') return route;

    const cellType = this.findCellTypeInMicrostructure(microstructure, params.cellTypeId);
    if (!cellType) {
      return {
        type: 'microstructure',
        params: {
          tissueSystemId: tissueSystem.id,
          organId: organ.id,
          microstructureId: microstructure.id
        },
        path: `#/${tissueSystem.id}/${organ.id}/${microstructure.id}`
      };
    }

    return route;
  }

  applyRoute(route) {
    this.currentRoute = route;
    this.switchView(route);
    this.updateBreadcrumb(route);
    this.scrollMainToTop();
    this.fireRouteChange(route);
  }

  switchView(route) {
    const targetId = this.viewIds[route.type] || 'view-body-map';
    const targetView = document.getElementById(targetId);

    document.querySelectorAll('.view').forEach((view) => {
      view.classList.remove('active');
      view.hidden = true;
    });

    if (targetView) {
      targetView.classList.add('active');
      targetView.hidden = false;
    }

    const renderer = this.getRenderer(route.type, targetView);
    if (renderer && typeof renderer.render === 'function') {
      renderer.render(route);
    }
  }

  getRenderer(routeType, targetView) {
    if (targetView && typeof targetView.render === 'function') return targetView;

    const namesByType = {
      'body-map': ['bodyMapView', 'bodyMap'],
      'tissue-system': ['organView'],
      organ: ['organView'],
      microstructure: ['cellView'],
      'cell-type': ['cellView'],
      search: ['searchView'],
      compare: ['compareView']
    };
    const names = namesByType[routeType] || [];

    for (let i = 0; i < names.length; i += 1) {
      if (window[names[i]] && typeof window[names[i]].render === 'function') {
        return window[names[i]];
      }
    }
    return null;
  }

  updateBreadcrumb(route) {
    const breadcrumb = document.getElementById('breadcrumb');
    if (!breadcrumb) return;

    const items = this.buildBreadcrumbItems(route);
    const list = document.createElement('ol');
    list.className = 'breadcrumb-list';

    items.forEach((item, index) => {
      const li = document.createElement('li');
      li.className = 'breadcrumb-item';

      if (index === items.length - 1) {
        li.textContent = item.label;
        li.setAttribute('aria-current', 'page');
      } else {
        const link = document.createElement('a');
        link.href = item.path;
        link.textContent = item.label;
        li.appendChild(link);
      }

      list.appendChild(li);
    });

    breadcrumb.textContent = '';
    breadcrumb.appendChild(list);
  }

  buildBreadcrumbItems(route) {
    const items = [{ label: 'Body', path: '#/' }];
    const params = route.params;

    if (route.type === 'search') {
      items.push({ label: `Search: ${params.query || ''}`, path: route.path });
      return items;
    }

    if (route.type === 'compare') {
      items.push({ label: 'Compare', path: route.path });
      return items;
    }

    if (params.tissueSystemId) {
      const tissueSystem = this.datastore.getTissueSystem(params.tissueSystemId);
      if (tissueSystem) {
        items.push({ label: tissueSystem.name, path: `#/${tissueSystem.id}` });
      }
    }

    if (params.organId) {
      const organ = this.datastore.getOrganById(params.organId);
      if (organ) {
        items.push({
          label: organ.name,
          path: `#/${params.tissueSystemId}/${organ.id}`
        });
      }
    }

    if (params.microstructureId) {
      const microstructure = this.datastore.getMicrostructureById(params.microstructureId);
      if (microstructure) {
        items.push({
          label: microstructure.name,
          path: `#/${params.tissueSystemId}/${params.organId}/${microstructure.id}`
        });
      }
    }

    if (params.cellTypeId) {
      const cellType = this.datastore.getCellTypeById(params.cellTypeId);
      if (cellType) {
        items.push({
          label: cellType.name,
          path: `#/${params.tissueSystemId}/${params.organId}/${params.microstructureId}/${cellType.id}`
        });
      }
    }

    return items;
  }

  scrollMainToTop() {
    const main = document.getElementById('main-content');
    if (!main) return;
    if (typeof main.scrollTo === 'function') {
      main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } else {
      main.scrollTop = 0;
    }
  }

  fireRouteChange(route) {
    this.routeChangeCallbacks.slice().forEach((callback) => {
      callback(route);
    });
  }

  handleKeydown(event) {
    if (event.defaultPrevented) return;

    if (event.altKey && event.key === 'ArrowLeft') {
      event.preventDefault();
      this.goBack();
      return;
    }

    if (event.altKey && event.key === 'ArrowRight') {
      event.preventDefault();
      this.goForward();
      return;
    }

    if (event.key === 'Backspace' && !this.isTextInput(event.target)) {
      event.preventDefault();
      this.goBack();
      return;
    }

    if (event.key === 'Escape') {
      const parentPath = this.getParentPath();
      if (parentPath) {
        event.preventDefault();
        this.navigate(parentPath);
      }
    }
  }

  getParentPath() {
    const route = this.currentRoute || this.resolveRoute(window.location.hash || '#/');
    if (route.type === 'search' || route.type === 'compare') return '#/';

    const segments = route.path.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (segments.length === 0) return null;
    segments.pop();
    return segments.length ? `#/${segments.join('/')}` : '#/';
  }

  isTextInput(target) {
    if (!target) return false;
    const tagName = target.tagName ? target.tagName.toLowerCase() : '';
    return (
      tagName === 'input' ||
      tagName === 'textarea' ||
      tagName === 'select' ||
      target.isContentEditable === true
    );
  }

  normalizeHash(path) {
    if (!path) return '#/';
    const trimmed = String(path).trim();
    if (trimmed === '#' || trimmed === '#/') return '#/';
    if (trimmed.charAt(0) === '#') {
      return trimmed.charAt(1) === '/' ? trimmed : `#/${trimmed.slice(1)}`;
    }
    return trimmed.charAt(0) === '/' ? `#${trimmed}` : `#/${trimmed}`;
  }

  findOrganInTissueSystem(tissueSystem, organId) {
    return (tissueSystem.organs || []).find((organ) => organ.id === organId) || null;
  }

  findMicrostructureInOrgan(organ, microstructureId) {
    return (organ.microstructures || []).find((microstructure) => microstructure.id === microstructureId) || null;
  }

  findCellTypeInMicrostructure(microstructure, cellTypeId) {
    return (microstructure.cell_types || []).find((cellType) => cellType.id === cellTypeId) || null;
  }

  notifyInvalidRoute(originalRoute, redirectRoute) {
    const detail = {
      message: 'Invalid route. Redirected to the nearest valid parent.',
      originalRoute,
      redirectRoute
    };

    if (typeof window.showToast === 'function') {
      window.showToast(detail.message);
    }

    if (typeof window.CustomEvent === 'function') {
      window.dispatchEvent(new window.CustomEvent('router:invalid-route', { detail }));
    }
  }
}

window.Router = Router;
