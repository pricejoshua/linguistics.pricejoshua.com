import type { TreeNodeId } from '../../data/hw-tools/featureTreeTopology';

/** Per-parent override of child display order. Absent parent = natural topology order. */
export type SiblingOrder = Map<TreeNodeId, TreeNodeId[]>;

export function emptySiblingOrder(): SiblingOrder {
  return new Map();
}

/**
 * Moves `childId` to `targetIndex` among its siblings under `parentId`,
 * removing it from wherever it currently sits first. `naturalOrder` is the
 * topology's declared child order for this parent, used as the starting
 * point the first time this parent is reordered.
 */
export function reorderSibling(
  order: SiblingOrder,
  parentId: TreeNodeId,
  childId: TreeNodeId,
  targetIndex: number,
  naturalOrder: TreeNodeId[],
): SiblingOrder {
  const current = order.get(parentId) ?? naturalOrder;
  const without = current.filter((id) => id !== childId);
  const clampedIndex = Math.max(0, Math.min(targetIndex, without.length));
  const next = [...without.slice(0, clampedIndex), childId, ...without.slice(clampedIndex)];
  const nextOrder = new Map(order);
  nextOrder.set(parentId, next);
  return nextOrder;
}
