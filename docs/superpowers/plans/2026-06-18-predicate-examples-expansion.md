# Predicate Examples Expansion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add cross-linguistic strategy examples to all six predicate-of-being glossary entries, and add `title`/`notes` fields to the `GlossaryExample` TypeScript type.

**Architecture:** Schema change first (TypeScript type), then JSON data edits entry by entry. Each entry gets `title` added to existing examples and new examples covering strategies from the MorphosyntaxII session 3 slides.

**Tech Stack:** TypeScript, JSON data files, Remix

## Global Constraints

- TypeScript must compile (`npx tsc --noEmit`) with no errors after Task 1
- All JSON must be valid after each task (`python3 -m json.tool <file> > /dev/null`)
- Morpheme IDs must be unique within each file; continue from the last used ID (tracked per task below)
- No new npm dependencies
- No constituent bracket annotations on new examples (out of scope)
- Commit each task separately

---

### Task 1: Schema — Add `title` and `notes` to `GlossaryExample`

**Files:**
- Modify: `app/types/glossary.ts`

**Interfaces:**
- Produces: `GlossaryExample.title?: string` and `GlossaryExample.notes?: string` — used by all subsequent tasks

- [ ] **Step 1: Add the two optional fields**

Open `app/types/glossary.ts`. The current `GlossaryExample` interface is:

```ts
export interface GlossaryExample {
  id: string;
  sourceLanguage: string;
  translation: string;
  morphemes: GlossaryMorpheme[];
  constituents?: GlossaryConstituent[];
}
```

Replace it with:

```ts
export interface GlossaryExample {
  id: string;
  title?: string;
  sourceLanguage: string;
  translation: string;
  notes?: string;
  morphemes: GlossaryMorpheme[];
  constituents?: GlossaryConstituent[];
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/types/glossary.ts
git commit -m "feat: add title and notes optional fields to GlossaryExample type"
```

---

### Task 2: `equative-predicate.json` — titles + 5 new examples

**Files:**
- Modify: `app/data/glossary/entries/equative-predicate.json`

**Starting morpheme ID:** m6 (last used: m5)

- [ ] **Step 1: Add `title` to the two existing examples**

In `eq-ex1`, add `"title": "Copula (English)"` after `"id": "eq-ex1"`.  
In `eq-ex2`, add `"title": "Juxtaposition (Russian)"` after `"id": "eq-ex2"`.

Both examples already have `"notes"` fields — leave them unchanged.

- [ ] **Step 2: Append 5 new examples to the `examples` array**

Add the following after the closing `}` of `eq-ex2`, inside the `examples` array:

