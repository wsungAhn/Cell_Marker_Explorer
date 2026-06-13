# Merge scraped cell-marker outputs into the canonical dataset.

from __future__ import annotations

import argparse
import copy
import json
import logging
import os
import re
import shutil
import sys
from contextlib import contextmanager
from dataclasses import asdict, dataclass, field
from datetime import date, datetime
from pathlib import Path
from typing import Any, Iterator

try:
    import fcntl
except ImportError:  # pragma: no cover - non-Unix fallback.
    fcntl = None  # type: ignore[assignment]

try:
    import yaml
except ImportError:  # pragma: no cover - requirements include PyYAML.
    yaml = None  # type: ignore[assignment]

sys.dont_write_bytecode = True

try:
    from validate import DatasetValidator
except ImportError:  # pragma: no cover - package-style fallback.
    from updater.validate import DatasetValidator  # type: ignore[no-redef]


DEFAULT_DATASET_PATH = "data/cell-markers.json"
DEFAULT_SCRAPED_DIR = "data/scraped"
DEFAULT_CONFIG_PATH = "updater/config.yaml"
DEFAULT_CHANGELOG_PATH = "data/changelog.json"
DEFAULT_REVIEW_QUEUE_PATH = "data/review_queue.json"
DEFAULT_BACKUP_DIR = "data/backups"
LOCK_SUFFIX = ".lock"
FUZZY_DISTANCE_THRESHOLD = 0.3
SCHEDULE_INTERVAL_MONTHS = 6
JSON_INDENT = 2
SOURCE_LABOME_PREFIX = "labome"
CONFLICT_STRATEGIES = {"prefer_labome", "prefer_newest", "prefer_existing", "manual"}
CHANGE_MAJOR = "major"
CHANGE_MINOR = "minor"
CHANGE_PATCH = "patch"
REQUIRED_SPECIES = ("human", "mouse")
REQUIRED_POLARITIES = ("positive", "negative")


@dataclass
class MergeResult:
    cell_types_added: int = 0
    cell_types_modified: int = 0
    cell_types_removed: int = 0
    markers_added: int = 0
    markers_modified: int = 0
    markers_removed: int = 0
    conflicts: list[dict[str, Any]] = field(default_factory=list)
    review_queue: list[dict[str, Any]] = field(default_factory=list)
    details: dict[str, Any] = field(
        default_factory=lambda: {
            "added_cell_types": [],
            "modified_cell_types": [],
            "removed_cell_types": [],
            "sources_scraped": [],
        }
    )


