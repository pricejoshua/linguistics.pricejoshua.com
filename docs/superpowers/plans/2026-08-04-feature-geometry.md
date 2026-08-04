# Feature Geometry Screen Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

Spec: `docs/superpowers/specs/2026-08-04-feature-geometry-design.md`
Source diagram: `references/16-FeatureTree-Sackett.pdf`

**Goal:** Add a `/phonology/geometry` screen that renders the fixed Marlett-style feature-geometry tree as inline SVG — per selected phone and for the shared intersection of a multi-phone selection — under a new tab bar that also hosts the existing Feature Explorer.

**Architecture:** The flat phone/feature data moves out of `app/routes/phonology.tsx` into a shared data module. A new pure model layer defines the fixed tree topology with explicit SVG layout coordinates, an activation algorithm, and an intersection aggregator. A hand-authored per-phone table supplies privative node presence (Labial/Coronal/Dorsal/TongueRoot/Tonal); leaf values are derived mechanically from the flat features, gated by node presence. One presentational SVG component renders any geometry map. `/phonology` becomes a layout route with two child routes.

**Tech Stack:** React 19, React Router 7 (config-based routing in `app/routes.ts`), TypeScript (strict, `verbatimModuleSyntax`), Tailwind CSS v4, inline SVG. No charting or diagram libraries.

## Global Constraints

- **No new npm dependencies.** Not for rendering, not for tooling.
- **No unit tests in this plan.** The repo has no test runner and the user explicitly chose not to add one. This is a deliberate departure from the spec's "Testing & no-regression" section. Verification for every task is: `npx tsc --noEmit` passes clean, plus the manual check listed in that task.
- TypeScript strict mode; **no `any`, no `@ts-ignore`, no non-null `!` assertions.**
- `verbatimModuleSyntax` is on: type-only imports **must** use `import type { … }`.
- Existing **Feature Explorer behavior must not change**. Its logic, layout, copy, colors, localStorage keys, and import flow stay byte-for-byte equivalent in behavior. The only permitted change to `app/routes/phonology.tsx` is replacing its local data/type declarations with imports from the new shared module.
- Node presence is **privative**: a node is either in the set or absent. There is no `+Coronal` / `−Coronal`. Never model node presence as a `'+' | '-'` value.
- A leaf feature only ever carries a value when its parent node is present. When the parent node is absent the leaf value is `undefined` and renders `—`.
- The tree **topology is constant** across all phones and all selections. Only activation and leaf values vary.
- Theme-aware rendering: SVG strokes and text use `currentColor` with Tailwind text-color classes on the wrapper, so light/dark both work. Do not hardcode `#000` or `#fff`.
- Phone-grid category colors must match the existing Feature Explorer exactly: vowel `red`, sonorant `yellow`, obstruent `blue`, in the same Tailwind shades.
- Commit each task separately with a descriptive conventional-commit message.

## Ambiguities resolved (binding decisions)

These are controller decisions where the spec left room. Implementers must follow them, not re-litigate them.

1. **Per-phone mini-trees render for the *selected* phones only**, not all 55. Rendering 55 SVG trees on every keystroke is the "too heavy in practice" case the spec anticipates. When nothing is selected, the mini-tree section shows a hint instead.
2. **Palato-alveolars and the palatal nasal (`ʃ ʒ tʃ dʒ ñ`) are Coronal-only.** Their flat-data `high: '+'` is dropped, because `[high]` is a Dorsal dependent and these are analyzed as Coronal `[−anterior, +distributed]`. This is recorded as a review note, not a "needs review" blocker.
3. **`h` is `[+spread glottis]`, not `[+constricted glottis]`.** The flat data's `glottal: '+'` conflates the two; `h` gets an explicit override. `ʔ` keeps `[+constricted glottis]` from the mechanical mapping.
4. **The "Needs review" panel has two sections**: *No geometry* (a phone in `phoneData` with no entry in the spec table — blocking) and *Derived with a judgment call* (an entry in `GEOMETRY_REVIEW_NOTES` — informational). If the first section is empty the panel says so; it is still rendered.

## File structure

| File | Status | Responsibility |
|---|---|---|
| `app/data/phonology/phoneData.ts` | create | The flat phone/feature data, feature list, major classes, `getPhoneCategory` — moved verbatim out of the route |
| `app/routes/phonology.tsx` | modify | Feature Explorer, unchanged except it now imports the data |
| `app/data/phonology/featureGeometry.ts` | create | Geometry types, fixed topology + layout coords, activation, intersection aggregator |
| `app/data/phonology/phoneGeometry.ts` | create | Per-phone privative-node table, leaf derivation, review notes, needs-review list |
| `app/components/phonology/FeatureGeometryTree.tsx` | create | Presentational inline-SVG renderer for one geometry map |
| `app/routes/phonology.layout.tsx` | create | Tab bar + `<Outlet />` |
| `app/routes/phonology.geometry.tsx` | create | The Feature Geometry screen |
| `app/routes.ts` | modify | Nest the two children under the layout |

---

## Task 1: Extract the flat phone data into a shared module

**Files:**
- Create: `app/data/phonology/phoneData.ts`
- Modify: `app/routes/phonology.tsx`

**Interfaces:**
- Consumes: nothing.
- Produces, from `app/data/phonology/phoneData.ts`:
  - `export type FeatureValue = '+' | '-' | undefined`
  - `export type Feature` (the existing 19-name union)
  - `export interface PhoneFeatures { [feature: string]: FeatureValue }`
  - `export const phoneData: Record<string, PhoneFeatures>`
  - `export const features: Feature[]`
  - `export type MajorClassName` (the existing 12-name union)
  - `export const majorClasses: Record<MajorClassName, Partial<PhoneFeatures>>`
  - `export type PhoneCategory = 'vowel' | 'sonorant' | 'obstruent'`
  - `export function getPhoneCategory(phone: string): PhoneCategory`

This is a **pure move**. Do not rename a phone key, do not change a feature value, do not reorder `phoneData`'s keys (insertion order drives display order downstream), do not "clean up" anything you see along the way.

- [ ] **Step 1: Create the new module**

Create `app/data/phonology/phoneData.ts`. Cut — do not retype — these declarations out of `app/routes/phonology.tsx` and paste them into the new file, in this order, adding `export` to each:

