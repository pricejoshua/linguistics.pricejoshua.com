import {
  GEOMETRY_LINE_HEIGHT,
  GEOMETRY_TREE,
  GEOMETRY_VIEWBOX,
  computeActiveIds,
} from '../../data/phonology/featureGeometry';
import type {
  GeometryNodeId,
  GeometryTreeNode,
  PhoneGeometry,
} from '../../data/phonology/featureGeometry';

export interface FeatureGeometryTreeProps {
  geometry: PhoneGeometry;
  /** Accessible name for the SVG — must distinguish this tree from every other on the page. */
  label: string;
  size?: 'mini' | 'full';
}

const NODE_FONT_SIZE = 15;
const LEAF_FONT_SIZE = 13;
const VALUE_FONT_SIZE = 17;

/** Faint enough to read as "absent from this representation", still legible. */
const INACTIVE_OPACITY = 0.35;

/** Rendered CSS width. Narrower viewports scroll the container rather than shrink the type. */
const RENDERED_WIDTH: Record<'mini' | 'full', number> = { mini: 900, full: 1180 };

const NODES_BY_ID = new Map<GeometryNodeId, GeometryTreeNode>(
  GEOMETRY_TREE.map((n) => [n.id, n]),
);

/** Bottom of a node's text block — where an edge to a child leaves from. */
function anchorBottom(node: GeometryTreeNode): number {
  return node.y + (node.label.length - 1) * GEOMETRY_LINE_HEIGHT + 6;
}

/** Top of a node's text block — where an edge from its parent arrives. */
function anchorTop(node: GeometryTreeNode): number {
  return node.y - 12;
}

/** Baseline for the value glyph printed under a leaf. */
function valueBaseline(node: GeometryTreeNode): number {
  return node.y + (node.label.length - 1) * GEOMETRY_LINE_HEIGHT + 22;
}

function valueGlyph(value: '+' | '-' | undefined): string {
  if (value === '+') return '+';
  if (value === '-') return '−'; // minus sign, not a hyphen
  return '—'; // em dash
}

export default function FeatureGeometryTree({
  geometry,
  label,
  size = 'full',
}: FeatureGeometryTreeProps) {
  const active = computeActiveIds(geometry);
  const strokeWidth = size === 'mini' ? 2 : 1.6;

  return (
    <div className="overflow-x-auto text-gray-900 dark:text-gray-100">
      <svg
        viewBox={`0 0 ${GEOMETRY_VIEWBOX.width} ${GEOMETRY_VIEWBOX.height}`}
        width={RENDERED_WIDTH[size]}
        height={(RENDERED_WIDTH[size] * GEOMETRY_VIEWBOX.height) / GEOMETRY_VIEWBOX.width}
        className="max-w-none"
        role="img"
        aria-label={label}
      >
        {/* Edges first so text sits on top of them. */}
        <g stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round">
          {GEOMETRY_TREE.map((node) => {
            if (node.parent === null) return null;
            const parent = NODES_BY_ID.get(node.parent);
            if (!parent) return null;
            return (
              <line
                key={`edge-${node.id}`}
                x1={parent.x}
                y1={anchorBottom(parent)}
                x2={node.x}
                y2={anchorTop(node)}
                opacity={active.has(node.id) ? 1 : INACTIVE_OPACITY}
              />
            );
          })}
        </g>

        <g fill="currentColor" textAnchor="middle">
          {GEOMETRY_TREE.map((node) => {
            const isActive = active.has(node.id);
            const isLeaf = node.kind === 'leaf';
            return (
              <g key={`node-${node.id}`} opacity={isActive ? 1 : INACTIVE_OPACITY}>
                {node.label.map((line, i) => (
                  <text
                    key={`${node.id}-line-${i}`}
                    x={node.x}
                    y={node.y + i * GEOMETRY_LINE_HEIGHT}
                    fontSize={isLeaf ? LEAF_FONT_SIZE : NODE_FONT_SIZE}
                    fontWeight={isLeaf ? 400 : 600}
                  >
                    {line}
                  </text>
                ))}
                {isLeaf && node.leaf && (
                  <text
                    x={node.x}
                    y={valueBaseline(node)}
                    fontSize={VALUE_FONT_SIZE}
                    fontWeight={700}
                  >
                    {valueGlyph(geometry.leaves[node.leaf])}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
