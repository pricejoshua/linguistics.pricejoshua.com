import { TREE_NODES, LINE_HEIGHT, type TreeNode, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';

/** A tree node with a position computed for the current active/inactive state. */
export interface LaidOutNode extends TreeNode {
  x: number;
  y: number;
  active: boolean;
}

const CHILDREN_BY_ID = new Map<TreeNodeId, TreeNode[]>();
for (const n of TREE_NODES) {
  if (n.parent === null) continue;
  const siblings = CHILDREN_BY_ID.get(n.parent);
  if (siblings) siblings.push(n);
  else CHILDREN_BY_ID.set(n.parent, [n]);
}

const ROOT: TreeNode = (() => {
  const root = TREE_NODES.find((n) => n.parent === null);
  if (!root) throw new Error('Tree topology has no root node');
  return root;
})();

function childrenOf(id: TreeNodeId): TreeNode[] {
  return CHILDREN_BY_ID.get(id) ?? [];
}

const ROW_HEIGHT = 90;
const START_Y = 30;
const ACTIVE_LEAF_WIDTH = 100;
const INACTIVE_LEAF_WIDTH = 24;

function computeWidths(node: TreeNode, active: ReadonlySet<TreeNodeId>, widths: Map<TreeNodeId, number>): number {
  const children = childrenOf(node.id);
  const width =
    children.length === 0
      ? active.has(node.id)
        ? ACTIVE_LEAF_WIDTH
        : INACTIVE_LEAF_WIDTH
      : children.reduce((sum, c) => sum + computeWidths(c, active, widths), 0);
  widths.set(node.id, width);
  return width;
}

/**
 * A node's x is centered over its ACTIVE children only (falling back to all
 * children if none are active) — not the midpoint of every child's span.
 * This is what makes an unbranched active chain collapse into a straight
 * line even when it has several compact inactive siblings tucked to the
 * side: a node with exactly one active child always takes that child's
 * exact x, regardless of how many inactive children/positions surround it.
 */
function assignPositions(
  node: TreeNode,
  leftEdge: number,
  depth: number,
  active: ReadonlySet<TreeNodeId>,
  widths: Map<TreeNodeId, number>,
  out: Map<TreeNodeId, LaidOutNode>,
): void {
  const children = childrenOf(node.id);
  const y = START_Y + depth * ROW_HEIGHT;
  let x: number;

  if (children.length === 0) {
    const width = widths.get(node.id) ?? ACTIVE_LEAF_WIDTH;
    x = leftEdge + width / 2;
  } else {
    let cursor = leftEdge;
    for (const child of children) {
      assignPositions(child, cursor, depth + 1, active, widths, out);
      cursor += widths.get(child.id) ?? 0;
    }
    const laidOutChildren = children.map((c) => out.get(c.id)).filter((c): c is LaidOutNode => c !== undefined);
    const activeChildren = laidOutChildren.filter((c) => c.active);
    const centerOver = activeChildren.length > 0 ? activeChildren : laidOutChildren;
    const xs = centerOver.map((c) => c.x);
    x = (Math.min(...xs) + Math.max(...xs)) / 2;
  }

  out.set(node.id, { ...node, x, y, active: active.has(node.id) });
}

/** Lays out every node in the topology (active and inactive alike — nothing is ever excluded, per the design decision to keep the whole map visible and stable). */
export function computeTreeLayout(active: ReadonlySet<TreeNodeId>): Map<TreeNodeId, LaidOutNode> {
  const widths = new Map<TreeNodeId, number>();
  computeWidths(ROOT, active, widths);
  const out = new Map<TreeNodeId, LaidOutNode>();
  assignPositions(ROOT, 0, 0, active, widths, out);
  return out;
}

/** Bottom of a node's text block, in layout units — where an edge to a child leaves from. */
export function anchorBottom(node: LaidOutNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 6;
}

/** Top of a node's text block — where an edge from its parent arrives. */
export function anchorTop(node: LaidOutNode): number {
  return node.y - 12;
}

/** Baseline for the leaf value glyph (+ / − ), printed below a leaf's label. */
export function valueBaseline(node: LaidOutNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 22;
}

const BOX_PAD_X = 60;
const BOX_PAD_TOP = 30;
const BOX_PAD_BOTTOM = 20;

/**
 * Tight bounding box over a set of laid-out nodes, sized from each node's
 * actual rendered extent (anchorTop for the top edge, valueBaseline for the
 * bottom edge of leaves that show a value) rather than raw x/y — a fixed
 * padding around raw y previously clipped the value glyph on two-line leaf
 * labels, since their ink extends further below y than a fixed pad assumed.
 */
export function computeBoundingBox(nodes: LaidOutNode[]): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: ACTIVE_LEAF_WIDTH, height: ROW_HEIGHT };
  }
  const left = Math.min(...nodes.map((n) => n.x)) - BOX_PAD_X;
  const right = Math.max(...nodes.map((n) => n.x)) + BOX_PAD_X;
  const top = Math.min(...nodes.map(anchorTop)) - BOX_PAD_TOP;
  const bottom = Math.max(...nodes.map((n) => (n.kind === 'leaf' ? valueBaseline(n) : anchorBottom(n)))) + BOX_PAD_BOTTOM;
  return {
    x: Math.max(0, left),
    y: Math.max(0, top),
    width: Math.max(right - Math.max(0, left), 1),
    height: Math.max(bottom - Math.max(0, top), 1),
  };
}
