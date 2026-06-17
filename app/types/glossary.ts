export interface GlossarySegment {
  form: string;
  gloss: string;
}

export interface GlossaryMorpheme {
  id: string;
  surface: string;
  segments: GlossarySegment[];
  roles: Record<string, string[]>;
}

export interface GlossaryExample {
  id: string;
  sourceLanguage: string;
  translation: string;
  morphemes: GlossaryMorpheme[];
}

export interface GlossaryEntry {
  slug: string;
  title: string;
  definition: string;
  relatedTerms: string[];
  examples: GlossaryExample[];
}

export interface GlossaryIndexEntry {
  slug: string;
  title: string;
  categories: string[];
}
