import { useState } from 'react';
import { BEATS } from '../../data/save_the_cat_database';

export default function ChapterCard({ chapter, alertBeatIds, hasDragged }) {
  const [expanded, setExpanded] = useState(false);
  const chBeats  = chapter.beats.map(id => BEATS.find(b => b.id === id)).filter(Boolean);
  const hasAlert = chBeats.some(b => alertBeatIds.has(b.id));

  return (
    <div
      className="flex-shrink-0 rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer"
      style={{
        width: 240,
        backgroundColor: hasAlert ? 'rgba(251,191,36,0.04)' : 'rgba(255,255,255,0.03)',
        borderColor: hasAlert ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)',
      }}
      onClick={() => { if (!hasDragged.current) setExpanded(p => !p); }}
    >
      {/* Bandeau couleur haut */}
      <div className="h-0.5" style={{ backgroundColor: hasAlert ? '#fbbf24' : 'rgba(63,81,181,0.5)' }} />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span
              className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex-shrink-0"
              style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8' }}
            >
              Ch.{chapter.number}
            </span>
            <p className="text-sm font-bold text-slate-200 leading-snug truncate">{chapter.title}</p>
          </div>
          <span className="text-slate-600 text-xs flex-shrink-0">{expanded ? '▲' : '▼'}</span>
        </div>

        {/* Résumé */}
        <p
          className="text-xs text-slate-400 leading-relaxed font-serif"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: expanded ? 'unset' : 3,
            WebkitBoxOrient: 'vertical',
            overflow: expanded ? 'visible' : 'hidden',
          }}
        >
          {chapter.summary}
        </p>

        {/* Beats chips */}
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
          {chBeats.map(beat => (
            <span
              key={beat.id}
              className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium"
              style={{
                backgroundColor: `${beat.color}15`,
                color: alertBeatIds.has(beat.id) ? '#fbbf24' : beat.color,
                border: `1px solid ${alertBeatIds.has(beat.id) ? 'rgba(251,191,36,0.3)' : beat.color + '40'}`,
              }}
              title={beat.description}
            >
              {alertBeatIds.has(beat.id) && <span>⚠</span>}
              {beat.number}. {beat.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
