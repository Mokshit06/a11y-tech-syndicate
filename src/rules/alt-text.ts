import { Rule } from '../utils/traverser';

function hasValue(value: any) {
  if (value === undefined) {
    return false;
  }
  if (typeof value === 'string' && value.length === 0) {
    return false;
  }
  return true;
}

function generateAltText(src: string) {
  return '';
}

const altText: Rule = {
  name: 'alt-text',
  visitor: {
    img(node, context) {
      const alt = node.getAttribute('alt');

      if (alt === null) {
        if (node.getAttribute('role') === 'presentation') {
          context.report({
            node,
            message:
              'Prefer alt="" over a presentational role. First rule of aria is to not use aria if it can be achieved via native HTML.',
          });

          node.alt = '';
          node.removeAttribute('role');

          context.success({
            node,
            message: `Generated alt text for ${node.src}`,
          });

          return;
        }

        const ariaLabel = node.getAttribute('aria-label');

        if (ariaLabel !== null) {
          if (!hasValue(ariaLabel)) {
            context.report({
              node,
              message:
                'The aria-label attribute must have a value. The alt attribute is preferred over aria-label for images.',
            });

            node.setAttribute('aria-label', generateAltText(node.src));
          }
          return;
        }

        const ariaLabelledby = node.getAttribute('aria-labelledby');

        if (ariaLabelledby !== null) {
          if (!hasValue(ariaLabelledby)) {
            context.report({
              node,
              message:
                'The aria-labelledby attribute must have a value. The alt attribute is preferred over aria-labelledby for images.',
            });
          }
          return;
        }

        context.report({
          node,
          message: `<img /> elements must have an alt prop, either with meaningful text, or an empty string for decorative images.`,
        });

        node.alt = '';

        context.success({
          node,
          message: `Generated a meaningful alt text!`,
        });

        return;
      }
    },
    object(node, context) {
      const ariaLabel = node.getAttribute('aria-label');
      const arialLabelledBy = node.getAttribute('aria-labelledby');
      const hasLabel = hasValue(ariaLabel) || hasValue(arialLabelledBy);
      const titleProp = node.getAttribute('title');
      const hasTitleAttr = !!titleProp;

      if (hasLabel || hasTitleAttr) {
        return;
      }

      node.setAttribute('aria-label', 'Unspecified source');

      context.report({
        node,
        message:
          'Embedded <object> elements must have alternative text by providing inner text, aria-label or aria-labelledby props.',
      });
    },
    area(node, context) {
      const ariaLabelProp = node.getAttribute('aria-label');
      const arialLabelledByProp = node.getAttribute('aria-labelledby');
      const hasLabel = hasValue(ariaLabelProp) || hasValue(arialLabelledByProp);

      if (hasLabel) {
        return;
      }

      const altProp = node.getAttribute('alt');
      if (altProp === undefined) {
        context.report({
          node,
          message:
            'Each area of an image map must have a text alternative through the `alt`, `aria-label`, or `aria-labelledby` attribute.',
        });

        node.setAttribute('alt', 'Unspecified source');
        return;
      }

      const isNullValued = altProp === null; // <area alt />

      if ((altProp && !isNullValued) || altProp === '') {
        return;
      }

      context.report({
        node,
        message:
          'Each area of an image map must have a text alternative through the `alt`, `aria-label`, or `aria-labelledby` attribute.',
      });
    },
  },
};

export default altText;
