import type { Rule, RuleSlot } from '../../utils/hw-tools/ruleLayout';
import SlotZoneEditor from './SlotZoneEditor';

export interface RuleBuilderProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
}

/**
 * The operators are structural furniture, not decoration: they are the fixed
 * part of the template the student is filling in. Set in the display face at
 * expression scale, vertically centred against the zones — the way an arrow
 * sits in real rule notation.
 */
function Operator({ glyph, name }: { glyph: string; name: string }) {
  return (
    <div
      className="u-notation flex items-center justify-center select-none py-1 sm:py-0 sm:h-full"
      style={{ fontSize: '1.6rem' }}
      aria-hidden="true"
      title={name}
    >
      {glyph}
    </div>
  );
}

/**
 * Every rule in the source material follows the same skeleton:
 * target → change / left __ right. Rather than presenting four anonymous
 * form panels in a grid with the skeleton described in a caption, the editor
 * is laid out AS the skeleton — you can read the rule you are building off
 * the form itself, and the operators show where each zone lands.
 *
 * Both rows share ONE grid so the four zones line up in two clean columns.
 * Previously each row had its own grid and the leading "/" consumed a column
 * in the second one, shunting Before/After out of alignment with Target and
 * Change above them. The first column is that "/" gutter; row one leaves it
 * empty.
 */
export default function RuleBuilder({ rule, onChange }: RuleBuilderProps) {
  const updateZone = (zone: keyof Rule) => (slots: RuleSlot[]) => onChange({ ...rule, [zone]: slots });

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_1fr] sm:items-center gap-2 sm:gap-x-3 sm:gap-y-4">
      {/* Row 1 — structural change: what turns into what. */}
      <div className="hidden sm:block" aria-hidden="true" />
      <SlotZoneEditor label="Target" slots={rule.target} onChange={updateZone('target')} />
      <Operator glyph="→" name="becomes" />
      <SlotZoneEditor label="Change" slots={rule.change} onChange={updateZone('change')} />

      {/* Row 2 — environment: where it happens. */}
      <Operator glyph="/" name="in the environment" />
      <SlotZoneEditor label="Before" slots={rule.environmentLeft} onChange={updateZone('environmentLeft')} />
      <Operator glyph="__" name="the target's position" />
      <SlotZoneEditor label="After" slots={rule.environmentRight} onChange={updateZone('environmentRight')} />
    </div>
  );
}
