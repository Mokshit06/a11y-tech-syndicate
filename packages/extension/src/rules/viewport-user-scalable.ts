import { Rule } from '../utils/traverser';

const viewportUserScalable: Rule = {
  name: 'viewport-user-scalable',
  visitor: {
    meta(node, context) {
      if (node.name !== 'viewport') return;

      const userScalable = node.getAttribute('user-scalable');

      if (userScalable === 'no') {
        context.warn({
          node,
          message:
            '[user-scalable="no"] is used in the <meta name="viewport"> element',
        });

        node.removeAttribute('user-scalable');

        context.fix({
          node,
          message: '',
        });
      }

      const maximumScale = node.getAttribute('maximum-scale');

      if (!maximumScale) return;

      if (Number(maximumScale) < 5) {
        context.warn({
          node,
          message: '[maximum-scale] attribute is less than 5.',
        });

        node.removeAttribute('maximum-scale');

        context.fix({
          node,
          message: '',
        });
      }
    },
  },
};

export default viewportUserScalable;
