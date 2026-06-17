import { useState } from 'react';
import { Link } from 'react-router';
import { loadGlossaryIndex } from '~/utils/glossary';
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
  tame: 'TAME',
};

export default function GlossaryIndex() {
  const entries = loadGlossaryIndex();
  const [activeCategory, setActiveCategory] = useState('all');

  const sorted = [...entries]
    .filter(e => activeCategory === 'all' || e.categories.includes(activeCategory))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2">
          <Link to="/" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Home</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Linguistics Glossary</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Interactive definitions with annotated sentence examples. Click any word in an example to see its roles.
        </p>
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
          {sorted.map(entry => (
            <Link
              key={entry.slug}
              to={`/glossary/${entry.slug}`}
              className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-colors group"
            >
              <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                {entry.title}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {entry.categories.join(', ')}
              </span>
            </Link>
          ))}
          {sorted.length === 0 && (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No entries in this category yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
