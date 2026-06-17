import type { GlossaryMorpheme } from '~/types/glossary';

interface MorphemeTokenProps {
  morpheme: GlossaryMorpheme;
  selected: boolean;
  onClick: () => void;
}

export default function MorphemeToken({ morpheme, selected, onClick }: MorphemeTokenProps) {
  const glossLine = morpheme.segments.map(s => s.gloss).join('-');
  return (
    <div className="flex flex-col items-center gap-0.5 min-w-[2.5rem]">
      <button
        onClick={onClick}
        className={`px-2 py-1 rounded text-base font-medium transition-colors ${
          selected
            ? 'bg-blue-600 text-white'
            : 'hover:bg-blue-100 dark:hover:bg-blue-900 text-gray-900 dark:text-gray-100'
        }`}
      >
        {morpheme.surface}
      </button>
      <span className="text-xs font-mono text-gray-500 dark:text-gray-400 px-1">
        {glossLine}
      </span>
    </div>
  );
}
