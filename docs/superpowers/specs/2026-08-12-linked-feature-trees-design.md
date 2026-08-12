# Linked Feature Trees — Design

**Date:** 2026-08-12
**Scope:** Extends the Feature Geometry Tree Builder (`app/routes/hw-tools.feature-tree.tsx` and its components) to support multiple trees side by side, connected by association/spreading links — matching the autosegmental-rule convention found in `HW13-Czech-KEY.docx` (two `C` segment trees, each `Root → ... → [feature]`, with a curved line showing a feature spreading from one into the other).

## Why

The existing tool builds one tree. Some homework rules (e.g. devoicing assimilation) are answered as two adjacent segment trees with a spreading line between them, not a single tree. This is an extension of the existing tool, not a new one — everything already built (per-tree state, dynamic layout, drag/click reordering, PNG/SVG export) keeps working per tree; this adds the ability to have more than one tree and to link nodes across them.

## Data model

```ts
interface TreeInstance {
  id: string;              // crypto.randomUUID() — stable across add/remove, not a positional index
  state: TreeBuilderState; // unchanged
  order: SiblingOrder;     // unchanged
}

interface TreeLink {
  id: string;
  from: { treeId: string; nodeId: TreeNodeId };
  to: { treeId: string; nodeId: TreeNodeId };
}
```

The route holds `trees: TreeInstance[]` (starts as a single tree — today's exact behavior) and `links: TreeLink[]`.

## Rendering architecture

All trees render inside **one shared `<svg>`**, not separate elements with a visual overlay — this is what makes an arc between two trees a real drawn connection (same coordinate system) rather than an illusion assembled from independently-positioned pieces, and it's what makes the exported image a single self-contained picture matching the docx convention.

- Each tree's layout is computed independently via the existing `computeTreeLayout`/`computePrunedLayout` (unchanged).
- Trees are placed left to right: tree *i*'s horizontal offset is the cumulative width of all previous trees plus a fixed gap, normalized so each tree's own bounding-box left edge lands exactly at its offset.
- The per-tree drawing logic (nodes, edges, reorder-arrows, drag handling) is extracted out of the current `EditableFeatureTree` into a reusable, offset-aware piece, since it now needs to draw at an arbitrary horizontal offset instead of always at the origin.
- A new top-level component (replacing `EditableFeatureTree` as what the route renders and forwards a ref to) computes all trees' offsets, renders each via that reusable piece, and draws the links layer on top — an SVG path per link, curved (quadratic bezier, control point offset perpendicular to the line between the two endpoints) so it reads as a spreading arc rather than a straight line, matching the docx's arc convention.

## Interaction

- **Add Tree** button appends an empty `TreeInstance`. Removing a tree is scoped to removing only the *last* tree (avoids re-indexing/orphaned-link edge cases from removing an arbitrary middle tree).
- **Link mode**: a chain-icon toggle button. While active, all per-node click handling is replaced by link-endpoint picking (toggle/cycle is suspended; drag-to-reorder and the reorder arrows still work, since those are a different gesture/target — reordering remains available even in Link mode):
  - Clicking an **active** node with no pending link start sets it as the start.
  - Clicking a second active node in a **different tree** completes the link; the mode stays on so multiple links can be drawn without re-toggling.
  - Clicking a node in the **same tree** as the pending start re-picks the start (forgiving — no error state).
  - Clicking an **inactive** node is a no-op.
  - Clicking an existing link's path removes it.
- No drag-to-link — click-to-pick only, per explicit decision.
- Deactivating a node (existing cascade behavior, unchanged) also drops any `TreeLink` referencing that node, so a link can never point at a node that's no longer part of its tree.

## Export / Preview

Unchanged mechanism, generalized to N trees: each tree is independently pruned (active-only, tight layout) exactly as today, placed side by side with a gap, and links are drawn between the pruned positions. Because a link only ever exists between two already-active nodes, both endpoints are guaranteed to survive pruning — there is no dangling-link case to handle in the export path.

## Out of scope

- Removing an arbitrary (non-last) tree.
- Drag-to-link.
- Links within the same tree (the interaction only permits cross-tree links, matching the autosegmental-spreading use case this exists for).
- Any change to the Rule Notation tool (unrelated, unaffected).
