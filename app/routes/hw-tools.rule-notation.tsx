import { useRef, useState } from 'react';
import RuleBuilder from '../components/hw-tools/RuleBuilder';
import RuleDiagram from '../components/hw-tools/RuleDiagram';
import ExportControls from '../components/hw-tools/ExportControls';
import type { Rule } from '../utils/hw-tools/ruleLayout';

export default function RuleNotationTool() {
  const [rule, setRule] = useState<Rule>([]);
  const exportRef = useRef<SVGSVGElement>(null);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Rule Notation Builder</h1>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Build a rule left to right. Add plain symbols, or a feature matrix for a bracketed set of stacked
          values.
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Nothing here is saved — copy your work before navigating away.
        </p>
      </div>

      <RuleBuilder rule={rule} onChange={setRule} />

      <div className="border border-gray-200 dark:border-gray-800 rounded p-4 overflow-x-auto">
        <RuleDiagram ref={exportRef} rule={rule} label="Rule notation preview" />
      </div>

      <ExportControls svgRef={exportRef} disabled={rule.length === 0} filenameBase="rule-notation" />
    </div>
  );
}
