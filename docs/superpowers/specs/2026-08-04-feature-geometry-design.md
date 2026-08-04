# Feature Geometry Screen — Design

**Date:** 2026-08-04
**Route:** `/phonology/geometry` (new tab under a refactored `/phonology` section)
**Source diagram:** `references/16-FeatureTree-Sackett.pdf` (Feature Geometry, adapted from Marlett 2001 p.230; Sackett, LING330, Trinity Western University 2024)

## Goal

A new screen in the phonology section that:

1. Shows a chart (grid) of all phones.
2. Renders a visual **feature-geometry tree** for each phone (per-phone mini-trees) and a combined tree for the current multi-selection.
3. Lets the user select multiple phones and see a single feature-geometry tree populated with the **shared** node presence and leaf feature values (natural-class view), mirroring the existing "common features" behavior in the Feature Explorer.
4. Lists any phone whose geometry could not be confidently derived in a visible **"Needs review"** panel for the user to fill in manually.

## The feature-geometry tree (fixed topology)

```
C/V/X
├── Root Node
│   ├── Laryngeal Node
│   │   ├── [voice]
│   │   ├── [constricted glottis]
│   │   └── [spread glottis]
│   └── Supralaryngeal Node
│       ├── Place
│       │   ├── Labial → [round]
│       │   ├── Coronal → [strident] [anterior] [distributed] [lateral]
│       │   ├── Dorsal → [back] [low] [high]
│       │   └── Tongue Root Node → [ATR] [RTR]
│       ├── [sonorant]
│       ├── [consonantal]
│       ├── [continuant]
│       └── [nasal]
└── Tonal Node
    ├── Register → [hi]
    └── Mode → [Hi]
```

The topology (nodes and branches) is **constant**. Only node presence and leaf values change per phone.

## Data model

Two distinct kinds of information per phone. This is the central design point — feature geometry is **privative at the node level**.

### Node presence (privative — present/absent, NOT ±)

A phone either **has a node** in its representation or it does not. There is no `+Coronal`/`−Coronal`. Node presence is itself the information.

Privative nodes tracked per phone:

- `Labial`
- `Coronal`
- `Dorsal`
- `TongueRoot`
- `Tonal` (absent for all current segments — no tone data)

Higher structural nodes (Root, Laryngeal, Supralaryngeal, Place, Register, Mode) are treated as present whenever any daughter is present; they are not stored explicitly per phone unless a case requires it.

### Leaf feature values (`'+' | '-' | undefined`)

The terminal `[…]` boxes. `undefined` renders as `—` (unspecified).

Leaf features grouped by parent node:

- **Laryngeal:** `voice`, `constrictedGlottis`, `spreadGlottis`
- **Supralaryngeal (direct):** `sonorant`, `consonantal`, `continuant`, `nasal`
- **Labial:** `round`
- **Coronal:** `strident`, `anterior`, `distributed`, `lateral`
- **Dorsal:** `back`, `low`, `high`
- **TongueRoot:** `ATR`, `RTR`
- **Tonal:** `hi` (register), `Hi` (mode) — always `—` for current segments

### Translation from the existing flat data

The existing `phonology.tsx` flat feature set is mapped over mechanically where it fits:

- `aspirated: '+'` → `spreadGlottis: '+'`
- `glottal: '+'` (ejectives / glottalized) → `constrictedGlottis: '+'`
- `ATR: '-'` → `RTR: '+'` (and `ATR` cleared); `ATR: '+'` → `ATR: '+'`, `RTR: '-'`
- `delayed_release` → **dropped** (not present in the geometry tree)
- Place-node presence is derived from articulation: e.g. `t` has the Coronal node and coronal leaves but no Labial/Dorsal node and no `round`/`back`; `k` has the Dorsal node; `w` has both Labial and Dorsal.

Leaf values and node presence are **derived from standard IPA feature specifications** by the implementer. Any phone that cannot be confidently placed goes into the "Needs review" list rather than being guessed silently.

## Components

### `FeatureGeometryTree` (presentational)

- Input: a single feature map `{ nodes: Set<NodeName>, leaves: Record<LeafName, '+' | '-' | undefined> }`.
- Draws the fixed topology as **inline SVG** (theme-aware stroke colors, scales cleanly).
- Three visual states:
  - **Active node** → solid; its branch drawn in full.
  - **Inactive node** → greyed/faint (present in theory, absent in this phone) — e.g. a labial dims its whole Coronal branch.
  - **Leaf value** → `+` / `−`, or `—` when the parent node is active but the feature is unspecified.
- Two callers feed it maps: per-phone mini-trees and the combined selection tree.
- A `size` prop (`'mini' | 'full'`) controls compact vs. large rendering.

### Aggregation logic (shared node presence + shared leaf values)

Pure functions, unit-tested:

- **Shared node:** a node is active in the combined tree only if it is present in **every** selected phone.
- **Shared leaf:** a leaf shows a value only if all selected phones specify it and agree; otherwise `—`.
- Selecting all coronals → Coronal node active, Labial/Dorsal inactive; correct natural-class read.

### Screen (`/phonology/geometry` route)

- **Phone grid** at top: all phones, colored by class (vowel / sonorant / obstruent) like the existing explorer; click to toggle selection.
- **Per-phone mini-trees:** a small `FeatureGeometryTree` rendered per phone in a responsive grid. (If too heavy in practice, fall back to click/hover-to-expand — a tweak, not a redesign.)
- **Combined shared tree:** one `size="full"` tree for the current multi-selection.
- **"Needs review" panel:** lists phones whose geometry could not be confidently derived.

## Navigation / routing

- Refactor `/phonology` into a layout route with a small tab bar: **Feature Explorer** (existing) and **Feature Geometry** (new).
- Existing Feature Explorer component moves under the layout unchanged (child route), preserving all current behavior.
- New child route `/phonology/geometry` renders the new screen.
- `app/routes.ts` updated accordingly.

## Testing & no-regression

- Existing Feature Explorer keeps working, just relocated under the tab layout.
- Unit tests:
  - Shared-node aggregation (natural-class correctness: all coronals → Coronal active, Labial/Dorsal inactive).
  - Shared-leaf aggregation (agree → value; disagree/missing → `—`).
  - Geometry of a couple of known phones (e.g. `t`, `k`, `w`) against expected node presence + leaf values.

## Out of scope

- Editing/persisting geometry data from the UI (the "Needs review" list is filled in code by the user).
- Tone data for segments (Tonal Node structure is drawn but always unspecified).
- Any change to the Feature Explorer's logic.
