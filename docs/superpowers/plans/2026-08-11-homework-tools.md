# Homework Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two client-side builder tools inside `linguistics.pricejoshua.com` — a Feature Geometry Tree builder and a Formal Rule Notation builder — that students use to construct the hardest-to-hand-draw parts of their phonology homework, then export as PNG (clipboard, one click) or SVG (download, true vector) to paste into Word.

**Architecture:** New self-contained module (`app/routes/hw-tools.*`, `app/components/hw-tools/*`, `app/data/hw-tools/*`, `app/utils/hw-tools/*`) added to the existing React Router 7 app. Both tools follow the same shape: local `useState` holds the in-progress structure, a presentational SVG component renders it, and a shared export utility rasterizes that SVG to a clipboard PNG or downloads it as an SVG file. No backend, no persistence.

**Tech Stack:** React 19, React Router 7 (file-based route config in `app/routes.ts`), TypeScript (strict), Tailwind 4. No new dependencies — export logic uses only browser-native APIs (`Canvas`, `Blob`, `navigator.clipboard`).

## Global Constraints

- No backend, no persistence, no auth — every tool is stateless; a page refresh loses in-progress work (by design, per spec).
- Ships as new routes inside the **existing** `linguistics.pricejoshua.com` container/nginx route — no new self-hosted service, no new Uptime Kuma monitor, no deployment changes.
- No new npm dependencies. Export logic (rasterization, clipboard, file download) uses only browser-native APIs.
- Deliberately **decoupled** from the existing `/phonology/geometry` reference screen: own copy of the tree topology, own components. Do not import from or modify `app/data/phonology/featureGeometry.ts` or `app/components/phonology/FeatureGeometryTree.tsx`.
- No test framework is being introduced. This repo has none (`test/` holds unrelated HTML fixtures; no test script in `package.json`), and the approved design spec explicitly decided against adding one for this tool. Verification per task is `npm run typecheck` plus a concrete manual check in the browser (steps specify exact clicks/inputs and exact expected results).
- Desktop-only. No mobile/tablet-specific layout work.
- Follow existing code conventions: relative imports within a module's own directory tree (matching `app/components/phonology/*` and `app/data/phonology/*`), Tailwind utility classes with `dark:` variants matching the existing phonology screens' palette, single quotes / no semicolons style matching `phonology.geometry.tsx` and `featureGeometry.ts` (not the double-quote style in older files like `home.tsx` — match whichever file is closest analog to what you're writing).

---

### Task 1: Route scaffolding and navigation

**Files:**
- Modify: `app/routes.ts`
- Create: `app/routes/hw-tools.layout.tsx`
- Create: `app/routes/hw-tools.feature-tree.tsx` (stub — replaced fully in Task 5)
- Create: `app/routes/hw-tools.rule-notation.tsx` (stub — replaced fully in Task 7)
- Modify: `app/pages/landing.tsx`

**Interfaces:**
- Produces: working routes at `/hw-tools` (index tab) and `/hw-tools/rule-notation` (second tab), reachable from the site's landing page; a `'Noto Sans'` web font loaded site-wide for consistent IPA/extended-Latin glyph rendering when exported diagrams are rasterized.

- [ ] **Step 1: Load an IPA-capable web font**

Modify `app/root.tsx` — add a Noto Sans stylesheet link alongside the existing Inter one, so glyphs outside basic Latin (IPA symbols students may type into rule slots, e.g. `ʃ ʒ ɡ ɾ`) render consistently across browsers when a diagram is rasterized to PNG:

```tsx
export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&family=Noto+Sans+Mono:wght@400..700&display=swap",
  },
];
```

- [ ] **Step 2: Add the tab layout**

Create `app/routes/hw-tools.layout.tsx`:

```tsx
import { NavLink, Outlet } from 'react-router';

const TABS = [
  { to: '/hw-tools', label: 'Feature Tree', end: true },
  { to: '/hw-tools/rule-notation', label: 'Rule Notation', end: false },
];

export default function HwToolsLayout() {
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

- [ ] **Step 2: Add stub pages**

Create `app/routes/hw-tools.feature-tree.tsx`:

```tsx
export default function FeatureTreeTool() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Feature Geometry Tree Builder</h1>
    </div>
  );
}
```

Create `app/routes/hw-tools.rule-notation.tsx`:

```tsx
export default function RuleNotationTool() {
  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Rule Notation Builder</h1>
    </div>
  );
}
```

- [ ] **Step 3: Wire the routes**

Modify `app/routes.ts` — insert the new section after the `phonology` block:

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("phonology", "routes/phonology.layout.tsx", [
    index("routes/phonology.tsx"),
    route("geometry", "routes/phonology.geometry.tsx"),
  ]),
  route("hw-tools", "routes/hw-tools.layout.tsx", [
    index("routes/hw-tools.feature-tree.tsx"),
    route("rule-notation", "routes/hw-tools.rule-notation.tsx"),
  ]),
  route("flashcards", "routes/flashcards.tsx"),
  route("anki", "routes/anki.tsx"),
  route("glossary", "routes/glossary.tsx"),
  route("glossary/:slug", "routes/glossary.$slug.tsx"),
] satisfies RouteConfig;
```

- [ ] **Step 4: Add a landing page entry**

Modify `app/pages/landing.tsx` — add an entry to the `pages` array, right after the phonology entry:

