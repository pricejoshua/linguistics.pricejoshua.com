import { useRef, useState } from 'react';
import { Link as LinkIcon, Plus, Scissors } from 'lucide-react';
import LinkedFeatureTrees from '../components/hw-tools/LinkedFeatureTrees';
import ExportControls from '../components/hw-tools/ExportControls';
import { toggleNode, cycleLeafValue, activeNodeIds } from '../utils/hw-tools/treeBuilderState';
import { reorderSibling } from '../utils/hw-tools/treeOrder';
import { naturalChildOrder, computeTreeLayout, depthOf } from '../utils/hw-tools/treeLayout';
import {
  emptyTreeInstance,
  createLink,
  removeLink,
  removeLinksForNode,
  removeLinksForTree,
  pruneAnnotations,
  type TreeInstance,
  type TreeEndpoint,
  type TreeLink,
} from '../utils/hw-tools/treeLinks';
import type { TreeNodeId } from '../data/hw-tools/featureTreeTopology';

type AnnotationMode = 'none' | 'link' | 'insert' | 'delinking';

export default function FeatureTreeTool() {
  const [trees, setTrees] = useState<TreeInstance[]>(() => [emptyTreeInstance()]);
  const [links, setLinks] = useState<TreeLink[]>([]);
  const [mode, setMode] = useState<AnnotationMode>('none');
  const [pendingLinkStart, setPendingLinkStart] = useState<TreeEndpoint | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const exportRef = useRef<SVGSVGElement>(null);

  const findTree = (treeId: string) => trees.find((t) => t.id === treeId);

  /** Depth of a node within its own tree (0 = root), for the "one level apart" link constraint. */
  const depthOfEndpoint = (endpoint: TreeEndpoint): number | null => {
    const tree = findTree(endpoint.treeId);
    if (!tree) return null;
    const node = computeTreeLayout(tree.state, tree.order).get(endpoint.nodeId);
    return node ? depthOf(node) : null;
  };

  /**
   * Applies a state-changing update to one tree, then cleans up anything
   * that referenced a node the update just deactivated — including nodes
   * deactivated indirectly via cascade (deactivating a parent deactivates
   * its whole active subtree), not just the one directly clicked. Links,
   * "inserted from Ø" markings, and delinking markings can all reference a
   * node, so all three get swept together here.
   */
  const applyStateChange = (treeId: string, updater: (state: TreeInstance['state']) => TreeInstance['state']) => {
    const tree = findTree(treeId);
    if (!tree) return;
    const prevActive = activeNodeIds(tree.state);
    const nextState = updater(tree.state);
    const nextActive = activeNodeIds(nextState);
    const deactivated = [...prevActive].filter((id) => !nextActive.has(id));
    setTrees((ts) =>
      ts.map((t) => (t.id === treeId ? pruneAnnotations({ ...t, state: nextState }, deactivated) : t)),
    );
    if (deactivated.length > 0) {
      setLinks((ls) => deactivated.reduce((acc, id) => removeLinksForNode(acc, treeId, id), ls));
    }
  };

  const handleToggle = (treeId: string, id: TreeNodeId) => applyStateChange(treeId, (state) => toggleNode(state, id));
  const handleCycle = (treeId: string, id: TreeNodeId) => applyStateChange(treeId, (state) => cycleLeafValue(state, id));

  const handleReorder = (treeId: string, parentId: TreeNodeId, childId: TreeNodeId, targetIndex: number) => {
    setTrees((ts) =>
      ts.map((t) =>
        t.id === treeId ? { ...t, order: reorderSibling(t.order, parentId, childId, targetIndex, naturalChildOrder(parentId)) } : t,
      ),
    );
  };

  const handleAddTree = () => setTrees((ts) => [...ts, emptyTreeInstance()]);

  const handleToggleCollapse = (treeId: string) =>
    setTrees((ts) => ts.map((t) => (t.id === treeId ? { ...t, collapsed: !t.collapsed } : t)));

  const handleToggleDeleted = (treeId: string) =>
    setTrees((ts) => ts.map((t) => (t.id === treeId ? { ...t, deleted: !t.deleted } : t)));

  const handleRemoveLastTree = () => {
    if (trees.length <= 1) return;
    const last = trees[trees.length - 1];
    setTrees((ts) => ts.slice(0, -1));
    setLinks((ls) => removeLinksForTree(ls, last.id));
    if (pendingLinkStart?.treeId === last.id) setPendingLinkStart(null);
  };

  const handleNodeClickInLinkMode = (treeId: string, nodeId: TreeNodeId) => {
    const tree = findTree(treeId);
    if (!tree || !activeNodeIds(tree.state).has(nodeId)) return; // only active nodes are linkable
    setLinkError(null);

    if (!pendingLinkStart) {
      setPendingLinkStart({ treeId, nodeId });
      return;
    }
    if (pendingLinkStart.treeId === treeId) {
      // Re-picking within the same tree — change the start rather than erroring.
      setPendingLinkStart({ treeId, nodeId });
      return;
    }
    const endpoint = { treeId, nodeId };
    const startDepth = depthOfEndpoint(pendingLinkStart);
    const endDepth = depthOfEndpoint(endpoint);
    if (startDepth === null || endDepth === null || Math.abs(startDepth - endDepth) !== 1) {
      // Links only connect adjacent tiers — same convention as a normal
      // parent/child edge, just spanning two trees. Leave the pending start
      // in place so a different, valid target can be picked without
      // restarting.
      setLinkError('Links can only connect nodes one level apart.');
      return;
    }
    setLinks((ls) => [...ls, createLink(pendingLinkStart, endpoint)]);
    setPendingLinkStart(null);
  };

  const handleRemoveLink = (linkId: string) => setLinks((ls) => removeLink(ls, linkId));

  const handleToggleInserted = (treeId: string, nodeId: TreeNodeId) =>
    setTrees((ts) =>
      ts.map((t) => {
        if (t.id !== treeId) return t;
        const next = new Set(t.insertedNodes);
        if (next.has(nodeId)) next.delete(nodeId);
        else next.add(nodeId);
        return { ...t, insertedNodes: next };
      }),
    );

  const handleToggleDelinked = (treeId: string, childId: TreeNodeId) =>
    setTrees((ts) =>
      ts.map((t) => {
        if (t.id !== treeId) return t;
        const next = new Set(t.delinkedEdges);
        if (next.has(childId)) next.delete(childId);
        else next.add(childId);
        return { ...t, delinkedEdges: next };
      }),
    );

  const setModeExclusive = (next: AnnotationMode) => {
    setMode((current) => (current === next ? 'none' : next));
    setPendingLinkStart(null);
    setLinkError(null);
  };

  const handleClear = () => {
    setTrees([emptyTreeInstance()]);
    setLinks([]);
    setMode('none');
    setPendingLinkStart(null);
    setLinkError(null);
  };

  const hasActiveNodes = trees.some((t) => activeNodeIds(t.state).size > 0);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Feature Geometry Tree Builder
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Click a node to add it (and its ancestors); click again to remove it (and its descendants). Click a
          leaf to cycle its value: unspecified → + → − → unspecified. Drag a node left or right (or focus it
          and use the arrow keys) to swap it with its siblings.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          For rules spanning multiple segments, add another tree and use Link mode to draw an association
          line between an active node in one tree and an active node in another, one level apart.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Use Insert to mark a feature as added from Ø (dotted edge, Ø→ annotation), Delink to mark a
          connection as severed (⧸⧸ across the edge), and a tree's own Delete/Restore button to mark a whole
          segment deleted (→Ø near its root).
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nothing here is saved — copy your work before navigating away.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {trees.map((tree, i) => (
          <span key={tree.id} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleToggleCollapse(tree.id)}
              className="px-3 py-1 text-sm rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              {trees.length > 1 ? `Tree ${i + 1}: ` : ''}
              {tree.collapsed ? 'Edit' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => handleToggleDeleted(tree.id)}
              aria-pressed={tree.deleted}
              className={`px-3 py-1 text-sm rounded-full ${
                tree.deleted
                  ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                  : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tree.deleted ? 'Restore' : 'Delete'}
            </button>
          </span>
        ))}
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded p-4">
        <LinkedFeatureTrees
          trees={trees}
          links={links}
          mode="edit"
          linkModeActive={mode === 'link'}
          pendingLinkStart={pendingLinkStart}
          insertModeActive={mode === 'insert'}
          delinkingModeActive={mode === 'delinking'}
          onToggleNode={handleToggle}
          onCycleLeaf={handleCycle}
          onReorderSibling={handleReorder}
          onNodeClick={handleNodeClickInLinkMode}
          onRemoveLink={handleRemoveLink}
          onToggleInserted={handleToggleInserted}
          onToggleDelinked={handleToggleDelinked}
          label="Feature geometry trees being built"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAddTree}
          className="flex items-center gap-1 px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" /> Add Tree
        </button>
        <button
          type="button"
          onClick={handleRemoveLastTree}
          disabled={trees.length <= 1}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Remove Last Tree
        </button>
        <button
          type="button"
          onClick={() => setModeExclusive('link')}
          disabled={trees.length < 2}
          aria-pressed={mode === 'link'}
          className={`flex items-center gap-1 px-4 py-2 rounded disabled:opacity-40 disabled:cursor-not-allowed ${
            mode === 'link'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <LinkIcon className="h-4 w-4" /> {mode === 'link' ? 'Linking…' : 'Link'}
        </button>
        <button
          type="button"
          onClick={() => setModeExclusive('insert')}
          aria-pressed={mode === 'insert'}
          className={`flex items-center gap-1 px-4 py-2 rounded ${
            mode === 'insert'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Plus className="h-4 w-4" /> {mode === 'insert' ? 'Marking insertions…' : 'Insert'}
        </button>
        <button
          type="button"
          onClick={() => setModeExclusive('delinking')}
          aria-pressed={mode === 'delinking'}
          className={`flex items-center gap-1 px-4 py-2 rounded ${
            mode === 'delinking'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
          }`}
        >
          <Scissors className="h-4 w-4" /> {mode === 'delinking' ? 'Marking delinking…' : 'Delink'}
        </button>
      </div>

      {mode === 'link' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
          Click an active node, then click an active node one level up or down in another tree to link them.
          Click an existing link to remove it.
        </p>
      )}
      {mode === 'insert' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
          Click an active node to mark it inserted from Ø (or click again to undo).
        </p>
      )}
      {mode === 'delinking' && (
        <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
          Click an edge between two active nodes to mark it delinking (or click again to undo).
        </p>
      )}
      {linkError && <p className="text-xs text-red-600 dark:text-red-400 -mt-3">{linkError}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <ExportControls svgRef={exportRef} disabled={!hasActiveNodes} filenameBase="feature-tree" />
        <button
          type="button"
          onClick={() => setPreviewOpen((open) => !open)}
          disabled={!hasActiveNodes}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          {previewOpen ? 'Hide Preview' : 'Preview'}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      {/*
        Same trees/links, same ref used for export — the Preview toggle just
        decides whether it's shown on screen. Always mounted (even when
        hidden) so the ref is populated whenever the export buttons are
        clicked.
      */}
      <div className={previewOpen ? 'overflow-x-auto border border-gray-200 dark:border-gray-800 rounded p-4' : 'sr-only'} aria-hidden={!previewOpen}>
        {previewOpen && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            This is exactly what gets copied/downloaded — only active nodes, laid out fresh.
          </p>
        )}
        <LinkedFeatureTrees
          ref={exportRef}
          trees={trees}
          links={links}
          mode="export"
          linkModeActive={false}
          pendingLinkStart={null}
          insertModeActive={false}
          delinkingModeActive={false}
          onToggleNode={() => {}}
          onCycleLeaf={() => {}}
          onReorderSibling={() => {}}
          onNodeClick={() => {}}
          onRemoveLink={() => {}}
          onToggleInserted={() => {}}
          onToggleDelinked={() => {}}
          label="Feature geometry trees export"
        />
      </div>
    </div>
  );
}
