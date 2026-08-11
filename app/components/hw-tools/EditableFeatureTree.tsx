import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { LINE_HEIGHT, type TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { type TreeBuilderState } from '../../utils/hw-tools/treeBuilderState';
import type { SiblingOrder } from '../../utils/hw-tools/treeOrder';
import {
  computeTreeLayout,
  computePrunedLayout,
  computeBoundingBox,
  anchorBottom,
  anchorTop,
  fontSizeFor,
  isCyclable,
  type LaidOutNode,
} from '../../utils/hw-tools/treeLayout';

export interface EditableFeatureTreeProps {
  state: TreeBuilderState;
  onToggleNode: (id: TreeNodeId) => void;
  onCycleLeaf: (id: TreeNodeId) => void;
  label: string;
  /** 'edit' shows every node, inactive ones faint, all clickable — this is the on-screen editor. 'export' shows only active nodes, independently re-laid-out as if the rest didn't exist — this is what gets copied and what the "Preview" toggle displays. */
  mode: 'edit' | 'export';
  /** Sibling order overrides from drag-to-reorder (edit mode only — ignored in export mode). */
  order?: SiblingOrder;
  onReorderSibling?: (parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) => void;
}

const INACTIVE_OPACITY = 0.25;
/** Screen-pixel movement before a pointer-down becomes a drag rather than a click. */
const DRAG_THRESHOLD = 5;

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

const EditableFeatureTree = forwardRef<SVGSVGElement, EditableFeatureTreeProps>(
  function EditableFeatureTree({ state, onToggleNode, onCycleLeaf, label, mode, order, onReorderSibling }, ref) {
    const interactive = mode === 'edit';
    const svgElRef = useRef<SVGSVGElement | null>(null);
    useImperativeHandle(ref, () => svgElRef.current as SVGSVGElement, []);

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

    // Edit mode: one continuous layout over the whole topology — inactive
    // nodes are never frozen at a separate fixed position, so an active
    // node's inactive children can't visually detach from it when the
    // active chain above them moves. Export mode: an independent pass over
    // just the active nodes, so the result isn't skewed by how much
    // inactive clutter happened to sit between two active branches.
    const layout = interactive ? computeTreeLayout(state, order) : computePrunedLayout(state, order);
    const visibleNodes = Array.from(layout.values());
    const box = computeBoundingBox(visibleNodes);

    /** Siblings of `parentId` in current on-screen left-to-right order. */
    function siblingsOf(parentId: TreeNodeId): LaidOutNode[] {
      return visibleNodes.filter((n) => n.parent === parentId).sort((a, b) => a.x - b.x);
    }

    function reorder(parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) {
      onReorderSibling?.(parentId, childId, targetIndex);
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
      setDrag({ id: pending.id, parentId, pointerId: e.pointerId, x: p.x, y: p.y });

      // Live reorder: if the pointer has crossed into a different sibling's
      // slot, commit that swap immediately — the resulting re-layout is
      // what makes dragging feel like actually picking the branch up.
      const siblings = siblingsOf(parentId);
      const currentIndex = siblings.findIndex((s) => s.id === pending.id);
      if (currentIndex === -1) return;
      let targetIndex = siblings.length - 1;
      for (let i = 0; i < siblings.length; i++) {
        if (p.x < siblings[i].x) {
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
      <svg
        ref={svgElRef}
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
            const beingDragged = drag?.id === node.id;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={anchorBottom(parent)}
                x2={beingDragged ? drag.x : node.x}
                y2={beingDragged ? drag.y - 12 : anchorTop(node)}
                opacity={edgeActive ? 1 : INACTIVE_OPACITY}
                className={beingDragged ? undefined : 'transition-all duration-300 ease-out'}
              />
            );
          })}
        </g>

        <g fill="currentColor" textAnchor="middle">
          {visibleNodes.map((node: LaidOutNode) => {
            const cyclable = isCyclable(node);
            const isLeaf = node.kind === 'leaf';
            const fontSize = fontSizeFor(node, node.active);
            const handleActivate = () => (cyclable ? onCycleLeaf(node.id) : onToggleNode(node.id));
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
                {node.displayLabel.map((line, i) => (
                  <text
                    key={`${node.id}-line-${i}`}
                    x={0}
                    y={i * LINE_HEIGHT}
                    fontSize={fontSize}
                    fontWeight={isLeaf ? 400 : 600}
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
              </g>
            );
          })}
        </g>

        {interactive && (
          <g fill="currentColor">
            {visibleNodes.map((node) => {
              const parentId = node.parent;
              if (!parentId) return null;
              const siblings = siblingsOf(parentId);
              if (siblings.length < 2) return null;
              const currentIndex = siblings.findIndex((s) => s.id === node.id);
              if (currentIndex === -1) return null;
              const arrowY = anchorBottom(node) + 10;
              const opacity = node.active ? 0.55 : 0.3;

              return (
                <g
                  key={`reorder-${node.id}`}
                  opacity={opacity}
                  className="transition-all duration-300 ease-out"
                >
                  {currentIndex > 0 && (
                    <path
                      d={`M ${node.x - 10} ${arrowY - 5} L ${node.x - 18} ${arrowY} L ${node.x - 10} ${arrowY + 5} Z`}
                      className="cursor-pointer hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorder(parentId, node.id, currentIndex - 1);
                      }}
                    >
                      <title>Move left</title>
                    </path>
                  )}
                  {currentIndex < siblings.length - 1 && (
                    <path
                      d={`M ${node.x + 10} ${arrowY - 5} L ${node.x + 18} ${arrowY} L ${node.x + 10} ${arrowY + 5} Z`}
                      className="cursor-pointer hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        reorder(parentId, node.id, currentIndex + 1);
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
      </svg>
    );
  },
);

export default EditableFeatureTree;
