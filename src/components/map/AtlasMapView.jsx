import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import MapCanvas from './MapCanvas';
import JourneyTimeline from './JourneyTimeline';
import JourneyEditor from './JourneyEditor';
import { hexToRgb } from '../../utils/color';
import { useMapStore }      from '../../stores/useMapStore';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useDb }            from '../../db/DbContext';
import { useProject }       from '../../db/ProjectContext';

function ControlButton({ active, onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200"
      style={{
        backgroundColor: active ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)',
        color:  active ? '#fff' : '#475569',
        border: `1px solid ${active ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
      }}
    >
      {children}
    </button>
  );
}

export default function AtlasMapView({ onCharacterClick, onLocationClick }) {
  const db           = useDb();
  const { projectId } = useProject();

  const journeys       = useMapStore(s => s.journeys);
  const autoJourneys   = useMapStore(s => s.autoJourneys);
  const unlocalized    = useMapStore(s => s.unlocalized);
  const mode           = useMapStore(s => s.mode);
  const setMode        = useMapStore(s => s.setMode);
  const loadAuto       = useMapStore(s => s.loadAuto);
  const mapImage       = useMapStore(s => s.mapImage);
  const saveMapImage   = useMapStore(s => s.saveMapImage);
  const persistJourney = useMapStore(s => s.persistJourney);

  const setCoordinates  = useLoreStore(s => s.setCoordinates);
  const allChars        = useLoreStore(s => s.characters);
  const allLocations    = useLoreStore(s => s.locations);
  const events          = useTimelineStore(s => s.events) ?? [];

  // ── Mode édition carte ────────────────────────────────────────────────────
  const [editMode,   setEditMode]   = useState(false);
  const [placement,  setPlacement]  = useState(null); // { x, y } clic en attente

  const unlocalizedLocs = useMemo(
    () => allLocations.filter(l => !l.coordinates),
    [allLocations],
  );

  const handleMapClick = useCallback((x, y) => {
    if (unlocalizedLocs.length === 0) return;
    setPlacement({ x, y });
  }, [unlocalizedLocs]);

  const assignLocation = useCallback((locId) => {
    if (!placement) return;
    setCoordinates(locId, { x: placement.x, y: placement.y });
    setPlacement(null);
  }, [placement, setCoordinates]);

  const handlePinRemove = useCallback((locId) => {
    setCoordinates(locId, null);
  }, [setCoordinates]);

  const handleMapFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => saveMapImage(db, projectId, ev.target.result);
    reader.readAsDataURL(file);
  }, [db, projectId, saveMapImage]);

  const locations = useMemo(() => allLocations.filter(l => l.coordinates), [allLocations]);

  // Calcul auto-journeys quand les données sont disponibles
  useEffect(() => {
    if (events.length && allLocations.length && allChars.length) {
      loadAuto(events, allLocations, allChars);
    }
  }, [events, allLocations, allChars, loadAuto]);

  // ── Personnages en mode manuel ─────────────────────────────────────────────
  const MANUAL_CHARACTERS = useMemo(() => {
    if (!journeys) return {};
    const result = {};
    allChars.forEach(c => {
      const key = c.journeyKey ?? c.id;
      if (journeys[key]?.length > 0) {
        result[key] = {
          key,
          label:        c.name,
          sublabel:     '',
          color:        c.color,
          journey:      journeys[key],
          deathEventId: c.deathEventId ?? null,
        };
      }
    });
    return result;
  }, [allChars, journeys]);

  // ── Personnages en mode auto ───────────────────────────────────────────────
  const AUTO_CHARACTERS = useMemo(() => {
    if (!autoJourneys) return {};
    const result = {};
    allChars.forEach(c => {
      const key = c.journeyKey ?? c.id;
      if (autoJourneys[key]?.length > 0) {
        result[key] = {
          key,
          label:        c.name,
          sublabel:     '',
          color:        c.color,
          journey:      autoJourneys[key],
          deathEventId: c.deathEventId ?? null,
        };
      }
    });
    return result;
  }, [allChars, autoJourneys]);

  const CHARACTERS = mode === 'auto' ? AUTO_CHARACTERS : MANUAL_CHARACTERS;
  const charKeys   = useMemo(() => Object.keys(CHARACTERS), [CHARACTERS]);

  const [steps,           setSteps]           = useState({});
  const [focused,         setFocused]         = useState(null);
  const [visible,         setVisible]         = useState({});
  const [linked,          setLinked]          = useState(false);
  const [selected,        setSelected]        = useState(new Set());
  const [charDropOpen,    setCharDropOpen]    = useState(false);
  const charDropRef = useRef(null);

  // Reset état quand le mode change
  useEffect(() => {
    setSteps({});
    setFocused(null);
    setVisible({});
    setSelected(new Set());
    setLinked(false);
    setCharDropOpen(false);
  }, [mode]);

  useEffect(() => {
    if (!charDropOpen) return;
    const handler = (e) => { if (charDropRef.current && !charDropRef.current.contains(e.target)) setCharDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [charDropOpen]);

  useEffect(() => {
    if (!charKeys.length) return;
    setSteps(prev => {
      const next = { ...prev };
      charKeys.forEach(k => { if (next[k] === undefined) next[k] = 0; });
      return next;
    });
    setVisible(prev => {
      const next = { ...prev };
      charKeys.forEach(k => { if (next[k] === undefined) next[k] = false; });
      return next;
    });
    setFocused(prev => {
      const next = (prev && charKeys.includes(prev)) ? prev : charKeys[0];
      // Afficher le premier personnage sur la carte à l'initialisation
      setVisible(v => (Object.values(v).some(Boolean) ? v : { ...v, [next]: true }));
      return next;
    });
  }, [charKeys]);

  if (!journeys && !autoJourneys) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  if (!charKeys.length) return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center px-6 py-3 border-b border-white/10 bg-[#0B1621]">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Carte <span style={{ color: '#3F51B5' }}>Interactive</span>
          </h1>
        </div>
      </header>

      {/* Zone centrale */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center">
          <span className="text-5xl">🗺️</span>
          <div>
            <p className="text-sm font-black text-slate-300 mb-1">Aucun trajet à afficher</p>
            <p className="text-xs text-slate-600 font-serif italic">
              {mode === 'auto'
                ? 'Ajoutez des personnages à vos événements timeline pour voir leurs trajets ici.'
                : 'Aucun trajet manuel disponible.'}
            </p>
          </div>

          {/* Upload carte */}
          <div className="w-full flex flex-col gap-2">
            <p className="text-xs text-slate-500 font-semibold">
              {mapImage ? 'Remplacer la carte de fond' : 'Ajouter une carte de fond'}
            </p>
            <label
              className="flex items-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all duration-150 hover:border-slate-600 w-full"
              style={{ border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
              <span className="text-xl">{mapImage ? '✓' : '↑'}</span>
              <span className="text-xs text-slate-500">
                {mapImage ? 'Carte chargée — cliquer pour remplacer' : 'Choisir une image (.jpg, .png…)'}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
            </label>
            {mapImage && (
              <button
                onClick={() => saveMapImage(db, projectId, null)}
                className="text-[10px] text-slate-700 hover:text-red-400 transition-colors text-left"
              >
                Supprimer la carte
              </button>
            )}
          </div>

          {mode === 'manual' && (
            <button
              onClick={() => setMode('auto')}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Passer en mode automatique →
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const toggleLinked = () => {
    if (!linked) {
      // Activation : initialise la sélection avec le personnage focalisé
      setSelected(new Set(focused ? [focused] : []));
    } else {
      setSelected(new Set());
    }
    setLinked(v => !v);
  };

  const handleDotClick = (key) => {
    if (linked) {
      const alreadySelected = selected.has(key);
      if (alreadySelected) {
        if (selected.size > 1) {
          setSelected(prev => { const n = new Set(prev); n.delete(key); return n; });
          setVisible(prev => ({ ...prev, [key]: false }));
        }
        return;
      }
      // Ajout à la sélection
      setSelected(prev => new Set([...prev, key]));
      setVisible(prev => ({ ...prev, [key]: true }));
      setFocused(key);
      return;
    }
    // Mode normal : afficher uniquement ce personnage
    setVisible(() => {
      const next = {};
      charKeys.forEach(k => { next[k] = k === key; });
      return next;
    });
    setFocused(key);
  };

  const handleStepChange = (charKey, newStep) => {
    if (linked && selected.size > 1) {
      const targetChapter = CHARACTERS[charKey].journey[newStep]?.chapterNum;
      const synced = { ...steps };
      selected.forEach(key => {
        if (key === charKey) {
          synced[key] = newStep;
        } else if (targetChapter != null) {
          const match = CHARACTERS[key].journey.findIndex(s => s.chapterNum === targetChapter);
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
      if (Object.values(next).every(v => !v)) return prev;
      return next;
    });
  };

  const mapCharacters = charKeys
    .filter(k => visible[k])
    .map(k => {
      const char = CHARACTERS[k];
      const deathStepIndex = char.deathEventId
        ? char.journey.findIndex(s => s.eventId === char.deathEventId)
        : -1;
      return {
        journey:         char.journey,
        currentStep:     steps[k] ?? 0,
        color:           char.color,
        name:            char.label,
        deathStepIndex,
      };
    });

  const timelineKeys = linked && selected.size > 1 ? [...selected] : (focused ? [focused] : []);

  return (
    <div className="w-full bg-[#0B1621] text-slate-200">

      {/* ── Header sticky ── */}
      <header data-tour="map-canvas" className="sticky top-0 z-20 flex items-center px-6 py-3 border-b border-white/10 bg-[#0B1621]">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Carte <span style={{ color: '#3F51B5' }}>Interactive</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {charKeys.length} personnage{charKeys.length > 1 ? 's' : ''} —
            {mode === 'auto' ? ' trajets depuis la timeline' : ' trajets manuels'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle auto / manuel */}
          <ControlButton
            active={mode === 'auto'}
            onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
            title={mode === 'auto' ? 'Trajets calculés depuis vos événements timeline' : 'Trajets extraits par Claude à l\'import'}
          >
            <span>{mode === 'auto' ? '⚡' : '📥'}</span>
            <span className="hidden sm:inline">{mode === 'auto' ? 'Timeline' : 'Import'}</span>
          </ControlButton>

          <ControlButton active={linked} onClick={toggleLinked} title="Lier les timelines — cliquer plusieurs personnages pour synchroniser">
            <span className="w-3 h-3 rounded-full border-2 transition-colors"
              style={{ borderColor: linked ? '#818cf8' : '#475569' }} />
            <span className="hidden sm:inline">Lier{linked && selected.size > 1 ? ` (${selected.size})` : ''}</span>
          </ControlButton>

          {/* Toggle mode édition */}
          <ControlButton
            active={editMode}
            onClick={() => { setEditMode(v => !v); setPlacement(null); }}
            title={editMode ? 'Quitter le mode édition' : 'Placer les lieux sur la carte'}
          >
            <span>✏️</span>
            <span className="hidden sm:inline">{editMode ? 'Édition' : 'Placer lieu'}</span>
          </ControlButton>

        </div>
      </header>

      {/* ── Bannière mode édition ── */}
      {editMode && (
        <div
          className="flex items-center gap-2 px-6 py-2 text-xs"
          style={{ backgroundColor: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}
        >
          <span style={{ color: '#818cf8' }}>✏️</span>
          <span style={{ color: '#94a3b8' }}>
            {unlocalizedLocs.length > 0
              ? `Cliquez sur la carte pour placer un lieu · ${unlocalizedLocs.length} lieu${unlocalizedLocs.length > 1 ? 'x' : ''} à positionner · Cliquez un pin rouge pour le retirer`
              : 'Tous les lieux sont positionnés · Cliquez un pin pour retirer ses coordonnées'}
          </span>
        </div>
      )}

      {/* ── Banner lieux non localisés ── */}
      {mode === 'auto' && unlocalized.length > 0 && (
        <div
          className="flex items-center gap-2 px-6 py-2 text-xs"
          style={{ backgroundColor: 'rgba(251,146,60,0.08)', borderBottom: '1px solid rgba(251,146,60,0.2)' }}
        >
          <span style={{ color: '#fb923c' }}>⚠</span>
          <span style={{ color: '#94a3b8' }}>
            {unlocalized.length} lieu{unlocalized.length > 1 ? 'x' : ''} non localisé{unlocalized.length > 1 ? 's' : ''} sur la carte —{' '}
            <span style={{ color: '#fb923c' }}>
              {unlocalized.map(l => l.name).join(', ')}
            </span>
            <span className="text-slate-600"> · Ajoutez des coordonnées dans le Lore</span>
          </span>
        </div>
      )}

      {/* ── Sélecteur de personnages ── */}
      <div
        className="px-4 py-2 border-b border-white/10 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(5,10,18,0.97)' }}
      >
        <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">Suivre</span>
        <div className="relative" ref={charDropRef}>
          {/* Bouton déclencheur */}
          <button
            onClick={() => setCharDropOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
            style={{
              minWidth: 180,
              backgroundColor: linked
                ? selected.size > 0 ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)'
                : focused ? `rgba(${hexToRgb(CHARACTERS[focused]?.color ?? '#94a3b8')},0.15)` : 'rgba(255,255,255,0.06)',
              color: linked
                ? selected.size > 0 ? '#818cf8' : '#94a3b8'
                : focused ? (CHARACTERS[focused]?.color ?? '#94a3b8') : '#94a3b8',
              border: linked
                ? selected.size > 0 ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.1)'
                : focused ? `1px solid rgba(${hexToRgb(CHARACTERS[focused]?.color ?? '#94a3b8')},0.35)` : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {linked ? (
              <>
                <span className="w-2 h-2 rounded flex-shrink-0" style={{ backgroundColor: selected.size > 0 ? '#818cf8' : '#334155' }} />
                {selected.size > 1 ? `${selected.size} personnages` : selected.size === 1 ? CHARACTERS[[...selected][0]]?.label : 'Sélectionner…'}
              </>
            ) : focused ? (
              <>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHARACTERS[focused]?.color }} />
                {CHARACTERS[focused]?.label}
                <span className="text-[10px] font-mono opacity-60 ml-0.5">
                  {(steps[focused] ?? 0) + 1}/{CHARACTERS[focused]?.journey.length}
                </span>
              </>
            ) : (
              <>
                <span className="text-slate-500">👤</span>
                Tous les personnages
              </>
            )}
            <span className="ml-auto text-slate-600 text-[10px]">{charDropOpen ? '▲' : '▼'}</span>
          </button>

          {/* Dropdown */}
          {charDropOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden"
              style={{ minWidth: 220, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
            >
              {charKeys.map(key => {
                const char       = CHARACTERS[key];
                const isFocused  = focused === key;
                const isSelected = selected.has(key);
                const isVisible  = visible[key] ?? true;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-2 transition-all duration-100 hover:bg-white/5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleDotClick(key);
                      if (!linked) setCharDropOpen(false);
                    }}
                  >
                    {/* Case à cocher en mode lier */}
                    {linked && (
                      <span
                        className="w-3.5 h-3.5 rounded flex items-center justify-center flex-shrink-0 text-[8px] font-black transition-all"
                        style={{
                          backgroundColor: isSelected ? char.color : 'rgba(255,255,255,0.05)',
                          color:           isSelected ? '#000' : '#334155',
                          border:          isSelected ? 'none' : '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        {isSelected ? '✓' : ''}
                      </span>
                    )}
                    {/* Point couleur */}
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: isVisible ? char.color : 'transparent',
                        border:          isVisible ? 'none' : `1.5px solid ${char.color}`,
                        opacity:         isVisible ? 1 : 0.4,
                      }}
                    />
                    <span className="text-xs font-semibold flex-1 truncate"
                      style={{ color: isSelected || isFocused ? char.color : '#64748b' }}>
                      {char.label}
                    </span>
                    <span className="text-[10px] font-mono flex-shrink-0"
                      style={{ color: isSelected || isFocused ? char.color : '#334155' }}>
                      {(steps[key] ?? 0) + 1}/{char.journey.length}
                    </span>
                    {/* Œil visibilité */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleVisible(key); }}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-white/10"
                      style={{ color: isVisible ? '#475569' : '#1e293b' }}
                      title={isVisible ? 'Masquer sur la carte' : 'Afficher sur la carte'}
                    >
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        {isVisible
                          ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>
                          : <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></>
                        }
                      </svg>
                    </button>
                  </div>
                );
              })}
              {/* Tout masquer / afficher */}
              <div className="border-t border-white/5 p-1">
                {(() => {
                  const visibleCount = charKeys.filter(k => visible[k]).length;
                  const allVisible   = visibleCount === charKeys.length;
                  return (
                    <button
                      onClick={() => setVisible(prev => { const n = { ...prev }; charKeys.forEach(k => { n[k] = !allVisible; }); return n; })}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                    >
                      {allVisible ? 'Tout masquer' : visibleCount === 0 ? 'Tout afficher' : `${visibleCount}/${charKeys.length} affichés · tout ${allVisible ? 'masquer' : 'afficher'}`}
                    </button>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Éditeur de trajets manuels ── */}
      {mode === 'manual' && (
        <JourneyEditor
          characters={allChars}
          locations={allLocations}
          journeys={journeys}
          onSave={(charKey, steps) => persistJourney(db, projectId, charKey, steps)}
        />
      )}

      {/* ── Corps : Carte ── */}
      <div className="w-full h-[60vh] relative">
        <MapCanvas
          characters={mapCharacters}
          locations={locations}
          onLocationClick={editMode ? undefined : onLocationClick}
          mapSrc={mapImage}
          editMode={editMode}
          onMapClick={handleMapClick}
          onPinRemove={handlePinRemove}
        />

        {/* Popup de placement de lieu */}
        {placement && unlocalizedLocs.length > 0 && (
          <div
            className="absolute z-50 rounded-xl overflow-hidden"
            style={{
              left: `${Math.min(placement.x, 75)}%`,
              top:  `${Math.min(placement.y, 70)}%`,
              backgroundColor: '#0d1b2a',
              border: '1px solid rgba(99,102,241,0.4)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
              minWidth: 200,
            }}
          >
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Placer ici</p>
              <button onClick={() => setPlacement(null)} className="text-slate-600 hover:text-slate-300 text-xs transition-colors">×</button>
            </div>
            <div className="p-1 max-h-48 overflow-y-auto">
              {unlocalizedLocs.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => assignLocation(loc.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-white/5 transition-colors"
                >
                  📍 {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Footer : timelines ── */}
      {timelineKeys.length > 0 && (
        <footer
          data-tour="map-journeys"
          className="px-6 pt-8 pb-4 flex flex-col gap-4"
          style={{ backgroundColor: 'rgba(5,10,18,0.97)' }}
        >
          <div>
            <h2 className="text-sm font-black tracking-tight text-slate-200">Trajets des personnages</h2>
            <p className="text-xs text-slate-500 font-serif italic mt-0.5">
              Naviguez chapitre par chapitre sur la carte — cliquez un lieu pour en voir le détail.
            </p>
          </div>
          <div className="flex flex-col gap-1.5">
            {timelineKeys.map(key => {
              const char = CHARACTERS[key];
              return (
                <div key={key} className="flex items-center gap-2">
                  {timelineKeys.length > 1 && (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />
                      <span className="text-[10px] w-20 truncate flex-shrink-0" style={{ color: char.color }}>{char.label}</span>
                    </>
                  )}
                  <JourneyTimeline
                    journey={char.journey}
                    currentStep={steps[key] ?? 0}
                    onStepChange={step => handleStepChange(key, step)}
                    color={char.color}
                    showLabels
                  />
                </div>
              );
            })}
          </div>
        </footer>
      )}

    </div>
  );
}
