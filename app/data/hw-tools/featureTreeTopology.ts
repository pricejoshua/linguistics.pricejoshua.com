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
  parent: TreeNodeId | null;
  kind: TreeNodeKind;
}

export const LINE_HEIGHT = 15;

/**
 * Own copy of the canonical feature-geometry topology (see
 * app/data/phonology/featureGeometry.ts). Deliberately duplicated rather
 * than imported — this tool's editing model (direct manual toggling) and
 * render mode (omit vs. grey inactive nodes) diverge from the reference
 * screen, and the two are meant to evolve independently.
 *
 * No authored x/y here — positions are computed dynamically by
 * `treeLayout.ts` from the current active/inactive state, so that an
 * unbranched active chain always collapses into a straight line instead of
 * sitting at whatever spot was chosen to leave room for the full topology.
 */
export const TREE_NODES: TreeNode[] = [
  { id: 'cvx', label: ['C/V/X'], parent: null, kind: 'node' },

  { id: 'root', label: ['Root Node'], parent: 'cvx', kind: 'node' },
  { id: 'tonal', label: ['Tonal', 'Node'], parent: 'cvx', kind: 'node' },

  { id: 'laryngeal', label: ['Laryngeal', 'Node'], parent: 'root', kind: 'node' },
  { id: 'supralaryngeal', label: ['Supralaryngeal', 'Node'], parent: 'root', kind: 'node' },
  { id: 'register', label: ['Register'], parent: 'tonal', kind: 'node' },
  { id: 'mode', label: ['Mode'], parent: 'tonal', kind: 'node' },

  { id: 'voice', label: ['[voice]'], parent: 'laryngeal', kind: 'leaf' },
  { id: 'constrictedGlottis', label: ['[constricted', 'glottis]'], parent: 'laryngeal', kind: 'leaf' },
  { id: 'spreadGlottis', label: ['[spread', 'glottis]'], parent: 'laryngeal', kind: 'leaf' },

  { id: 'place', label: ['Place'], parent: 'supralaryngeal', kind: 'node' },
  { id: 'sonorant', label: ['[sonorant]'], parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'consonantal', label: ['[consonantal]'], parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'continuant', label: ['[continuant]'], parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'nasal', label: ['[nasal]'], parent: 'supralaryngeal', kind: 'leaf' },

  { id: 'toneRegisterHi', label: ['[hi]'], parent: 'register', kind: 'leaf' },
  { id: 'toneModeHi', label: ['[Hi]'], parent: 'mode', kind: 'leaf' },

  { id: 'labial', label: ['Labial'], parent: 'place', kind: 'node' },
  { id: 'coronal', label: ['Coronal'], parent: 'place', kind: 'node' },
  { id: 'dorsal', label: ['Dorsal'], parent: 'place', kind: 'node' },
  { id: 'tongueRoot', label: ['Tongue Root', 'Node'], parent: 'place', kind: 'node' },

  { id: 'round', label: ['[round]'], parent: 'labial', kind: 'leaf' },
  { id: 'strident', label: ['[strident]'], parent: 'coronal', kind: 'leaf' },
  { id: 'anterior', label: ['[anterior]'], parent: 'coronal', kind: 'leaf' },
  { id: 'distributed', label: ['[distributed]'], parent: 'coronal', kind: 'leaf' },
  { id: 'lateral', label: ['[lateral]'], parent: 'coronal', kind: 'leaf' },
  { id: 'back', label: ['[back]'], parent: 'dorsal', kind: 'leaf' },
  { id: 'low', label: ['[low]'], parent: 'dorsal', kind: 'leaf' },
  { id: 'high', label: ['[high]'], parent: 'dorsal', kind: 'leaf' },
  { id: 'ATR', label: ['[ATR]'], parent: 'tongueRoot', kind: 'leaf' },
  { id: 'RTR', label: ['[RTR]'], parent: 'tongueRoot', kind: 'leaf' },
];
