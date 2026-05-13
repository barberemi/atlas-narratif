import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import cookieIcon from '../../assets/cookie-min.webp';
import { loadCrisp, unloadCrisp } from '../../utils/crisp';

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
          className="w-full rounded-2xl overflow-hidden"
          style={{
            backgroundColor: '#0f172a',
            border: '1px solid rgba(99,102,241,0.2)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}
        >
          <div className="flex justify-center pt-5 pb-2">
            <img src={cookieIcon} alt="cookie-logo" className="w-19 h-16 drop-shadow-lg" />
          </div>
          <div className="px-6 pb-5 text-center">
            <h3 className="text-base font-black text-white mb-2">{t('cookie.title')}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {t('cookie.message')}{' '}
              <Link to="/privacy" className="text-indigo-400 hover:underline">
                {t('cookie.privacyLink')}
              </Link>
            </p>
          </div>
        </div>

        {/* Boutons */}
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={handleRefuse}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 cursor-pointer transition-all duration-200 hover:text-slate-200"
            style={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {t('cookie.refuse')}
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all duration-200"
            style={{ backgroundColor: '#3F51B5', color: '#fff', border: '1px solid #5c6bc0' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#4a5bc7'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#3F51B5'; }}
          >
            {t('cookie.accept')}
          </button>
        </div>
      </div>
    </div>
  );
}
