import { useTranslation } from 'react-i18next';
import { VIZ_STATUS } from '../../data/viz_palette';
import Icon from '../ui/Icon';

export default function AlertCard({ alert, isHovered, onHover }) {
  const { t } = useTranslation();
  const isCritical = alert.severity === 'critical';
  const isMissing  = alert.type === 'missing';

  const alertType = isMissing ? 'missing' : (alert.diff > 0 ? 'too_late' : 'too_early');
  const messageKey = `narrative:beats.${alert.beat.id}.alert_${alertType}`;
  const beatLabel = t(`narrative:beats.${alert.beat.id}.label`, alert.beat.label);
  const fallback = alert.message
    ?? t(alert.direction === 'late' ? 'stc.alertFallbackLate' : 'stc.alertFallbackEarly', {
      label: beatLabel, actual: alert.actualPct, ideal: alert.idealPct,
    });
  const message = t(messageKey, fallback);

  return (
    <div
      className="p-4 rounded-none space-y-2 transition-all duration-150 cursor-default"
      style={{
        backgroundColor: isHovered
          ? (isCritical ? 'rgba(239,68,68,0.12)' : 'rgba(251,191,36,0.10)')
          : (isCritical ? 'rgba(239,68,68,0.07)' : 'rgba(251,191,36,0.05)'),
        border: `1px solid ${isHovered
          ? (isCritical ? 'rgba(239,68,68,0.5)' : 'rgba(251,191,36,0.4)')
          : (isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(251,191,36,0.15)')}`,
      }}
      onMouseEnter={() => onHover(alert.beat.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div className="flex items-center gap-2 flex-wrap">
        <span className="flex items-center" style={{ color: isCritical ? VIZ_STATUS.crit : VIZ_STATUS.warn }}>
          <Icon name={isMissing ? 'dot' : isCritical ? 'critical' : 'warning'} size={13} />
        </span>
        <span className="text-xs font-bold" style={{ color: alert.beat.color }}>
          {alert.beat.number}. {t(`narrative:beats.${alert.beat.id}.label`, alert.beat.label)}
        </span>
        {!isMissing && (
          <span className="text-[11px] font-mono text-atlas-soft ml-auto whitespace-nowrap">
            {alert.actualPct}% · {t('stc.ideal')} {alert.idealPct}%
          </span>
        )}
        {alert.chapterNumber != null && (
          <span
            className="text-[11px] px-2 py-0.5 rounded font-mono"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' }}
          >
            Ch.{alert.chapterNumber}
            {alert.chapterTitle && (
              <span className="ml-1 font-sans" style={{ color: 'var(--color-atlas-mute)' }}>
                · {alert.chapterTitle}
              </span>
            )}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed pl-5 font-serif italic">
        {message}
      </p>
    </div>
  );
}
