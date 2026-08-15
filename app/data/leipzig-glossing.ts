export interface LeipzigAbbreviation {
  abbreviation: string;
  label: string;
  description: string;
}

// Standard Leipzig Glossing Rules abbreviations (https://www.eva.mpg.de/lingua/pdf/Glossing-Rules.pdf)
// Plus common extensions used in typological work.
export const LEIPZIG_ABBREVIATIONS: LeipzigAbbreviation[] = [
  // Grammatical person
  { abbreviation: '1', label: 'First person', description: 'First person (speaker)' },
  { abbreviation: '2', label: 'Second person', description: 'Second person (addressee)' },
  { abbreviation: '3', label: 'Third person', description: 'Third person (other)' },
  { abbreviation: '1SG', label: 'First person singular', description: 'First person singular' },
  { abbreviation: '2SG', label: 'Second person singular', description: 'Second person singular' },
  { abbreviation: '3SG', label: 'Third person singular', description: 'Third person singular' },
  { abbreviation: '1PL', label: 'First person plural', description: 'First person plural' },
  { abbreviation: '2PL', label: 'Second person plural', description: 'Second person plural' },
  { abbreviation: '3PL', label: 'Third person plural', description: 'Third person plural' },
  { abbreviation: '1SG.NOM', label: 'First person singular nominative', description: 'First person singular, nominative case' },
  { abbreviation: '3SG.M', label: 'Third person singular masculine', description: 'Third person singular masculine' },
  { abbreviation: '3SG.F', label: 'Third person singular feminine', description: 'Third person singular feminine' },
  { abbreviation: '3SG.M.NOM', label: 'Third person singular masculine nominative', description: 'Third person singular masculine, nominative case' },
  { abbreviation: '3SG.F.NOM', label: 'Third person singular feminine nominative', description: 'Third person singular feminine, nominative case' },
  // Number
  { abbreviation: 'SG', label: 'Singular', description: 'Singular number' },
  { abbreviation: 'PL', label: 'Plural', description: 'Plural number' },
  { abbreviation: 'DU', label: 'Dual', description: 'Dual number' },
  // Gender / noun class
  { abbreviation: 'M', label: 'Masculine', description: 'Masculine gender' },
  { abbreviation: 'F', label: 'Feminine', description: 'Feminine gender' },
  { abbreviation: 'N', label: 'Neuter', description: 'Neuter gender' },
  { abbreviation: 'CL', label: 'Noun class', description: 'Noun class marker (numbered in context, e.g. CL3)' },
  // Case
  { abbreviation: 'NOM', label: 'Nominative', description: 'Nominative case — typically marks the subject in accusative languages' },
  { abbreviation: 'ACC', label: 'Accusative', description: 'Accusative case — typically marks the direct object' },
  { abbreviation: 'GEN', label: 'Genitive', description: 'Genitive case — marks possession or source' },
  { abbreviation: 'DAT', label: 'Dative', description: 'Dative case — marks indirect object or recipient' },
  { abbreviation: 'LOC', label: 'Locative', description: 'Locative case — marks location' },
  { abbreviation: 'ALL', label: 'Allative', description: 'Allative case — marks direction toward' },
  { abbreviation: 'ABL', label: 'Ablative', description: 'Ablative case — marks direction away from' },
  { abbreviation: 'INS', label: 'Instrumental', description: 'Instrumental case — marks means or instrument' },
  { abbreviation: 'VOC', label: 'Vocative', description: 'Vocative case — marks direct address' },
  { abbreviation: 'ERG', label: 'Ergative', description: 'Ergative case — marks the agent of a transitive verb in ergative languages' },
  { abbreviation: 'ABS', label: 'Absolutive', description: 'Absolutive case — marks S and O in ergative languages' },
  { abbreviation: 'BEN', label: 'Benefactive', description: 'Benefactive case/role — marks the beneficiary of an action' },
  { abbreviation: 'OBL', label: 'Oblique', description: 'Oblique case — a non-core grammatical case' },
  // Tense
  { abbreviation: 'PRS', label: 'Present', description: 'Present tense' },
  { abbreviation: 'PST', label: 'Past', description: 'Past tense' },
  { abbreviation: 'FUT', label: 'Future', description: 'Future tense' },
  { abbreviation: 'IPFV', label: 'Imperfective', description: 'Imperfective aspect — ongoing or repeated action' },
  { abbreviation: 'PFV', label: 'Perfective', description: 'Perfective aspect — completed action viewed as a whole' },
  // Mood
  { abbreviation: 'IND', label: 'Indicative', description: 'Indicative mood — declarative statements' },
  { abbreviation: 'SBJV', label: 'Subjunctive', description: 'Subjunctive mood — hypothetical or subordinate clauses' },
  { abbreviation: 'IMP', label: 'Imperative', description: 'Imperative mood — commands' },
  { abbreviation: 'COND', label: 'Conditional', description: 'Conditional mood' },
  // Copula / existential
  { abbreviation: 'COP', label: 'Copula', description: 'Copula — links subject to a non-verbal predicate' },
  { abbreviation: 'EXIST', label: 'Existential', description: 'Existential verb or particle — asserts existence' },
  { abbreviation: 'EXPL', label: 'Expletive', description: 'Expletive — a dummy element filling a required syntactic position (e.g. English there, it)' },
  // Determiner / deixis
  { abbreviation: 'DEF', label: 'Definite', description: 'Definite article or marker' },
  { abbreviation: 'INDEF', label: 'Indefinite', description: 'Indefinite article or marker' },
  { abbreviation: 'PROX', label: 'Proximal', description: 'Proximal demonstrative — near speaker' },
  { abbreviation: 'DIST', label: 'Distal', description: 'Distal demonstrative — far from speaker' },
  { abbreviation: 'ART', label: 'Article', description: 'Article (definite or indefinite)' },
  // Predication markers
  { abbreviation: 'PRED', label: 'Predicative', description: 'Predicative marker — marks a word as functioning as a predicate' },
  { abbreviation: 'INVAR', label: 'Invariant', description: 'Invariant form — does not inflect for agreement, tense, etc.' },
  // Voice / valency
  { abbreviation: 'PASS', label: 'Passive', description: 'Passive voice' },
  { abbreviation: 'CAUS', label: 'Causative', description: 'Causative — encodes that the subject causes another to perform an action' },
  { abbreviation: 'INTR', label: 'Intransitive', description: 'Intransitive verb or suffix' },
  { abbreviation: 'TR', label: 'Transitive', description: 'Transitive verb or suffix' },
  { abbreviation: 'REFL', label: 'Reflexive', description: 'Reflexive — subject and object are the same' },
  { abbreviation: 'RECIP', label: 'Reciprocal', description: 'Reciprocal — participants act on each other' },
  // Negation
  { abbreviation: 'NEG', label: 'Negation', description: 'Negation marker' },
  // Agreement
  { abbreviation: 'AGR', label: 'Agreement', description: 'Agreement marker' },
  // Possession
  { abbreviation: 'POSS', label: 'Possessive', description: 'Possessive marker' },
  // Derivational morphology
  { abbreviation: 'NMLZ', label: 'Nominalizer', description: 'Nominalizing suffix or prefix — derives a noun from a verb or other root' },
  { abbreviation: 'INSTR', label: 'Instrumental nominalizer', description: 'Nominalizer that derives an instrument noun from a verb root' },
  { abbreviation: 'AGENT', label: 'Agent nominalizer', description: 'Nominalizer that derives an agentive noun (one who performs the action)' },
  { abbreviation: 'VERB', label: 'Verb (derived)', description: 'Marks a word as a derived verb (used in zero-derivation annotation)' },
  { abbreviation: 'SUFF', label: 'Suffix', description: 'Generic suffix label used in morphological breakdowns' },
  { abbreviation: 'STEM', label: 'Stem', description: 'Marks the stem of a derived word before a derivational suffix' },
  // Topic / focus / information structure
  { abbreviation: 'TOP', label: 'Topic', description: 'Topic marker — marks the sentence topic' },
  { abbreviation: 'FOC', label: 'Focus', description: 'Focus marker — marks the focused or new-information element' },
  { abbreviation: 'EMPH', label: 'Emphatic', description: 'Emphatic marker' },
  // Particles & other
  { abbreviation: 'CRS', label: 'Currently relevant state', description: 'Currently relevant state particle (e.g. Mandarin le)' },
  { abbreviation: 'CL', label: 'Classifier', description: 'Classifier — a morpheme that categorizes a noun (numeral classifier, measure word, etc.)' },
  { abbreviation: 'OBJ', label: 'Object', description: 'Object marker' },
  { abbreviation: 'SUBJ', label: 'Subject', description: 'Subject marker' },
  { abbreviation: 'REL', label: 'Relativizer', description: 'Relativizer — marks a relative clause' },
  { abbreviation: 'COMP', label: 'Complementizer', description: 'Complementizer — introduces a complement clause' },
  { abbreviation: 'QUOT', label: 'Quotative', description: 'Quotative marker — introduces a quoted or reported utterance' },
  { abbreviation: 'INCL', label: 'Inclusive', description: 'Inclusive "we" — includes the addressee' },
  { abbreviation: 'EXCL', label: 'Exclusive', description: 'Exclusive "we" — excludes the addressee' },
];

export const LEIPZIG_BY_ABBREVIATION: Record<string, LeipzigAbbreviation> = Object.fromEntries(
  LEIPZIG_ABBREVIATIONS.map(a => [a.abbreviation, a])
);

export function lookupGloss(gloss: string): LeipzigAbbreviation | null {
  // Try exact match first
  if (LEIPZIG_BY_ABBREVIATION[gloss]) return LEIPZIG_BY_ABBREVIATION[gloss];
  // Try uppercase
  const upper = gloss.toUpperCase();
  if (LEIPZIG_BY_ABBREVIATION[upper]) return LEIPZIG_BY_ABBREVIATION[upper];
  return null;
}
