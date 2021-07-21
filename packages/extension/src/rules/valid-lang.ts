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

      const langCode = langToCode(lang.toLowerCase());

      if (!langCode) {
        context.error({
          node,
          message: errorMessage,
        });

        return;
      }

      context.warn({
        node,
        message: errorMessage,
      });

      node.setAttribute('lang', langCode);

      context.fix({
        node,
        message: `<html> element [lang] attribute set to \`${langCode}\``,
      });
    },
  },
};

export default validLang;
