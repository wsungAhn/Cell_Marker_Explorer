"""Normalize marker nomenclature and expression qualifiers in cell-markers.json."""

from __future__ import annotations

import argparse
import json
import logging
import re
import sys
from pathlib import Path
from typing import Any, Literal, NamedTuple


Species = Literal["human", "mouse"]
Polarity = Literal["positive", "negative"]
ExpressionLevel = Literal["high", "low", "positive", "negative"]

DEFAULT_INPUT = Path("data/cell-markers.json")
DEFAULT_OUTPUT = Path("data/cell-markers.normalized.json")
SPECIES: tuple[Species, ...] = ("human", "mouse")
POLARITIES: tuple[Polarity, ...] = ("positive", "negative")


class Replacement(NamedTuple):
    normalized: str
    target: Polarity
    expression_level: ExpressionLevel | None = None


class Summary(NamedTuple):
    normalized: int
    moved: int
    expression_levels: int


EXACT_REPLACEMENTS: dict[Species, dict[str, Replacement]] = {
    "human": {
        "CD14++": Replacement("CD14", "positive", "high"),
        "CD16-": Replacement("CD16", "negative", "negative"),
        "CD16++": Replacement("CD16", "positive", "high"),
        "CD3-": Replacement("CD3", "negative", "negative"),
        "CD8+": Replacement("CD8", "positive", "positive"),
        "CD11b-": Replacement("CD11b", "negative", "negative"),
        "CD20-": Replacement("CD20", "negative", "negative"),
        "CD23-": Replacement("CD23", "negative", "negative"),
        "CD24-": Replacement("CD24", "negative", "negative"),
        "CD27+": Replacement("CD27", "positive", "positive"),
        "CD27-": Replacement("CD27", "negative", "negative"),
        "CD45RA-": Replacement("CD45RA", "negative", "negative"),
        "CD138-": Replacement("CD138", "negative", "negative"),
        "CCR7-": Replacement("CCR7", "negative", "negative"),
        "IgA+": Replacement("IgA", "positive", "positive"),
        "IgD+": Replacement("IgD", "positive", "positive"),
        "IgD-": Replacement("IgD", "negative", "negative"),
        "IgG+": Replacement("IgG", "positive", "positive"),
        "IgM+": Replacement("IgM", "positive", "positive"),
        "IgM-": Replacement("IgM", "negative", "negative"),
        "Lin-": Replacement("Lin", "negative", "negative"),
        "SIRPa+": Replacement("SIRPA", "positive", "positive"),
        "SIRPa-": Replacement("SIRPA", "negative", "negative"),
        "CD38low": Replacement("CD38", "positive", "low"),
    },
    "mouse": {
        "Ccr7-": Replacement("Ccr7", "negative", "negative"),
        "Cd11b-": Replacement("Cd11b", "negative", "negative"),
        "Cd138-": Replacement("Cd138", "negative", "negative"),
        "Cd16-": Replacement("Cd16", "negative", "negative"),
        "Cd20-": Replacement("Cd20", "negative", "negative"),
        "Cd23-": Replacement("Cd23", "negative", "negative"),
        "Cd24-": Replacement("Cd24", "negative", "negative"),
        "Cd27+": Replacement("Cd27", "positive", "positive"),
        "Cd27-": Replacement("Cd27", "negative", "negative"),
        "Cd3-": Replacement("Cd3", "negative", "negative"),
        "Cd45ra-": Replacement("Cd45ra", "negative", "negative"),
        "Cd8+": Replacement("Cd8", "positive", "positive"),
        "Igd+": Replacement("Igd", "positive", "positive"),
        "Igd-": Replacement("Igd", "negative", "negative"),
        "Igm+": Replacement("Igm", "positive", "positive"),
        "Igm-": Replacement("Igm", "negative", "negative"),
        "Sirpa+": Replacement("Sirpa", "positive", "positive"),
        "Sirpa-": Replacement("Sirpa", "negative", "negative"),
        "Cd34low": Replacement("Cd34", "positive", "low"),
        "Ly6chi": Replacement("Ly6c", "positive", "high"),
        "Ly6clo": Replacement("Ly6c", "positive", "low"),
    },
}

GENE_REPLACEMENTS: dict[str, str] = {
    "Alpha-SMA/ACTA2": "ACTA2",
    "Alpha-smooth muscle actin/ACTA2": "ACTA2",
    "Alpha-gustducin": "GNAT3",
    "Integrin alpha 8/ITGA8": "ITGA8",
    "PDGFRalpha": "PDGFRA",
    "TGF-beta": "TGFB1",
    "TNF-alpha": "TNF",
    "TCRalpha/beta": "TRAC/TRBC1",
    "TCRbeta": "TRBC1",
    "cGMP-dependent protein kinase": "PRKG1",
    "cTnI/TNNI3": "TNNI3",
    "cTnT/TNNT2": "TNNT2",
}

GENERIC_SUFFIX_RE = re.compile(r"^(?P<name>.+?)(?P<suffix>\+\+|\+|-|low|high|dim)$", re.IGNORECASE)


def load_json(path: Path) -> dict[str, Any]:
    try:
        with path.open("r", encoding="utf-8") as dataset_file:
            loaded = json.load(dataset_file)
    except OSError as exc:
        logging.error("Failed to read %s: %s", path, exc)
        raise
    except json.JSONDecodeError as exc:
        logging.error("Failed to parse %s: %s", path, exc)
        raise

    if not isinstance(loaded, dict):
        raise ValueError(f"{path} must contain a JSON object")
    return loaded


