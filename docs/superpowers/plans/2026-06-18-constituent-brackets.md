# Constituent Bracket Annotations — Implementation Plan

Spec: `docs/superpowers/specs/2026-06-18-constituent-brackets-design.md`

## Global Constraints

- TypeScript throughout; no `any`; no `@ts-ignore`
- No new npm dependencies
- Existing examples without `constituents` render **unchanged**
- Adjacent morphemes sharing a constituent render as one spanning bracket
- Non-adjacent morphemes sharing a constituent render as separate brackets, same label repeated
- Constituent label tooltips use custom hover divs (not browser `title` attribute)
- Use inline `style` for dynamic border/text colors — do NOT generate dynamic Tailwind class names (purge risk)
- JSON must be valid after data edits; TypeScript must compile (`npx tsc --noEmit`) after each task
- Commit each task separately with a descriptive message

---

## Task 1 — Types + Constituent Definitions Data File

**Files:**
- `app/types/glossary.ts`
- `app/data/glossary/constituents.ts` (new)

### `app/types/glossary.ts`

Add this interface **before** `GlossaryExample`:

```ts
export interface GlossaryConstituent {
  label: string;
  morphemeIds: string[];
}
```

Add this optional field to `GlossaryExample`:

```ts
constituents?: GlossaryConstituent[];
```

### `app/data/glossary/constituents.ts` (new file)

```ts
export const CONSTITUENT_DEFS: Record<string, string> = {
  A:   'Transitive subject',
  O:   'Transitive object',
  S:   'Intransitive subject',
  CS:  'Copula subject',
  CC:  'Copula complement',
  VCS: 'Verbless clause subject',
  VCC: 'Verbless clause complement',
  COP: 'Copula verb',
};
```

**Verification:** `npx tsc --noEmit` passes with no errors.

---

## Task 2 — BracketView Component

**File:** `app/components/glossary/BracketView.tsx`

Replace the entire component. Behavior when `example.constituents` is absent or empty must be **identical** to the current implementation — do not change the existing color tokens, legend, or layout.

### Color map (use inline `style`, not Tailwind dynamic classes)

```ts
const CONSTITUENT_COLORS: Record<string, string> = {
  A:   '#0ea5e9', // sky-500
  O:   '#f59e0b', // amber-500
  S:   '#8b5cf6', // violet-500
  CS:  '#14b8a6', // teal-500
  CC:  '#f43f5e', // rose-500
  VCS: '#2dd4bf', // teal-400
  VCC: '#fb7185', // rose-400
  COP: '#a855f7', // purple-500
};
```

### Algorithm when `constituents` is present

1. Build a `Map<string, GlossaryConstituent>` from morphemeId → its constituent.
2. Walk `example.morphemes` in order. Form **runs**: a run is a maximal sequence of consecutive morphemes that all map to the same constituent object. Morphemes not in any constituent form singleton unlabeled runs.
3. Render labeled runs as bracket boxes; unlabeled runs render existing token(s) without a bracket.

### ConstituentLabel sub-component

```tsx
function ConstituentLabel({ label, def, color }: { label: string; def?: string; color: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                 text-xs font-mono font-semibold cursor-default select-none mt-0.5"
      style={{ color }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {label}
      {show && def && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10
                         bg-gray-900 text-gray-100 text-xs px-2 py-1 rounded
                         whitespace-nowrap pointer-events-none">
          {label} — {def}
        </span>
      )}
    </span>
  );
}
```

### Bracket box (per labeled run)

```tsx
<div
  key={runKey}
  className="relative flex items-end gap-2 pb-5 border-b-2 border-l-2 border-r-2 px-2 pt-1"
  style={{ borderColor: CONSTITUENT_COLORS[label] ?? '#94a3b8' }}
>
  {/* existing colored morpheme token pills, unchanged */}
  <ConstituentLabel label={label} def={CONSTITUENT_DEFS[label]} color={CONSTITUENT_COLORS[label] ?? '#94a3b8'} />
</div>
```

Import `CONSTITUENT_DEFS` from `~/data/glossary/constituents`.
Import `useState` from React for the tooltip.

**Verification:** `npx tsc --noEmit` passes. Visual check: switch to bracket view on a copula example — constituent brackets render with colored border boxes and hoverable labels. Switch to an entry with no `constituents` — renders identically to before.

