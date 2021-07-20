import { Context, Rule } from '../utils/traverser';

const errorMessage = 'Form elements do not have associated labels';

const formLabelRule = (
  node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  context: Context
) => {
  const parentIsLabel = node.parentElement?.localName === 'label';

  if (parentIsLabel) return;

  if (!node.id) {
    context.error({
      node,
      message: errorMessage,
    });

    return;
  }

  const hasForLabel = document.querySelector(`label[for=${node.id}]`);

  if (hasForLabel) return;

  context.error({
    node,
    message: errorMessage,
  });
};

const formAssociatedLabels: Rule = {
  name: 'form-associated-labels',
  visitor: {
    input: formLabelRule,
    select: formLabelRule,
    textarea: formLabelRule,
  },
};

export default formAssociatedLabels;
