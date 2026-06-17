import type { GlossaryExample } from '~/types/glossary';
import MorphemeToken from './MorphemeToken';

interface InterlinearViewProps {
  example: GlossaryExample;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function InterlinearView({ example, selectedId, onSelect }: InterlinearViewProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
        {example.sourceLanguage}
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-2 items-end">
        {example.morphemes.map(m => (
          <MorphemeToken
            key={m.id}
            morpheme={m}
            selected={selectedId === m.id}
            onClick={() => onSelect(selectedId === m.id ? null : m.id)}
          />
        ))}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
        '{example.translation}'
      </p>
    </div>
  );
}
