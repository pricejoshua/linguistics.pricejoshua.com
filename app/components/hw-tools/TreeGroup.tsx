import { useRef, useState } from 'react';
import { LINE_HEIGHT, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import {
  anchorBottom,
  anchorTop,
  fontSizeFor,
  isCyclable,
  nodeLabelHalfWidth,
  type LaidOutNode,
} from '../../utils/hw-tools/treeLayout';

export interface TreeGroupProps {
  layout: Map<TreeNodeId, LaidOutNode>;
  visibleNodes: LaidOutNode[];
  /** Horizontal shift applied by the parent's wrapping <g transform>. Needed here only to correct pointer-drag math back into this tree's local coordinate space — rendering itself stays local, since the wrapping <g> already applies the shift visually. */
  offsetX: number;
  interactive: boolean;
  linkModeActive: boolean;
  isPendingLinkNode: (nodeId: TreeNodeId) => boolean;
  /** Nodes marked "inserted from Ø" — dotted edge to parent, Ø-with-arrow annotation. */
  insertedNodes: ReadonlySet<TreeNodeId>;
  /** Parent-child edges marked delinking, keyed by the child's id. */
  delinkedEdges: ReadonlySet<TreeNodeId>;
  insertModeActive: boolean;
  delinkingModeActive: boolean;
  /** Whole-tree "marked deleted" mode — clicking ANY node in this tree toggles it, since the marking applies to the whole segment, not a specific node. */
  deleteModeActive: boolean;
  onToggleNode: (id: TreeNodeId) => void;
  onCycleLeaf: (id: TreeNodeId) => void;
  onReorderSibling: (parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) => void;
  onNodeClick: (id: TreeNodeId) => void;
  onToggleInserted: (id: TreeNodeId) => void;
  onToggleDelinked: (childId: TreeNodeId) => void;
  onToggleTreeDeleted: () => void;
  /** The shared outer <svg> — drag needs its screen-to-user-space transform, not any single tree's. */
  svgElRef: React.RefObject<SVGSVGElement | null>;
}

const INACTIVE_OPACITY = 0.25;
const LINK_PENDING_COLOR = '#2563eb'; // tailwind blue-600, matches the app's existing accent usage
/** Screen-pixel movement before a pointer-down becomes a drag rather than a click. */
const DRAG_THRESHOLD = 5;

/** Two short parallel ticks perpendicular to the edge, crossing its midpoint — the standard delinking mark. */
function delinkTickPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  const px = -uy; // perpendicular unit vector
  const py = ux;
  const midX = (x1 + x2) / 2;
  const midY = (y1 + y2) / 2;
  const tickHalf = 6;
  const gap = 3;
  const c1x = midX - (gap / 2) * ux;
  const c1y = midY - (gap / 2) * uy;
  const c2x = midX + (gap / 2) * ux;
  const c2y = midY + (gap / 2) * uy;
  return (
    `M ${c1x - tickHalf * px} ${c1y - tickHalf * py} L ${c1x + tickHalf * px} ${c1y + tickHalf * py} ` +
    `M ${c2x - tickHalf * px} ${c2y - tickHalf * py} L ${c2x + tickHalf * px} ${c2y + tickHalf * py}`
  );
}

interface DragState {
  id: TreeNodeId;
  parentId: TreeNodeId;
  pointerId: number;
  x: number;
  y: number;
}

function toSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number): { x: number; y: number } {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: clientX, y: clientY };
  const transformed = pt.matrixTransform(ctm.inverse());
  return { x: transformed.x, y: transformed.y };
}