```json
    {
      "id": "eq-ex3",
      "title": "Copula as verb (Estonian)",
      "sourceLanguage": "Estonian",
      "translation": "Jan on õpetaja. ('John is a/the teacher.')",
      "notes": "Estonian on is a full copula verb that inflects for tense. Compare past: Jan oli õpetaja 'John was a teacher.'",
      "morphemes": [
        {
          "id": "m6", "surface": "Jan",
          "segments": [{ "form": "Jan", "gloss": "John.NOM" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m7", "surface": "on",
          "segments": [{ "form": "on", "gloss": "COP.PRS.3SG" }],
          "roles": { "Grammatical": ["copula"], "Predication": ["copula"] }
        },
        {
          "id": "m8", "surface": "õpetaja",
          "segments": [{ "form": "õpetaja", "gloss": "teacher.NOM" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "eq-ex4",
      "title": "Copula in non-present tense (Russian)",
      "sourceLanguage": "Russian",
      "translation": "Иван был учитель. ('John was a teacher.')",
      "notes": "Russian drops the copula быть in the present tense (equative by juxtaposition), but requires the past form был in past tense.",
      "morphemes": [
        {
          "id": "m9", "surface": "Иван",
          "segments": [{ "form": "Иван", "gloss": "Ivan.NOM.M" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m10", "surface": "был",
          "segments": [{ "form": "быть", "gloss": "be.PST.M" }],
          "roles": { "Grammatical": ["copula"], "Predication": ["copula"] }
        },
        {
          "id": "m11", "surface": "учитель",
          "segments": [{ "form": "учитель", "gloss": "teacher.NOM.M" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "eq-ex5",
      "title": "Copula as auxiliary (Maasai)",
      "sourceLanguage": "Maasai",
      "translation": "é-rá ol-Maasani ninye ('He is a Maasai.')",
      "notes": "é-rá fuses person agreement (3rd) with the 'be' meaning. In 3rd person the copula is optional; in 1st and 2nd person it is obligatory.",
      "morphemes": [
        {
          "id": "m12", "surface": "é-rá",
          "segments": [{ "form": "é", "gloss": "3" }, { "form": "rá", "gloss": "be.MASC" }],
          "roles": { "Grammatical": ["copula"], "Predication": ["copula"] }
        },
        {
          "id": "m13", "surface": "ol-Maasani",
          "segments": [{ "form": "ol", "gloss": "MASC.SG" }, { "form": "Maasani", "gloss": "Maasai" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        },
        {
          "id": "m14", "surface": "ninye",
          "segments": [{ "form": "ninye", "gloss": "3SG" }],
          "roles": { "Grammatical": ["subject"], "Predication": ["subject-of-predication"] }
        }
      ]
    },
    {
      "id": "eq-ex6",
      "title": "Copula as invariant particle (Mandarin)",
      "sourceLanguage": "Mandarin",
      "translation": "我姐姐是一位教師。(Wŏ jiĕjiĕ shì yī-wèi jiàoshī) ('My older sister is a teacher.')",
      "notes": "shì 是 does not inflect for tense, person, or number. Temporal information comes from adverbials (e.g., 之前 'before' for past).",
      "morphemes": [
        {
          "id": "m15", "surface": "我姐姐",
          "segments": [{ "form": "wŏ", "gloss": "1SG" }, { "form": "jiĕjiĕ", "gloss": "older.sister" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m16", "surface": "是",
          "segments": [{ "form": "shì", "gloss": "be" }],
          "roles": { "Grammatical": ["copula"], "Predication": ["copula"] }
        },
        {
          "id": "m17", "surface": "一位教師",
          "segments": [{ "form": "yī", "gloss": "one" }, { "form": "wèi", "gloss": "CL" }, { "form": "jiàoshī", "gloss": "teacher" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "eq-ex7",
      "title": "Denominal strategy (Bella Coola)",
      "sourceLanguage": "Bella Coola (Nuxalk)",
      "translation": "staltmx-aw wa-ʔimlk ('The man is a chief.')",
      "notes": "The noun staltmx 'chief' takes the intransitive suffix -aw directly, functioning as a verbal predicate with no copula. The subject follows as a proximate NP.",
      "morphemes": [
        {
          "id": "m18", "surface": "staltmx-aw",
          "segments": [{ "form": "staltmx", "gloss": "chief" }, { "form": "aw", "gloss": "INTR" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        },
        {
          "id": "m19", "surface": "wa-ʔimlk",
          "segments": [{ "form": "wa", "gloss": "PROX" }, { "form": "ʔimlk", "gloss": "man" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        }
      ]
    }
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool app/data/glossary/entries/equative-predicate.json > /dev/null
```

Expected: no output (valid JSON).

- [ ] **Step 4: Commit**

```bash
git add app/data/glossary/entries/equative-predicate.json
git commit -m "feat: add titles and cross-linguistic strategy examples to equative-predicate"
```

---

### Task 3: `classification-predicate.json` — titles + 4 new examples

**Files:**
- Modify: `app/data/glossary/entries/classification-predicate.json`

**Starting morpheme ID:** m12 (last used: m11)

- [ ] **Step 1: Add `title` to the four existing examples**

