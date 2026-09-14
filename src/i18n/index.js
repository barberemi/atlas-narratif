import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';

// FR bundled (fallback — doit être instantané)
import frCommon    from './locales/fr/common.json';
import frNarrative from './locales/fr/narrative.json';

i18n
  .use(resourcesToBackend((lng, ns) => import(`./locales/${lng}/${ns}.json`)))
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon, narrative: frNarrative },
    },
    partialBundledLanguages: true,
    fallbackLng: 'fr',
    defaultNS: 'common',
    ns: ['common', 'narrative'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'atlas_lang',
    },
  });

export default i18n;
