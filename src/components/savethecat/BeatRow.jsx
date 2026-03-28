import { useState } from 'react';

export default function BeatRow({ beat, event, isAlert, isHovered, onHover, totalChapters, onAssign }) {
  const actualPct = (event && totalChapters)
    ? ((event.chapter - 1 + 0.5) / totalChapters) * 100
    : null;

  const [showExamples, setShowExamples] = useState(false);
  const [exampleIdx,   setExampleIdx]   = useState(0);

  const examples = beat.examples ?? [];
  const current  = examples[exampleIdx];

  const prev = (e) => { e.stopPropagation(); setExampleIdx(i => (i - 1 + examples.length) % examples.length); };
  const next = (e) => { e.stopPropagation(); setExampleIdx(i => (i + 1) % examples.length); };

  return (
    <div
      className="rounded-lg transition-all duration-100"
      style={{ backgroundColor: isHovered ? `${beat.color}12` : 'transparent' }}
      onMouseEnter={() => onHover(beat.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Ligne principale */}
      <div className="flex items-center gap-2 py-1.5 px-2">
        <div
          className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center font-bold"
          style={{
            fontSize: 10,
            backgroundColor: event ? `${beat.color}20` : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${event ? (isAlert ? '#fbbf24' : beat.color + '65') : 'rgba(255,255,255,0.08)'}`,
            color: event ? (isAlert ? '#fbbf24' : beat.color) : '#334155',
          }}
        >
          {beat.number}
        </div>

        <div className="flex-1 min-w-0">
          <span
            className="text-xs block truncate"
            style={{ color: event ? '#94a3b8' : '#475569' }}
            title={beat.description}
          >
            {beat.label}
          </span>
          {event && (
            <span className="text-[10px] block truncate" style={{ color: beat.color + 'aa' }}>
              Ch.{event.chapter} — {event.title}
            </span>
          )}
        </div>

        {actualPct !== null ? (
          <span className="text-[11px] font-mono text-slate-600 flex-shrink-0">
            {Math.round(actualPct)}%
          </span>
        ) : (
          <span className="text-[11px] text-slate-700 flex-shrink-0">—</span>
        )}

        {isAlert && <span className="text-xs flex-shrink-0" style={{ color: '#fbbf24' }}>⚠</span>}
        {event && !isAlert && <span className="text-xs flex-shrink-0" style={{ color: '#10b981' }}>✓</span>}

        {/* Bouton assigner / éditer */}
        <button
          onClick={() => onAssign(beat, event ?? null)}
          className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded transition-all duration-150"
          style={{
            color:           event ? beat.color : '#475569',
            backgroundColor: event ? `${beat.color}12` : 'rgba(255,255,255,0.04)',
            border:          `1px solid ${event ? `${beat.color}35` : 'rgba(255,255,255,0.08)'}`,
          }}
          title={event ? 'Modifier cet événement' : 'Créer un événement pour ce beat'}
        >
          {event ? '✏' : '+'}
        </button>

        {/* Bouton toggle exemples */}
        {examples.length > 0 && (
          <button
            onClick={() => setShowExamples(v => !v)}
            className="flex-shrink-0 text-[10px] px-1.5 py-0.5 rounded transition-all duration-150"
            style={{
              color:           showExamples ? beat.color : '#334155',
              backgroundColor: showExamples ? `${beat.color}18` : 'transparent',
              border:          `1px solid ${showExamples ? `${beat.color}40` : 'rgba(255,255,255,0.05)'}`,
            }}
            title="Voir des exemples"
          >
            💡
          </button>
        )}
      </div>

      {/* Carousel exemples */}
      {showExamples && current && (
        <div
          className="mx-2 mb-2 rounded-lg px-3 py-2.5 flex flex-col gap-2"
          style={{ backgroundColor: `${beat.color}08`, border: `1px solid ${beat.color}20` }}
        >
          <div className="flex items-center justify-between">
            <button
              onClick={prev}
              className="w-5 h-5 flex items-center justify-center rounded transition-colors text-[11px]"
              style={{ color: beat.color, backgroundColor: `${beat.color}15` }}
            >‹</button>
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${beat.color}20`, color: beat.color }}
            >
              {current.work}
            </span>
            <button
              onClick={next}
              className="w-5 h-5 flex items-center justify-center rounded transition-colors text-[11px]"
              style={{ color: beat.color, backgroundColor: `${beat.color}15` }}
            >›</button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed italic text-center">
            {current.text}
          </p>
          <div className="flex justify-center gap-1">
            {examples.map((_, i) => (
              <button
                key={i}
                onClick={() => setExampleIdx(i)}
                className="w-1.5 h-1.5 rounded-full transition-all duration-150"
                style={{ backgroundColor: i === exampleIdx ? beat.color : `${beat.color}30` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
