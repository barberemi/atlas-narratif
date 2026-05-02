import { useEffect } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { useTourStore } from '../../stores/useTourStore';
import { markWelcomeSeen } from './tourUtils';

export default function WelcomeModal({ projectId, onClose }) {
  const { t } = useTranslation();
  const start  = useTourStore(s => s.start);
  const isDemo = projectId?.startsWith('lotr');

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') { markWelcomeSeen(projectId); onClose(); } };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose, projectId]);

  const handleStartTour = () => {
    markWelcomeSeen(projectId);
    onClose();
    start(0);
  };

  const handleSkip = () => {
    markWelcomeSeen(projectId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 8000, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      aria-hidden="true"
      onClick={handleSkip}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('welcome.title')}
        className="flex flex-col gap-6 max-w-md w-full mx-4 rounded-2xl p-8"
        style={{ backgroundColor: 'rgba(11,22,33,0.98)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-5xl text-center">🗺️</div>

        <div className="text-center">
          <h2 className="text-xl font-black text-slate-100 mb-2">
            {t('welcome.title')}<span style={{ color: '#3F51B5' }}>Narratif</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-serif italic">
            {isDemo
              ? <Trans i18nKey="welcome.demoSubtitle" components={{ strong: <strong /> }} />
              : t('welcome.projectSubtitle')}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { icon: '📊', label: t('welcome.feature1') },
            { icon: '🌍', label: t('welcome.feature2') },
            { icon: '🐱', label: t('welcome.feature3') },
            { icon: '🧵', label: t('welcome.feature4') },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-xs text-slate-400">
              <span className="text-base flex-shrink-0">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleStartTour}
            className="w-full py-3 rounded-xl text-sm font-black transition-all duration-200"
            style={{ backgroundColor: 'rgba(63,81,181,0.25)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' }}
          >
            {t('btn.startTour')}
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            {t('btn.exploreSolo')}
          </button>
        </div>
      </div>
    </div>
  );
}
