import { useTranslation } from 'react-i18next';
import { VIZ_STATUS } from '../../data/viz_palette';
import Icon from './Icon';

// ── CraftDiagnostics ──────────────────────────────────────────────────────────
// Bandeau « Ce que je remarque » : 1 à 3 constats de craft actionnables, communs
// à toutes les vues d'analyse (arc, Save the Cat…). Alimenté par les moteurs purs
// de `src/utils/craftDiagnostics.js`.
//
// Constat : { id, severity:'critical'|'warning'|'ok', titleKey, detailKey, params,
//             from?, to?, chipKey?, chipParams?, anchor? }
// Cliquable si `onPick` est fourni ET le constat a une ancre (`anchor` ou `from`) :
// le parent décide de l'effet (surligner un chapitre, un beat…) via `onPick(f)`.
export default function CraftDiagnostics({ findings, onPick, dataTour, title }) {
  const { t } = useTranslation();
  if (!findings?.length) return null;

  const colorFor = (sev) => (sev === 'ok' ? VIZ_STATUS.ok : sev === 'critical' ? VIZ_STATUS.crit : VIZ_STATUS.warn);
  const iconFor  = (sev) => (sev === 'ok' ? 'checkmark' : sev === 'critical' ? 'critical' : 'warning');
  const chipFor  = (f) => {
    if (f.chipKey) return t(f.chipKey, f.chipParams);
    if (f.from != null) return f.from === f.to ? t('craft.chapterOne', { n: f.from }) : t('craft.chapterRange', { from: f.from, to: f.to });
    return null;
  };

  return (
    <div
      data-tour={dataTour}
      className="rounded-none p-4"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--color-atlas-line)' }}
    >
      {title !== null && (
        <p className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em] mb-3">
          {title ?? t('craft.title')}
        </p>
      )}
      <div className="flex flex-col gap-1.5">
        {findings.map(f => {
          const color     = colorFor(f.severity);
          const chip      = chipFor(f);
          const clickable = typeof onPick === 'function' && (f.anchor != null || f.from != null);
          const Tag       = clickable ? 'button' : 'div';
          return (
            <Tag
              key={f.id}
              onClick={clickable ? () => onPick(f) : undefined}
              aria-label={clickable ? t(f.titleKey) : undefined}
              className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-none text-left transition-colors ${clickable ? 'group' : ''}`}
              style={{ backgroundColor: `${color}0d`, border: `1px solid ${color}30`, cursor: clickable ? 'pointer' : 'default' }}
            >
              <Icon name={iconFor(f.severity)} size={15} className="flex-shrink-0 mt-0.5" style={{ color }} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold flex items-center gap-2 flex-wrap" style={{ color }}>
                  {t(f.titleKey)}
                  {chip && (
                    <span className="font-mono text-[10px] font-normal px-1.5 py-0.5 rounded-sm text-atlas-soft"
                      style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                      {chip}
                    </span>
                  )}
                </p>
                <p className="text-xs text-atlas-soft leading-snug mt-0.5">{t(f.detailKey, f.params)}</p>
              </div>
              {clickable && (
                <Icon name="chevronRight" size={14} className="text-atlas-mute flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
              )}
            </Tag>
          );
        })}
      </div>
    </div>
  );
}
