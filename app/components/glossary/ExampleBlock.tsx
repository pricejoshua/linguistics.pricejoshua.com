import { useState } from 'react';
import type { GlossaryExample, GlossaryMorpheme } from '~/types/glossary';
import InterlinearView from './InterlinearView';
import BracketView from './BracketView';
import ClickPanel from './ClickPanel';

interface ExampleBlockProps {
  example: GlossaryExample;
}

export default function ExampleBlock({ example }: ExampleBlockProps) {
  const [view, setView] = useState<'interlinear' | 'bracket'>('interlinear');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedMorpheme: GlossaryMorpheme | null =
    selectedId ? (example.morphemes.find(m => m.id === selectedId) ?? null) : null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center gap-2 mb-4">
        {(['interlinear', 'bracket'] as const).map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
              view === v
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {v === 'interlinear' ? 'Interlinear' : 'Bracket view'}
          </button>
        ))}
      </div>
      {view === 'interlinear' ? (
        <InterlinearView example={example} selectedId={selectedId} onSelect={setSelectedId} />
      ) : (
        <BracketView example={example} />
      )}
      <ClickPanel morpheme={selectedMorpheme} onClose={() => setSelectedId(null)} />
    </div>
  );
}