- `cl-ex1`: add `"title": "Copula (English)"`
- `cl-ex2`: add `"title": "Juxtaposition (Kagayanen)"`
- `cl-ex3`: add `"title": "Juxtaposition (Russian)"`
- `cl-ex4`: add `"title": "Predicative marking (Hamer)"`

All four already have `"notes"` fields — leave them unchanged.

- [ ] **Step 2: Append 4 new examples to the `examples` array**

```json
    {
      "id": "cl-ex5",
      "title": "Juxtaposition (Turkish)",
      "sourceLanguage": "Turkish",
      "translation": "Kardeşim bir öğretmen. ('My brother is a teacher.')",
      "notes": "Turkish allows zero copula in present tense for classification. The indefinite bir marks this as classification (a∈B), not equation. A copula suffix -(y)Im appears in past and non-indicative contexts.",
      "morphemes": [
        {
          "id": "m12", "surface": "Kardeşim",
          "segments": [{ "form": "Kardeş", "gloss": "brother" }, { "form": "im", "gloss": "1SG.POSS" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m13", "surface": "bir",
          "segments": [{ "form": "bir", "gloss": "INDEF" }],
          "roles": { "Grammatical": ["determiner"] }
        },
        {
          "id": "m14", "surface": "öğretmen",
          "segments": [{ "form": "öğretmen", "gloss": "teacher" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "cl-ex6",
      "title": "Copula as verb (Estonian)",
      "sourceLanguage": "Estonian",
      "translation": "Jan on õpetaja. ('John is a teacher.')",
      "notes": "Estonian does not morphologically distinguish equative from classification predicates; context (definiteness of the predicate NP) determines the reading. The indefinite reading gives classification.",
      "morphemes": [
        {
          "id": "m15", "surface": "Jan",
          "segments": [{ "form": "Jan", "gloss": "John.NOM" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m16", "surface": "on",
          "segments": [{ "form": "on", "gloss": "COP.PRS.3SG" }],
          "roles": { "Grammatical": ["copula"], "Predication": ["copula"] }
        },
        {
          "id": "m17", "surface": "õpetaja",
          "segments": [{ "form": "õpetaja", "gloss": "teacher.NOM" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "cl-ex7",
      "title": "Copula as invariant particle (Mandarin)",
      "sourceLanguage": "Mandarin",
      "translation": "我姐姐是一位教師。(Wŏ jiĕjiĕ shì yī-wèi jiàoshī) ('My older sister is a teacher.')",
      "notes": "The invariant copula shì 是 is used for both classification and equation; the indefinite classifier phrase 一位教師 signals classification (a∈B).",
      "morphemes": [
        {
          "id": "m18", "surface": "我姐姐",
          "segments": [{ "form": "wŏ", "gloss": "1SG" }, { "form": "jiĕjiĕ", "gloss": "older.sister" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m19", "surface": "是",
          "segments": [{ "form": "shì", "gloss": "be" }],
          "roles": { "Grammatical": ["copula"], "Predication": ["copula"] }
        },
        {
          "id": "m20", "surface": "一位教師",
          "segments": [{ "form": "yī", "gloss": "one" }, { "form": "wèi", "gloss": "CL" }, { "form": "jiàoshī", "gloss": "teacher" }],
          "roles": { "Grammatical": ["predicate", "NP-head"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "cl-ex8",
      "title": "Denominal strategy (Classical Nahuatl)",
      "sourceLanguage": "Classical Nahuatl",
      "translation": "ni-ticitl ('I am a doctor.')",
      "notes": "The noun ticitl 'doctor' takes the 1SG subject prefix ni- directly, with no copula. Compare the verb ni-chōca 'I cry' — same prefix, same verbal template, treating the noun as a predicate head.",
      "morphemes": [
        {
          "id": "m21", "surface": "ni-ticitl",
          "segments": [{ "form": "ni", "gloss": "1SG" }, { "form": "ticitl", "gloss": "doctor" }],
          "roles": { "Grammatical": ["predicate"], "Predication": ["predicate"] }
        }
      ]
    }
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool app/data/glossary/entries/classification-predicate.json > /dev/null
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/data/glossary/entries/classification-predicate.json
git commit -m "feat: add titles and cross-linguistic strategy examples to classification-predicate"
```

