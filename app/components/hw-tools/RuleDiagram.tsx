import { forwardRef } from 'react';
import {
  layoutRule,
  assembleRule,
  LINE_HEIGHT,
  FONT_SIZE,
  BRACKET_WIDTH,
  SLOT_PADDING_X,
  PAREN_WIDTH,
  type Rule,
} from '../../utils/hw-tools/ruleLayout';

export interface RuleDiagramProps {
  rule: Rule;
  label: string;
}

/** Left/right "(" ")" paths sized to a given vertical span — drawn, not font-rendered, so they scale to any slot height cleanly. */
function parenPaths(leftX: number, rightX: number, top: number, bottom: number): { left: string; right: string } {
  const bow = Math.min((bottom - top) * 0.15, PAREN_WIDTH);
  const midY = (top + bottom) / 2;
  return {
    left: `M ${leftX + PAREN_WIDTH} ${top} Q ${leftX + PAREN_WIDTH - bow} ${midY} ${leftX + PAREN_WIDTH} ${bottom}`,
    right: `M ${rightX - PAREN_WIDTH} ${top} Q ${rightX - PAREN_WIDTH + bow} ${midY} ${rightX - PAREN_WIDTH} ${bottom}`,
  };
}

const RuleDiagram = forwardRef<SVGSVGElement, RuleDiagramProps>(function RuleDiagram({ rule, label }, ref) {
  const layout = layoutRule(assembleRule(rule));
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
          const centerX = slot.x + slot.width / 2;

          if (slot.kind === 'text') {
            const parens = slot.optional ? parenPaths(slot.x, slot.x + slot.width, layout.midY - FONT_SIZE / 2, layout.midY + FONT_SIZE / 2) : null;
            return (
              <g key={i}>
                {parens && <path d={parens.left} fill="none" stroke="currentColor" strokeWidth={1.5} />}
                {parens && <path d={parens.right} fill="none" stroke="currentColor" strokeWidth={1.5} />}
                <text x={centerX} y={layout.midY + FONT_SIZE / 3}>
                  {slot.value}
                </text>
              </g>
            );
          }

          const visibleValues = slot.values.filter((v) => v.trim() !== '');
          const stackHeight = visibleValues.length * LINE_HEIGHT;
          const top = layout.midY - stackHeight / 2;
          const bottom = layout.midY + stackHeight / 2;
          const bracketWidth = slot.contentWidth + SLOT_PADDING_X * 2 + BRACKET_WIDTH * 2;
          const bracketLeftX = slot.x + (slot.width - bracketWidth) / 2;
          const bracketRightX = bracketLeftX + bracketWidth;
          const parens = slot.optional ? parenPaths(slot.x, slot.x + slot.width, top, bottom) : null;

          return (
            <g key={i}>
              {slot.symbol && (
                <text x={centerX} y={top - LINE_HEIGHT / 3}>
                  {slot.symbol}
                </text>
              )}
              <path
                d={`M ${bracketLeftX + BRACKET_WIDTH} ${top} L ${bracketLeftX} ${top} L ${bracketLeftX} ${bottom} L ${bracketLeftX + BRACKET_WIDTH} ${bottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
              <path
                d={`M ${bracketRightX - BRACKET_WIDTH} ${top} L ${bracketRightX} ${top} L ${bracketRightX} ${bottom} L ${bracketRightX - BRACKET_WIDTH} ${bottom}`}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              />
              {visibleValues.map((v, j) => (
                <text key={j} x={centerX} y={top + (j + 1) * LINE_HEIGHT - LINE_HEIGHT / 3}>
                  {v}
                </text>
              ))}
              {parens && <path d={parens.left} fill="none" stroke="currentColor" strokeWidth={1.5} />}
              {parens && <path d={parens.right} fill="none" stroke="currentColor" strokeWidth={1.5} />}
            </g>
          );
        })}
      </g>
    </svg>
  );
});

export default RuleDiagram;
