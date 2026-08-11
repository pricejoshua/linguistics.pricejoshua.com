import type { Rule, RuleSlot } from '../../utils/hw-tools/ruleLayout';

export interface RuleBuilderProps {
  rule: Rule;
  onChange: (rule: Rule) => void;
}

const QUICK_INSERT = ['→', 'Ø', '/', '_', '#'];

export default function RuleBuilder({ rule, onChange }: RuleBuilderProps) {
  const addTextSlot = (value = '') => onChange([...rule, { kind: 'text', value }]);
  const addMatrixSlot = () => onChange([...rule, { kind: 'matrix', values: [''] }]);

  const updateSlot = (index: number, slot: RuleSlot) => {
    const next = [...rule];
    next[index] = slot;
    onChange(next);
  };

  const removeSlot = (index: number) => onChange(rule.filter((_, i) => i !== index));

  const moveSlot = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= rule.length) return;
    const next = [...rule];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {QUICK_INSERT.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => addTextSlot(sym)}
            className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            {sym}
          </button>
        ))}
        <button
          type="button"
          onClick={() => addTextSlot('')}
          className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          + Symbol
        </button>
        <button
          type="button"
          onClick={addMatrixSlot}
          className="px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          + Feature matrix
        </button>
      </div>

      <ul className="space-y-2">
        {rule.map((slot, i) => (
          <li
            key={i}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded p-2"
          >
            {slot.kind === 'text' ? (
              <input
                type="text"
                value={slot.value}
                onChange={(e) => updateSlot(i, { kind: 'text', value: e.target.value })}
                className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-24"
              />
            ) : (
              <div className="flex flex-col gap-1">
                {slot.values.map((v, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => {
                        const values = [...slot.values];
                        values[j] = e.target.value;
                        updateSlot(i, { kind: 'matrix', values });
                      }}
                      className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-24"
                    />
                    <button
                      type="button"
                      onClick={() => updateSlot(i, { kind: 'matrix', values: slot.values.filter((_, k) => k !== j) })}
                      aria-label="Remove feature line"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateSlot(i, { kind: 'matrix', values: [...slot.values, ''] })}
                  className="text-sm text-blue-600 dark:text-blue-400 text-left"
                >
                  + feature line
                </button>
              </div>
            )}
            <button type="button" onClick={() => moveSlot(i, -1)} aria-label="Move left">
              ←
            </button>
            <button type="button" onClick={() => moveSlot(i, 1)} aria-label="Move right">
              →
            </button>
            <button type="button" onClick={() => removeSlot(i)} aria-label="Remove slot">
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
