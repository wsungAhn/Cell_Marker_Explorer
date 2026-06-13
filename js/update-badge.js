(function (global) {
  'use strict';

  var DEFAULT_CHANGELOG_URL = 'data/changelog.json';
  var FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'textarea:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  class UpdateBadge {
    constructor(datastore) {
      this.datastore = datastore;
      this.changelogEntries = [];
      this.changelogLoaded = false;
      this.changelogError = null;

      this.badgeEl = null;
      this.versionBadgeEl = null;
      this.modalBackdrop = null;
      this.modalBody = null;
      this.closeButton = null;
      this.previouslyFocused = null;
      this.previousBodyOverflow = '';

      this._badgeClickHandler = this.openModal.bind(this);
      this._badgeKeyHandler = this._handleBadgeKeydown.bind(this);
      this._documentKeyHandler = this._handleDocumentKeydown.bind(this);
      this._backdropClickHandler = this._handleBackdropClick.bind(this);
      this._closeClickHandler = this.closeModal.bind(this);
      this._badgeBound = false;

      global.updateBadge = this;
    }

    init() {
      this.badgeEl = document.getElementById('update-badge');
      this.versionBadgeEl = document.getElementById('version-badge');

      this.renderBadge();
      this._bindBadge();
      this.loadChangelog().catch(() => {});
    }

    async loadChangelog(url = DEFAULT_CHANGELOG_URL) {
      try {
        var response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to load changelog: ' + response.status);
        }

        var payload = await response.json();
        this.changelogEntries = Array.isArray(payload && payload.updates)
          ? payload.updates.slice().sort(this._sortUpdatesNewestFirst)
          : [];
        this.changelogLoaded = true;
        this.changelogError = null;
        this._refreshOpenModalBody();
        return this.changelogEntries;
      } catch (error) {
        this.changelogEntries = [];
        this.changelogLoaded = true;
        this.changelogError = error;
        this._refreshOpenModalBody();
        return [];
      }
    }

    renderBadge() {
      var version = this._getVersion();
      var lastUpdated = this._getLastUpdated();

      if (this.versionBadgeEl) {
        this.versionBadgeEl.textContent = version ? 'v' + version : '';
      }

      if (!this.badgeEl) {
        return;
      }

      this.badgeEl.textContent = 'Data v' + version + ' — Updated ' + lastUpdated;
      this.badgeEl.setAttribute('role', 'button');
      this.badgeEl.setAttribute('tabindex', '0');
      this.badgeEl.setAttribute('aria-label', 'View changelog for data version ' + version);

      if (this.isUpdateOverdue()) {
        var indicator = document.createElement('span');
        indicator.className = 'update-overdue-dot';
        indicator.setAttribute('aria-label', 'Update available');
        indicator.textContent = ' .';
        this.badgeEl.appendChild(indicator);
      }
    }

    openModal() {
      this._ensureModal();
      this._renderModalBody();

      if (!this.modalBackdrop.hidden) {
        this._focusCloseButton();
        return;
      }

      this.previouslyFocused = document.activeElement;
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      this.modalBackdrop.hidden = false;
      document.addEventListener('keydown', this._documentKeyHandler);

      this._focusCloseButton();
    }

    closeModal() {
      if (!this.modalBackdrop || this.modalBackdrop.hidden) {
        return;
      }

      this.modalBackdrop.hidden = true;
      document.removeEventListener('keydown', this._documentKeyHandler);
      document.body.style.overflow = this.previousBodyOverflow;

      var returnTarget = this.badgeEl || this.previouslyFocused;
      if (returnTarget && typeof returnTarget.focus === 'function') {
        returnTarget.focus();
      }
    }

    isUpdateOverdue() {
      var metadata = this._getMetadata();
      var nextUpdate = metadata ? metadata.next_scheduled_update : null;
      if (!nextUpdate) {
        return false;
      }

      return String(nextUpdate) < this._todayIso();
    }

    _bindBadge() {
      if (!this.badgeEl || this._badgeBound) {
        return;
      }

      this.badgeEl.addEventListener('click', this._badgeClickHandler);
      this.badgeEl.addEventListener('keydown', this._badgeKeyHandler);
      this._badgeBound = true;
    }

    _ensureModal() {
      if (this.modalBackdrop) {
        return;
      }

      var backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop';
      backdrop.id = 'changelog-modal';
      backdrop.hidden = true;

      var modal = document.createElement('div');
      modal.className = 'modal';
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'changelog-title');

      var header = document.createElement('header');
      header.className = 'modal-header';

      var title = document.createElement('h2');
      title.id = 'changelog-title';
      title.textContent = 'Changelog';

      var closeButton = document.createElement('button');
      closeButton.className = 'modal-close';
      closeButton.type = 'button';
      closeButton.setAttribute('aria-label', 'Close changelog');
      closeButton.textContent = 'x';

      var body = document.createElement('div');
      body.className = 'modal-body';

      header.appendChild(title);
      header.appendChild(closeButton);
      modal.appendChild(header);
      modal.appendChild(body);
      backdrop.appendChild(modal);
      document.body.appendChild(backdrop);

      backdrop.addEventListener('click', this._backdropClickHandler);
      closeButton.addEventListener('click', this._closeClickHandler);

      this.modalBackdrop = backdrop;
      this.modalBody = body;
      this.closeButton = closeButton;
    }

    _renderModalBody() {
      this._clearElement(this.modalBody);

      if (!this.changelogEntries.length) {
        var empty = document.createElement('p');
        empty.className = 'changelog-empty';
        empty.textContent = 'No changelog available.';
        this.modalBody.appendChild(empty);
        return;
      }

      this.changelogEntries.forEach((entry) => {
        this.modalBody.appendChild(this._createChangelogEntry(entry));
      });
    }

    _createChangelogEntry(entry) {
      var section = document.createElement('section');
      section.className = 'changelog-entry';

      var heading = document.createElement('h3');
      heading.textContent = 'v' + (entry.version || '');

      var date = document.createElement('p');
      date.className = 'changelog-date';
      date.textContent = entry.date || '';

      var description = document.createElement('p');
      description.className = 'changelog-description';
      description.textContent = entry.description || '';

      section.appendChild(heading);
      section.appendChild(date);
      section.appendChild(description);

      var changes = this._createChangesList(entry.changes);
      if (changes) {
        section.appendChild(changes);
      }

      var details = this._createDetails(entry.details);
      if (details) {
        section.appendChild(details);
      }

      return section;
    }

    _createChangesList(changes) {
      if (!changes || typeof changes !== 'object') {
        return null;
      }

      var keys = Object.keys(changes);
      if (!keys.length) {
        return null;
      }

      var list = document.createElement('ul');
      list.className = 'changelog-changes';

      keys.forEach((key) => {
        var item = document.createElement('li');
        item.textContent = this._humanizeKey(key) + ': ' + String(changes[key]);
        list.appendChild(item);
      });

      return list;
    }

    _createDetails(details) {
      if (!details || typeof details !== 'object') {
        return null;
      }

      var keys = Object.keys(details).filter((key) => {
        var value = details[key];
        return Array.isArray(value) ? value.length > 0 : value !== null && value !== undefined && value !== '';
      });
      if (!keys.length) {
        return null;
      }

      var wrapper = document.createElement('details');
      wrapper.className = 'changelog-details';

      var summary = document.createElement('summary');
      summary.textContent = 'Details';
      wrapper.appendChild(summary);

      keys.forEach((key) => {
        var groupTitle = document.createElement('h4');
        groupTitle.textContent = this._humanizeKey(key);
        wrapper.appendChild(groupTitle);

        var value = details[key];
        var list = document.createElement('ul');
        var values = Array.isArray(value) ? value : [value];

        values.forEach((detail) => {
          var item = document.createElement('li');
          item.textContent = String(detail);
          list.appendChild(item);
        });

        wrapper.appendChild(list);
      });

      return wrapper;
    }

    _handleBadgeKeydown(event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.openModal();
      }
    }

    _handleDocumentKeydown(event) {
      if (event.key === 'Escape') {
        this.closeModal();
        return;
      }

      if (event.key === 'Tab') {
        this._trapFocus(event);
      }
    }

    _handleBackdropClick(event) {
      if (event.target === this.modalBackdrop) {
        this.closeModal();
      }
    }

    _refreshOpenModalBody() {
      if (this.modalBackdrop && !this.modalBackdrop.hidden) {
        this._renderModalBody();
      }
    }

    _focusCloseButton() {
      var focusTarget = this.closeButton || this.modalBackdrop.querySelector(FOCUSABLE_SELECTOR);
      if (focusTarget) {
        focusTarget.focus();
      }
    }

    _trapFocus(event) {
      if (!this.modalBackdrop || this.modalBackdrop.hidden) {
        return;
      }

      var focusable = Array.from(this.modalBackdrop.querySelectorAll(FOCUSABLE_SELECTOR))
        .filter((element) => !element.hidden && element.offsetParent !== null);

      if (!focusable.length) {
        event.preventDefault();
        return;
      }

      var first = focusable[0];
      var last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    _getVersion() {
      return this.datastore && typeof this.datastore.getVersion === 'function'
        ? this.datastore.getVersion()
        : '';
    }

    _getLastUpdated() {
      return this.datastore && typeof this.datastore.getLastUpdated === 'function'
        ? this.datastore.getLastUpdated()
        : '';
    }

    _getMetadata() {
      if (!this.datastore) {
        return null;
      }

      if (this.datastore.data && this.datastore.data.metadata) {
        return this.datastore.data.metadata;
      }

      return this.datastore.metadata || null;
    }

    _todayIso() {
      var now = new Date();
      var month = String(now.getMonth() + 1).padStart(2, '0');
      var day = String(now.getDate()).padStart(2, '0');
      return now.getFullYear() + '-' + month + '-' + day;
    }

    _sortUpdatesNewestFirst(a, b) {
      var left = a && a.date ? String(a.date) : '';
      var right = b && b.date ? String(b.date) : '';
      if (left === right) {
        return 0;
      }
      return left < right ? 1 : -1;
    }

    _humanizeKey(key) {
      return String(key)
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (match) => match.toUpperCase());
    }

    _clearElement(element) {
      while (element.firstChild) {
        element.removeChild(element.firstChild);
      }
    }
  }

  global.UpdateBadge = UpdateBadge;
}(typeof window !== 'undefined' ? window : globalThis));
