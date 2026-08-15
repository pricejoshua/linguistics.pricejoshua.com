import { Link } from 'react-router';
import { lookupGloss } from '~/data/leipzig-glossing';
import type { GlossaryMorpheme } from '~/types/glossary';

interface MorphemeTokenProps {
  morpheme: GlossaryMorpheme;
  selected: boolean;
  onClick: () => void;
}

function GlossToken({ token }: { token: string }) {
  const match = lookupGloss(token);
  if (match) {
    return (
      <Link
        to={`/glossary/abbreviations#${match.abbreviation}`}
        onClick={e => e.stopPropagation()}
        title={match.label}
        className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
      >
        {token}
      </Link>
    );
  }
  return <span>{token}</span>;
}

function GlossSegment({ segment }: { segment: string }) {
  // Split dot-separated sub-tokens (e.g. COP.PRS.3SG) and link each individually
  const parts = segment.split('.');
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && '.'}
          <GlossToken token={part} />
        </span>
      ))}
    </>
  );
}

function GlossLine({ gloss }: { gloss: string }) {
  // Split on - (morpheme boundary) first, then handle . within each segment
  const parts = gloss.split('-');
  return (
    <>
      {parts.map((part, i) => (
        <span key={i}>
          {i > 0 && '-'}
          <GlossSegment segment={part} />
        </span>
      ))}
    </>
  );
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
        <GlossLine gloss={glossLine} />
      </span>
    </div>
  );
}
