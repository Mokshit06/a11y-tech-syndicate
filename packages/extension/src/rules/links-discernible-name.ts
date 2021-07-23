import { Rule } from '../utils/traverser';

const errorMessage = 'Links do not have a discernible name';
const successMessage = 'Links have a discernible name';

const linksDiscernableName: Rule = {
  name: 'links-discernible-name',
  visitor: {
    a(node, context) {
      const noDiscernibleName =
        node.innerText.toLowerCase().includes('here') ||
        node.innerText.toLowerCase().includes('read more');

      if (noDiscernibleName) {
        context.error({
          node,
          message: errorMessage,
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

export default linksDiscernableName;
