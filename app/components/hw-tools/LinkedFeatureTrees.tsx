import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import {
  computeTreeLayout,
  computePrunedLayout,
  computeBoundingBox,
  anchorTop,
  anchorBottom,
  depthOf,
  nodeLabelHalfWidth,
  fontSizeFor,
  type LaidOutNode,
} from '../../utils/hw-tools/treeLayout';
import type { TreeInstance, TreeEndpoint, TreeLink } from '../../utils/hw-tools/treeLinks';
import TreeGroup from './TreeGroup';

export interface LinkedFeatureTreesProps {
  trees: TreeInstance[];
  links: TreeLink[];
  label: string;
  /** 'edit' shows every node in every tree, inactive ones faint, all interactive. 'export' shows only active nodes per tree, each independently re-laid-out — this is what gets copied and what the "Preview" toggle displays. */
  mode: 'edit' | 'export';
  linkModeActive: boolean;
  pendingLinkStart: TreeEndpoint | null;
  insertModeActive: boolean;
  delinkingModeActive: boolean;
  deleteModeActive: boolean;
  onToggleNode: (treeId: string, id: TreeNodeId) => void;
  onCycleLeaf: (treeId: string, id: TreeNodeId) => void;
  onReorderSibling: (treeId: string, parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) => void;
  onNodeClick: (treeId: string, id: TreeNodeId) => void;
  onRemoveLink: (linkId: string) => void;
  onToggleInserted: (treeId: string, id: TreeNodeId) => void;
  onToggleDelinked: (treeId: string, childId: TreeNodeId) => void;
  onToggleTreeDeleted: (treeId: string) => void;
}

/** Horizontal breathing room between adjacent trees. */
const TREE_GAP = 60;

