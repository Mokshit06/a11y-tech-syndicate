import { Rule } from '../utils/traverser';

const errorMessage = '<a> element does not have a discernible name';

const linksDiscernableName: Rule = {
  name: 'links-discernible-name',
  visitor: {
    a(node, context) {
      const noDiscernibleName =
        node.innerText.toLowerCase().includes('here') ||
        node.innerText.toLowerCase().includes('read more');

      if (noDiscernibleName) {
        context.report({
          node,
          message: errorMessage,
        });
      }
    },
  },
};

export default linksDiscernableName;
