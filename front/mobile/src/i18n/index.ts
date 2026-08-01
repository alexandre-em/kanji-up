import i18n, { ModuleType } from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as RNLocalize from 'react-native-localize';

import { LANGUAGE_OVERRIDE_KEY } from '../constants/storage';
import { fileServiceInstance } from '../services/file';
import en from './locales/en.json';
import fr from './locales/fr.json';

const resources = {
  en: { translation: en },
  fr: { translation: fr },
};

// Single source of truth for the language picker in Settings — adding a language only means
// adding it here and to `resources` above, each label comes from `settings.language.<code>`
export const SUPPORTED_LANGUAGES = Object.keys(resources);

// A language picked manually in Settings must survive app restarts, otherwise it silently
// reverts to the device locale on next launch — this is what makes that choice stick
const languageDetector = {
  type: 'languageDetector' as ModuleType,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    const stored = await fileServiceInstance.read(LANGUAGE_OVERRIDE_KEY);
    if (stored) {
      callback(stored);
      return;
    }
    const locales = RNLocalize.getLocales();
    callback(locales[0]?.languageTag || 'en');
  },
  init: () => {},
  cacheUserLanguage: (lang: string) => {
    fileServiceInstance.write(LANGUAGE_OVERRIDE_KEY, lang);
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
