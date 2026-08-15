import type { TreeNodeId } from './featureTreeTopology';
import type { TreeBuilderState } from '../../utils/hw-tools/treeBuilderState';
import { emptySiblingOrder } from '../../utils/hw-tools/treeOrder';
import type { TreeInstance } from '../../utils/hw-tools/treeLinks';

/**
 * Invented, not drawn from any course answer key: the natural class of
 * strident coronal fricatives (s, z, ʃ, ʒ) — Root / [-sonorant]
 * [+continuant] / Place / Coronal / [+strident]. Static, hand-built rather
 * than reached by simulating clicks — this never changes, so there's no
 * reason to route it through toggleNode/cycleLeafValue.
 */
const EXAMPLE_STATE: TreeBuilderState = new Map<TreeNodeId, { active: boolean; value?: string }>([
  ['cvx', { active: true, value: 'C' }],
  ['root', { active: true }],
  ['supralaryngeal', { active: true }],
  ['sonorant', { active: true, value: '-' }],
  ['continuant', { active: true, value: '+' }],
  ['place', { active: true }],
  ['coronal', { active: true }],
  ['strident', { active: true, value: '+' }],
]);

export const exampleTreeInstance: TreeInstance = {
  id: 'example-tree',
  state: EXAMPLE_STATE,
  order: emptySiblingOrder(),
  collapsed: true,
  deleted: false,
  insertedNodes: new Set(),
  delinkedEdges: new Set(),
};
