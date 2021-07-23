import detectLanguage from '../utils/detect-language';
import { Rule } from '../utils/traverser';

const errorMessage = '<html> elements must have the [lang] attribute.';

const htmlHasLang: Rule = {
  name: 'html-has-lang',
  visitor: {
    html(node, context) {
      const lang = node.getAttribute('lang');

      if (lang) {
        context.pass({
          node,
          message: '<html> elements have the [lang] attribute.',
        });

        return;
      }

      // `innerText` might be empty string
      // if website is server rendered and is using react
      // because react wouldn't be able to match server html
      // and would cause rerender which would remove the nodes
      const langData = detectLanguage(
        node.innerText ? node.innerText : document.body?.textContent!
      );

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
    },
  },
};

export default htmlHasLang;
