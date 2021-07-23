import { Context, Rule } from '../utils/traverser';

function hasValue(value: any) {
  if (value === undefined) {
    return false;
  }
  if (typeof value === 'string' && value.length === 0) {
    return false;
  }
  return true;
}

async function generateAltText(src: string) {
  try {
    const res = await fetch(
      `${process.env.API_ENDPOINT}/description?url=${encodeURIComponent(src)}`
    );

    if (!res.ok) throw new Error();

    const description = await res.text();

    return description;
  } catch {
    return '';
  }
}

const imgRule = async (node: HTMLImageElement, context: Context) => {
  const alt = node.getAttribute('alt');

  if (alt !== null) {
    context.pass({
      node,
      message: '<img> elements have [alt] attributes',
    });

    return;
  }

  if (node.getAttribute('role') === 'presentation') {
    context.warn({
      node,
      message:
        'Prefer alt="" over a presentational role. First rule of aria is to not use aria if it can be achieved via native HTML.',
    });

    node.alt = '';
    node.removeAttribute('role');

    context.fix({
      node,
      message: `Generated alt text for ${node.src}`,
    });

    return;
  }

  const ariaLabel = node.getAttribute('aria-label');

  if (ariaLabel !== null) {
    if (!hasValue(ariaLabel)) {
      try {
        const altText = await generateAltText(node.src);

        context.warn({
          node,
          message:
            'The aria-label attribute must have a value. The alt attribute is preferred over aria-label for images.',
        });

        node.setAttribute('aria-label', altText);
      } catch {
        context.error({
          node,
          message:
            'The aria-label attribute must have a value. The alt attribute is preferred over aria-label for images.',
        });
      }
    }
    return;
  }

  const ariaLabelledby = node.getAttribute('aria-labelledby');

  if (ariaLabelledby !== null) {
    if (!hasValue(ariaLabelledby)) {
      context.error({
        node,
        message:
          'The aria-labelledby attribute must have a value. The alt attribute is preferred over aria-labelledby for images.',
      });
    }
    return;
  }

  try {
    const altText = await generateAltText(node.src);
    node.alt = altText;

    context.warn({
      node,
      message: `<img> elements must have an alt prop, either with meaningful text, or an empty string for decorative images.`,
    });

    context.fix({
      node,
      message: `Generated a meaningful alt text!`,
    });
  } catch {
    context.error({
      node,
      message: `<img /> elements must have an alt prop, either with meaningful text, or an empty string for decorative images.`,
    });
  }
};

const altText: Rule = {
  name: 'alt-text',
  visitor: {
    img(node, context) {
      imgRule(node, context);

      const mutationObserver = new MutationObserver(mutations => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes') {
            // was added by this rule
            if (
              mutation.attributeName === 'alt' &&
              mutation.oldValue === null
            ) {
              continue;
            }

            imgRule(node, context);
          }
        }
      });

      mutationObserver.observe(node, {
        attributes: true,
        attributeOldValue: true,
      });
    },
    object(node, context) {
      const ariaLabel = node.getAttribute('aria-label');
      const arialLabelledBy = node.getAttribute('aria-labelledby');
      const hasLabel = hasValue(ariaLabel) || hasValue(arialLabelledBy);
      const titleProp = node.getAttribute('title');
      const hasTitleAttr = !!titleProp;

      if (hasLabel || hasTitleAttr) {
        context.pass({
          node,
          message: '<object> elements have [alt] text',
        });
        return;
      }

      node.setAttribute('aria-label', 'Unspecified source');

      context.error({
        node,
        message: '<object> elements do not have [alt] text',
      });
    },
    area(node, context) {
      const ariaLabelProp = node.getAttribute('aria-label');
      const arialLabelledByProp = node.getAttribute('aria-labelledby');
      const hasLabel = hasValue(ariaLabelProp) || hasValue(arialLabelledByProp);

      if (hasLabel) {
        context.pass({
          node,
          message: '',
        });

        return;
      }

      const altProp = node.getAttribute('alt');
      if (altProp === undefined) {
        context.error({
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

      context.error({
        node,
        message:
          'Each area of an image map must have a text alternative through the `alt`, `aria-label`, or `aria-labelledby` attribute.',
      });
    },
  },
};

export default altText;
