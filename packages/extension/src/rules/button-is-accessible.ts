import { Rule } from '../utils/traverser';

const errorMessage = 'Buttons do not have an accessible name';
const passMessage = 'Buttons have accessible name';

const buttonIsAccessible: Rule = {
  name: 'button-is-accessible',
  visitor: {
    button(node, context) {
      const ariaLabel = node.getAttribute('aria-label');
      const ariaLabelledBy = node.getAttribute('aria-labelledby');

      if (!node.innerText && !ariaLabel && !ariaLabelledBy && !node.title) {
        context.error({
          node,
          message: errorMessage,
        });

        return;
      }

      if (ariaLabelledBy) {
        const labelledBy = document.querySelector(
          `[aria-labelledby="${ariaLabelledBy}"]`
        ) as HTMLElement;

        if (!labelledBy || !labelledBy.innerText) {
          context.error({
            node,
            message: errorMessage,
          });
          return;
        }
      }

      context.pass({
        node,
        message: passMessage,
      });
    },
  },
};

export default buttonIsAccessible;
