import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DETECTOR_CATALOG } from '../../db/detectIncoherences';
import { SEVERITY_CONFIG }   from '../../data/severity_config';
const SEVERITY_ORDER  = { critical: 0, high: 1, medium: 2, low: 3 };

const sorted = [...DETECTOR_CATALOG].sort(
  (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
);

export default function DetectorCatalog({ onClose }) {
  const { t } = useTranslation();
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        style={{ backgroundColor: '#0f1e2e', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-white">{t('inc.catalogTitle')}</h2>
            <p className="text-xs text-slate-500 font-serif italic mt-0.5">
              {t('inc.catalogCount', { count: DETECTOR_CATALOG.length })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-white transition-colors"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            ✕
          </button>
        </div>

        {/* Liste */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-6 py-4 flex flex-col gap-2">
          {sorted.map(det => {
            const cfg = SEVERITY_CONFIG[det.severity];
            return (
              <div
                key={det.type}
                className="flex items-start gap-3 p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="text-lg leading-none mt-0.5 flex-shrink-0">{det.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-black text-slate-200">{t(`incType.${det.type}`, { defaultValue: det.type })}</span>
                    <span
                      className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: `${cfg.color}18`, color: cfg.color, border: `1px solid ${cfg.color}40` }}
                    >
                      {t(`severity.${det.severity}`)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-serif leading-relaxed">{t(`incDesc.${det.type}`, { defaultValue: det.description })}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