```ts
const pages = [
  { path: "/", label: "Home" },
  { path: "/phonology", label: "Phonology Helper" },
  { path: "/hw-tools", label: "Homework Tools" },
  { path: "/anki", label: "Anki GPA Flashcard Helpers" },
  { path: "/glossary", label: "Linguistics Glossary" },
];
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open the site in a browser.
Expected: the landing page shows a "Homework Tools" link; clicking it lands on `/hw-tools` with a "Feature Tree" tab active and the stub heading visible; clicking "Rule Notation" navigates to `/hw-tools/rule-notation` with that tab active and its stub heading visible.

- [ ] **Step 6: Commit**

```bash
git add app/root.tsx app/routes.ts app/routes/hw-tools.layout.tsx app/routes/hw-tools.feature-tree.tsx app/routes/hw-tools.rule-notation.tsx app/pages/landing.tsx
git commit -m "feat(hw-tools): scaffold routes, navigation, and IPA-capable web font"
```

---

### Task 2: Feature tree topology data and builder-state logic

**Files:**
- Create: `app/data/hw-tools/featureTreeTopology.ts`
- Create: `app/utils/hw-tools/treeBuilderState.ts`

**Interfaces:**
- Consumes: nothing (leaf task, no dependency on other hw-tools files).
- Produces:
  - `TreeNodeId` (union type), `TreeNode` (interface: `id`, `label: string[]`, `x: number`, `y: number`, `parent: TreeNodeId | null`, `kind: 'node' | 'leaf'`), `TREE_NODES: TreeNode[]`, `VIEWBOX: { width: 1240, height: 520 }`, `LINE_HEIGHT: 15` — from `featureTreeTopology.ts`.
  - `NodeState` (interface: `active: boolean`, `value?: '+' | '-'`), `TreeBuilderState` (`Map<TreeNodeId, NodeState>`), `emptyTreeState(): TreeBuilderState`, `toggleNode(state, id): TreeBuilderState`, `cycleLeafValue(state, id): TreeBuilderState`, `activeNodeIds(state): Set<TreeNodeId>` — from `treeBuilderState.ts`.

- [ ] **Step 1: Write the topology data**

Create `app/data/hw-tools/featureTreeTopology.ts`:

```ts
export type TreeNodeKind = 'node' | 'leaf';

export type TreeNodeId =
  | 'cvx' | 'root' | 'tonal' | 'laryngeal' | 'supralaryngeal' | 'register' | 'mode'
  | 'voice' | 'constrictedGlottis' | 'spreadGlottis'
  | 'place' | 'sonorant' | 'consonantal' | 'continuant' | 'nasal'
  | 'toneRegisterHi' | 'toneModeHi'
  | 'labial' | 'coronal' | 'dorsal' | 'tongueRoot'
  | 'round' | 'strident' | 'anterior' | 'distributed' | 'lateral'
  | 'back' | 'low' | 'high' | 'ATR' | 'RTR';

export interface TreeNode {
  id: TreeNodeId;
  label: string[];
  x: number;
  y: number;
  parent: TreeNodeId | null;
  kind: TreeNodeKind;
}

export const VIEWBOX = { width: 1240, height: 520 } as const;
export const LINE_HEIGHT = 15;

/**
 * Own copy of the canonical feature-geometry topology (see
 * app/data/phonology/featureGeometry.ts). Deliberately duplicated rather
 * than imported — this tool's editing model (direct manual toggling) and
 * render mode (omit vs. grey inactive nodes) diverge from the reference
 * screen, and the two are meant to evolve independently.
 */
