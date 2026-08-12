import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { TreeNodeId } from '../../data/hw-tools/featureTreeTopology';
import { computeTreeLayout, computePrunedLayout, computeBoundingBox } from '../../utils/hw-tools/treeLayout';
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
  onToggleNode: (treeId: string, id: TreeNodeId) => void;
  onCycleLeaf: (treeId: string, id: TreeNodeId) => void;
  onReorderSibling: (treeId: string, parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) => void;
  onNodeClick: (treeId: string, id: TreeNodeId) => void;
  onRemoveLink: (linkId: string) => void;
}

/** Horizontal breathing room between adjacent trees. */
const TREE_GAP = 60;
/** How far a link's arc bows away from a straight line, as a fraction of the endpoints' horizontal distance (capped). */
const LINK_BOW_FRACTION = 0.25;
const LINK_BOW_MAX = 70;

const LinkedFeatureTrees = forwardRef<SVGSVGElement, LinkedFeatureTreesProps>(function LinkedFeatureTrees(
  { trees, links, label, mode, linkModeActive, pendingLinkStart, onToggleNode, onCycleLeaf, onReorderSibling, onNodeClick, onRemoveLink },
  ref,
) {
  const interactive = mode === 'edit';
  const svgElRef = useRef<SVGSVGElement | null>(null);
  useImperativeHandle(ref, () => svgElRef.current as SVGSVGElement, []);

  // Each tree's layout is computed independently — a straight-line active
  // chain in one tree is never influenced by anything in another tree —
  // then placed left to right by offsetting so each tree's own bounding
  // box starts exactly where the previous one's ended, plus a gap.
  let cursor = 0;
  const positioned = trees.map((tree) => {
    const layout = interactive ? computeTreeLayout(tree.state, tree.order) : computePrunedLayout(tree.state, tree.order);
    const visibleNodes = Array.from(layout.values());
    const box = computeBoundingBox(visibleNodes);
    const offsetX = cursor - box.x;
    cursor += box.width + TREE_GAP;
    return { tree, layout, visibleNodes, box, offsetX };
  });

  const combinedWidth = Math.max(cursor - TREE_GAP, 1);
  const combinedTop = positioned.length > 0 ? Math.min(...positioned.map((p) => p.box.y)) : 0;
  const combinedBottom = positioned.length > 0 ? Math.max(...positioned.map((p) => p.box.y + p.box.height)) : 1;

  function absolutePosition(endpoint: TreeEndpoint): { x: number; y: number } | null {
    const entry = positioned.find((p) => p.tree.id === endpoint.treeId);
    const node = entry?.layout.get(endpoint.nodeId);
    if (!entry || !node) return null;
    return { x: node.x + entry.offsetX, y: node.y };
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
      {positioned.map(({ tree, layout, visibleNodes, offsetX }) => (
        <TreeGroup
          key={tree.id}
          layout={layout}
          visibleNodes={visibleNodes}
          offsetX={offsetX}
          interactive={interactive}
          linkModeActive={linkModeActive}
          isPendingLinkNode={(nodeId: TreeNodeId) => isPendingLinkNode(tree.id, nodeId)}
          onToggleNode={(id) => onToggleNode(tree.id, id)}
          onCycleLeaf={(id) => onCycleLeaf(tree.id, id)}
          onReorderSibling={(parentId, childId, targetIndex) => onReorderSibling(tree.id, parentId, childId, targetIndex)}
          onNodeClick={(id) => onNodeClick(tree.id, id)}
          svgElRef={svgElRef}
        />
      ))}

      {links.map((link) => {
        const from = absolutePosition(link.from);
        const to = absolutePosition(link.to);
        if (!from || !to) return null; // endpoint pruned away in export mode's active-only view — shouldn't happen (links only exist between active nodes) but stay defensive
        const midX = (from.x + to.x) / 2;
        const distance = Math.abs(to.x - from.x);
        const bow = Math.min(distance * LINK_BOW_FRACTION, LINK_BOW_MAX);
        const controlY = Math.min(from.y, to.y) - bow;
        const path = `M ${from.x} ${from.y} Q ${midX} ${controlY} ${to.x} ${to.y}`;
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
