# Content Review Spec — for Fable (domain reviewer)

> **You are the domain/scientific content reviewer** for the Cell Markers Explorer dataset. This is a **review-only** task: you find and document content issues with evidence; you do **not** edit the live tree. The supervisor (Claude) applies accepted fixes, runs `updater/validate.py`, and commits. Division of labour: **you = scientific accuracy of the data; Claude = code/structure/schema.**

---

## 1. What the project is (context)
A no-build web app that lets researchers browse human & mouse cell markers by anatomical drill-down: **body map → tissue system → organ → microstructure → cell type → markers**. The dataset is the single source of truth. Live: https://wsungahn.github.io/Cell_Marker_Explorer/ (v1.0.2).

**Data sources** (already compiled into the dataset): Labome (Cell Markers; T/B Cell; Macrophage; Stem Cell), CellMarker 2.0, PanglaoDB.

## 2. The data to review
- **File:** `data/cell-markers.json` (the live dataset).
- **Scale:** 12 tissue systems · 27 organs · 42 microstructures · **121 cell types** · 671 human-pos / 35 human-neg / 639 mouse-pos / 36 mouse-neg markers · 93 aliases · 101/121 cell types carry `references`.
- **Cell type shape:**
```json
{
  "id": "hepatocyte",
  "name": "Hepatocyte",
  "description": "…",
  "markers": {
    "human": { "positive": ["HP","ASGR1","Albumin/ALB","CYP3A4"], "negative": [],
               "expression_levels": { "CD14": "high" } },
    "mouse": { "positive": [...], "negative": [...], "expression_levels": {...} }
  },
  "aliases": ["…"],
  "references": [21],
  "source": "labome",
  "added_in_version": "1.0.0",
  "last_modified_version": "1.0.2"
}
```
- Path to any cell type: `tissue_systems[].organs[].microstructures[].cell_types[]`.
- Conventions already enforced by `validate.py` (do NOT re-flag these — they are structure, my job): unique ids, ≥1 positive marker in ≥1 species, no dup markers in an array, semver. Marker nomenclature is currently a *warning* only.

## 3. Review dimensions (what to check) + severity

| Dim | Check | Severity guide |
|-----|-------|----------------|
| **D1 Marker correctness** | Are the listed positive/negative markers actually characteristic of this cell type per the literature? Flag wrong/misassigned markers. | wrong marker on a cell type = **P0** |
| **D2 Species nomenclature & orthologs** | Human = UPPERCASE (e.g. `FOXP3`), mouse = Title-case (e.g. `Foxp3`). Are human/mouse lists proper orthologs (not copied across species, not mis-cased)? | mis-cased/wrong-species symbol = **P1** |
| **D3 expression_levels** | The 15 cell types with `expression_levels` (high/low/positive/negative) — are the qualifiers biologically right (e.g. classical monocyte `CD14 high`, NK `CD3 negative`)? | wrong level = **P1** |
| **D4 Classification / placement** | Is each cell type under the correct tissue system / organ / microstructure? | mis-placed cell type = **P0** |
| **D5 Aliases** | Are `aliases` correct and useful (true synonyms, no errors)? | **P2** |
| **D6 References** | Do the `references` numbers look appropriate for the claims? (Note: the citation *table* is not yet populated — flag only obvious mismatches/over-claims, not missing citation text.) | **P2** |
| **D7 Coverage gaps** | Missing canonical marker(s) for a cell type, or a clearly missing common cell type for an organ. Be conservative — additions need justification. | missing key marker = **P2**, missing cell type = **P3** |
| **D8 Microanatomy anatomy** | `svg/microanatomy/*.svg` were redrawn lightweight (anatomy-informed). Are the depicted structures/labels anatomically correct for each organ's microstructures? (Visual/structural, not pixel-perfect.) | anatomically wrong = **P2** |
| **D9 Descriptions** | Are `description` fields factually correct (cell type, microstructure, organ, tissue system)? | factual error = **P2** |

**Out of scope (do NOT flag):** JSON schema/structure, code, file naming, SVG region ids / clickability, the empty `metadata.citations` (handled separately), build/deploy.

## 4. Output format — write findings here
Create **`review/content-review/findings.md`** (and/or `findings.json`). One entry per issue:

```
### CR-001
- dimension: D1
- severity: P0
- location: digestive/liver/hepatic-lobule/hepatocyte  (tissueSystem/organ/microstructure/cellType)
- field: markers.human.positive
- current: "ASGR1, …"
- finding: <what's wrong, 1–2 sentences>
- suggested_fix: <concrete change — add/remove/rename/move>
- rationale: <why; cite a source if possible: Labome / CellMarker 2.0 / PanglaoDB / PMID/DOI>
- confidence: high | medium | low
```
JSON variant (if you prefer): an array of objects with the same keys under `{ "findings": [ ... ] }`.

Also add a short **summary** at the top: counts by severity + dimension, and any systemic patterns (e.g. "mouse lists for N cell types are just lowercased human symbols").

## 5. Workflow (how this plugs in)
1. You read `data/cell-markers.json` + the relevant `svg/microanatomy/*.svg`, write `review/content-review/findings.md`. **No edits to the live tree.**
2. Claude (supervisor) triages each finding, applies accepted fixes to `data/cell-markers.json` (and SVGs for D8), runs `updater/validate.py`, commits one logical change at a time with attribution to the finding id (e.g. `fix(data): CR-001 …`), and records rejected/deferred findings with a reason.
3. Re-review loop optional: after fixes, re-run the relevant dimensions.

## 6. Suggested priority order for your pass
1. **D4 placement** + **D1 marker correctness** (P0 — scientific errors first).
2. **D2 species/orthologs** + **D3 expression_levels** (P1).
3. **D7 coverage**, **D9 descriptions**, **D8 anatomy**, **D5 aliases**, **D6 references** (P2/P3).

Focus your effort on the highest-impact, highest-confidence findings. A short, accurate, well-evidenced list beats an exhaustive low-confidence one.