const LinkedFeatureTrees = forwardRef<SVGSVGElement, LinkedFeatureTreesProps>(function LinkedFeatureTrees(
  {
    trees,
    links,
    label,
    mode,
    linkModeActive,
    pendingLinkStart,
    insertModeActive,
    delinkingModeActive,
    deleteModeActive,
    onToggleNode,
    onCycleLeaf,
    onReorderSibling,
    onNodeClick,
    onRemoveLink,
    onToggleInserted,
    onToggleDelinked,
    onToggleTreeDeleted,
  },
  ref,
) {
  const interactive = mode === 'edit';
  const svgElRef = useRef<SVGSVGElement | null>(null);
  useImperativeHandle(ref, () => svgElRef.current as SVGSVGElement, []);

  // Each tree's layout is computed independently — a straight-line active
  // chain in one tree is never influenced by anything in another tree —
  // then placed left to right by offsetting so each tree's own bounding
  // box starts exactly where the previous one's ended, plus a gap. A
  // "saved" tree uses the pruned (active-only) layout even in edit mode,
  // same as export — that's the whole point of collapsing it.
  let cursor = 0;
  const positioned = trees.map((tree) => {
    const showFull = interactive && !tree.collapsed;
    const layout = showFull ? computeTreeLayout(tree.state, tree.order) : computePrunedLayout(tree.state, tree.order);
    const visibleNodes = Array.from(layout.values());
    const box = computeBoundingBox(visibleNodes);
    const offsetX = cursor - box.x;
    cursor += box.width + TREE_GAP;
    return { tree, layout, visibleNodes, box, offsetX };
  });

  const combinedWidth = Math.max(cursor - TREE_GAP, 1);
  const combinedTop = positioned.length > 0 ? Math.min(...positioned.map((p) => p.box.y)) : 0;
  const combinedBottom = positioned.length > 0 ? Math.max(...positioned.map((p) => p.box.y + p.box.height)) : 1;

  function resolveEndpoint(endpoint: TreeEndpoint): { node: LaidOutNode; offsetX: number } | null {
    const entry = positioned.find((p) => p.tree.id === endpoint.treeId);
    const node = entry?.layout.get(endpoint.nodeId);
    if (!entry || !node) return null;
    return { node, offsetX: entry.offsetX };
  }

  function isPendingLinkNode(treeId: string, nodeId: TreeNodeId): boolean {
    return pendingLinkStart?.treeId === treeId && pendingLinkStart.nodeId === nodeId;
  }

  return (
    <svg
      ref={svgElRef}
      viewBox={`0 ${combinedTop} ${combinedWidth} ${combinedBottom - combinedTop}`}
      width={combinedWidth}
      height={combinedBottom - combinedTop}
      role="img"
      aria-label={label}
      className="text-gray-900 dark:text-gray-100"
    >
      {positioned.map(({ tree, layout, visibleNodes, offsetX }) => {
        const root = visibleNodes.find((n) => n.parent === null);
        return (
          <g key={tree.id}>
            <TreeGroup
              layout={layout}
              visibleNodes={visibleNodes}
              offsetX={offsetX}
              interactive={interactive}
              linkModeActive={linkModeActive}
              isPendingLinkNode={(nodeId: TreeNodeId) => isPendingLinkNode(tree.id, nodeId)}
              insertedNodes={tree.insertedNodes}
              delinkedEdges={tree.delinkedEdges}
              insertModeActive={insertModeActive}
              delinkingModeActive={delinkingModeActive}
              deleteModeActive={deleteModeActive}
              onToggleNode={(id) => onToggleNode(tree.id, id)}
              onCycleLeaf={(id) => onCycleLeaf(tree.id, id)}
              onReorderSibling={(parentId, childId, targetIndex) => onReorderSibling(tree.id, parentId, childId, targetIndex)}
              onNodeClick={(id) => onNodeClick(tree.id, id)}
              onToggleInserted={(id) => onToggleInserted(tree.id, id)}
              onToggleDelinked={(childId) => onToggleDelinked(tree.id, childId)}
              onToggleTreeDeleted={() => onToggleTreeDeleted(tree.id)}
              svgElRef={svgElRef}
            />
            {/*
              Marked deleted, but still shown fully active — only the
              arrow-to-Ø indicates the rule deletes this segment. Runs
              straight out of the root's own label, same row/baseline as
              its text (not floating above it), same positioning pattern
              TreeGroup uses for the insertion annotation: start just past
              the label's actual rendered edge, not a fixed guess.
            */}
            {tree.deleted && root && (() => {
              const lineStart = nodeLabelHalfWidth(root) + 2;
              const lineEnd = lineStart + 14;
              return (
                <g
                  stroke="currentColor"
                  strokeWidth={1.4}
                  transform={`translate(${root.x + offsetX}, ${root.y})`}
                >
                  <line x1={lineStart} y1={0} x2={lineEnd} y2={0} />
                  <path
                    d={`M ${lineEnd} 0 L ${lineEnd - 6} -4 L ${lineEnd - 6} 4 Z`}
                    fill="currentColor"
                    stroke="none"
                  />
                  <text
                    x={lineEnd + 6}
                    y={0}
                    fontSize={fontSizeFor(root, root.active)}
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

      {links.map((link) => {
        const from = resolveEndpoint(link.from);
        const to = resolveEndpoint(link.to);
        if (!from || !to) return null; // endpoint pruned away in export mode's active-only view — shouldn't happen (links only exist between active nodes) but stay defensive

        // Same anchor convention as a normal tree edge: the shallower
        // ("above") node contributes its bottom, the deeper one its top —
        // a straight line between them, same as within one tree, just
        // spanning two. Link creation only allows nodes exactly one depth
        // level apart, so this is never a long multi-level reach.
        const fromAbove = depthOf(from.node) <= depthOf(to.node);
        const upper = fromAbove ? from : to;
        const lower = fromAbove ? to : from;
        const x1 = upper.node.x + upper.offsetX;
        const y1 = anchorBottom(upper.node);
        const x2 = lower.node.x + lower.offsetX;
        const y2 = anchorTop(lower.node);
        const path = `M ${x1} ${y1} L ${x2} ${y2}`;
        return (
          <g key={link.id}>
            <path d={path} fill="none" stroke="currentColor" strokeWidth={1.4} strokeDasharray="4 3" />
            {interactive && linkModeActive && (
              <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={14}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveLink(link.id);
                }}
              >
                <title>Remove link</title>
              </path>
            )}
          </g>
        );
      })}
    </svg>
  );
});

export default LinkedFeatureTrees;