class DatasetMerger:
    def __init__(self, dataset_path: str, scraped_dir: str, config: dict[str, Any]):
        self.dataset_path = dataset_path
        self.scraped_dir = scraped_dir
        self.config = config
        self.dataset: dict[str, Any] = {}
        self.current_version = "0.0.0"
        self.merge_result = MergeResult()
        self.today = date.today()
        self.active_source = ""

    def load_current_dataset(self) -> dict[str, Any]:
        try:
            with open(self.dataset_path, "r", encoding="utf-8") as dataset_file:
                loaded = json.load(dataset_file)
        except OSError as exc:
            logging.error("Failed to read dataset %s: %s", self.dataset_path, exc)
            raise
        except json.JSONDecodeError as exc:
            logging.error("Failed to parse dataset %s: %s", self.dataset_path, exc)
            raise
        if not isinstance(loaded, dict):
            raise ValueError("Dataset root must be a JSON object")
        self.dataset = loaded
        self.current_version = str(self.dataset.get("metadata", {}).get("version", "0.0.0"))
        return self.dataset

    def load_scraped_files(self, since_date: str | None = None) -> list[dict[str, Any]]:
        scraped_path = Path(self.scraped_dir)
        if not scraped_path.exists():
            logging.warning("Scraped directory does not exist: %s", scraped_path)
            return []

        scraped_files = sorted(scraped_path.glob("*.json"))
        loaded_files: list[dict[str, Any]] = []
        for path in scraped_files:
            try:
                with open(path, "r", encoding="utf-8") as scraped_file:
                    data = json.load(scraped_file)
            except OSError as exc:
                logging.error("Failed to read scraped file %s: %s", path, exc)
                continue
            except json.JSONDecodeError as exc:
                logging.error("Failed to parse scraped file %s: %s", path, exc)
                continue
            if not isinstance(data, dict):
                logging.warning("Skipping non-object scraped file: %s", path)
                continue
            if since_date and not self._is_since_date(data.get("scrape_date"), since_date):
                continue
            data["_file_path"] = str(path)
            loaded_files.append(data)
        return loaded_files

    def merge_scraped_data(self, scraped: list[dict[str, Any]]) -> MergeResult:
        if not self.dataset:
            self.load_current_dataset()
        self.merge_result = MergeResult()
        for scraped_file in scraped:
            source = str(scraped_file.get("source") or Path(str(scraped_file.get("_file_path", ""))).stem)
            self.active_source = source
            if source and source not in self.merge_result.details["sources_scraped"]:
                self.merge_result.details["sources_scraped"].append(source)
            cell_types = scraped_file.get("cell_types", [])
            if not isinstance(cell_types, list) or not cell_types:
                logging.warning("Scraped file from %s had no cell_types; skipping", source)
                continue
            for cell_type in cell_types:
                if not isinstance(cell_type, dict):
                    logging.warning("Skipping invalid scraped cell type from %s", source)
                    continue
                existing = self._find_matching_cell_type(cell_type)
                if existing:
                    before = copy.deepcopy(existing["cell_type"])
                    self.merge_cell_type(existing["cell_type"], cell_type)
                    if existing["cell_type"] != before:
                        existing["cell_type"]["last_modified_version"] = self.bump_version(CHANGE_PATCH)
                        self.merge_result.cell_types_modified += 1
                        self.merge_result.details["modified_cell_types"].append(
                            {
                                "id": existing["cell_type"].get("id"),
                                "name": existing["cell_type"].get("name"),
                                "source": source,
                            }
                        )
                else:
                    suggested = self._suggest_placement(cell_type)
                    if self._merge_rules().get("auto_add_new_cell_types", False):
                        added = self.add_new_cell_type(
                            cell_type,
                            suggested["suggested_organ"],
                            suggested["suggested_microstructure"],
                        )
                        if added:
                            self.merge_result.cell_types_added += 1
                            self.merge_result.details["added_cell_types"].append(added)
                    else:
                        queue_item = self.create_review_queue_item(cell_type, source)
                        queue_item.update(suggested)
                        self.merge_result.review_queue.append(queue_item)
        if self._has_dataset_changes(self.merge_result):
            self.update_metadata()
        return self.merge_result

    def merge_cell_type(self, existing: dict[str, Any], new: dict[str, Any]) -> dict[str, Any]:
        existing_markers = self._normalize_markers(existing.get("markers", {}))
        new_markers = self._normalize_markers(new.get("markers", {}))
        existing["markers"] = self.merge_markers(existing_markers, new_markers)
        aliases = self._dedupe([*existing.get("aliases", []), *new.get("aliases", [])])
        existing["aliases"] = aliases
        references = self._dedupe(existing.get("references", []) + new.get("references", []))
        existing["references"] = references
        return existing

    def merge_markers(self, existing_markers: dict[str, Any], new_markers: dict[str, Any]) -> dict[str, Any]:
        for species in REQUIRED_SPECIES:
            for polarity in REQUIRED_POLARITIES:
                opposite = "negative" if polarity == "positive" else "positive"
                existing_values = existing_markers[species][polarity]
                opposite_values = existing_markers[species][opposite]
                for marker in new_markers[species][polarity]:
                    if marker in existing_values:
                        continue
                    fuzzy_existing = self._find_fuzzy_marker(marker, existing_values)
                    if fuzzy_existing:
                        continue
                    if marker in opposite_values:
                        conflict = self.resolve_marker_conflict(
                            marker,
                            {
                                "species": species,
                                "polarity": opposite,
                                "markers": existing_markers,
                            },
                            {
                                "species": species,
                                "polarity": polarity,
                                "markers": new_markers,
                                "source": self.active_source,
                            },
                        )
                        self.merge_result.conflicts.append(conflict)
                        if conflict.get("resolved_to") == "new":
                            opposite_values.remove(marker)
                            existing_values.append(marker)
                            self.merge_result.markers_modified += 1
                        continue
                    if self._merge_rules().get("auto_add_new_markers", True):
                        existing_values.append(marker)
                        self.merge_result.markers_added += 1
        return existing_markers

    def resolve_marker_conflict(self, marker: str, existing: dict[str, Any], new: dict[str, Any]) -> dict[str, Any]:
        strategy = str(self._merge_rules().get("conflict_resolution", "prefer_labome"))
        if strategy not in CONFLICT_STRATEGIES:
            strategy = "prefer_existing"
        new_source = str(new.get("source", ""))
        existing_source = str(existing.get("source", ""))
        resolved_to = "existing"
        status = "logged"
        if strategy == "prefer_labome":
            if new_source.startswith(SOURCE_LABOME_PREFIX) or not existing_source.startswith(SOURCE_LABOME_PREFIX):
                resolved_to = "new"
        elif strategy == "prefer_newest":
            resolved_to = "new"
        elif strategy == "manual":
            status = "pending_review"
            self.merge_result.review_queue.append(
                {
                    "type": "marker_conflict",
                    "marker": marker,
                    "existing": existing,
                    "new": new,
                    "status": "pending_review",
                    "notes": "Marker appears in both positive and negative arrays.",
                }
            )
        return {
            "type": "marker_conflict",
            "marker": marker,
            "strategy": strategy,
            "resolved_to": resolved_to,
            "status": status,
            "existing": existing,
            "new": new,
        }

    def fuzzy_match_marker(self, marker_a: str, marker_b: str) -> float:
        first = self._normalize_marker_for_match(marker_a)
        second = self._normalize_marker_for_match(marker_b)
        if not first and not second:
            return 0.0
        distance = self._levenshtein_distance(first, second)
        return distance / max(len(first), len(second), 1)

    def add_new_cell_type(
        self,
        cell_type: dict[str, Any],
        suggested_organ: str,
        suggested_microstructure: str,
    ) -> dict[str, Any]:
        target = self._find_microstructure(suggested_organ, suggested_microstructure)
        if not target:
            queue_item = self.create_review_queue_item(cell_type, str(cell_type.get("source", "unknown")))
            queue_item["notes"] = "Could not auto-place suggested organ/microstructure."
            self.merge_result.review_queue.append(queue_item)
            return {}

        new_cell_type = {
            "id": self._slugify(str(cell_type.get("id") or cell_type.get("name", "new-cell-type"))),
            "name": str(cell_type.get("name", "")),
            "description": str(cell_type.get("description", "New cell type pending curation.")),
            "markers": self._normalize_markers(cell_type.get("markers", {})),
            "aliases": self._dedupe(cell_type.get("aliases", [])),
            "references": cell_type.get("references", []),
            "source": str(cell_type.get("source", "scraped")),
            "added_in_version": self.bump_version(CHANGE_MINOR),
            "last_modified_version": self.bump_version(CHANGE_MINOR),
        }
        target.setdefault("cell_types", []).append(new_cell_type)
        return {"id": new_cell_type["id"], "name": new_cell_type["name"]}

    def create_review_queue_item(self, cell_type: dict[str, Any], source: str) -> dict[str, Any]:
        return {
            "type": "new_cell_type",
            "source": source,
            "name": str(cell_type.get("name", "")),
            "suggested_organ": str(cell_type.get("suggested_organ", "")),
            "suggested_microstructure": str(cell_type.get("suggested_microstructure", "")),
            "markers": self._normalize_markers(cell_type.get("markers", {})),
            "status": "pending_review",
            "notes": "Auto-matched candidate requires curator approval.",
        }

    def bump_version(self, change_type: str) -> str:
        version = self.current_version or str(self.dataset.get("metadata", {}).get("version", "0.0.0"))
        major, minor, patch = self._parse_semver(version)
        if change_type == CHANGE_MAJOR:
            return f"{major + 1}.0.0"
        if change_type == CHANGE_MINOR:
            return f"{major}.{minor + 1}.0"
        return f"{major}.{minor}.{patch + 1}"

    def update_metadata(self) -> None:
        metadata = self.dataset.setdefault("metadata", {})
        change_type = CHANGE_PATCH
        if self.merge_result.cell_types_added:
            change_type = CHANGE_MINOR
        new_version = self.bump_version(change_type)
        today_iso = self.today.isoformat()
        metadata["version"] = new_version
        metadata["last_updated"] = today_iso
        metadata["next_scheduled_update"] = self._add_months(self.today, self._schedule_interval_months()).isoformat()
        for source in metadata.get("sources", []):
            if isinstance(source, dict):
                source["last_scraped"] = today_iso

    def generate_changelog_entry(self, merge_result: MergeResult) -> dict[str, Any]:
        version = str(self.dataset.get("metadata", {}).get("version", self.current_version))
        description = (
            f"Added {merge_result.markers_added} marker(s), modified "
            f"{merge_result.cell_types_modified} cell type(s), queued "
            f"{len(merge_result.review_queue)} review item(s)."
        )
        return {
            "version": version,
            "date": self.today.isoformat(),
            "description": description,
            "sources_scraped": merge_result.details.get("sources_scraped", []),
            "changes": {
                "cell_types_added": merge_result.cell_types_added,
                "cell_types_modified": merge_result.cell_types_modified,
                "cell_types_removed": merge_result.cell_types_removed,
                "markers_added": merge_result.markers_added,
                "markers_modified": merge_result.markers_modified,
                "markers_removed": merge_result.markers_removed,
            },
            "details": {
                "added_cell_types": merge_result.details.get("added_cell_types", []),
                "modified_cell_types": merge_result.details.get("modified_cell_types", []),
                "removed_cell_types": merge_result.details.get("removed_cell_types", []),
                "conflicts": merge_result.conflicts,
                "review_queue_count": len(merge_result.review_queue),
            },
        }

    def save_changelog(self, entry: dict[str, Any]) -> None:
        changelog_path = self._changelog_path()
        changelog = {"updates": []}
        if os.path.exists(changelog_path):
            try:
                with open(changelog_path, "r", encoding="utf-8") as changelog_file:
                    loaded = json.load(changelog_file)
            except OSError as exc:
                logging.error("Failed to read changelog %s: %s", changelog_path, exc)
                raise
            except json.JSONDecodeError as exc:
                logging.error("Failed to parse changelog %s: %s", changelog_path, exc)
                raise
            if isinstance(loaded, dict) and isinstance(loaded.get("updates"), list):
                changelog = loaded
            else:
                raise ValueError("Changelog must have shape {'updates': [...]}")
        changelog["updates"].insert(0, entry)
        try:
            with open(changelog_path, "w", encoding="utf-8") as changelog_file:
                json.dump(changelog, changelog_file, indent=JSON_INDENT, ensure_ascii=False)
                changelog_file.write("\n")
        except (OSError, TypeError, ValueError) as exc:
            logging.error("Failed to write changelog %s: %s", changelog_path, exc)
            raise

    def save_dataset(self) -> None:
        self._backup_file(self.dataset_path)
        try:
            with open(self.dataset_path, "w", encoding="utf-8") as dataset_file:
                json.dump(self.dataset, dataset_file, indent=JSON_INDENT, ensure_ascii=False)
                dataset_file.write("\n")
        except (OSError, TypeError, ValueError) as exc:
            logging.error("Failed to write dataset %s: %s", self.dataset_path, exc)
            raise

    def save_review_queue(self, items: list[dict[str, Any]]) -> None:
        if not items:
            return
        path = self._review_queue_path()
        queue = {"items": []}
        if os.path.exists(path):
            try:
                with open(path, "r", encoding="utf-8") as queue_file:
                    loaded = json.load(queue_file)
            except OSError as exc:
                logging.error("Failed to read review queue %s: %s", path, exc)
                raise
            except json.JSONDecodeError as exc:
                logging.error("Failed to parse review queue %s: %s", path, exc)
                raise
            if isinstance(loaded, dict) and isinstance(loaded.get("items"), list):
                queue = loaded
        queue["items"].extend(items)
        try:
            with open(path, "w", encoding="utf-8") as queue_file:
                json.dump(queue, queue_file, indent=JSON_INDENT, ensure_ascii=False)
                queue_file.write("\n")
        except (OSError, TypeError, ValueError) as exc:
            logging.error("Failed to write review queue %s: %s", path, exc)
            raise

    def validate_dataset(self) -> list[str]:
        result = DatasetValidator().validate(self.dataset)
        for warning in result.warnings:
            logging.warning("Validation warning: %s", warning)
        return result.errors

    def _find_matching_cell_type(self, new_cell_type: dict[str, Any]) -> dict[str, Any] | None:
        new_name = str(new_cell_type.get("name", "")).strip()
        if not new_name:
            return None
        lowered = new_name.casefold()
        candidates = self._iter_cell_types()
        for candidate in candidates:
            if str(candidate["cell_type"].get("name", "")).casefold() == lowered:
                return candidate
        for candidate in candidates:
            aliases = candidate["cell_type"].get("aliases", [])
            if isinstance(aliases, list) and lowered in {str(alias).casefold() for alias in aliases}:
                return candidate
        best_match: dict[str, Any] | None = None
        best_score = 1.0
        for candidate in candidates:
            score = self.fuzzy_match_marker(new_name, str(candidate["cell_type"].get("name", "")))
            if score < best_score:
                best_score = score
                best_match = candidate
        if best_match and best_score < FUZZY_DISTANCE_THRESHOLD:
            return best_match
        return None

    def _iter_cell_types(self) -> list[dict[str, Any]]:
        matches: list[dict[str, Any]] = []
        for system in self.dataset.get("tissue_systems", []):
            if not isinstance(system, dict):
                continue
            for organ in system.get("organs", []):
                if not isinstance(organ, dict):
                    continue
                for microstructure in organ.get("microstructures", []):
                    if not isinstance(microstructure, dict):
                        continue
                    for cell_type in microstructure.get("cell_types", []):
                        if isinstance(cell_type, dict):
                            matches.append(
                                {
                                    "system": system,
                                    "organ": organ,
                                    "microstructure": microstructure,
                                    "cell_type": cell_type,
                                }
                            )
        return matches

    def _find_microstructure(self, organ_id: str, microstructure_id: str) -> dict[str, Any] | None:
        for match in self._iter_microstructures():
            if match["organ"].get("id") == organ_id and match["microstructure"].get("id") == microstructure_id:
                return match["microstructure"]
        return None

    def _iter_microstructures(self) -> list[dict[str, Any]]:
        matches: list[dict[str, Any]] = []
        for system in self.dataset.get("tissue_systems", []):
            if not isinstance(system, dict):
                continue
            for organ in system.get("organs", []):
                if not isinstance(organ, dict):
                    continue
                for microstructure in organ.get("microstructures", []):
                    if isinstance(microstructure, dict):
                        matches.append({"system": system, "organ": organ, "microstructure": microstructure})
        return matches

    def _suggest_placement(self, cell_type: dict[str, Any]) -> dict[str, str]:
        suggested_organ = str(cell_type.get("suggested_organ", ""))
        suggested_microstructure = str(cell_type.get("suggested_microstructure", ""))
        if suggested_organ and suggested_microstructure:
            return {"suggested_organ": suggested_organ, "suggested_microstructure": suggested_microstructure}
        first = next(iter(self._iter_microstructures()), None)
        if not first:
            return {"suggested_organ": "", "suggested_microstructure": ""}
        return {
            "suggested_organ": str(first["organ"].get("id", "")),
            "suggested_microstructure": str(first["microstructure"].get("id", "")),
        }

    def _find_fuzzy_marker(self, marker: str, candidates: list[str]) -> str | None:
        for candidate in candidates:
            if self.fuzzy_match_marker(marker, candidate) < FUZZY_DISTANCE_THRESHOLD:
                return candidate
        return None

    def _normalize_markers(self, markers: Any) -> dict[str, dict[str, list[str]]]:
        normalized: dict[str, dict[str, list[str]]] = {
            "human": {"positive": [], "negative": []},
            "mouse": {"positive": [], "negative": []},
        }
        if not isinstance(markers, dict):
            return normalized
        for species in REQUIRED_SPECIES:
            species_markers = markers.get(species, {})
            if not isinstance(species_markers, dict):
                continue
            for polarity in REQUIRED_POLARITIES:
                values = species_markers.get(polarity, [])
                if isinstance(values, list):
                    normalized[species][polarity] = self._dedupe([str(value).strip() for value in values if str(value).strip()])
        return normalized

    def _dedupe(self, values: list[Any]) -> list[Any]:
        seen: set[str] = set()
        deduped: list[Any] = []
        for value in values:
            key = str(value)
            if key in seen:
                continue
            seen.add(key)
            deduped.append(value)
        return deduped

    def _normalize_marker_for_match(self, value: str) -> str:
        return re.sub(r"[^a-z0-9]", "", value.casefold())

    def _levenshtein_distance(self, first: str, second: str) -> int:
        if first == second:
            return 0
        if not first:
            return len(second)
        if not second:
            return len(first)
        previous = list(range(len(second) + 1))
        for row_index, first_char in enumerate(first, start=1):
            current = [row_index]
            for col_index, second_char in enumerate(second, start=1):
                insert_cost = current[col_index - 1] + 1
                delete_cost = previous[col_index] + 1
                replace_cost = previous[col_index - 1] + (first_char != second_char)
                current.append(min(insert_cost, delete_cost, replace_cost))
            previous = current
        return previous[-1]

    def _slugify(self, value: str) -> str:
        slug = re.sub(r"[^a-z0-9]+", "-", value.casefold()).strip("-")
        return slug or "new-cell-type"

    def _parse_semver(self, version: str) -> tuple[int, int, int]:
        parts = version.split(".")
        if len(parts) != 3:
            return (0, 0, 0)
        try:
            return int(parts[0]), int(parts[1]), int(parts[2])
        except ValueError:
            return (0, 0, 0)

    def _add_months(self, base_date: date, months: int) -> date:
        month = base_date.month - 1 + months
        year = base_date.year + month // 12
        month = month % 12 + 1
        day = min(base_date.day, self._days_in_month(year, month))
        return date(year, month, day)

    def _days_in_month(self, year: int, month: int) -> int:
        if month == 12:
            next_month = date(year + 1, 1, 1)
        else:
            next_month = date(year, month + 1, 1)
        return (next_month - date(year, month, 1)).days

    def _schedule_interval_months(self) -> int:
        schedule = self.config.get("schedule", {})
        if isinstance(schedule, dict):
            try:
                return int(schedule.get("interval_months", SCHEDULE_INTERVAL_MONTHS))
            except (TypeError, ValueError):
                return SCHEDULE_INTERVAL_MONTHS
        return SCHEDULE_INTERVAL_MONTHS

    def _is_since_date(self, scrape_date: Any, since_date: str) -> bool:
        if not scrape_date:
            return True
        try:
            scrape_text = str(scrape_date)
            if len(scrape_text) == 8:
                parsed = datetime.strptime(scrape_text, "%Y%m%d").date()
            else:
                parsed = datetime.strptime(scrape_text[:10], "%Y-%m-%d").date()
            cutoff = datetime.strptime(since_date[:10], "%Y-%m-%d").date()
        except ValueError:
            return True
        return parsed >= cutoff

    def _has_dataset_changes(self, result: MergeResult) -> bool:
        return bool(
            result.cell_types_added
            or result.cell_types_modified
            or result.cell_types_removed
            or result.markers_added
            or result.markers_modified
            or result.markers_removed
        )

    def _merge_rules(self) -> dict[str, Any]:
        rules = self.config.get("merge_rules", {})
        return rules if isinstance(rules, dict) else {}

    def _changelog_path(self) -> str:
        return str(self.config.get("changelog_path", DEFAULT_CHANGELOG_PATH))

    def _review_queue_path(self) -> str:
        return str(self.config.get("review_queue_path", DEFAULT_REVIEW_QUEUE_PATH))

    def _backup_file(self, path: str) -> str:
        source = Path(path)
        backup_dir = Path(str(self.config.get("backup_dir", DEFAULT_BACKUP_DIR)))
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S")
        backup_path = backup_dir / f"{source.name}.{timestamp}.bak"
        try:
            backup_dir.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source, backup_path)
        except OSError as exc:
            logging.error("Failed to create backup %s: %s", backup_path, exc)
            raise
        return str(backup_path)


