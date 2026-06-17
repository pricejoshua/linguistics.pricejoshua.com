/// <reference types="vite/client" />
import type { GlossaryEntry, GlossaryIndexEntry } from '~/types/glossary';
import indexData from '~/data/glossary/index.json';

const entryModules = import.meta.glob<{ default: GlossaryEntry }>(
  '../data/glossary/entries/*.json',
  { eager: true }
);

export function loadGlossaryIndex(): GlossaryIndexEntry[] {
  return indexData as GlossaryIndexEntry[];
}

export function loadGlossaryEntry(slug: string): GlossaryEntry | null {
  const key = Object.keys(entryModules).find(k => k.endsWith(`/${slug}.json`));
  if (!key) return null;
  return entryModules[key].default as GlossaryEntry;
}

export function getFirstSentence(definition: string): string {
  const stripped = definition.replace(/\[term:[^\]]+\]/g, (match) => {
    return match.slice(6, -1).replace(/-/g, ' ');
  });
  const m = stripped.match(/^[^.!?]+[.!?]/);
  return m ? m[0] : stripped;
}

export function parseDefinition(
  definition: string
): Array<{ type: 'text' | 'term'; value: string; slug?: string }> {
  const parts: Array<{ type: 'text' | 'term'; value: string; slug?: string }> = [];
  const regex = /\[term:([^\]]+)\]/g;
  let last = 0;
  let match;
  while ((match = regex.exec(definition)) !== null) {
    if (match.index > last) {
      parts.push({ type: 'text', value: definition.slice(last, match.index) });
    }
    const slug = match[1];
    parts.push({ type: 'term', value: slug.replace(/-/g, ' '), slug });
    last = match.index + match[0].length;
  }
  if (last < definition.length) {
    parts.push({ type: 'text', value: definition.slice(last) });
  }
  return parts;
}
