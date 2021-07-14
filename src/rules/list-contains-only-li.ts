import { Context, Rule } from '../utils/traverser';

const errorMessage =
  'List does not contain only <li> elements and script supporting elements (<script> and <template>)';
const successMessage = '';

const listRule = (
  node: HTMLUListElement | HTMLOListElement,
  context: Context
) => {
  const containsOnlyLi = [...node.children].every(child => {
    return ['script', 'template', 'li'].includes(child.localName);
  });

  if (!containsOnlyLi) {
    context.report({
      node,
      message: errorMessage,
    });
  }
};

const listContainsOnlyLi: Rule = {
  name: 'list-contains-only-li',
  visitor: {
    ul: listRule,
    ol: listRule,
  },
};

export default listContainsOnlyLi;
