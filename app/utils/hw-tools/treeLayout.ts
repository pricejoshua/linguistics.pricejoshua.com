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

/**
 * Font sizes actually rendered for each combination — inactive nodes render
 * smaller as well as fainter, which is what makes real compaction possible.
 * (Text width doesn't shrink just because opacity drops, so if inactive
 * nodes kept the active font size, no width budget could ever be small
 * enough to compact them without labels colliding with their neighbors.)
 */
export const ACTIVE_LEAF_FONT_SIZE = 13;
export const ACTIVE_NODE_FONT_SIZE = 15;
export const INACTIVE_LEAF_FONT_SIZE = 9;
export const INACTIVE_NODE_FONT_SIZE = 10;

export function fontSizeFor(node: TreeNode, isActive: boolean): number {
  const isLeaf = node.kind === 'leaf';
  if (isActive) return isLeaf ? ACTIVE_LEAF_FONT_SIZE : ACTIVE_NODE_FONT_SIZE;
  return isLeaf ? INACTIVE_LEAF_FONT_SIZE : INACTIVE_NODE_FONT_SIZE;
}

/** Rough average character width for the sans-serif label font, as a fraction of font size. */
const CHAR_WIDTH_EM = 0.58;
const LABEL_PAD = 12;
const MIN_LABEL_WIDTH = 28;
/** Extra breathing room between adjacent siblings' label boxes, beyond what their widths alone reserve. */
const SIBLING_GAP = 8;

/** Width a label actually needs at a given font size — the box a node gets must be at least this wide, or its text collides with its neighbors. */
function labelWidth(label: string[], fontSize: number): number {
  const longestLine = Math.max(...label.map((line) => line.length));
  return Math.max(longestLine * fontSize * CHAR_WIDTH_EM + LABEL_PAD, MIN_LABEL_WIDTH);
}

function computeWidths(node: TreeNode, active: ReadonlySet<TreeNodeId>, widths: Map<TreeNodeId, number>): number {
  const children = childrenOf(node.id);
  const isActive = active.has(node.id);
  const ownWidth = labelWidth(node.label, fontSizeFor(node, isActive));
  let width: number;
  if (children.length === 0) {
    width = ownWidth;
  } else {
    const childrenWidth =
      children.reduce((sum, c) => sum + computeWidths(c, active, widths), 0) + (children.length - 1) * SIBLING_GAP;
    // A node needs at least enough room for its own label too, even if its
    // (typically narrower, single-child) subtree would otherwise be tighter.
    width = Math.max(ownWidth, childrenWidth);
  }
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
    const width = widths.get(node.id) ?? MIN_LABEL_WIDTH;
    x = leftEdge + width / 2;
  } else {
    let cursor = leftEdge;
    children.forEach((child, i) => {
      assignPositions(child, cursor, depth + 1, active, widths, out);
      cursor += widths.get(child.id) ?? 0;
      if (i < children.length - 1) cursor += SIBLING_GAP;
    });
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

/** Baseline for a cyclable node's value glyph, printed below its label. */
export function valueBaseline(node: LaidOutNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 22;
}

const BOX_PAD_X = 60;
const BOX_PAD_TOP = 30;
const BOX_PAD_BOTTOM = 20;

/**
 * Tight bounding box over a set of laid-out nodes, sized from each node's
 * actual rendered extent (anchorTop for the top edge, valueBaseline for the
 * bottom edge of nodes that can show a value) rather than raw x/y — a fixed
 * padding around raw y previously clipped the value glyph on two-line leaf
 * labels, since their ink extends further below y than a fixed pad assumed.
 */
export function computeBoundingBox(
  nodes: LaidOutNode[],
  cyclable: (node: LaidOutNode) => boolean,
): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: MIN_LABEL_WIDTH, height: ROW_HEIGHT };
  }
  const left = Math.min(...nodes.map((n) => n.x)) - BOX_PAD_X;
  const right = Math.max(...nodes.map((n) => n.x)) + BOX_PAD_X;
  const top = Math.min(...nodes.map(anchorTop)) - BOX_PAD_TOP;
  const bottom = Math.max(...nodes.map((n) => (cyclable(n) ? valueBaseline(n) : anchorBottom(n)))) + BOX_PAD_BOTTOM;
  return {
    x: Math.max(0, left),
    y: Math.max(0, top),
    width: Math.max(right - Math.max(0, left), 1),
    height: Math.max(bottom - Math.max(0, top), 1),
  };
}
