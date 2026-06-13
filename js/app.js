/* global window, document, EventTarget, CustomEvent, console */
/* global CellMarkersDatastore, Router, BodyMapView, OrganView, CellView, SearchController, CompareController, ExportController, SpeciesToggle, LinksGenerator, UpdateBadge */

'use strict';

var APP_EVENTS = {
  DATA_LOADED: 'data:loaded',
  ROUTE_CHANGE: 'route:change',
  SPECIES_CHANGE: 'species:change',
  COMPARE_CHANGE: 'compare:change',
  APP_ERROR: 'app:error'
};

var AppBus = window.AppBus || new EventTarget();
var AppState = window.AppState || {
  currentSpecies: 'human',
  currentRoute: null,
  compareIds: []
};

var appKeyboardHandler = null;
var appBootToken = 0;
var appRouteUnsubscribe = null;
var appInstances = null;

window.AppBus = AppBus;
window.AppState = AppState;
window.APP_EVENTS = APP_EVENTS;

function emit(type, detail) {
  AppBus.dispatchEvent(new CustomEvent(type, { detail: detail }));
}

function on(type, handler) {
  AppBus.addEventListener(type, handler);
  return function unsubscribe() {
    AppBus.removeEventListener(type, handler);
  };
}

window.emit = emit;
window.on = on;

function bootApp() {
  var token = appBootToken + 1;
  appBootToken = token;
  cleanupApp();
  showLoadingState();

  return Promise.resolve()
    .then(createDatastore)
    .then(function (datastore) {
      if (token !== appBootToken) {
        return null;
      }

      emit(APP_EVENTS.DATA_LOADED, { datastore: datastore });
      return createControllers(datastore);
    })
    .then(function (instances) {
      if (!instances || token !== appBootToken) {
        return;
      }

      appInstances = instances;
      exposeGlobals(instances);
      setVersionBadge(instances.datastore);
      wrapRenderers(instances);

      instances.speciesToggle.init();
      instances.search.init();
      instances.updateBadge.init();

      wireStateEvents(instances);
      appRouteUnsubscribe = instances.router.onRouteChange(dispatchView);
      instances.router.start();
      wireKeyboardShortcuts(instances);
      removeLoadingState();
    })
    .catch(function (error) {
      if (token !== appBootToken) {
        return;
      }

      if (error && error.__appDataLoadHandled) {
        return;
      }

      failApp('Application failed to start.', error, true);
    });
}

function createDatastore() {
  assertModules(['CellMarkersDatastore']);

  var datastore = new CellMarkersDatastore();
  return datastore.load()
    .then(function () {
      return datastore;
    })
    .catch(function (error) {
      renderLoadError(error);
      emit(APP_EVENTS.APP_ERROR, {
        message: 'Failed to load cell marker data.',
        error: error
      });
      if (error && typeof error === 'object') {
        error.__appDataLoadHandled = true;
      }
      throw error;
    });
}

function createControllers(datastore) {
  assertModules([
    'Router',
    'LinksGenerator',
    'SpeciesToggle',
    'CompareController',
    'ExportController',
    'SearchController',
    'BodyMapView',
    'OrganView',
    'CellView',
    'UpdateBadge'
  ]);

  var router = new Router(datastore);
  var links = new LinksGenerator();
  var speciesToggle = new SpeciesToggle(datastore);
  var compare = new CompareController(datastore, router);
  var exporter = new ExportController(datastore);
  var search = new SearchController(datastore, router);
  var bodyMap = new BodyMapView(document.getElementById('view-body-map'), datastore, router);
  var organView = new OrganView(document.getElementById('view-organ'), datastore, router);
  var cellView = new CellView(document.getElementById('view-cell'), datastore, router);
  var updateBadge = new UpdateBadge(datastore);

  return {
    datastore: datastore,
    router: router,
    links: links,
    speciesToggle: speciesToggle,
    compare: compare,
    exporter: exporter,
    search: search,
    bodyMap: bodyMap,
    organView: organView,
    cellView: cellView,
    updateBadge: updateBadge
  };
}

