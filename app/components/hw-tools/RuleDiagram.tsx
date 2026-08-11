import { forwardRef } from 'react';
import { layoutRule, LINE_HEIGHT, FONT_SIZE, BRACKET_WIDTH, type Rule } from '../../utils/hw-tools/ruleLayout';

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
      <g fill="currentColor" fontFamily="'Noto Sans Mono', monospace" fontSize={FONT_SIZE} textAnchor="middle">
        {layout.slots.map((slot, i) => {
          if (slot.kind === 'text') {
            return (
              <text key={i} x={slot.x + slot.width / 2} y={layout.midY + FONT_SIZE / 3}>
                {slot.value}
              </text>
            );
          }
          const stackHeight = slot.values.length * LINE_HEIGHT;
          const top = layout.midY - stackHeight / 2;
          const bottom = layout.midY + stackHeight / 2;
          const centerX = slot.x + BRACKET_WIDTH + slot.contentWidth / 2;
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
              {slot.values.map((v, j) => (
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
