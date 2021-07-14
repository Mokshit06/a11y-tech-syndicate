import detectLanguage from '../utils/detect-language';
import { Rule } from '../utils/traverser';

const errorMessage = '<html> elements must have the [lang] attribute.';

const htmlHasLang: Rule = {
  name: 'html-has-lang',
  visitor: {
    html(node, context) {
      const lang = node.getAttribute('lang');

      if (lang) return;

      context.report({
        node,
        message: errorMessage,
      });

      const langData = detectLanguage(node.innerText);

      if (!langData) return;

      const { code, language } = langData;

      node.setAttribute('lang', code);

      context.success({
        node,
        message: `\`${language}\` detected! <html> element [lang] attribute set to \`${code}\``,
      });
    },
  },
};

export default htmlHasLang;
