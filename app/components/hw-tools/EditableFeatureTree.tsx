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

/**
 * Padding around the active-node bounding box for export mode. Labels are
 * center-anchored text (textAnchor="middle"), so they extend roughly this far
 * either side of a node's x; multi-line labels and leaf value glyphs extend
 * below a node's y, hence the asymmetric horizontal/vertical padding.
 */
const EXPORT_PAD_X = 80;
const EXPORT_PAD_Y = 30;

/**
 * Tight bounding box over the active nodes' positions, for export mode —
 * mirrors how RuleDiagram derives its viewBox from actual content size
 * (via layoutRule) rather than a fixed canvas. Falls back to the full fixed
 * VIEWBOX if there are no nodes to bound (defensive — export is disabled
 * with zero active nodes, so this shouldn't normally be reached).
 */
function computeExportBox(nodes: TreeNode[]): { x: number; y: number; width: number; height: number } {
  if (nodes.length === 0) {
    return { x: 0, y: 0, width: VIEWBOX.width, height: VIEWBOX.height };
  }
  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const left = Math.max(0, minX - EXPORT_PAD_X);
  const top = Math.max(0, minY - EXPORT_PAD_Y);
  const right = maxX + EXPORT_PAD_X;
  const bottom = maxY + EXPORT_PAD_Y;
  return { x: left, y: top, width: Math.max(right - left, 1), height: Math.max(bottom - top, 1) };
}

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
    // Edit mode always uses the fixed VIEWBOX so the on-screen editor doesn't
    // reflow/resize as the student toggles nodes. Export mode uses a tight
    // box over just the active nodes so a small tree doesn't paste as a
    // mostly-empty image.
    const box = interactive ? { x: 0, y: 0, width: VIEWBOX.width, height: VIEWBOX.height } : computeExportBox(visibleNodes);

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
                    // Rasterization (svgToPngBlob's `new Image()` load of a serialized SVG
                    // blob) runs in an isolated context that cannot fetch external web
                    // fonts — only locally-installed fonts affect the exported PNG, so we
                    // name the generic family the browser/OS will actually use for the
                    // raster rather than a web font that's unreachable at export time.
                    // True embedding (a base64 font in the serialized SVG's <style>) would
                    // be needed for guaranteed cross-machine IPA glyph fidelity.
                    fontFamily="sans-serif"
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
                    // See fontFamily comment above — only locally-installed fonts affect
                    // the rasterized PNG export.
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
