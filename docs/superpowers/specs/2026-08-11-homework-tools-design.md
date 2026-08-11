# Homework Tools — Design

**Date:** 2026-08-11
**Routes:** new `/hw-tools/*` section (exact sub-paths TBD at plan time)
**Source material:** `hw-templates/examples/` — `HW04-ModernGreek-KEY.docx`, `HW12-FeatureGeometry-KEY.docx`, `HW13-Czech-KEY.docx` (LING 330 phonology homework answer keys)

## Goal

Give LING 330 students a **helper tool**, not a submission platform: they build the two most tedious structured elements of their homework in a web UI, then copy the result into a Word document they're already writing prose in. The tool never owns the submission — it only removes the manual-shape-drawing tedium for the hardest parts.

Two structures were identified (from `example-list.txt` and manual inspection of the docx XML) as disproportionately painful to build by hand in Word:

1. **Feature geometry trees** — currently built in Word by manually placing rectangle/line/bracket/arc shapes on a drawing canvas. Slow, error-prone, and explicitly graded on "any incorrect or missing node or line."
2. **Formal phonological rule notation** (e.g. `Ø → V / C __ C #` with a stacked feature matrix like `[–back, –high]` underneath) — currently built as an invisible-border Word table used purely for alignment, with brackets drawn as separate floating shapes when a matrix has more than one feature.

Other content types in the examples (data/word-list tables, Y-charts, rule-ordering tables) are already reasonably well served by Word's native table tool and are **out of scope for v1**.

## Non-goals

- No backend, no persistence, no accounts/auth. Each tool run is stateless; refreshing the page loses in-progress work (acceptable — a build is a short "compose → export" session, not an ongoing document).
- Not a Word replacement. No prose editing, no submission flow, no grading.
- Not a generic/freeform diagram editor. Both tools are structured builders over a fixed schema (a known tree topology; a known rule-slot grammar), not a blank canvas.
- Mobile/tablet layout is not a target — usage is a laptop with Word open alongside.

## Architecture

- New **self-contained module** inside the existing `linguistics.pricejoshua.com` app: own routes, components, and data under (e.g.) `app/routes/hw-tools.*`, `app/components/hw-tools/*`, `app/data/hw-tools/*`.
- Deliberately **not** wired into the existing `/phonology/geometry` reference screen or its live `featureGeometry.ts`/`FeatureGeometryTree.tsx`. The homework tree tool starts from its **own copy** of the canonical topology. Rationale: this is a first attempt at a different interaction model (editable/prunable vs. read-only reference), and the two should be free to diverge without one change risking a regression in the other.
- Ships as new routes in the **existing** Docker container / nginx route for `linguistics.pricejoshua.com` — no new self-hosted service, no new Uptime Kuma monitor.
- No new dependencies expected beyond what the repo already has (React 19, Tailwind 4) for the UI; export logic (canvas rasterization, `Blob`/`ClipboardItem`) uses only browser-native APIs.

## Shared export mechanism

Both tools converged on the same output shape: build interactively → render to inline SVG → export. Rather than duplicate this per tool, it's one shared piece:

- **`useSvgExport(svgRef)`** hook (or equivalent small utility), used by both builders:
  - **"Copy as PNG"** — serializes the current SVG to a data URL, draws it onto an offscreen `<canvas>` at a higher pixel ratio (e.g. 3–4×, so moderate resizing in Word still looks crisp), converts to a `image/png` `Blob`, and writes it via `navigator.clipboard.write([new ClipboardItem({'image/png': blob})])`. One click, pastes directly as a picture.
  - **"Download SVG"** — serializes the SVG element to a `.svg` file `Blob` and triggers a download. Students insert it in Word via `Insert > Pictures`, which (Word 2016+/365, Win and Mac) treats SVG as a real vector graphic — true quality at any resize, at the cost of one extra manual step instead of Ctrl+V.
  - Rationale for both: the browser Clipboard API's `ClipboardItem` only accepts a narrow MIME allow-list (`text/plain`, `text/html`, `image/png`, roughly) — `image/svg+xml` is **not** a writable clipboard image type in Chrome/Firefox/Edge today. So a true one-click vector paste isn't achievable; PNG-copy is the fast path, SVG-download is the quality path.
  - Both buttons disabled when the current build is empty (tree has zero active nodes; rule has zero non-empty slots) — avoids exporting blank content.
- Requires a **web-safe IPA-capable font** (matching the `Charis SIL` font used in the actual answer-key docs, or an equivalent like Noto Sans) loaded on the page, so glyphs rasterize consistently across browsers.

## Tool 1 — Feature Geometry Tree

