# Validate Cell Markers Explorer dataset structure and marker hygiene.

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Iterable
from urllib.parse import urlparse


DEFAULT_DATASET_PATH = "data/cell-markers.json"
SEMVER_RE = re.compile(r"^\d+\.\d+\.\d+$")
ISO_DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
HEX_COLOR_RE = re.compile(r"^#[0-9A-Fa-f]{6}$")
ID_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
HUMAN_MARKER_RE = re.compile(r"^[A-Z0-9][A-Z0-9./+-]*$")
MOUSE_MARKER_RE = re.compile(r"^(?:CD\d+[A-Za-z]?|[A-Z][A-Za-z0-9./+-]*)$")
REQUIRED_SPECIES = ("human", "mouse")
REQUIRED_POLARITIES = ("positive", "negative")


@dataclass
class ValidationResult:
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    info: list[str] = field(default_factory=list)

    @property
    def is_valid(self) -> bool:
        return not self.errors

    def extend(self, other: "ValidationResult") -> None:
        self.errors.extend(other.errors)
        self.warnings.extend(other.warnings)
        self.info.extend(other.info)


class DatasetValidator:
    def __init__(self, schema_path: str | None = None):
        self.schema_path = schema_path

    def validate(self, dataset: dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        if not isinstance(dataset, dict):
            result.errors.append("Dataset root must be a JSON object")
            return result

        metadata = dataset.get("metadata")
        tissue_systems = dataset.get("tissue_systems")
        if metadata is None:
            result.errors.append("Missing required top-level field: metadata")
        elif not isinstance(metadata, dict):
            result.errors.append("metadata must be an object")
        else:
            result.extend(self.validate_metadata(metadata))

        if tissue_systems is None:
            result.errors.append("Missing required top-level field: tissue_systems")
        elif not isinstance(tissue_systems, list):
            result.errors.append("tissue_systems must be an array")
        else:
            result.extend(self.validate_tissue_systems(tissue_systems))

        result.extend(self.check_referential_integrity(dataset))
        return result

    def validate_metadata(self, metadata: dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        for key in ("version", "last_updated", "next_scheduled_update", "sources"):
            if key not in metadata:
                result.errors.append(f"metadata missing required field: {key}")

        version = metadata.get("version")
        if not isinstance(version, str) or not SEMVER_RE.match(version):
            result.errors.append("metadata.version must follow semver MAJOR.MINOR.PATCH")

        self._validate_date_field(result, metadata.get("last_updated"), "metadata.last_updated", required=True)
        self._validate_date_field(
            result,
            metadata.get("next_scheduled_update"),
            "metadata.next_scheduled_update",
            required=False,
        )

        sources = metadata.get("sources")
        if not isinstance(sources, list) or not sources:
            result.errors.append("metadata.sources must be a non-empty array")
            return result

        for index, source in enumerate(sources):
            path = f"metadata.sources[{index}]"
            if not isinstance(source, dict):
                result.errors.append(f"{path} must be an object")
                continue
            for key in ("title", "url"):
                if not source.get(key):
                    result.errors.append(f"{path} missing required field: {key}")
            url = source.get("url")
            if isinstance(url, str) and not self._is_url(url):
                result.errors.append(f"{path}.url is not a valid URL: {url}")
            self._validate_date_field(result, source.get("last_scraped"), f"{path}.last_scraped", required=False)
        return result

    def validate_tissue_systems(self, tissue_systems: list[Any]) -> ValidationResult:
        result = ValidationResult()
        result.errors.extend(self.check_id_uniqueness(tissue_systems, "id", "tissue_systems"))
        for index, system in enumerate(tissue_systems):
            path = f"tissue_systems[{index}]"
            if not isinstance(system, dict):
                result.errors.append(f"{path} must be an object")
                continue
            self._require_fields(
                result,
                system,
                ("id", "name", "body_map_region", "color", "description", "organs"),
                path,
            )
            self._validate_id(result, system.get("id"), f"{path}.id")
            color = system.get("color")
            if not isinstance(color, str) or not HEX_COLOR_RE.match(color):
                result.errors.append(f"{path}.color must be a 6-digit hex color")
            organs = system.get("organs")
            if isinstance(organs, list):
                result.extend(self.validate_organs(organs, path))
            else:
                result.errors.append(f"{path}.organs must be an array")
        return result

    def validate_organs(self, organs: list[Any], parent_path: str = "organs") -> ValidationResult:
        result = ValidationResult()
        result.errors.extend(self.check_id_uniqueness(organs, "id", f"{parent_path}.organs"))
        for index, organ in enumerate(organs):
            path = f"{parent_path}.organs[{index}]"
            if not isinstance(organ, dict):
                result.errors.append(f"{path} must be an object")
                continue
            self._require_fields(
                result,
                organ,
                ("id", "name", "icon", "microanatomy_svg", "description", "microstructures"),
                path,
            )
            self._validate_id(result, organ.get("id"), f"{path}.id")
            microstructures = organ.get("microstructures")
            if isinstance(microstructures, list):
                result.extend(self.validate_microstructures(microstructures, path))
            else:
                result.errors.append(f"{path}.microstructures must be an array")
        return result

    def validate_microstructures(self, microstructures: list[Any], parent_path: str) -> ValidationResult:
        result = ValidationResult()
        result.errors.extend(self.check_id_uniqueness(microstructures, "id", f"{parent_path}.microstructures"))
        for index, microstructure in enumerate(microstructures):
            path = f"{parent_path}.microstructures[{index}]"
            if not isinstance(microstructure, dict):
                result.errors.append(f"{path} must be an object")
                continue
            self._require_fields(
                result,
                microstructure,
                ("id", "name", "description", "cell_types"),
                path,
            )
            self._validate_id(result, microstructure.get("id"), f"{path}.id")
            cell_types = microstructure.get("cell_types")
            if isinstance(cell_types, list):
                result.extend(self.validate_cell_types(cell_types, path))
            else:
                result.errors.append(f"{path}.cell_types must be an array")
        return result

    def validate_cell_types(self, cell_types: list[Any], parent_path: str = "cell_types") -> ValidationResult:
        result = ValidationResult()
        result.errors.extend(self.check_id_uniqueness(cell_types, "id", f"{parent_path}.cell_types"))
        for index, cell_type in enumerate(cell_types):
            path = f"{parent_path}.cell_types[{index}]"
            if not isinstance(cell_type, dict):
                result.errors.append(f"{path} must be an object")
                continue
            self._require_fields(
                result,
                cell_type,
                (
                    "id",
                    "name",
                    "description",
                    "markers",
                    "aliases",
                    "references",
                    "source",
                    "added_in_version",
                    "last_modified_version",
                ),
                path,
            )
            self._validate_id(result, cell_type.get("id"), f"{path}.id")
            for key in ("added_in_version", "last_modified_version"):
                value = cell_type.get(key)
                if not isinstance(value, str) or not SEMVER_RE.match(value):
                    result.errors.append(f"{path}.{key} must follow semver MAJOR.MINOR.PATCH")
            if not isinstance(cell_type.get("aliases"), list):
                result.errors.append(f"{path}.aliases must be an array")
            if not isinstance(cell_type.get("references"), list):
                result.errors.append(f"{path}.references must be an array")
            markers = cell_type.get("markers")
            if isinstance(markers, dict):
                marker_result = self.validate_markers(markers, path)
                result.extend(marker_result)
            else:
                result.errors.append(f"{path}.markers must be an object")
        return result

    def validate_markers(self, markers: dict[str, Any], parent_path: str = "markers") -> ValidationResult:
        result = ValidationResult()
        total_positive = 0
        for species in REQUIRED_SPECIES:
            species_markers = markers.get(species)
            species_path = f"{parent_path}.markers.{species}"
            if not isinstance(species_markers, dict):
                result.errors.append(f"{species_path} must be an object")
                continue
            for polarity in REQUIRED_POLARITIES:
                array_path = f"{species_path}.{polarity}"
                values = species_markers.get(polarity)
                if not isinstance(values, list):
                    result.errors.append(f"{array_path} must be an array")
                    continue
                duplicates = self._duplicates(values)
                for duplicate in duplicates:
                    result.errors.append(f"{array_path} has duplicate marker: {duplicate}")
                if polarity == "positive":
                    total_positive += len([value for value in values if isinstance(value, str) and value.strip()])
                self._warn_marker_nomenclature(result, species, values, array_path)
        if total_positive == 0:
            result.errors.append(f"{parent_path} must have at least one positive marker in human or mouse")
        return result

    def check_id_uniqueness(self, items: list[Any], key: str, path: str = "items") -> list[str]:
        errors: list[str] = []
        seen: set[str] = set()
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            value = item.get(key)
            if not isinstance(value, str):
                errors.append(f"{path}[{index}].{key} must be a string")
                continue
            if value in seen:
                errors.append(f"{path} contains duplicate {key}: {value}")
            seen.add(value)
        return errors

    def check_referential_integrity(self, dataset: dict[str, Any]) -> ValidationResult:
        result = ValidationResult()
        tissue_systems = dataset.get("tissue_systems")
        if not isinstance(tissue_systems, list):
            return result

        body_regions: set[str] = set()
        micro_svg_regions: set[tuple[str, str]] = set()
        for system in self._dict_items(tissue_systems):
            region = system.get("body_map_region")
            if isinstance(region, str):
                if region in body_regions:
                    result.warnings.append(f"body_map_region reused by multiple systems: {region}")
                body_regions.add(region)
            for organ in self._dict_items(system.get("organs", [])):
                organ_id = organ.get("id", "<unknown-organ>")
                for microstructure in self._dict_items(organ.get("microstructures", [])):
                    micro_id = microstructure.get("id")
                    if isinstance(micro_id, str):
                        key = (str(organ_id), micro_id)
                        if key in micro_svg_regions:
                            result.errors.append(
                                f"Organ {organ_id} has duplicate microstructure id: {micro_id}"
                            )
                        micro_svg_regions.add(key)
        result.info.append(
            f"Checked {len(body_regions)} body_map_region values and {len(micro_svg_regions)} microstructure IDs"
        )
        return result

    def _require_fields(
        self,
        result: ValidationResult,
        item: dict[str, Any],
        required_fields: Iterable[str],
        path: str,
    ) -> None:
        for field_name in required_fields:
            if field_name not in item:
                result.errors.append(f"{path} missing required field: {field_name}")

    def _validate_id(self, result: ValidationResult, value: Any, path: str) -> None:
        if not isinstance(value, str) or not ID_RE.match(value):
            result.errors.append(f"{path} must be lowercase hyphenated")

    def _validate_date_field(self, result: ValidationResult, value: Any, path: str, required: bool) -> None:
        if value is None:
            if required:
                result.errors.append(f"{path} is required")
            return
        if not isinstance(value, str) or not ISO_DATE_RE.match(value):
            result.errors.append(f"{path} must be ISO date YYYY-MM-DD or null")

    def _warn_marker_nomenclature(
        self,
        result: ValidationResult,
        species: str,
        values: list[Any],
        path: str,
    ) -> None:
        pattern = HUMAN_MARKER_RE if species == "human" else MOUSE_MARKER_RE
        for value in values:
            if not isinstance(value, str) or not value.strip():
                result.errors.append(f"{path} contains a non-empty string violation")
                continue
            if not pattern.match(value):
                result.warnings.append(f"{path} marker may violate {species} nomenclature: {value}")

    def _duplicates(self, values: list[Any]) -> list[str]:
        seen: set[str] = set()
        duplicates: list[str] = []
        for value in values:
            if not isinstance(value, str):
                continue
            if value in seen and value not in duplicates:
                duplicates.append(value)
            seen.add(value)
        return duplicates

    def _dict_items(self, values: Any) -> list[dict[str, Any]]:
        if not isinstance(values, list):
            return []
        return [value for value in values if isinstance(value, dict)]

    def _is_url(self, value: str) -> bool:
        try:
            parsed = urlparse(value)
        except ValueError:
            return False
        return parsed.scheme in {"http", "https"} and bool(parsed.netloc)


def load_json_file(path: str) -> dict[str, Any]:
    try:
        with open(path, "r", encoding="utf-8") as dataset_file:
            loaded = json.load(dataset_file)
    except OSError as exc:
        logging.error("Failed to read JSON file %s: %s", path, exc)
        raise
    except json.JSONDecodeError as exc:
        logging.error("Failed to parse JSON file %s: %s", path, exc)
        raise

    if not isinstance(loaded, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return loaded


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Validate Cell Markers Explorer dataset JSON.")
    parser.add_argument("--file", default=DEFAULT_DATASET_PATH, help="Dataset JSON file to validate.")
    return parser


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")
    args = build_parser().parse_args(argv)
    try:
        dataset = load_json_file(args.file)
    except (OSError, ValueError, json.JSONDecodeError):
        return 2

    validator = DatasetValidator()
    result = validator.validate(dataset)
    for message in result.errors:
        print(f"ERROR: {message}")
    for message in result.warnings:
        print(f"WARNING: {message}")
    for message in result.info:
        print(f"INFO: {message}")

    if result.is_valid:
        print(f"VALID: {Path(args.file)} has no validation errors")
        return 0
    print(f"INVALID: {Path(args.file)} has {len(result.errors)} validation error(s)")
    return 1


if __name__ == "__main__":
    sys.exit(main())