export default function TreeGroup({
  layout,
  visibleNodes,
  offsetX,
  interactive,
  linkModeActive,
  isPendingLinkNode,
  insertedNodes,
  delinkedEdges,
  insertModeActive,
  delinkingModeActive,
  deleteModeActive,
  onToggleNode,
  onCycleLeaf,
  onReorderSibling,
  onNodeClick,
  onToggleInserted,
  onToggleDelinked,
  onToggleTreeDeleted,
  svgElRef,
}: TreeGroupProps) {
  const [drag, setDrag] = useState<DragState | null>(null);
  // Pointer-down bookkeeping lives in a ref, not state — most pointer-downs
  // are just clicks and shouldn't trigger a re-render before we know better.
  const pendingRef = useRef<{
    id: TreeNodeId;
    parentId: TreeNodeId | null;
    pointerId: number;
    startClientX: number;
    startClientY: number;
    dragging: boolean;
  } | null>(null);

  /** Siblings of `parentId` in current on-screen left-to-right order. */
  function siblingsOf(parentId: TreeNodeId): LaidOutNode[] {
    return visibleNodes.filter((n) => n.parent === parentId).sort((a, b) => a.x - b.x);
  }

  function reorder(parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) {
    onReorderSibling(parentId, childId, targetIndex);
  }

  function handlePointerMove(e: React.PointerEvent<SVGGElement>) {
    const pending = pendingRef.current;
    if (!pending || pending.pointerId !== e.pointerId) return;

    const parentId = pending.parentId;
    if (!parentId) return; // root has no siblings to reorder among

    if (!pending.dragging) {
      const dx = e.clientX - pending.startClientX;
      const dy = e.clientY - pending.startClientY;
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
      pending.dragging = true;
    }

    const svg = svgElRef.current;
    if (!svg) return;
    const p = toSvgPoint(svg, e.clientX, e.clientY);
    // Correct back into this tree's local space — the outer svg's CTM gives
    // coordinates relative to the shared root, before this tree's own
    // horizontal shift is applied.
    const localX = p.x - offsetX;
    setDrag({ id: pending.id, parentId, pointerId: e.pointerId, x: localX, y: p.y });

    // Live reorder: if the pointer has crossed into a different sibling's
    // slot, commit that swap immediately — the resulting re-layout is what
    // makes dragging feel like actually picking the branch up.
    const siblings = siblingsOf(parentId);
    const currentIndex = siblings.findIndex((s) => s.id === pending.id);
    if (currentIndex === -1) return;
    let targetIndex = siblings.length - 1;
    for (let i = 0; i < siblings.length; i++) {
      if (localX < siblings[i].x) {
        targetIndex = i > currentIndex ? i - 1 : i;
        break;
      }
    }
    if (targetIndex !== currentIndex) {
      reorder(parentId, pending.id, targetIndex);
    }
  }

  function endDrag(e: React.PointerEvent<SVGGElement>) {
    const pending = pendingRef.current;
    if (pending?.pointerId === e.pointerId) {
      e.currentTarget.releasePointerCapture(e.pointerId);
      pendingRef.current = null;
    }
    setDrag(null);
  }

  return (
    <g transform={`translate(${offsetX}, 0)`}>
      <g stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
        {visibleNodes.map((node) => {
          if (node.parent === null) return null;
          const parent = layout.get(node.parent);
          if (!parent) return null;
          const edgeActive = node.active && parent.active;
          if (!interactive && !edgeActive) return null;
          const beingDragged = drag?.id === node.id;
          const x1 = parent.x;
          const y1 = anchorBottom(parent);
          const x2 = beingDragged ? drag.x : node.x;
          const y2 = beingDragged ? drag.y - 12 : anchorTop(node);
          const inserted = insertedNodes.has(node.id);
          const delinked = delinkedEdges.has(node.id);
          return (
            <g key={`edge-${node.id}`}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                strokeDasharray={inserted ? '4 3' : undefined}
                opacity={edgeActive ? 1 : INACTIVE_OPACITY}
                className={beingDragged ? undefined : 'transition-all duration-300 ease-out'}
              />
              {delinked && !beingDragged && (
                <path d={delinkTickPath(x1, y1, x2, y2)} stroke="currentColor" strokeWidth={1.8} />
              )}
              {interactive && delinkingModeActive && edgeActive && !beingDragged && (
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="transparent"
                  strokeWidth={12}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleDelinked(node.id);
                  }}
                >
                  <title>{delinked ? 'Undo delinking' : 'Mark delinking'}</title>
                </line>
              )}
            </g>
          );
        })}
      </g>

      <g fill="currentColor" textAnchor="middle">
        {visibleNodes.map((node: LaidOutNode) => {
          const cyclable = isCyclable(node);
          const isLeaf = node.kind === 'leaf';
          const fontSize = fontSizeFor(node, node.active);
          const pending = linkModeActive && isPendingLinkNode(node.id);
          const inserted = insertedNodes.has(node.id);
          const handleActivate = () => {
            if (linkModeActive) {
              onNodeClick(node.id);
              return;
            }
            if (insertModeActive) {
              if (node.active && node.parent !== null) onToggleInserted(node.id);
              return;
            }
            if (deleteModeActive) {
              onToggleTreeDeleted();
              return;
            }
            if (cyclable) onCycleLeaf(node.id);
            else onToggleNode(node.id);
          };
          const beingDragged = drag?.id === node.id;
          const nodeX = beingDragged ? drag.x : node.x;
          const nodeY = beingDragged ? drag.y : node.y;

          return (
            <g
              key={`node-${node.id}`}
              transform={`translate(${nodeX}, ${nodeY})`}
              opacity={node.active ? 1 : INACTIVE_OPACITY}
              className={`${beingDragged ? '' : 'transition-all duration-300 ease-out'}${interactive ? ' cursor-pointer' : ''}`}
              onPointerDown={
                interactive
                  ? (e: React.PointerEvent<SVGGElement>) => {
                      e.currentTarget.setPointerCapture(e.pointerId);
                      pendingRef.current = {
                        id: node.id,
                        parentId: node.parent,
                        pointerId: e.pointerId,
                        startClientX: e.clientX,
                        startClientY: e.clientY,
                        dragging: false,
                      };
                    }
                  : undefined
              }
              onPointerMove={interactive ? handlePointerMove : undefined}
              onPointerUp={
                interactive
                  ? (e: React.PointerEvent<SVGGElement>) => {
                      const wasDragging = pendingRef.current?.dragging;
                      endDrag(e);
                      if (!wasDragging) handleActivate();
                    }
                  : undefined
              }
              onPointerCancel={interactive ? endDrag : undefined}
              role={interactive ? 'button' : undefined}
              tabIndex={interactive ? 0 : undefined}
              onKeyDown={
                interactive
                  ? (e: React.KeyboardEvent<SVGGElement>) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleActivate();
                        return;
                      }
                      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && node.parent) {
                        e.preventDefault();
                        const siblings = siblingsOf(node.parent);
                        const currentIndex = siblings.findIndex((s) => s.id === node.id);
                        if (currentIndex === -1) return;
                        const targetIndex = currentIndex + (e.key === 'ArrowLeft' ? -1 : 1);
                        if (targetIndex >= 0 && targetIndex < siblings.length) {
                          reorder(node.parent, node.id, targetIndex);
                        }
                      }
                    }
                  : undefined
              }
            >
              {pending && (
                <circle
                  r={Math.max(fontSize * 1.4, 12)}
                  fill="none"
                  stroke={LINK_PENDING_COLOR}
                  strokeWidth={2}
                  cy={-fontSize * 0.3}
                />
              )}
              {node.displayLabel.map((line, i) => (
                <text
                  key={`${node.id}-line-${i}`}
                  x={0}
                  y={i * LINE_HEIGHT}
                  fontSize={fontSize}
                  fontWeight={isLeaf ? 400 : 600}
                  fill={pending ? LINK_PENDING_COLOR : undefined}
                  // Rasterization (svgToPngBlob's `new Image()` load of a serialized SVG
                  // blob) runs in an isolated context that cannot fetch external web
                  // fonts — only locally-installed fonts affect the exported PNG, so we
                  // name the generic family the browser/OS will actually use for the
                  // raster rather than a web font that's unreachable at export time.
                  fontFamily="sans-serif"
                  className={beingDragged ? undefined : 'transition-all duration-300 ease-out'}
                >
                  {line}
                </text>
              ))}
              {inserted && (() => {
                // Start past the label's actual rendered right edge, not a
                // fixed guess — a long label like "[+anterior]" is wider
                // than any single fixed offset could safely assume, so a
                // fixed offset either overlaps long labels or leaves an
                // awkward gap after short ones. nodeLabelHalfWidth already
                // bakes in half of the label's own padding, so only a small
                // additional gap is needed on top of it. y stays at 0 (the
                // label's own baseline, same as its first line) rather than
                // shifted down, so the arrow/Ø sit level with the text
                // instead of visibly sagging below it.
                const lineStart = nodeLabelHalfWidth(node) + 2;
                const lineEnd = lineStart + 14;
                return (
                  <g stroke="currentColor" strokeWidth={1.4} opacity={node.active ? 1 : INACTIVE_OPACITY}>
                    <line x1={lineStart} y1={0} x2={lineEnd} y2={0} />
                    <path
                      d={`M ${lineStart} 0 L ${lineStart + 6} -4 L ${lineStart + 6} 4 Z`}
                      fill="currentColor"
                      stroke="none"
                    />
                    <text
                      x={lineEnd + 6}
                      y={0}
                      fontSize={fontSize}
                      fontFamily="sans-serif"
                      stroke="none"
                      fill="currentColor"
                    >
                      Ø
                    </text>
                  </g>
                );
              })()}
            </g>
          );
        })}
      </g>

      {interactive && (
        <g fill="currentColor">
          {visibleNodes.map((node) => {
            // Reordering only has a visible effect among ACTIVE siblings —
            // the exported/pruned layout only keeps active nodes, so
            // swapping past an inactive one changes nothing a student can
            // see. Arrows are scoped to active-sibling swaps so every click
            // does something, and to active nodes so there's nothing to
            // click on a node whose position doesn't matter yet.
            if (!node.active) return null;
            const parentId = node.parent;
            if (!parentId) return null;
            const activeSiblings = siblingsOf(parentId).filter((s) => s.active);
            const currentIndex = activeSiblings.findIndex((s) => s.id === node.id);
            if (currentIndex === -1) return null;
            const leftTarget = currentIndex > 0 ? activeSiblings[currentIndex - 1] : null;
            const rightTarget = currentIndex < activeSiblings.length - 1 ? activeSiblings[currentIndex + 1] : null;
            if (!leftTarget && !rightTarget) return null;
            const arrowY = anchorBottom(node) + 10;

            return (
              <g key={`reorder-${node.id}`} opacity={0.55} className="transition-all duration-300 ease-out">
                {leftTarget && (
                  <path
                    d={`M ${node.x - 10} ${arrowY - 5} L ${node.x - 18} ${arrowY} L ${node.x - 10} ${arrowY + 5} Z`}
                    className="cursor-pointer hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Jump straight to the active sibling's own slot — not
                      // just one slot over in the full list, which could
                      // land short of it (or not move it at all) if inactive
                      // siblings sit between them.
                      const fullIndex = siblingsOf(parentId).findIndex((s) => s.id === leftTarget.id);
                      if (fullIndex !== -1) reorder(parentId, node.id, fullIndex);
                    }}
                  >
                    <title>Move left</title>
                  </path>
                )}
                {rightTarget && (
                  <path
                    d={`M ${node.x + 10} ${arrowY - 5} L ${node.x + 18} ${arrowY} L ${node.x + 10} ${arrowY + 5} Z`}
                    className="cursor-pointer hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      const fullIndex = siblingsOf(parentId).findIndex((s) => s.id === rightTarget.id);
                      if (fullIndex !== -1) reorder(parentId, node.id, fullIndex);
                    }}
                  >
                    <title>Move right</title>
                  </path>
                )}
              </g>
            );
          })}
        </g>
      )}
    </g>
  );
}
