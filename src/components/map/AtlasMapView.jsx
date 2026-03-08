import { useState } from 'react';
import { aragornJourney } from '../../data/aragorn_journey';
import { gandalfJourney } from '../../data/gandalf_journey';
import { frodoJourney } from '../../data/frodo_journey';
import MapCanvas from './MapCanvas';
import JourneySidebar from './JourneySidebar';
import JourneyTimeline from './JourneyTimeline';
import { hexToRgb } from '../../utils/color';

const CHARACTERS = {
  frodo: {
    key: 'frodo',
    label: 'Frodo Sacquet',
    sublabel: 'Le Porteur de l\'Anneau',
    color: '#10B981',
    journey: frodoJourney,
    defaultStep: 0,
  },
  aragorn: {
    key: 'aragorn',
    label: 'Aragorn',
    sublabel: 'Héritier d\'Isildur',
    color: '#3F51B5',
    journey: aragornJourney,
    defaultStep: 0,
  },
  gandalf: {
    key: 'gandalf',
    label: 'Mithrandir',
    sublabel: 'Gandalf le Gris',
    color: '#F59E0B',
    journey: gandalfJourney,
    defaultStep: 0,
  },
};


function ControlButton({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
      style={{
        backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        color: active ? '#fff' : '#475569',
        border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {children}
    </button>
  );
}

/**
 * Vue principale — deux arcs narratifs simultanés.
 *
 * États :
 *   steps    — position de chaque personnage sur sa timeline
 *   focused  — quel personnage apparaît dans la sidebar (mode solo)
 *   visible  — quels personnages sont affichés sur la carte
 *   linked   — les deux timelines bougent ensemble
 *   compare  — sidebar splitée, les deux infos côte à côte
 */
export default function AtlasMapView({ onCharacterClick, onLocationClick }) {
  const [steps, setSteps] = useState({
    frodo: CHARACTERS.frodo.defaultStep,
    aragorn: CHARACTERS.aragorn.defaultStep,
    gandalf: CHARACTERS.gandalf.defaultStep,
  });
  const [focused, setFocused] = useState('aragorn');
  const [visible, setVisible] = useState({ frodo: true, aragorn: true, gandalf: true });
  const [linked, setLinked] = useState(false);
  const [compare, setCompare] = useState(false);

  const handleStepChange = (charKey, newStep) => {
    if (linked) {
      const targetScene = CHARACTERS[charKey].journey[newStep]?.scene;
      const synced = {};
      Object.values(CHARACTERS).forEach((char) => {
        if (char.key === charKey) {
          synced[char.key] = newStep;
        } else if (targetScene) {
          const match = char.journey.findIndex((s) => s.scene === targetScene);
          synced[char.key] = match !== -1 ? match : Math.min(newStep, char.journey.length - 1);
        } else {
          synced[char.key] = Math.min(newStep, char.journey.length - 1);
        }
      });
      setSteps(synced);
    } else {
      setSteps((prev) => ({ ...prev, [charKey]: newStep }));
    }
  };

  const toggleVisible = (charKey) => {
    setVisible((prev) => {
      // Au moins un personnage doit rester visible
      const next = { ...prev, [charKey]: !prev[charKey] };
      if (!next.aragorn && !next.gandalf) return prev;
      return next;
    });
  };

  // Config MapCanvas — seulement les personnages visibles
  const mapCharacters = Object.values(CHARACTERS)
    .filter((c) => visible[c.key])
    .map((c) => ({
      journey: c.journey,
      currentStep: steps[c.key],
      color: c.color,
      name: c.label,
    }));

  // Largeur sidebar : fixe en solo, dynamique en compare (220px par personnage)
  const visibleCount = Object.values(CHARACTERS).length; // tous affichés en compare
  const sidebarStyle = compare
    ? { width: `${visibleCount * 220}px`, maxWidth: '55vw' }
    : { width: '320px' };

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Carte <span style={{ color: '#3F51B5' }}>Interactive</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            La Communauté de l'Anneau — Arcs narratifs
          </p>
        </div>

        {/* Contrôles globaux */}
        <div className="flex items-center gap-2">
          <ControlButton active={linked} onClick={() => setLinked((v) => !v)}>
            <span
              className="w-3 h-3 rounded-full border-2 transition-colors"
              style={{ borderColor: linked ? '#818cf8' : '#475569' }}
            />
            Lier
          </ControlButton>
          <ControlButton active={compare} onClick={() => setCompare((v) => !v)}>
            <span>⚖</span>
            Comparer
          </ControlButton>
        </div>
      </header>

      {/* ── Corps : Carte plein cadre + Sidebar flottante ── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {/* Carte plein cadre */}
        <div className="absolute inset-0">
          <MapCanvas characters={mapCharacters} onLocationClick={onLocationClick} />
        </div>

        {/* Sidebar flottante */}
        <aside
          className="absolute top-0 right-0 bottom-0 flex-shrink-0 overflow-hidden transition-all duration-300"
          style={{
            ...sidebarStyle,
            background: 'rgba(8,16,28,0.88)',
            backdropFilter: 'blur(20px)',
            borderLeft: '1px solid rgba(255,255,255,0.07)',
            boxShadow: '-8px 0 32px rgba(0,0,0,0.4)',
          }}
        >
          {compare ? (
            /* ── Mode Compare : colonnes par personnage ── */
            <div className="flex h-full divide-x divide-white/10 overflow-x-auto">
              {Object.values(CHARACTERS).map((char) => (
                <div key={char.key} className="flex-shrink-0 p-4 overflow-y-auto" style={{ width: '220px' }}>
                  {/* En-tête personnage */}
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: char.color,
                        boxShadow: `0 0 6px rgba(${hexToRgb(char.color)},0.8)`,
                      }}
                    />
                    <div>
                      <p className="text-sm font-bold text-white">{char.label}</p>
                      <p className="text-xs text-slate-500 italic">{char.sublabel}</p>
                    </div>
                  </div>
                  <JourneySidebar
                    key={`${char.key}-${steps[char.key]}`}
                    step={char.journey[steps[char.key]]}
                    color={char.color}
                    totalSteps={char.journey.length}
                    compact
                  />
                </div>
              ))}
            </div>
          ) : (
            /* ── Mode Solo : sélecteur + personnage focalisé ── */
            <div className="flex flex-col h-full">
              {/* Onglets de sélection du personnage */}
              <div className="flex border-b border-white/10 flex-shrink-0">
                {Object.values(CHARACTERS).map((char) => {
                  const isActive = focused === char.key;
                  return (
                    <button
                      key={char.key}
                      onClick={() => setFocused(char.key)}
                      className="flex-1 flex flex-col items-center py-2.5 px-1 gap-1 transition-all duration-200 relative"
                      style={{
                        backgroundColor: isActive
                          ? `rgba(${hexToRgb(char.color)},0.1)`
                          : 'transparent',
                      }}
                      title={char.sublabel}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: char.color,
                          boxShadow: isActive
                            ? `0 0 8px rgba(${hexToRgb(char.color)},0.9)`
                            : 'none',
                          opacity: isActive ? 1 : 0.4,
                        }}
                      />
                      <span
                        className="text-xs font-bold leading-tight text-center"
                        style={{ color: isActive ? char.color : '#475569' }}
                      >
                        {char.label}
                      </span>
                      {/* Bordure active */}
                      {isActive && (
                        <span
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: char.color }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Contenu */}
              <div className="flex-1 p-6 overflow-y-auto">
                <JourneySidebar
                  key={`${focused}-${steps[focused]}`}
                  step={CHARACTERS[focused].journey[steps[focused]]}
                  color={CHARACTERS[focused].color}
                  totalSteps={CHARACTERS[focused].journey.length}
                  onCharacterClick={onCharacterClick}
                />
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* ── Double Timeline ── */}
      <footer
        className="px-6 py-3 border-t border-white/10 flex-shrink-0 flex flex-col gap-2"
        style={{ background: 'rgba(5,10,18,0.97)', backdropFilter: 'blur(12px)' }}
      >
        {linked && (
          <div
            className="flex items-center gap-2 text-xs pb-2 border-b border-white/5"
            style={{ color: '#818cf8' }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: '#818cf8' }}
            />
            Timelines synchronisées — les personnages se retrouvent sur la même scène narrative
          </div>
        )}

        {Object.values(CHARACTERS).map((char) => {
          const isFocused = focused === char.key;
          const isVisible = visible[char.key];

          return (
            <div key={char.key} className="flex items-start gap-3">
              {/* Identité du personnage */}
              <div className="flex items-center gap-2 w-36 flex-shrink-0 pt-1">
                {/* Dot — toggle visibilité sur la carte */}
                <button
                  onClick={() => toggleVisible(char.key)}
                  title={isVisible ? 'Masquer de la carte' : 'Afficher sur la carte'}
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isVisible ? char.color : 'transparent',
                    borderColor: char.color,
                    boxShadow: isVisible ? `0 0 6px rgba(${hexToRgb(char.color)},0.7)` : 'none',
                    opacity: isVisible ? 1 : 0.5,
                  }}
                />
                {/* Nom — toggle focus sidebar */}
                <button
                  onClick={() => { setFocused(char.key); if (compare) setCompare(false); }}
                  className="text-left transition-all duration-200"
                  title="Focaliser dans la sidebar"
                >
                  <p
                    className="text-xs font-bold leading-tight"
                    style={{ color: isFocused && !compare ? char.color : '#64748b' }}
                  >
                    {char.label}
                  </p>
                  <p className="text-xs text-slate-600 italic leading-tight">{char.sublabel}</p>
                </button>
              </div>

              {/* Slider */}
              <JourneyTimeline
                journey={char.journey}
                currentStep={steps[char.key]}
                onStepChange={(step) => {
                  handleStepChange(char.key, step);
                  if (!compare) setFocused(char.key);
                }}
                color={char.color}
                showLabels={isFocused || compare}
              />
            </div>
          );
        })}
      </footer>
    </div>
  );
}
