import { TREE_NODES, LINE_HEIGHT, type TreeNode, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { activeNodeIds, type TreeBuilderState } from './treeBuilderState';
import type { SiblingOrder } from './treeOrder';

/** A tree node with a position and displayed label computed for the current state. */
export interface LaidOutNode extends TreeNode {
  x: number;
  y: number;
  active: boolean;
  /** The label actually shown — see `displayLabel`. */
  displayLabel: string[];
}

const ALL_CHILDREN_BY_ID = new Map<TreeNodeId, TreeNode[]>();
for (const n of TREE_NODES) {
  if (n.parent === null) continue;
  const siblings = ALL_CHILDREN_BY_ID.get(n.parent);
  if (siblings) siblings.push(n);
  else ALL_CHILDREN_BY_ID.set(n.parent, [n]);
}

function fullChildrenOf(id: TreeNodeId): TreeNode[] {
  return ALL_CHILDREN_BY_ID.get(id) ?? [];
}

/** The topology's declared child order for a parent — the starting point before any manual reordering. */
export function naturalChildOrder(parentId: TreeNodeId): TreeNodeId[] {
  return fullChildrenOf(parentId).map((n) => n.id);
}

/** Applies a `SiblingOrder` override on top of the natural topology order, if one exists for this parent. */
function orderedChildrenOf(id: TreeNodeId, order: SiblingOrder | undefined): TreeNode[] {
  const natural = fullChildrenOf(id);
  const customIds = order?.get(id);
  if (!customIds) return natural;
  const byId = new Map(natural.map((n) => [n.id, n]));
  return customIds.map((cid) => byId.get(cid)).filter((n): n is TreeNode => n !== undefined);
}

const ROOT: TreeNode = (() => {
  const root = TREE_NODES.find((n) => n.parent === null);
  if (!root) throw new Error('Tree topology has no root node');
  return root;
})();

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

/** Whether a node's value is shown by cycling — real leaves default to this; a non-leaf opts in via `valueOptions` (cvx). */
export function isCyclable(node: TreeNode): boolean {
  return node.kind === 'leaf' || node.valueOptions !== undefined;
}

/**
 * The label actually rendered for a node given its current value. A leaf's
 * value is spliced inside its bracket ("[strident]" -> "[+strident]"), since
 * it's annotating a feature that's already named. A cyclable non-leaf (cvx)
 * has its value replace the label entirely ("C/V/X" -> "C"), since it's
 * presented as a choice among alternatives, not a feature being annotated.
 */
export function displayLabel(node: TreeNode, value: string | undefined): string[] {
  if (!isCyclable(node) || value === undefined) return node.label;
  const glyph = value === '+' ? '+' : value === '-' ? '−' : value;
  if (node.kind === 'leaf') {
    return node.label.map((line, i) => (i === 0 ? line.replace(/^\[/, `[${glyph}`) : line));
  }
  return [glyph];
}

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

/**
 * Half the actual glyph width of a node's current label (its
 * `displayLabel`, at whatever font size it's currently drawn at) — how far
 * a side annotation (e.g. the "Ø ->" insertion marker) needs to start from
 * the node's own x to clear the visible text instead of overlapping it.
 *
 * Deliberately NOT `labelWidth(...)/2` — that function pads every label out
 * to at least `MIN_LABEL_WIDTH` so short single-character labels (a leaf
 * node's own topology-level siblings, or a root cycled down to just "C")
 * don't get crushed against their neighbors in the tree layout. That floor
 * has nothing to do with where the glyph itself actually ends, so reusing
 * it here made a short label's annotation start visibly farther from the
 * text than a long label's — the padding dominated the short case and was
 * negligible in the long one. This is the raw character-count estimate
 * with no padding and no floor, so it tracks the real glyph edge for any
 * label length.
 */
export function nodeLabelHalfWidth(node: LaidOutNode): number {
  const longestLine = Math.max(...node.displayLabel.map((line) => line.length));
  return (longestLine * fontSizeFor(node, node.active) * CHAR_WIDTH_EM) / 2;
}

interface LayoutContext {
  active: ReadonlySet<TreeNodeId>;
  valueOf: (id: TreeNodeId) => string | undefined;
  childrenOf: (id: TreeNodeId) => TreeNode[];
}

function computeWidths(node: TreeNode, ctx: LayoutContext, widths: Map<TreeNodeId, number>): number {
  const children = ctx.childrenOf(node.id);
  const isActive = ctx.active.has(node.id);
  const shown = displayLabel(node, ctx.valueOf(node.id));
  const ownWidth = labelWidth(shown, fontSizeFor(node, isActive));
  let width: number;
  if (children.length === 0) {
    width = ownWidth;
  } else {
    const childrenWidth =
      children.reduce((sum, c) => sum + computeWidths(c, ctx, widths), 0) + (children.length - 1) * SIBLING_GAP;
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
  ctx: LayoutContext,
  widths: Map<TreeNodeId, number>,
  out: Map<TreeNodeId, LaidOutNode>,
): void {
  const children = ctx.childrenOf(node.id);
  const y = START_Y + depth * ROW_HEIGHT;
  let x: number;

  if (children.length === 0) {
    const width = widths.get(node.id) ?? MIN_LABEL_WIDTH;
    x = leftEdge + width / 2;
  } else {
    let cursor = leftEdge;
    children.forEach((child, i) => {
      assignPositions(child, cursor, depth + 1, ctx, widths, out);
      cursor += widths.get(child.id) ?? 0;
      if (i < children.length - 1) cursor += SIBLING_GAP;
    });
    const laidOutChildren = children.map((c) => out.get(c.id)).filter((c): c is LaidOutNode => c !== undefined);
    const activeChildren = laidOutChildren.filter((c) => c.active);
    const centerOver = activeChildren.length > 0 ? activeChildren : laidOutChildren;
    const xs = centerOver.map((c) => c.x);
    x = (Math.min(...xs) + Math.max(...xs)) / 2;
  }

  out.set(node.id, {
    ...node,
    x,
    y,
    active: ctx.active.has(node.id),
    displayLabel: displayLabel(node, ctx.valueOf(node.id)),
  });
}

/** Lays out every node in the topology (active and inactive alike — nothing is ever excluded). This is the on-screen editor's view. `order` overrides sibling order at any parent (see `treeOrder.ts`), e.g. from drag-to-reorder. */
export function computeTreeLayout(state: TreeBuilderState, order?: SiblingOrder): Map<TreeNodeId, LaidOutNode> {
  const active = activeNodeIds(state);
  const ctx: LayoutContext = {
    active,
    valueOf: (id) => state.get(id)?.value,
    childrenOf: (id) => orderedChildrenOf(id, order),
  };
  const widths = new Map<TreeNodeId, number>();
  computeWidths(ROOT, ctx, widths);
  const out = new Map<TreeNodeId, LaidOutNode>();
  assignPositions(ROOT, 0, 0, ctx, widths, out);
  return out;
}

/**
 * Lays out ONLY the active nodes, as if inactive ones didn't exist in the
 * topology at all — not just the full layout filtered down afterward.
 * Filtering the full layout still lets an active branch's absolute position
 * drift based on how wide its inactive siblings happen to be, since those
 * widths still consumed cursor space during the full pass — producing
 * uneven spacing between active branches that have different amounts of
 * inactive clutter between them. This independent pass is what the
 * "Preview" toggle shows and what actually gets copied/downloaded.
 */
export function computePrunedLayout(state: TreeBuilderState, order?: SiblingOrder): Map<TreeNodeId, LaidOutNode> {
  const active = activeNodeIds(state);
  const ctx: LayoutContext = {
    active,
    valueOf: (id) => state.get(id)?.value,
    childrenOf: (id) => orderedChildrenOf(id, order).filter((c) => active.has(c.id)),
  };
  if (!active.has(ROOT.id)) return new Map();
  const widths = new Map<TreeNodeId, number>();
  computeWidths(ROOT, ctx, widths);
  const out = new Map<TreeNodeId, LaidOutNode>();
  assignPositions(ROOT, 0, 0, ctx, widths, out);
  return out;
}

/** How many tree levels down from the root this node sits — 0 for the root itself, 1 for its children, etc. */
export function depthOf(node: LaidOutNode): number {
  return Math.round((node.y - START_Y) / ROW_HEIGHT);
}

/** Bottom of a node's text block, in layout units — where an edge to a child leaves from. */
export function anchorBottom(node: LaidOutNode): number {
  return node.y + (node.displayLabel.length - 1) * LINE_HEIGHT + 6;
}

/** Top of a node's text block — where an edge from its parent arrives. */
export function anchorTop(node: LaidOutNode): number {
  return node.y - 12;
}

const BOX_PAD_X = 70;
const BOX_PAD_TOP = 30;
const BOX_PAD_BOTTOM = 20;

/**
 * Tight bounding box over a set of laid-out nodes, sized from each node's
 * actual rendered extent. Deliberately does NOT clamp x/y to 0 — a node's
 * own x is the midpoint of its children, which for a node near the left
 * edge (e.g. the tree's leftmost branch) can easily sit close enough to 0
 * that the label's left half extends into negative territory. Clamping the
 * box's left edge to 0 while a label still draws further left than that
 * silently cuts it off; an SVG viewBox with a negative min-x is completely
 * valid, so there's no reason to clamp. (Multi-tree placement in
 * LinkedFeatureTrees re-normalizes each tree's own box.x back to a shared
 * left-to-right cursor regardless of sign, so a negative box.x here doesn't
 * leak into where trees end up positioned relative to each other.)
 */
export function computeBoundingBox(nodes: LaidOutNode[]): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: MIN_LABEL_WIDTH, height: ROW_HEIGHT };
  }
  const left = Math.min(...nodes.map((n) => n.x)) - BOX_PAD_X;
  const right = Math.max(...nodes.map((n) => n.x)) + BOX_PAD_X;
  const top = Math.min(...nodes.map(anchorTop)) - BOX_PAD_TOP;
  const bottom = Math.max(...nodes.map(anchorBottom)) + BOX_PAD_BOTTOM;
  return {
    x: left,
    y: top,
    width: Math.max(right - left, 1),
    height: Math.max(bottom - top, 1),
  };
}