function dispatchView(route) {
  if (!appInstances || !route) {
    return;
  }

  AppState.currentRoute = route;
  emit(APP_EVENTS.ROUTE_CHANGE, route);
  showRouteContainer(route);

  if (route.type === 'body-map') {
    if (appInstances.bodyMap.__appLastRenderedRouteKey) {
      appInstances.bodyMap.activate();
    } else {
      appInstances.bodyMap.render(route);
    }
  } else if (route.type === 'tissue-system' || route.type === 'organ') {
    renderRouteOnce(appInstances.organView, route, function () {
      appInstances.organView.render(route);
    });
  } else if (route.type === 'microstructure' || route.type === 'cell-type') {
    renderRouteOnce(appInstances.cellView, route, function () {
      appInstances.cellView.render(route);
    });
  } else if (route.type === 'search') {
    renderRouteOnce(appInstances.search, route, function () {
      renderSearchRoute(route);
    });
  } else if (route.type === 'compare') {
    renderRouteOnce(appInstances.compare, route, function () {
      appInstances.compare.renderCompareView((route.params && route.params.cellTypeIds) || []);
    });
  }

  scrollMainToTop();
}

function renderRouteOnce(controller, route, render) {
  var key = getRouteKey(route);
  if (controller.__appLastRenderedRouteKey === key) {
    return;
  }

  render();
  controller.__appLastRenderedRouteKey = key;
}

function renderSearchRoute(route) {
  if (typeof appInstances.search.render === 'function') {
    appInstances.search.render(route);
    return;
  }

  if (typeof appInstances.search.renderResults === 'function') {
    appInstances.search.renderResults([], document.getElementById('view-search'));
  }
}

function wrapRenderers(instances) {
  markRouteRenderer(instances.bodyMap, 'render');
  markRouteRenderer(instances.organView, 'render');
  markRouteRenderer(instances.cellView, 'render');
  markRouteRenderer(instances.search, 'render');
  markRouteRenderer(instances.compare, 'render');
}

function markRouteRenderer(controller, methodName) {
  var original = controller && controller[methodName];
  if (typeof original !== 'function' || original.__appWrapped) {
    return;
  }

  controller[methodName] = function appRenderWrapper(route) {
    var result = original.apply(controller, arguments);
    if (route && route.type) {
      controller.__appLastRenderedRouteKey = getRouteKey(route);
    }
    return result;
  };
  controller[methodName].__appWrapped = true;
}

function getRouteKey(route) {
  return route && route.path ? route.type + '|' + route.path : '';
}

function wireStateEvents(instances) {
  AppState.currentSpecies = instances.datastore.getSpecies();
  AppState.compareIds = instances.compare.getSelectedIds();

  if (typeof instances.speciesToggle.onSpeciesChange === 'function') {
    instances.speciesToggle.onSpeciesChange(function (species) {
      AppState.currentSpecies = species;
      emit(APP_EVENTS.SPECIES_CHANGE, species);
    });
  }

  if (typeof instances.compare.onSelectionChange === 'function') {
    instances.compare.onSelectionChange(function (ids) {
      AppState.compareIds = ids.slice();
      emit(APP_EVENTS.COMPARE_CHANGE, AppState.compareIds.slice());
    });
  }
}

function wireKeyboardShortcuts(instances) {
  appKeyboardHandler = function (event) {
    var key = event.key || '';

    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.altKey || isTextInput(event.target)) {
      return;
    }

    if (key === '/') {
      focusSearch(event);
      return;
    }

    if (key === 'Escape') {
      handleEscapeShortcut(event, instances);
      return;
    }

    if (key === 'Backspace') {
      event.preventDefault();
      instances.router.goBack();
      return;
    }

    if (key.toLowerCase() === 'c') {
      openCompare(event, instances);
      return;
    }

    if (key.toLowerCase() === 'h') {
      event.preventDefault();
      instances.router.navigate('#/');
    }
  };

  document.addEventListener('keydown', appKeyboardHandler, true);
}

function focusSearch(event) {
  var input = document.getElementById('search-input');
  if (!input) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  input.focus();
  if (typeof input.select === 'function') {
    input.select();
  }
}