def load_config(path: str) -> dict[str, Any]:
    if not os.path.exists(path):
        logging.warning("Config file not found: %s; using defaults", path)
        return {}
    try:
        with open(path, "r", encoding="utf-8") as config_file:
            if yaml is None:
                logging.warning("PyYAML is unavailable; config defaults will be used")
                return {}
            loaded = yaml.safe_load(config_file)
    except OSError as exc:
        logging.error("Failed to read config %s: %s", path, exc)
        raise
    except Exception as exc:
        logging.error("Failed to parse YAML config %s: %s", path, exc)
        raise
    if not isinstance(loaded, dict):
        return {}
    return loaded


@contextmanager
def file_lock(dataset_path: str, dry_run: bool = False) -> Iterator[None]:
    if dry_run:
        yield
        return
    lock_path = f"{dataset_path}{LOCK_SUFFIX}"
    lock_file = None
    try:
        lock_file = open(lock_path, "w", encoding="utf-8")
        if fcntl is not None:
            fcntl.flock(lock_file.fileno(), fcntl.LOCK_EX)
        yield
    except OSError as exc:
        logging.error("Failed to acquire file lock %s: %s", lock_path, exc)
        raise
    finally:
        if lock_file is not None:
            try:
                if fcntl is not None:
                    fcntl.flock(lock_file.fileno(), fcntl.LOCK_UN)
                lock_file.close()
            except OSError as exc:
                logging.error("Failed to release file lock %s: %s", lock_path, exc)