def save_json(path: Path, data: dict[str, Any]) -> None:
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with path.open("w", encoding="utf-8") as dataset_file:
            json.dump(data, dataset_file, indent=2, ensure_ascii=False)
            dataset_file.write("\n")
    except OSError as exc:
        logging.error("Failed to write %s: %s", path, exc)
        raise


def normalize_dataset(dataset: dict[str, Any]) -> Summary:
    counts = {"normalized": 0, "moved": 0, "expression_levels": 0}
    for cell_type in iter_cell_types(dataset):
        markers = cell_type.get("markers")
        if not isinstance(markers, dict):
            continue
        for species in SPECIES:
            species_markers = markers.get(species)
            if isinstance(species_markers, dict):
                normalize_species_markers(species_markers, species, counts)
    return Summary(counts["normalized"], counts["moved"], counts["expression_levels"])


def iter_cell_types(dataset: dict[str, Any]) -> list[dict[str, Any]]:
    cell_types: list[dict[str, Any]] = []
    for tissue_system in dict_items(dataset.get("tissue_systems")):
        for organ in dict_items(tissue_system.get("organs")):
            for microstructure in dict_items(organ.get("microstructures")):
                cell_types.extend(dict_items(microstructure.get("cell_types")))
    return cell_types


def normalize_species_markers(
    species_markers: dict[str, Any],
    species: Species,
    counts: dict[str, int],
) -> None:
    updated: dict[Polarity, list[str]] = {"positive": [], "negative": []}
    expression_levels: dict[str, ExpressionLevel] = {}
    target_by_marker: dict[str, set[Polarity]] = {}

    existing_levels = species_markers.get("expression_levels")
    if isinstance(existing_levels, dict):
        for marker, level in existing_levels.items():
            if isinstance(marker, str) and level in {"high", "low", "positive", "negative"}:
                expression_levels[marker] = level

    for polarity in POLARITIES:
        source_markers = species_markers.get(polarity)
        if not isinstance(source_markers, list):
            source_markers = []
        for marker in source_markers:
            if not isinstance(marker, str):
                continue
            replacement = get_replacement(marker, species, polarity)
            if replacement.normalized != marker:
                counts["normalized"] += 1
            if replacement.target != polarity:
                counts["moved"] += 1
            if replacement.expression_level is not None:
                if expression_levels.get(replacement.normalized) != replacement.expression_level:
                    counts["expression_levels"] += 1
                expression_levels[replacement.normalized] = replacement.expression_level
            updated[replacement.target].append(replacement.normalized)
            if replacement.target != polarity or replacement.expression_level is not None:
                target_by_marker.setdefault(replacement.normalized, set()).add(replacement.target)

    for marker, targets in target_by_marker.items():
        if len(targets) == 1:
            target = next(iter(targets))
            other = "negative" if target == "positive" else "positive"
            updated[other] = [candidate for candidate in updated[other] if candidate != marker]

    species_markers["positive"] = dedupe(updated["positive"])
    species_markers["negative"] = dedupe(updated["negative"])
    if expression_levels:
        species_markers["expression_levels"] = expression_levels
    elif "expression_levels" in species_markers:
        del species_markers["expression_levels"]


def get_replacement(marker: str, species: Species, polarity: Polarity) -> Replacement:
    exact = EXACT_REPLACEMENTS[species].get(marker)
    if exact:
        return exact

    gene = GENE_REPLACEMENTS.get(marker)
    if gene:
        return Replacement(gene, polarity, None)

    suffix_match = GENERIC_SUFFIX_RE.match(marker)
    if suffix_match:
        suffix = suffix_match.group("suffix").lower()
        normalized = suffix_match.group("name")
        if suffix == "++":
            return Replacement(normalized, "positive", "high")
        if suffix == "+":
            return Replacement(normalized, "positive", "positive")
        if suffix == "-":
            return Replacement(normalized, "negative", "negative")
        if suffix in {"low", "dim"}:
            return Replacement(normalized, polarity, "low")
        if suffix == "high":
            return Replacement(normalized, polarity, "high")

    return Replacement(marker, polarity, None)


def dedupe(markers: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for marker in markers:
        if marker in seen:
            continue
        seen.add(marker)
        unique.append(marker)
    return unique


def dict_items(value: Any) -> list[dict[str, Any]]:
    if not isinstance(value, list):
        return []
    return [item for item in value if isinstance(item, dict)]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Normalize marker names and expression qualifiers.")
    parser.add_argument("--input", default=str(DEFAULT_INPUT), help="Input cell-markers.json path.")
    parser.add_argument(
        "--output",
        default=str(DEFAULT_OUTPUT),
        help="Output JSON path. Defaults to data/cell-markers.normalized.json to avoid overwriting live data.",
    )
    return parser


def main(argv: list[str] | None = None) -> int:
    logging.basicConfig(level=logging.INFO, format="%(levelname)s:%(message)s")
    args = build_parser().parse_args(argv)
    input_path = Path(args.input)
    output_path = Path(args.output)

    try:
        dataset = load_json(input_path)
        summary = normalize_dataset(dataset)
        save_json(output_path, dataset)
    except (OSError, ValueError, json.JSONDecodeError):
        return 1

    print(
        "Normalized {0} markers, moved {1} between arrays, added {2} expression_levels entries.".format(
            summary.normalized,
            summary.moved,
            summary.expression_levels,
        )
    )
    print("Wrote normalized dataset to {0}".format(output_path))
    return 0


if __name__ == "__main__":
    sys.exit(main())
