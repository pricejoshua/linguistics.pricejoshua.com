import { useRef, useState } from 'react';
import EditableFeatureTree from '../components/hw-tools/EditableFeatureTree';
import ExportControls from '../components/hw-tools/ExportControls';
import { emptyTreeState, toggleNode, cycleLeafValue, activeNodeIds } from '../utils/hw-tools/treeBuilderState';
import type { TreeNodeId } from '../data/hw-tools/featureTreeTopology';

export default function FeatureTreeTool() {
  const [state, setState] = useState(emptyTreeState());
  const [previewOpen, setPreviewOpen] = useState(false);
  const exportRef = useRef<SVGSVGElement>(null);

  const handleToggle = (id: TreeNodeId) => setState((s) => toggleNode(s, id));
  const handleCycle = (id: TreeNodeId) => setState((s) => cycleLeafValue(s, id));
  const hasActiveNodes = activeNodeIds(state).size > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Feature Geometry Tree Builder
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Click a node to add it (and its ancestors); click again to remove it (and its descendants). Click a
          leaf to cycle its value: unspecified → + → − → unspecified.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nothing here is saved — copy your work before navigating away.
        </p>
      </div>

      <div className="overflow-x-auto border border-gray-200 dark:border-gray-800 rounded p-4">
        <EditableFeatureTree
          state={state}
          onToggleNode={handleToggle}
          onCycleLeaf={handleCycle}
          label="Feature geometry tree being built"
          mode="edit"
        />
      </div>

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
          onClick={() => setState(emptyTreeState())}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>

      {/*
        Same tree, same ref used for export — the Preview toggle just decides
        whether it's shown on screen. Always mounted (even when hidden) so
        the ref is populated whenever the export buttons are clicked.
      */}
      <div className={previewOpen ? 'overflow-x-auto border border-gray-200 dark:border-gray-800 rounded p-4' : 'sr-only'} aria-hidden={!previewOpen}>
        {previewOpen && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            This is exactly what gets copied/downloaded — only active nodes, laid out fresh.
          </p>
        )}
        <EditableFeatureTree
          ref={exportRef}
          state={state}
          onToggleNode={() => {}}
          onCycleLeaf={() => {}}
          label="Feature geometry tree export"
          mode="export"
        />
      </div>
    </div>
  );
}
