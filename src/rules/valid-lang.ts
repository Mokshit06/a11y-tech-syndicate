import { Rule } from '../utils/traverser';
import langToCode from '../utils/lang-to-code';
import codeToLang from '../utils/code-to-lang';

const errorMessage = '<html> element must have valid [lang] attribute';

const validLang: Rule = {
  name: 'valid-lang',
  visitor: {
    html(node, context) {
      const lang = node.lang || node.getAttribute('lang');

      if (!lang) return;

      const isValidLang = codeToLang(lang);

      if (isValidLang) return;

      context.report({
        node,
        message: errorMessage,
      });

      const langCode = langToCode(lang.toLowerCase());

      if (!langCode) return;

      node.setAttribute('lang', langCode);

      context.success({
        node,
        message: `<html> element [lang] attribute set to \`${langCode}\``,
      });
    },
  },
};

export default validLang;