def read_review_queue(path: str) -> dict[str, Any]:
    if not os.path.exists(path):
        return {"items": []}
    try:
        with open(path, "r", encoding="utf-8") as queue_file:
            loaded = json.load(queue_file)
    except OSError as exc:
        logging.error("Failed to read review queue %s: %s", path, exc)
        raise
    except json.JSONDecodeError as exc:
        logging.error("Failed to parse review queue %s: %s", path, exc)
        raise
    if isinstance(loaded, dict) and isinstance(loaded.get("items"), list):
        return loaded
    raise ValueError("Review queue must have shape {'items': [...]}")


def write_review_queue(path: str, queue: dict[str, Any]) -> None:
    try:
        with open(path, "w", encoding="utf-8") as queue_file:
            json.dump(queue, queue_file, indent=JSON_INDENT, ensure_ascii=False)
            queue_file.write("\n")
    except (OSError, TypeError, ValueError) as exc:
        logging.error("Failed to write review queue %s: %s", path, exc)
        raise


def update_review_item(path: str, item_id: str, status: str) -> bool:
    queue = read_review_queue(path)
    for item in queue.get("items", []):
        if not isinstance(item, dict):
            continue
        candidates = {str(item.get("id", "")), str(item.get("name", "")), str(item.get("item_id", ""))}
        if item_id in candidates:
            item["status"] = status
            write_review_queue(path, queue)
            return True
    return False


