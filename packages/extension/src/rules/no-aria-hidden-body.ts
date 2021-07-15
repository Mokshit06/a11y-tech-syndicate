import { Rule } from '../utils/traverser';

const errorMessage = '<body> element should not have [aria-hidden="true"]';
const successMessage = '[aria-hidden="true"] removed from <body> element';

const noAriaHiddenBody: Rule = {
  name: 'no-aria-hidden-body',
  visitor: {
    body(node, context) {
      const ariaHidden = node.getAttribute('aria-hidden');

      if (ariaHidden !== null) {
        context.report({
          node,
          message: errorMessage,
        });

        node.removeAttribute('aria-hidden');

        context.success({
          node,
          message: successMessage,
        });
      }
    },
  },
};

export default noAriaHiddenBody;
