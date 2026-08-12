import type { Rule, RuleSlot } from '../../utils/hw-tools/ruleLayout';
import SlotZoneEditor from './SlotZoneEditor';

export interface RuleBuilderProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
}

/**
 * Every rule in the source material follows the same skeleton:
 * target -> change / left __ right. Four zone editors fill in that fixed
 * template instead of the student building the whole thing (arrow, slash,
 * and blank included) from a single flat list.
 */
export default function RuleBuilder({ rule, onChange }: RuleBuilderProps) {
  const updateZone = (zone: keyof Rule) => (slots: RuleSlot[]) => onChange({ ...rule, [zone]: slots });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SlotZoneEditor label="Target" slots={rule.target} onChange={updateZone('target')} />
        <SlotZoneEditor label="Change" slots={rule.change} onChange={updateZone('change')} />
      </div>
      <div className="text-center text-sm text-gray-400 dark:text-gray-500">→ … /</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <SlotZoneEditor label="Environment — before ___" slots={rule.environmentLeft} onChange={updateZone('environmentLeft')} />
        <SlotZoneEditor label="Environment — after ___" slots={rule.environmentRight} onChange={updateZone('environmentRight')} />
      </div>
    </div>
  );
}
