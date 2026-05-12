import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authClient } from '../../lib/authClient';
import { toast } from '../../lib/toast';

const COOLDOWN = 60; // secondes

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const email = state?.email;

  const [sending, setSending]     = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  async function handleResend() {
    if (!email || sending || countdown > 0) return;
    setSending(true);
    try {
      const { error } = await authClient.sendVerificationEmail({ email });
      if (error) {
        console.error('[resendVerification]', error.message, error);
        toast.error(t('authPages.resendError'));
        return;
      }
      toast.success(t('authPages.emailResent'));
      setCountdown(COOLDOWN);
    } catch {
      toast.error(t('authPages.resendError'));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
      <nav className="flex-shrink-0 flex items-center px-4 border-b border-white/10"
        style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)' }}>
        <Link to="/" className="text-sm font-black tracking-tight transition-opacity duration-150 hover:opacity-70">
          Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-6 text-center">

          <div className="text-5xl">&#9993;&#65039;</div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">{t('authPages.verifyEmailTitle')}</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              {t('authPages.verifyEmailDesc')}
              {email
                ? <span className="text-indigo-300 font-semibold">{email}</span>
                : t('authPages.verifyEmailDescFallback')
              }.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              {t('authPages.verifyEmailHint')}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {email && (
              <button
                onClick={handleResend}
                disabled={sending || countdown > 0}
                className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 flex items-center justify-center disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(63,81,181,0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99,102,241,0.3)',
                }}
              >
                {sending
                  ? t('authPages.resendingEmail')
                  : countdown > 0
                    ? t('authPages.resendEmailCountdown', { countdown })
                    : t('authPages.resendEmail')}
              </button>
            )}
            <Link
              to="/login"
              className="w-full py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200 flex items-center justify-center text-slate-500 hover:text-slate-300"
            >
              {t('authPages.backToLogin')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
