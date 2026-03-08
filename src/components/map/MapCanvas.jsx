import { useState } from 'react';
import mapImage from '../../assets/ouest_terre_du_milieu.jpg';
import { loreDB } from '../../data/lore_database';

/**
 * Carte multi-personnages.
 * Reçoit un tableau `characters`, chacun avec :
 *   { journey, currentStep, color, name }
 * Chaque personnage a son propre tracé SVG et son marqueur animé.
 */
export default function MapCanvas({ characters, onLocationClick }) {
  const [hoveredLoc, setHoveredLoc] = useState(null);
  return (
    <div className="relative w-full h-full overflow-hidden bg-stone-950">
      {/* Carte de fond */}
      <img
        src={mapImage}
        alt="Carte de l'Ouest de la Terre du Milieu"
        className="absolute inset-0 w-full h-full object-cover select-none"
        draggable={false}
      />


      {/* SVG overlay — tracés de tous les personnages */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {characters.map(({ name }) => (
            <filter key={name} id={`glow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {characters.map(({ journey, currentStep, color, name }) => {
          const visited = journey.slice(0, currentStep + 1);
          return (
            <g key={name}>
              {/* Ligne du trajet */}
              {visited.length > 1 && (
                <polyline
                  points={visited.map((s) => `${s.x},${s.y}`).join(' ')}
                  fill="none"
                  stroke={color}
                  strokeWidth="0.3"
                  strokeDasharray="0.9,0.5"
                  strokeOpacity="0.85"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#glow-${name})`}
                />
              )}
              {/* Points des étapes passées */}
              {visited.slice(0, currentStep).map((step) => (
                <circle
                  key={step.id}
                  cx={step.x}
                  cy={step.y}
                  r="0.6"
                  fill={color}
                  fillOpacity="0.55"
                  filter={`url(#glow-${name})`}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Pins de lieux — loreDB.locations */}
      {loreDB.locations.map((loc) => {
        const { x, y } = loc.coordinates;
        const isHovered = hoveredLoc === loc.id;
        return (
          <button
            key={loc.id}
            onClick={() => onLocationClick?.(loc.name)}
            onMouseEnter={() => setHoveredLoc(loc.id)}
            onMouseLeave={() => setHoveredLoc(null)}
            className="absolute z-20 flex flex-col items-center"
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: 'translate(-50%, -100%)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            title={loc.name}
          >
            {/* Tooltip */}
            {isHovered && (
              <span
                className="absolute whitespace-nowrap text-xs font-semibold px-2 py-1 rounded pointer-events-none"
                style={{
                  bottom: 'calc(100% + 4px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: 'rgba(8,14,30,0.95)',
                  color: '#e2e8f0',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(4px)',
                  zIndex: 30,
                }}
              >
                {loc.name}
              </span>
            )}
            {/* Pin SVG */}
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path
                d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z"
                fill={isHovered ? '#e2e8f0' : 'rgba(255,255,255,0.55)'}
                style={{ transition: 'fill 0.15s' }}
              />
              <circle cx="7" cy="7" r="2.5" fill="rgba(8,14,30,0.8)" />
            </svg>
          </button>
        );
      })}

      {/* Marqueurs animés — un par personnage */}
      {characters.map(({ journey, currentStep, color, name }) => {
        const current = journey[currentStep];
        // Convertit hex #RRGGBB en "R,G,B" pour rgba()
        const hex = color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);
        const rgb = `${r},${g},${b}`;

        return (
          <div
            key={name}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${current.x}%`,
              top: `${current.y}%`,
              transform: 'translate(-50%, -50%)',
              transition:
                'left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Anneau de pulsation */}
            <span
              className="absolute rounded-full animate-ping"
              style={{
                width: 32,
                height: 32,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                backgroundColor: color,
                opacity: 0.3,
              }}
            />
            {/* Anneau externe */}
            <span
              className="absolute rounded-full"
              style={{
                width: 28,
                height: 28,
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: `1.5px solid rgba(${rgb},0.45)`,
              }}
            />
            {/* Point central */}
            <span
              className="relative block w-4 h-4 rounded-full border-2 border-white z-10"
              style={{
                backgroundColor: color,
                boxShadow: `0 0 8px rgba(${rgb},0.9), 0 0 22px rgba(${rgb},0.5), 0 2px 6px rgba(0,0,0,0.7)`,
              }}
            />
            {/* Étiquette */}
            <span
              className="absolute whitespace-nowrap text-xs font-bold text-white px-2 py-0.5 rounded"
              style={{
                top: 'calc(100% + 6px)',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(8,14,30,0.92)',
                border: `1px solid rgba(${rgb},0.55)`,
                backdropFilter: 'blur(4px)',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
              }}
            >
              {name}
            </span>
          </div>
        );
      })}
    </div>
  );
}
