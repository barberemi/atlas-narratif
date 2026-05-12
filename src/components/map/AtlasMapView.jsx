import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MapCanvas from './MapCanvas';
import JourneyMatrix from './JourneyMatrix';
import JourneyEditor from './JourneyEditor';
import { hexToRgb } from '../../utils/color';
import Skeleton from '../ui/Skeleton';
import { useMapStore }      from '../../stores/useMapStore';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useVolumeStore }    from '../../stores/useVolumeStore';
import { useStoreLoader }   from '../../hooks/useStoreLoader';

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

export default function AtlasMapView({ onLocationClick }) {
  const { t } = useTranslation();

  useStoreLoader([useMapStore, useTimelineStore]);

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
  const events          = useTimelineStore(s => s.events);
  const activeVolumeId  = useVolumeStore(s => s.activeVolumeId);

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
    reader.onload = (ev) => saveMapImage(ev.target.result);
    reader.readAsDataURL(file);
  }, [saveMapImage]);

  const locations = useMemo(() => allLocations.filter(l => l.coordinates), [allLocations]);

  // Calcul auto-journeys quand les données sont disponibles
  useEffect(() => {
    const evts = events ?? [];
    if (evts.length && allLocations.length && allChars.length) {
      loadAuto(evts, allLocations, allChars);
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
  const [selectedEvent,   setSelectedEvent]   = useState(null);
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

  if (!journeys && !autoJourneys) return <Skeleton variant="card" />;

  if (!charKeys.length) return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20 flex items-center px-6 py-3 border-b border-white/10 bg-[#0B1621]">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            {t('nav.map')} <span style={{ color: '#3F51B5' }}>Interactive</span>
          </h1>
        </div>
        {mapImage && allLocations.length > 0 && (
          <ControlButton
            active={editMode}
            onClick={() => { setEditMode(v => !v); setPlacement(null); }}
            title={editMode ? t('map.exitEditMode') : t('map.enterEditMode')}
          >
            <span>✏️</span>
            <span className="hidden sm:inline">{editMode ? t('map.editing') : t('map.placeLocation')}</span>
          </ControlButton>
        )}
      </header>

      {/* Bannière mode édition */}
      {editMode && mapImage && (
        <div
          className="flex items-center gap-2 px-6 py-2 text-xs"
          style={{ backgroundColor: 'rgba(99,102,241,0.08)', borderBottom: '1px solid rgba(99,102,241,0.2)' }}
        >
          <span style={{ color: '#818cf8' }}>✏️</span>
          <span style={{ color: '#94a3b8' }}>
            {unlocalizedLocs.length > 0
              ? t('map.editBannerUnlocalized', { count: unlocalizedLocs.length })
              : t('map.editBannerAllPlaced')}
          </span>
        </div>
      )}

      {mapImage ? (
        <>
          {/* Carte uploadée — même rendu que le mode normal */}
          <div className="flex-1 flex flex-col min-h-0 px-6 md:px-16 py-4 gap-4">
            <div className="w-full relative z-0 overflow-hidden rounded-lg flex-1 min-h-0">
              <MapCanvas
                characters={[]}
                locations={locations}
                mapSrc={mapImage}
                editMode={editMode}
                onMapClick={handleMapClick}
                onPinRemove={handlePinRemove}
              />
              <div className="absolute bottom-3 right-3 z-10">
                <label
                  className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-white/15"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {t('map.replaceBackground')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
                </label>
              </div>

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
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('map.placeHere')}</p>
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
            {!editMode && (
              <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-xl"
                style={{ backgroundColor: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
                <span className="text-base">💡</span>
                <p className="text-xs text-slate-400">
                  {t('map.noDataHint')}
                </p>
              </div>
            )}
          </div>
        </>
      ) : (
        /* État vide — pas de carte */
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="flex flex-col items-center gap-6 max-w-sm text-center">
            <span className="text-5xl">🗺️</span>
            <div>
              <p className="text-sm font-black text-slate-300 mb-1">{t('map.noJourneys')}</p>
              <p className="text-xs text-slate-600 font-serif italic">
                {mode === 'auto'
                  ? t('map.noJourneysAutoHint')
                  : t('map.noJourneysManualHint')}
              </p>
            </div>

            {/* Upload carte */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-xs text-slate-500 font-semibold">
                {t('map.addBackground')}
              </p>
              <label
                className="flex items-center gap-3 px-4 py-4 rounded-xl cursor-pointer transition-all duration-150 hover:border-slate-600 w-full"
                style={{ border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}
              >
                <span className="text-xl">↑</span>
                <span className="text-xs text-slate-500">
                  {t('map.chooseImage')}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
              </label>
            </div>

            {mode === 'manual' && (
              <button
                onClick={() => setMode('auto')}
                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                {t('map.switchToAuto')}
              </button>
            )}
          </div>
        </div>
      )}
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


  // Sync matrice → carte : cliquer un dot déplace le personnage sur la carte
  const handleEventSelect = (event) => {
    setSelectedEvent(event);
    const newSteps = { ...steps };
    const targetChapter = event.chapter;

    // En mode lié : placer tous les personnages visibles au chapitre le plus proche
    if (linked && selected.size > 1) {
      for (const key of selected) {
        const char = CHARACTERS[key];
        if (!char || !visible[key]) continue;
        // Chercher un événement exact dans ce chapitre
        const exact = char.journey.findIndex(s => s.eventId === event.id);
        if (exact !== -1) { newSteps[key] = exact; continue; }
        // Sinon, chercher le chapitre le plus proche
        const sameChapter = char.journey.findIndex(s => s.chapterNum === targetChapter);
        if (sameChapter !== -1) { newSteps[key] = sameChapter; continue; }
        // Sinon, le chapitre précédent le plus proche
        let closest = -1;
        for (let i = char.journey.length - 1; i >= 0; i--) {
          if (char.journey[i].chapterNum <= targetChapter) { closest = i; break; }
        }
        if (closest !== -1) { newSteps[key] = closest; continue; }
        // Sinon, le premier chapitre suivant
        const next = char.journey.findIndex(s => s.chapterNum > targetChapter);
        if (next !== -1) newSteps[key] = next;
      }
    } else {
      // Mode normal : ne déplacer que les personnages présents dans l'événement
      for (const entity of (event.entities ?? []).filter(e => e.entityType === 'character')) {
        const key = allChars.find(c => c.id === entity.id)?.journeyKey ?? entity.id;
        const char = CHARACTERS[key];
        if (!char || !visible[key]) continue;
        const stepIdx = char.journey.findIndex(s => s.eventId === event.id);
        if (stepIdx !== -1) newSteps[key] = stepIdx;
      }
    }

    setSteps(newSteps);
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

  return (
    <div className="w-full bg-[#0B1621] text-slate-200">

      {/* ── Header sticky ── */}
      <header data-tour="map-canvas" className="sticky top-0 z-20 flex items-center px-6 py-3 border-b border-white/10 bg-[#0B1621]">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            {t('nav.map')} <span style={{ color: '#3F51B5' }}>Interactive</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {t('map.charCount', { count: charKeys.length })} —
            {mode === 'auto' ? ` ${t('map.journeysFromTimeline')}` : ` ${t('map.manualJourneys')}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Toggle auto / manuel */}
          <ControlButton
            active={mode === 'auto'}
            onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
            title={mode === 'auto' ? t('map.autoModeTitle') : t('map.manualModeTitle')}
          >
            <span>{mode === 'auto' ? '⚡' : '📥'}</span>
            <span className="hidden sm:inline">{mode === 'auto' ? t('map.autoModeLabel') : t('map.manualModeLabel')}</span>
          </ControlButton>

          <ControlButton active={linked} onClick={toggleLinked} title={t('map.linkTitle')}>
            <span className="w-3 h-3 rounded-full border-2 transition-colors"
              style={{ borderColor: linked ? '#818cf8' : '#475569' }} />
            <span className="hidden sm:inline">{t('map.link')}{linked && selected.size > 1 ? ` (${selected.size})` : ''}</span>
          </ControlButton>

          {/* Toggle mode édition */}
          <ControlButton
            active={editMode}
            onClick={() => { setEditMode(v => !v); setPlacement(null); }}
            title={editMode ? t('map.exitEditMode') : t('map.enterEditMode')}
          >
            <span>✏️</span>
            <span className="hidden sm:inline">{editMode ? t('map.editing') : t('map.placeLocation')}</span>
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
              ? t('map.editBannerUnlocalized', { count: unlocalizedLocs.length })
              : t('map.editBannerAllPlaced')}
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
            {t('map.unlocalizedWarning', { count: unlocalized.length })} —{' '}
            <span style={{ color: '#fb923c' }}>
              {unlocalized.map(l => l.name).join(', ')}
            </span>
            <span className="text-slate-600"> · {t('map.addCoordsInLore')}</span>
          </span>
        </div>
      )}

      {/* ── Sélecteur de personnages ── */}
      <div
        className="px-4 py-2 border-b border-white/10 flex items-center gap-3"
        style={{ backgroundColor: 'rgba(11,22,33,0.97)' }}
      >
        <span className="text-xs text-slate-500 uppercase tracking-widest flex-shrink-0">{t('map.follow')}</span>
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
                {selected.size > 1 ? t('map.charCount', { count: selected.size }) : selected.size === 1 ? CHARACTERS[[...selected][0]]?.label : t('map.select')}
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
                {t('map.allCharacters')}
              </>
            )}
            <span className="ml-auto text-slate-600 text-[10px]">{charDropOpen ? '▲' : '▼'}</span>
          </button>

          {/* Dropdown */}
          {charDropOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-y-auto"
              style={{ minWidth: 220, maxHeight: 'calc(100vh - 120px)', backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
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
                      title={isVisible ? t('map.hideOnMap') : t('map.showOnMap')}
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
                      {allVisible ? t('map.hideAll') : visibleCount === 0 ? t('map.showAll') : `${visibleCount}/${charKeys.length} · ${allVisible ? t('map.hideAll') : t('map.showAll')}`}
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
          onSave={(charKey, steps) => persistJourney(charKey, steps)}
        />
      )}

      {/* ── Corps : Carte ── */}
      <div className="px-6 md:px-16">
      <div
        className="w-full relative z-0 overflow-hidden rounded-lg"
        style={{ aspectRatio: '1126 / 845', maxHeight: '70vh' }}
      >
        <MapCanvas
          characters={mapCharacters}
          locations={locations}
          onLocationClick={editMode ? undefined : onLocationClick}
          mapSrc={mapImage}
          editMode={editMode}
          onMapClick={handleMapClick}
          onPinRemove={handlePinRemove}
        />

        {/* Bouton remplacer le fond */}
        <div className="absolute bottom-3 right-3 z-10">
          <label
            className="px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-white/15"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {t('map.replaceBackground')}
            <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
          </label>
        </div>

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
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('map.placeHere')}</p>
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
      </div>

      {/* ── Événement sélectionné ── */}
      {selectedEvent && (
        <div className="px-6 py-3 flex-shrink-0" style={{ backgroundColor: 'rgba(11,22,33,0.97)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mb-1">
            {t('map.selectedEvent', 'Événement sélectionné')}
          </p>
          <p className="text-xs text-slate-500">
            {t('timeline.chapter', { n: selectedEvent.chapter })}
            {selectedEvent.povCharacterId ? ` · ${allChars.find(c => c.id === selectedEvent.povCharacterId)?.name ?? ''}` : ''}
          </p>
          <p className="text-sm font-black text-slate-200 mt-0.5">{selectedEvent.title}</p>
          {selectedEvent.description && (
            <p className="text-xs text-slate-400 font-serif italic mt-0.5 leading-relaxed line-clamp-2">
              « {selectedEvent.description} »
            </p>
          )}
        </div>
      )}

      {/* ── Footer : matrice personnages × chapitres ── */}
      {events?.length > 0 && (
        <footer data-tour="map-journeys">
          <JourneyMatrix
            events={events}
            characters={allChars.filter(c => visible[c.journeyKey ?? c.id])}
            activeVolumeId={activeVolumeId}
            onEventSelect={handleEventSelect}
          />
        </footer>
      )}

    </div>
  );
}
