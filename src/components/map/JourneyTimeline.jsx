/**
 * Timeline slider générique.
 * Props :
 *   journey      — tableau d'étapes
 *   currentStep  — index actif
 *   onStepChange — callback(index)
 *   color        — couleur accent (hex)
 *   showLabels   — affiche la rangée de labels (défaut: true)
 */
export default function JourneyTimeline({ journey, currentStep, onStepChange, color, showLabels = true }) {
  const total = journey.length - 1;

  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  return (
    <div className="flex-1 flex flex-col gap-2 select-none min-w-0">
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
            {journey.map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: i <= currentStep ? color : 'rgba(255,255,255,0.35)',
                  boxShadow: i === currentStep ? `0 0 8px rgba(${rgb},0.9)` : 'none',
                  transform: i === currentStep ? 'scale(1.5)' : 'scale(1)',
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

        {/* Compteur étape */}
        <span
          className="text-xs font-mono flex-shrink-0 w-10 text-right"
          style={{ color }}
        >
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
            return (
              <button
                key={step.id}
                onClick={() => onStepChange(i)}
                title={step.lieu}
                className="text-center transition-all duration-200 leading-tight"
                style={{
                  fontSize: '9px',
                  maxWidth: '60px',
                  color: i === currentStep ? color : i < currentStep ? '#475569' : '#334155',
                  fontWeight: i === currentStep ? 700 : 400,
                }}
              >
                {shortName}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
