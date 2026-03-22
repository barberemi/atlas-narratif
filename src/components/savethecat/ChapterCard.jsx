import { useState } from 'react';
import { BEATS } from '../../data/beats_config';
import { useLoreStore } from '../../stores/useLoreStore';

export default function ChapterCard({ chapter, alertBeatIds, hasDragged, onEdit }) {
  const { characters, locations, objects } = useLoreStore();
  const [expanded, setExpanded] = useState(false);
  const chBeats  = chapter.beats.map(id => BEATS.find(b => b.id === id)).filter(Boolean);
  const hasAlert = chBeats.some(b => alertBeatIds.has(b.id));

  return (
    <div
      className="flex-shrink-0 rounded-xl border overflow-hidden transition-all duration-200 cursor-pointer group"
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
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Bouton édition — visible au hover */}
            {onEdit && (
              <button
                onClick={e => { e.stopPropagation(); onEdit(chapter); }}
                className="w-6 h-6 flex items-center justify-center rounded text-slate-700 hover:text-slate-300 hover:bg-white/10 transition-all duration-150 opacity-0 group-hover:opacity-100"
                title="Modifier ce chapitre"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
            )}
            <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
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

        {/* Dots entités */}
        {chapter.entities?.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
            {chapter.entities.map(e => {
              const list = e.entityType === 'character' ? characters : e.entityType === 'location' ? locations : objects;
              const meta = list.find(x => x.id === e.id);
              if (!meta) return null;
              const color = e.entityType === 'character' ? (meta.color ?? '#818cf8') : e.entityType === 'location' ? '#60a5fa' : '#a78bfa';
              return (
                <span
                  key={`${e.entityType}-${e.id}`}
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 4px ${color}80` }}
                  title={meta.name}
                />
              );
            })}
          </div>
        )}

        {/* Beats chips */}
        <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
          {chBeats.length === 0 && (
            <span className="text-[10px] text-slate-700 italic">Aucun beat assigné</span>
          )}
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
