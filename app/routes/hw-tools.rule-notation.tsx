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
  const filled = hasContent(rule);

  return (
    <main className="max-w-6xl mx-auto px-5 py-8">
      <header className="mb-6 max-w-2xl">
        <h1 className="u-display" style={{ fontSize: '1.6rem' }}>
          Rule notation
        </h1>
        <p className="u-note mt-2">
          Fill in the four zones of the rule. The arrow, slash and blank are already in place — the
          editor below is laid out in the shape of the rule you are writing.
        </p>
      </header>

      {/*
        Output first. The rendered rule is the thing being made, so it sits at
        the top where the eye lands and stays visible while the zones below are
        edited. It is pinned white in both themes because it is a preview of
        the document page it is headed for.
      */}
      <section className="mb-5">
        <h2 className="u-label mb-2">Your rule</h2>
        <div className="canvas canvas-framed p-6 flex items-center min-h-24">
          {/* Always mounted so the export ref is populated whenever the export
              buttons are live. An empty rule simply draws nothing. */}
          <RuleDiagram ref={exportRef} rule={rule} label="Rule notation preview" />
          {!filled && (
            <p className="u-note">
              Nothing yet. Add a symbol or a feature matrix to a zone below and it appears here.
            </p>
          )}
        </div>
      </section>

      <RuleBuilder rule={rule} onChange={setRule} />

      <div className="flex flex-wrap items-center gap-2 mt-5">
        <ExportControls svgRef={exportRef} disabled={!filled} filenameBase="rule-notation" />
        <button type="button" onClick={() => setRule(emptyRule())} className="btn btn-danger ml-auto">
          Clear everything
        </button>
      </div>

      <p className="u-note mt-2">
        Nothing here is saved. Copy or download your work before you leave the page.
      </p>
    </main>
  );
}
