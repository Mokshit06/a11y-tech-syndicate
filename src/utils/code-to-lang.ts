// @ts-ignore
import { code2ToName, code3ToName } from 'languagedetect/lib/ISO639';

export default function codeToLang(code: string) {
  return code2ToName[code] || code3ToName[code];
}
