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
  x: number;
  y: number;
  parent: TreeNodeId | null;
  kind: TreeNodeKind;
}

export const VIEWBOX = { width: 1240, height: 520 } as const;
export const LINE_HEIGHT = 15;

/**
 * Own copy of the canonical feature-geometry topology (see
 * app/data/phonology/featureGeometry.ts). Deliberately duplicated rather
 * than imported — this tool's editing model (direct manual toggling) and
 * render mode (omit vs. grey inactive nodes) diverge from the reference
 * screen, and the two are meant to evolve independently.
 */
export const TREE_NODES: TreeNode[] = [
  { id: 'cvx', label: ['C/V/X'], x: 940, y: 30, parent: null, kind: 'node' },

  { id: 'root', label: ['Root Node'], x: 380, y: 112, parent: 'cvx', kind: 'node' },
  { id: 'tonal', label: ['Tonal', 'Node'], x: 1090, y: 112, parent: 'cvx', kind: 'node' },

  { id: 'laryngeal', label: ['Laryngeal', 'Node'], x: 172, y: 200, parent: 'root', kind: 'node' },
  { id: 'supralaryngeal', label: ['Supralaryngeal', 'Node'], x: 620, y: 200, parent: 'root', kind: 'node' },
  { id: 'register', label: ['Register'], x: 1030, y: 200, parent: 'tonal', kind: 'node' },
  { id: 'mode', label: ['Mode'], x: 1150, y: 200, parent: 'tonal', kind: 'node' },

  { id: 'voice', label: ['[voice]'], x: 75, y: 292, parent: 'laryngeal', kind: 'leaf' },
  { id: 'constrictedGlottis', label: ['[constricted', 'glottis]'], x: 172, y: 292, parent: 'laryngeal', kind: 'leaf' },
  { id: 'spreadGlottis', label: ['[spread', 'glottis]'], x: 272, y: 292, parent: 'laryngeal', kind: 'leaf' },

  { id: 'place', label: ['Place'], x: 430, y: 292, parent: 'supralaryngeal', kind: 'node' },
  { id: 'sonorant', label: ['[sonorant]'], x: 620, y: 292, parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'consonantal', label: ['[consonantal]'], x: 720, y: 292, parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'continuant', label: ['[continuant]'], x: 820, y: 292, parent: 'supralaryngeal', kind: 'leaf' },
  { id: 'nasal', label: ['[nasal]'], x: 905, y: 292, parent: 'supralaryngeal', kind: 'leaf' },

  { id: 'toneRegisterHi', label: ['[hi]'], x: 1030, y: 292, parent: 'register', kind: 'leaf' },
  { id: 'toneModeHi', label: ['[Hi]'], x: 1150, y: 292, parent: 'mode', kind: 'leaf' },

  { id: 'labial', label: ['Labial'], x: 75, y: 382, parent: 'place', kind: 'node' },
  { id: 'coronal', label: ['Coronal'], x: 315, y: 382, parent: 'place', kind: 'node' },
  { id: 'dorsal', label: ['Dorsal'], x: 610, y: 382, parent: 'place', kind: 'node' },
  { id: 'tongueRoot', label: ['Tongue Root', 'Node'], x: 930, y: 382, parent: 'place', kind: 'node' },

  { id: 'round', label: ['[round]'], x: 75, y: 474, parent: 'labial', kind: 'leaf' },
  { id: 'strident', label: ['[strident]'], x: 175, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'anterior', label: ['[anterior]'], x: 265, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'distributed', label: ['[distributed]'], x: 365, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'lateral', label: ['[lateral]'], x: 455, y: 474, parent: 'coronal', kind: 'leaf' },
  { id: 'back', label: ['[back]'], x: 545, y: 474, parent: 'dorsal', kind: 'leaf' },
  { id: 'low', label: ['[low]'], x: 610, y: 474, parent: 'dorsal', kind: 'leaf' },
  { id: 'high', label: ['[high]'], x: 675, y: 474, parent: 'dorsal', kind: 'leaf' },
  { id: 'ATR', label: ['[ATR]'], x: 895, y: 474, parent: 'tongueRoot', kind: 'leaf' },
  { id: 'RTR', label: ['[RTR]'], x: 965, y: 474, parent: 'tongueRoot', kind: 'leaf' },
];
