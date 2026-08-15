import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import LinkedFeatureTrees from '../components/hw-tools/LinkedFeatureTrees';
import ExportControls from '../components/hw-tools/ExportControls';
import ModeMark, { type MarkKind } from '../components/hw-tools/ModeMark';
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

type AnnotationMode = 'none' | 'link' | 'insert' | 'delinking' | 'delete';

/**
 * Each mode is named for the mark it draws, and carries that mark as a drawn
 * SVG — the button shows you its own output. `danger` routes Delete to the
 * correction-pen colour so the four modes are no longer distinguishable only
 * by their label.
 */
const MODES: {
  id: Exclude<AnnotationMode, 'none'>;
  label: string;
  activeLabel: string;
  mark: MarkKind;
  hint: string;
  danger?: boolean;
  needsTwoTrees?: boolean;
}[] = [
  {
    id: 'link',
    label: 'Associate',
    activeLabel: 'Associating',
    mark: 'associate',
    hint: 'Click an active node, then an active node one level up or down in another tree. Click an existing association line to remove it.',
    needsTwoTrees: true,
  },
  {
    id: 'insert',
    label: 'Insert',
    activeLabel: 'Inserting',
    mark: 'insert',
    hint: 'Click an active node to mark it inserted from Ø. Click it again to undo.',
  },
  {
    id: 'delinking',
    label: 'Delink',
    activeLabel: 'Delinking',
    mark: 'delink',
    hint: 'Click an edge between two active nodes to mark it delinked. Click it again to undo.',
  },
  {
    id: 'delete',
    label: 'Delete',
    activeLabel: 'Deleting',
    mark: 'delete',
    hint: 'Click any node to mark that whole segment deleted. Click again to undo. The tree stays visible.',
    danger: true,
  },
];

