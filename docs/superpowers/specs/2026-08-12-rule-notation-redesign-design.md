# Rule Notation Builder Redesign — Design

**Date:** 2026-08-12
**Scope:** `app/utils/hw-tools/ruleLayout.ts`, `app/components/hw-tools/RuleDiagram.tsx`, `app/components/hw-tools/RuleBuilder.tsx`, `app/routes/hw-tools.rule-notation.tsx`
**Source material:** `references/ruleex_1.png`, `references/ruleex_2.png`, `references/09-FormalDevices-SIL.pdf` ("Classical Formal Devices," Sackett/SIL)

## Goal

The current Rule Notation Builder is a single flat list of slots the student assembles by hand, including the `→`, `/`, and `_` separators themselves. Two gaps, both visible in the reference examples:

1. A feature matrix currently only renders as a standalone bracket (`[α Place]`). Both examples also show a **category symbol with a matrix stacked underneath it as one unit** — `V` over `[+high]`, `C` over `[α Place]` — which the current model has no way to express.
2. Every real rule in the source material follows the same fixed skeleton: `target → change / left __ right`. Building that skeleton by hand (inserting the arrow, slash, and blank yourself, in the right places, every time) is repetitive and error-prone compared to filling in a template that already has the skeleton in place.

This redesign addresses both. A third, smaller gap — no convenient way to type Greek-letter variables (`α`, `β`...) used for cross-referencing feature values between target and environment — is folded in as a shared "Special Characters" picker.

**Explicitly out of scope** (per discussion): subscript/superscript occurrence counts (`C₀`, `C₁³`), curly-brace either-or alternatives, boundary symbols beyond the existing `#`, and transformational/indexed rules (metathesis, coalescence) — the last of these is a genuinely different rule shape, not an extension of this one, and would be its own project if ever needed.

## Data model

```ts
interface RuleSlotText {
  kind: 'text';
  value: string;
  optional?: boolean;
}

interface RuleSlotMatrix {
  kind: 'matrix';
  /** When set, rendered as its own line above the bracketed stack — e.g. "V" over "[+high]". Blank (or absent) renders exactly as today: a standalone bracket, e.g. "[α Place]" alone. */
  symbol?: string;
  values: string[];
  optional?: boolean;
}

type RuleSlot = RuleSlotText | RuleSlotMatrix;

interface Rule {
  target: RuleSlot[];
  change: RuleSlot[];
  environmentLeft: RuleSlot[];
  environmentRight: RuleSlot[];
}
```

`→`, `/`, and the environment blank are no longer slots — they're fixed template furniture, always rendered between/around the four zones. `Rule` changes from a flat `RuleSlot[]` to this four-zone shape; there is no migration path for in-progress rules since nothing here persists across a page load (existing "nothing is saved" behavior).

`optional` (either slot kind) renders literal `(` `)` around that slot's content, sized to its height — for parenthesized/optional elements like `(C)` in `___ (C) V`.

## Rendering

`layoutRule`/`RuleDiagram` keep working on a flat slot sequence — a new `assembleRule(rule: Rule): RuleSlot[]` concatenates `target, [→], change, [/], environmentLeft, [blank], environmentRight` (the three separators as fixed `RuleSlotText` values) before handing the result to the existing layout function. The route calls `assembleRule` once and passes the result to `RuleDiagram`, so the layout/positioning math is unchanged from what's already built and tested.

New rendering, both in `RuleDiagram`'s per-slot drawing and reflected in `layoutRule`'s per-slot width/height accounting:
- **`symbol` on a matrix slot:** an extra text line above the bracket pair, same font/weight as a plain text slot. The slot's total height and the bracket's vertical extent are unaffected — the symbol sits above the bracket, not inside it.
- **`optional`:** two more paths per slot (reusing the same drawn-bracket technique already used for matrix brackets, not a font-rendered `(`/`)`, so it scales cleanly to any slot height), positioned just outside the slot's own left/right edges.

## Builder UI

**`SlotZoneEditor`** — the existing per-slot list-editing logic (add text/matrix slot, edit matrix lines, move, remove) extracted from today's single-list `RuleBuilder` into a reusable component bound to one `RuleSlot[]` array and its setter. Four instances render in the route: Target, Change, Environment (before the blank), Environment (after the blank) — visually separated, with the fixed `→`/`/`/blank labeled between them so the whole-rule structure is legible while editing, not just in the final diagram.

Per zone:
- Quick-insert buttons: `C`, `V`, `X`, `Ø`, `#` (no `→`/`/`/blank — automatic now).
- "+ Feature matrix" — standalone bare matrix, no symbol (today's existing behavior, unchanged).
- Per-slot "+ matrix" button on a bare text slot — converts it in place to a matrix slot with `symbol` set to that slot's text and one empty value line, implementing "choose C/V/X, then add a matrix under it."
- Per-slot `( )` toggle for `optional`.
- Move-left/right/remove, scoped to that zone's own array (reordering across zones isn't meaningful — each zone is a fixed structural position).

**`SpecialCharacterPicker`** — one reusable button-with-popover component (character set: `α β γ δ ε Ø`) taking an `onInsert(char: string)` callback, so the caller decides what "insert" means:
- Rendered in each zone's toolbar: inserts a new bare text slot (same mechanism as clicking `C`/`V`/`X`/`Ø` directly).
- Rendered next to each matrix value line: inserts the character into that line's current text (prepended, matching the "variable first" convention — `α voice`, not `voice α`).

`Ø` stays as its own dedicated per-zone quick-insert button too (common enough to deserve one click) in addition to living in the picker, which is the one place the character set itself is maintained.

## Testing

Same acceptance approach as the rest of hw-tools: no test framework, verify via `npm run typecheck`, `npm run build`, and targeted `vite-node` execution of the pure layout/assembly functions (`assembleRule`, `layoutRule` with `symbol`/`optional` slots) against the two reference examples — reconstruct `ruleex_1.png` and `ruleex_2.png` in the running tool and visually compare the exported image against them.

## Out of scope (restated)

- Subscript/superscript occurrence counts.
- Curly-brace either-or alternatives.
- Boundary symbols beyond `#` (`+`, `##`, `‖`, morpheme brackets, syllable/rhyme structure references).
- Transformational/indexed rules (metathesis, coalescence).
