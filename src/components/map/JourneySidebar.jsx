/**
 * Panneau latéral — informations de l'étape courante.
 * Props :
 *   step        — étape courante
 *   color       — couleur accent du personnage (hex)
 *   totalSteps  — nombre total d'étapes du personnage
 *   compact     — mode réduit pour la vue Comparer
 */
/**
 * onCharacterClick(name) — optionnel, appelé quand on clique sur un tag allié.
 * Si non fourni, les tags restent non-cliquables.
 */
export default function JourneySidebar({ step, color, totalSteps, compact = false, onCharacterClick }) {
  if (!step) return null;

  const hex = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  return (
    <div className={`animate-fade-slide-in flex flex-col h-full ${compact ? 'gap-3' : 'gap-5'}`}>
      {/* Badge étape + référence */}
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-mono font-bold px-2 py-0.5 rounded"
          style={{
            backgroundColor: `rgba(${rgb},0.15)`,
            color: color,
            border: `1px solid rgba(${rgb},0.3)`,
          }}
        >
          {step.etape}/{totalSteps}
        </span>
        {!compact && (
          <span className="text-xs text-slate-500 font-serif italic">{step.chapitre}</span>
        )}
      </div>

      {/* Nom du lieu */}
      <div className={`border-b border-white/10 ${compact ? 'pb-3' : 'pb-4'}`}>
        <h2
          className={`font-black text-white leading-tight ${compact ? 'text-lg' : 'text-2xl'}`}
        >
          {step.lieu}
        </h2>
        {step.sous_lieu && (
          <p className="text-xs text-slate-400 font-serif italic mt-1">{step.sous_lieu}</p>
        )}
        {compact && (
          <p className="text-xs text-slate-500 font-serif italic mt-1">{step.chapitre}</p>
        )}
      </div>

      {/* Événements */}
      <div>
        <h3
          className="text-xs uppercase tracking-widest font-bold mb-2"
          style={{ color }}
        >
          Événements
        </h3>
        <p
          className={`text-slate-300 leading-relaxed font-serif ${compact ? 'text-xs' : 'text-sm'}`}
        >
          {step.action}
        </p>
      </div>

      {/* Alliés */}
      <div>
        <h3
          className="text-xs uppercase tracking-widest font-bold mb-2"
          style={{ color }}
        >
          Alliés
        </h3>
        {step.allies.length === 0 ? (
          <p className="text-xs text-slate-500 italic">Seul face à son destin.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {step.allies.map((ally, i) => {
              const clickable = !!onCharacterClick;
              const Tag = clickable ? 'button' : 'span';
              return (
                <Tag
                  key={i}
                  onClick={clickable ? () => onCharacterClick(ally) : undefined}
                  className={`text-xs px-2 py-0.5 rounded-full text-slate-300 transition-all duration-150 ${
                    clickable ? 'hover:text-white hover:border-white/30 cursor-pointer' : ''
                  }`}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                  }}
                >
                  {ally}{clickable && <span className="ml-1 opacity-40 text-xs">↗</span>}
                </Tag>
              );
            })}
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div className="mt-auto pt-3 border-t border-white/10">
        <div className="flex justify-between text-xs text-slate-600 mb-1">
          <span>Arc</span>
          <span style={{ color }}>{step.etape} / {totalSteps}</span>
        </div>
        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${(step.etape / totalSteps) * 100}%`,
              backgroundColor: color,
              boxShadow: `0 0 6px rgba(${rgb},0.6)`,
            }}
          />
        </div>
      </div>
    </div>
  );
}
