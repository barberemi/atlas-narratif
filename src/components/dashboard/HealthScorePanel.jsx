import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { VIZ_STATUS } from '../../data/viz_palette';
import Icon from '../ui/Icon';

// Couleur d'un axe selon son avancement (même échelle que CircularGauge).
function axisColor(score) {
  return score >= 80 ? VIZ_STATUS.ok
    : score >= 50 ? VIZ_STATUS.warn
    : score >= 25 ? VIZ_STATUS.serious
    : VIZ_STATUS.crit;
}

// ── HealthScorePanel ──────────────────────────────────────────────────────────
// Panneau « diagnostic » du score de santé narrative. Recadre le score en
// diagnostic plutôt qu'en note : montre sa composition (chaque axe pondéré) et
// propose les leviers à plus fort potentiel de gain, chacun ouvrant sa vue.
// `parts` : [{ key, titleKey, score, weight, gain, path }] — gain = points que
// le score global gagnerait si cet axe passait à 100 (poids × marge / poids total).
export default function HealthScorePanel({ parts, onNavigate, onClose }) {
  const { t } = useTranslation();

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const levers = parts
    .filter(p => p.gain > 0 && p.path)
    .sort((a, b) => b.gain - a.gain)
    .slice(0, 3);

  return (
    <div
      role="dialog"
      aria-label={t('dashboard.scoreDiagnosisKicker')}
      className="absolute right-0 top-full mt-3 w-80 max-w-[calc(100vw-2rem)] rounded-none p-4 text-left shadow-2xl z-50"
      style={{ backgroundColor: '#15171b', border: '1px solid var(--color-atlas-line)' }}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="font-grotesk text-[10px] uppercase tracking-[0.18em] text-atlas-gold">
          {t('dashboard.scoreDiagnosisKicker')}
        </p>
        <button
          onClick={onClose}
          aria-label={t('dashboard.scoreClose')}
          className="text-atlas-mute hover:text-slate-200 transition-colors -mt-0.5 flex-shrink-0"
        >
          <Icon name="close" size={14} />
        </button>
      </div>
      <p className="text-xs text-atlas-soft leading-snug mb-4">{t('dashboard.scoreDiagnosisIntro')}</p>

      {/* Composition du score */}
      <p className="font-grotesk text-[10px] font-bold uppercase tracking-[0.14em] text-atlas-mute mb-2">
        {t('dashboard.scoreComposition')}
      </p>
      <div className="flex flex-col gap-2">
        {parts.map(p => {
          const color = axisColor(p.score);
          return (
            <div key={p.key} className="flex items-center gap-2">
              <span className="text-xs text-slate-300 flex-1 truncate">{t(p.titleKey)}</span>
              <div className="w-16 h-1.5 rounded-full overflow-hidden flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${p.score}%`, backgroundColor: color, transition: 'width 0.6s ease' }} />
              </div>
              <span className="text-xs font-mono font-bold w-7 text-right flex-shrink-0" style={{ color }}>{p.score}</span>
              <span
                className="text-[10px] font-mono text-atlas-mute w-6 text-right flex-shrink-0"
                title={t('dashboard.scoreWeightAria', { weight: p.weight })}
              >
                ×{p.weight}
              </span>
            </div>
          );
        })}
      </div>

      <div className="h-px w-full my-3" style={{ backgroundColor: 'var(--color-atlas-line)' }} />

      {/* Leviers pour faire monter le score */}
      {levers.length > 0 ? (
        <>
          <p className="font-grotesk text-[10px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: VIZ_STATUS.ok }}>
            {t('dashboard.scoreLevers')}
          </p>
          <div className="flex flex-col gap-1.5">
            {levers.map(p => (
              <button
                key={p.key}
                onClick={() => { onNavigate(p.path); onClose(); }}
                aria-label={`+${p.gain} — ${t(p.titleKey)}`}
                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-none text-left transition-colors group"
                style={{ backgroundColor: 'rgba(92,174,142,0.06)', border: '1px solid rgba(92,174,142,0.18)' }}
              >
                <span
                  className="text-[11px] font-black font-mono px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{ backgroundColor: 'rgba(92,174,142,0.18)', color: VIZ_STATUS.ok }}
                >
                  +{p.gain}
                </span>
                <span className="text-xs font-semibold text-slate-200 flex-1 truncate">{t(p.titleKey)}</span>
                <Icon name="chevronRight" size={14} className="text-atlas-soft group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-xs font-semibold" style={{ color: VIZ_STATUS.ok }}>{t('dashboard.scoreAllMax')}</p>
      )}
    </div>
  );
}
