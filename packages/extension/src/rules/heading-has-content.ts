import isHiddenFromScreenReader from '../utils/hidden-from-screen-reader';
import { Context, Rule } from '../utils/traverser';

const errorMessage =
  'Headings must have content and the content must be accessible by a screen reader.';
const successMessage = 'Removed empty heading element';

const headingRule = (node: HTMLHeadingElement, context: Context) => {
  if (isHiddenFromScreenReader(node)) return;

  if (!node.innerText) {
    context.warn({
      message: errorMessage,
      node,
    });

    node.remove();

    context.success({
      node,
      message: successMessage,
    });
  }
};

const headingHasContent: Rule = {
  name: 'heading-has-content',
  visitor: {
    h1: headingRule,
    h2: headingRule,
    h3: headingRule,
    h4: headingRule,
    h5: headingRule,
    h6: headingRule,
  },
};

export default headingHasContent;
