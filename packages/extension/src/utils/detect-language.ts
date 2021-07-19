import LanguageDetect from 'languagedetect';
import langToCode from './lang-to-code';

// TODO change impl to use gcp translation api / chrome.i18n
const langDetector = new LanguageDetect();

export default function detectLanguage(text: string) {
  const [pageLang] = langDetector.detect(text, 1);
  if (!pageLang) return;

  const langCode = langToCode(pageLang[0]);

  return { code: langCode, language: pageLang[0] };
}
