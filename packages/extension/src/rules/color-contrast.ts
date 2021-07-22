import { Rule } from '../utils/traverser';

const colorContrast: Rule = {
  name: 'color-contrast',
  visitor: {
    ALL_ELEMENTS(node, context) {},
  },
};

export default colorContrast;