export const TREE_NODES: TreeNode[] = [
  { id: 'cvx', label: ['C/V/X'], x: 940, y: 30, parent: null, kind: 'node' },

  { id: 'root', label: ['Root Node'], x: 380, y: 112, parent: 'cvx', kind: 'node' },
  { id: 'tonal', label: ['Tonal', 'Node'], x: 1090, y: 112, parent: 'cvx', kind: 'node' },

  { id: 'laryngeal', label: ['Laryngeal', 'Node'], x: 172, y: 200, parent: 'root', kind: 'node' },
  { id: 'supralaryngeal', label: ['Supralaryngeal', 'Node'], x: 620, y: 200, parent: 'root', kind: 'node' },
  { id: 'register', label: ['Register'], x: 1030, y: 200, parent: 'tonal', kind: 'node' },
  { id: 'mode', label: ['Mode'], x: 1150, y: 200, parent: 'tonal', kind: 'node' },

  { id: 'voice', label: ['[voice]'], x: 75, y: 292, parent: 'laryngeal', kind: 'leaf' },
  { id: 'constrictedGlottis', label: ['[constricted', 'glottis]'], x: 172, y: 292, parent: 'laryngeal', kind: 'leaf' },
  { id: 'spreadGlottis', label: ['[spread', 'glottis]'], x: 272, y: 292, parent: 'laryngeal', kind: 'leaf' },

  { id: 'place', label: ['Place'], x: 430, y: 292, parent: 'supralaryngeal', kind: 'node' },
  { id: 'sonorant', label: ['[sonorant]'], x: 620, y: 292, parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'consonantal', label: ['[consonantal]'], x: 720, y: 292, parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'continuant', label: ['[continuant]'], x: 820, y: 292, parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'nasal', label: ['[nasal]'], x: 905, y: 292, parent: 'supralaryngeal', kind: 'leaf' },

  { id: 'toneRegisterHi', label: ['[hi]'], x: 1030, y: 292, parent: 'register', kind: 'leaf' },
  { id: 'toneModeHi', label: ['[Hi]'], x: 1150, y: 292, parent: 'mode', kind: 'leaf' },

  { id: 'labial', label: ['Labial'], x: 75, y: 382, parent: 'place', kind: 'node' },
  { id: 'coronal', label: ['Coronal'], x: 315, y: 382, parent: 'place', kind: 'node' },
  { id: 'dorsal', label: ['Dorsal'], x: 610, y: 382, parent: 'place', kind: 'node' },
  { id: 'tongueRoot', label: ['Tongue Root', 'Node'], x: 930, y: 382, parent: 'place', kind: 'node' },

  { id: 'round', label: ['[round]'], x: 75, y: 474, parent: 'labial', kind: 'leaf' },
  { id: 'strident', label: ['[strident]'], x: 175, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'anterior', label: ['[anterior]'], x: 265, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'distributed', label: ['[distributed]'], x: 365, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'lateral', label: ['[lateral]'], x: 455, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'back', label: ['[back]'], x: 545, y: 474, parent: 'dorsal', kind: 'leaf' },
  { id: 'low', label: ['[low]'], x: 610, y: 474, parent: 'dorsal', kind: 'leaf' },
  { id: 'high', label: ['[high]'], x: 675, y: 474, parent: 'dorsal', kind: 'leaf' },
  { id: 'ATR', label: ['[ATR]'], x: 895, y: 474, parent: 'tongueRoot', kind: 'leaf' },
  { id: 'RTR', label: ['[RTR]'], x: 965, y: 474, parent: 'tongueRoot', kind: 'leaf' },
];
```

- [ ] **Step 2: Write the builder-state logic**

Create `app/utils/hw-tools/treeBuilderState.ts`:

```ts
import { TREE_NODES, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';

export interface NodeState {
  active: boolean;
  value?: '+' | '-';
}

export type TreeBuilderState = Map<TreeNodeId, NodeState>;

const NODES_BY_ID = new Map(TREE_NODES.map((n) => [n.id, n]));

export function emptyTreeState(): TreeBuilderState {
  return new Map();
}

function ancestorsOf(id: TreeNodeId): TreeNodeId[] {
  const result: TreeNodeId[] = [];
  let current = NODES_BY_ID.get(id);
  while (current && current.parent !== null) {
    result.push(current.parent);
    current = NODES_BY_ID.get(current.parent);
  }
  return result;
}

function descendantsOf(id: TreeNodeId): TreeNodeId[] {
  const result: TreeNodeId[] = [];
  const stack: TreeNodeId[] = TREE_NODES.filter((n) => n.parent === id).map((n) => n.id);
  while (stack.length > 0) {
    const next = stack.pop() as TreeNodeId;
    result.push(next);
    for (const child of TREE_NODES.filter((n) => n.parent === next)) {
      stack.push(child.id);
    }
  }
  return result;
}

function isActive(state: TreeBuilderState, id: TreeNodeId): boolean {
  return state.get(id)?.active ?? false;
}

/**
 * Toggles a node. Activating cascades up (ancestors become active, since a
 * node can't be drawn floating without its structural parents). Deactivating
 * cascades down (descendants become inactive and lose their values).
 */
export function toggleNode(state: TreeBuilderState, id: TreeNodeId): TreeBuilderState {
  const next = new Map(state);
  if (!isActive(state, id)) {
    for (const nid of [id, ...ancestorsOf(id)]) {
      next.set(nid, { ...next.get(nid), active: true });
    }
  } else {
    for (const nid of [id, ...descendantsOf(id)]) {
      next.set(nid, { active: false, value: undefined });
    }
  }
  return next;
}

const VALUE_CYCLE: (undefined | '+' | '-')[] = [undefined, '+', '-'];

/**
 * Cycles a leaf's value: unspecified -> + -> - -> unspecified. Setting a
 * value activates the leaf and cascades ancestors active, same as
 * `toggleNode`. Clearing it deactivates just the leaf (leaves have no
 * descendants, so there's nothing to cascade down).
 */
export function cycleLeafValue(state: TreeBuilderState, id: TreeNodeId): TreeBuilderState {
  const next = new Map(state);
  const current = next.get(id)?.value;
  const currentIndex = VALUE_CYCLE.indexOf(current);
  const value = VALUE_CYCLE[(currentIndex + 1) % VALUE_CYCLE.length];
  if (value === undefined) {
    next.set(id, { active: false, value: undefined });
  } else {
    next.set(id, { active: true, value });
    for (const nid of ancestorsOf(id)) {
      next.set(nid, { ...next.get(nid), active: true });
    }
  }
  return next;
}

export function activeNodeIds(state: TreeBuilderState): Set<TreeNodeId> {
  const active = new Set<TreeNodeId>();
  for (const [id, s] of state) if (s.active) active.add(id);
  return active;
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors.

No UI exists yet to exercise this interactively — behavioral verification (clicking through the cascade rules) happens in Task 3 once `EditableFeatureTree` is wired up. This step is a compile-correctness check only.

- [ ] **Step 4: Commit**

```bash
git add app/data/hw-tools/featureTreeTopology.ts app/utils/hw-tools/treeBuilderState.ts
git commit -m "feat(hw-tools): add feature tree topology and builder-state logic"
```

---

### Task 3: `EditableFeatureTree` component

**Files:**
- Create: `app/components/hw-tools/EditableFeatureTree.tsx`

**Interfaces:**
- Consumes: `TREE_NODES`, `VIEWBOX`, `LINE_HEIGHT`, `TreeNode`, `TreeNodeId` from `app/data/hw-tools/featureTreeTopology.ts`; `activeNodeIds`, `TreeBuilderState` from `app/utils/hw-tools/treeBuilderState.ts`.
- Produces: default-exported `EditableFeatureTree`, a `forwardRef<SVGSVGElement, EditableFeatureTreeProps>` component with props `{ state: TreeBuilderState; onToggleNode: (id: TreeNodeId) => void; onCycleLeaf: (id: TreeNodeId) => void; label: string; mode: 'edit' | 'export' }`.

- [ ] **Step 1: Write the component**

Create `app/components/hw-tools/EditableFeatureTree.tsx`:

```tsx
import { forwardRef } from 'react';
import { TREE_NODES, VIEWBOX, LINE_HEIGHT, type TreeNode, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { activeNodeIds, type TreeBuilderState } from '../../utils/hw-tools/treeBuilderState';

export interface EditableFeatureTreeProps {
  state: TreeBuilderState;
  onToggleNode: (id: TreeNodeId) => void;
  onCycleLeaf: (id: TreeNodeId) => void;
  label: string;
  /** 'edit' shows every node, inactive ones faint, all clickable — this is the on-screen editor. 'export' omits inactive nodes/edges entirely — this is what gets copied. */
  mode: 'edit' | 'export';
}

const NODES_BY_ID = new Map(TREE_NODES.map((n) => [n.id, n]));
const NODE_FONT_SIZE = 15;
const LEAF_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 17;
const INACTIVE_OPACITY = 0.25;

function anchorBottom(node: TreeNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 6;
}
function anchorTop(node: TreeNode): number {
  return node.y - 12;
}
function valueBaseline(node: TreeNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 22;
}
function valueGlyph(value: '+' | '-' | undefined): string {
  if (value === '+') return '+';
  if (value === '-') return '−';
  return '';
}

const EditableFeatureTree = forwardRef<SVGSVGElement, EditableFeatureTreeProps>(
  function EditableFeatureTree({ state, onToggleNode, onCycleLeaf, label, mode }, ref) {
    const active = activeNodeIds(state);
    const interactive = mode === 'edit';
    const visibleNodes = TREE_NODES.filter((n) => interactive || active.has(n.id));

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        width={VIEWBOX.width}
        height={VIEWBOX.height}
        role="img"
        aria-label={label}
        className="text-gray-900 dark:text-gray-100"
      >
        <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          {visibleNodes.map((node) => {
            if (node.parent === null) return null;
            const parent = NODES_BY_ID.get(node.parent);
            if (!parent) return null;
            const edgeActive = active.has(node.id) && active.has(parent.id);
            if (!interactive && !edgeActive) return null;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={anchorBottom(parent)}
                x2={node.x}
                y2={anchorTop(node)}
                opacity={edgeActive ? 1 : INACTIVE_OPACITY}
              />
            );
          })}
        </g>

        <g fill="currentColor" textAnchor="middle">
          {visibleNodes.map((node) => {
            const isLeaf = node.kind === 'leaf';
            const isActive = active.has(node.id);
            const value = state.get(node.id)?.value;
            const handleActivate = () => (isLeaf ? onCycleLeaf(node.id) : onToggleNode(node.id));

            return (
              <g
                key={`node-${node.id}`}
                opacity={isActive ? 1 : INACTIVE_OPACITY}
                onClick={interactive ? handleActivate : undefined}
                className={interactive ? 'cursor-pointer' : undefined}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (e: React.KeyboardEvent<SVGGElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleActivate();
                        }
                      }
                    : undefined
                }
              >
                {node.label.map((line, i) => (
                  <text
                    key={`${node.id}-line-${i}`}
                    x={node.x}
                    y={node.y + i * LINE_HEIGHT}
                    fontSize={isLeaf ? LEAF_FONT_SIZE : NODE_FONT_SIZE}
                    fontWeight={isLeaf ? 400 : 600}
                    fontFamily="'Noto Sans', sans-serif"
                  >
                    {line}
                  </text>
                ))}
                {isLeaf && isActive && (
                  <text
                    x={node.x}
                    y={valueBaseline(node)}
                    fontSize={VALUE_FONT_SIZE}
                    fontWeight={700}
                    fontFamily="'Noto Sans', sans-serif"
                  >
                    {valueGlyph(value)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  },
);

export default EditableFeatureTree;
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: no errors. (This component isn't reachable from a route yet — full behavioral verification happens in Task 5.)

- [ ] **Step 3: Commit**

```bash
git add app/components/hw-tools/EditableFeatureTree.tsx
git commit -m "feat(hw-tools): add EditableFeatureTree component"
```

---

### Task 4: Shared SVG export utility

**Files:**
- Create: `app/utils/hw-tools/svgExport.ts`
- Create: `app/components/hw-tools/ExportControls.tsx`

**Interfaces:**
- Produces: `copySvgAsPng(svg: SVGSVGElement, scale?: number): Promise<'copied' | 'downloaded'>` and `downloadSvg(svg: SVGSVGElement, filename: string): void` from `svgExport.ts`; default-exported `ExportControls` component with props `{ svgRef: React.RefObject<SVGSVGElement | null>; disabled: boolean; filenameBase: string }` from `ExportControls.tsx`.

- [ ] **Step 1: Write the export utility**

Create `app/utils/hw-tools/svgExport.ts`:

```ts
const XML_NS = 'http://www.w3.org/2000/svg';

function serializeSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute('xmlns', XML_NS);
  return new XMLSerializer().serializeToString(clone);
}

function svgToPngBlob(svg: SVGSVGElement, scale: number): Promise<Blob> {
  const svgString = serializeSvg(svg);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const width = svg.viewBox.baseVal.width || svg.width.baseVal.value;
      const height = svg.viewBox.baseVal.height || svg.height.baseVal.value;
      const canvas = document.createElement('canvas');
      canvas.width = width * scale;
      canvas.height = height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(image, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas produced no image data'));
      }, 'image/png');
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to rasterize SVG'));
    };
    image.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

