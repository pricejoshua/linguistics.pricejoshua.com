export interface RuleSlotText {
  kind: 'text';
  value: string;
}

export interface RuleSlotMatrix {
  kind: 'matrix';
  values: string[];
}

export type RuleSlot = RuleSlotText | RuleSlotMatrix;
export type Rule = RuleSlot[];

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

export interface TextSlotLayout {
  kind: 'text';
  value: string;
  x: number;
  width: number;
}

export interface MatrixSlotLayout {
  kind: 'matrix';
  values: string[];
  x: number;
  width: number;
  /** Width of the text stack only, excluding the bracket glyphs on either side. */
  contentWidth: number;
}

export type SlotLayout = TextSlotLayout | MatrixSlotLayout;

export interface RuleLayout {
  slots: SlotLayout[];
  width: number;
  height: number;
  /** Vertical center — single-line text slots and matrix stacks are both centered on this. */
  midY: number;
}

function textSlotWidth(value: string): number {
  return value.length * CHAR_WIDTH + SLOT_PADDING_X * 2;
}

function matrixContentWidth(values: string[]): number {
  const longest = values.reduce((max, v) => Math.max(max, v.length), 0);
  return longest * CHAR_WIDTH;
}

export function layoutRule(rule: Rule): RuleLayout {
  const slots: SlotLayout[] = [];
  let cursor = 0;
  let maxStack = 1;

  for (const slot of rule) {
    if (slot.kind === 'text') {
      const width = textSlotWidth(slot.value);
      slots.push({ kind: 'text', value: slot.value, x: cursor, width });
      cursor += width + SLOT_GAP;
    } else {
      const contentWidth = matrixContentWidth(slot.values);
      const width = contentWidth + SLOT_PADDING_X * 2 + BRACKET_WIDTH * 2;
      slots.push({ kind: 'matrix', values: slot.values, x: cursor, width, contentWidth });
      cursor += width + SLOT_GAP;
      // Blank/whitespace-only lines don't count toward stack height — a
      // misclicked "+ feature line" that's left empty shouldn't inflate the
      // bracket. The underlying values array is left untouched elsewhere;
      // this only affects the computed layout height.
      const visibleCount = slot.values.filter((v) => v.trim() !== '').length;
      maxStack = Math.max(maxStack, visibleCount);
    }
  }

  const width = Math.max(cursor - SLOT_GAP, 0);
  const height = Math.max(maxStack * LINE_HEIGHT, LINE_HEIGHT) + SLOT_PADDING_X * 2;

  return { slots, width, height, midY: height / 2 };
}
