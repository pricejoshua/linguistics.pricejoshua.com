import { forwardRef } from 'react';
import { TREE_NODES, VIEWBOX, LINE_HEIGHT, type TreeNode, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { activeNodeIds, type TreeBuilderState } from '../../utils/hw-tools/treeBuilderState';

export interface EditableFeatureTreeProps {
  state: TreeBuilderState;
  onToggleNode: (id: TreeNodeId) => void;
  onCycleLeaf: (id: TreeNodeId) => void;
  label: string;
  /** 'edit' shows every node, inactive ones faint, all clickable — this is the on-screen editor. 'export' omits inactive nodes/edges entirely — this is what gets copied. */
  mode: 'edit' | 'export';
}

const NODES_BY_ID = new Map(TREE_NODES.map((n) => [n.id, n]));
const NODE_FONT_SIZE = 15;
const LEAF_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 17;
const INACTIVE_OPACITY = 0.25;

function anchorBottom(node: TreeNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 6;
}
function anchorTop(node: TreeNode): number {
  return node.y - 12;
}
function valueBaseline(node: TreeNode): number {
  return node.y + (node.label.length - 1) * LINE_HEIGHT + 22;
}
function valueGlyph(value: '+' | '-' | undefined): string {
  if (value === '+') return '+';
  if (value === '-') return '−';
  return '';
}

const EditableFeatureTree = forwardRef<SVGSVGElement, EditableFeatureTreeProps>(
  function EditableFeatureTree({ state, onToggleNode, onCycleLeaf, label, mode }, ref) {
    const active = activeNodeIds(state);
    const interactive = mode === 'edit';
    const visibleNodes = TREE_NODES.filter((n) => interactive || active.has(n.id));

    return (
      <svg
        ref={ref}
        viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`}
        width={VIEWBOX.width}
        height={VIEWBOX.height}
        role="img"
        aria-label={label}
        className="text-gray-900 dark:text-gray-100"
      >
        <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          {visibleNodes.map((node) => {
            if (node.parent === null) return null;
            const parent = NODES_BY_ID.get(node.parent);
            if (!parent) return null;
            const edgeActive = active.has(node.id) && active.has(parent.id);
            if (!interactive && !edgeActive) return null;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={anchorBottom(parent)}
                x2={node.x}
                y2={anchorTop(node)}
                opacity={edgeActive ? 1 : INACTIVE_OPACITY}
              />
            );
          })}
        </g>

        <g fill="currentColor" textAnchor="middle">
          {visibleNodes.map((node) => {
            const isLeaf = node.kind === 'leaf';
            const isActive = active.has(node.id);
            const value = state.get(node.id)?.value;
            const handleActivate = () => (isLeaf ? onCycleLeaf(node.id) : onToggleNode(node.id));

            return (
              <g
                key={`node-${node.id}`}
                opacity={isActive ? 1 : INACTIVE_OPACITY}
                onClick={interactive ? handleActivate : undefined}
                className={interactive ? 'cursor-pointer' : undefined}
                role={interactive ? 'button' : undefined}
                tabIndex={interactive ? 0 : undefined}
                onKeyDown={
                  interactive
                    ? (e: React.KeyboardEvent<SVGGElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleActivate();
                        }
                      }
                    : undefined
                }
              >
                {node.label.map((line, i) => (
                  <text
                    key={`${node.id}-line-${i}`}
                    x={node.x}
                    y={node.y + i * LINE_HEIGHT}
                    fontSize={isLeaf ? LEAF_FONT_SIZE : NODE_FONT_SIZE}
                    fontWeight={isLeaf ? 400 : 600}
                    fontFamily="'Noto Sans', sans-serif"
                  >
                    {line}
                  </text>
                ))}
                {isLeaf && isActive && (
                  <text
                    x={node.x}
                    y={valueBaseline(node)}
                    fontSize={VALUE_FONT_SIZE}
                    fontWeight={700}
                    fontFamily="'Noto Sans', sans-serif"
                  >
                    {valueGlyph(value)}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    );
  },
);

export default EditableFeatureTree;
