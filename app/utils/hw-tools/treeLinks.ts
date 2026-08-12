import type { TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { emptyTreeState, type TreeBuilderState } from './treeBuilderState';
import { emptySiblingOrder, type SiblingOrder } from './treeOrder';

/**
 * A short, unique-enough-for-one-session id. Deliberately not
 * `crypto.randomUUID()` — that method is only exposed in secure contexts
 * (HTTPS, or exactly `localhost`), so it throws when the dev server is
 * viewed over plain HTTP via a LAN/Tailscale address. Nothing here needs
 * cryptographic uniqueness, just a stable key React and the link-reference
 * lookups can rely on within a single page session.
 */
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** One tree in a multi-tree ("linked trees") canvas. `id` is stable across add/remove — never a positional index, since links reference it directly. */
export interface TreeInstance {
  id: string;
  state: TreeBuilderState;
  order: SiblingOrder;
  /** "Saved" — renders only this tree's active nodes, tightly laid out, instead of the full topology. Toggling/linking still work; there's just nothing inactive left to click on until it's edited again. */
  collapsed: boolean;
  /** Whole segment marked deleted — rendered with an arrow to Ø near the root, and the whole tree dimmed. Whole-tree only, not per-feature. */
  deleted: boolean;
  /** Nodes marked "inserted from Ø" — rendered with a dotted edge to their parent and a Ø-with-arrow annotation. */
  insertedNodes: Set<TreeNodeId>;
  /** Parent-child edges marked delinking, keyed by the child's id (a non-root node has exactly one parent, so the child id uniquely identifies the edge) — rendered with the double-tick crossing mark. */
  delinkedEdges: Set<TreeNodeId>;
}

export function emptyTreeInstance(): TreeInstance {
  return {
    id: generateId(),
    state: emptyTreeState(),
    order: emptySiblingOrder(),
    collapsed: false,
    deleted: false,
    insertedNodes: new Set(),
    delinkedEdges: new Set(),
  };
}

/** Drops a set of node ids from a tree's inserted/delinked markings — used when those nodes deactivate (directly or via cascade) so a marking can never reference a node that's no longer part of the tree. */
export function pruneAnnotations(tree: TreeInstance, deactivatedIds: TreeNodeId[]): TreeInstance {
  if (deactivatedIds.length === 0) return tree;
  const deactivated = new Set(deactivatedIds);
  return {
    ...tree,
    insertedNodes: new Set([...tree.insertedNodes].filter((id) => !deactivated.has(id))),
    delinkedEdges: new Set([...tree.delinkedEdges].filter((id) => !deactivated.has(id))),
  };
}

export interface TreeEndpoint {
  treeId: string;
  nodeId: TreeNodeId;
}

export interface TreeLink {
  id: string;
  from: TreeEndpoint;
  to: TreeEndpoint;
}

export function createLink(from: TreeEndpoint, to: TreeEndpoint): TreeLink {
  return { id: generateId(), from, to };
}

function touchesNode(link: TreeLink, treeId: string, nodeId: TreeNodeId): boolean {
  return (
    (link.from.treeId === treeId && link.from.nodeId === nodeId) ||
    (link.to.treeId === treeId && link.to.nodeId === nodeId)
  );
}

/** Drops any link that references this node — used when a node deactivates so a link can never dangle. */
export function removeLinksForNode(links: TreeLink[], treeId: string, nodeId: TreeNodeId): TreeLink[] {
  return links.filter((link) => !touchesNode(link, treeId, nodeId));
}

/** Drops every link touching any node in this tree — used when the tree itself is removed. */
export function removeLinksForTree(links: TreeLink[], treeId: string): TreeLink[] {
  return links.filter((link) => link.from.treeId !== treeId && link.to.treeId !== treeId);
}

export function removeLink(links: TreeLink[], linkId: string): TreeLink[] {
  return links.filter((link) => link.id !== linkId);
}