1. The `FeatureValue` type alias.
2. The `Feature` union type.
3. The `PhoneFeatures` interface.
4. The `phoneData` object literal (all 55 entries, including the `// Consonants from Classical Distinctive Features table`, `// Sonorant consonants`, `// Glides`, `// Vowels from the feature chart`, and `// Additional vowels from vowel chart` comments).
5. The `features` array.
6. The `MajorClassName` union type.
7. The `majorClasses` object literal.

Then add, at the end of the new file, `getPhoneCategory` lifted out of the component body and turned into a module-level function:

```ts
export type PhoneCategory = 'vowel' | 'sonorant' | 'obstruent';

export function getPhoneCategory(phone: string): PhoneCategory {
  const data = phoneData[phone];
  if (!data) return 'obstruent'; // fallback for safety
  if (data.syllabic === '+') return 'vowel';
  if (data.sonorant === '+') return 'sonorant';
  return 'obstruent';
}
```

- [ ] **Step 2: Rewire the route**

In `app/routes/phonology.tsx`:

- Delete the seven declarations listed in Step 1 and the in-component `const getPhoneCategory = (phone: string): 'vowel' | 'sonorant' | 'obstruent' => { … };`.
- Add this import directly below the existing `import MinimalDistinguishingFeatureSets from './MinimalDistinguishingFeatureSets';` line:

```ts
import {
  phoneData,
  features,
  majorClasses,
  getPhoneCategory,
} from '../data/phonology/phoneData';
import type { FeatureValue, MajorClassName } from '../data/phonology/phoneData';
```

`FeatureValue` and `MajorClassName` are used in type positions only, so they go in the `import type` clause. `PhoneFeatures` and `Feature` are no longer referenced in the route after the move — if `npx tsc --noEmit` says otherwise, add the missing name to the `import type` clause rather than re-declaring it locally.

Everything else in the file is untouched.

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

Run: `npm run dev`, open `http://localhost:5173/phonology`.
Expected: the Feature Explorer looks and behaves exactly as before — all 55 phones in the grid, correct red/yellow/blue category colors, the Major Classes dropdown selects the right phones, Common Features and the Feature Matrix populate on selection.

- [ ] **Step 4: Commit**

```bash
git add app/data/phonology/phoneData.ts app/routes/phonology.tsx
git commit -m "refactor: extract flat phone feature data into shared module"
```

---

## Task 2: Feature-geometry model — types, topology, activation, aggregation

**Files:**
- Create: `app/data/phonology/featureGeometry.ts`

**Interfaces:**
- Consumes: `FeatureValue` from `app/data/phonology/phoneData`.
- Produces, from `app/data/phonology/featureGeometry.ts`:
  - `export type GeometryNodeName` — the five privative node names
  - `export type GeometryLeafName` — the nineteen leaf names
  - `export type GeometryNodeId` — every drawable id in the tree
  - `export interface PhoneGeometry { nodes: Set<GeometryNodeName>; leaves: Record<GeometryLeafName, FeatureValue> }`
  - `export interface GeometryTreeNode { … }`
  - `export const GEOMETRY_TREE: GeometryTreeNode[]`
  - `export const GEOMETRY_VIEWBOX: { width: number; height: number }`
  - `export const GEOMETRY_LINE_HEIGHT: number`
  - `export const EMPTY_LEAVES: Record<GeometryLeafName, FeatureValue>`
  - `export function emptyGeometry(): PhoneGeometry`
  - `export function computeActiveIds(geometry: PhoneGeometry): Set<GeometryNodeId>`
  - `export function combineGeometries(geometries: PhoneGeometry[]): PhoneGeometry`

This file is the whole file. Write it exactly as given.

- [ ] **Step 1: Write the types and the topology**

Create `app/data/phonology/featureGeometry.ts` with this content:

```ts
import type { FeatureValue } from './phoneData';

/**
 * Feature geometry, adapted from Marlett 2001 p.230 (see
 * references/16-FeatureTree-Sackett.pdf). The topology is fixed: every phone
 * and every selection is drawn against the same tree. Only which parts are
 * active, and what the leaves say, varies.
 */

/** Privative nodes. A phone either has the node or it does not — never ±. */
export type GeometryNodeName =
  | 'Labial'
  | 'Coronal'
  | 'Dorsal'
  | 'TongueRoot'
  | 'Tonal';

/** Terminal [feature] boxes. */
export type GeometryLeafName =
  | 'voice' | 'constrictedGlottis' | 'spreadGlottis'
  | 'sonorant' | 'consonantal' | 'continuant' | 'nasal'
  | 'round'
  | 'strident' | 'anterior' | 'distributed' | 'lateral'
  | 'back' | 'low' | 'high'
  | 'ATR' | 'RTR'
  | 'toneRegisterHi' | 'toneModeHi';

/** Structural (non-privative, non-leaf) nodes. */
export type GeometryStructuralId =
  | 'cvx'
  | 'root'
  | 'laryngeal'
  | 'supralaryngeal'
  | 'place'
  | 'register'
  | 'mode';

/** Privative nodes carry both an id and a GeometryNodeName. */
export type GeometryPrivativeId = 'labial' | 'coronal' | 'dorsal' | 'tongueRoot' | 'tonal';

export type GeometryNodeId = GeometryStructuralId | GeometryPrivativeId | GeometryLeafName;

export interface PhoneGeometry {
  /** Privative node presence. */
  nodes: Set<GeometryNodeName>;
  /** Leaf values. `undefined` means unspecified and renders as an em dash. */
  leaves: Record<GeometryLeafName, FeatureValue>;
}

export type GeometryNodeKind = 'structural' | 'privative' | 'leaf';

export interface GeometryTreeNode {
  id: GeometryNodeId;
  /** One string per rendered text line. */
  label: string[];
  /** Horizontal centre, in viewBox units. */
  x: number;
  /** Baseline of the first label line, in viewBox units. */
  y: number;
  parent: GeometryNodeId | null;
  kind: GeometryNodeKind;
  /** Set when kind === 'privative'. */
  node?: GeometryNodeName;
  /** Set when kind === 'leaf'. */
  leaf?: GeometryLeafName;
}

export const GEOMETRY_VIEWBOX = { width: 1240, height: 520 } as const;
export const GEOMETRY_LINE_HEIGHT = 15;

/**
 * Layout is authored by hand to match the source diagram. Rows:
 *   30 C/V/X · 112 Root/Tonal · 200 Laryngeal/Supralaryngeal/Register/Mode
 *   292 laryngeal leaves, Place, supralaryngeal leaves, tone leaves
 *   382 Place daughters · 474 Place-daughter leaves
 */
export const GEOMETRY_TREE: GeometryTreeNode[] = [
  { id: 'cvx', label: ['C/V/X'], x: 940, y: 30, parent: null, kind: 'structural' },

  { id: 'root', label: ['Root Node'], x: 380, y: 112, parent: 'cvx', kind: 'structural' },
  { id: 'tonal', label: ['Tonal', 'Node'], x: 1090, y: 112, parent: 'cvx', kind: 'privative', node: 'Tonal' },

  { id: 'laryngeal', label: ['Laryngeal', 'Node'], x: 172, y: 200, parent: 'root', kind: 'structural' },
  { id: 'supralaryngeal', label: ['Supralaryngeal', 'Node'], x: 620, y: 200, parent: 'root', kind: 'structural' },
  { id: 'register', label: ['Register'], x: 1030, y: 200, parent: 'tonal', kind: 'structural' },
  { id: 'mode', label: ['Mode'], x: 1150, y: 200, parent: 'tonal', kind: 'structural' },

  { id: 'voice', label: ['[voice]'], x: 75, y: 292, parent: 'laryngeal', kind: 'leaf', leaf: 'voice' },
  { id: 'constrictedGlottis', label: ['[constricted', 'glottis]'], x: 172, y: 292, parent: 'laryngeal', kind: 'leaf', leaf: 'constrictedGlottis' },
  { id: 'spreadGlottis', label: ['[spread', 'glottis]'], x: 272, y: 292, parent: 'laryngeal', kind: 'leaf', leaf: 'spreadGlottis' },

  { id: 'place', label: ['Place'], x: 430, y: 292, parent: 'supralaryngeal', kind: 'structural' },
  { id: 'sonorant', label: ['[sonorant]'], x: 620, y: 292, parent: 'supralaryngeal', kind: 'leaf', leaf: 'sonorant' },
  { id: 'consonantal', label: ['[consonantal]'], x: 720, y: 292, parent: 'supralaryngeal', kind: 'leaf', leaf: 'consonantal' },
  { id: 'continuant', label: ['[continuant]'], x: 820, y: 292, parent: 'supralaryngeal', kind: 'leaf', leaf: 'continuant' },
  { id: 'nasal', label: ['[nasal]'], x: 905, y: 292, parent: 'supralaryngeal', kind: 'leaf', leaf: 'nasal' },

  { id: 'toneRegisterHi', label: ['[hi]'], x: 1030, y: 292, parent: 'register', kind: 'leaf', leaf: 'toneRegisterHi' },
  { id: 'toneModeHi', label: ['[Hi]'], x: 1150, y: 292, parent: 'mode', kind: 'leaf', leaf: 'toneModeHi' },

  { id: 'labial', label: ['Labial'], x: 75, y: 382, parent: 'place', kind: 'privative', node: 'Labial' },
  { id: 'coronal', label: ['Coronal'], x: 315, y: 382, parent: 'place', kind: 'privative', node: 'Coronal' },
  { id: 'dorsal', label: ['Dorsal'], x: 610, y: 382, parent: 'place', kind: 'privative', node: 'Dorsal' },
  { id: 'tongueRoot', label: ['Tongue Root', 'Node'], x: 930, y: 382, parent: 'place', kind: 'privative', node: 'TongueRoot' },

  { id: 'round', label: ['[round]'], x: 75, y: 474, parent: 'labial', kind: 'leaf', leaf: 'round' },
  { id: 'strident', label: ['[strident]'], x: 175, y: 474, parent: 'coronal', kind: 'leaf', leaf: 'strident' },
  { id: 'anterior', label: ['[anterior]'], x: 265, y: 474, parent: 'coronal', kind: 'leaf', leaf: 'anterior' },
  { id: 'distributed', label: ['[distributed]'], x: 365, y: 474, parent: 'coronal', kind: 'leaf', leaf: 'distributed' },
  { id: 'lateral', label: ['[lateral]'], x: 455, y: 474, parent: 'coronal', kind: 'leaf', leaf: 'lateral' },
  { id: 'back', label: ['[back]'], x: 545, y: 474, parent: 'dorsal', kind: 'leaf', leaf: 'back' },
  { id: 'low', label: ['[low]'], x: 610, y: 474, parent: 'dorsal', kind: 'leaf', leaf: 'low' },
  { id: 'high', label: ['[high]'], x: 675, y: 474, parent: 'dorsal', kind: 'leaf', leaf: 'high' },
  { id: 'ATR', label: ['[ATR]'], x: 895, y: 474, parent: 'tongueRoot', kind: 'leaf', leaf: 'ATR' },
  { id: 'RTR', label: ['[RTR]'], x: 965, y: 474, parent: 'tongueRoot', kind: 'leaf', leaf: 'RTR' },
];

export const GEOMETRY_LEAF_NAMES: GeometryLeafName[] = GEOMETRY_TREE.flatMap((n) =>
  n.leaf ? [n.leaf] : [],
);
```

- [ ] **Step 2: Add the empty-geometry helpers**

Append to the same file:

```ts
function buildEmptyLeaves(): Record<GeometryLeafName, FeatureValue> {
  const leaves = {} as Record<GeometryLeafName, FeatureValue>;
  for (const name of GEOMETRY_LEAF_NAMES) leaves[name] = undefined;
  return leaves;
}

/** Frozen all-unspecified leaf map. Do not mutate — copy with `{ ...EMPTY_LEAVES }`. */
export const EMPTY_LEAVES: Record<GeometryLeafName, FeatureValue> = Object.freeze(
  buildEmptyLeaves(),
);

export function emptyGeometry(): PhoneGeometry {
  return { nodes: new Set<GeometryNodeName>(), leaves: { ...EMPTY_LEAVES } };
}
```

- [ ] **Step 3: Add the activation algorithm**

Append to the same file:

