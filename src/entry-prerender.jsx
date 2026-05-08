/**
 * SSR entry point for prerendering public pages at build time.
 * Uses react-dom/server + MemoryRouter — no Chromium/Puppeteer needed.
 */
import { renderToString } from 'react-dom/server';
import { MemoryRouter } from 'react-router-dom';
import i18n from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';

import frCommon    from './i18n/locales/fr/common.json';
import frNarrative from './i18n/locales/fr/narrative.json';

import HomePageSEO  from './components/home/HomePageSEO';
import PrivacyPage  from './pages/legal/PrivacyPage';
import TermsPage    from './pages/legal/TermsPage';
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Dedicated i18n instance for SSR (no browser language detector)
const i18nSSR = i18n.createInstance();
i18nSSR.use(initReactI18next).init({
  lng: 'fr',
  resources: { fr: { common: frCommon, narrative: frNarrative } },
  defaultNS: 'common',
  ns: ['common', 'narrative'],
  interpolation: { escapeValue: false },
});

const routeMap = {
  '/':         HomePageSEO,
  '/privacy':  PrivacyPage,
  '/terms':    TermsPage,
  '/login':    LoginPage,
  '/register': RegisterPage,
};

export function render(url) {
  const Component = routeMap[url];
  if (!Component) return '';

  return renderToString(
    <I18nextProvider i18n={i18nSSR}>
      <MemoryRouter initialEntries={[url]}>
        <Component />
      </MemoryRouter>
    </I18nextProvider>
  );
}
