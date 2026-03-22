import { useState, useMemo, useEffect } from 'react';
import MapCanvas from './MapCanvas';
import JourneySidebar from './JourneySidebar';
import JourneyTimeline from './JourneyTimeline';
import { hexToRgb } from '../../utils/color';
import { useMapStore }  from '../../stores/useMapStore';
import { useLoreStore } from '../../stores/useLoreStore';

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
 * Vue principale — arcs narratifs sur la carte.
 * Les personnages affichés sont ceux qui ont un journey_key et un trajet en DB.
 */
export default function AtlasMapView({ onCharacterClick, onLocationClick }) {
  const journeys     = useMapStore(s => s.journeys);
  const mapImage     = useMapStore(s => s.mapImage);
  const allChars     = useLoreStore(s => s.characters);
  const allLocations = useLoreStore(s => s.locations);

  const locations = useMemo(() => allLocations.filter(l => l.coordinates), [allLocations]);

  // Construction dynamique des personnages depuis le lore + les journeys
  const CHARACTERS = useMemo(() => {
    if (!journeys) return {};
    const result = {};
    allChars.forEach(c => {
      if (c.journeyKey && journeys[c.journeyKey]?.length > 0) {
        result[c.journeyKey] = {
          key:     c.journeyKey,
          label:   c.name,
          sublabel: c.role ?? '',
          color:   c.color,
          journey: journeys[c.journeyKey],
        };
      }
    });
    return result;
  }, [allChars, journeys]);

  const charKeys = useMemo(() => Object.keys(CHARACTERS), [CHARACTERS]);

  const [steps,   setSteps]   = useState({});
  const [focused, setFocused] = useState(null);
  const [visible, setVisible] = useState({});
  const [linked,  setLinked]  = useState(false);
  const [compare, setCompare] = useState(false);

  // Initialise steps/visible/focused quand les personnages sont connus
  useEffect(() => {
    if (!charKeys.length) return;
    setSteps(prev => {
      const next = { ...prev };
      charKeys.forEach(k => { if (next[k] === undefined) next[k] = 0; });
      return next;
    });
    setVisible(prev => {
      const next = { ...prev };
      charKeys.forEach(k => { if (next[k] === undefined) next[k] = true; });
      return next;
    });
    setFocused(prev => prev ?? charKeys[0]);
  }, [charKeys]);

  if (!journeys) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  if (!charKeys.length) return (
    <div className="h-full flex items-center justify-center flex-col gap-3">
      <p className="text-slate-500 font-serif italic">Aucun trajet disponible pour ce projet.</p>
      <p className="text-xs text-slate-700">Importez un projet avec une carte pour activer cette vue.</p>
    </div>
  );

  const handleStepChange = (charKey, newStep) => {
    if (linked) {
      const targetScene = CHARACTERS[charKey].journey[newStep]?.scene;
      const synced = {};
      charKeys.forEach(key => {
        if (key === charKey) {
          synced[key] = newStep;
        } else if (targetScene) {
          const match = CHARACTERS[key].journey.findIndex(s => s.scene === targetScene);
          synced[key] = match !== -1 ? match : Math.min(newStep, CHARACTERS[key].journey.length - 1);
        } else {
          synced[key] = Math.min(newStep, CHARACTERS[key].journey.length - 1);
        }
      });
      setSteps(synced);
    } else {
      setSteps(prev => ({ ...prev, [charKey]: newStep }));
    }
  };

  const toggleVisible = (charKey) => {
    setVisible(prev => {
      const next = { ...prev, [charKey]: !prev[charKey] };
      // Garder au moins un personnage visible
      if (Object.values(next).every(v => !v)) return prev;
      return next;
    });
  };

  const mapCharacters = charKeys
    .filter(k => visible[k])
    .map(k => ({
      journey:     CHARACTERS[k].journey,
      currentStep: steps[k] ?? 0,
      color:       CHARACTERS[k].color,
      name:        CHARACTERS[k].label,
    }));

  const sidebarStyle = compare
    ? { width: `${charKeys.length * 220}px`, maxWidth: '55vw' }
    : { width: '320px' };

  const focusedChar = focused ? CHARACTERS[focused] : null;

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Carte <span style={{ color: '#3F51B5' }}>Interactive</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {charKeys.length} personnage{charKeys.length > 1 ? 's' : ''} — arcs narratifs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ControlButton active={linked} onClick={() => setLinked(v => !v)}>
            <span className="w-3 h-3 rounded-full border-2 transition-colors"
              style={{ borderColor: linked ? '#818cf8' : '#475569' }} />
            Lier
          </ControlButton>
          <ControlButton active={compare} onClick={() => setCompare(v => !v)}>
            <span>⚖</span>
            Comparer
          </ControlButton>
        </div>
      </header>

      {/* ── Corps : Carte plein cadre + Sidebar flottante ── */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        <div className="absolute inset-0">
          <MapCanvas
            characters={mapCharacters}
            locations={locations}
            onLocationClick={onLocationClick}
            mapSrc={mapImage}
          />
        </div>

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
            <div className="flex h-full divide-x divide-white/10 overflow-x-auto">
              {charKeys.map(key => {
                const char = CHARACTERS[key];
                return (
                  <div key={key} className="flex-shrink-0 p-4 overflow-y-auto" style={{ width: '220px' }}>
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/10">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: char.color, boxShadow: `0 0 6px rgba(${hexToRgb(char.color)},0.8)` }} />
                      <div>
                        <p className="text-sm font-bold text-white">{char.label}</p>
                        <p className="text-xs text-slate-500 italic">{char.sublabel}</p>
                      </div>
                    </div>
                    <JourneySidebar
                      key={`${key}-${steps[key]}`}
                      step={char.journey[steps[key] ?? 0]}
                      color={char.color}
                      totalSteps={char.journey.length}
                      compact
                    />
                  </div>
                );
              })}
            </div>
          ) : focusedChar ? (
            <div className="flex flex-col h-full">
              <div className="flex border-b border-white/10 flex-shrink-0">
                {charKeys.map(key => {
                  const char = CHARACTERS[key];
                  const isActive = focused === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setFocused(key)}
                      className="flex-1 flex flex-col items-center py-2.5 px-1 gap-1 transition-all duration-200 relative"
                      style={{ backgroundColor: isActive ? `rgba(${hexToRgb(char.color)},0.1)` : 'transparent' }}
                      title={char.sublabel}
                    >
                      <span className="w-2.5 h-2.5 rounded-full transition-all duration-200"
                        style={{
                          backgroundColor: char.color,
                          boxShadow: isActive ? `0 0 8px rgba(${hexToRgb(char.color)},0.9)` : 'none',
                          opacity: isActive ? 1 : 0.4,
                        }} />
                      <span className="text-xs font-bold leading-tight text-center"
                        style={{ color: isActive ? char.color : '#475569' }}>
                        {char.label}
                      </span>
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: char.color }} />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <JourneySidebar
                  key={`${focused}-${steps[focused]}`}
                  step={focusedChar.journey[steps[focused] ?? 0]}
                  color={focusedChar.color}
                  totalSteps={focusedChar.journey.length}
                  onCharacterClick={onCharacterClick}
                />
              </div>
            </div>
          ) : null}
        </aside>
      </div>

      {/* ── Double Timeline ── */}
      <footer
        className="px-6 py-3 border-t border-white/10 flex-shrink-0 flex flex-col gap-2"
        style={{ background: 'rgba(5,10,18,0.97)', backdropFilter: 'blur(12px)' }}
      >
        {linked && (
          <div className="flex items-center gap-2 text-xs pb-2 border-b border-white/5" style={{ color: '#818cf8' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#818cf8' }} />
            Timelines synchronisées — les personnages se retrouvent sur la même scène narrative
          </div>
        )}
        {charKeys.map(key => {
          const char = CHARACTERS[key];
          const isFocused = focused === key;
          const isVisible = visible[key] ?? true;
          return (
            <div key={key} className="flex items-start gap-3">
              <div className="flex items-center gap-2 w-36 flex-shrink-0 pt-1">
                <button
                  onClick={() => toggleVisible(key)}
                  title={isVisible ? 'Masquer de la carte' : 'Afficher sur la carte'}
                  className="w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all duration-200"
                  style={{
                    backgroundColor: isVisible ? char.color : 'transparent',
                    borderColor: char.color,
                    boxShadow: isVisible ? `0 0 6px rgba(${hexToRgb(char.color)},0.7)` : 'none',
                    opacity: isVisible ? 1 : 0.5,
                  }}
                />
                <button
                  onClick={() => { setFocused(key); if (compare) setCompare(false); }}
                  className="text-left transition-all duration-200"
                >
                  <p className="text-xs font-bold leading-tight"
                    style={{ color: isFocused && !compare ? char.color : '#64748b' }}>
                    {char.label}
                  </p>
                  <p className="text-xs text-slate-600 italic leading-tight">{char.sublabel}</p>
                </button>
              </div>
              <JourneyTimeline
                journey={char.journey}
                currentStep={steps[key] ?? 0}
                onStepChange={step => {
                  handleStepChange(key, step);
                  if (!compare) setFocused(key);
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
