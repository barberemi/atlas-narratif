import { useState } from 'react';

/**
 * Timeline slider générique.
 * Props :
 *   journey      — tableau d'étapes (peut avoir chapterNum pour les marqueurs)
 *   currentStep  — index actif
 *   onStepChange — callback(index)
 *   color        — couleur accent (hex)
 *   showLabels   — affiche la rangée de labels (défaut: true)
 */
export default function JourneyTimeline({ journey, currentStep, onStepChange, color, showLabels = true }) {
  const total = journey.length - 1;
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  // Marqueurs de chapitre — uniquement si les étapes ont chapterNum
  const hasChapterInfo = journey.some(s => s.chapterNum != null);
  const chapterBoundaries = hasChapterInfo
    ? journey.reduce((acc, step, i) => {
        if (i === 0 || step.chapterNum !== journey[i - 1].chapterNum) {
          acc.push({ idx: i, num: step.chapterNum });
        }
        return acc;
      }, [])
    : [];

  return (
    <div className="flex-1 flex flex-col gap-1 select-none min-w-0">

      {/* Marqueurs de chapitres */}
      {hasChapterInfo && chapterBoundaries.length > 1 && (
        <div className="relative h-4 px-9">
          {chapterBoundaries.map(({ idx, num }) => {
            const pct = total > 0 ? (idx / total) * 100 : 0;
            return (
              <span
                key={num}
                className="absolute -translate-x-1/2 text-[8px] text-slate-300 font-mono whitespace-nowrap"
                style={{ left: `${pct}%` }}
              >
                ch.{num}
              </span>
            );
          })}
        </div>
      )}

      {/* Slider + boutons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onStepChange(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="w-7 h-7 rounded-full flex items-center justify-center text-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          ‹
        </button>

        <div className="relative flex-1 min-w-0">
          <input
            type="range"
            min={0}
            max={total}
            value={currentStep}
            onChange={(e) => onStepChange(Number(e.target.value))}
            className="journey-slider w-full"
            style={{ '--slider-color': color }}
          />
          {/* Pastilles */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none">
            {journey.map((step, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= currentStep ? color : 'rgba(255,255,255,0.35)',
                  boxShadow:       i === currentStep ? `0 0 8px rgba(${rgb},0.9)` : 'none',
                  transform:       i === currentStep ? 'scale(1.5)' : 'scale(1)',
                  opacity:         step.isMissing ? 0.4 : 1,
                  outline:         step.isMissing ? `1.5px dashed rgba(${rgb},0.5)` : 'none',
                  outlineOffset:   '2px',
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => onStepChange(Math.min(total, currentStep + 1))}
          disabled={currentStep === total}
          className="w-7 h-7 rounded-full flex items-center justify-center text-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          ›
        </button>

        <span className="text-xs font-mono flex-shrink-0 w-10 text-right" style={{ color }}>
          {currentStep + 1}/{journey.length}
        </span>
      </div>

      {/* Labels des lieux — conditionnels */}
      {showLabels && (
        <div className="flex justify-between px-9">
          {journey.map((step, i) => {
            const shortName = step.lieu
              .split('—')[0]
              .split('(')[0]
              .trim()
              .split(' ')
              .slice(0, 2)
              .join(' ');
            const isHovered = hoveredIdx === i;
            return (
              <div key={i} className="relative flex flex-col items-center">

                {/* Tooltip */}
                {isHovered && (
                  <div
                    className="absolute bottom-full mb-2 z-50 pointer-events-none"
                    style={{
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 200,
                    }}
                  >
                    <div
                      className="rounded-xl px-3 py-2.5 flex flex-col gap-1.5 text-left"
                      style={{
                        backgroundColor: 'rgba(8,14,30,0.97)',
                        border: `1px solid rgba(${rgb},0.35)`,
                        backdropFilter: 'blur(8px)',
                        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(${rgb},0.1)`,
                      }}
                    >
                      {/* Chapitre */}
                      {step.chapitre && (
                        <p className="text-[10px] font-mono" style={{ color: `rgba(${rgb},0.8)` }}>
                          {step.chapitre}
                        </p>
                      )}
                      {/* Lieu */}
                      <p className="text-xs font-bold text-white leading-tight">
                        {step.isMissing ? '📍 Lieu non localisé' : `📍 ${step.lieu}`}
                      </p>
                      {/* Titre de l'événement */}
                      {step.sous_lieu && (
                        <p className="text-[11px] text-slate-300 leading-tight">{step.sous_lieu}</p>
                      )}
                      {/* Description */}
                      {step.action && (
                        <p className="text-[10px] text-slate-500 leading-tight italic line-clamp-2">
                          {step.action}
                        </p>
                      )}
                      {/* Alliés */}
                      {step.allies?.length > 0 && (
                        <p className="text-[10px]" style={{ color: `rgba(${rgb},0.7)` }}>
                          Avec : {step.allies.join(', ')}
                        </p>
                      )}
                    </div>
                    {/* Flèche */}
                    <div
                      className="absolute left-1/2 -translate-x-1/2 w-0 h-0"
                      style={{
                        borderLeft: '5px solid transparent',
                        borderRight: '5px solid transparent',
                        borderTop: `5px solid rgba(${rgb},0.35)`,
                        bottom: -5,
                      }}
                    />
                  </div>
                )}

                <button
                  onClick={() => onStepChange(i)}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="text-center transition-all duration-200 leading-tight"
                  style={{
                    fontSize:   '9px',
                    maxWidth:   '60px',
                    color:      i === currentStep ? color : i < currentStep ? '#cbd5e1' : '#94a3b8',
                    fontWeight: i === currentStep ? 700 : 400,
                    opacity:    step.isMissing ? 0.5 : 1,
                  }}
                >
                  {step.isMissing ? '?' : shortName}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
