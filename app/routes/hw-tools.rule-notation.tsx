import { useRef, useState } from 'react';
import RuleBuilder from '../components/hw-tools/RuleBuilder';
import RuleDiagram from '../components/hw-tools/RuleDiagram';
import ExportControls from '../components/hw-tools/ExportControls';
import { emptyRule, type Rule, type RuleSlot } from '../utils/hw-tools/ruleLayout';

function slotHasContent(slot: RuleSlot): boolean {
  return slot.kind === 'text' ? slot.value.trim() !== '' : slot.values.some((v) => v.trim() !== '');
}

/** True if at least one zone has a slot with real (non-whitespace) content, not just an empty placeholder. */
function hasContent(rule: Rule): boolean {
  return [...rule.target, ...rule.change, ...rule.environmentLeft, ...rule.environmentRight].some(slotHasContent);
}

export default function RuleNotationTool() {
  const [rule, setRule] = useState<Rule>(emptyRule());
  const exportRef = useRef<SVGSVGElement>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rule Notation Builder</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Fill in each zone of the rule: Target and Change around the arrow, Environment before/after the
          blank. Add plain symbols, or a feature matrix (standalone, or attached under a symbol with
          "+ matrix").
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nothing here is saved — copy your work before navigating away.
        </p>
      </div>

      <RuleBuilder rule={rule} onChange={setRule} />

      <div className="border border-gray-200 dark:border-gray-800 rounded p-4 overflow-x-auto">
        <RuleDiagram ref={exportRef} rule={rule} label="Rule notation preview" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ExportControls svgRef={exportRef} disabled={!hasContent(rule)} filenameBase="rule-notation" />
        <button
          type="button"
          onClick={() => setRule(emptyRule())}
          className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
