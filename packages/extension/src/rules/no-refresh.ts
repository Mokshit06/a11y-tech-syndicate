import { Rule } from '../utils/traverser';

const noRefresh: Rule = {
  name: 'no-refresh',
  visitor: {
    head(node, context) {
      let meta!: HTMLMetaElement;

      const hasRefresh = [...node.children].some(child => {
        const httpEquiv = node.getAttribute('http-equiv');

        if (httpEquiv && httpEquiv == 'refresh') {
          meta = child as any;
          return true;
        }
      });

      if (!hasRefresh) {
        context.pass({
          node,
          message: 'The document does not use <meta http-equiv="refresh">',
        });

        return;
      }

      context.warn({
        node: meta,
        message: 'The document uses <meta http-equiv="refresh">',
      });

      node.removeAttribute('http-equiv');

      context.fix({
        node: meta,
        message: '<meta http-equiv="refresh"> removed from document',
      });
    },
  },
};

export default noRefresh;
