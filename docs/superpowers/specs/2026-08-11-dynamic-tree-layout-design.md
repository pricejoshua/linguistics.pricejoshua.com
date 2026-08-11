# Dynamic Feature Tree Layout — Design

**Date:** 2026-08-11
**Scope:** `app/components/hw-tools/EditableFeatureTree.tsx` and its supporting data/utils, in both `edit` and `export` render modes.

## Goal

The Feature Geometry Tree Builder currently renders every node at a fixed `(x, y)` authored for the *full* topology (31 nodes). This means a simple, real answer-key tree — say, a single unbranched chain of three nodes — doesn't collapse into a straight line the way it would if hand-drawn, because its nodes still sit at positions chosen to leave room for siblings that aren't part of this particular tree.

Replace the fixed-position rendering with a single recursive layout algorithm, computed fresh on every render from the current active/inactive state, so that:
- A node with exactly one child sits directly above it — an unbranched chain renders as a straight vertical line.
- A node with multiple children is centered above them — a real fork.
- Active nodes get full spacing; inactive nodes collapse to a small, compact footprint so they don't force wide gaps, but are never removed from the layout (nothing detaches from its parent).
- Position changes animate (CSS transition on `transform`), since node identity is stable across renders.

## Why one continuous layout, not "inactive nodes stay fixed"

Considered and rejected: freezing inactive nodes at today's fixed positions and only computing dynamic positions for active nodes. This breaks as soon as an active ancestor's position changes — its inactive children, still anchored to their old fixed spot, visually detach from their actual parent. A single algorithm that positions every node (active or not) relative to its actual current parent avoids this by construction.

## Algorithm

Post-order width, pre-order position — a minimal tidy-tree layout, computed over `TREE_NODES` (all nodes, not just active ones):

```
minWidth(node):
  if leaf:
    return ACTIVE_LEAF_WIDTH if active(node) else INACTIVE_LEAF_WIDTH
  children = childrenOf(node)
  if children.length == 1:
    return minWidth(children[0])          // chain: no extra width added
  return sum(minWidth(c) for c in children)

assignX(node, leftEdge):
  children = childrenOf(node)
  if children.length == 0:
    node.x = leftEdge + minWidth(node) / 2
    return
  cursor = leftEdge
  for c in children:
    assignX(c, cursor)
    cursor += minWidth(c)
  node.x = (children[0].x + children[-1].x) / 2   // 1 child -> node.x == child.x
```

`y` stays depth-based (fixed row height per tree level, as today) — only `x` becomes dynamic. `ACTIVE_LEAF_WIDTH` matches roughly today's fixed spacing (~100px); `INACTIVE_LEAF_WIDTH` is small (~24px) so inactive branches compress toward each other without disappearing.

**Export mode** reuses the identical function, called with inactive nodes given zero width and excluded from the rendered output — the same unification the current fixed-position code already does for "active nodes only," just driven by the new layout instead of the old lookup table.

## Animation

Each node's `<g>` wrapper uses `transform: translate(x, y)` with a CSS `transition: transform` (no new dependency — this is a native browser feature). Because each node's React `key` is its stable `TreeNodeId`, the same DOM element persists across a toggle, so the browser animates between old and new computed positions automatically.

## What doesn't change

- `TREE_NODES`' `parent`/`kind`/`label` fields (Task 2) remain the source of truth for structure — only their authored `x`/`y` fields stop being used for rendering (superseded by the computed layout). They can stay in the data file as historical/reference values or be removed; decide during implementation based on whether anything else still reads them.
- `treeBuilderState.ts`'s cascade logic (`toggleNode`, `cycleLeafValue`, `activeNodeIds`) is unchanged — this is purely a rendering-layer change.
- The PNG/SVG export mechanism (Task 4) is unchanged; it rasterizes/serializes whatever SVG it's given, regardless of how that SVG's node positions were computed.

## Out of scope

- Tuning exact spacing/timing constants by feel — implement with reasonable defaults, then adjust based on how it actually looks once running.
- Any change to the Rule Notation tool (unaffected).
