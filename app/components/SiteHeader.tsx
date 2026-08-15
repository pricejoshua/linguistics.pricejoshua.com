import { NavLink } from 'react-router';

const TOOLS = [
  { to: '/phonology', label: 'Phonology' },
  { to: '/hw-tools', label: 'Homework tools' },
  { to: '/glossary', label: 'Glossary' },
  { to: '/anki', label: 'Anki' },
];

/**
 * Site-wide chrome. Every tool page mounts this so the tools stop being
 * orphans — before, /hw-tools had no link back to the index and no indication
 * it belonged to a larger site.
 */
export default function SiteHeader() {
  return (
    <header
      className="border-b"
      style={{ borderColor: 'var(--line)', background: 'var(--bench-panel)' }}
    >
      <div className="max-w-6xl mx-auto px-5 h-12 flex items-center gap-6">
        <NavLink
          to="/"
          className="u-display text-[0.95rem] shrink-0"
          style={{ color: 'var(--ink)' }}
        >
          {/* A feature specification for the site itself. */}
          <span style={{ color: 'var(--ink-faint)' }}>[</span>
          <span style={{ color: 'var(--ditto)' }}>+</span>
          ling
          <span style={{ color: 'var(--ink-faint)' }}>]</span>
        </NavLink>

        <nav className="flex items-center gap-1 overflow-x-auto">
          {TOOLS.map((tool) => (
            <NavLink
              key={tool.to}
              to={tool.to}
              className="px-2.5 py-1 text-[0.8125rem] whitespace-nowrap rounded-[3px] transition-colors"
              style={({ isActive }) => ({
                color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
                fontWeight: isActive ? 600 : 400,
                background: isActive ? 'var(--bench-sunk)' : 'transparent',
              })}
            >
              {tool.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
