import { chaptersDB } from '../../data/save_the_cat_database';

export default function AlertCard({ alert, isHovered, onHover }) {
  const isCritical = alert.severity === 'critical';
  const isMissing  = alert.type === 'missing';

  return (
    <div
      className="p-4 rounded-xl space-y-2 transition-all duration-150 cursor-default"
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
        <span style={{ color: isCritical ? '#ef4444' : '#fbbf24', fontSize: 13 }}>
          {isMissing ? '○' : isCritical ? '⛔' : '⚠'}
        </span>
        <span className="text-xs font-bold" style={{ color: alert.beat.color }}>
          {alert.beat.number}. {alert.beat.label}
        </span>
        {!isMissing && (
          <span className="text-[11px] font-mono text-slate-500 ml-auto whitespace-nowrap">
            {alert.actualPct}% · idéal {alert.idealPct}%
          </span>
        )}
        {alert.chapterTitle && (
          <span
            className="text-[11px] px-2 py-0.5 rounded font-mono"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b' }}
          >
            Ch.{chaptersDB.find(c => c.beats.includes(alert.beat.id))?.number}
          </span>
        )}
      </div>
      <p className="text-xs text-slate-400 leading-relaxed pl-5 font-serif italic">
        {alert.message}
      </p>
    </div>
  );
}
