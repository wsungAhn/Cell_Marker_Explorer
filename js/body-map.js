/* global window, document, fetch, setTimeout, clearTimeout */

(function (global) {
  'use strict';

  var SVG_URL = 'svg/body-map.svg';
  var MOBILE_QUERY = '(max-width: 768px)';
  var TOUCH_QUERY = '(hover: none), (pointer: coarse)';
  var TOOLTIP_OFFSET = 15;
  var FADE_STAGGER_MS = 50;
  var PULSE_MS = 300;

  class BodyMapView {
    constructor(container, datastore, router) {
      if (!container) {
        throw new Error('BodyMapView requires a container element.');
      }

      this.container = container;
      this.datastore = datastore;
      this.router = router;
      this.tooltip = null;
      this.regions = new Map();
      this.activeRegionId = null;
      this.renderToken = 0;
      this.fadeTimers = [];
      this.pulseTimers = new Map();
      this.route = null;

      this.boundRender = this.render.bind(this);
      this.container.render = this.boundRender;

      if (!global.bodyMapView) {
        global.bodyMapView = this;
      }
      if (!global.bodyMap) {
        global.bodyMap = this;
      }
    }

    async render(route) {
      this.route = route || null;
      this.activate();
      this.clearTimers();
      this.clearHighlight();
      this.removeTooltip();
      this.regions.clear();
      this.renderToken += 1;

      var token = this.renderToken;

      try {
        var response = await fetch(SVG_URL);
        if (!response.ok) {
          throw new Error('Failed to load body map SVG: ' + response.status + ' ' + response.statusText);
        }

        var svgMarkup = await response.text();
        if (token !== this.renderToken) {
          return;
        }

        this.container.textContent = '';
        this.container.innerHTML = svgMarkup;
        this.configureSvg();
        this.createTooltip();
        this.bindRegions();
        this.runInitialAnimation();
      } catch (error) {
        if (token !== this.renderToken) {
          return;
        }
        this.renderFallback(error);
      }
    }

    activate() {
      this.container.hidden = false;
      this.container.classList.add('active');
    }

    deactivate() {
      this.container.classList.remove('active');
      this.container.hidden = true;
      this.clearTimers();
      this.clearHighlight();
      this.hideTooltip();
    }

    highlightRegion(tissueSystemId) {
      if (!tissueSystemId) {
        return;
      }

      if (this.activeRegionId && this.activeRegionId !== tissueSystemId) {
        this.setRegionHighlight(this.activeRegionId, false);
      }

      this.activeRegionId = tissueSystemId;
      this.setRegionHighlight(tissueSystemId, true);
    }

    clearHighlight() {
      if (this.activeRegionId) {
        this.setRegionHighlight(this.activeRegionId, false);
      }
      this.activeRegionId = null;
    }

    pulseRegion(tissueSystemId) {
      var group = this.regions.get(tissueSystemId);
      if (!group) {
        return;
      }

      this.clearPulseTimer(tissueSystemId);
      group.style.transformBox = 'fill-box';
      group.style.transformOrigin = 'center';
      group.style.transition = 'transform 120ms ease, filter 120ms ease';
      group.style.transform = 'scale(1.02)';
      group.style.filter = 'brightness(1.2)';
      group.classList.add('is-pulsing');

      var timer = setTimeout(() => {
        group.style.transform = '';
        group.style.filter = '';
        group.classList.remove('is-pulsing');
        this.pulseTimers.delete(tissueSystemId);
      }, PULSE_MS);

      this.pulseTimers.set(tissueSystemId, timer);
    }

    configureSvg() {
      var svg = this.container.querySelector('svg');
      if (!svg) {
        return;
      }

      svg.setAttribute('focusable', 'false');
      svg.style.width = '100%';
      svg.style.maxWidth = '600px';
      svg.style.height = 'auto';
      svg.style.margin = '0 auto';

      if (this.isMobile()) {
        var labels = svg.querySelector('.labels-layer');
        if (labels) {
          labels.style.display = 'none';
        }
      }
    }

    bindRegions() {
      var tissueSystems = this.getTissueSystems();
      var svgGroups = Array.prototype.slice.call(this.container.querySelectorAll('[data-tissue-system]'));
      var groupsById = new Map();

      svgGroups.forEach((group) => {
        if (group.dataset && group.dataset.tissueSystem) {
          groupsById.set(group.dataset.tissueSystem, group);
        }
      });

      tissueSystems.forEach((tissueSystem, index) => {
        var group = groupsById.get(tissueSystem.id);
        if (!group) {
          return;
        }

        this.regions.set(tissueSystem.id, group);
        this.prepareRegion(group, tissueSystem, index);
      });
    }

    prepareRegion(group, tissueSystem, index) {
      var regionPaths = Array.prototype.slice.call(group.querySelectorAll('.region-path'));
      var label = this.getRegionLabel(tissueSystem);

      group.setAttribute('role', 'button');
      group.setAttribute('tabindex', '0');
      group.setAttribute('aria-label', label);
      group.style.cursor = 'pointer';
      group.style.outline = 'none';

      regionPaths.forEach((path) => {
        if (tissueSystem.color) {
          path.style.fill = tissueSystem.color;
        }
        path.style.transition = 'filter 160ms ease, opacity 220ms ease, stroke-width 160ms ease';
      });

      group.addEventListener('click', (event) => {
        this.onRegionClick(event);
      });
      group.addEventListener('keydown', (event) => {
        this.onRegionKeydown(event);
      });
      group.addEventListener('focus', (event) => {
        this.onRegionFocus(event);
      });
      group.addEventListener('blur', (event) => {
        this.onRegionBlur(event);
      });

      if (this.usesTouchInteraction()) {
        group.addEventListener('touchstart', (event) => {
          this.onRegionTouchStart(event);
        }, { passive: true });
      } else {
        group.addEventListener('mouseenter', (event) => {
          this.onRegionEnter(event);
        });
        group.addEventListener('mousemove', (event) => {
          this.onRegionMove(event);
        });
        group.addEventListener('mouseleave', (event) => {
          this.onRegionLeave(event);
        });
      }

      group.style.opacity = '0';
      group.style.transition = 'opacity 220ms ease, transform 120ms ease, filter 120ms ease';
      group.dataset.fadeIndex = String(index);
    }

    onRegionClick(event) {
      var tissueSystemId = this.getEventRegionId(event);
      if (!tissueSystemId) {
        return;
      }

      this.highlightRegion(tissueSystemId);
      this.pulseRegion(tissueSystemId);
      this.navigateToTissueSystem(tissueSystemId);
    }

    onRegionKeydown(event) {
      if (event.key !== 'Enter' && event.key !== ' ') {
        return;
      }

      event.preventDefault();
      var tissueSystemId = this.getEventRegionId(event);
      if (!tissueSystemId) {
        return;
      }

      this.highlightRegion(tissueSystemId);
      this.pulseRegion(tissueSystemId);
      this.navigateToTissueSystem(tissueSystemId);
    }

    onRegionEnter(event) {
      var tissueSystemId = this.getEventRegionId(event);
      if (!tissueSystemId) {
        return;
      }

      this.highlightRegion(tissueSystemId);
      this.showTooltipForRegion(tissueSystemId, event);
    }

    onRegionMove(event) {
      if (this.tooltip && !this.isTooltipHidden()) {
        this.positionTooltip(event.clientX, event.clientY);
      }
    }

    onRegionLeave(event) {
      var tissueSystemId = this.getEventRegionId(event);
      if (tissueSystemId) {
        this.setRegionHighlight(tissueSystemId, false);
      }
      if (this.activeRegionId === tissueSystemId) {
        this.activeRegionId = null;
      }
      this.hideTooltip();
    }

    onRegionTouchStart(event) {
      var tissueSystemId = this.getEventRegionId(event);
      if (tissueSystemId) {
        this.highlightRegion(tissueSystemId);
      }
    }

    onRegionFocus(event) {
      var tissueSystemId = this.getEventRegionId(event);
      if (tissueSystemId) {
        this.highlightRegion(tissueSystemId);
      }
    }

    onRegionBlur(event) {
      var tissueSystemId = this.getEventRegionId(event);
      if (tissueSystemId) {
        this.setRegionHighlight(tissueSystemId, false);
      }
      if (this.activeRegionId === tissueSystemId) {
        this.activeRegionId = null;
      }
      this.hideTooltip();
    }

    navigateToTissueSystem(tissueSystemId) {
      if (this.router && typeof this.router.navigate === 'function') {
        this.router.navigate('#/' + tissueSystemId);
      }
    }

    setRegionHighlight(tissueSystemId, highlighted) {
      var group = this.regions.get(tissueSystemId);
      if (!group) {
        return;
      }

      var paths = Array.prototype.slice.call(group.querySelectorAll('.region-path'));
      paths.forEach((path) => {
        path.style.filter = highlighted ? 'brightness(1.15)' : '';
      });

      group.classList.toggle('is-highlighted', highlighted);
      group.setAttribute('aria-pressed', highlighted ? 'true' : 'false');
    }

    showTooltipForRegion(tissueSystemId, event) {
      var tissueSystem = this.datastore && typeof this.datastore.getTissueSystem === 'function'
        ? this.datastore.getTissueSystem(tissueSystemId)
        : null;

      if (!tissueSystem || !this.tooltip) {
        return;
      }

      var name = tissueSystem.name || tissueSystem.id;
      var organCount = Array.isArray(tissueSystem.organs) ? tissueSystem.organs.length : 0;

      this.tooltip.textContent = '';
      var title = document.createElement('div');
      var count = document.createElement('div');
      title.textContent = name;
      title.style.fontWeight = '700';
      count.textContent = organCount + (organCount === 1 ? ' organ' : ' organs');
      count.style.marginTop = '4px';
      this.tooltip.appendChild(title);
      this.tooltip.appendChild(count);
      this.tooltip.hidden = false;
      this.tooltip.setAttribute('aria-hidden', 'false');
      this.positionTooltip(event.clientX, event.clientY);
    }

    createTooltip() {
      if (this.tooltip) {
        return;
      }

      var tooltip = document.createElement('div');
      tooltip.className = 'body-map-tooltip';
      tooltip.hidden = true;
      tooltip.setAttribute('role', 'tooltip');
      tooltip.setAttribute('aria-hidden', 'true');
      tooltip.style.position = 'fixed';
      tooltip.style.zIndex = '1000';
      tooltip.style.maxWidth = '200px';
      tooltip.style.padding = '8px 10px';
      tooltip.style.borderRadius = '6px';
      tooltip.style.background = 'rgba(0, 0, 0, 0.86)';
      tooltip.style.color = 'white';
      tooltip.style.fontSize = '0.875rem';
      tooltip.style.lineHeight = '1.35';
      tooltip.style.pointerEvents = 'none';
      tooltip.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.18)';

      this.container.appendChild(tooltip);
      this.tooltip = tooltip;
    }

    positionTooltip(clientX, clientY) {
      if (!this.tooltip) {
        return;
      }

      var left = clientX + TOOLTIP_OFFSET;
      var top = clientY + TOOLTIP_OFFSET;
      this.tooltip.style.left = left + 'px';
      this.tooltip.style.top = top + 'px';

      var rect = this.tooltip.getBoundingClientRect();
      var viewportWidth = global.innerWidth || document.documentElement.clientWidth || 0;
      var viewportHeight = global.innerHeight || document.documentElement.clientHeight || 0;

      if (viewportWidth && rect.right > viewportWidth) {
        left = Math.max(0, clientX - rect.width - TOOLTIP_OFFSET);
      }
      if (viewportHeight && rect.bottom > viewportHeight) {
        top = Math.max(0, clientY - rect.height - TOOLTIP_OFFSET);
      }

      this.tooltip.style.left = left + 'px';
      this.tooltip.style.top = top + 'px';
    }

    hideTooltip() {
      if (!this.tooltip) {
        return;
      }
      this.tooltip.hidden = true;
      this.tooltip.setAttribute('aria-hidden', 'true');
    }

    removeTooltip() {
      if (this.tooltip && this.tooltip.parentNode) {
        this.tooltip.parentNode.removeChild(this.tooltip);
      }
      this.tooltip = null;
    }

    isTooltipHidden() {
      return !this.tooltip || this.tooltip.hidden;
    }

    runInitialAnimation() {
      this.fadeTimers = [];
      Array.from(this.regions.values()).forEach((group, index) => {
        var timer = setTimeout(() => {
          group.style.opacity = '1';
        }, index * FADE_STAGGER_MS);
        this.fadeTimers.push(timer);
      });
    }

    renderFallback(error) {
      this.container.textContent = '';
      this.regions.clear();
      this.removeTooltip();

      var wrapper = document.createElement('div');
      wrapper.className = 'body-map-fallback';
      wrapper.setAttribute('role', 'region');
      wrapper.setAttribute('aria-label', 'Tissue systems');

      var heading = document.createElement('h2');
      heading.textContent = 'Tissue systems';

      var message = document.createElement('p');
      message.textContent = 'The body map could not be loaded. Select a tissue system from the list.';

      var list = document.createElement('ul');
      list.className = 'body-map-fallback-list';

      this.getTissueSystems().forEach((tissueSystem) => {
        var item = document.createElement('li');
        var button = document.createElement('button');
        var organCount = Array.isArray(tissueSystem.organs) ? tissueSystem.organs.length : 0;

        button.type = 'button';
        button.textContent = (tissueSystem.name || tissueSystem.id) + ' (' + organCount + (organCount === 1 ? ' organ' : ' organs') + ')';
        button.addEventListener('click', () => {
          this.navigateToTissueSystem(tissueSystem.id);
        });
        button.addEventListener('keydown', (event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.navigateToTissueSystem(tissueSystem.id);
          }
        });

        item.appendChild(button);
        list.appendChild(item);
      });

      wrapper.appendChild(heading);
      wrapper.appendChild(message);
      wrapper.appendChild(list);
      this.container.appendChild(wrapper);

      if (error && global.console && typeof global.console.warn === 'function') {
        global.console.warn(error.message || error);
      }
    }

    getEventRegionId(event) {
      var group = event && event.currentTarget ? event.currentTarget : null;
      return group && group.dataset ? group.dataset.tissueSystem : '';
    }

    getRegionLabel(tissueSystem) {
      var organCount = Array.isArray(tissueSystem.organs) ? tissueSystem.organs.length : 0;
      return (tissueSystem.name || tissueSystem.id) + ', ' + organCount + (organCount === 1 ? ' organ' : ' organs');
    }

    getTissueSystems() {
      if (this.datastore && typeof this.datastore.getTissueSystems === 'function') {
        return this.datastore.getTissueSystems();
      }
      return [];
    }

    isMobile() {
      return typeof global.matchMedia === 'function' && global.matchMedia(MOBILE_QUERY).matches;
    }

    usesTouchInteraction() {
      return this.isMobile() || (typeof global.matchMedia === 'function' && global.matchMedia(TOUCH_QUERY).matches);
    }

    clearTimers() {
      this.fadeTimers.forEach((timer) => clearTimeout(timer));
      this.fadeTimers = [];
      this.pulseTimers.forEach((timer) => clearTimeout(timer));
      this.pulseTimers.clear();
    }

    clearPulseTimer(tissueSystemId) {
      var timer = this.pulseTimers.get(tissueSystemId);
      if (timer) {
        clearTimeout(timer);
        this.pulseTimers.delete(tissueSystemId);
      }
    }
  }

  global.BodyMapView = BodyMapView;
})(typeof window !== 'undefined' ? window : globalThis);
