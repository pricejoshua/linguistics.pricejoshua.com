# Predicate Entry Examples Expansion

**Date:** 2026-06-18  
**Status:** Approved

## Overview

Expand all six predicate-of-being glossary entries with cross-linguistic examples covering every strategy shown in the MorphosyntaxII session 3 slides. Add a `title` field to `GlossaryExample` (short strategy label, e.g. `"Copula as invariant particle (Mandarin)"`). The existing `notes` field (already in JSON data but not typed) is also added to the TypeScript interface. Every existing example gets a `title`; new examples get both `title` and `notes`.

---

## Schema Change

**File:** `app/types/glossary.ts`

Add two optional fields to `GlossaryExample`:

```ts
title?: string;   // short strategy label — "Juxtaposition (Russian)"
notes?: string;   // explanation of what the example illustrates
```

`notes` is already present in the JSON data; this just makes it explicit in the type.

---

## Entries

### 1. `equative-predicate.json`

**Titles for existing examples:**
- `eq-ex1` → `"Copula (English)"`
- `eq-ex2` → `"Juxtaposition (Russian)"`

**New examples to add:**

| id | title | Language | Sentence | Translation |
|---|---|---|---|---|
| eq-ex3 | Copula as verb (Estonian) | Estonian | Jan on õpetaja. | John is a/the teacher. |
| eq-ex4 | Copula in non-present tense (Russian) | Russian | Иван был учитель. | John was a teacher. |
| eq-ex5 | Copula as auxiliary (Maasai) | Maasai | é-rá ol-Maasani ninye | He is a Maasai. |
| eq-ex6 | Copula as invariant particle (Mandarin) | Mandarin | 我姐姐是一位教師。| My older sister is a teacher. |
| eq-ex7 | Denominal strategy (Bella Coola) | Bella Coola (Nuxalk) | staltmx-aw wa-ʔimlk | The man is a chief. |

Notes:
- eq-ex3: Estonian `on` is a full copula verb that inflects for tense (past: `oli`).
- eq-ex4: Russian drops the copula in the present tense; the past form `был` is required.
- eq-ex5: `é-rá` fuses person agreement with the 'be' meaning; the copula is optional in 3rd person.
- eq-ex6: `shì` 是 is invariant — no tense, person, or number inflection. Temporal information comes from adverbials.
- eq-ex7: The noun `staltmx` 'chief' takes the intransitive suffix `-aw` directly; no copula is needed.

---

### 2. `classification-predicate.json`

**Titles for existing examples:**
- `cl-ex1` → `"Copula (English)"`
- `cl-ex2` → `"Juxtaposition (Kagayanen)"`
- `cl-ex3` → `"Juxtaposition (Russian)"`
- `cl-ex4` → `"Predicative marking (Hamer)"`

**New examples to add:**

| id | title | Language | Sentence | Translation |
|---|---|---|---|---|
| cl-ex5 | Juxtaposition (Turkish) | Turkish | Kardeşim bir öğretmen. | My brother is a teacher. |
| cl-ex6 | Copula as verb (Estonian) | Estonian | Jan on õpetaja. | John is a teacher. |
| cl-ex7 | Copula as invariant particle (Mandarin) | Mandarin | 我姐姐是一位教師。 | My older sister is a teacher. |
| cl-ex8 | Denominal strategy (Classical Nahuatl) | Classical Nahuatl | ni-ticitl | I am a doctor. |

Notes:
- cl-ex5: Turkish allows zero copula in present tense. Indefinite `bir` marks this as classification (a∈B), not equation.
- cl-ex6: Same construction as equative (Estonian does not distinguish them morphologically); indefinite reading signals classification.
- cl-ex7: Mandarin `shì` 是 is invariant; indefinite classifier phrase `一位教師` signals classification.
- cl-ex8: The noun `ticitl` 'doctor' takes the 1SG subject prefix `ni-` directly, with no copula. Compare the verb `ni-chōca` 'I cry' — same prefix, same template.

---

### 3. `descriptive-predicate.json`

**Titles for existing examples:**
- `desc-ex1` → `"Copula (English)"`
- `desc-ex2` → `"Distinct copula for stative predicates (Spanish)"`
- `desc-ex3` → `"Stative verb as predicate head (Amele)"`
- `desc-ex4` → `"Denominal/deadjectival strategy (Classical Nahuatl)"`
- `desc-ex5` → `"Predicative marking (Hamer)"`

No new examples needed — all major strategies are represented.

---

