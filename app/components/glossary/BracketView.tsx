import type { GlossaryExample } from '~/types/glossary';

interface BracketViewProps {
  example: GlossaryExample;
}

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

export default function BracketView({ example }: BracketViewProps) {
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
