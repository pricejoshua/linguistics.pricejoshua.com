import type { RuleSlot } from '../../utils/hw-tools/ruleLayout';
import SpecialCharacterPicker from './SpecialCharacterPicker';

export interface SlotZoneEditorProps {
  label: string;
  slots: RuleSlot[];
  onChange: (slots: RuleSlot[]) => void;
}

const QUICK_INSERT = ['C', 'V', 'X', 'Ø', '#'];

export default function SlotZoneEditor({ label, slots, onChange }: SlotZoneEditorProps) {
  const addTextSlot = (value = '') => onChange([...slots, { kind: 'text', value }]);
  const addMatrixSlot = () => onChange([...slots, { kind: 'matrix', values: [''] }]);

  const updateSlot = (index: number, slot: RuleSlot) => {
    const next = [...slots];
    next[index] = slot;
    onChange(next);
  };

  const removeSlot = (index: number) => onChange(slots.filter((_, i) => i !== index));

  const moveSlot = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= slots.length) return;
    const next = [...slots];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  /** "Choose C/V/X, then a matrix can be added under it" — converts a bare text slot in place. */
  const attachMatrix = (index: number, symbol: string) => {
    updateSlot(index, { kind: 'matrix', symbol, values: [''] });
  };

  const toggleOptional = (index: number, slot: RuleSlot) => {
    updateSlot(index, { ...slot, optional: !slot.optional });
  };

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="flex flex-wrap items-center gap-2">
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
        <SpecialCharacterPicker onInsert={(char) => addTextSlot(char)} />
      </div>

      <ul className="space-y-2">
        {slots.map((slot, i) => (
          <li
            key={i}
            className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 rounded p-2"
          >
            {slot.kind === 'text' ? (
              <>
                <input
                  type="text"
                  value={slot.value}
                  onChange={(e) => updateSlot(i, { ...slot, value: e.target.value })}
                  className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-20"
                />
                <button
                  type="button"
                  onClick={() => attachMatrix(i, slot.value)}
                  title="Add a feature matrix under this symbol"
                  className="text-sm text-blue-600 dark:text-blue-400"
                >
                  + matrix
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-1">
                {slot.symbol !== undefined && (
                  <input
                    type="text"
                    value={slot.symbol}
                    onChange={(e) => updateSlot(i, { ...slot, symbol: e.target.value })}
                    placeholder="(no symbol)"
                    className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-20 text-xs"
                  />
                )}
                {slot.values.map((v, j) => (
                  <div key={j} className="flex items-center gap-1">
                    <input
                      type="text"
                      value={v}
                      onChange={(e) => {
                        const values = [...slot.values];
                        values[j] = e.target.value;
                        updateSlot(i, { ...slot, values });
                      }}
                      className="border border-gray-300 dark:border-gray-700 rounded px-2 py-1 bg-white dark:bg-gray-900 w-24"
                    />
                    <SpecialCharacterPicker
                      label="Insert variable"
                      onInsert={(char) => {
                        const values = [...slot.values];
                        // Variable-first convention: "α voice", not "voice α".
                        values[j] = `${char} ${values[j]}`.trim();
                        updateSlot(i, { ...slot, values });
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => updateSlot(i, { ...slot, values: slot.values.filter((_, k) => k !== j) })}
                      aria-label="Remove feature line"
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => updateSlot(i, { ...slot, values: [...slot.values, ''] })}
                  className="text-sm text-blue-600 dark:text-blue-400 text-left"
                >
                  + feature line
                </button>
              </div>
            )}
            <button
              type="button"
              onClick={() => toggleOptional(i, slot)}
              aria-pressed={slot.optional}
              title="Toggle optional (parentheses)"
              className={`text-sm px-1 rounded ${slot.optional ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-gray-400 dark:text-gray-500'}`}
            >
              ( )
            </button>
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
