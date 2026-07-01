# Transitivity Glossary Entry

**Date:** 2026-07-01
**Status:** Approved

## Overview

Add a new glossary entry, `transitivity`, covering both the traditional
grammatical view (transitive vs. intransitive clauses, A/S/O) and Hopper &
Thompson's (1980) reframing of transitivity as a scalar property built from
ten co-varying parameters. This is a single comprehensive entry (matching how
`word-class.json` handles Dixon's five schemes in one entry), with room to
add sub-entries later (e.g. `individuation`, `affectedness`) that this entry
can link to via `[term:...]` markup even before those files exist.

## Source

Hopper, Paul J. & Sandra A. Thompson. 1980. "Transitivity in Grammar and
Discourse." *Language* 56(2): 251–299. (PDF supplied by user.)

## Entry: `transitivity.json`

**slug:** `transitivity`
**title:** `Transitivity`
**categories:** `["grammatical-relations", "semantic-roles"]`

### Definition content

1. **Traditional view** — transitivity as a categorical property of a clause:
   a verb either takes an object (transitive: A and O arguments) or doesn't
   (intransitive: S argument only), following the A/S/O labels already used
   in `app/data/glossary/constituents.ts`. Frame it as "carrying-over" or
   "transferring" an action from an agent to a patient — the traditional
   intuition Hopper & Thompson start from before critiquing its
   binary-verb-classification assumption.

2. **Hopper & Thompson's reframing** — transitivity is not binary but
   *scalar*: a cluster of ten co-varying parameters, each with a high and low
   value:

   | Parameter | High | Low |
   |---|---|---|
   | A. Participants | 2+ (A and O) | 1 |
   | B. Kinesis | action | non-action |
   | C. Aspect | telic | atelic |
   | D. Punctuality | punctual | non-punctual |
   | E. Volitionality | volitional | non-volitional |
   | F. Affirmation | affirmative | negative |
   | G. Mode | realis | irrealis |
   | H. Agency | A high in potency | A low in potency |
   | I. Affectedness of O | O totally affected | O not affected |
   | J. Individuation of O | O highly individuated | O non-individuated |

   Clauses aren't simply transitive/intransitive but more-or-less transitive
   depending on how many "high" values they carry — this is **cardinal
   transitivity** when all features are high. Briefly note individuation
   itself decomposes into proper/common, human-animate/inanimate,
   concrete/abstract, singular/plural, count/mass, referential-definite/non-
   referential (Table 2 in the paper) — mention in prose, not a second table,
   to keep the entry from ballooning.

   Note the discourse correlate as a closing point (the paper's other main
   claim): high transitivity correlates with foregrounded, high-turning-point
   clauses in discourse; low transitivity with backgrounded material. One
   sentence — this entry is about the grammatical parameter, not the
   discourse theory, so don't expand further.

### relatedTerms

`["agent", "patient", "semantic-role", "subject"]` — plus forward references
inside the definition body via `[term:individuation]` and
`[term:affectedness]` even though those entry files don't exist yet
(consistent with existing forward-reference patterns elsewhere in the
glossary). Do not add these two slugs to `relatedTerms` or `index.json` since
they're not real entries yet — only reference them inline in the definition
text where TermLink will render them as a link that 404s gracefully or is
simply styled as a term without a working link (matches existing site
behavior for unresolved slugs — verify this doesn't crash the route before
finalizing).

### Examples (4, morpheme-glossed)

All examples add a `"Transitivity"` key to each verb/object morpheme's
`roles` map, listing which H&T parameters are at play (e.g.
`["telic", "punctual", "O-totally-affected"]`), alongside existing
`Grammatical` / `Semantic` / `Predication` role categories other entries
already use. This is a new but additive role category — no schema change
needed since `roles` is already `Record<string, string[]>`.

1. **`tr-ex1`** — *Jerry likes beer.* (Hopper & Thompson's ex. 3a)
   Low transitivity: state (non-action), non-punctual, non-volitional, O
   (`beer`) non-individuated (mass, non-referential).

2. **`tr-ex2`** — *Jerry knocked Sam down.* (ex. 3b)
   High transitivity: action, telic, punctual, volitional, O (`Sam`) totally
   affected, highly individuated (referential, animate, proper).

3. **`tr-ex3`** — *There were no stars in the sky.* (ex. 5)
   Near-zero transitivity: one participant, negative, non-referential O
   (`stars`) — only "realis" stays in the high column.

4. **`tr-ex4`** — Spanish differential object marking pair:
   *Vi a Juan.* ("I saw Juan") vs. *Vi la mesa.* ("I saw the table")
   Demonstrates individuation (animacy/specificity of O) driving real
   morphology — the accusative marker `a` appears only before the
   animate/specific object, illustrating parameter J concretely rather than
   just through English semantics. Gloss `a` as `DOM` (differential object
   marker).

### Schema/type changes

None required. `GlossaryExample`, `GlossaryMorpheme`, and the `roles: Record<string, string[]>` shape already support an arbitrary new role category.

### index.json

Add one entry:
```json
{ "slug": "transitivity", "title": "Transitivity", "categories": ["grammatical-relations", "semantic-roles"] }
```

### Cross-links from existing entries (optional, low-risk)

Consider adding `"transitivity"` to `relatedTerms` in `agent.json` and
`patient.json` since both already discuss the agent/patient relationship
that transitivity formalizes. Not required for this spec to be complete —
do only if it doesn't require touching example content.

## Out of scope

- Discourse-function theory (§3 of the paper — foregrounding/backgrounding
  as a full topic) — only a one-sentence mention.
- Separate `individuation` / `affectedness` sub-entries — referenced but not
  created in this pass.
- Any UI/component changes — existing `ClickPanel`, `MorphemeToken`,
  `BracketView` components already render arbitrary role categories.