function handleEscapeShortcut(event, instances) {
  var searchInput = document.getElementById('search-input');
  var searchResults = document.getElementById('search-results');

  event.preventDefault();
  event.stopImmediatePropagation();

  if (searchInput && searchInput.value) {
    searchInput.value = '';
    if (instances.search && typeof instances.search.hideSuggestions === 'function') {
      instances.search.hideSuggestions();
    } else if (searchResults) {
      searchResults.hidden = true;
    }
    return;
  }

  var parentPath = typeof instances.router.getParentPath === 'function'
    ? instances.router.getParentPath()
    : '#/';
  if (parentPath) {
    instances.router.navigate(parentPath);
  }
}

function openCompare(event, instances) {
  var ids = instances.compare && typeof instances.compare.getSelectedIds === 'function'
    ? instances.compare.getSelectedIds()
    : [];

  event.preventDefault();
  event.stopImmediatePropagation();

  if (ids.length) {
    instances.router.navigate('#/compare/' + ids.map(encodeURIComponent).join(','));
    return;
  }

  var openButton = document.getElementById('compare-open-btn');
  if (openButton && typeof openButton.focus === 'function') {
    openButton.focus();
  }
}

function showRouteContainer(route) {
  var targetId = getViewId(route.type);
  var targetView = document.getElementById(targetId);
  var views = document.querySelectorAll('.view');

  Array.prototype.forEach.call(views, function (view) {
    view.classList.remove('active');
    view.hidden = true;
  });

  if (targetView) {
    targetView.classList.add('active');
    targetView.hidden = false;
  }
}

function getViewId(routeType) {
  var viewIds = {
    'body-map': 'view-body-map',
    'tissue-system': 'view-organ',
    organ: 'view-organ',
    microstructure: 'view-cell',
    'cell-type': 'view-cell',
    search: 'view-search',
    compare: 'view-compare'
  };

  return viewIds[routeType] || 'view-body-map';
}

function showLoadingState() {
  var main = document.getElementById('main-content');
  if (!main) {
    return;
  }

  ensureViewShell(main);
  removeNode(document.getElementById('app-loading-state'));
  main.setAttribute('aria-busy', 'true');

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
  main.insertBefore(loading, main.firstChild);
}

function removeLoadingState() {
  var main = document.getElementById('main-content');
  removeNode(document.getElementById('app-loading-state'));
  if (main) {
    main.removeAttribute('aria-busy');
  }
}

function renderLoadError(error) {
  var main = document.getElementById('main-content');
  if (!main) {
    return;
  }

  main.removeAttribute('aria-busy');
  main.textContent = '';

  var panel = document.createElement('section');
  panel.className = 'error-panel';
  panel.setAttribute('role', 'alert');

  var title = document.createElement('h2');
  title.textContent = 'Cell marker data could not be loaded';

  var message = document.createElement('p');
  message.textContent = 'Check the local static server and retry. You can also open Labome while the app is unavailable.';

  var detail = document.createElement('p');
  detail.className = 'error-detail';
  detail.textContent = error && error.message ? error.message : 'Unknown data loading error.';

  var actions = document.createElement('div');
  actions.className = 'error-actions';

  var retry = document.createElement('button');
  retry.type = 'button';
  retry.textContent = 'Retry';
  retry.addEventListener('click', function () {
    bootApp();
  });

  var fallback = document.createElement('a');
  fallback.href = 'https://www.labome.com/method/Cell-Markers.html';
  fallback.target = '_blank';
  fallback.rel = 'noopener';
  fallback.textContent = 'Open Labome Cell Markers';

  actions.appendChild(retry);
  actions.appendChild(fallback);
  panel.appendChild(title);
  panel.appendChild(message);
  panel.appendChild(detail);
  panel.appendChild(actions);
  main.appendChild(panel);
}

function failApp(message, error, showPanel) {
  console.error(message, error);
  emit(APP_EVENTS.APP_ERROR, { message: message, error: error });
  cleanupApp();

  if (showPanel) {
    renderStartupError(message, error);
  }
}