```ts
const NODES_BY_ID = new Map<GeometryNodeId, GeometryTreeNode>(
  GEOMETRY_TREE.map((n) => [n.id, n]),
);

const CHILDREN_BY_ID = new Map<GeometryNodeId, GeometryTreeNode[]>();
for (const n of GEOMETRY_TREE) {
  if (n.parent === null) continue;
  const siblings = CHILDREN_BY_ID.get(n.parent);
  if (siblings) siblings.push(n);
  else CHILDREN_BY_ID.set(n.parent, [n]);
}

/** The spine is always drawn solid, even for a selection that shares nothing. */
const ALWAYS_ACTIVE: ReadonlySet<GeometryNodeId> = new Set<GeometryNodeId>(['cvx', 'root']);

/**
 * A node has *support* when the phone gives it content:
 *  - a leaf, when its value is specified;
 *  - a privative node, when it is in the phone's node set;
 *  - a structural node, when any descendant has support.
 */
function hasSupport(
  node: GeometryTreeNode,
  geometry: PhoneGeometry,
  memo: Map<GeometryNodeId, boolean>,
): boolean {
  const cached = memo.get(node.id);
  if (cached !== undefined) return cached;

  let support: boolean;
  if (ALWAYS_ACTIVE.has(node.id)) {
    support = true;
  } else if (node.kind === 'leaf' && node.leaf) {
    support = geometry.leaves[node.leaf] !== undefined;
  } else if (node.kind === 'privative' && node.node) {
    support = geometry.nodes.has(node.node);
  } else {
    const children = CHILDREN_BY_ID.get(node.id) ?? [];
    support = children.some((child) => hasSupport(child, geometry, memo));
  }

  memo.set(node.id, support);
  return support;
}

/**
 * Ids drawn solid. A leaf is solid whenever its parent node is active — an
 * active node with an unspecified feature still shows its box, reading `—`.
 * Everything else needs its own support and an active parent.
 */
export function computeActiveIds(geometry: PhoneGeometry): Set<GeometryNodeId> {
  const memo = new Map<GeometryNodeId, boolean>();
  const active = new Set<GeometryNodeId>();

  const visit = (node: GeometryTreeNode, parentActive: boolean): void => {
    const isActive =
      node.kind === 'leaf' ? parentActive : parentActive && hasSupport(node, geometry, memo);
    if (isActive) active.add(node.id);
    for (const child of CHILDREN_BY_ID.get(node.id) ?? []) visit(child, isActive);
  };

  const rootNode = NODES_BY_ID.get('cvx');
  if (rootNode) visit(rootNode, true);
  return active;
}
```

- [ ] **Step 4: Add the intersection aggregator**

Append to the same file:

```ts
/**
 * The natural-class view. A node survives only if *every* selected phone has
 * it; a leaf shows a value only if every selected phone specifies it and they
 * agree. Anything else is unspecified.
 */
export function combineGeometries(geometries: PhoneGeometry[]): PhoneGeometry {
  if (geometries.length === 0) return emptyGeometry();

  const [first, ...rest] = geometries;

  const nodes = new Set<GeometryNodeName>();
  for (const name of first.nodes) {
    if (rest.every((g) => g.nodes.has(name))) nodes.add(name);
  }

  const leaves = { ...EMPTY_LEAVES };
  for (const name of GEOMETRY_LEAF_NAMES) {
    const value = first.leaves[name];
    if (value === undefined) continue;
    if (rest.every((g) => g.leaves[name] === value)) leaves[name] = value;
  }

  return { nodes, leaves };
}
```

- [ ] **Step 5: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

Sanity-check the topology by eye against `references/16-FeatureTree-Sackett.pdf`: every `[…]` box in the PDF appears exactly once in `GEOMETRY_TREE`, and every non-null `parent` id exists as another entry's `id`. The array must have **31** entries — 7 structural (`cvx`, `root`, `laryngeal`, `supralaryngeal`, `place`, `register`, `mode`), 5 privative, 19 leaves — and `GEOMETRY_LEAF_NAMES` must have **19**.

- [ ] **Step 6: Commit**

```bash
git add app/data/phonology/featureGeometry.ts
git commit -m "feat: add feature-geometry topology, activation and aggregation model"
```

---

## Task 3: Per-phone geometry — node table, derivation, review notes

**Files:**
- Create: `app/data/phonology/phoneGeometry.ts`

**Interfaces:**
- Consumes: `phoneData`, `FeatureValue` from `./phoneData`; `PhoneGeometry`, `GeometryNodeName`, `GeometryLeafName`, `EMPTY_LEAVES` from `./featureGeometry`.
- Produces, from `app/data/phonology/phoneGeometry.ts`:
  - `export const PHONE_GEOMETRY_SPECS: Record<string, GeometrySpec>`
  - `export const GEOMETRY_REVIEW_NOTES: Record<string, string>`
  - `export function derivePhoneGeometry(phone: string): PhoneGeometry | null`
  - `export const PHONE_GEOMETRIES: Record<string, PhoneGeometry>`
  - `export const PHONES_NEEDING_REVIEW: string[]`

`derivePhoneGeometry` returns `null` for a phone with no spec entry — that is the "Needs review / no geometry" signal.

- [ ] **Step 1: Write the spec table**

Create `app/data/phonology/phoneGeometry.ts` with this content:

```ts
import { phoneData } from './phoneData';
import type { FeatureValue } from './phoneData';
import { EMPTY_LEAVES } from './featureGeometry';
import type { GeometryLeafName, GeometryNodeName, PhoneGeometry } from './featureGeometry';

export interface GeometrySpec {
  /** Privative nodes present in this phone's representation. */
  nodes: GeometryNodeName[];
  /** Leaf values the mechanical mapping cannot produce or gets wrong. */
  leafOverrides?: Partial<Record<GeometryLeafName, FeatureValue>>;
}

/**
 * Vowels carry laryngeal and manner values that the flat table omits: every
 * vowel here is modal-voiced, oral, and neither glottalised nor aspirated.
 */
function vowelSpec(nodes: GeometryNodeName[]): GeometrySpec {
  return {
    nodes,
    leafOverrides: {
      voice: '+',
      nasal: '-',
      constrictedGlottis: '-',
      spreadGlottis: '-',
    },
  };
}

const VOWEL_UNROUNDED: GeometryNodeName[] = ['Dorsal', 'TongueRoot'];
const VOWEL_ROUNDED: GeometryNodeName[] = ['Labial', 'Dorsal', 'TongueRoot'];

/**
 * Privative node presence per phone. Place nodes cannot be recovered from the
 * flat feature table (`coronal: '-'` covers labials and dorsals alike), so
 * they are assigned here from the articulation each symbol denotes.
 */
export const PHONE_GEOMETRY_SPECS: Record<string, GeometrySpec> = {
  // Labial obstruents
  'p': { nodes: ['Labial'] },
  'pʰ': { nodes: ['Labial'] },
  "p'": { nodes: ['Labial'] },
  'b': { nodes: ['Labial'] },
  'ɸ': { nodes: ['Labial'] },
  'β': { nodes: ['Labial'] },
  'f': { nodes: ['Labial'] },
  'v': { nodes: ['Labial'] },

  // Coronal obstruents
  't': { nodes: ['Coronal'] },
  'd': { nodes: ['Coronal'] },
  'θ': { nodes: ['Coronal'] },
  'ð': { nodes: ['Coronal'] },
  's': { nodes: ['Coronal'] },
  'z': { nodes: ['Coronal'] },
  'ʃ': { nodes: ['Coronal'] },
  'ʒ': { nodes: ['Coronal'] },
  'ts': { nodes: ['Coronal'] },
  'tʃ': { nodes: ['Coronal'] },
  'dʒ': { nodes: ['Coronal'] },

  // Dorsal obstruents
  'k': { nodes: ['Dorsal'] },
  'g': { nodes: ['Dorsal'] },
  'q': { nodes: ['Dorsal'] },
  'x': { nodes: ['Dorsal'] },
  'ɣ': { nodes: ['Dorsal'] },

  // Sonorant consonants
  'm': { nodes: ['Labial'] },
  'ɱ': { nodes: ['Labial'] },
  'n': { nodes: ['Coronal'] },
  'ñ': { nodes: ['Coronal'] },
  'ŋ': { nodes: ['Dorsal'] },
  'l': { nodes: ['Coronal'] },
  'ɬ': { nodes: ['Coronal'] },
  'ɾ': { nodes: ['Coronal'] },

  // Glides and laryngeals
  'j': { nodes: ['Dorsal'] },
  'w': { nodes: ['Labial', 'Dorsal'] },
  'ʔ': { nodes: [] },
  'h': { nodes: [], leafOverrides: { constrictedGlottis: '-', spreadGlottis: '+' } },

  // Vowels
  'i': vowelSpec(VOWEL_UNROUNDED),
  'ɪ': vowelSpec(VOWEL_UNROUNDED),
  'e': vowelSpec(VOWEL_UNROUNDED),
  'ε': vowelSpec(VOWEL_UNROUNDED),
  'æ': vowelSpec(VOWEL_UNROUNDED),
  'ə': vowelSpec(VOWEL_UNROUNDED),
  'a': vowelSpec(VOWEL_UNROUNDED),
  'ɨ': vowelSpec(VOWEL_UNROUNDED),
  'ɯ': vowelSpec(VOWEL_UNROUNDED),
  'ʌ': vowelSpec(VOWEL_UNROUNDED),
  'u': vowelSpec(VOWEL_ROUNDED),
  'ʊ': vowelSpec(VOWEL_ROUNDED),
  'o': vowelSpec(VOWEL_ROUNDED),
  'ɔ': vowelSpec(VOWEL_ROUNDED),
  'y': vowelSpec(VOWEL_ROUNDED),
  'ʏ': vowelSpec(VOWEL_ROUNDED),
  'ø': vowelSpec(VOWEL_ROUNDED),
  'œ': vowelSpec(VOWEL_ROUNDED),
  'ɒ': vowelSpec(VOWEL_ROUNDED),
};

/** Phones whose geometry involved a judgment call worth surfacing to the user. */
export const GEOMETRY_REVIEW_NOTES: Record<string, string> = {
  'ʃ': 'Coronal only: [−anterior, +distributed]. The flat table’s [high] is dropped — [high] is a Dorsal dependent.',
  'ʒ': 'Coronal only: [−anterior, +distributed]. The flat table’s [high] is dropped — [high] is a Dorsal dependent.',
  'tʃ': 'Coronal only: [−anterior, +distributed]. The flat table’s [high] is dropped — [high] is a Dorsal dependent.',
  'dʒ': 'Coronal only: [−anterior, +distributed]. The flat table’s [high] is dropped — [high] is a Dorsal dependent.',
  'ñ': 'Palatal nasal treated as Coronal [−anterior, +distributed]; the flat table’s [high] is dropped with the Dorsal node absent.',
  'h': 'The flat table’s glottal: + is read as [+spread glottis], not [+constricted glottis].',
  'ʔ': 'No Place node — a plain glottal stop, [+constricted glottis] only.',
  'w': 'Both Labial and Dorsal (labio-velar), so it carries [round] and [back, low, high].',
  'ɱ': 'Labiodental nasal placed under Labial; the flat table’s [anterior]/[distributed] are dropped with the Coronal node absent.',
};
```

- [ ] **Step 2: Write the derivation**

Append to the same file:

```ts
/**
 * Maps the flat feature table onto the geometry. Leaves under a Place node the
 * phone lacks stay unspecified — [anterior] on a labial, for instance, is not
 * "minus", it is absent from the representation.
 */
export function derivePhoneGeometry(phone: string): PhoneGeometry | null {
  const spec = PHONE_GEOMETRY_SPECS[phone];
  const flat = phoneData[phone];
  if (!spec || !flat) return null;

  const nodes = new Set<GeometryNodeName>(spec.nodes);
  const leaves = { ...EMPTY_LEAVES };

  // Laryngeal. `aspirated` is [spread glottis]; `glottal` is [constricted glottis].
  leaves.voice = flat.voice;
  leaves.spreadGlottis = flat.aspirated;
  leaves.constrictedGlottis = flat.glottal;

  // Supralaryngeal daughters. `delayed_release` has no home in this geometry.
  leaves.sonorant = flat.sonorant;
  leaves.consonantal = flat.consonantal;
  leaves.continuant = flat.continuant;
  leaves.nasal = flat.nasal;

  if (nodes.has('Labial')) {
    leaves.round = flat.round;
  }

  if (nodes.has('Coronal')) {
    leaves.strident = flat.strident;
    leaves.anterior = flat.anterior;
    leaves.distributed = flat.distributed;
    leaves.lateral = flat.lateral;
  }

  if (nodes.has('Dorsal')) {
    leaves.back = flat.back;
    leaves.low = flat.low;
    leaves.high = flat.high;
  }

  if (nodes.has('TongueRoot')) {
    // The flat table has one ±ATR feature; the geometry has two privative-ish
    // leaves. −ATR is retracted, so it surfaces as [+RTR] with [ATR] cleared.
    if (flat.ATR === '+') {
      leaves.ATR = '+';
      leaves.RTR = '-';
    } else if (flat.ATR === '-') {
      leaves.RTR = '+';
    }
  }

  // Tonal leaves stay unspecified: no segment here carries tone data.

  for (const [name, value] of Object.entries(spec.leafOverrides ?? {})) {
    leaves[name as GeometryLeafName] = value;
  }

  return { nodes, leaves };
}

export const PHONE_GEOMETRIES: Record<string, PhoneGeometry> = Object.fromEntries(
  Object.keys(phoneData).flatMap((phone) => {
    const geometry = derivePhoneGeometry(phone);
    return geometry ? [[phone, geometry] as const] : [];
  }),
);

/** Phones in the inventory with no geometry spec — surfaced in the UI for manual work. */
export const PHONES_NEEDING_REVIEW: string[] = Object.keys(phoneData).filter(
  (phone) => !PHONE_GEOMETRIES[phone],
);
```