def print_review_queue(path: str) -> None:
    queue = read_review_queue(path)
    items = queue.get("items", [])
    print(json.dumps({"items": items}, indent=JSON_INDENT, ensure_ascii=False))


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Merge scraped cell-marker data into the canonical dataset.")
    parser.add_argument("--dataset", default=DEFAULT_DATASET_PATH, help="Current dataset JSON path.")
    parser.add_argument("--scraped-dir", default=DEFAULT_SCRAPED_DIR, help="Directory containing scraped JSON files.")
    parser.add_argument("--scraped", action="append", default=[], help="Specific scraped JSON file to merge.")
    parser.add_argument("--config", default=DEFAULT_CONFIG_PATH, help="Updater YAML config path.")
    parser.add_argument("--dry-run", action="store_true", help="Run merge and validation without writing files.")
    parser.add_argument("--review-queue", action="store_true", help="Print current review queue and exit.")
    parser.add_argument("--approve-item", help="Mark a review queue item approved.")
    parser.add_argument("--reject-item", help="Mark a review queue item rejected.")
    return parser


def load_specific_scraped(paths: list[str]) -> list[dict[str, Any]]:
    scraped: list[dict[str, Any]] = []
    for path in paths:
        try:
            with open(path, "r", encoding="utf-8") as scraped_file:
                loaded = json.load(scraped_file)
        except OSError as exc:
            logging.error("Failed to read scraped file %s: %s", path, exc)
            raise
        except json.JSONDecodeError as exc:
            logging.error("Failed to parse scraped file %s: %s", path, exc)
            raise
        if not isinstance(loaded, dict):
            raise ValueError(f"Scraped file {path} must contain a JSON object")
        loaded["_file_path"] = path
        scraped.append(loaded)
    return scraped


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")
    args = build_parser().parse_args(argv)
    try:
        config = load_config(args.config)
    except Exception:
        return 2

    review_queue_path = str(config.get("review_queue_path", DEFAULT_REVIEW_QUEUE_PATH))
    if args.review_queue:
        try:
            print_review_queue(review_queue_path)
        except (OSError, ValueError, json.JSONDecodeError):
            return 2
        return 0
    if args.approve_item:
        try:
            return 0 if update_review_item(review_queue_path, args.approve_item, "approved") else 1
        except (OSError, ValueError, json.JSONDecodeError):
            return 2
    if args.reject_item:
        try:
            return 0 if update_review_item(review_queue_path, args.reject_item, "rejected") else 1
        except (OSError, ValueError, json.JSONDecodeError):
            return 2

    merger = DatasetMerger(args.dataset, args.scraped_dir, config)
    try:
        with file_lock(args.dataset, dry_run=args.dry_run):
            merger.load_current_dataset()
            scraped = load_specific_scraped(args.scraped) if args.scraped else merger.load_scraped_files()
            result = merger.merge_scraped_data(scraped)
            errors = merger.validate_dataset()
            if errors:
                for error in errors:
                    logging.error("Validation error: %s", error)
                return 1
            changelog_entry = merger.generate_changelog_entry(result)
            print(json.dumps({"dry_run": args.dry_run, "result": asdict(result)}, indent=JSON_INDENT, ensure_ascii=False))
            if args.dry_run:
                return 0
            if merger._has_dataset_changes(result):
                merger.save_dataset()
                merger.save_changelog(changelog_entry)
            merger.save_review_queue(result.review_queue)
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        logging.error("Merge failed: %s", exc)
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
