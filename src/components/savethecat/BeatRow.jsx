import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const PencilIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

export default function BeatRow({ beat, events = [], volumes, isAlert, isHovered, onHover, totalChapters, onAssign }) {
  const { t } = useTranslation();
  const primaryEvent = events[0] ?? null;
  const multiVolume  = events.length > 1;

  const actualPct = (primaryEvent && totalChapters)
    ? ((primaryEvent.chapter - 1 + 0.5) / totalChapters) * 100
    : null;

  const [showExamples, setShowExamples] = useState(false);
  const [exampleIdx,   setExampleIdx]   = useState(0);

  const rawExamples = beat.examples ?? [];
  const translatedExamples = t(`narrative:beats.${beat.id}.examples`, { returnObjects: true, defaultValue: null });
  const examples = Array.isArray(translatedExamples) ? translatedExamples : rawExamples;
  const current  = examples[exampleIdx];

  const prev = (e) => { e.stopPropagation(); setExampleIdx(i => (i - 1 + examples.length) % examples.length); };
  const next = (e) => { e.stopPropagation(); setExampleIdx(i => (i + 1) % examples.length); };

  const volumeLabel = (evt) => {
    if (!volumes || volumes.length <= 1) return null;
    const vol = volumes.find(v => v.id === evt.volumeId);
    return vol ? `T.${vol.number}` : null;
  };

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
            backgroundColor: primaryEvent ? `${beat.color}20` : 'rgba(255,255,255,0.04)',
            border: `1.5px solid ${primaryEvent ? (isAlert ? '#fbbf24' : beat.color + '65') : 'rgba(255,255,255,0.08)'}`,
            color: primaryEvent ? (isAlert ? '#fbbf24' : beat.color) : '#334155',
          }}
        >
          {beat.number}
        </div>

        <div className="flex-1 min-w-0">
          <span
            className="text-xs block truncate"
            style={{ color: primaryEvent ? '#94a3b8' : '#475569' }}
            title={t(`narrative:beats.${beat.id}.desc`, beat.description)}
          >
            {t(`narrative:beats.${beat.id}.label`, beat.label)}
          </span>

          {/* Mono-tome : une seule ligne */}
          {!multiVolume && primaryEvent && (
            <span className="text-[10px] block truncate" style={{ color: beat.color + 'aa' }}>
              Ch.{primaryEvent.chapter} — {primaryEvent.title}
            </span>
          )}

          {/* Multi-tome : une ligne par tome avec bouton crayon individuel */}
          {multiVolume && (
            <div className="flex flex-col gap-0.5 mt-0.5">
              {events.map(evt => {
                const lbl = volumeLabel(evt);
                return (
                  <div key={evt.id} className="flex items-center gap-1">
                    {lbl && (
                      <span
                        className="font-mono font-bold px-1 rounded flex-shrink-0"
                        style={{ fontSize: 9, backgroundColor: `${beat.color}20`, color: beat.color }}
                      >
                        {lbl}
                      </span>
                    )}
                    <span className="text-[10px] truncate flex-1" style={{ color: beat.color + 'aa' }}>
                      Ch.{evt.chapter} — {evt.title}
                    </span>
                    <button
                      onClick={() => onAssign(beat, evt)}
                      className="w-5 h-5 flex items-center justify-center rounded-md flex-shrink-0 transition-all duration-200"
                      style={{ backgroundColor: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }}
                      title={t('stc.editEvent')}
                    >
                      <PencilIcon />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!multiVolume && (
          actualPct !== null ? (
            <span className="text-[11px] font-mono text-slate-600 flex-shrink-0">
              {Math.round(actualPct)}%
            </span>
          ) : (
            <span className="text-[11px] text-slate-700 flex-shrink-0">—</span>
          )
        )}

        {isAlert && <span className="text-xs flex-shrink-0" style={{ color: '#fbbf24' }}>⚠</span>}
        {primaryEvent && !isAlert && <span className="text-xs flex-shrink-0" style={{ color: '#10b981' }}>✓</span>}

        {/* Bouton principal : crayon SVG (mono-tome avec event) ou + (sans event) */}
        {!multiVolume && (
          <button
            onClick={() => onAssign(beat, primaryEvent ?? null)}
            className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 transition-all duration-200"
            style={
              primaryEvent
                ? { backgroundColor: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.3)' }
                : { backgroundColor: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }
            }
            title={primaryEvent ? t('stc.editEvent') : t('stc.createEventForBeat')}
          >
            {primaryEvent ? <PencilIcon /> : <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>}
          </button>
        )}

        {/* En multi-tome sans event : bouton + pour en créer un */}
        {multiVolume && events.length === 0 && (
          <button
            onClick={() => onAssign(beat, null)}
            className="w-6 h-6 flex items-center justify-center rounded-md flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }}
            title={t('stc.createEventForBeat')}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }}>+</span>
          </button>
        )}

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
            title={t('stc.showExamples')}
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