- [ ] **Step 3: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

Then confirm the spec table covers the inventory. The repo has no TS runner, so check coverage mechanically against the source data with:

```bash
grep -oP "^\s+'[^']+'(?=:)" app/data/phonology/phoneData.ts | tr -d " '" | sort > /tmp/fg-phones.txt
grep -c . /tmp/fg-phones.txt
```

Expected: **55**. Every one of those symbols must appear exactly once as a key of `PHONE_GEOMETRY_SPECS` (note `p'` is written with double quotes there because it contains an apostrophe). If a phone is genuinely missing a spec, leave it out deliberately — it lands in `PHONES_NEEDING_REVIEW`, which is what that list is for. Do not invent a placeholder entry to make the count line up.

Expected derivations to hand-check while reading:
- `t` → nodes `{Coronal}`; `anterior '+'`, `distributed '-'`, `strident '-'`, `lateral '-'`; `round`/`back`/`low`/`high`/`ATR`/`RTR` all unspecified.
- `k` → nodes `{Dorsal}`; `back '+'`, `high '+'`, `low '-'`; no coronal leaves, no `round`.
- `w` → nodes `{Labial, Dorsal}`; `round '+'`, `back '+'`, `high '+'`, `low '-'`.

- [ ] **Step 4: Commit**

```bash
git add app/data/phonology/phoneGeometry.ts
git commit -m "feat: derive per-phone feature geometry from flat feature table"
```

---

## Task 4: `FeatureGeometryTree` SVG component

**Files:**
- Create: `app/components/phonology/FeatureGeometryTree.tsx`

**Interfaces:**
- Consumes: `GEOMETRY_TREE`, `GEOMETRY_VIEWBOX`, `GEOMETRY_LINE_HEIGHT`, `computeActiveIds` and the types from `app/data/phonology/featureGeometry`.
- Produces: `export default function FeatureGeometryTree(props: FeatureGeometryTreeProps)` with

```ts
export interface FeatureGeometryTreeProps {
  geometry: PhoneGeometry;
  size?: 'mini' | 'full';
}
```

Purely presentational: no state, no data imports, no selection logic.

- [ ] **Step 1: Write the component**

Create `app/components/phonology/FeatureGeometryTree.tsx`:

```tsx
import {
  GEOMETRY_LINE_HEIGHT,
  GEOMETRY_TREE,
  GEOMETRY_VIEWBOX,
  computeActiveIds,
} from '../../data/phonology/featureGeometry';
import type {
  GeometryNodeId,
  GeometryTreeNode,
  PhoneGeometry,
} from '../../data/phonology/featureGeometry';

export interface FeatureGeometryTreeProps {
  geometry: PhoneGeometry;
  size?: 'mini' | 'full';
}

const NODE_FONT_SIZE = 15;
const LEAF_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 17;

/** Faint enough to read as "absent from this representation", still legible. */
const INACTIVE_OPACITY = 0.22;

/** Rendered CSS width. Narrower viewports scroll the container rather than shrink the type. */
const RENDERED_WIDTH: Record<'mini' | 'full', number> = { mini: 900, full: 1240 };

const NODES_BY_ID = new Map<GeometryNodeId, GeometryTreeNode>(
  GEOMETRY_TREE.map((n) => [n.id, n]),
);

/** Bottom of a node's text block — where an edge to a child leaves from. */
function anchorBottom(node: GeometryTreeNode): number {
  return node.y + (node.label.length - 1) * GEOMETRY_LINE_HEIGHT + 6;
}

/** Top of a node's text block — where an edge from its parent arrives. */
function anchorTop(node: GeometryTreeNode): number {
  return node.y - 12;
}

/** Baseline for the value glyph printed under a leaf. */
function valueBaseline(node: GeometryTreeNode): number {
  return node.y + (node.label.length - 1) * GEOMETRY_LINE_HEIGHT + 22;
}

function valueGlyph(value: '+' | '-' | undefined): string {
  if (value === '+') return '+';
  if (value === '-') return '−'; // minus sign, not a hyphen
  return '—'; // em dash
}

export default function FeatureGeometryTree({
  geometry,
  size = 'full',
}: FeatureGeometryTreeProps) {
  const active = computeActiveIds(geometry);
  const strokeWidth = size === 'mini' ? 2 : 1.6;

  return (
    <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
      <svg
        viewBox={`0 0 ${GEOMETRY_VIEWBOX.width} ${GEOMETRY_VIEWBOX.height}`}
        width={RENDERED_WIDTH[size]}
        height={(RENDERED_WIDTH[size] * GEOMETRY_VIEWBOX.height) / GEOMETRY_VIEWBOX.width}
        className="max-w-none"
        role="img"
        aria-label="Feature geometry tree"
      >
        {/* Edges first so text sits on top of them. */}
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
          {GEOMETRY_TREE.map((node) => {
            if (node.parent === null) return null;
            const parent = NODES_BY_ID.get(node.parent);
            if (!parent) return null;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={anchorBottom(parent)}
                x2={node.x}
                y2={anchorTop(node)}
                opacity={active.has(node.id) ? 1 : INACTIVE_OPACITY}
              />
            );
          })}
        </g>

        <g fill="currentColor" textAnchor="middle">
          {GEOMETRY_TREE.map((node) => {
            const isActive = active.has(node.id);
            const isLeaf = node.kind === 'leaf';
            return (
              <g key={`node-${node.id}`} opacity={isActive ? 1 : INACTIVE_OPACITY}>
                {node.label.map((line, i) => (
                  <text
                    key={`${node.id}-line-${i}`}
                    x={node.x}
                    y={node.y + i * GEOMETRY_LINE_HEIGHT}
                    fontSize={isLeaf ? LEAF_FONT_SIZE : NODE_FONT_SIZE}
                    fontWeight={isLeaf ? 400 : 600}
                  >
                    {line}
                  </text>
                ))}
                {isLeaf && node.leaf && (
                  <text
                    x={node.x}
                    y={valueBaseline(node)}
                    fontSize={VALUE_FONT_SIZE}
                    fontWeight={700}
                  >
                    {valueGlyph(geometry.leaves[node.leaf])}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

There is no page rendering this component yet — visual verification happens in Task 6. Do not add a throwaway route to preview it.

- [ ] **Step 3: Commit**

```bash
git add app/components/phonology/FeatureGeometryTree.tsx
git commit -m "feat: add inline-SVG feature geometry tree component"
```

---

## Task 5: Tab layout route

**Files:**
- Create: `app/routes/phonology.layout.tsx`
- Modify: `app/routes.ts`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: a layout route rendering `<Outlet />`, with `/phonology` (index) and `/phonology/geometry` as children.

`app/routes/phonology.geometry.tsx` does not exist yet. Create it in this task as a **minimal placeholder** so the route config type-checks and the tab is navigable; Task 6 replaces its body entirely.

- [ ] **Step 1: Write the layout**

Create `app/routes/phonology.layout.tsx`:

```tsx
import { NavLink, Outlet } from 'react-router';