---

## Task 3 — JSON Data Updates

**Files:**
- `app/data/glossary/entries/copula.json`
- `app/data/glossary/entries/verbless-clause.json`
- `app/data/glossary/entries/predicate.json`

Add a `"constituents"` array to each example object (at the same level as `"id"`, `"sourceLanguage"`, `"morphemes"`).

### copula.json

**cop-ex1** ("She is a teacher."):
```json
"constituents": [
  { "label": "CS",  "morphemeIds": ["m1"] },
  { "label": "COP", "morphemeIds": ["m2"] },
  { "label": "CC",  "morphemeIds": ["m3", "m4"] }
]
```

**cop-ex2** ("Jan on õpetaja."):
```json
"constituents": [
  { "label": "CS",  "morphemeIds": ["m5"] },
  { "label": "COP", "morphemeIds": ["m6"] },
  { "label": "CC",  "morphemeIds": ["m7"] }
]
```

**cop-ex3** ("Иван был учитель."):
```json
"constituents": [
  { "label": "CS",  "morphemeIds": ["m8"] },
  { "label": "COP", "morphemeIds": ["m9"] },
  { "label": "CC",  "morphemeIds": ["m10"] }
]
```

**cop-ex4** ("나의 누나는 선생 였다。"):
m11=나의 (GEN modifier, part of CS NP), m12=누나는 (CS head), m13=선생 (CC), m14=였다 (COP)
```json
"constituents": [
  { "label": "CS",  "morphemeIds": ["m11", "m12"] },
  { "label": "CC",  "morphemeIds": ["m13"] },
  { "label": "COP", "morphemeIds": ["m14"] }
]
```

**cop-ex5** ("我姐姐是一位教師。"):
m15=我姐姐 (CS), m16=是 (COP), m17=一位 (classifier, part of CC NP), m18=教師 (CC head)
```json
"constituents": [
  { "label": "CS",  "morphemeIds": ["m15"] },
  { "label": "COP", "morphemeIds": ["m16"] },
  { "label": "CC",  "morphemeIds": ["m17", "m18"] }
]
```

### verbless-clause.json

**vl-ex1** ("She a teacher."):
m1=She (VCS), m2=a (determiner within VCC NP), m3=teacher (VCC head)
```json
"constituents": [
  { "label": "VCS", "morphemeIds": ["m1"] },
  { "label": "VCC", "morphemeIds": ["m2", "m3"] }
]
```

**vl-ex2** ("Иван учитель."):
```json
"constituents": [
  { "label": "VCS", "morphemeIds": ["m4"] },
  { "label": "VCC", "morphemeIds": ["m5"] }
]
```

**vl-ex3** ("inta dibi-ne"):
```json
"constituents": [
  { "label": "VCS", "morphemeIds": ["m6"] },
  { "label": "VCC", "morphemeIds": ["m7"] }
]
```

**vl-ex4** ("Maistro Atong ya."):
m8=Maistro (VCC — predicate NP precedes subject), m9=Atong (VCS head), m10=ya (DEF marker on VCS NP)
```json
"constituents": [
  { "label": "VCC", "morphemeIds": ["m8"] },
  { "label": "VCS", "morphemeIds": ["m9", "m10"] }
]
```

### predicate.json

**pred-ex1** ("The man is tall."):
m1=The (determiner, part of CS NP), m2=man (CS head), m3=is (COP), m4=tall (CC — key point of this entry)
```json
"constituents": [
  { "label": "CS",  "morphemeIds": ["m1", "m2"] },
  { "label": "COP", "morphemeIds": ["m3"] },
  { "label": "CC",  "morphemeIds": ["m4"] }
]
```

**pred-ex2** ("He sick."):
```json
"constituents": [
  { "label": "VCS", "morphemeIds": ["m5"] },
  { "label": "VCC", "morphemeIds": ["m6"] }
]
```

**pred-ex3** ("ʔi:h-ma: qo:ʔas-ʔi:"):
Intransitive clause. Label only the S argument (m8). Predicate m7 has no Dixon argument label.
```json
"constituents": [
  { "label": "S", "morphemeIds": ["m8"] }
]
```

**Verification:** All JSON is valid. `npx tsc --noEmit` passes. Bracket view for copula, verbless-clause, and predicate entries all render constituent brackets correctly.
