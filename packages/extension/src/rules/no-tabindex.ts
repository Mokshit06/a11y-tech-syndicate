import { Rule } from '../utils/traverser';

const noTabindex: Rule = {
  name: 'no-tabindex',
  visitor: {
    ALL_ELEMENTS(node: HTMLElement, context) {
      if (!node.tabIndex) return;

      if (node.tabIndex > 0) {
        // not fixable as it
        // could cause navigation issues
        context.error({
          node,
          message: 'Element has a [tabindex] value greater than 0',
        });
      }
    },
  },
};

export default noTabindex;
