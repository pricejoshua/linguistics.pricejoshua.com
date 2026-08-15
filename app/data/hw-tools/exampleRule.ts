import type { Rule } from '../../utils/hw-tools/ruleLayout';

export const exampleRule: Rule = {
  target: [{ kind: 'matrix', symbol: 'C', values: ['-voice'] }],
  change: [{ kind: 'matrix', values: ['+voice'] }],
  environmentLeft: [{ kind: 'text', value: 'V' }],
  environmentRight: [{ kind: 'text', value: 'V' }],
};
