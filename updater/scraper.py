# Scrape external cell marker sources into merge-ready JSON files.

from __future__ import annotations

import argparse
import asyncio
import json
import logging
import os
import re
import sys
import time
from datetime import datetime
from typing import Any, Optional
from urllib.parse import urljoin, urlparse
from urllib.robotparser import RobotFileParser

import requests
import yaml
from bs4 import BeautifulSoup
from requests import Response, Session
from requests.exceptions import RequestException


DEFAULT_CONFIG_PATH = "updater/config.yaml"
DEFAULT_TIMEOUT_SECONDS = 30
DEFAULT_RETRY_COUNT = 3
DEFAULT_BACKOFF_SECONDS = 1.0
DEFAULT_USER_AGENT = "CellMarkersExplorerScraper/1.0"
HTTP_OK = 200


def load_config(path: str = DEFAULT_CONFIG_PATH) -> dict[str, Any]:
    """Load YAML scraper configuration."""
    config_path = _resolve_config_path(path)
    try:
        with open(config_path, "r", encoding="utf-8") as config_file:
            loaded = yaml.safe_load(config_file)
    except OSError as exc:
        logging.error("Failed to read config file %s: %s", config_path, exc)
        raise
    except yaml.YAMLError as exc:
        logging.error("Failed to parse YAML config %s: %s", config_path, exc)
        raise

    if not isinstance(loaded, dict):
        logging.error("Config file %s did not contain a mapping", config_path)
        raise ValueError("Config must be a mapping")
    return loaded


def setup_logging(config: dict[str, Any], dry_run: bool = False) -> None:
    """Configure console and optional file logging."""
    log_config = config.get("logging", {})
    level_name = str(log_config.get("level", "INFO")).upper()
    level = getattr(logging, level_name, logging.INFO)
    handlers: list[logging.Handler] = [logging.StreamHandler()]

    if not dry_run:
        log_file = str(log_config.get("file", "updater/scraper.log"))
        log_dir = os.path.dirname(log_file)
        try:
            if log_dir:
                os.makedirs(log_dir, exist_ok=True)
            handlers.append(logging.FileHandler(log_file, encoding="utf-8"))
        except OSError as exc:
            logging.basicConfig(level=level, format="%(levelname)s:%(message)s")
            logging.error("Failed to open log file %s: %s", log_file, exc)

    try:
        logging.basicConfig(
            level=level,
            format="%(asctime)s %(levelname)s %(name)s: %(message)s",
            handlers=handlers,
            force=True,
        )
    except (OSError, ValueError) as exc:
        logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s", force=True)
        logging.error("Failed to configure logging: %s", exc)


def _resolve_config_path(path: str) -> str:
    if os.path.exists(path):
        return path
    script_relative = os.path.join(os.path.dirname(os.path.abspath(__file__)), os.path.basename(path))
    if os.path.exists(script_relative):
        return script_relative
    return path


def _empty_markers() -> dict[str, dict[str, list[str]]]:
    return {
        "human": {"positive": [], "negative": []},
        "mouse": {"positive": [], "negative": []},
    }


