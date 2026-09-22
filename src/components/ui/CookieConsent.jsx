import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import cookieIcon from '../../assets/cookie-min.webp';
import { loadCrisp, unloadCrisp } from '../../utils/crisp';
import Button from './Button';

const LS_KEY = 'atlas_cookie_consent';

export default function CookieConsent({ hasAuthBar = false, onReady }) {
  const { t } = useTranslation();
  const [showBanner, setShowBanner] = useState(false);

  const open = useCallback(() => setShowBanner(true), []);

  useEffect(() => {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) { setShowBanner(true); }
    else {
      try {
        const consent = JSON.parse(raw);
        if (consent.accepted) loadCrisp(import.meta.env.VITE_CRISP_WEBSITE_ID);
      } catch { setShowBanner(true); }
    }
    // Expose open function to parent via onReady callback
    onReady?.(() => open);
  }, [onReady, open]);

  function handleAccept() {
    localStorage.setItem(LS_KEY, JSON.stringify({ accepted: true, timestamp: Date.now() }));
    loadCrisp(import.meta.env.VITE_CRISP_WEBSITE_ID);
    setShowBanner(false);
  }

  function handleRefuse() {
    localStorage.setItem(LS_KEY, JSON.stringify({ accepted: false, timestamp: Date.now() }));
    unloadCrisp();
    setShowBanner(false);
  }

  return (
    <div
      data-testid="cookie-banner"
      className={`fixed left-0 right-0 z-30 flex justify-center px-4 transition-all duration-300 ${hasAuthBar ? 'bottom-16' : 'bottom-6'}`}
      style={{ pointerEvents: showBanner ? 'auto' : 'none', opacity: showBanner ? 1 : 0, transform: showBanner ? 'translateY(0)' : 'translateY(20px)' }}
    >
      {/* Bande compacte : la carte verticale précédente montait sur ~500 px et
          recouvrait les CTA du hero sur mobile. Ici tout tient sur une bande. */}
      <div
        className="animate-fade-slide-in w-full max-w-3xl"
        style={{
          backgroundColor: 'var(--color-atlas-ink)',
          border: '1px solid var(--color-atlas-line)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Le logo tient une gouttière gauche sur toute la hauteur ; texte et
            boutons partagent la colonne de droite. Sans ça, en mobile, les
            boutons repassaient sous le logo et cassaient l'alignement. */}
        <div className="flex items-start gap-3 px-4 py-3">
          <img src={cookieIcon} alt="" aria-hidden="true" className="w-8 h-8 flex-shrink-0 object-contain" />

          <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
            <p className="flex-1 text-xs text-slate-400 leading-relaxed">
              <span className="font-serif text-sm font-semibold text-white">{t('cookie.title')}</span>{' '}
              {t('cookie.message')}{' '}
              <Link to="/privacy" className="text-atlas-green hover:underline">
                {t('cookie.privacyLink')}
              </Link>
            </p>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={handleRefuse} style={{ backgroundColor: 'var(--color-atlas-line2)' }}>
                {t('cookie.refuse')}
              </Button>
              <Button variant="primary" size="sm" onClick={handleAccept}>
                {t('cookie.accept')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
