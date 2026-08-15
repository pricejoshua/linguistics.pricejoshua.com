import { NavLink, Outlet } from 'react-router';
import SiteHeader from '../components/SiteHeader';

const TABS = [
  { to: '/hw-tools', label: 'Overview', end: true },
  { to: '/hw-tools/feature-geometry', label: 'Feature tree', end: false },
  { to: '/hw-tools/rule-notation', label: 'Rule notation', end: false },
];

export default function HwToolsLayout() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bench)' }}>
      <SiteHeader />
      <div
        className="border-b"
        style={{ borderColor: 'var(--line)', background: 'var(--bench-panel)' }}
      >
        <nav className="max-w-6xl mx-auto px-5 flex gap-1" aria-label="Homework tools">
          {TABS.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.end}
              className="px-3 py-2.5 text-[0.8125rem] transition-colors"
              style={({ isActive }) => ({
                color: isActive ? 'var(--ink)' : 'var(--ink-soft)',
                fontWeight: isActive ? 600 : 400,
                boxShadow: isActive ? 'inset 0 -2px 0 0 var(--ditto)' : 'none',
              })}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>
      <Outlet />
    </div>
  );
}