def _dedupe(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        cleaned = value.strip()
        if cleaned and cleaned not in seen:
            seen.add(cleaned)
            result.append(cleaned)
    return result


class BaseScraper:
    """Base class for all scrapers."""

    def __init__(self, config: dict[str, Any]):
        self.config = config
        self.session: Session = requests.Session()
        self.session.headers.update({"User-Agent": DEFAULT_USER_AGENT})
        self.retry_count = int(config.get("network", {}).get("retry_count", DEFAULT_RETRY_COUNT))
        self.backoff_seconds = float(config.get("network", {}).get("backoff_seconds", DEFAULT_BACKOFF_SECONDS))
        self.timeout_seconds = int(config.get("network", {}).get("timeout_seconds", DEFAULT_TIMEOUT_SECONDS))
        self.robot_parsers: dict[str, Optional[RobotFileParser]] = {}
        self.last_request_time: dict[str, float] = {}

    async def fetch_page(self, url: str) -> str:
        """Fetch a URL after robots.txt, rate-limit, and retry checks."""
        if not self._can_fetch(url):
            self.log(f"robots.txt disallows scraping {url}", "WARNING")
            return ""

        self._respect_rate_limit(url)
        for attempt in range(1, self.retry_count + 1):
            try:
                response = self.session.get(url, timeout=self.timeout_seconds)
                self._record_request_time(url)
                response.raise_for_status()
                return response.text
            except RequestException as exc:
                self.log(f"Network error fetching {url} on attempt {attempt}: {exc}", "WARNING")
                if attempt >= self.retry_count:
                    self.log(f"Giving up on {url} after {self.retry_count} attempts", "ERROR")
                    return ""
                await asyncio.sleep(self.backoff_seconds * (2 ** (attempt - 1)))
        return ""

    def save_output(self, data: dict[str, Any], source_name: str) -> str:
        """Save source output JSON using configured directory and date format."""
        output_config = self.config.get("output", {})
        output_dir = str(output_config.get("directory", "data/scraped"))
        date_format = str(output_config.get("date_format", "%Y%m%d"))
        scrape_date = str(data.get("scrape_date") or datetime.utcnow().strftime(date_format))
        output_path = os.path.join(output_dir, f"{source_name}_{scrape_date}.json")

        try:
            os.makedirs(output_dir, exist_ok=True)
            with open(output_path, "w", encoding="utf-8") as output_file:
                json.dump(data, output_file, indent=2, ensure_ascii=False)
        except (OSError, TypeError, ValueError) as exc:
            self.log(f"Failed to save output {output_path}: {exc}", "ERROR")
            raise
        return output_path

    def log(self, message: str, level: str = "INFO") -> None:
        logger = logging.getLogger(self.__class__.__name__)
        log_level = getattr(logging, level.upper(), logging.INFO)
        logger.log(log_level, message)

    def _rate_limit_seconds(self, source_key: Optional[str] = None) -> float:
        sources = self.config.get("sources", {})
        if source_key and source_key in sources:
            return float(sources[source_key].get("rate_limit_seconds", 0))
        return float(self.config.get("rate_limit_seconds", 0))

    def _respect_rate_limit(self, url: str) -> None:
        domain = urlparse(url).netloc
        source_key = self._source_key_for_url(url)
        delay = self._rate_limit_seconds(source_key)
        elapsed = time.monotonic() - self.last_request_time.get(domain, 0)
        remaining = delay - elapsed
        if remaining > 0:
            try:
                time.sleep(remaining)
            except (OSError, ValueError) as exc:
                self.log(f"Rate limit sleep failed for {domain}: {exc}", "WARNING")

    def _record_request_time(self, url: str) -> None:
        self.last_request_time[urlparse(url).netloc] = time.monotonic()

    def _source_key_for_url(self, url: str) -> Optional[str]:
        parsed_domain = urlparse(url).netloc
        sources = self.config.get("sources", {})
        for source_key, source_config in sources.items():
            candidate_urls: list[str] = []
            if isinstance(source_config, dict):
                for key in ("url", "api_url", "search_url"):
                    if source_config.get(key):
                        candidate_urls.append(str(source_config[key]))
                for page in source_config.get("pages", []):
                    if isinstance(page, dict) and page.get("url"):
                        candidate_urls.append(str(page["url"]))
            for candidate_url in candidate_urls:
                if urlparse(candidate_url).netloc == parsed_domain:
                    return source_key
        return None

    def _can_fetch(self, url: str) -> bool:
        parsed = urlparse(url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        if base_url not in self.robot_parsers:
            self.robot_parsers[base_url] = self._load_robot_parser(base_url)
        parser = self.robot_parsers.get(base_url)
        if parser is None:
            return True
        try:
            return parser.can_fetch(DEFAULT_USER_AGENT, url)
        except (TypeError, ValueError) as exc:
            self.log(f"robots.txt check failed for {url}: {exc}", "WARNING")
            return False

    def _load_robot_parser(self, base_url: str) -> Optional[RobotFileParser]:
        robots_url = urljoin(base_url, "/robots.txt")
        parser = RobotFileParser()
        parser.set_url(robots_url)
        try:
            response = self.session.get(robots_url, timeout=self.timeout_seconds)
            self._record_request_time(robots_url)
            if response.status_code != HTTP_OK:
                self.log(f"No usable robots.txt at {robots_url}; status {response.status_code}", "WARNING")
                return None
            parser.parse(response.text.splitlines())
            return parser
        except RequestException as exc:
            self.log(f"Failed to fetch robots.txt at {robots_url}: {exc}", "WARNING")
            return None


class LabomeScraper(BaseScraper):
    """Scrapes Labome cell marker pages."""

    def scrape_cell_markers(self) -> dict[str, Any]:
        return self._scrape_page_by_output("labome_cell_markers")

    def scrape_tb_cell_markers(self) -> dict[str, Any]:
        return self._scrape_page_by_output("labome_tb_cell_markers")

    def scrape_macrophage_markers(self) -> dict[str, Any]:
        return self._scrape_page_by_output("labome_macrophage_markers")

    def scrape_stem_cell_markers(self) -> dict[str, Any]:
        return self._scrape_page_by_output("labome_stem_cell_markers")

    def parse_marker_table(self, html: str, cell_type: str) -> list[dict[str, Any]]:
        try:
            soup = BeautifulSoup(html, "lxml")
            rows = soup.find_all("tr")
        except Exception as exc:
            self.log(f"Parse error reading marker table for {cell_type}: {exc}", "WARNING")
            return []

        entries: list[dict[str, Any]] = []
        for row in rows:
            try:
                cells = [cell.get_text(" ", strip=True) for cell in row.find_all(["td", "th"])]
                if not cells or _looks_like_header(cells):
                    continue
                marker_text = cells[0]
                species_text = " ".join(cells[1:3]) if len(cells) > 1 else ""
                reference_text = " ".join(cells)
                entries.append(
                    {
                        "markers": _extract_markers(marker_text),
                        "species": _detect_species(species_text),
                        "polarity": _detect_polarity(reference_text),
                        "references": _extract_references(reference_text),
                        "raw_text": reference_text,
                    }
                )
            except Exception as exc:
                self.log(f"Skipping unparsable marker row for {cell_type}: {exc}", "WARNING")
        return entries

    def extract_cell_type_section(self, html: str) -> list[dict[str, Any]]:
        try:
            soup = BeautifulSoup(html, "lxml")
            headings = soup.find_all(["h2", "h3"])
        except Exception as exc:
            self.log(f"Parse error reading Labome headings: {exc}", "WARNING")
            return []

        sections: list[dict[str, Any]] = []
        for heading in headings:
            try:
                cell_type = heading.get_text(" ", strip=True)
                if not cell_type or _is_non_cell_heading(cell_type):
                    continue
                fragments: list[str] = []
                sibling = heading.find_next_sibling()
                while sibling is not None and getattr(sibling, "name", None) not in ("h2", "h3"):
                    fragments.append(str(sibling))
                    sibling = sibling.find_next_sibling()
                section_html = "\n".join(fragments)
                parsed = self._build_cell_type_record(cell_type, section_html)
                if parsed is not None:
                    sections.append(parsed)
            except Exception as exc:
                self.log(f"Skipping Labome cell type section after parse error: {exc}", "WARNING")
        return sections

    def _scrape_page_by_output(self, output_name: str) -> dict[str, Any]:
        page = self._page_by_output(output_name)
        scrape_date = self._scrape_date()
        if page is None:
            self.log(f"Missing Labome page config for {output_name}", "ERROR")
            return _source_output(output_name, scrape_date, "", [])
        html = asyncio.run(self.fetch_page(str(page["url"])))
        cell_types = self.extract_cell_type_section(html) if html else []
        return _source_output(output_name, scrape_date, str(page["url"]), cell_types)

    def _page_by_output(self, output_name: str) -> Optional[dict[str, Any]]:
        for page in self.config.get("sources", {}).get("labome", {}).get("pages", []):
            if isinstance(page, dict) and page.get("output") == output_name:
                return page
        return None

    def _build_cell_type_record(self, cell_type: str, section_html: str) -> Optional[dict[str, Any]]:
        try:
            soup = BeautifulSoup(section_html, "lxml")
            raw_text = soup.get_text(" ", strip=True)
            table_entries = self.parse_marker_table(section_html, cell_type)
            list_entries = _extract_list_entries(soup)
            marker_entries = table_entries or list_entries
            markers = _empty_markers()
            references: list[int] = []
            if marker_entries:
                for entry in marker_entries:
                    species = entry.get("species") or "unknown"
                    polarity = entry.get("polarity") or "positive"
                    marker_values = entry.get("markers", [])
                    _append_markers(markers, species, polarity, marker_values)
                    references.extend(entry.get("references", []))
            else:
                _append_markers(markers, "unknown", "positive", _extract_markers(raw_text))
                references.extend(_extract_references(raw_text))
            return {
                "name": cell_type,
                "markers": markers,
                "aliases": [],
                "references": _dedupe_ints(references),
                "raw_text": raw_text,
            }
        except Exception as exc:
            self.log(f"Skipping {cell_type} after parse error: {exc}", "WARNING")
            return None

    def _scrape_date(self) -> str:
        return datetime.utcnow().strftime(str(self.config.get("output", {}).get("date_format", "%Y%m%d")))


class CellMarker2Scraper(BaseScraper):
    """Scrapes CellMarker 2.0 database."""

    def scrape_all(self) -> dict[str, Any]:
        data = self.download_bulk_data()
        if data.get("cell_types"):
            return data
        html = asyncio.run(self.fetch_page(str(self.config.get("sources", {}).get("cellmarker2", {}).get("url", ""))))
        return self._parse_html_listing(html)

    def search_marker(self, marker: str) -> list[dict[str, Any]]:
        source_config = self.config.get("sources", {}).get("cellmarker2", {})
        search_url = str(source_config.get("search_url", ""))
        if not search_url:
            return []
        html = asyncio.run(self.fetch_page(f"{search_url}?marker={marker}"))
        parsed = self._parse_html_listing(html)
        return parsed.get("cell_types", [])

    def download_bulk_data(self) -> dict[str, Any]:
        source_config = self.config.get("sources", {}).get("cellmarker2", {})
        output_name = str(source_config.get("output", "cellmarker2"))
        scrape_date = self._scrape_date()
        url = str(source_config.get("url", ""))
        html = asyncio.run(self.fetch_page(url)) if url else ""
        return self._parse_html_listing(html, output_name=output_name, url=url, scrape_date=scrape_date)

    def _parse_html_listing(
        self,
        html: str,
        output_name: str = "cellmarker2",
        url: str = "",
        scrape_date: Optional[str] = None,
    ) -> dict[str, Any]:
        cell_types: list[dict[str, Any]] = []
        if not html:
            return _source_output(output_name, scrape_date or self._scrape_date(), url, cell_types)
        try:
            soup = BeautifulSoup(html, "lxml")
            for row in soup.find_all("tr"):
                parsed = _parse_generic_database_row(row.get_text(" ", strip=True))
                if parsed is not None:
                    cell_types.append(parsed)
        except Exception as exc:
            self.log(f"Failed to parse CellMarker 2.0 HTML listing: {exc}", "WARNING")
        return _source_output(output_name, scrape_date or self._scrape_date(), url, cell_types)

    def _scrape_date(self) -> str:
        return datetime.utcnow().strftime(str(self.config.get("output", {}).get("date_format", "%Y%m%d")))


class PanglaoDBScraper(BaseScraper):
    """Scrapes PanglaoDB."""

    def scrape_all(self) -> dict[str, Any]:
        source_config = self.config.get("sources", {}).get("panglaodb", {})
        output_name = str(source_config.get("output", "panglaodb"))
        scrape_date = self._scrape_date()
        api_url = str(source_config.get("api_url", ""))
        cell_types: list[dict[str, Any]] = []
        if api_url:
            api_data = self._fetch_json(api_url)
            cell_types = self._parse_api_payload(api_data)
        if not cell_types:
            html = asyncio.run(self.fetch_page(str(source_config.get("url", ""))))
            cell_types = self._parse_html_listing(html)
        return _source_output(output_name, scrape_date, str(source_config.get("url", "")), cell_types)

    def search_marker(self, marker: str) -> list[dict[str, Any]]:
        source_config = self.config.get("sources", {}).get("panglaodb", {})
        api_url = str(source_config.get("api_url", ""))
        search_url = f"{api_url.rstrip('/')}/markers/{marker}" if api_url else ""
        payload = self._fetch_json(search_url) if search_url else {}
        return self._parse_api_payload(payload)

    def get_cell_type_markers(self, cell_type: str) -> dict[str, Any]:
        source_config = self.config.get("sources", {}).get("panglaodb", {})
        api_url = str(source_config.get("api_url", ""))
        query_url = f"{api_url.rstrip('/')}/celltype/{cell_type}" if api_url else ""
        payload = self._fetch_json(query_url) if query_url else {}
        parsed = self._parse_api_payload(payload)
        return parsed[0] if parsed else {
            "name": cell_type,
            "markers": _empty_markers(),
            "aliases": [],
            "references": [],
            "raw_text": "",
        }

    def _fetch_json(self, url: str) -> dict[str, Any]:
        if not url or not self._can_fetch(url):
            return {}
        self._respect_rate_limit(url)
        for attempt in range(1, self.retry_count + 1):
            try:
                response: Response = self.session.get(url, timeout=self.timeout_seconds)
                self._record_request_time(url)
                response.raise_for_status()
                parsed = response.json()
                return parsed if isinstance(parsed, dict) else {"records": parsed}
            except (RequestException, ValueError, TypeError) as exc:
                self.log(f"Failed JSON fetch {url} on attempt {attempt}: {exc}", "WARNING")
                if attempt < self.retry_count:
                    time.sleep(self.backoff_seconds * (2 ** (attempt - 1)))
        return {}

    def _parse_api_payload(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        records = payload.get("records", payload.get("data", []))
        if isinstance(records, dict):
            records = [records]
        cell_types: list[dict[str, Any]] = []
        if not isinstance(records, list):
            return cell_types
        for record in records:
            try:
                if not isinstance(record, dict):
                    continue
                name = str(record.get("cell_type") or record.get("cellType") or record.get("name") or "").strip()
                if not name:
                    continue
                markers = _empty_markers()
                marker_values = _coerce_marker_list(record.get("markers") or record.get("marker") or record.get("genes"))
                species = _detect_species(str(record.get("species", "")))
                _append_markers(markers, species, "positive", marker_values)
                cell_types.append(
                    {
                        "name": name,
                        "markers": markers,
                        "aliases": _coerce_marker_list(record.get("aliases", [])),
                        "references": _coerce_references(record.get("references", [])),
                        "raw_text": json.dumps(record, ensure_ascii=False),
                    }
                )
            except (TypeError, ValueError) as exc:
                self.log(f"Skipping PanglaoDB record after parse error: {exc}", "WARNING")
        return cell_types

    def _parse_html_listing(self, html: str) -> list[dict[str, Any]]:
        cell_types: list[dict[str, Any]] = []
        if not html:
            return cell_types
        try:
            soup = BeautifulSoup(html, "lxml")
            for row in soup.find_all("tr"):
                parsed = _parse_generic_database_row(row.get_text(" ", strip=True))
                if parsed is not None:
                    cell_types.append(parsed)
        except Exception as exc:
            self.log(f"Failed to parse PanglaoDB HTML listing: {exc}", "WARNING")
        return cell_types

    def _scrape_date(self) -> str:
        return datetime.utcnow().strftime(str(self.config.get("output", {}).get("date_format", "%Y%m%d")))


def run_scrapers(config: dict[str, Any], source: Optional[str], dry_run: bool, force: bool) -> dict[str, Any]:
    """Run selected scrapers and optionally save their outputs."""
    if dry_run:
        selected = source or "all"
        print(f"Dry run: config loaded; would run source={selected}; force={force}")
        return {}

    if not force and not _is_due(config):
        print("No scrape due according to schedule. Use --force to ignore schedule.")
        return {}

    results: dict[str, Any] = {}
    selected_sources = [source] if source else ["labome", "cellmarker2", "panglaodb"]

    if "labome" in selected_sources:
        labome = LabomeScraper(config)
        for output_name, scrape_method in (
            ("labome_cell_markers", labome.scrape_cell_markers),
            ("labome_tb_cell_markers", labome.scrape_tb_cell_markers),
            ("labome_macrophage_markers", labome.scrape_macrophage_markers),
            ("labome_stem_cell_markers", labome.scrape_stem_cell_markers),
        ):
            data = scrape_method()
            results[output_name] = data
            labome.save_output(data, output_name)

    if "cellmarker2" in selected_sources:
        cellmarker = CellMarker2Scraper(config)
        output_name = str(config.get("sources", {}).get("cellmarker2", {}).get("output", "cellmarker2"))
        data = cellmarker.scrape_all()
        results[output_name] = data
        cellmarker.save_output(data, output_name)

    if "panglaodb" in selected_sources:
        panglaodb = PanglaoDBScraper(config)
        output_name = str(config.get("sources", {}).get("panglaodb", {}).get("output", "panglaodb"))
        data = panglaodb.scrape_all()
        results[output_name] = data
        panglaodb.save_output(data, output_name)

    return results


def main() -> None:
    """Run all scrapers based on config."""
    parser = argparse.ArgumentParser(description="Scrape cell marker data sources.")
    parser.add_argument("--source", choices=["labome", "cellmarker2", "panglaodb"], help="Run one source only.")
    parser.add_argument("--dry-run", action="store_true", help="Validate config and show planned run without network or files.")
    parser.add_argument("--force", action="store_true", help="Ignore configured schedule.")
    parser.add_argument("--config", default=DEFAULT_CONFIG_PATH, help="Path to scraper config YAML.")
    args = parser.parse_args()

    try:
        config = load_config(args.config)
        setup_logging(config, dry_run=args.dry_run)
        results = run_scrapers(config, args.source, args.dry_run, args.force)
    except (OSError, ValueError, yaml.YAMLError) as exc:
        logging.error("Scraper failed before run: %s", exc)
        sys.exit(1)

    if not args.dry_run:
        summary = {name: len(data.get("cell_types", [])) for name, data in results.items()}
        print(json.dumps({"outputs": summary}, indent=2))


def _source_output(source: str, scrape_date: str, url: str, cell_types: list[dict[str, Any]]) -> dict[str, Any]:
    return {
        "source": source,
        "scrape_date": scrape_date,
        "url": url,
        "cell_types": cell_types,
    }


def _is_due(config: dict[str, Any]) -> bool:
    next_run = str(config.get("schedule", {}).get("next_run", "")).strip()
    if not next_run:
        return True
    try:
        due_date = datetime.strptime(next_run, "%Y-%m-%d").date()
        return datetime.utcnow().date() >= due_date
    except ValueError as exc:
        logging.warning("Invalid schedule.next_run %s: %s; running scraper", next_run, exc)
        return True


def _looks_like_header(cells: list[str]) -> bool:
    header_text = " ".join(cells).lower()
    return "marker" in header_text and ("species" in header_text or "reference" in header_text)


def _is_non_cell_heading(text: str) -> bool:
    normalized = text.strip().lower()
    ignored = ("references", "products", "protocol", "introduction", "conclusion", "table of contents")
    return any(term in normalized for term in ignored)


def _extract_markers(text: str) -> list[str]:
    candidates = re.findall(r"\b(?:CD\d+[A-Z]?|[A-Z][A-Z0-9-]{1,12}|[A-Z][a-z][a-z0-9-]{1,12})\b", text)
    return _dedupe([candidate.strip(" ,.;:()[]") for candidate in candidates])


def _detect_species(text: str) -> str:
    lowered = text.lower()
    if "mouse" in lowered or "murine" in lowered:
        return "mouse"
    if "human" in lowered or "homo sapiens" in lowered:
        return "human"
    return "unknown"


def _detect_polarity(text: str) -> str:
    lowered = text.lower()
    if "negative" in lowered or "lack of" in lowered or "absence of" in lowered:
        return "negative"
    return "positive"


def _extract_references(text: str) -> list[int]:
    refs = re.findall(r"\[(\d+)\]", text)
    return _dedupe_ints([int(ref) for ref in refs])


def _dedupe_ints(values: list[int]) -> list[int]:
    seen: set[int] = set()
    result: list[int] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result


def _extract_list_entries(soup: BeautifulSoup) -> list[dict[str, Any]]:
    entries: list[dict[str, Any]] = []
    for item in soup.find_all("li"):
        text = item.get_text(" ", strip=True)
        markers = _extract_markers(text)
        if not markers:
            continue
        entries.append(
            {
                "markers": markers,
                "species": _detect_species(text),
                "polarity": _detect_polarity(text),
                "references": _extract_references(text),
                "raw_text": text,
            }
        )
    return entries


def _append_markers(
    markers: dict[str, dict[str, list[str]]],
    species: str,
    polarity: str,
    values: list[str],
) -> None:
    targets = ["human", "mouse"] if species == "unknown" else [species]
    bucket = "negative" if polarity == "negative" else "positive"
    for target in targets:
        if target not in markers:
            continue
        markers[target][bucket] = _dedupe(markers[target][bucket] + values)


def _parse_generic_database_row(text: str) -> Optional[dict[str, Any]]:
    parts = [part.strip() for part in re.split(r"\s{2,}|\t", text) if part.strip()]
    if len(parts) < 2:
        return None
    name = parts[0]
    marker_text = " ".join(parts[1:])
    markers = _empty_markers()
    _append_markers(markers, _detect_species(marker_text), _detect_polarity(marker_text), _extract_markers(marker_text))
    return {
        "name": name,
        "markers": markers,
        "aliases": [],
        "references": _extract_references(marker_text),
        "raw_text": text,
    }


def _coerce_marker_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return _dedupe([str(item) for item in value])
    if isinstance(value, str):
        return _extract_markers(value)
    return []


def _coerce_references(value: Any) -> list[int]:
    if isinstance(value, list):
        refs: list[int] = []
        for item in value:
            try:
                refs.append(int(item))
            except (TypeError, ValueError):
                continue
        return _dedupe_ints(refs)
    if isinstance(value, str):
        return _extract_references(value)
    return []


if __name__ == "__main__":
    main()
