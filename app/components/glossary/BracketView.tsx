import { useState } from 'react';
import type { GlossaryExample, GlossaryMorpheme, GlossaryConstituent } from '~/types/glossary';
import { CONSTITUENT_DEFS } from '~/data/glossary/constituents';

interface BracketViewProps {
  example: GlossaryExample;
}

const CONSTITUENT_COLORS: Record<string, string> = {
  A:   '#0ea5e9', // sky-500
  O:   '#f59e0b', // amber-500
  S:   '#8b5cf6', // violet-500
  CS:  '#14b8a6', // teal-500
  CC:  '#f43f5e', // rose-500
  VCS: '#2dd4bf', // teal-400
  VCC: '#fb7185', // rose-400
  COP: '#a855f7', // purple-500
};

// ── legacy helpers (used only when constituents are absent) ──────────────────

function getRoleColor(roles: Record<string, string[]>): string {
  const g = roles['Grammatical'] ?? [];
  if (g.includes('subject')) return 'border-blue-500 bg-blue-50 dark:bg-blue-950';
  if (g.includes('predicate') || g.includes('verb')) return 'border-green-500 bg-green-50 dark:bg-green-950';
  if (g.includes('object') || g.includes('object-of-preposition')) return 'border-orange-500 bg-orange-50 dark:bg-orange-950';
  if (g.includes('copula')) return 'border-purple-500 bg-purple-50 dark:bg-purple-950';
  if (g.includes('determiner')) return 'border-gray-400 bg-gray-50 dark:bg-gray-900';
  return 'border-slate-400 bg-slate-50 dark:bg-slate-900';
}

function getPrimaryRole(roles: Record<string, string[]>): string {
  return (roles['Grammatical'] ?? [])[0] ?? '';
}

// ── ConstituentLabel sub-component ───────────────────────────────────────────

function ConstituentLabel({ label, def, color }: { label: string; def?: string; color: string }) {
  const [show, setShow] = useState(false);
  return (
    <span
      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full
                 text-xs font-mono font-semibold cursor-default select-none mt-0.5"
      style={{ color }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {label}
      {show && def && (
        <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 z-10
                         bg-gray-900 text-gray-100 text-xs px-2 py-1 rounded
                         whitespace-nowrap pointer-events-none">
          {label} — {def}
        </span>
      )}
    </span>
  );
}

// ── Token pill (plain, for use inside bracket boxes) ─────────────────────────

function TokenPill({ morpheme }: { morpheme: GlossaryMorpheme }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
        {getPrimaryRole(morpheme.roles)}
      </span>
      <span className={`px-2 py-1 border-b-2 text-base text-gray-900 dark:text-gray-100 ${getRoleColor(morpheme.roles)}`}>
        {morpheme.surface}
      </span>
    </div>
  );
}

// ── Run-based rendering (Dixon-style constituent brackets) ───────────────────

type Run =
  | { kind: 'labeled'; label: string; morphemes: GlossaryMorpheme[] }
  | { kind: 'unlabeled'; morphemes: GlossaryMorpheme[] };

function buildRuns(
  morphemes: GlossaryMorpheme[],
  idToConstituent: Map<string, GlossaryConstituent>,
): Run[] {
  const runs: Run[] = [];

  for (const morpheme of morphemes) {
    const constituent = idToConstituent.get(morpheme.id);
    const label = constituent?.label ?? null;

    const last = runs[runs.length - 1];

    if (label === null) {
      // Unlabeled morpheme
      if (last && last.kind === 'unlabeled') {
        last.morphemes.push(morpheme);
      } else {
        runs.push({ kind: 'unlabeled', morphemes: [morpheme] });
      }
    } else {
      // Labeled morpheme — extend current labeled run only if same constituent object
      if (
        last &&
        last.kind === 'labeled' &&
        last.label === label &&
        constituent === idToConstituent.get(last.morphemes[last.morphemes.length - 1].id)
      ) {
        last.morphemes.push(morpheme);
      } else {
        runs.push({ kind: 'labeled', label, morphemes: [morpheme] });
      }
    }
  }

  return runs;
}

function ConstituentBracketView({ example }: { example: GlossaryExample }) {
  const constituents = example.constituents!;

  // Build morphemeId → constituent map
  const idToConstituent = new Map<string, GlossaryConstituent>();
  for (const constituent of constituents) {
    for (const id of constituent.morphemeIds) {
      idToConstituent.set(id, constituent);
    }
  }

  const runs = buildRuns(example.morphemes, idToConstituent);

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
        {example.sourceLanguage} — bracket view
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        {runs.map((run, i) => {
          if (run.kind === 'unlabeled') {
            return (
              <div key={i} className="flex items-end gap-2">
                {run.morphemes.map(m => (
                  <TokenPill key={m.id} morpheme={m} />
                ))}
              </div>
            );
          }

          const { label, morphemes } = run;
          const color = CONSTITUENT_COLORS[label] ?? '#94a3b8';

          return (
            <div
              key={i}
              className="relative flex items-end gap-2 pb-5 border-b-2 border-l-2 border-r-2 px-2 pt-1"
              style={{ borderColor: color }}
            >
              {morphemes.map(m => (
                <TokenPill key={m.id} morpheme={m} />
              ))}
              <ConstituentLabel
                label={label}
                def={CONSTITUENT_DEFS[label]}
                color={color}
              />
            </div>
          );
        })}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">'{example.translation}'</p>
    </div>
  );
}

// ── Legacy view (no constituents) ────────────────────────────────────────────

function LegacyBracketView({ example }: { example: GlossaryExample }) {
  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
        {example.sourceLanguage} — bracket view
      </p>
      <div className="flex flex-wrap gap-2 items-end">
        {example.morphemes.map(m => (
          <div key={m.id} className="flex flex-col items-center gap-0.5">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">
              {getPrimaryRole(m.roles)}
            </span>
            <span className={`px-2 py-1 border-b-2 text-base text-gray-900 dark:text-gray-100 ${getRoleColor(m.roles)}`}>
              {m.surface}
            </span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 italic">'{example.translation}'</p>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
        {[
          ['bg-blue-500', 'subject'],
          ['bg-green-500', 'predicate/verb'],
          ['bg-orange-500', 'object'],
          ['bg-purple-500', 'copula'],
          ['bg-gray-400', 'other'],
        ].map(([color, label]) => (
          <span key={label} className="flex items-center gap-1">
            <span className={`w-3 h-1 ${color} inline-block rounded`} /> {label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Public component ──────────────────────────────────────────────────────────

export default function BracketView({ example }: BracketViewProps) {
  if (example.constituents && example.constituents.length > 0) {
    return <ConstituentBracketView example={example} />;
  }
  return <LegacyBracketView example={example} />;
}
