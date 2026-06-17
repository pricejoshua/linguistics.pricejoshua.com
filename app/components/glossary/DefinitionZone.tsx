import { parseDefinition } from '~/utils/glossary';
import TermLink from './TermLink';

interface DefinitionZoneProps {
  definition: string;
}

export default function DefinitionZone({ definition }: DefinitionZoneProps) {
  const parts = parseDefinition(definition);
  return (
    <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-base">
      {parts.map((part, i) =>
        part.type === 'term' && part.slug ? (
          <TermLink key={i} slug={part.slug} label={part.value} />
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </p>
  );
}
