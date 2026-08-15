export type MarkKind = 'associate' | 'insert' | 'delink' | 'delete';

/**
 * The mark each annotation mode draws, rendered as SVG rather than text.
 *
 * These started as literal characters (╱ ⧸⧸ Ø→ →Ø), but Gentium Plus has no
 * glyph for U+2571 or U+29F8 — Delink rendered as two empty tofu boxes, and
 * Associate only survived through a system-font fallback that is not
 * guaranteed on any other machine. Drawing them removes the font dependency
 * entirely and, more usefully, lets the button show the *same* stroke the
 * canvas draws: the geometry here mirrors TreeGroup's delinkTickPath and the
 * dashed association line in LinkedFeatureTrees.
 */
export default function ModeMark({ kind }: { kind: MarkKind }) {
  return (
    <svg
      viewBox="0 0 26 12"
      width="26"
      height="12"
      aria-hidden="true"
      focusable="false"
      className="mode-mark"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
    >
      {kind === 'associate' && (
        /* The association line: dashed, spanning two tiers. */
        <line x1={3} y1={10} x2={23} y2={2} strokeDasharray="3.5 2.5" />
      )}

      {kind === 'delink' && (
        <>
          <line x1={2} y1={10} x2={24} y2={2} />
          {/* Two short ticks across the midpoint, PERPENDICULAR to the line —
              the delinking mark. Computed from the line's own direction; at
              45° they read as a smudge rather than a double tick. */}
          <g strokeWidth={1.5}>
            <line x1={10.88} y1={3.68} x2={12.86} y2={9.14} />
            <line x1={13.14} y1={2.86} x2={15.12} y2={8.32} />
          </g>
        </>
      )}

      {(kind === 'insert' || kind === 'delete') && (
        <>
          {/* Ø drawn, not typed: a ring with its stroke. Sits on the side the
              arrow points away from (insert: from Ø) or toward (delete: to Ø). */}
          <g transform={kind === 'insert' ? 'translate(0,0)' : 'translate(17,0)'}>
            <circle cx={4.5} cy={6} r={3.9} />
            <line x1={1.5} y1={9.2} x2={7.5} y2={2.8} />
          </g>
          <g transform={kind === 'insert' ? 'translate(10,0)' : 'translate(0,0)'}>
            <line x1={0.5} y1={6} x2={14} y2={6} />
            <path d="M 16 6 L 12.4 4.1 L 12.4 7.9 Z" fill="currentColor" stroke="none" />
          </g>
        </>
      )}
    </svg>
  );
}
