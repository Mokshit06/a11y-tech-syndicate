import { Rule } from '../utils/traverser';

const errorMessage = 'document should have <title> element';

const documentHasTitle: Rule = {
  name: 'document-has-title',
  visitor: {
    head(node, context) {
      const hasTitle = [...node.children].some(child => {
        return child.localName === 'title' && child.innerHTML !== '';
      });

      if (!hasTitle) {
        context.error({
          node,
          message: errorMessage,
        });
      }
    },
  },
};

export default documentHasTitle;
