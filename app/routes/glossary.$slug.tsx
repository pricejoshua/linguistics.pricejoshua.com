import { Link, useParams } from 'react-router';
import { loadGlossaryEntry, loadGlossaryIndex } from '~/utils/glossary';
import DefinitionZone from '~/components/glossary/DefinitionZone';
import ExampleBlock from '~/components/glossary/ExampleBlock';
import type { Route } from './+types/glossary.$slug';

export function meta({ params }: Route.MetaArgs) {
  return [{ title: `${params.slug ?? 'Entry'} — Linguistics Glossary` }];
}

export default function GlossaryEntry() {
  const { slug } = useParams<{ slug: string }>();
  const entry = slug ? loadGlossaryEntry(slug) : null;
  const indexEntries = loadGlossaryIndex();
  const titleBySlug = Object.fromEntries(indexEntries.map(e => [e.slug, e.title]));

  if (!entry) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-3xl mx-auto">
          <Link to="/glossary" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Glossary</Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-4">Entry not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2">
          <Link to="/glossary" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Glossary</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">{entry.title}</h1>

        <section className="mb-8">
          <DefinitionZone definition={entry.definition} />
        </section>

        {entry.examples.length > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Examples</h2>
            <div className="space-y-4">
              {entry.examples.map(example => (
                <ExampleBlock key={example.id} example={example} />
              ))}
            </div>
          </section>
        )}

        {entry.relatedTerms.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Related terms</h2>
            <div className="flex flex-wrap gap-2">
              {entry.relatedTerms.map(termSlug => (
                <Link
                  key={termSlug}
                  to={`/glossary/${termSlug}`}
                  className="px-3 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  {titleBySlug[termSlug] ?? termSlug.replace(/-/g, ' ')}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
