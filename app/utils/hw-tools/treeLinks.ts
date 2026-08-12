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
}

export function emptyTreeInstance(): TreeInstance {
  return { id: generateId(), state: emptyTreeState(), order: emptySiblingOrder() };
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
