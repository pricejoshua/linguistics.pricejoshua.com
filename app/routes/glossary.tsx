import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { loadGlossarySearchCorpus } from '~/utils/glossary';
import { activeBackend } from '~/utils/search';
import type { Route } from './+types/glossary';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Linguistics Glossary' },
    { name: 'description', content: 'Interactive linguistics glossary with visual sentence examples' },
  ];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All',
  'grammatical-relations': 'Grammatical Relations',
  'semantic-roles': 'Semantic Roles',
  predication: 'Predication',
  'word-classes': 'Word Classes',
  tame: 'TAME',
};

export default function GlossaryIndex() {
  const corpus = useMemo(() => loadGlossarySearchCorpus(), []);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const results = useMemo(() => {
    const searched = activeBackend.search(query, corpus);
    const filtered = activeCategory === 'all'
      ? searched
      : searched.filter(r => r.entry.categories.includes(activeCategory));
    if (!query.trim()) {
      return filtered.sort((a, b) => a.entry.title.localeCompare(b.entry.title));
    }
    return filtered;
  }, [query, activeCategory, corpus]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2">
          <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Home</Link>
        </div>
        <div className="flex items-baseline justify-between mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Linguistics Glossary</h1>
          <Link to="/glossary/abbreviations" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Leipzig abbreviations →
          </Link>
        </div>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Interactive definitions with annotated sentence examples. Click any word in an example to see its roles.
        </p>

        <div className="relative mb-4">
          <input
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search terms and definitions…"
            className="w-full px-4 py-2.5 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          {results.map(({ entry }) => (
            <Link
              key={entry.slug}
              to={`/glossary/${entry.slug}`}
              className="flex flex-col px-4 py-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors group"
            >
              <div className="flex items-baseline justify-between">
                <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  {entry.title}
                </span>
                <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 ml-3">
                  {entry.categories.join(', ')}
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                {entry.definitionPreview}
              </p>
            </Link>
          ))}
          {results.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {query ? `No results for "${query}".` : 'No entries in this category yet.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