---

### Task 4: `descriptive-predicate.json` — titles only

**Files:**
- Modify: `app/data/glossary/entries/descriptive-predicate.json`

No new examples needed — all major strategies are already represented.

- [ ] **Step 1: Add `title` to the five existing examples**

- `desc-ex1`: add `"title": "Copula (English)"`
- `desc-ex2`: add `"title": "Distinct copula for stative predicates (Spanish)"`
- `desc-ex3`: add `"title": "Stative verb as predicate head (Amele)"`
- `desc-ex4`: add `"title": "Denominal/deadjectival strategy (Classical Nahuatl)"`
- `desc-ex5`: add `"title": "Predicative marking (Hamer)"`

All five already have `"notes"` fields — leave them unchanged.

- [ ] **Step 2: Validate JSON**

```bash
python3 -m json.tool app/data/glossary/entries/descriptive-predicate.json > /dev/null
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add app/data/glossary/entries/descriptive-predicate.json
git commit -m "feat: add titles to descriptive-predicate examples"
```

---

### Task 5: `locative-predicate.json` — titles + 1 new example

**Files:**
- Modify: `app/data/glossary/entries/locative-predicate.json`

**Starting morpheme ID:** m14 (last used: m13)

- [ ] **Step 1: Add `title` to the four existing examples**

- `loc-ex1`: add `"title": "Copula (English)"`
- `loc-ex2`: add `"title": "Copula (Estonian)"`
- `loc-ex3`: add `"title": "Locative verb zài (Mandarin)"`
- `loc-ex4`: add `"title": "Extended locative: benefactive (Estonian)"`

- [ ] **Step 2: Append 1 new example to the `examples` array**

```json
    {
      "id": "loc-ex5",
      "title": "Stative verb (Amele)",
      "sourceLanguage": "Amele",
      "translation": "Uqa jo na bil-i-a. ('He is at home.')",
      "notes": "The verb bil 'sit/be' is the locative predicate head, inflecting for person (i = 3SG) and tense (a = PRS). The locative role is marked by the postposition na 'at'.",
      "morphemes": [
        {
          "id": "m14", "surface": "Uqa",
          "segments": [{ "form": "uqa", "gloss": "3SG.M" }],
          "roles": { "Grammatical": ["subject"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m15", "surface": "jo",
          "segments": [{ "form": "jo", "gloss": "house" }],
          "roles": { "Grammatical": ["NP-head"], "Semantic": ["location"] }
        },
        {
          "id": "m16", "surface": "na",
          "segments": [{ "form": "na", "gloss": "at" }],
          "roles": { "Grammatical": ["postposition"] }
        },
        {
          "id": "m17", "surface": "bil-i-a",
          "segments": [
            { "form": "bil", "gloss": "sit/be" },
            { "form": "i", "gloss": "3SG" },
            { "form": "a", "gloss": "PRS" }
          ],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        }
      ]
    }
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool app/data/glossary/entries/locative-predicate.json > /dev/null
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/data/glossary/entries/locative-predicate.json
git commit -m "feat: add titles and Amele stative verb example to locative-predicate"
```

---

### Task 6: `existential-predicate.json` — titles + 5 new examples

**Files:**
- Modify: `app/data/glossary/entries/existential-predicate.json`

**Starting morpheme ID:** m24 (last used: m23)

- [ ] **Step 1: Add `title` to the six existing examples**

- `exist-ex1`: add `"title": "Existential dummy subject (English)"`
- `exist-ex2`: add `"title": "Invariant existential particle (Spanish)"`
- `exist-ex3`: add `"title": "Copular form (Estonian)"`
- `exist-ex4`: add `"title": "Invariant existential particle (Turkish)"`
- `exist-ex5`: add `"title": "Special negation (Estonian)"`
- `exist-ex6`: add `"title": "Existential verb (Mandarin)"`

