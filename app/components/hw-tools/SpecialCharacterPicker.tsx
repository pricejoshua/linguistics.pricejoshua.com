import { useEffect, useRef, useState } from 'react';

export interface SpecialCharacterPickerProps {
  onInsert: (char: string) => void;
  label?: string;
}

/**
 * The one place the "special characters" set lives — used both as a zone's
 * toolbar button (inserts a new bare symbol slot) and next to a matrix
 * value line (inserts into that line's text). The caller decides what
 * "insert" means via `onInsert`; this component only owns the character
 * set and the open/closed popover state.
 */
const CHARACTERS = [
  { char: 'α', name: 'alpha' },
  { char: 'β', name: 'beta' },
  { char: 'γ', name: 'gamma' },
  { char: 'δ', name: 'delta' },
  { char: 'ε', name: 'epsilon' },
  { char: 'Ø', name: 'null' },
];

export default function SpecialCharacterPicker({
  onInsert,
  label = 'Insert a special character',
}: SpecialCharacterPickerProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // A popover that only closes by clicking its own trigger again is a trap on
  // a page with four of them; Escape and outside-click are the expected exits.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open]);

  return (
    <div className="relative inline-block" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        title={label}
        aria-expanded={open}
        className="btn btn-key"
        style={open ? { background: 'var(--ditto-wash)', borderColor: 'var(--ditto)', color: 'var(--ditto)' } : undefined}
      >
        α…
      </button>
      {open && (
        <div
          className="absolute z-20 mt-1 flex gap-0.5 p-1 panel"
          style={{ boxShadow: '0 4px 14px rgb(0 0 0 / 0.18)' }}
        >
          {CHARACTERS.map(({ char, name }) => (
            <button
              key={char}
              type="button"
              onClick={() => {
                onInsert(char);
                setOpen(false);
              }}
              title={name}
              aria-label={`Insert ${name}`}
              className="btn btn-key"
              style={{ border: 'none', background: 'transparent' }}
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
