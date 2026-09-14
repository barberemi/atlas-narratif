import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import MapCanvas from './MapCanvas';
import ChapterCursor from './ChapterCursor';
import PresenceStrip from './PresenceStrip';
import JourneyGrid from './JourneyGrid';
import JourneyEditor from './JourneyEditor';
import { hexToRgb } from '../../utils/color';
import { detectGatherings } from '../../utils/gatherings';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import { HeaderToggle } from '../ui/HeaderButton';
import { useMapStore }      from '../../stores/useMapStore';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useVolumeStore }    from '../../stores/useVolumeStore';
import { useStoreLoader }   from '../../hooks/useStoreLoader';

// Style unifié (famille « onglet souligné » de la Timeline)
const ControlButton = HeaderToggle;

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

  // ── Chapitres (axe temps partagé, mode auto) ───────────────────────────────
  const chapters = useMemo(() => {
    const evts = (events ?? []).filter(e => !activeVolumeId || e.volumeId === activeVolumeId);
    const chapMap = new Map();
    for (const e of evts) {
      if (!chapMap.has(e.chapter)) chapMap.set(e.chapter, { number: e.chapter, title: e.chapterTitle });
    }
    return [...chapMap.values()].sort((a, b) => a.number - b.number);
  }, [events, activeVolumeId]);

  const [currentChapterIdx, setCurrentChapterIdx] = useState(0);
  const [focused,         setFocused]         = useState(null);
  const [visible,         setVisible]         = useState({});
  const [stripOpen,       setStripOpen]       = useState(false); // frise repliée par défaut (place à la carte)
  const [viewMode,        setViewMode]        = useState('single'); // 'single' | 'grid' (mini-cartes)
  const [playing,         setPlaying]         = useState(false);    // lecture animée (piste 7)
  const [isFullscreen,    setIsFullscreen]    = useState(false);    // mode plein écran
  const [charDropOpen,    setCharDropOpen]    = useState(false);
  const charDropRef = useRef(null);

  // Reset état quand le mode change
  useEffect(() => {
    setCurrentChapterIdx(0);
    setFocused(null);
    setVisible({});
    setCharDropOpen(false);
    setPlaying(false);
  }, [mode]);

  // Clamp / reset du curseur quand la liste de chapitres change (ex: filtre de tome)
  useEffect(() => {
    setCurrentChapterIdx(prev => Math.min(prev, Math.max(0, chapters.length - 1)));
  }, [chapters.length]);

  // Lecture animée : avance le curseur chapitre par chapitre (piste 7)
  useEffect(() => {
    if (!playing || viewMode !== 'single' || mode !== 'auto') return;
    if (currentChapterIdx >= chapters.length - 1) { setPlaying(false); return; }
    const id = setTimeout(() => setCurrentChapterIdx(i => Math.min(chapters.length - 1, i + 1)), 1100);
    return () => clearTimeout(id);
  }, [playing, viewMode, mode, currentChapterIdx, chapters.length]);

  const currentChapterNum = chapters[currentChapterIdx]?.number ?? Infinity;

  // Échap quitte le plein écran
  useEffect(() => {
    if (!isFullscreen) return;
    const onKey = (e) => { if (e.key === 'Escape') setIsFullscreen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isFullscreen]);

  useEffect(() => {
    if (!charDropOpen) return;
    const handler = (e) => { if (charDropRef.current && !charDropRef.current.contains(e.target)) setCharDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [charDropOpen]);

  useEffect(() => {
    if (!charKeys.length) return;
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
    <div className="h-full w-full flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="z-20 flex items-center px-6 py-5 border-b border-atlas-line bg-atlas-ink">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">
            Univers · géographie du récit
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            {t('nav.map')} <span className="italic" style={{ color: '#5cae8e' }}>interactive</span>
          </h1>
        </div>
        {mapImage && allLocations.length > 0 && (
          <ControlButton
            active={editMode}
            onClick={() => { setEditMode(v => !v); setPlacement(null); }}
            title={editMode ? t('map.exitEditMode') : t('map.enterEditMode')}
          >
            <Icon name="edit" size={16} />
            <span className="hidden sm:inline">{editMode ? t('map.editing') : t('map.placeLocation')}</span>
          </ControlButton>
        )}
      </header>

      {/* Bannière mode édition */}
      {editMode && mapImage && (
        <div
          className="flex items-center gap-2 px-6 py-2 text-xs"
          style={{ backgroundColor: 'rgba(92,174,142,0.08)', borderBottom: '1px solid rgba(92,174,142,0.2)' }}
        >
          <Icon name="edit" size={16} style={{ color: '#5cae8e' }} />
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
            <div className="w-full relative z-0 overflow-hidden rounded-none flex-1 min-h-0">
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
                  className="px-3 py-1.5 rounded-none text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-white/15"
                  style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {t('map.replaceBackground')}
                  <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
                </label>
              </div>

              {/* Popup de placement de lieu */}
              {placement && unlocalizedLocs.length > 0 && (
                <div
                  className="absolute z-50 rounded-none overflow-hidden"
                  style={{
                    left: `${Math.min(placement.x, 75)}%`,
                    top:  `${Math.min(placement.y, 70)}%`,
                    backgroundColor: 'var(--color-atlas-ink)',
                    border: '1px solid rgba(92,174,142,0.4)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                    minWidth: 200,
                  }}
                >
                  <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('map.placeHere')}</p>
                    <button onClick={() => setPlacement(null)} className="text-atlas-mute hover:text-slate-300 text-xs transition-colors"><Icon name="close" size={12} /></button>
                  </div>
                  <div className="p-1 max-h-48 overflow-y-auto">
                    {unlocalizedLocs.map(loc => (
                      <button
                        key={loc.id}
                        onClick={() => assignLocation(loc.id)}
                        className="w-full text-left px-3 py-2 rounded-none text-xs text-slate-300 hover:bg-white/5 transition-colors"
                      >
                        <Icon name="location" size={13} className="inline align-text-bottom mr-1" /> {loc.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {!editMode && (
              <div className="flex items-center justify-center gap-3 py-2 px-4 rounded-none"
                style={{ backgroundColor: 'rgba(92,174,142,0.06)', border: '1px solid rgba(92,174,142,0.15)' }}>
                <Icon name="idea" size={16} />
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
            <Icon name="map" size={48} />
            <div>
              <p className="text-sm font-black text-slate-300 mb-1">{t('map.noJourneys')}</p>
              <p className="text-xs text-atlas-mute font-serif italic">
                {mode === 'auto'
                  ? t('map.noJourneysAutoHint')
                  : t('map.noJourneysManualHint')}
              </p>
            </div>

            {/* Upload carte */}
            <div className="w-full flex flex-col gap-2">
              <p className="text-xs text-atlas-soft font-semibold">
                {t('map.addBackground')}
              </p>
              <label
                className="flex items-center gap-3 px-4 py-4 rounded-none cursor-pointer transition-all duration-150 hover:border-slate-600 w-full"
                style={{ border: '1px dashed rgba(255,255,255,0.1)', backgroundColor: 'rgba(0,0,0,0.2)' }}
              >
                <span className="text-xl">↑</span>
                <span className="text-xs text-atlas-soft">
                  {t('map.chooseImage')}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
              </label>
            </div>

            {mode === 'manual' && (
              <button
                onClick={() => setMode('auto')}
                className="text-xs text-[#5cae8e] hover:brightness-125 transition-colors"
              >
                {t('map.switchToAuto')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const handleDotClick = (key) => {
    // Afficher uniquement ce personnage
    setVisible(() => {
      const next = {};
      charKeys.forEach(k => { next[k] = k === key; });
      return next;
    });
    setFocused(key);
  };

  const toggleVisible = (charKey) => {
    setVisible(prev => {
      const next = { ...prev, [charKey]: !prev[charKey] };
      if (Object.values(next).every(v => !v)) return prev;
      return next;
    });
  };

  // Étape courante d'un personnage : dernière étape dont le chapitre <= curseur.
  // En mode manuel (pas de chapitres), on affiche le trajet complet.
  const stepForChar = (char) => {
    if (mode !== 'auto') return char.journey.length - 1;
    let idx = -1; // -1 = pas encore entré dans le récit à ce chapitre
    for (let i = 0; i < char.journey.length; i++) {
      if (char.journey[i].chapterNum <= currentChapterNum) idx = i;
      else break;
    }
    return idx;
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
        currentStep:     stepForChar(char),
        color:           char.color,
        name:            char.label,
        deathStepIndex,
      };
    });

  // ── Convergences / divergences (piste 4) ───────────────────────────────────
  const gatheringsByChapter = (mode === 'auto' && chapters.length)
    ? detectGatherings(charKeys.filter(k => visible[k]).map(k => CHARACTERS[k]), chapters)
    : [];

  // Repères sur le curseur : ◆ rassemblement / ◇ scission par chapitre
  const cursorMarkers = gatheringsByChapter.map(g => {
    const gather = g.gatherings.length > 0;
    const split  = g.splits.length > 0;
    if (!gather && !split) return null;
    const parts = [];
    if (gather) parts.push(`${t('map.gatheringLabel')} · ${g.gatherings.map(x => `${x.members.join(', ')} → ${x.lieu}`).join(' ; ')}`);
    if (split)  parts.push(`${t('map.splitLabel')} · ${g.splits.map(x => x.lieu).join(', ')}`);
    return { gather, split, label: parts.join('   ·   ') };
  });

  // Légende « qui est ensemble » au chapitre courant
  const currentTogether = gatheringsByChapter[currentChapterIdx]?.together ?? [];
  const currentInfo = currentTogether.length
    ? currentTogether.map(g => `${g.lieu} : ${g.members.join(', ')}`).join('   ·   ')
    : null;

  // Anneaux sur la carte : lieux où ≥2 personnages affichés sont réunis au chapitre courant
  const gatheringRings = (() => {
    const byLoc = new Map();
    for (const mc of mapCharacters) {
      const step = mc.journey[mc.currentStep];
      if (!step || step.x == null || step.y == null || step.locationId == null) continue;
      const cur = byLoc.get(step.locationId) ?? { x: step.x, y: step.y, count: 0 };
      cur.count += 1;
      byLoc.set(step.locationId, cur);
    }
    return [...byLoc.values()].filter(g => g.count >= 2);
  })();

  // Déplacement manuel du curseur → met la lecture en pause (piste 7)
  const seek = (i) => { setPlaying(false); setCurrentChapterIdx(i); };

  return (
    <div className={isFullscreen
      ? 'fixed inset-0 z-[60] w-full flex flex-col overflow-hidden bg-atlas-ink text-slate-200'
      : 'h-full w-full max-w-[1280px] mx-auto flex flex-col overflow-hidden bg-atlas-ink text-slate-200'}>

      {/* ── Header sticky ── */}
      <header data-tour="map-canvas" className={`z-20 flex items-center border-b border-atlas-line bg-atlas-ink ${isFullscreen ? 'px-4 py-2' : 'px-6 py-2.5'}`}>
        <div className="flex-1 min-w-0">
          {!isFullscreen && (
            <>
              <p className="font-grotesk text-[9px] uppercase tracking-[0.2em] text-atlas-gold mb-0.5">
                Univers · géographie du récit · {t('map.charCount', { count: charKeys.length })}
              </p>
              <h1 className="font-serif text-2xl font-semibold tracking-tight leading-none">
                {t('nav.map')} <span className="italic" style={{ color: '#5cae8e' }}>interactive</span>
              </h1>
            </>
          )}
        </div>
        <div className="flex items-center gap-5">
          {/* Toggle plein écran */}
          <ControlButton
            active={isFullscreen}
            onClick={() => setIsFullscreen(v => !v)}
            title={isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}
          >
            <Icon name={isFullscreen ? 'shrink' : 'expand'} size={15} />
            <span className="hidden sm:inline">{isFullscreen ? t('map.exitFullscreen') : t('map.fullscreen')}</span>
          </ControlButton>

          {/* Toggle auto / manuel */}
          <ControlButton
            active={mode === 'auto'}
            onClick={() => setMode(mode === 'auto' ? 'manual' : 'auto')}
            title={mode === 'auto' ? t('map.autoModeTitle') : t('map.manualModeTitle')}
          >
            {mode === 'auto' ? <Icon name="rescan" size={14} /> : <Icon name="import" size={14} />}
            <span className="hidden sm:inline">{mode === 'auto' ? t('map.autoModeLabel') : t('map.manualModeLabel')}</span>
          </ControlButton>

          {/* Toggle carte unique / mini-cartes */}
          <ControlButton
            active={viewMode === 'grid'}
            onClick={() => { setViewMode(v => (v === 'grid' ? 'single' : 'grid')); setPlaying(false); }}
            title={viewMode === 'grid' ? t('map.singleViewTitle') : t('map.gridViewTitle')}
          >
            <Icon name={viewMode === 'grid' ? 'map' : 'grid'} size={15} />
            <span className="hidden sm:inline">{viewMode === 'grid' ? t('map.singleView') : t('map.gridView')}</span>
          </ControlButton>

          {/* Toggle mode édition */}
          {viewMode === 'single' && (
            <ControlButton
              active={editMode}
              onClick={() => { setEditMode(v => !v); setPlacement(null); }}
              title={editMode ? t('map.exitEditMode') : t('map.enterEditMode')}
            >
              <Icon name="edit" size={16} />
              <span className="hidden sm:inline">{editMode ? t('map.editing') : t('map.placeLocation')}</span>
            </ControlButton>
          )}

        </div>
      </header>

      {/* ── Bannière mode édition ── */}
      {editMode && (
        <div
          className="flex items-center gap-2 px-6 py-2 text-xs"
          style={{ backgroundColor: 'rgba(92,174,142,0.08)', borderBottom: '1px solid rgba(92,174,142,0.2)' }}
        >
          <Icon name="edit" size={16} style={{ color: '#5cae8e' }} />
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
          <Icon name="warning" size={16} style={{ color: '#fb923c' }} />
          <span style={{ color: '#94a3b8' }}>
            {t('map.unlocalizedWarning', { count: unlocalized.length })} ·{' '}
            <span style={{ color: '#fb923c' }}>
              {unlocalized.map(l => l.name).join(', ')}
            </span>
            <span className="text-atlas-mute"> · {t('map.addCoordsInLore')}</span>
          </span>
        </div>
      )}

      {/* ── Sélecteur de personnages ── */}
      <div
        className="px-4 py-1.5 border-b border-atlas-line flex items-center gap-3"
        style={{ backgroundColor: 'rgba(21,23,27,0.97)' }}
      >
        <span className="text-xs font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em] flex-shrink-0">{t('map.follow')}</span>
        <div className="relative" ref={charDropRef}>
          {/* Bouton déclencheur */}
          <button
            onClick={() => setCharDropOpen(v => !v)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-none text-xs font-semibold transition-all duration-150"
            style={{
              minWidth: 180,
              backgroundColor: focused ? `rgba(${hexToRgb(CHARACTERS[focused]?.color ?? '#94a3b8')},0.15)` : 'rgba(255,255,255,0.06)',
              color:           focused ? (CHARACTERS[focused]?.color ?? '#94a3b8') : '#94a3b8',
              border:          focused ? `1px solid rgba(${hexToRgb(CHARACTERS[focused]?.color ?? '#94a3b8')},0.35)` : '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {focused ? (
              <>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: CHARACTERS[focused]?.color }} />
                {CHARACTERS[focused]?.label}
              </>
            ) : (
              <>
                <Icon name="user" size={16} className="text-atlas-soft" />
                {t('map.allCharacters')}
              </>
            )}
            <Icon name={charDropOpen ? 'chevronUp' : 'chevronDown'} size={12} className="ml-auto text-atlas-mute" />
          </button>

          {/* Dropdown */}
          {charDropOpen && (
            <div
              className="absolute left-0 top-full mt-1 z-30 rounded-none overflow-y-auto"
              style={{ minWidth: 220, maxHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--color-atlas-ink)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
            >
              {charKeys.map(key => {
                const char       = CHARACTERS[key];
                const isFocused  = focused === key;
                const isVisible  = visible[key] ?? true;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 px-3 py-2 transition-all duration-100 hover:bg-white/5"
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      handleDotClick(key);
                      setCharDropOpen(false);
                    }}
                  >
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
                      style={{ color: isFocused ? char.color : 'var(--color-atlas-soft)' }}>
                      {char.label}
                    </span>
                    {/* Œil visibilité */}
                    <button
                      onClick={e => { e.stopPropagation(); toggleVisible(key); }}
                      className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded transition-all hover:bg-white/10"
                      style={{ color: isVisible ? 'var(--color-atlas-mute)' : '#1e293b' }}
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
                      className="w-full text-left px-3 py-1.5 rounded-none text-[10px] font-bold text-atlas-mute hover:text-slate-400 hover:bg-white/5 transition-all"
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

      {/* ── Milieu : mini-cartes OU éditeur (manuel) + carte héros — remplit la hauteur ── */}
      <div className="flex-1 min-h-0 flex flex-col">

      {viewMode === 'grid' ? (
        <JourneyGrid
          characters={charKeys.filter(k => visible[k]).map(k => CHARACTERS[k])}
          mapSrc={mapImage}
        />
      ) : (
      <>
      {/* ── Éditeur de trajets manuels ── */}
      {mode === 'manual' && (
        <div className="max-h-[45vh] overflow-y-auto flex-shrink-0">
          <JourneyEditor
            characters={allChars}
            locations={allLocations}
            journeys={journeys}
            onSave={(charKey, steps) => persistJourney(charKey, steps)}
          />
        </div>
      )}

      {/* ── Corps : Carte (héros) — cadre au ratio de la carte, centré (pas de halo) ── */}
      <div className="flex-1 min-h-0 px-6 md:px-16 pb-4 relative">
      <div
        className="absolute z-0 overflow-hidden rounded-none"
        style={{ inset: 0, margin: 'auto', aspectRatio: '1126 / 845', maxWidth: '100%', maxHeight: '100%', border: '1px solid var(--color-atlas-line)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
      >
        <MapCanvas
          characters={mapCharacters}
          locations={locations}
          gatherings={gatheringRings}
          onLocationClick={editMode ? undefined : onLocationClick}
          mapSrc={mapImage}
          editMode={editMode}
          onMapClick={handleMapClick}
          onPinRemove={handlePinRemove}
        />

        {/* Bouton remplacer le fond */}
        <div className="absolute bottom-3 right-3 z-10">
          <label
            className="px-3 py-1.5 rounded-none text-xs font-bold cursor-pointer transition-all duration-150 hover:bg-white/15"
            style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            {t('map.replaceBackground')}
            <input type="file" accept="image/*" className="hidden" onChange={handleMapFile} />
          </label>
        </div>

        {/* Popup de placement de lieu */}
        {placement && unlocalizedLocs.length > 0 && (
          <div
            className="absolute z-50 rounded-none overflow-hidden"
            style={{
              left: `${Math.min(placement.x, 75)}%`,
              top:  `${Math.min(placement.y, 70)}%`,
              backgroundColor: 'var(--color-atlas-ink)',
              border: '1px solid rgba(92,174,142,0.4)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
              minWidth: 200,
            }}
          >
            <div className="px-3 pt-3 pb-1 flex items-center justify-between">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('map.placeHere')}</p>
              <button onClick={() => setPlacement(null)} className="text-atlas-mute hover:text-slate-300 text-xs transition-colors"><Icon name="close" size={12} /></button>
            </div>
            <div className="p-1 max-h-48 overflow-y-auto">
              {unlocalizedLocs.map(loc => (
                <button
                  key={loc.id}
                  onClick={() => assignLocation(loc.id)}
                  className="w-full text-left px-3 py-2 rounded-none text-xs text-slate-300 hover:bg-white/5 transition-colors"
                >
                  <Icon name="location" size={13} className="inline align-text-bottom mr-1" /> {loc.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      </div>
      </>
      )}
      </div>

      {/* ── Footer (dock bas) : frise de présence pliable + curseur ── */}
      {viewMode === 'single' && mode === 'auto' && chapters.length > 0 && (
        <footer data-tour="map-journeys" className="flex-shrink-0">
          <PresenceStrip
            chapters={chapters}
            characters={charKeys.filter(k => visible[k]).map(k => CHARACTERS[k])}
            index={currentChapterIdx}
            onChange={seek}
            open={stripOpen}
            onToggle={() => setStripOpen(v => !v)}
          />
          <ChapterCursor
            chapters={chapters}
            index={currentChapterIdx}
            onChange={seek}
            markers={cursorMarkers}
            currentInfo={currentInfo}
            playing={playing}
            onTogglePlay={() => {
              if (!playing && currentChapterIdx >= chapters.length - 1) setCurrentChapterIdx(0);
              setPlaying(p => !p);
            }}
          />
        </footer>
      )}

    </div>
  );
}
