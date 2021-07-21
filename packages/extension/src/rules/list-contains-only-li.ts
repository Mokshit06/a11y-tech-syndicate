import '../li-reset.css';
import { Context, Rule } from '../utils/traverser';

const errorMessage =
  'Lists do not contain only <li> elements and script supporting elements (<script> and <template>)';
const getSuccessMessage = (name: string) => {
  return `<${name}> replaced with <li>`;
};

function isValidChild(localName: string) {
  return ['script', 'template', 'li'].includes(localName);
}

type ListElement = HTMLUListElement | HTMLOListElement;

function listRule(node: ListElement, context: Context) {
  const children = [...node.children] as HTMLLIElement[];
  const containsOnlyLi = children.every(child => {
    return isValidChild(child.localName);
  });

  if (!containsOnlyLi) {
    context.error({
      node,
      message: errorMessage,
    });
  }
}

function listObserverRule(node: ListElement, context: Context) {
  listRule(node, context);

  const mutationObserver = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList') {
        const children = [...mutation.addedNodes] as ListElement[];

        const containsOnlyLi = children.every(child => {
          return isValidChild(child.localName);
        });

        if (!containsOnlyLi) {
          context.error({
            node,
            message: errorMessage,
          });
        }
      }
    }
  });

  mutationObserver.observe(node, {
    childList: true,
    attributes: true,
    subtree: true,
  });
}

const listContainsOnlyLi: Rule = {
  name: 'list-contains-only-li',
  visitor: {
    ul: listObserverRule,
    ol: listObserverRule,
  },
};

export default listContainsOnlyLi;