/** Rasterizes the SVG to PNG and writes it to the clipboard. Falls back to a file download if the Clipboard API or an image write isn't available. */
export async function copySvgAsPng(svg: SVGSVGElement, scale = 3): Promise<'copied' | 'downloaded'> {
  const blob = await svgToPngBlob(svg, scale);
  if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
    try {
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      return 'copied';
    } catch {
      // fall through to download
    }
  }
  downloadBlob(blob, 'diagram.png');
  return 'downloaded';
}

/** Downloads the SVG as a .svg file for true-vector insertion via Word's Insert > Pictures. */
export function downloadSvg(svg: SVGSVGElement, filename: string): void {
  const svgString = serializeSvg(svg);
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  downloadBlob(blob, filename);
}
```

- [ ] **Step 2: Write the export controls component**

Create `app/components/hw-tools/ExportControls.tsx`:

```tsx
import { useState } from 'react';
import { copySvgAsPng, downloadSvg } from '../../utils/hw-tools/svgExport';

export interface ExportControlsProps {
  svgRef: React.RefObject<SVGSVGElement | null>;
  disabled: boolean;
  filenameBase: string;
}

export default function ExportControls({ svgRef, disabled, filenameBase }: ExportControlsProps) {
  const [status, setStatus] = useState<string | null>(null);

  const handleCopyPng = async () => {
    if (!svgRef.current) return;
    const result = await copySvgAsPng(svgRef.current);
    setStatus(
      result === 'copied'
        ? 'Copied to clipboard — paste into Word with Ctrl+V.'
        : 'Clipboard copy unavailable — PNG downloaded instead.',
    );
  };

  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    downloadSvg(svgRef.current, `${filenameBase}.svg`);
    setStatus('SVG downloaded — insert it in Word via Insert > Pictures for true vector quality.');
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handleCopyPng}
        disabled={disabled}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-700"
      >
        Copy as PNG
      </button>
      <button
        type="button"
        onClick={handleDownloadSvg}
        disabled={disabled}
        className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700"
      >
        Download SVG
      </button>
      {status && <span className="text-sm text-gray-600 dark:text-gray-300">{status}</span>}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`
Expected: no errors. (Not wired to a route yet — exercised end-to-end in Task 5.)

- [ ] **Step 4: Commit**

```bash
git add app/utils/hw-tools/svgExport.ts app/components/hw-tools/ExportControls.tsx
git commit -m "feat(hw-tools): add shared SVG export utility and controls"
```

---

### Task 5: Wire the Feature Tree Builder page

**Files:**
- Modify: `app/routes/hw-tools.feature-tree.tsx` (replaces the Task 1 stub entirely)

**Interfaces:**
- Consumes: `EditableFeatureTree` (Task 3), `ExportControls` (Task 4), `emptyTreeState`, `toggleNode`, `cycleLeafValue`, `activeNodeIds` (Task 2), `TreeNodeId` (Task 2).

- [ ] **Step 1: Replace the stub with the real page**

Replace the full contents of `app/routes/hw-tools.feature-tree.tsx`:

```tsx
import { useRef, useState } from 'react';
import EditableFeatureTree from '../components/hw-tools/EditableFeatureTree';
import ExportControls from '../components/hw-tools/ExportControls';
import { emptyTreeState, toggleNode, cycleLeafValue, activeNodeIds } from '../utils/hw-tools/treeBuilderState';
import type { TreeNodeId } from '../data/hw-tools/featureTreeTopology';

