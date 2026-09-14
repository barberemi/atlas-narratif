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
      <div className="animate-fade-slide-in flex flex-col items-center gap-3 w-full max-w-sm">

        {/* Card */}
        <div
          className="w-full rounded-none overflow-hidden"
          style={{
            backgroundColor: 'var(--color-atlas-ink)',
            border: '1px solid var(--color-atlas-line)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="flex justify-center pt-5 pb-2">
            <img src={cookieIcon} alt="cookie-logo" className="w-19 h-16 drop-shadow-lg" />
          </div>
          <div className="px-6 pb-5 text-center">
            <h3 className="font-serif text-lg font-semibold text-white mb-2">{t('cookie.title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('cookie.message')}{' '}
              <Link to="/privacy" className="text-atlas-green hover:underline">
                {t('cookie.privacyLink')}
              </Link>
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 w-full">
          <Button variant="ghost" fullWidth onClick={handleRefuse} style={{ backgroundColor: 'var(--color-atlas-line2)' }}>
            {t('cookie.refuse')}
          </Button>
          <Button variant="primary" fullWidth onClick={handleAccept}>
            {t('cookie.accept')}
          </Button>
        </div>
      </div>
    </div>
  );
}
