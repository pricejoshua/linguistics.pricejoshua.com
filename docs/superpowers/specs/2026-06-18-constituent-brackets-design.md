# Constituent Bracket Annotations in Bracket View

**Date:** 2026-06-18  
**Status:** Approved

## Overview

Add Dixon-style constituent labels (A, O, S, CS, CC, VCS, VCC) to the bracket view of glossary examples. Morphemes are grouped into named constituents at the example level; the bracket view renders each constituent group as a bottom-open bracket box with a labeled, hoverable label beneath it. Discontinuous constituents render as separate bracket spans with the same label.

## Data Model

### New type: `GlossaryConstituent`

```ts
export interface GlossaryConstituent {
  label: string;         // e.g. "A", "O", "CS", "CC", "VCS", "VCC"
  morphemeIds: string[]; // references example.morphemes[].id
}
```

### Updated type: `GlossaryExample`

Add one optional field:

```ts
constituents?: GlossaryConstituent[];
```

Existing examples without this field render unchanged (no brackets shown).

## Constituent Definitions Data File

Add `app/data/glossary/constituents.ts` — a map from label string to a short definition:

```ts
export const CONSTITUENT_DEFS: Record<string, string> = {
  A:   'Transitive subject',
  O:   'Transitive object',
  S:   'Intransitive subject',
  CS:  'Copula subject',
  CC:  'Copula complement',
  VCS: 'Verbless clause subject',
  VCC: 'Verbless clause complement',
};
```

This file grows as more constituent types are added.

## BracketView Rendering Algorithm

1. If `example.constituents` is absent or empty, render the existing per-morpheme layout unchanged.
2. Build a lookup map: `morphemeId → GlossaryConstituent`.
3. Walk `example.morphemes` in order. Accumulate morphemes into runs: a run is a maximal sequence of consecutive morphemes sharing the same constituent (by object identity, using the constituent's `label`). Morphemes with no constituent form their own singleton runs (no bracket rendered).
4. For each run:
   - If the morpheme(s) have a constituent: wrap them in a constituent-group container with that constituent's label.
   - If not: render the morpheme token(s) unwrapped, as today.

## CSS Bracket Styling

Each constituent group is a flex container with:
- `border-bottom`, `border-left`, `border-right` in the constituent's color (no top border) — this forms a `⌐¬` / bottom-open bracket shape.
- The constituent label sits below, centered, using absolute positioning relative to the container.
- The label text is small-caps, monospace, and clickable/hoverable for the tooltip.

Constituent label colors are assigned by label, distinct from the morpheme role underline colors already in use:

| Label | Color |
|-------|-------|
| A     | sky-500 |
| O     | amber-500 |
| S     | violet-500 |
| CS    | teal-500 |
| CC    | rose-500 |
| VCS   | teal-400 |
| VCC   | rose-400 |
| (other) | slate-400 |

## Constituent Label Tooltips

The label text below each bracket is a `<span>` with a custom hover tooltip (a positioned `<div>`, not a browser `title` attribute) showing the full definition from `CONSTITUENT_DEFS`. Tooltip appears on hover, disappears on mouse-out.

This is the primary mechanism for explaining constituent labels to readers. No static legend is added to avoid clutter; the hover tooltip is discoverable by cursor.

## Discontinuous Constituents

When two morphemes share the same constituent label but are separated by morphemes with a different (or no) constituent, each contiguous run renders its own bracket with the same label. This makes the discontinuity explicit rather than hiding it.

## Data Updates

Update `constituents` arrays in the following existing JSON files:

- `app/data/glossary/entries/copula.json` — add CS, COP, CC constituents to all examples
- `app/data/glossary/entries/verbless-clause.json` — add VCS, VCC constituents to all examples
- `app/data/glossary/entries/predicate.json` — add A/O/S or CS/CC as appropriate

Other entries can be updated incrementally as content is added.

## Out of Scope

- Nested constituent brackets (NP within VP etc.)
- Constituency trees
- Changing the interlinear view
- Changing the ClickPanel for morphemes
