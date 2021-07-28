import { Rule } from '../utils/traverser';

const errorMessage = 'Element has a [tabindex] value greater than 0';
const successMessage =
  'Element does not have a [tabindex] value greater than 0';
const fixMessage = '[tabindex] attribute has been set to 0';

const noTabindex: Rule = {
  name: 'no-tabindex',
  visitor: {
    ALL_ELEMENTS(node: HTMLElement, context) {
      if (!node.tabIndex) return;

      if (node.tabIndex > 0) {
        context.warn({
          node,
          message: errorMessage,
        });

        node.tabIndex = 0;

        context.fix({
          node,
          message: fixMessage,
        });

        return;
      }

      // context.pass({
      //   node,
      //   message: successMessage,
      // });
    },
  },
};

export default noTabindex;
