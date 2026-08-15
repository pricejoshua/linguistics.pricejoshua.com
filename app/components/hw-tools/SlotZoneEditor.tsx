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
    <div className="panel p-3">
      <div className="u-label mb-2">{label}</div>

      <div className="flex flex-wrap items-center gap-1">
        {QUICK_INSERT.map((sym) => (
          <button
            key={sym}
            type="button"
            onClick={() => addTextSlot(sym)}
            title={`Add ${sym}`}
            className="btn btn-key"
          >
            {sym}
          </button>
        ))}
        <SpecialCharacterPicker onInsert={(char) => addTextSlot(char)} />
        <span className="w-px self-stretch mx-1" style={{ background: 'var(--line)' }} aria-hidden="true" />
        <button type="button" onClick={() => addTextSlot('')} className="btn btn-quiet">
          + Symbol
        </button>
        <button type="button" onClick={addMatrixSlot} className="btn btn-quiet">
          + Matrix
        </button>
      </div>

      {slots.length === 0 ? (
        /* An empty zone is a legal answer, and the buttons above are already
           the invitation — so this stays terse. The long version appeared in
           all four zones at once and read as noise. */
        <p className="u-note mt-2.5">Empty</p>
      ) : (
        /*
          Horizontal, because slot order IS the notation's left-to-right order
          — the same order the "move left / move right" buttons change. Stacked
          vertically, the editor contradicted its own model.
        */
        <ul className="mt-2.5 flex flex-wrap items-start gap-1.5">
          {slots.map((slot, i) => (
            <li
              key={i}
              className="flex flex-col gap-1 p-1.5 rounded-[3px]"
              style={{ border: '1px solid var(--line)', background: 'var(--bench-sunk)' }}
            >
              <div className="min-w-0">
                {slot.kind === 'text' ? (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input
                      type="text"
                      value={slot.value}
                      onChange={(e) => updateSlot(i, { ...slot, value: e.target.value })}
                      aria-label={`${label} symbol ${i + 1}`}
                      placeholder="symbol"
                      className="field w-20"
                    />
                    <button
                      type="button"
                      onClick={() => attachMatrix(i, slot.value)}
                      title="Add a feature matrix under this symbol"
                      className="btn btn-quiet text-[0.75rem]"
                    >
                      + matrix
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    {slot.symbol !== undefined && (
                      <input
                        type="text"
                        value={slot.symbol}
                        onChange={(e) => updateSlot(i, { ...slot, symbol: e.target.value })}
                        placeholder="no symbol"
                        aria-label={`${label} matrix ${i + 1} symbol`}
                        className="field w-20 text-[0.8125rem]"
                      />
                    )}
                    {/* Bracket walls — the matrix reads as [ … ] while you edit it, not as a plain list of inputs. */}
                    <div className="matrix-bracket flex flex-col gap-1 py-1">
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
                            aria-label={`${label} matrix ${i + 1} feature ${j + 1}`}
                            placeholder="+voice"
                            className="field w-28"
                          />
                          <SpecialCharacterPicker
                            label="Insert a variable"
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
                            aria-label={`Remove feature ${j + 1}`}
                            title="Remove this feature"
                            className="btn btn-quiet btn-danger"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => updateSlot(i, { ...slot, values: [...slot.values, ''] })}
                      className="btn btn-quiet self-start text-[0.75rem]"
                    >
                      + Feature
                    </button>
                  </div>
                )}
              </div>

              {/* Tools sit under their own slot rather than flush-right in the
                  panel, where a wide zone left them stranded far from the
                  content they act on. */}
              <div
                className="flex items-center justify-center gap-0.5 pt-1"
                style={{ borderTop: '1px solid var(--line)' }}
              >
                <button
                  type="button"
                  onClick={() => toggleOptional(i, slot)}
                  aria-pressed={slot.optional}
                  aria-label="Optional"
                  title={slot.optional ? 'Optional — remove the parentheses' : 'Mark optional — wrap in parentheses'}
                  className="btn btn-quiet u-notation"
                  style={{
                    color: slot.optional ? 'var(--ditto)' : 'var(--ink-faint)',
                    background: slot.optional ? 'var(--ditto-wash)' : undefined,
                  }}
                >
                  ( )
                </button>
                <button
                  type="button"
                  onClick={() => moveSlot(i, -1)}
                  disabled={i === 0}
                  aria-label="Move left"
                  title="Move left"
                  className="btn btn-quiet"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => moveSlot(i, 1)}
                  disabled={i === slots.length - 1}
                  aria-label="Move right"
                  title="Move right"
                  className="btn btn-quiet"
                >
                  →
                </button>
                <button
                  type="button"
                  onClick={() => removeSlot(i)}
                  aria-label="Remove"
                  title="Remove"
                  className="btn btn-quiet btn-danger"
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
