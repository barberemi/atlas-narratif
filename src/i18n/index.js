import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import frCommon    from './locales/fr/common.json';
import frNarrative from './locales/fr/narrative.json';
import enCommon    from './locales/en/common.json';
import enNarrative from './locales/en/narrative.json';
import zhCommon    from './locales/zh/common.json';
import zhNarrative from './locales/zh/narrative.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      fr: { common: frCommon, narrative: frNarrative },
      en: { common: enCommon, narrative: enNarrative },
      zh: { common: zhCommon, narrative: zhNarrative },
    },
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