const BASE_HINT =
  'Click a node to add it and its ancestors; click again to remove it and its descendants. Click a leaf to cycle its value: unspecified → + → −. Drag a node sideways, or focus it and press ← →, to swap it with a sibling.';

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

  const handleToggleLock = (treeId: string) =>
    setTrees((ts) => ts.map((t) => (t.id === treeId ? { ...t, collapsed: !t.collapsed } : t)));

  /** Marks a whole segment as deleted by the rule (arrow-to-Ø near its root) — the tree stays fully active/visible, this is a rendering annotation, not a real removal. */
  const handleToggleTreeDeleted = (treeId: string) =>
    setTrees((ts) => ts.map((t) => (t.id === treeId ? { ...t, deleted: !t.deleted } : t)));

  /** Actually removes a tree from the canvas — unlike handleToggleTreeDeleted, this is permanent for this session. */
  const handleRemoveTree = (treeId: string) => {
    if (trees.length <= 1) return;
    setTrees((ts) => ts.filter((t) => t.id !== treeId));
    setLinks((ls) => removeLinksForTree(ls, treeId));
    if (pendingLinkStart?.treeId === treeId) setPendingLinkStart(null);
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
      setLinkError('Association lines connect nodes one level apart. Pick a node one tier up or down.');
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
  const activeMode = MODES.find((m) => m.id === mode);

  return (
    <main className="max-w-6xl mx-auto px-5 py-8">
      <header className="mb-6 max-w-2xl">
        <h1 className="u-display" style={{ fontSize: '1.6rem' }}>
          Feature geometry trees
        </h1>
        <p className="u-note mt-2">
          Build a tree, annotate what the rule does to it, and copy the result into your assignment.
        </p>
        {/*
          The four-paragraph wall of instructions used to sit above the canvas
          and push the actual tool below the fold. The one line a student needs
          right now lives in the toolbar hint; the full reference is here, one
          click away.
        */}
        <details className="mt-3">
          <summary
            className="u-note cursor-pointer inline-flex items-center gap-1.5 select-none"
            style={{ color: 'var(--ditto)' }}
          >
            How this works
          </summary>
          <div className="u-note mt-3 space-y-2 panel p-4">
            <p>{BASE_HINT}</p>
            <p>
              For a rule spanning more than one segment, add a second tree and use{' '}
              <strong style={{ color: 'var(--ink)' }}>Associate</strong> to draw a line between
              active nodes in different trees, one tier apart.
            </p>
            <p>
              <strong style={{ color: 'var(--ink)' }}>Lock</strong> a tree to collapse it to just
              its active nodes while you work on another one.
            </p>
          </div>
        </details>
      </header>

      {/*
        Canvas first. The white rectangle is the artifact and a preview of the
        page it is headed for, so it stays #FFFFFF in dark mode too. Its
        toolbars are attached to it rather than floating as separate rows, so
        it reads as one instrument instead of three stacked control bars.
      */}
      <section className="panel overflow-hidden">
        <div
          className="flex flex-wrap items-center gap-2 px-3 py-2 border-b"
          style={{ borderColor: 'var(--line)' }}
        >
          <span className="u-label mr-1">Trees</span>
          {trees.map((tree, i) => (
            <span key={tree.id} className="chip">
              <span className="chip-index">{i + 1}</span>
              <button
                type="button"
                onClick={() => handleToggleLock(tree.id)}
                aria-pressed={tree.collapsed}
                title={tree.collapsed ? 'Show every node again' : 'Collapse to only the active nodes'}
                className="chip-btn"
              >
                {tree.collapsed ? 'Locked' : 'Lock'}
              </button>
              <button
                type="button"
                onClick={() => handleRemoveTree(tree.id)}
                disabled={trees.length <= 1}
                title={trees.length <= 1 ? 'The last tree cannot be removed' : `Remove tree ${i + 1}`}
                aria-label={`Remove tree ${i + 1}`}
                className="chip-btn chip-btn-danger"
              >
                ✕
              </button>
            </span>
          ))}
          <button type="button" onClick={handleAddTree} className="btn btn-quiet">
            <Plus className="h-3.5 w-3.5" /> Add tree
          </button>
        </div>

        <div className="canvas p-5">
          <LinkedFeatureTrees
            trees={trees}
            links={links}
            mode="edit"
            linkModeActive={mode === 'link'}
            pendingLinkStart={pendingLinkStart}
            insertModeActive={mode === 'insert'}
            delinkingModeActive={mode === 'delinking'}
            deleteModeActive={mode === 'delete'}
            onToggleNode={handleToggle}
            onCycleLeaf={handleCycle}
            onReorderSibling={handleReorder}
            onNodeClick={handleNodeClickInLinkMode}
            onRemoveLink={handleRemoveLink}
            onToggleInserted={handleToggleInserted}
            onToggleDelinked={handleToggleDelinked}
            onToggleTreeDeleted={handleToggleTreeDeleted}
            label="Feature geometry trees being built"
          />
        </div>

        <div className="border-t" style={{ borderColor: 'var(--line)' }}>
          <div className="flex flex-wrap items-center gap-1 px-3 pt-2">
            <span className="u-label mr-1">Mark</span>
            {MODES.map((m) => {
              const isActive = mode === m.id;
              const disabled = m.needsTwoTrees && trees.length < 2;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setModeExclusive(m.id)}
                  disabled={disabled}
                  aria-pressed={isActive}
                  title={disabled ? 'Add a second tree to draw association lines' : m.hint}
                  className={`mode${m.danger ? ' mode-danger' : ''}`}
                >
                  <ModeMark kind={m.mark} />
                  {isActive ? m.activeLabel : m.label}
                </button>
              );
            })}
          </div>
          {/*
            Fixed height. Previously each mode's hint was conditionally
            rendered with a `-mt-3` pull, so toggling a mode shifted every
            control below it.
          */}
          <p
            className="u-note px-3 pb-2.5 pt-1.5"
            style={{ minHeight: '3.4em', color: linkError ? 'var(--marker)' : undefined }}
            role={linkError ? 'alert' : undefined}
          >
            {linkError ?? activeMode?.hint ?? BASE_HINT}
          </p>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-2 mt-4">
        <ExportControls svgRef={exportRef} disabled={!hasActiveNodes} filenameBase="feature-tree" />
        <button
          type="button"
          onClick={() => setPreviewOpen((open) => !open)}
          disabled={!hasActiveNodes}
          aria-pressed={previewOpen}
          className="btn"
        >
          {previewOpen ? 'Hide export preview' : 'Show export preview'}
        </button>
        <button type="button" onClick={handleClear} className="btn btn-danger ml-auto">
          Clear everything
        </button>
      </div>

      {/*
        The one sentence with real stakes. It used to be the fourth paragraph
        of the intro in the faintest grey on the page; it belongs next to the
        buttons whose absence causes the loss.
      */}
      <p className="u-note mt-2">
        Nothing here is saved. Copy or download your work before you leave the page.
      </p>

      {/*
        Same trees/links, same ref used for export — the preview toggle just
        decides whether it's shown on screen. Always mounted (even when
        hidden) so the ref is populated whenever the export buttons are
        clicked.
      */}
      <section className={previewOpen ? 'mt-4' : 'sr-only'} aria-hidden={!previewOpen}>
        {previewOpen && (
          <h2 className="u-label mb-2">Export preview — active nodes only, laid out fresh</h2>
        )}
        <div className={previewOpen ? 'canvas canvas-framed p-5' : undefined}>
          <LinkedFeatureTrees
            ref={exportRef}
            trees={trees}
            links={links}
            mode="export"
            linkModeActive={false}
            pendingLinkStart={null}
            insertModeActive={false}
            delinkingModeActive={false}
            deleteModeActive={false}
            onToggleNode={() => {}}
            onCycleLeaf={() => {}}
            onReorderSibling={() => {}}
            onNodeClick={() => {}}
            onRemoveLink={() => {}}
            onToggleInserted={() => {}}
            onToggleDelinked={() => {}}
            onToggleTreeDeleted={() => {}}
            label="Feature geometry trees export"
          />
        </div>
      </section>
    </main>
  );
}