### Data model

A local copy of the fixed topology already established in `2026-08-04-feature-geometry-design.md` (Root → Laryngeal/Supralaryngeal → Place → Labial/Coronal/Dorsal/TongueRoot → leaf features, plus Tonal). Same shape, own copy, per the decoupling rationale above.

Per-node builder state (not the same as the reference screen's per-*phone* state):

```
Map<NodeId, { active: boolean; value?: '+' | '-' }>
```

- `active` — is this node/leaf part of the tree the student is drawing.
- `value` — for leaf nodes only, cycles `undefined → '+' → '-' → undefined` on click.

### Interaction

- Click a non-leaf node to toggle it (and implicitly require its ancestors — toggling a node on auto-activates its parent chain, since a node can't float without its structural ancestors; toggling off cascades to descendants).
- Click a leaf to cycle its value.
- **Render mode differs from the reference screen on purpose:** inactive nodes/edges are **fully omitted**, not greyed out. The homework answer key shows a clean pruned tree (only the relevant nodes, exactly matching what a student would hand-draw for "the fewest features/nodes needed to characterize this natural class") — not a ghosted full topology.

### Component

- `EditableFeatureTree` — SVG renderer + click handlers, own component (not the existing `FeatureGeometryTree`), because the render-mode difference (omit vs. grey) and the interaction (click-to-toggle) diverge enough that sharing would mean threading extra props/branches through the reference component just to serve a second, different purpose.
- Page: node/leaf palette or just the tree itself with all nodes visible-but-toggleable (exact layout — e.g. whether inactive nodes are shown faint-and-clickable during editing, vs. a separate "add node" affordance — is a plan-time UI detail, not a spec-level decision).
- Export controls (`Copy as PNG` / `Download SVG`) from the shared mechanism above.

## Tool 2 — Formal Rule Notation

### Data model

A rule is an ordered list of **slots**:

```
type Slot =
  | { kind: 'text'; value: string }              // →, /, #, Ø, C, V, a bare symbol, etc.
  | { kind: 'matrix'; values: string[] }          // e.g. ['-back', '-high'], stacked
```

This mirrors the actual convention found in the answer keys: a rule is symbols left-to-right (target, arrow, change, slash, left context, blank, right context, boundary), where any one slot may instead be a vertically-stacked feature bracket.

### Rendering & export

Originally scoped as a native Word-table paste (matching exactly how the answer keys build these: an invisible-border grid table, one column per slot, a matrix slot spanning extra rows in its column). Revisited during design: representing a multi-feature bracket without a real drawn bracket shape means falling back to a **text approximation** (literal `[` / `]` characters on the first/last stacked line) — rejected in favor of exporting the **whole rendered rule as a single image**, for the same reason the tree tool uses images: the drawn bracket is part of the correct visual output, and a plain-table fallback would visibly diverge from the answer-key convention.

- **`RuleBuilder`** — add/remove/reorder slots, toggle a slot between text and matrix, quick-insert buttons for common symbols (`→ Ø / _ #`) and any IPA symbols already available in the site's phone data.
- **`RuleDiagram`** — renders the slot sequence as inline SVG: text slots as inline symbols, matrix slots as a vertically stacked list with a real bracket glyph/path spanning the stack (same visual convention as the answer keys' floating bracket shapes).
- Export via the same shared `useSvgExport` mechanism as the tree tool (`Copy as PNG` / `Download SVG`).

## Error handling & edge cases

- Clipboard PNG write unsupported (rare, older browser) → the "Copy as PNG" click falls back to triggering a PNG download instead of silently failing.
- Empty-state exports disabled (see shared export mechanism).
- No autosave/persistence — a brief inline note near each tool ("copy your work before navigating away") sets expectations instead of building storage for a deliberately short-lived, stateless tool.

## Testing

- No test framework currently exists in this repo (`test/` holds unrelated HTML fixtures, no test script in `package.json`) — not worth introducing one for a small, visually-verified tool.
- **Acceptance bar:** reconstruct the relevant structures from all three example answer keys (HW04 has no tree/rule content and is out of scope; HW12 and HW13 trees and rules) using the tool, export, paste into an actual Word desktop document, and visually compare against the original answer-key docx pages.

## Out of scope (v1)

- Data/word-list tables, Y-charts, rule-ordering tables (Word's native table tool already handles these reasonably).
- Any integration with or modification of the existing `/phonology/geometry` reference screen.
- Persistence, accounts, multi-user features, mobile layout.
- Native Word-table export for rule notation (revisited and dropped in favor of whole-rule image export — see Tool 2 above).