### 4. `locative-predicate.json`

**Titles for existing examples:**
- `loc-ex1` → `"Copula (English)"`
- `loc-ex2` → `"Copula (Estonian)"`
- `loc-ex3` → `"Locative verb zài (Mandarin)"`
- `loc-ex4` → `"Extended locative: benefactive (Estonian)"`

**New examples to add:**

| id | title | Language | Sentence | Translation |
|---|---|---|---|---|
| loc-ex5 | Stative verb (Amele) | Amele | Uqa jo na bil-i-a. | He is at home. |

Notes:
- loc-ex5: `bil` 'sit/be' functions as the locative predicate head, inflecting for person/tense. The locative role is marked by the postposition `na`.

---

### 5. `existential-predicate.json`

**Titles for existing examples:**
- `exist-ex1` → `"Existential dummy subject (English)"`
- `exist-ex2` → `"Invariant existential particle (Spanish)"`
- `exist-ex3` → `"Copular form (Estonian)"`
- `exist-ex4` → `"Invariant existential particle (Turkish)"`
- `exist-ex5` → `"Special negation (Estonian)"`
- `exist-ex6` → `"Existential verb (Mandarin)"`

**New examples to add:**

| id | title | Language | Sentence | Translation |
|---|---|---|---|---|
| exist-ex7 | Copular form (Korean) | Korean | 책상 위에 책이 있다. | There is a book on the desk. |
| exist-ex8 | Special negation (Turkish) | Turkish | Köşe-de bir kafe yok. | There is no café on the corner. |
| exist-ex9 | Special negation (Russian) | Russian | На столе нет книг. | There is no book on the table. |
| exist-ex10 | Multiple existential particles (Kagayanen) | Kagayanen | May mama di. | There's a man here. |
| exist-ex11 | Impersonal verb (German) | German | Es gibt reichlich Bier. | There's plenty of beer. |

Notes:
- exist-ex7: Korean `있다` (yotta) is the copular form used for both existentials and locatives.
- exist-ex8: Turkish uses `yok` (suppletive negative of `var`) — a dedicated existential negative particle.
- exist-ex9: Russian `нет` is a special negative existential form; the theme appears in the genitive.
- exist-ex10: Kagayanen distinguishes non-identifiable (`may`) vs. identifiable (`anen`) existential particles.
- exist-ex11: German uses the impersonal verb `geben` ('give') with a dummy subject `es` for existentials.

---

### 6. `possessive-predicate.json`

**Titles for existing examples:**
- `poss-ex1` → `"Locative strategy (Estonian)"`
- `poss-ex2` → `"Nominal strategy with genitive possessor (Avar)"`
- `poss-ex3` → `"Existential with oblique possessor (Turkish)"`
- `poss-ex4` → `"Verbal 'have' strategy (English)"`
- `poss-ex5` → `"HAVE drift (Korean)"`

**New examples to add:**

| id | title | Language | Sentence | Translation |
|---|---|---|---|---|
| poss-ex6 | Locative strategy (Russian) | Russian | У меня спичка. | I have a match. |
| poss-ex7 | Comitative strategy (Amele) | Amele | Ija sigin ca. | I have a knife. |
| poss-ex8 | Nominal strategy with genitive possessor (Kagayanen) | Kagayanen | Ame yan na balay. | That house is ours. |
| poss-ex9 | Existential with oblique possessor (Amharic) | Amharic | መፅሓፍ አለኝ። | I have a book. |
| poss-ex10 | HAVE drift (Waray) | Waray | May balay ako. | I have a house. |

Notes:
- poss-ex6: Russian uses the preposition `у` + genitive for the possessor, with the possessed item in nominative. Lit: 'A match is at me.'
- poss-ex7: Amele uses the comitative postposition `ca` 'with' rather than a locative. Lit: 'I am with a knife.'
- poss-ex8: Kagayanen uses the genitive NP `ame` '1EXCL.GEN' as predicate; this is the permanent-possession template.
- poss-ex9: Amharic uses the existential verb `allə` with a 1SG object suffix `-ɲ`. Lit: 'A book exists-me.'
- poss-ex10: The absolutive `ako` (1SG) shows HAVE drift — the possessor has shifted from genitive (`ko`) toward a core argument role.

---

## Out of Scope

- Adding constituent bracket annotations to the new examples (can be done incrementally later)
- Adding a Korean entry for classification (slide 11 — data unclear from extraction)
- Turkish descriptive predicate (no clean gloss data from slides)