- [ ] **Step 2: Append 5 new examples to the `examples` array**

```json
    {
      "id": "exist-ex7",
      "title": "Copular form (Korean)",
      "sourceLanguage": "Korean",
      "translation": "책상 위에 책이 있다. (chæk.sang wiɛ chæk.i iss-ta) ('There is a book on the desk.')",
      "notes": "Korean iss 있 is the copular form used for both existential and locative predicates, as well as possession (나는 책이 있다 'I have a book').",
      "morphemes": [
        {
          "id": "m24", "surface": "책상 위에",
          "segments": [{ "form": "chæk.sang", "gloss": "desk" }, { "form": "wiɛ", "gloss": "on" }],
          "roles": { "Grammatical": ["adverbial"], "Semantic": ["location"] }
        },
        {
          "id": "m25", "surface": "책이",
          "segments": [{ "form": "chæk", "gloss": "book" }, { "form": "i", "gloss": "NOM" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m26", "surface": "있다",
          "segments": [{ "form": "iss", "gloss": "be" }, { "form": "ta", "gloss": "IND" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "exist-ex8",
      "title": "Special negation (Turkish)",
      "sourceLanguage": "Turkish",
      "translation": "Köşe-de bir kafe yok. ('There is no café on the corner.')",
      "notes": "Turkish yok is the suppletive negative of var — morphologically unrelated, not a regular negation of the positive form. Compare: var 'exists' — yok 'does not exist'.",
      "morphemes": [
        {
          "id": "m27", "surface": "Köşe-de",
          "segments": [{ "form": "Köşe", "gloss": "corner" }, { "form": "de", "gloss": "LOC" }],
          "roles": { "Grammatical": ["adverbial"], "Semantic": ["location"] }
        },
        {
          "id": "m28", "surface": "bir",
          "segments": [{ "form": "bir", "gloss": "INDEF" }],
          "roles": { "Grammatical": ["determiner"] }
        },
        {
          "id": "m29", "surface": "kafe",
          "segments": [{ "form": "kafe", "gloss": "café" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m30", "surface": "yok",
          "segments": [{ "form": "yok", "gloss": "exist.NEG" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "exist-ex9",
      "title": "Special negation (Russian)",
      "sourceLanguage": "Russian",
      "translation": "На столе нет книг. ('There are no books on the table.')",
      "notes": "Russian нет is a special negative existential form. Under negation, the theme shifts to genitive plural (книг from книга). Compare affirmative: На столе книга 'There is a book on the table' (nominative, no copula).",
      "morphemes": [
        {
          "id": "m31", "surface": "На столе",
          "segments": [{ "form": "на", "gloss": "LOC" }, { "form": "столе", "gloss": "table.LOC" }],
          "roles": { "Grammatical": ["adverbial"], "Semantic": ["location"] }
        },
        {
          "id": "m32", "surface": "нет",
          "segments": [{ "form": "нет", "gloss": "exist.NEG" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        },
        {
          "id": "m33", "surface": "книг",
          "segments": [{ "form": "книга", "gloss": "book.GEN.PL" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        }
      ]
    },
    {
      "id": "exist-ex10",
      "title": "Multiple existential particles (Kagayanen)",
      "sourceLanguage": "Kagayanen",
      "translation": "May mama di. ('There's a man here.')",
      "notes": "Kagayanen has two affirmative existential particles: may (non-identifiable — referent not yet identified) vs. anen (identifiable — referent presupposed). A negative ula completes the paradigm.",
      "morphemes": [
        {
          "id": "m34", "surface": "May",
          "segments": [{ "form": "may", "gloss": "exist.N" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        },
        {
          "id": "m35", "surface": "mama",
          "segments": [{ "form": "mama", "gloss": "man" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m36", "surface": "di",
          "segments": [{ "form": "di", "gloss": "here" }],
          "roles": { "Grammatical": ["adverbial"], "Semantic": ["location"] }
        }
      ]
    },
    {
      "id": "exist-ex11",
      "title": "Impersonal verb (German)",
      "sourceLanguage": "German",
      "translation": "Es gibt reichlich Bier. ('There's plenty of beer.')",
      "notes": "German uses the impersonal verb geben 'give' with a dummy subject es 'it'. The theme NP appears in the accusative. This is a non-copular verbal strategy — distinct from the copula-based existentials in most other languages.",
      "morphemes": [
        {
          "id": "m37", "surface": "Es",
          "segments": [{ "form": "es", "gloss": "it.NOM" }],
          "roles": { "Grammatical": ["expletive-subject"] }
        },
        {
          "id": "m38", "surface": "gibt",
          "segments": [{ "form": "geben", "gloss": "give.PRS.3SG" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        },
        {
          "id": "m39", "surface": "reichlich",
          "segments": [{ "form": "reichlich", "gloss": "plenty" }],
          "roles": { "Grammatical": ["adverb"] }
        },
        {
          "id": "m40", "surface": "Bier",
          "segments": [{ "form": "Bier", "gloss": "beer.ACC" }],
          "roles": { "Grammatical": ["object", "NP-head"], "Predication": ["subject-of-predication"] }
        }
      ]
    }
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool app/data/glossary/entries/existential-predicate.json > /dev/null
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/data/glossary/entries/existential-predicate.json
git commit -m "feat: add titles and cross-linguistic strategy examples to existential-predicate"
```

