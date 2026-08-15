import { Link } from 'react-router';
import LinkedFeatureTrees from '../components/hw-tools/LinkedFeatureTrees';
import RuleDiagram from '../components/hw-tools/RuleDiagram';
import { exampleTreeInstance } from '../data/hw-tools/exampleTree';
import { exampleRule } from '../data/hw-tools/exampleRule';

const noop = () => {};

export default function HwToolsOverview() {
  return (
    <main className="max-w-6xl mx-auto px-5 py-8">
      <header className="mb-6 max-w-2xl">
        <h1 className="u-display" style={{ fontSize: '1.6rem' }}>
          Homework tools
        </h1>
        <p className="u-note mt-2">
          Two builders for the notation LING 330 homework keeps asking for by hand. Pick one below.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/hw-tools/feature-geometry" className="panel p-5 flex flex-col gap-3 no-underline" style={{ color: 'inherit' }}>
          <h2 className="u-display" style={{ fontSize: '1.1rem' }}>
            Feature geometry trees
          </h2>
          <div className="canvas canvas-framed p-4 flex flex-1 items-center justify-center min-h-24">
            <LinkedFeatureTrees
              trees={[exampleTreeInstance]}
              links={[]}
              mode="export"
              linkModeActive={false}
              pendingLinkStart={null}
              insertModeActive={false}
              delinkingModeActive={false}
              deleteModeActive={false}
              onToggleNode={noop}
              onCycleLeaf={noop}
              onReorderSibling={noop}
              onNodeClick={noop}
              onRemoveLink={noop}
              onToggleInserted={noop}
              onToggleDelinked={noop}
              onToggleTreeDeleted={noop}
              label="Example feature geometry tree: strident coronal fricatives"
            />
          </div>
          <span className="btn btn-primary self-start">Open</span>
        </Link>

        <Link to="/hw-tools/rule-notation" className="panel p-5 flex flex-col gap-3 no-underline" style={{ color: 'inherit' }}>
          <h2 className="u-display" style={{ fontSize: '1.1rem' }}>
            Rule notation
          </h2>
          <div className="canvas canvas-framed p-4 flex flex-1 items-center justify-center min-h-24">
            <RuleDiagram rule={exampleRule} label="Example rule: intervocalic voicing" />
          </div>
          <span className="btn btn-primary self-start">Open</span>
        </Link>
      </div>
    </main>
  );
}
