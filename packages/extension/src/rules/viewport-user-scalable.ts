import { Rule } from '../utils/traverser';

const errorMessage =
  '[user-scalable="no"] is used in <meta name="viewport"> element';
const fixMessage = '[user-scalable="no"] removed from <meta name="viewport">';
const successMessage =
  '[user-scalable="no"] is not used in <meta name="viewport">';

const viewportUserScalable: Rule = {
  name: 'viewport-user-scalable',
  visitor: {
    meta(node, context) {
      if (node.name !== 'viewport') return;

      const userScalable = node.getAttribute('user-scalable');

      if (userScalable === 'no') {
        context.warn({
          node,
          message: errorMessage,
        });

        node.removeAttribute('user-scalable');

        context.fix({
          node,
          message: fixMessage,
        });

        return;
      }

      const maximumScale = node.getAttribute('maximum-scale');

      if (maximumScale && Number(maximumScale) < 5) {
        context.warn({
          node,
          message: '[maximum-scale] attribute is less than 5.',
        });

        node.removeAttribute('maximum-scale');

        context.fix({
          node,
          message: '[maximum-scale] attribute has been removed',
        });

        return;
      }

      context.pass({
        node,
        message: successMessage,
      });
    },
  },
};

export default viewportUserScalable;
