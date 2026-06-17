# Glossary Section — Design Spec
Date: 2026-06-17

## Overview

Add a `/glossary` section to linguistics.pricejoshua.com. The value-add over existing references (e.g. SIL glossary) is interactive visual sentence examples with simultaneous multi-layer role annotation, and inline cross-linking between terms via tooltips. Initial focus: predication (especially verbless clauses) and semantic roles. Designed to grow to cover TAME categories and more.

---

## Data Model

### File Layout

```
app/data/glossary/
  index.json           ← list of all entries (slug, title, categories)
  entries/
    predicate.json
    subject.json
    verbless-clause.json
    semantic-role.json
    ... (one file per entry)
```

### index.json

```json
[
  {
    "slug": "predicate",
    "title": "Predicate",
    "categories": ["grammatical-relations"]
  },
  ...
]
```

Categories (initial set): `grammatical-relations`, `semantic-roles`, `predication`, `tame`

### Entry JSON Shape

```json
{
  "slug": "predicate",
  "title": "Predicate",
  "definition": "The part of a clause that makes an assertion about the [term:subject]. In verbless clauses, the predicate may be a noun phrase, adjective, or prepositional phrase with no [term:copula].",
  "relatedTerms": ["subject", "verbless-clause", "copula"],
  "examples": [
    {
      "id": "ex1",
      "sourceLanguage": "English",
      "translation": "The man is tall.",
      "morphemes": [
        {
          "id": "m1",
          "surface": "The",
          "segments": [
            { "form": "the", "gloss": "DEF" }
          ],
          "roles": {
            "Grammatical": ["determiner"]
          }
        },
        {
          "id": "m2",
          "surface": "man",
          "segments": [
            { "form": "man", "gloss": "man" }
          ],
          "roles": {
            "Grammatical": ["subject", "NP-head"],
            "Semantic": ["theme"],
            "Predication": ["subject-of-predication"]
          }
        },
        {
          "id": "m3",
          "surface": "is",
          "segments": [
            { "form": "is", "gloss": "COP.PRS.3SG" }
          ],
          "roles": {
            "Grammatical": ["copula"],
            "Predication": ["copula"]
          }
        },
        {
          "id": "m4",
          "surface": "tall",
          "segments": [
            { "form": "tall", "gloss": "tall" }
          ],
          "roles": {
            "Grammatical": ["predicate", "adjective"],
            "Semantic": ["property"],
            "Predication": ["predicate"]
          }
        }
      ]
    }
  ]
}
```

#### Key Data Decisions

- **`definition`** uses `[term:slug]` syntax for inline cross-references, parsed at render time into interactive tooltip spans.
- **`segments`** is the morpheme array. A single uninflected word has one segment; an inflected form like "walked" has `[{form:"walk",gloss:"walk"},{form:"ed",gloss:"PST"}]`. Glosses use Leipzig Glossing Rules abbreviations (capitalized for grammatical categories, lowercase for lexical content).
- **`roles`** is a free-form object mapping category name → string array. The panel renders whatever keys are present, skipping empty arrays. Adding a new category (e.g. `"Information Structure"`) requires no component changes — just add the key to the JSON. Categories with no values for a given morpheme are simply omitted.
- **`relatedTerms`** are slugs; used to resolve tooltips and "related entries" links.

---

## Routes

| Path | Component | Purpose |
|---|---|---|
| `/glossary` | `routes/glossary.tsx` | Index: alphabetical list + category filter |
| `/glossary/:slug` | `routes/glossary.$slug.tsx` | Individual entry page |

The landing page (`app/pages/landing.tsx`) gets a "Glossary" entry added to its `pages` array.

---

## UI Components

### Glossary Index (`/glossary`)

- Alphabetical list of all entries
- Category filter tabs: All / Grammatical Relations / Semantic Roles / Predication / TAME
- Each entry is a link to `/glossary/:slug`

### Entry Page (`/glossary/:slug`)

Three vertical zones:

#### 1. Definition Zone

Prose definition rendered from the `definition` string. `[term:slug]` references are parsed into `<TermLink>` components. 

`<TermLink>` behavior:
- Hover: tooltip appears with the referenced entry's title + first sentence of its definition
- Tooltip has a "→ view full entry" link navigating to `/glossary/:slug`
- Tooltip stays open if user moves mouse into it (so they can click the link)

#### 2. Examples Zone

Each example renders in **interlinear view** by default:

```
Line 1 (surface):   The      man      is           tall
Line 2 (gloss):     DEF      man      COP.PRS.3SG  tall
Line 3 (free):      "The man is tall."
```

- Words/morphemes on line 1 are clickable
- A **"Bracket view"** toggle above the example switches to color-coded constituency bracketing
- In bracket view, brackets are colored by grammatical role category; hovering a bracket shows a label

#### 3. Click Panel

Clicking any word/morpheme on line 1 of the interlinear opens a panel showing all annotations simultaneously:

**Desktop:** side panel sliding in from the right  
**Mobile:** bottom sheet

Panel content:
```
"man"  (surface form)
─────────────────────────────
Morpheme breakdown:  man [man]

Grammatical:         subject · NP-head
Semantic:            theme
Predication:         subject-of-predication
```

The panel iterates the `roles` object keys in order and renders each as a labeled section — no hardcoded category names. Categories absent from the morpheme's `roles` object are not shown. Each role label is itself a `<TermLink>` — hovering shows a tooltip for that role's glossary entry if one exists.

Clicking a different word updates the panel in place. Clicking the same word again (or pressing Escape) closes the panel.

---

## Component Tree

```
routes/glossary.$slug.tsx
  └── EntryPage
        ├── DefinitionZone
        │     └── TermLink (× many, tooltip-enabled)
        ├── ExamplesZone
        │     └── ExampleBlock (× per example)
        │           ├── InterlinearView (default)
        │           │     └── MorphemeToken (× per morpheme, clickable)
        │           └── BracketView (toggled)
        └── ClickPanel (side panel / bottom sheet)
              └── TermLink (× per role label)
```

---

## TypeScript Types

Defined in `app/types/glossary.ts`:

```ts
interface GlossarySegment {
  form: string;
  gloss: string;
}

interface GlossaryMorpheme {
  id: string;
  surface: string;
  segments: GlossarySegment[];
  roles: Record<string, string[]>;
}

interface GlossaryExample {
  id: string;
  sourceLanguage: string;
  translation: string;
  morphemes: GlossaryMorpheme[];
}

interface GlossaryEntry {
  slug: string;
  title: string;
  definition: string;
  relatedTerms: string[];
  examples: GlossaryExample[];
}

interface GlossaryIndexEntry {
  slug: string;
  title: string;
  categories: string[];
}
```

---

## Initial Seed Entries

To launch with enough content to validate the UI, the following entries will be authored:

1. **predicate** — with a verbless clause example and a verbal clause example
2. **subject** — cross-links to predicate
3. **verbless-clause** — cross-links to predicate, copula
4. **copula** — cross-links to verbless-clause, predicate
5. **semantic-role** — overview entry, cross-links to agent, patient, theme
6. **agent** — with transitive verb example
7. **patient** — cross-links to agent
8. **theme** — cross-links to patient, semantic-role

---

## Out of Scope (for now)

- TAME category entries (data model supports them via categories; entries not yet authored)
- Audio playback for examples
- User-contributed entries
- Search/full-text filtering (index page uses category tabs only for now)
- Morpheme-level bracket view (bracket view operates at word level initially)
