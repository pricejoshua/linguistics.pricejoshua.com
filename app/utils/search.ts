import Fuse from 'fuse.js';

export interface SearchableEntry {
  slug: string;
  title: string;
  categories: string[];
  definitionText: string;
  definitionPreview: string;
}

export interface SearchResult {
  entry: SearchableEntry;
  score: number;
}

export interface SearchBackend {
  search(query: string, corpus: SearchableEntry[]): SearchResult[];
}

// Fuse.js fuzzy search backend
export const fuseBackend: SearchBackend = {
  search(query, corpus) {
    if (!query.trim()) {
      return corpus.map(entry => ({ entry, score: 1 }));
    }
    const fuse = new Fuse(corpus, {
      keys: [
        { name: 'title', weight: 2 },
        { name: 'definitionText', weight: 1 },
      ],
      includeScore: true,
      threshold: 0.4,
      ignoreLocation: true,
      minMatchCharLength: 2,
    });
    return fuse.search(query).map(r => ({
      entry: r.item,
      score: 1 - (r.score ?? 0),
    }));
  },
};

// Placeholder semantic backend — swap fuseBackend for this once embeddings are available
export const semanticBackend: SearchBackend = {
  search(_query, corpus) {
    // TODO: embed query, cosine-similarity against pre-computed entry vectors
    return corpus.map(entry => ({ entry, score: 1 }));
  },
};

export const activeBackend: SearchBackend = fuseBackend;
