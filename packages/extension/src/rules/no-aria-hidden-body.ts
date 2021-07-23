import { Rule } from '../utils/traverser';

const errorMessage = '<body> element should not have [aria-hidden="true"]';
const fixMessage = '[aria-hidden="true"] removed from <body> element';
const successMessage = '<body> element does not have [aria-hidden="true"]';

const noAriaHiddenBody: Rule = {
  name: 'no-aria-hidden-body',
  visitor: {
    body(node, context) {
      const ariaHidden = node.getAttribute('aria-hidden');

      if (ariaHidden !== null) {
        context.warn({
          node,
          message: errorMessage,
        });

        node.removeAttribute('aria-hidden');

        context.fix({
          node,
          message: fixMessage,
        });

        return;
      }

      context.pass({
        message: successMessage,
        node,
      });
    },
  },
};

export default noAriaHiddenBody;
