import { Link } from 'react-router';
import SiteHeader from '../components/SiteHeader';

const TOOLS = [
  {
    path: '/hw-tools',
    label: 'Homework tools',
    blurb: 'Build a feature geometry tree or a phonological rule, then copy it straight into Word.',
  },
  {
    path: '/phonology',
    label: 'Phonology helper',
    blurb: 'Select phones to see the features they share, and the smallest set that tells them apart.',
  },
  {
    path: '/glossary',
    label: 'Glossary',
    blurb: 'Look up a term and read it against an annotated example sentence.',
  },
  {
    path: '/anki',
    label: 'Anki flashcards',
    blurb: 'Turn a list of forms into a deck you can import.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bench)' }}>
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-5">
        {/*
          The hero is the artifact itself: a phonological rule set the way the
          tools set it. Nothing else on the web looks like this line, and it
          says what the site is for faster than a sentence could.
        */}
        <section className="pt-16 pb-12">
          <p
            className="u-notation select-none"
            style={{
              fontSize: 'clamp(1.5rem, 6.5vw, 2.75rem)',
              color: 'var(--ink)',
              lineHeight: 1.35,
            }}
          >
            <span style={{ color: 'var(--ink-soft)' }}>[+nasal]</span>{' '}
            <span style={{ color: 'var(--ditto)' }}>→</span>{' '}
            <span style={{ color: 'var(--ink-soft)' }}>[α place]</span>{' '}
            <span style={{ color: 'var(--ink-faint)' }}>/ __</span>{' '}
            <span style={{ color: 'var(--ink-soft)' }}>[α place]</span>
          </p>
          <h1
            className="u-display mt-6"
            style={{ fontSize: 'clamp(1.35rem, 3.6vw, 1.85rem)', color: 'var(--ink)' }}
          >
            Notation you can actually hand in.
          </h1>
          <p className="u-note mt-3 max-w-xl" style={{ fontSize: '0.9375rem' }}>
            A small set of tools for linguistics coursework — trees, rules, features and
            terms — built to get a clean diagram out of the browser and into a document.
          </p>
        </section>

        <hr className="rule-hairline" />

        <ul>
          {TOOLS.map((tool) => (
            <li key={tool.path} style={{ borderBottom: '1px solid var(--line-soft)' }}>
              <Link
                to={tool.path}
                className="group block py-5 transition-colors"
                style={{ color: 'var(--ink)' }}
              >
                <span className="flex items-baseline gap-3">
                  <span className="u-display" style={{ fontSize: '1.1rem' }}>
                    {tool.label}
                  </span>
                  <span
                    className="u-notation opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                    style={{ color: 'var(--ditto)', fontSize: '1rem' }}
                    aria-hidden="true"
                  >
                    →
                  </span>
                </span>
                <span className="u-note block mt-1 max-w-lg">{tool.blurb}</span>
              </Link>
            </li>
          ))}
        </ul>

        <p className="u-note py-10">
          Nothing you build here is stored on a server. Copy your work before you close the tab.
        </p>
      </main>
    </div>
  );
}