export default function FeatureTreeTool() {
  const [state, setState] = useState(emptyTreeState());
  const exportRef = useRef<SVGSVGElement>(null);

  const handleToggle = (id: TreeNodeId) => setState((s) => toggleNode(s, id));
  const handleCycle = (id: TreeNodeId) => setState((s) => cycleLeafValue(s, id));

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Feature Geometry Tree Builder
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Click a node to add it (and its ancestors); click again to remove it (and its descendants). Click a
          leaf to cycle its value: unspecified → + → − → unspecified.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nothing here is saved — copy your work before navigating away.
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded p-4">
        <EditableFeatureTree
          state={state}
          onToggleNode={handleToggle}
          onCycleLeaf={handleCycle}
          label="Feature geometry tree being built"
          mode="edit"
        />
      </div>

      <ExportControls svgRef={exportRef} disabled={activeNodeIds(state).size === 0} filenameBase="feature-tree" />

      <div className="sr-only" aria-hidden="true">
        <EditableFeatureTree
          ref={exportRef}
          state={state}
          onToggleNode={() => {}}
          onCycleLeaf={() => {}}
          label="Feature geometry tree export"
          mode="export"
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `/hw-tools` in a browser, and manually verify this exact sequence:
1. Click the "Root Node" label. Expected: "Root Node" and "C/V/X" both become solid (full opacity) — clicking a node auto-activates its ancestor chain.
2. Click "Supralaryngeal Node". Expected: it becomes solid, with a solid edge connecting it to "Root Node".
3. Click "Place". Expected: solid, edge from Supralaryngeal Node to Place appears.
4. Click "Coronal". Expected: solid, edge from Place to Coronal appears.
5. Click "[anterior]" (a leaf under Coronal). Expected: it cycles to showing a `+` below the label; click it two more times and expect `−` then blank again, cycling back.
6. With `[anterior]` showing `+`, click "Coronal" once (to toggle it off). Expected: Coronal, `[anterior]`, and all other Coronal children (`[strident]`, `[distributed]`, `[lateral]`) become faint (25% opacity) and the `+` value is cleared — deactivating cascades to descendants.
7. Click "Copy as PNG". Expected: a status message appears saying either "Copied to clipboard" or "downloaded instead"; in a Word document, press Ctrl+V and confirm a picture is pasted showing only the currently-active nodes (no faint/inactive nodes in the pasted image).
8. Click "Download SVG". Expected: a `feature-tree.svg` file downloads; opening it in a browser or vector viewer shows the same clean, active-only tree.

- [ ] **Step 3: Commit**

```bash
git add app/routes/hw-tools.feature-tree.tsx
git commit -m "feat(hw-tools): wire up the Feature Tree Builder page"
```

---

### Task 6: Rule notation data model and layout logic

**Files:**
- Create: `app/utils/hw-tools/ruleLayout.ts`

**Interfaces:**
- Produces: `RuleSlot` (union: `{ kind: 'text'; value: string } | { kind: 'matrix'; values: string[] }`), `Rule` (`RuleSlot[]`), `layoutRule(rule: Rule): RuleLayout`, and layout constants `CHAR_WIDTH`, `SLOT_GAP`, `LINE_HEIGHT`, `SLOT_PADDING_X`, `BRACKET_WIDTH`, `FONT_SIZE`.

- [ ] **Step 1: Write the layout logic**

Create `app/utils/hw-tools/ruleLayout.ts`:

```ts
export interface RuleSlotText {
  kind: 'text';
  value: string;
}

export interface RuleSlotMatrix {
  kind: 'matrix';
  values: string[];
}

export type RuleSlot = RuleSlotText | RuleSlotMatrix;
export type Rule = RuleSlot[];

/**
 * Fixed monospace character-width layout, not DOM measurement. Phonological
 * rule symbols are short (single characters or short feature names), so a
 * deterministic, testable pure function is preferred over two-pass
 * DOM-measured layout — a small amount of over/under-spacing is an
 * acceptable trade for simplicity here.
 */
export const CHAR_WIDTH = 11;
export const SLOT_GAP = 16;
export const LINE_HEIGHT = 22;
export const SLOT_PADDING_X = 8;
export const BRACKET_WIDTH = 8;
export const FONT_SIZE = 18;

export interface TextSlotLayout {
  kind: 'text';
  value: string;
  x: number;
  width: number;
}

export interface MatrixSlotLayout {
  kind: 'matrix';
  values: string[];
  x: number;
  width: number;
  /** Width of the text stack only, excluding the bracket glyphs on either side. */
  contentWidth: number;
}

export type SlotLayout = TextSlotLayout | MatrixSlotLayout;

export interface RuleLayout {
  slots: SlotLayout[];
  width: number;
  height: number;
  /** Vertical center — single-line text slots and matrix stacks are both centered on this. */
  midY: number;
}

function textSlotWidth(value: string): number {
  return value.length * CHAR_WIDTH + SLOT_PADDING_X * 2;
}

function matrixContentWidth(values: string[]): number {
  const longest = values.reduce((max, v) => Math.max(max, v.length), 0);
  return longest * CHAR_WIDTH;
}

export function layoutRule(rule: Rule): RuleLayout {
  const slots: SlotLayout[] = [];
  let cursor = 0;
  let maxStack = 1;

  for (const slot of rule) {
    if (slot.kind === 'text') {
      const width = textSlotWidth(slot.value);
      slots.push({ kind: 'text', value: slot.value, x: cursor, width });
      cursor += width + SLOT_GAP;
    } else {
      const contentWidth = matrixContentWidth(slot.values);
      const width = contentWidth + SLOT_PADDING_X * 2 + BRACKET_WIDTH * 2;
      slots.push({ kind: 'matrix', values: slot.values, x: cursor, width, contentWidth });
      cursor += width + SLOT_GAP;
      maxStack = Math.max(maxStack, slot.values.length);
    }
  }

  const width = Math.max(cursor - SLOT_GAP, 0);
  const height = Math.max(maxStack * LINE_HEIGHT, LINE_HEIGHT) + SLOT_PADDING_X * 2;

  return { slots, width, height, midY: height / 2 };
}
```

- [ ] **Step 2: Verify**

Run: `npm run typecheck`
Expected: no errors.

Manual sanity check — in the browser dev console on any page of the running dev server (after Step 1's file is saved, the module is part of the bundle graph once Task 7 imports it; for an isolated check now, temporarily paste the function body into the console, or defer this check to Task 7 where it's exercised live). Expected shape for `layoutRule([{ kind: 'text', value: 'C' }, { kind: 'matrix', values: ['-back', '-high'] }])`: two slots, the second one `height`-driving (`maxStack = 2`), `width` equal to the sum of both slot widths plus one gap.

- [ ] **Step 3: Commit**

```bash
git add app/utils/hw-tools/ruleLayout.ts
git commit -m "feat(hw-tools): add rule notation data model and layout logic"
```

---

### Task 7: Rule Notation Builder — components and page

**Files:**
- Create: `app/components/hw-tools/RuleDiagram.tsx`
- Create: `app/components/hw-tools/RuleBuilder.tsx`
- Modify: `app/routes/hw-tools.rule-notation.tsx` (replaces the Task 1 stub entirely)

**Interfaces:**
- Consumes: `layoutRule`, `LINE_HEIGHT`, `FONT_SIZE`, `BRACKET_WIDTH`, `Rule`, `RuleSlot` from Task 6.
- Produces: default-exported `RuleDiagram` (`forwardRef<SVGSVGElement, { rule: Rule; label: string }>`) and default-exported `RuleBuilder` (`{ rule: Rule; onChange: (rule: Rule) => void }`).

- [ ] **Step 1: Write the diagram renderer**

Create `app/components/hw-tools/RuleDiagram.tsx`:

```tsx
import { forwardRef } from 'react';
import { layoutRule, LINE_HEIGHT, FONT_SIZE, BRACKET_WIDTH, type Rule } from '../../utils/hw-tools/ruleLayout';

export interface RuleDiagramProps {
  rule: Rule;
  label: string;
}

const RuleDiagram = forwardRef<SVGSVGElement, RuleDiagramProps>(function RuleDiagram({ rule, label }, ref) {
  const layout = layoutRule(rule);
  const width = Math.max(layout.width, 40);
  const height = layout.height;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="text-gray-900 dark:text-gray-100"
    >
      <g fill="currentColor" fontFamily="'Noto Sans Mono', monospace" fontSize={FONT_SIZE} textAnchor="middle">
        {layout.slots.map((slot, i) => {
          if (slot.kind === 'text') {
            return (
              <text key={i} x={slot.x + slot.width / 2} y={layout.midY + FONT_SIZE / 3}>
                {slot.value}
              </text>
            );
          }
          const stackHeight = slot.values.length * LINE_HEIGHT;
          const top = layout.midY - stackHeight / 2;
          const bottom = layout.midY + stackHeight / 2;
          const centerX = slot.x + BRACKET_WIDTH + slot.contentWidth / 2;
          const leftX = slot.x;
          const rightX = slot.x + slot.width;
          return (
            <g key={i}>
              <path
                d={`M ${leftX + BRACKET_WIDTH} ${top} L ${leftX} ${top} L ${leftX} ${bottom} L ${leftX + BRACKET_WIDTH} ${bottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
              <path
                d={`M ${rightX - BRACKET_WIDTH} ${top} L ${rightX} ${top} L ${rightX} ${bottom} L ${rightX - BRACKET_WIDTH} ${bottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {slot.values.map((v, j) => (
                <text key={j} x={centerX} y={top + (j + 1) * LINE_HEIGHT - LINE_HEIGHT / 3}>
                  {v}
                </text>
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
});

export default RuleDiagram;
```

- [ ] **Step 2: Write the slot editor**

Create `app/components/hw-tools/RuleBuilder.tsx`:

```tsx
import type { Rule, RuleSlot } from '../../utils/hw-tools/ruleLayout';

export interface RuleBuilderProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
}

const QUICK_INSERT = ['→', 'Ø', '/', '_', '#'];

export default function RuleBuilder({ rule, onChange }: RuleBuilderProps) {
  const addTextSlot = (value = '') => onChange([...rule, { kind: 'text', value }]);
  const addMatrixSlot = () => onChange([...rule, { kind: 'matrix', values: [''] }]);

  const updateSlot = (index: number, slot: RuleSlot) => {
    const next = [...rule];
    next[index] = slot;
    onChange(next);
  };

  const removeSlot = (index: number) => onChange(rule.filter((_, i) => i !== index));

  const moveSlot = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rule.length) return;
    const next = [...rule];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_INSERT.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => addTextSlot(sym)}
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {sym}
          </button>
        ))}
        <button
          type="button"
          onClick={() => addTextSlot('')}
          className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          + Symbol
        </button>
        <button
          type="button"
          onClick={addMatrixSlot}
          className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          + Feature matrix
        </button>
      </div>

      <ul className="space-y-2">
        {rule.map((slot, i) => (
          <li
            key={i}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded p-2"
          >
            {slot.kind === 'text' ? (
              <input
                type="text"
                value={slot.value}
                onChange={(e) => updateSlot(i, { kind: 'text', value: e.target.value })}
                className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-24"
              />
            ) : (
              <div className="flex flex-col gap-1">
                {slot.values.map((v, j) => (
                  <input
                    key={j}
                    type="text"
                    value={v}
                    onChange={(e) => {
                      const values = [...slot.values];
                      values[j] = e.target.value;
                      updateSlot(i, { kind: 'matrix', values });
                    }}
                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-24"
                  />
                ))}
                <button
                  type="button"
                  onClick={() => updateSlot(i, { kind: 'matrix', values: [...slot.values, ''] })}
                  className="text-sm text-blue-600 dark:text-blue-400 text-left"
                >
                  + feature line
                </button>
              </div>
            )}
            <button type="button" onClick={() => moveSlot(i, -1)} aria-label="Move left">
              ←
            </button>
            <button type="button" onClick={() => moveSlot(i, 1)} aria-label="Move right">
              →
            </button>
            <button type="button" onClick={() => removeSlot(i)} aria-label="Remove slot">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

- [ ] **Step 3: Wire the page**

Replace the full contents of `app/routes/hw-tools.rule-notation.tsx`:

```tsx
import { useRef, useState } from 'react';
import RuleBuilder from '../components/hw-tools/RuleBuilder';
import RuleDiagram from '../components/hw-tools/RuleDiagram';
import ExportControls from '../components/hw-tools/ExportControls';
import type { Rule } from '../utils/hw-tools/ruleLayout';

export default function RuleNotationTool() {
  const [rule, setRule] = useState<Rule>([]);
  const exportRef = useRef<SVGSVGElement>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rule Notation Builder</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Build a rule left to right. Add plain symbols, or a feature matrix for a bracketed set of stacked
          values.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nothing here is saved — copy your work before navigating away.
        </p>
      </div>

      <RuleBuilder rule={rule} onChange={setRule} />

      <div className="border border-gray-200 dark:border-gray-800 rounded p-4 overflow-x-auto">
        <RuleDiagram ref={exportRef} rule={rule} label="Rule notation preview" />
      </div>

      <ExportControls svgRef={exportRef} disabled={rule.length === 0} filenameBase="rule-notation" />
    </div>
  );
}
```

- [ ] **Step 4: Verify**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run dev`, open `/hw-tools/rule-notation`, and manually verify this exact sequence (reconstructing the Czech "e Epenthesis" rule from `HW13-Czech-KEY.docx`):
1. Click "Ø". Expected: a slot showing "Ø" appears in both the editor list and the diagram preview.
2. Click "+ Symbol", type "V" into its input. Expected: diagram shows "Ø V" side by side.
3. Click "/". Expected: diagram shows "Ø V /".
4. Click "+ Symbol", type "C". Click "_". Click "+ Symbol", type "C". Click "#". Expected: diagram reads "Ø V / C _ C #" left to right.
5. Click "+ Feature matrix" on the "V" slot's row area (add a new matrix slot after "V" — use the move-left/right arrows to position it directly after "V" if it was appended at the end). Type "-back" in the first line, click "+ feature line", type "-high" in the second. Expected: the diagram shows a two-line stack "-back" / "-high" with a bracket-like shape (a vertical line with top/bottom ticks) on both sides of the stack.
6. Click "Copy as PNG", paste into a Word document with Ctrl+V. Expected: a picture appears showing the full rule left-to-right, matching the visual shape of the "e Epenthesis" rule in `HW13-Czech-KEY.docx` (symbols in a row, bracketed two-line matrix under the appropriate slot).
7. Click "Download SVG", open the downloaded file. Expected: same rendering, vector.

- [ ] **Step 5: Commit**

```bash
git add app/components/hw-tools/RuleDiagram.tsx app/components/hw-tools/RuleBuilder.tsx app/routes/hw-tools.rule-notation.tsx
git commit -m "feat(hw-tools): wire up the Rule Notation Builder page"
```

---

### Task 8: Acceptance pass against the example answer keys

**Files:** none (verification-only task; fixes go wherever the bug is, per normal judgment).

**Interfaces:** none — this task consumes the finished app as a whole.

- [ ] **Step 1: Rebuild HW12's feature-geometry trees**

Using the running `/hw-tools` Feature Tree Builder, reconstruct trees (a) through (d) from `hw-templates/examples/HW12-FeatureGeometry-KEY.docx` (natural classes `n ŋ l m`, `k ɡ x ɣ`, `d z n l`, `tʃ dʒ ʃ ʒ` — see the extracted text: tree (a) uses Root/SL/[+son][+cons]; tree (c) adds Place/[+voice]/Coronal/[+ant]; tree (d) uses Place/Dorsal/[-ant]/[+back][+high] plus a `[-son]` leaf off Root). Export each as PNG, paste into a blank Word document, and visually compare node/edge shape against the docx.

Expected: each pasted tree shows the same nodes, in the same parent/child relationships, as the corresponding answer-key tree. Exact pixel positions don't need to match — node/edge topology does.

- [ ] **Step 2: Rebuild HW13's rule notation**

Using `/hw-tools/rule-notation`, reconstruct the two named rules from `hw-templates/examples/HW13-Czech-KEY.docx`:
- "e Epenthesis": `Ø → V / C __ C #` with a `-back` / `-high` matrix under `V`.
- "Devoicing": `C → [–voice] / __ C` with a `[–sonorant]` matrix under the target `C` and a `[–voice]` matrix under the following `C`.

Export each as PNG, paste into Word, and compare left-to-right slot order and bracket placement against the docx.

- [ ] **Step 3: Fix any discrepancies found**

If a discrepancy is found (e.g. a spacing issue, a missing cascade behavior, a bracket rendering glitch), fix it in the relevant file from Tasks 2–7, re-run `npm run typecheck`, re-verify the specific repro steps above, and commit:

```bash
git add -A
git commit -m "fix(hw-tools): <describe the specific fix>"
```

If no discrepancies are found, no commit is needed for this task.
