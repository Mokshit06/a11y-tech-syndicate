import detectLanguage from '../utils/detect-language';
import { Rule } from '../utils/traverser';

const errorMessage = '<html> elements must have the [lang] attribute.';

const htmlHasLang: Rule = {
  name: 'html-has-lang',
  visitor: {
    html(node, context) {
      const lang = node.getAttribute('lang');

      if (lang) return;

      setTimeout(() => {
        const langData = detectLanguage(node.innerText);

        console.log(node.innerText);

        if (!langData) {
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

        const { code, language } = langData;

        node.setAttribute('lang', code);

        context.fix({
          node,
          message: `\`${language}\` detected! <html> element [lang] attribute set to \`${code}\``,
        });
      }, 50);
    },
  },
};

export default htmlHasLang;
