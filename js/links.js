(function (global) {
  'use strict';

  var TAXON_IDS = {
    human: '9606',
    mouse: '10090'
  };

  var NCBI_ORGANISMS = {
    human: 'Homo+sapiens',
    mouse: 'Mus+musculus'
  };

  var MARKER_ALIASES = {
    'VE-cadherin': 'CDH5',
    'c-Kit': 'KIT',
    'Langerin': 'CD207',
    'DEC-205': 'LY75',
    'DC-SIGN': 'CD209',
    'DC-LAMP': 'CD208',
    'B220': 'CD45R',
    'FcεRI': 'FCER1A',
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
    'Pro-SFTPC': 'SFTPC'
  };

  var NON_GENE_MARKERS = {
    'Lin-': true
  };

  function LinksGenerator() {}

  LinksGenerator.prototype.getLinks = function (marker, species) {
    var resolvedSpecies = normalizeSpecies(species);
    var parts = splitMarker(marker);
    var links = [];
    var seen = {};
    var i;

    for (i = 0; i < parts.length; i += 1) {
      appendMarkerLinks(links, seen, this, parts[i], resolvedSpecies);
    }

    return links;
  };

  LinksGenerator.prototype.getUniProtLink = function (geneSymbol, species) {
    var resolvedSpecies = normalizeSpecies(species);
    return 'https://www.uniprot.org/uniprot/?query=gene:' +
      encodeURIComponent(geneSymbol) +
      '+organism:' +
      TAXON_IDS[resolvedSpecies];
  };

  LinksGenerator.prototype.getCellMarkerLink = function (marker) {
    return 'http://bio-bigdata.hrbmu.edu.cn/CellMarker/search/' +
      encodeURIComponent(marker);
  };

  LinksGenerator.prototype.getPanglaoDBLink = function (marker) {
    return 'https://panglaodb.se/search.html?query=' +
      encodeURIComponent(marker);
  };

  LinksGenerator.prototype.getNCBIGeneLink = function (geneSymbol, species) {
    var resolvedSpecies = normalizeSpecies(species);
    return 'https://www.ncbi.nlm.nih.gov/gene/?term=' +
      encodeURIComponent(geneSymbol) +
      '+' +
      NCBI_ORGANISMS[resolvedSpecies];
  };

  LinksGenerator.prototype.renderLinksSection = function (markers, species) {
    var section = document.createElement('div');
    var heading = document.createElement('h3');
    var grid = document.createElement('div');
    var resolvedSpecies = normalizeSpecies(species);
    var safeMarkers = Array.isArray(markers) ? markers : [];
    var i;

    section.className = 'links-section';
    heading.textContent = 'External Links';
    grid.className = 'links-grid';

    section.appendChild(heading);
    section.appendChild(grid);

    for (i = 0; i < safeMarkers.length; i += 1) {
      appendLinkGroups(grid, this, safeMarkers[i], resolvedSpecies);
    }

    return section;
  };

  function appendLinkGroups(grid, generator, marker, species) {
    var parts = splitMarker(marker);
    var i;

    for (i = 0; i < parts.length; i += 1) {
      grid.appendChild(createLinkGroup(generator, parts[i], species));
    }
  }

  function createLinkGroup(generator, marker, species) {
    var group = document.createElement('div');
    var markerLabel = document.createElement('span');
    var links = generator.getLinks(marker, species);
    var i;

    group.className = 'link-group';
    group.setAttribute('data-marker', marker);

    markerLabel.className = 'link-marker';
    markerLabel.textContent = marker;
    group.appendChild(markerLabel);

    for (i = 0; i < links.length; i += 1) {
      group.appendChild(createAnchor(links[i]));
    }

    return group;
  }

  function createAnchor(link) {
    var anchor = document.createElement('a');
    var name = document.createElement('span');

    anchor.href = link.url;
    anchor.target = '_blank';
    anchor.rel = 'noopener';
    anchor.className = 'db-link';

    name.className = 'db-name';
    name.textContent = link.database;
    anchor.appendChild(name);

    return anchor;
  }

  function appendMarkerLinks(links, seen, generator, marker, species) {
    var resolved = resolveMarker(marker);
    var symbol = resolved.symbol;

    if (!resolved.nonGene) {
      if (!resolved.isCdMarker) {
        addLink(links, seen, {
          database: 'UniProt',
          url: generator.getUniProtLink(symbol, species),
          marker: marker,
          species: species
        });
      }

      addLink(links, seen, {
        database: 'NCBI Gene',
        url: generator.getNCBIGeneLink(symbol, species),
        marker: marker,
        species: species
      });
    }

    addLink(links, seen, {
      database: 'CellMarker 2.0',
      url: generator.getCellMarkerLink(marker),
      marker: marker,
      species: species
    });

    addLink(links, seen, {
      database: 'PanglaoDB',
      url: generator.getPanglaoDBLink(marker),
      marker: marker,
      species: species
    });
  }

  function addLink(links, seen, link) {
    var key = link.database + '|' + link.url + '|' + link.marker;

    if (seen[key]) {
      return;
    }

    seen[key] = true;
    links.push(link);
  }

  function resolveMarker(marker) {
    var normalized = cleanMarker(marker);
    var alias = MARKER_ALIASES[normalized];
    var symbol = alias || normalized;

    return {
      symbol: symbol,
      nonGene: Boolean(NON_GENE_MARKERS[normalized]),
      isCdMarker: isCdMarker(symbol)
    };
  }

  function splitMarker(marker) {
    var normalized = cleanMarker(marker);
    var rawParts;
    var parts = [];
    var i;
    var part;

    if (!normalized) {
      return [];
    }

    if (MARKER_ALIASES[normalized]) {
      return [normalized];
    }

    rawParts = normalized.split('/');

    for (i = 0; i < rawParts.length; i += 1) {
      part = cleanMarker(rawParts[i]);

      if (part) {
        parts.push(part);
      }
    }

    return parts.length ? parts : [normalized];
  }

  function cleanMarker(marker) {
    if (marker === null || marker === undefined) {
      return '';
    }

    return String(marker).replace(/^\s+|\s+$/g, '');
  }

  function normalizeSpecies(species) {
    return species === 'mouse' ? 'mouse' : 'human';
  }

  function isCdMarker(marker) {
    return /^CD\d+[A-Za-z+-]*$/i.test(marker);
  }

  global.LinksGenerator = LinksGenerator;
  global.links = new LinksGenerator();
}(typeof window !== 'undefined' ? window : globalThis));
