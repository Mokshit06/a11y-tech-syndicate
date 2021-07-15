import { liReset } from '../reset.css';
import { Context, Rule } from '../utils/traverser';

const errorMessage =
  'List does not contain only <li> elements and script supporting elements (<script> and <template>)';
const getSuccessMessage = (name: string) => {
  return `<${name}> replaced with <li>`;
};

function isValidChild(localName: string) {
  return ['script', 'template', 'li'].includes(localName);
}

type ListElement = HTMLUListElement | HTMLOListElement;

function listRule(node: ListElement, context: Context) {
  const children = [...node.children] as ListElement[];
  const containsOnlyLi = children.every(child => {
    return isValidChild(child.localName);
  });

  if (!containsOnlyLi) {
    context.report({
      node,
      message: errorMessage,
    });

    children.forEach(child => {
      // might not work with some elements
      if (!isValidChild(child.localName)) {
        const li = document.createElement('li');

        for (const key in child) {
          if (key === 'eventListeners') continue;
          if (key in li) {
            try {
              (li as any)[key] = (child as any)[key];
            } catch {}
          } else {
            li.setAttribute(key, (child as any)[key]);
          }
        }

        li.style.cssText = child.style.cssText;
        li.className = `${child.className} ${liReset}`;

        const allEventListeners = child.getEventListeners()!;

        for (const [type, listeners] of Object.entries(allEventListeners)) {
          for (const listener of listeners) {
            li.addEventListener(type, listener.listener, listener.options);
          }
        }

        li.innerHTML = child.innerHTML;

        child.replaceWith(li);

        context.success({
          node,
          message: getSuccessMessage(child.localName),
        });
      }
    });
  }
}

const listContainsOnlyLi: Rule = {
  name: 'list-contains-only-li',
  visitor: {
    ul: listRule,
    ol: listRule,
  },
};

export default listContainsOnlyLi;