---

### Task 7: `possessive-predicate.json` — titles + 5 new examples

**Files:**
- Modify: `app/data/glossary/entries/possessive-predicate.json`

**Starting morpheme ID:** m16 (last used: m15)

- [ ] **Step 1: Add `title` to the five existing examples**

- `poss-ex1`: add `"title": "Locative strategy (Estonian)"`
- `poss-ex2`: add `"title": "Nominal strategy with genitive possessor (Avar)"`
- `poss-ex3`: add `"title": "Existential with oblique possessor (Turkish)"`
- `poss-ex4`: add `"title": "Verbal 'have' strategy (English)"`
- `poss-ex5`: add `"title": "HAVE drift (Korean)"`

- [ ] **Step 2: Append 5 new examples to the `examples` array**

```json
    {
      "id": "poss-ex6",
      "title": "Locative strategy (Russian)",
      "sourceLanguage": "Russian",
      "translation": "У меня спичка. ('I have a match.' Lit: 'A match is at me.')",
      "notes": "Russian encodes possession as location: the possessor follows preposition у 'at' in the genitive; the possessed item is in the nominative. No copula appears in the present tense.",
      "morphemes": [
        {
          "id": "m16", "surface": "У меня",
          "segments": [{ "form": "у", "gloss": "at" }, { "form": "меня", "gloss": "1SG.GEN" }],
          "roles": { "Grammatical": ["adverbial"], "Semantic": ["possessor"] }
        },
        {
          "id": "m17", "surface": "спичка",
          "segments": [{ "form": "спичка", "gloss": "match.NOM.F" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        }
      ]
    },
    {
      "id": "poss-ex7",
      "title": "Comitative strategy (Amele)",
      "sourceLanguage": "Amele",
      "translation": "Ija sigin ca. ('I have a knife.' Lit: 'I am with a knife.')",
      "notes": "Amele uses the comitative postposition ca 'with' rather than a locative. The possessor is the grammatical subject. Compare the locative possessive in Estonian.",
      "morphemes": [
        {
          "id": "m18", "surface": "Ija",
          "segments": [{ "form": "ija", "gloss": "1SG" }],
          "roles": { "Grammatical": ["subject"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m19", "surface": "sigin",
          "segments": [{ "form": "sigin", "gloss": "knife" }],
          "roles": { "Grammatical": ["NP-head"], "Semantic": ["possessed"] }
        },
        {
          "id": "m20", "surface": "ca",
          "segments": [{ "form": "ca", "gloss": "with" }],
          "roles": { "Grammatical": ["postposition"] }
        }
      ]
    },
    {
      "id": "poss-ex8",
      "title": "Nominal strategy with genitive possessor (Kagayanen)",
      "sourceLanguage": "Kagayanen",
      "translation": "Ame yan na balay. ('That house is ours.')",
      "notes": "Kagayanen uses the predicate nominal template for permanent possession: genitive NP ame '1EXCL.GEN' functions as the predicate. This contrasts with the identifiable existential template used for temporary possession.",
      "morphemes": [
        {
          "id": "m21", "surface": "Ame",
          "segments": [{ "form": "ame", "gloss": "1EXCL.GEN" }],
          "roles": { "Grammatical": ["predicate"], "Predication": ["predicate"] }
        },
        {
          "id": "m22", "surface": "yan",
          "segments": [{ "form": "yan", "gloss": "that" }],
          "roles": { "Grammatical": ["determiner"] }
        },
        {
          "id": "m23", "surface": "na",
          "segments": [{ "form": "na", "gloss": "LK" }],
          "roles": { "Grammatical": ["linker"] }
        },
        {
          "id": "m24", "surface": "balay",
          "segments": [{ "form": "balay", "gloss": "house" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        }
      ]
    },
    {
      "id": "poss-ex9",
      "title": "Existential with oblique possessor (Amharic)",
      "sourceLanguage": "Amharic",
      "translation": "መፅሓፍ አለኝ። (mət͡s'haf alːə-ɲ) ('I have a book.' Lit: 'A book exists-me.')",
      "notes": "Amharic uses the existential verb allə with an object suffix encoding the possessor (-ɲ = 1SG.OBJ). The possessed item is in the nominative. The possessor is cross-referenced on the verb rather than appearing as a separate NP.",
      "morphemes": [
        {
          "id": "m25", "surface": "መፅሓፍ",
          "segments": [{ "form": "mət͡s'haf", "gloss": "book.NOM" }],
          "roles": { "Grammatical": ["subject", "NP-head"], "Predication": ["subject-of-predication"] }
        },
        {
          "id": "m26", "surface": "አለኝ",
          "segments": [{ "form": "alːə", "gloss": "exist" }, { "form": "ɲ", "gloss": "1SG.OBJ" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        }
      ]
    },
    {
      "id": "poss-ex10",
      "title": "HAVE drift (Waray)",
      "sourceLanguage": "Waray",
      "translation": "May balay ako. ('I have a house.')",
      "notes": "Waray shows HAVE drift: the possessor has shifted from genitive ko (May balay ko — 'My house exists') to absolutive ako, treating the possessor as a more core argument. This illustrates a grammaticalization pathway from existential toward a 'have' verb.",
      "morphemes": [
        {
          "id": "m27", "surface": "May",
          "segments": [{ "form": "may", "gloss": "exist" }],
          "roles": { "Grammatical": ["verb"], "Predication": ["predicate"] }
        },
        {
          "id": "m28", "surface": "balay",
          "segments": [{ "form": "balay", "gloss": "house" }],
          "roles": { "Grammatical": ["NP-head"], "Semantic": ["possessed"] }
        },
        {
          "id": "m29", "surface": "ako",
          "segments": [{ "form": "ako", "gloss": "1SG.ABS" }],
          "roles": { "Grammatical": ["subject"], "Semantic": ["possessor"] }
        }
      ]
    }
```

- [ ] **Step 3: Validate JSON**

```bash
python3 -m json.tool app/data/glossary/entries/possessive-predicate.json > /dev/null
```

Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add app/data/glossary/entries/possessive-predicate.json
git commit -m "feat: add titles and cross-linguistic strategy examples to possessive-predicate"
```