const TABS = [
  { to: '/phonology', label: 'Feature Explorer', end: true },
  { to: '/phonology/geometry', label: 'Feature Geometry', end: false },
];

export default function PhonologyLayout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6 flex gap-1">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className={({ isActive }) =>
                `px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <Outlet />
    </div>
  );
}
```

- [ ] **Step 2: Add the placeholder geometry route**

Create `app/routes/phonology.geometry.tsx`:

```tsx
export default function FeatureGeometryScreen() {
  return <div className="p-6">Feature Geometry</div>;
}
```

- [ ] **Step 3: Nest the routes**

Replace the `route("phonology", "routes/phonology.tsx"),` line in `app/routes.ts` with:

```ts
  route("phonology", "routes/phonology.layout.tsx", [
    index("routes/phonology.tsx"),
    route("geometry", "routes/phonology.geometry.tsx"),
  ]),
```

`index` is already imported at the top of the file — do not add a duplicate import.

- [ ] **Step 4: Verify**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

Run: `npm run dev`.
- `http://localhost:5173/phonology` → tab bar with **Feature Explorer** underlined in blue, and the unchanged Feature Explorer below it.
- Click **Feature Geometry** → URL becomes `/phonology/geometry`, that tab is underlined, page shows the placeholder text.
- Click back to **Feature Explorer** → the explorer renders, selections and imports still work.

- [ ] **Step 5: Commit**

```bash
git add app/routes.ts app/routes/phonology.layout.tsx app/routes/phonology.geometry.tsx
git commit -m "feat: nest phonology routes under a tab layout"
```

---

## Task 6: The Feature Geometry screen

**Files:**
- Modify: `app/routes/phonology.geometry.tsx` (replace the placeholder body entirely)

**Interfaces:**
- Consumes: `phoneData`, `getPhoneCategory` from `app/data/phonology/phoneData`; `PHONE_GEOMETRIES`, `PHONES_NEEDING_REVIEW`, `GEOMETRY_REVIEW_NOTES` from `app/data/phonology/phoneGeometry`; `combineGeometries`, `emptyGeometry` from `app/data/phonology/featureGeometry`; `FeatureGeometryTree` from `app/components/phonology/FeatureGeometryTree`.
- Produces: the default-exported route component. Nothing else imports from it.

- [ ] **Step 1: Write the screen**

Replace the entire contents of `app/routes/phonology.geometry.tsx` with:

```tsx
import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import FeatureGeometryTree from '../components/phonology/FeatureGeometryTree';
import { getPhoneCategory, phoneData } from '../data/phonology/phoneData';
import { combineGeometries, emptyGeometry } from '../data/phonology/featureGeometry';
import {
  GEOMETRY_REVIEW_NOTES,
  PHONES_NEEDING_REVIEW,
  PHONE_GEOMETRIES,
} from '../data/phonology/phoneGeometry';
import type { PhoneCategory } from '../data/phonology/phoneData';

const ALL_PHONES = Object.keys(phoneData);

/** Same palette as the Feature Explorer's grid, so the two screens read as one tool. */
const CATEGORY_CLASSES: Record<PhoneCategory, { idle: string; selected: string }> = {
  vowel: {
    idle: 'bg-red-100 dark:bg-red-900 hover:bg-red-200 dark:hover:bg-red-800',
    selected: 'bg-red-500 dark:bg-red-700',
  },
  sonorant: {
    idle: 'bg-yellow-100 dark:bg-yellow-900 hover:bg-yellow-200 dark:hover:bg-yellow-800',
    selected: 'bg-yellow-500 dark:bg-yellow-700',
  },
  obstruent: {
    idle: 'bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800',
    selected: 'bg-blue-500 dark:bg-blue-700',
  },
};

export default function FeatureGeometryScreen() {
  const [selectedPhones, setSelectedPhones] = useState<string[]>([]);

  const togglePhone = (phone: string) => {
    setSelectedPhones((prev) =>
      prev.includes(phone) ? prev.filter((p) => p !== phone) : [...prev, phone],
    );
  };

  /** Selected phones that actually have a derived geometry. */
  const selectedWithGeometry = useMemo(
    () => selectedPhones.filter((phone) => PHONE_GEOMETRIES[phone]),
    [selectedPhones],
  );

  const combined = useMemo(() => {
    if (selectedWithGeometry.length === 0) return emptyGeometry();
    return combineGeometries(selectedWithGeometry.map((phone) => PHONE_GEOMETRIES[phone]));
  }, [selectedWithGeometry]);

  const activeNotes = useMemo(
    () => selectedPhones.filter((phone) => GEOMETRY_REVIEW_NOTES[phone]),
    [selectedPhones],
  );

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Feature Geometry
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-8">
          Select phones to see each one&rsquo;s feature-geometry tree and the structure they
          share. Nodes are privative: a greyed branch is absent from the representation, not
          negatively specified.
        </p>

        {/* Phone grid */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Phones ({ALL_PHONES.length})
            </h2>
            <button
              onClick={() => setSelectedPhones([])}
              className="flex items-center px-4 py-2 bg-gray-500 dark:bg-gray-700 text-white rounded-md hover:bg-gray-600 dark:hover:bg-gray-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </button>
          </div>

          <div className="grid grid-cols-6 md:grid-cols-12 lg:grid-cols-16 gap-2 mb-6">
            {ALL_PHONES.map((phone) => {
              const isSelected = selectedPhones.includes(phone);
              const classes = CATEGORY_CLASSES[getPhoneCategory(phone)];
              return (
                <button
                  key={phone}
                  onClick={() => togglePhone(phone)}
                  className={`p-3 rounded-lg text-center font-sans text-lg transition-colors ${
                    isSelected
                      ? `${classes.selected} text-white`
                      : `${classes.idle} text-gray-800 dark:text-gray-100`
                  }`}
                  title={`${phone} - Click to ${isSelected ? 'deselect' : 'select'}`}
                >
                  {phone}
                </button>
              );
            })}
          </div>

          <div className="flex justify-center space-x-6 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-100 dark:bg-red-900 rounded mr-2"></div>
              Vowels
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-100 dark:bg-yellow-900 rounded mr-2"></div>
              Sonorants
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-100 dark:bg-blue-900 rounded mr-2"></div>
              Obstruents
            </div>
          </div>
        </div>

        {/* Combined tree */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
            Shared geometry
            {selectedWithGeometry.length > 0 && (
              <span className="ml-2 font-normal text-base text-gray-500 dark:text-gray-400">
                {selectedWithGeometry.join(' ')}
              </span>
            )}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            A node stays solid only if every selected phone has it; a leaf shows a value only
            if they all specify it and agree.
          </p>
          {selectedWithGeometry.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">
              Select one or more phones above.
            </p>
          ) : (
            <FeatureGeometryTree geometry={combined} size="full" />
          )}
        </div>

        {/* Per-phone mini trees */}
        {selectedWithGeometry.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Per-phone geometry
            </h2>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {selectedWithGeometry.map((phone) => (
                <div
                  key={phone}
                  className="border border-gray-200 dark:border-gray-800 rounded-lg p-4"
                >
                  <div className="text-2xl font-sans mb-2 text-gray-900 dark:text-gray-100">
                    {phone}
                  </div>
                  <FeatureGeometryTree geometry={PHONE_GEOMETRIES[phone]} size="mini" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Needs review */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Needs review
          </h2>

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">No geometry</h3>
          {PHONES_NEEDING_REVIEW.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Every phone in the inventory has a derived geometry.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-6">
              {PHONES_NEEDING_REVIEW.map((phone) => (
                <span
                  key={phone}
                  className="px-3 py-1 bg-amber-100 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-full text-sm"
                >
                  {phone}
                </span>
              ))}
            </div>
          )}

          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
            Derived with a judgment call
          </h3>
          <ul className="space-y-1">
            {Object.entries(GEOMETRY_REVIEW_NOTES).map(([phone, note]) => (
              <li
                key={phone}
                className={`text-sm text-gray-600 dark:text-gray-300 rounded px-2 py-1 ${
                  activeNotes.includes(phone) ? 'bg-amber-50 dark:bg-amber-950' : ''
                }`}
              >
                <span className="font-sans text-base text-gray-900 dark:text-gray-100 mr-2">
                  {phone}
                </span>
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify types**

Run: `npx tsc --noEmit`
Expected: exits 0, no output.

- [ ] **Step 3: Verify the screen in the browser**

Run: `npm run dev`, open `http://localhost:5173/phonology/geometry`.

