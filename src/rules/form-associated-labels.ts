import { Context, Rule } from '../utils/traverser';

const formLabelRule = (
  node: HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  context: Context
) => {
  const parentIsLabel = node.parentElement?.localName === 'label';

  if (parentIsLabel) return;

  const hasForLabel = document.querySelector(`label[for=${node.id}]`);

  if (hasForLabel) return;

  context.report({
    node,
    message: 'Form elements do not have associated labels',
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