function renderStartupError(message, error) {
  var main = document.getElementById('main-content');
  if (!main) {
    return;
  }

  main.removeAttribute('aria-busy');
  main.textContent = '';

  var panel = document.createElement('section');
  panel.className = 'error-panel';
  panel.setAttribute('role', 'alert');

  var title = document.createElement('h2');
  title.textContent = message || 'Application failed to start';

  var detail = document.createElement('p');
  detail.className = 'error-detail';
  detail.textContent = error && error.message ? error.message : 'Unknown startup error.';

  panel.appendChild(title);
  panel.appendChild(detail);
  main.appendChild(panel);
}

function ensureViewShell(main) {
  if (document.getElementById('view-body-map')) {
    return;
  }

  main.textContent = '';
  main.appendChild(createView('view-body-map', true));
  main.appendChild(createView('view-organ', false));
  main.appendChild(createView('view-cell', false));
  main.appendChild(createView('view-search', false));
  main.appendChild(createView('view-compare', false));
}

function createView(id, active) {
  var view = document.createElement('div');
  view.id = id;
  view.className = active ? 'view active' : 'view';
  view.hidden = !active;
  return view;
}

function exposeGlobals(instances) {
  window.bodyMapView = instances.bodyMap;
  window.bodyMap = instances.bodyMap;
  window.organView = instances.organView;
  window.cellView = instances.cellView;
  window.searchView = instances.search;
  window.compareView = instances.compare;
  window.compareTray = instances.compare;
  window.compareController = instances.compare;
  window.compare = instances.compare;
  window.exporter = instances.exporter;
  window.links = instances.links;
  window.speciesToggle = instances.speciesToggle;
  window.updateBadge = instances.updateBadge;

  window.App = {
    datastore: instances.datastore,
    router: instances.router,
    links: instances.links,
    speciesToggle: instances.speciesToggle,
    compare: instances.compare,
    exporter: instances.exporter,
    search: instances.search,
    bodyMap: instances.bodyMap,
    organView: instances.organView,
    cellView: instances.cellView,
    updateBadge: instances.updateBadge,
    state: AppState,
    bus: AppBus,
    emit: emit,
    on: on,
    dispatchView: dispatchView
  };
}

function cleanupApp() {
  if (appRouteUnsubscribe) {
    appRouteUnsubscribe();
    appRouteUnsubscribe = null;
  }

  if (appKeyboardHandler) {
    document.removeEventListener('keydown', appKeyboardHandler, true);
    appKeyboardHandler = null;
  }

  if (appInstances && appInstances.router) {
    cleanupRouter(appInstances.router);
  }

  appInstances = null;
}

function cleanupRouter(router) {
  if (router.boundHashChange) {
    window.removeEventListener('hashchange', router.boundHashChange);
  }
  if (router.boundKeydown) {
    document.removeEventListener('keydown', router.boundKeydown);
  }
  if (router.hashChangeTimer) {
    window.clearTimeout(router.hashChangeTimer);
  }
  router.routeChangeCallbacks = [];
  router.started = false;
}

function setVersionBadge(datastore) {
  var versionBadge = document.getElementById('version-badge');
  var version = datastore && typeof datastore.getVersion === 'function'
    ? datastore.getVersion()
    : '';

  if (versionBadge) {
    versionBadge.textContent = version ? 'v' + version : '';
  }
}

function assertModules(names) {
  var missing = names.filter(function (name) {
    return typeof window[name] !== 'function';
  });

  if (missing.length) {
    throw new Error('Missing required module class: ' + missing.join(', '));
  }
}

function isTextInput(target) {
  if (!target) {
    return false;
  }

  var tagName = target.tagName ? target.tagName.toLowerCase() : '';
  return tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    target.isContentEditable === true;
}

function scrollMainToTop() {
  var main = document.getElementById('main-content');
  if (!main) {
    return;
  }

  if (typeof main.scrollTo === 'function') {
    main.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  } else {
    main.scrollTop = 0;
  }
}

function removeNode(node) {
  if (node && node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootApp);
} else {
  bootApp();
}
