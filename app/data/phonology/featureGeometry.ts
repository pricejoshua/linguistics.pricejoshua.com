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
