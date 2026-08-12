import { useState } from 'react';

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
const CHARACTERS = ['α', 'β', 'γ', 'δ', 'ε', 'Ø'];

export default function SpecialCharacterPicker({ onInsert, label = 'Special characters' }: SpecialCharacterPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-expanded={open}
        className="px-2 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        α…
      </button>
      {open && (
        <div className="absolute z-10 mt-1 flex gap-1 p-1 rounded border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-md">
          {CHARACTERS.map((char) => (
            <button
              key={char}
              type="button"
              onClick={() => {
                onInsert(char);
                setOpen(false);
              }}
              className="w-7 h-7 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {char}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
