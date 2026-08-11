import { forwardRef } from 'react';
import { layoutRule, LINE_HEIGHT, FONT_SIZE, BRACKET_WIDTH, SLOT_PADDING_X, type Rule } from '../../utils/hw-tools/ruleLayout';

export interface RuleDiagramProps {
  rule: Rule;
  label: string;
}

const RuleDiagram = forwardRef<SVGSVGElement, RuleDiagramProps>(function RuleDiagram({ rule, label }, ref) {
  const layout = layoutRule(rule);
  const width = Math.max(layout.width, 40);
  const height = layout.height;

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
      className="text-gray-900 dark:text-gray-100"
    >
      {/* fontFamily is "monospace" rather than a named web font: rasterization
          (svgExport's svgToPngBlob loads the serialized SVG via `new Image()`)
          runs in an isolated context that cannot fetch external web fonts, so
          only locally-installed fonts affect the exported PNG — naming a web
          font here would be false confidence. True embedding (a base64 font
          in the serialized SVG's <style>) would be needed for guaranteed
          cross-machine IPA glyph fidelity. */}
      <g fill="currentColor" fontFamily="monospace" fontSize={FONT_SIZE} textAnchor="middle">
        {layout.slots.map((slot, i) => {
          if (slot.kind === 'text') {
            return (
              <text key={i} x={slot.x + slot.width / 2} y={layout.midY + FONT_SIZE / 3}>
                {slot.value}
              </text>
            );
          }
          // Blank/whitespace-only lines don't count toward stack height or get
          // rendered as a row — they inflate the bracket for no visible reason.
          // The underlying slot.values array is untouched; this only affects
          // what's measured/drawn here.
          const visibleValues = slot.values.filter((v) => v.trim() !== '');
          const stackHeight = visibleValues.length * LINE_HEIGHT;
          const top = layout.midY - stackHeight / 2;
          const bottom = layout.midY + stackHeight / 2;
          const centerX = slot.x + BRACKET_WIDTH + SLOT_PADDING_X + slot.contentWidth / 2;
          const leftX = slot.x;
          const rightX = slot.x + slot.width;
          return (
            <g key={i}>
              <path
                d={`M ${leftX + BRACKET_WIDTH} ${top} L ${leftX} ${top} L ${leftX} ${bottom} L ${leftX + BRACKET_WIDTH} ${bottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
              <path
                d={`M ${rightX - BRACKET_WIDTH} ${top} L ${rightX} ${top} L ${rightX} ${bottom} L ${rightX - BRACKET_WIDTH} ${bottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {visibleValues.map((v, j) => (
                <text key={j} x={centerX} y={top + (j + 1) * LINE_HEIGHT - LINE_HEIGHT / 3}>
                  {v}
                </text>
              ))}
            </g>
          );
        })}
      </g>
    </svg>
  );
});

export default RuleDiagram;
