import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { loadGlossaryEntry, getFirstSentence } from '~/utils/glossary';

interface TermLinkProps {
  slug: string;
  label: string;
}

export default function TermLink({ slug, label }: TermLinkProps) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const entry = loadGlossaryEntry(slug);

  const open_ = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const close_ = () => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => { if (closeTimer.current) clearTimeout(closeTimer.current); }, []);

  if (!entry) {
    return (
      <span className="underline decoration-dotted text-blue-700 dark:text-blue-400">{label}</span>
    );
  }

  return (
    <span className="relative inline-block">
      <span
        className="underline decoration-dotted cursor-pointer text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-200"
        onMouseEnter={open_}
        onMouseLeave={close_}
      >
        {label}
      </span>
      {open && (
        <div
          onMouseEnter={open_}
          onMouseLeave={close_}
          className="absolute z-50 bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 text-sm text-gray-800 dark:text-gray-200"
        >
          <p className="font-semibold mb-1">{entry.title}</p>
          <p className="mb-2 leading-snug">{getFirstSentence(entry.definition)}</p>
          <Link
            to={`/glossary/${slug}`}
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs font-medium"
          >
            view full entry →
          </Link>
        </div>
      )}
    </span>
  );
}
