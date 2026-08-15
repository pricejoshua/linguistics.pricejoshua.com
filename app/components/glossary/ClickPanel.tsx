import { useEffect } from 'react';
import { Link } from 'react-router';
import { X } from 'lucide-react';
import type { GlossaryMorpheme } from '~/types/glossary';
import { lookupGloss } from '~/data/leipzig-glossing';
import TermLink from './TermLink';

interface ClickPanelProps {
  morpheme: GlossaryMorpheme | null;
  onClose: () => void;
}

function GlossTag({ gloss }: { gloss: string }) {
  // Render a gloss string like COP.PRS.3SG with each sub-token expanded
  const tokens = gloss.split('.');
  return (
    <span className="font-mono">
      {tokens.map((token, i) => {
        const match = lookupGloss(token);
        return (
          <span key={i}>
            {i > 0 && <span className="text-gray-400">.</span>}
            {match ? (
              <Link
                to={`/glossary/abbreviations#${match.abbreviation}`}
                title={match.description}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                {token}
              </Link>
            ) : (
              <span>{token}</span>
            )}
          </span>
        );
      })}
    </span>
  );
}

function PanelContent({
  morpheme,
  onClose,
}: {
  morpheme: GlossaryMorpheme;
  onClose: () => void;
}) {
  const roleEntries = Object.entries(morpheme.roles).filter(([, v]) => v.length > 0);

  return (
    <>
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          "{morpheme.surface}"
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          aria-label="Close panel"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      <hr className="border-gray-200 dark:border-gray-700 mb-4" />
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
            Morpheme breakdown
          </p>
          <div className="space-y-2">
            {morpheme.segments.map((seg, i) => (
              <div key={i} className="flex items-baseline gap-2 text-sm">
                <span className="text-gray-800 dark:text-gray-200 font-medium min-w-[4rem]">{seg.form}</span>
                <span className="text-gray-400">→</span>
                <GlossTag gloss={seg.gloss} />
                {lookupGloss(seg.gloss.split('.')[0]) && (
                  <span className="text-gray-400 text-xs italic">
                    {seg.gloss.split('.').map(t => lookupGloss(t)?.label).filter(Boolean).join(' · ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
        {roleEntries.map(([category, values]) => (
          <div key={category}>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
              {category}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 flex flex-wrap gap-x-1.5">
              {values.map((role, i) => (
                <span key={role}>
                  <TermLink slug={role} label={role} />
                  {i < values.length - 1 && <span className="text-gray-400"> ·</span>}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function ClickPanel({ morpheme, onClose }: ClickPanelProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!morpheme) return null;

  return (
    <>
      {/* Mobile bottom sheet */}
      <div className="fixed inset-x-0 bottom-0 z-40 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 rounded-t-2xl shadow-xl p-5 max-h-[60vh] overflow-y-auto">
        <PanelContent morpheme={morpheme} onClose={onClose} />
      </div>
      {/* Desktop side panel */}
      <div className="hidden md:flex fixed right-0 top-0 h-full w-80 z-40 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex-col p-6 overflow-y-auto">
        <PanelContent morpheme={morpheme} onClose={onClose} />
      </div>
      {/* Mobile backdrop */}
      <div className="fixed inset-0 z-30 bg-black/20 md:hidden" onClick={onClose} />
    </>
  );
}
