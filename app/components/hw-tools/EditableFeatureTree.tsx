import { forwardRef } from 'react';
import { LINE_HEIGHT, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { activeNodeIds, type TreeBuilderState } from '../../utils/hw-tools/treeBuilderState';
import {
  computeTreeLayout,
  computeBoundingBox,
  anchorBottom,
  anchorTop,
  valueBaseline,
  type LaidOutNode,
} from '../../utils/hw-tools/treeLayout';

export interface EditableFeatureTreeProps {
  state: TreeBuilderState;
  onToggleNode: (id: TreeNodeId) => void;
  onCycleLeaf: (id: TreeNodeId) => void;
  label: string;
  /** 'edit' shows every node, inactive ones faint, all clickable — this is the on-screen editor. 'export' omits inactive nodes/edges entirely — this is what gets copied. */
  mode: 'edit' | 'export';
}

const NODE_FONT_SIZE = 15;
const LEAF_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 17;
const INACTIVE_OPACITY = 0.25;

function valueGlyph(value: '+' | '-' | undefined): string {
  if (value === '+') return '+';
  if (value === '-') return '−';
  return '';
}

const EditableFeatureTree = forwardRef<SVGSVGElement, EditableFeatureTreeProps>(
  function EditableFeatureTree({ state, onToggleNode, onCycleLeaf, label, mode }, ref) {
    const active = activeNodeIds(state);
    const interactive = mode === 'edit';

    // One continuous layout computed over the whole topology every render —
    // inactive nodes are never frozen at a separate fixed position, so an
    // active node's inactive children can't visually detach from it when the
    // active chain above them moves. Edit mode shows the full map (compact,
    // faded inactive nodes included); export mode keeps only the active ones.
    const layout = computeTreeLayout(active);
    const allNodes = Array.from(layout.values());
    const visibleNodes = interactive ? allNodes : allNodes.filter((n) => n.active);
    const box = computeBoundingBox(visibleNodes);

    return (
      <svg
        ref={ref}
        viewBox={`${box.x} ${box.y} ${box.width} ${box.height}`}
        width={box.width}
        height={box.height}
        role="img"
        aria-label={label}
        className="text-gray-900 dark:text-gray-100"
      >
        <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
          {visibleNodes.map((node) => {
            if (node.parent === null) return null;
            const parent = layout.get(node.parent);
            if (!parent) return null;
            const edgeActive = node.active && parent.active;
            if (!interactive && !edgeActive) return null;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={anchorBottom(parent)}
                x2={node.x}
                y2={anchorTop(node)}
                opacity={edgeActive ? 1 : INACTIVE_OPACITY}
                className="transition-all duration-300 ease-out"
              />
            );
          })}
        </g>

        <g fill="currentColor" textAnchor="middle">
          {visibleNodes.map((node: LaidOutNode) => {
            const isLeaf = node.kind === 'leaf';
            const value = state.get(node.id)?.value;
            const handleActivate = () => (isLeaf ? onCycleLeaf(node.id) : onToggleNode(node.id));

            return (
              <g
                key={`node-${node.id}`}
                transform={`translate(${node.x}, ${node.y})`}
                opacity={node.active ? 1 : INACTIVE_OPACITY}
                className={`transition-all duration-300 ease-out${interactive ? ' cursor-pointer' : ''}`}
                onClick={interactive ? handleActivate : undefined}
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
                    x={0}
                    y={i * LINE_HEIGHT}
                    fontSize={isLeaf ? LEAF_FONT_SIZE : NODE_FONT_SIZE}
                    fontWeight={isLeaf ? 400 : 600}
                    // Rasterization (svgToPngBlob's `new Image()` load of a serialized SVG
                    // blob) runs in an isolated context that cannot fetch external web
                    // fonts — only locally-installed fonts affect the exported PNG, so we
                    // name the generic family the browser/OS will actually use for the
                    // raster rather than a web font that's unreachable at export time.
                    fontFamily="sans-serif"
                  >
                    {line}
                  </text>
                ))}
                {isLeaf && node.active && (
                  <text
                    x={0}
                    y={valueBaseline(node) - node.y}
                    fontSize={VALUE_FONT_SIZE}
                    fontWeight={700}
                    fontFamily="sans-serif"
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
