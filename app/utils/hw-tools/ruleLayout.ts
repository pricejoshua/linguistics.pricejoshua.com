export interface RuleSlotText {
  kind: 'text';
  value: string;
  /** Wraps the slot in literal "(" ")" — an optional element. */
  optional?: boolean;
}

export interface RuleSlotMatrix {
  kind: 'matrix';
  /** When set, rendered as its own line above the bracketed stack (e.g. "V" over "[+high]"). Blank/absent renders exactly as a standalone bracket (e.g. "[α Place]" alone). */
  symbol?: string;
  values: string[];
  optional?: boolean;
}

export type RuleSlot = RuleSlotText | RuleSlotMatrix;

/**
 * A rule is four fill-in zones around a fixed skeleton — every real rule in
 * the source material is `target -> change / left __ right`, so the
 * separators are template furniture the student never inserts themselves
 * (see `assembleRule`), not slots living in any zone's own array.
 */
export interface Rule {
  target: RuleSlot[];
  change: RuleSlot[];
  environmentLeft: RuleSlot[];
  environmentRight: RuleSlot[];
}

export function emptyRule(): Rule {
  return { target: [], change: [], environmentLeft: [], environmentRight: [] };
}

const ARROW: RuleSlotText = { kind: 'text', value: '→' };
const SLASH: RuleSlotText = { kind: 'text', value: '/' };
const BLANK: RuleSlotText = { kind: 'text', value: '_' };

/** Flattens the four zones plus the fixed →, /, and blank into the single sequence `layoutRule` lays out. */
export function assembleRule(rule: Rule): RuleSlot[] {
  return [
    ...rule.target,
    ARROW,
    ...rule.change,
    SLASH,
    ...rule.environmentLeft,
    BLANK,
    ...rule.environmentRight,
  ];
}

/**
 * Fixed monospace character-width layout, not DOM measurement. Phonological
 * rule symbols are short (single characters or short feature names), so a
 * deterministic, testable pure function is preferred over two-pass
 * DOM-measured layout — a small amount of over/under-spacing is an
 * acceptable trade for simplicity here.
 */
export const CHAR_WIDTH = 11;
export const SLOT_GAP = 16;
export const LINE_HEIGHT = 22;
export const SLOT_PADDING_X = 8;
export const BRACKET_WIDTH = 8;
export const FONT_SIZE = 18;
/** Extra vertical room reserved above the bracket for a matrix slot's symbol line, when present. */
const SYMBOL_LINE_HEIGHT = 22;
const SYMBOL_GAP = 4;
/** Horizontal room each side of an optional slot's own content, for the drawn "(" "/" ")" paths. */
export const PAREN_WIDTH = 8;
export const PAREN_GAP = 4;

export interface TextSlotLayout {
  kind: 'text';
  value: string;
  optional?: boolean;
  x: number;
  width: number;
}

export interface MatrixSlotLayout {
  kind: 'matrix';
  values: string[];
  symbol?: string;
  optional?: boolean;
  /** Overall slot width, including any extra room a wide symbol or parens need — use this for cursor advancement. */
  x: number;
  width: number;
  /** Width of the stacked feature text only, excluding the bracket glyphs — bracket width is derived from this, then centered within `width`. */
  contentWidth: number;
}

export type SlotLayout = TextSlotLayout | MatrixSlotLayout;

export interface RuleLayout {
  slots: SlotLayout[];
  width: number;
  height: number;
  /** Vertical center every slot's bracket/single line is centered on — NOT the same as height/2 when a symbol line needs extra room above it (see `topPad`). */
  midY: number;
}

function textSlotCoreWidth(value: string): number {
  return value.length * CHAR_WIDTH + SLOT_PADDING_X * 2;
}

function parenAllowance(optional: boolean | undefined): number {
  return optional ? (PAREN_WIDTH + PAREN_GAP) * 2 : 0;
}

function matrixContentWidth(values: string[]): number {
  const longest = values.reduce((max, v) => Math.max(max, v.length), 0);
  return longest * CHAR_WIDTH;
}

function visibleValues(values: string[]): string[] {
  // Blank/whitespace-only lines don't count toward stack height or get
  // rendered as a row — they inflate the bracket for no visible reason. The
  // underlying values array is left untouched; this only affects what's
  // measured/drawn.
  return values.filter((v) => v.trim() !== '');
}

export function layoutRule(rule: RuleSlot[]): RuleLayout {
  const slots: SlotLayout[] = [];
  let cursor = 0;
  let maxStack = 1;
  let hasSymbol = false;

  for (const slot of rule) {
    if (slot.kind === 'text') {
      const coreWidth = textSlotCoreWidth(slot.value);
      const width = coreWidth + parenAllowance(slot.optional);
      slots.push({ kind: 'text', value: slot.value, optional: slot.optional, x: cursor, width });
      cursor += width + SLOT_GAP;
    } else {
      const contentWidth = matrixContentWidth(slot.values);
      const bracketWidth = contentWidth + SLOT_PADDING_X * 2 + BRACKET_WIDTH * 2;
      const symbolWidth = slot.symbol ? textSlotCoreWidth(slot.symbol) : 0;
      const coreWidth = Math.max(bracketWidth, symbolWidth);
      const width = coreWidth + parenAllowance(slot.optional);
      slots.push({
        kind: 'matrix',
        values: slot.values,
        symbol: slot.symbol,
        optional: slot.optional,
        x: cursor,
        width,
        contentWidth,
      });
      cursor += width + SLOT_GAP;
      maxStack = Math.max(maxStack, visibleValues(slot.values).length);
      if (slot.symbol) hasSymbol = true;
    }
  }

  const width = Math.max(cursor - SLOT_GAP, 0);
  const stackHeight = Math.max(maxStack * LINE_HEIGHT, LINE_HEIGHT) + SLOT_PADDING_X * 2;
  const topPad = hasSymbol ? SYMBOL_LINE_HEIGHT + SYMBOL_GAP : 0;
  const height = stackHeight + topPad;
  // Every slot's bracket/single line centers on the same midY regardless of
  // whether ITS OWN symbol is present — a slot with a symbol just draws
  // extra content in the topPad margin above that shared center, so bracket
  // positions stay consistent across every slot in the rule (matching the
  // reference examples, where a standalone bracket and a symbol-topped one
  // bottom out at the same height).
  const midY = topPad + stackHeight / 2;

  return { slots, width, height, midY };
}
