export default function BeatRow({ beat, chapter, isAlert, isHovered, onHover, totalChapters }) {
  const actualPct = (chapter && totalChapters)
    ? ((chapter.number - 1 + 0.5) / totalChapters) * 100
    : null;

  return (
    <div
      className="flex items-center gap-2 py-1.5 px-2 rounded-lg transition-all duration-100 cursor-default"
      style={{ backgroundColor: isHovered ? `${beat.color}12` : 'transparent' }}
      onMouseEnter={() => onHover(beat.id)}
      onMouseLeave={() => onHover(null)}
    >
      <div
        className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-bold"
        style={{
          fontSize: 10,
          backgroundColor: chapter ? `${beat.color}20` : 'rgba(255,255,255,0.04)',
          border: `1.5px solid ${chapter ? (isAlert ? '#fbbf24' : beat.color + '65') : 'rgba(255,255,255,0.08)'}`,
          color: chapter ? (isAlert ? '#fbbf24' : beat.color) : '#334155',
        }}
      >
        {beat.number}
      </div>

      <span
        className="text-xs flex-1 truncate"
        style={{ color: chapter ? '#94a3b8' : '#475569' }}
        title={beat.description}
      >
        {beat.label}
      </span>

      {actualPct !== null ? (
        <span className="text-[11px] font-mono text-slate-600 flex-shrink-0">
          {Math.round(actualPct)}%
        </span>
      ) : (
        <span className="text-[11px] text-slate-700 flex-shrink-0">—</span>
      )}

      {isAlert && <span className="text-xs flex-shrink-0" style={{ color: '#fbbf24' }}>⚠</span>}
      {chapter && !isAlert && <span className="text-xs flex-shrink-0" style={{ color: '#10b981' }}>✓</span>}
    </div>
  );
}