Check each of these and report what you saw:

1. **Empty state** — the phone grid shows all 55 phones with the same red/yellow/blue colors as the Feature Explorer; "Shared geometry" says "Select one or more phones above."; the per-phone section is hidden; "Needs review" shows "Every phone in the inventory has a derived geometry." and the judgment-call list.
2. **Single phone `t`** — the tree shows `Coronal` solid with `[strident] − [anterior] + [distributed] − [lateral] −`; `Labial`, `Dorsal`, `Tongue Root Node` and the whole Tonal branch are faint; `[round]`, `[back]`, `[low]`, `[high]`, `[ATR]`, `[RTR]`, `[hi]`, `[Hi]` all read `—` and are faint.
3. **Single phone `k`** — `Dorsal` solid with `[back] +`, `[low] −`, `[high] +`; `Coronal` and `Labial` faint.
4. **Single phone `w`** — both `Labial` (`[round] +`) and `Dorsal` (`[back] +`, `[high] +`, `[low] −`) solid; `Coronal` faint.
5. **Natural class** — select `t d s z n l ɬ ɾ θ ð ts` (all coronals): the shared tree keeps `Coronal` solid and greys `Labial`, `Dorsal`, `Tongue Root Node`. Leaves that differ across the set (e.g. `[voice]`, `[continuant]`) read `—`; leaves they agree on (e.g. `[anterior] +`) show the value.
6. **Disagreement** — select `t` and `k`: `Place` stays solid but `Coronal` and `Dorsal` both go faint (neither is shared), and `[consonantal] +`, `[sonorant] −` still show since both agree.
7. **Mini-trees** — selecting 3-4 phones renders one labelled mini-tree each in a 1-/2-column grid; each tile scrolls horizontally on a narrow window rather than shrinking the text to nothing.
8. **Dark mode** — toggle the OS/browser theme; strokes and text stay legible in both.
9. **No regression** — click back to the Feature Explorer tab; it still works.

If any check fails, fix it and re-run the full list before committing.

- [ ] **Step 4: Commit**

```bash
git add app/routes/phonology.geometry.tsx
git commit -m "feat: add feature geometry screen with shared and per-phone trees"
```

---

## Self-review notes

Spec coverage check against `docs/superpowers/specs/2026-08-04-feature-geometry-design.md`:

| Spec requirement | Task |
|---|---|
| Fixed tree topology matching the source diagram | 2 |
| Privative node presence (Labial/Coronal/Dorsal/TongueRoot/Tonal) | 2 (types), 3 (data) |
| Leaf values plus/minus/undefined, `—` when unspecified | 2, 4 |
| `aspirated → spreadGlottis`, `glottal → constrictedGlottis`, `ATR −  → RTR +`, `delayed_release` dropped | 3 |
| Place-node presence derived from articulation | 3 |
| `FeatureGeometryTree` presentational, inline SVG, theme-aware, three visual states, `size` prop | 4 |
| Shared-node and shared-leaf aggregation as pure functions | 2 |
| Phone grid coloured by class, click to toggle | 6 |
| Per-phone mini-trees | 6 |
| Combined `size="full"` tree | 6 |
| "Needs review" panel | 3 (data), 6 (UI) |
| `/phonology` layout route with two tabs, explorer unchanged | 1, 5 |
| `app/routes.ts` updated | 5 |
| Unit tests | **Not implemented** — see Global Constraints; user chose no test runner |
| Tonal node drawn but always unspecified | 2, 3 |
| No editing/persisting geometry from the UI | n/a — not built |
