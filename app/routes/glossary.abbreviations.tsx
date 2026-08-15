import { Link } from 'react-router';
import { LEIPZIG_ABBREVIATIONS } from '~/data/leipzig-glossing';
import type { Route } from './+types/glossary.abbreviations';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Leipzig Glossing Abbreviations — Linguistics Glossary' },
    { name: 'description', content: 'Standard Leipzig Glossing Rules abbreviations used in interlinear morpheme glosses' },
  ];
}

const SECTION_ORDER = [
  'Person & Number',
  'Gender & Noun Class',
  'Case',
  'Tense & Aspect',
  'Mood',
  'Copula & Existential',
  'Determiner & Deixis',
  'Predication & Marking',
  'Voice & Valency',
  'Negation',
  'Information Structure',
  'Other',
];

function getSection(abbr: string): string {
  const a = abbr.toUpperCase();
  if (/^[123](SG|PL|DU)?(\.(M|F|N|NOM|ACC|GEN))?$/.test(a)) return 'Person & Number';
  if (['SG', 'PL', 'DU'].includes(a)) return 'Person & Number';
  if (['M', 'F', 'N', 'CL'].includes(a)) return 'Gender & Noun Class';
  if (['NOM', 'ACC', 'GEN', 'DAT', 'LOC', 'ALL', 'ABL', 'INS', 'VOC', 'ERG', 'ABS', 'BEN', 'OBL'].includes(a)) return 'Case';
  if (['PRS', 'PST', 'FUT', 'IPFV', 'PFV'].includes(a)) return 'Tense & Aspect';
  if (['IND', 'SBJV', 'IMP', 'COND'].includes(a)) return 'Mood';
  if (['COP', 'EXIST', 'EXPL'].includes(a)) return 'Copula & Existential';
  if (['DEF', 'INDEF', 'PROX', 'DIST', 'ART'].includes(a)) return 'Determiner & Deixis';
  if (['PRED', 'INVAR'].includes(a)) return 'Predication & Marking';
  if (['PASS', 'CAUS', 'INTR', 'TR', 'REFL', 'RECIP'].includes(a)) return 'Voice & Valency';
  if (['NEG'].includes(a)) return 'Negation';
  if (['TOP', 'FOC', 'EMPH', 'INCL', 'EXCL'].includes(a)) return 'Information Structure';
  return 'Other';
}

export default function AbbreviationsPage() {
  // Deduplicate compound entries (e.g. 1SG.NOM) — only show atomic abbreviations in the table
  const atomic = LEIPZIG_ABBREVIATIONS.filter(a => !a.abbreviation.includes('.') || a.abbreviation.startsWith('1SG') === false);
  // Actually show all, grouped
  const grouped = new Map<string, typeof LEIPZIG_ABBREVIATIONS>();
  for (const section of SECTION_ORDER) {
    grouped.set(section, []);
  }
  for (const entry of LEIPZIG_ABBREVIATIONS) {
    const section = getSection(entry.abbreviation);
    grouped.get(section)?.push(entry);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-2 flex gap-4">
          <Link to="/glossary" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">← Glossary</Link>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Leipzig Glossing Abbreviations
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Standard abbreviations used in interlinear morpheme glosses, following the{' '}
          <a
            href="https://www.eva.mpg.de/lingua/pdf/Glossing-Rules.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Leipzig Glossing Rules
          </a>
          . Click any gloss label in an example to see its entry here.
        </p>

        <div className="space-y-8">
          {SECTION_ORDER.map(section => {
            const entries = grouped.get(section) ?? [];
            if (entries.length === 0) return null;
            return (
              <section key={section}>
                <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {section}
                </h2>
                <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                  {entries.map(entry => (
                    <div
                      key={entry.abbreviation}
                      id={entry.abbreviation}
                      className="flex items-baseline gap-4 px-4 py-3"
                    >
                      <span className="font-mono text-sm font-semibold text-blue-700 dark:text-blue-400 min-w-[5rem] shrink-0">
                        {entry.abbreviation}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100 min-w-[12rem] shrink-0">
                        {entry.label}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.description}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
