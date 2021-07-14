// @ts-ignore
import { nameToCode2, nameToCode3 } from 'languagedetect/lib/ISO639';

export default function langToCode(lang: string) {
  return nameToCode2[lang] || nameToCode3[lang];
}
