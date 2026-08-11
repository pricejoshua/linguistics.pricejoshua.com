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
