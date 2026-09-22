import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { useDragScroll } from '../../hooks/useDragScroll';
import { hexToRgb } from '../../utils/color';
import { getEntityMeta } from '../../utils/entityUtils';
import EmptyState from '../ui/EmptyState';
import { HeaderSep } from '../ui/HeaderButton';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import Term from '../ui/Term';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useIncStore }      from '../../stores/useIncStore';
import { useThreadStore }   from '../../stores/useThreadStore';
import { useArcStore }      from '../../stores/useArcStore';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { useNotesStore }    from '../../stores/useNotesStore';
import { useVolumeStore }   from '../../stores/useVolumeStore';
import { useVolumeFilter }  from '../../hooks/useVolumeFilter';
import { useSaveIndicator } from '../../stores/useSaveIndicator';
import { useProject }       from '../../db/ProjectContext';
import { useStoreLoader }   from '../../hooks/useStoreLoader';
import { useFocusFlash }    from '../../hooks/useFocusFlash';
import { reorderEvents }    from '../../api/client';
import { toast }            from '../../lib/toast';
import { BEATS }            from '../../data/beats_config';
import { actSegments }      from '../../utils/acts';
import { OUTCOMES }         from '../../data/outcome_config';
import EventEditor from './EventEditor';
import EventCard from './EventCard';
import SortableEventCard from './SortableEventCard';
import ArcStrip, { COL_W } from './ArcStrip';
import SeriesTimeline from './SeriesTimeline';

function ChapterDropZone({ chapterNum, isTargeted, children, t }) {
  const { setNodeRef } = useDroppable({ id: `chapter-${chapterNum}` });
  return (
    <div ref={setNodeRef} className="p-3 space-y-2.5 min-h-[60px] transition-colors duration-150"
      style={isTargeted ? { backgroundColor: 'rgba(63,81,181,0.1)', boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.3)', borderRadius: 8 } : undefined}>
      {children}
      {isTargeted && (
        <div className="flex items-center gap-2 py-1 animate-pulse">
          <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: 'rgba(99,102,241,0.5)' }} />
          <span className="text-[10px] font-bold" style={{ color: '#818cf8' }}>{t('dnd.dropHere')}</span>
          <div className="flex-1 h-0.5 rounded-full" style={{ backgroundColor: 'rgba(99,102,241,0.5)' }} />
        </div>
      )}
    </div>
  );
}

// ── TimelineBrowser ───────────────────────────────────────────────────────────
export default function TimelineBrowser() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useProject();

  useStoreLoader([useTimelineStore, useIncStore, useThreadStore, useArcStore, useNotesStore, useCustomEntityStore]);

  const allEvents    = useTimelineStore(s => s.events);
  const filterByVolume = useVolumeFilter();
  const activeVolumeId  = useVolumeStore(s => s.activeVolumeId);
  const volumes         = useVolumeStore(s => s.volumes) ?? [];
  const setActiveVolume = useVolumeStore(s => s.setActiveVolume);
  const events         = filterByVolume(allEvents);
  const incoherences   = useIncStore(s => s.data) ?? [];

  const arcPoints = useArcStore(s => s.points);
  const loadArc   = useArcStore(s => s.load);

  const threads     = useThreadStore(s => s.threads) ?? [];

  const [focusedCharId,  setFocusedCharId]  = useState(null);
  const [filterMode,     setFilterMode]     = useState('presence'); // 'presence' | 'pov'
  const [filtersOpen,    setFiltersOpen]    = useState(false);
  const [outcomeFilter,  setOutcomeFilter]  = useState(null); // null = tous
  const [threadFilter,   setThreadFilter]   = useState(null); // null = tous
  const [charMenuOpen,  setCharMenuOpen]  = useState(false);
  const charMenuRef = useRef(null);
  const [threadMenuOpen, setThreadMenuOpen] = useState(false);
  const threadMenuRef = useRef(null);
  const [editorEvent,   setEditorEvent]   = useState(undefined); // undefined=fermé, null=créer, obj=éditer
  const [showArc,       setShowArc]       = useState(false);
  const [showStc,       setShowStc]       = useState(false);
  const [noteOpen,      setNoteOpen]      = useState(null); // chapter number
  const [viewMode,      setViewMode]      = useState('chapters'); // 'chapters' | 'series'
  const [timeOrder,     setTimeOrder]     = useState('narrative'); // 'narrative' | 'chronological'

  // Deep-link « aller pile sur un événement » (?focus=<id> depuis le chat).
  const flashId = useFocusFlash(allEvents != null);
  useEffect(() => {
    if (!flashId) return;
    // Repasser en vue chapitres (les cartes n'existent qu'ici) et lever les
    // filtres qui pourraient masquer l'événement ciblé.
    setViewMode('chapters');
    setFocusedCharId(null);
    setOutcomeFilter(null);
    setThreadFilter(null);
    // Si l'événement est dans un autre tome, lever le filtre de tome global.
    const target = (allEvents ?? []).find(e => e.id === flashId);
    if (target && activeVolumeId && target.volumeId && target.volumeId !== activeVolumeId) {
      setActiveVolume(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flashId]);

  // Revenir en vue chapitres si on sélectionne un tome
  const handleSelectVolume = (id) => {
    setActiveVolume(id);
    setViewMode('chapters');
  };

  const showSeriesTab = !activeVolumeId && volumes.length >= 2;

  const beatMap = useMemo(() => new Map(BEATS.map(b => [b.id, b])), []);
  const dragScroll = useDragScroll();
  const [activeId, setActiveId] = useState(null);
  const reloadEvents = useTimelineStore(s => s._reload);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const [hoverChapterNum, setHoverChapterNum] = useState(null);

  const handleDragStart = useCallback(({ active }) => {
    setActiveId(active.id);
    setHoverChapterNum(null);
  }, []);

  const handleDragOver = useCallback(({ active, over }) => {
    if (!over || !events) { setHoverChapterNum(null); return; }
    const draggedEvt = events.find(e => e.id === active.id);
    if (!draggedEvt) return;

    // Find target chapter from over
    let chapter = null;
    const overEvt = events.find(e => e.id === over.id && e.id !== active.id);
    if (overEvt) {
      chapter = overEvt.chapter;
    } else if (typeof over.id === 'string' && over.id.startsWith('chapter-')) {
      chapter = Number(over.id.replace('chapter-', ''));
    } else {
      const ctr = over?.data?.current?.sortable?.containerId;
      if (ctr?.startsWith('chapter-')) chapter = Number(ctr.replace('chapter-', ''));
    }

    // Only highlight if it's a different chapter
    const target = (chapter != null && chapter !== draggedEvt.chapter) ? chapter : null;
    setHoverChapterNum(prev => prev === target ? prev : target);
  }, [events]);

  const handleDragEnd = useCallback(async ({ active, over }) => {
    setActiveId(null);
    setHoverChapterNum(null);
    if (!over || !events) return;

    const draggedId = active.id;
    const overId = over.id;
    const draggedEvt = events.find(e => e.id === draggedId);
    if (!draggedEvt) return;

    // Determine target chapter
    let targetChapter;
    const overEvt = events.find(e => e.id === overId && e.id !== draggedId);
    if (overEvt) {
      targetChapter = overEvt.chapter;
    } else if (typeof overId === 'string' && overId.startsWith('chapter-')) {
      targetChapter = Number(overId.replace('chapter-', ''));
    } else {
      const container = over?.data?.current?.sortable?.containerId;
      if (container && container.startsWith('chapter-')) {
        targetChapter = Number(container.replace('chapter-', ''));
      } else {
        return;
      }
    }

    // Guard: targetChapter must be a valid number
    if (targetChapter == null || isNaN(targetChapter)) return;

    const isCrossChapter = draggedEvt.chapter !== targetChapter;

    // Stable sort helper: by sceneOrder, then by original DB position
    const indexMap = new Map(events.map((e, i) => [e.id, i]));
    const stableSort = (arr) =>
      [...arr].sort((a, b) => (a.sceneOrder ?? 0) - (b.sceneOrder ?? 0) || (indexMap.get(a.id) ?? 0) - (indexMap.get(b.id) ?? 0));

    const updates = [];

    if (!isCrossChapter) {
      // ── Same chapter: use arrayMove ──
      const sorted = stableSort(events.filter(e => e.chapter === targetChapter));
      const fromIdx = sorted.findIndex(e => e.id === draggedId);
      const toIdx   = sorted.findIndex(e => e.id === overId);
      if (fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;

      const reordered = arrayMove(sorted, fromIdx, toIdx);
      reordered.forEach((e, i) => {
        updates.push({ id: e.id, chapter: targetChapter, sceneOrder: i + 1 });
      });
    } else {
      // ── Cross-chapter: remove from source, insert into target ──
      const targetSorted = stableSort(events.filter(e => e.chapter === targetChapter));
      const overIdx = overEvt ? targetSorted.findIndex(e => e.id === overId) : -1;
      if (overIdx >= 0) {
        targetSorted.splice(overIdx, 0, draggedEvt);
      } else {
        targetSorted.push(draggedEvt);
      }
      targetSorted.forEach((e, i) => {
        updates.push({ id: e.id, chapter: targetChapter, sceneOrder: i + 1 });
      });

      // Source chapter: reorder without the dragged event
      const sourceSorted = stableSort(
        events.filter(e => e.chapter === draggedEvt.chapter && e.id !== draggedId)
      );
      sourceSorted.forEach((e, i) => {
        updates.push({ id: e.id, chapter: draggedEvt.chapter, sceneOrder: i + 1 });
      });
    }

    // Optimistic update + API call
    useSaveIndicator.getState().markSaving();
    try {
      await reorderEvents(projectId, updates);
      await reloadEvents();
      const label = isCrossChapter
        ? t('toast.reorderCrossChapter', { chapter: targetChapter })
        : t('toast.reorderSameChapter');
      toast(label);
    } finally {
      useSaveIndicator.getState().markSaved();
    }
  }, [events, projectId, reloadEvents]);

  // Chargement conditionnel de l'arc si pas encore en mémoire
  useEffect(() => {
    if (!projectId || arcPoints !== null) return;
    loadArc(projectId);
  }, [projectId, arcPoints, loadArc]);

  const notesRaw  = useNotesStore(s => s.notes);
  const notes     = notesRaw ?? {};
  const setNote   = useNotesStore(s => s.setNote);
  const loadNotes = useNotesStore(s => s.load);

  useEffect(() => {
    if (!projectId || notesRaw !== null) return;
    loadNotes(projectId);
  }, [projectId, notesRaw, loadNotes]);

  const scrollRef   = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scrollBy = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 290, behavior: 'smooth' });
  };

  const chapters    = useMemo(() => {
    if (!events) return [];
    const seen = new Set();
    const chs  = [];
    for (const e of events) {
      if (!seen.has(e.chapter)) { seen.add(e.chapter); chs.push({ number: e.chapter, title: e.chapterTitle }); }
    }
    return chs.sort((a, b) => a.number - b.number);
  }, [events]);

  // Chapitres en vue chronologique — flashbacks repositionnés à leur story_chapter_ref
  const chronoChapters = useMemo(() => {
    if (!events) return [];
    const seen = new Map();
    for (const e of events) {
      const num = (e.isFlashback && e.storyChapterRef != null) ? e.storyChapterRef : e.chapter;
      if (!seen.has(num)) {
        seen.set(num, { number: num, title: num < 1 ? t('timeline.ancientEra', { n: num }) : e.chapterTitle, isPreStory: num < 1 });
      }
    }
    return [...seen.values()].sort((a, b) => a.number - b.number);
  }, [events, t]);

  const displayChapters = timeOrder === 'chronological' ? chronoChapters : chapters;

  useEffect(() => { updateArrows(); }, [chapters, updateArrows]);

  useEffect(() => {
    if (!charMenuOpen) return;
    const handler = (e) => { if (charMenuRef.current && !charMenuRef.current.contains(e.target)) setCharMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [charMenuOpen]);

  useEffect(() => {
    if (!threadMenuOpen) return;
    const handler = (e) => { if (threadMenuRef.current && !threadMenuRef.current.contains(e.target)) setThreadMenuOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [threadMenuOpen]);

  const characters = useMemo(() => {
    if (!events) return [];
    const map = new Map();
    events.forEach(evt => evt.entities.forEach(e => {
      if (e.entityType !== 'character' || map.has(e.id)) return;
      const meta = getEntityMeta(e.id, 'character');
      if (meta) map.set(e.id, { id: e.id, ...meta });
    }));
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, [events]);

  const handleEntityClick = (entity) => {
    const tabMap = { character: 'characters', location: 'locations', object: 'objects', group: 'groups' };
    const tab = tabMap[entity.entityType] ?? 'characters';
    const meta = getEntityMeta(entity.id, entity.entityType);
    navigate(`/lore?tab=${tab}&search=${encodeURIComponent(meta?.name ?? '')}`);
  };

  if (!events) return <Skeleton variant="list" />;

  if (events.length === 0) return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={<Icon name="event" size={40} className="text-atlas-mute" />}
        title={t('empty.noEvents')}
        hint={t('timeline.emptyHint', 'Ajoutez votre premier événement pour construire votre timeline.')}
        action={
          <button
            onClick={() => setEditorEvent(null)}
            className="px-4 py-2 rounded-none text-sm font-black transition-all duration-200"
            style={{ backgroundColor: 'rgba(92,174,142,0.18)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.4)' }}
          >
            {t('timeline.addEvent', '+ Créer un événement')}
          </button>
        }
      />
      {editorEvent !== undefined && (
        <EventEditor
          event={editorEvent ?? undefined}
          chapters={[]}
          onClose={() => setEditorEvent(undefined)}
        />
      )}
    </div>
  );

  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <header data-tour="timeline-events" className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">
            Analyser — chronologie du récit
          </p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            Timeline <span className="italic" style={{ color: '#5cae8e' }}>narrative</span>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {chapters.length} {t('label.chapters').toLowerCase()} · {events.length} {t('label.events').toLowerCase()}
          </p>
        </div>
        <div className="flex items-center gap-4 md:gap-5 font-grotesk">
          {/* Onglet Vue série */}
          {showSeriesTab && (
            <div className="hidden md:flex items-center gap-4 md:gap-5 flex-shrink-0">
              {[
                { id: 'chapters', label: t('label.chapters') },
                { id: 'series',   label: t('timeline.seriesTab'), icon: 'series' },
              ].map(v => (
                <button key={v.id} onClick={() => setViewMode(v.id)}
                  className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] pb-1 transition-all"
                  style={{
                    color:        viewMode === v.id ? '#ece7db' : 'var(--color-atlas-soft)',
                    borderBottom: viewMode === v.id ? '2px solid #cba15e' : '2px solid transparent',
                  }}>
                  {v.icon && <Icon name={v.icon} size={14} />}
                  {v.label}
                </button>
              ))}
            </div>
          )}
          {viewMode === 'chapters' && (<>
            <button
              onClick={() => setTimeOrder(v => v === 'narrative' ? 'chronological' : 'narrative')}
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] pb-1 transition-all"
              style={{
                color:        timeOrder === 'chronological' ? '#fbbf24' : 'var(--color-atlas-soft)',
                borderBottom: `2px solid ${timeOrder === 'chronological' ? '#d97706' : 'transparent'}`,
              }}
            >
              <Icon name="memory" size={14} /> {t('timeline.chrono')}
            </button>
            <button
              onClick={() => setShowArc(v => !v)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] pb-1 transition-all"
              style={{
                color:        showArc ? '#fb923c' : 'var(--color-atlas-soft)',
                borderBottom: `2px solid ${showArc ? '#fb923c' : 'transparent'}`,
              }}
              title="Afficher / masquer l'arc émotionnel"
            >
              <Icon name="arc" size={14} /> {t('timeline.arc')}
            </button>
            <button
              onClick={() => setShowStc(v => !v)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] pb-1 transition-all"
              style={{
                color:        showStc ? '#5cae8e' : 'var(--color-atlas-soft)',
                borderBottom: `2px solid ${showStc ? '#5cae8e' : 'transparent'}`,
              }}
              title="Afficher / masquer les beats Save the Cat"
            >
              <Icon name="cat" size={14} /> {t('timeline.stc')}
            </button>
            <HeaderSep />
            <button
              onClick={() => setEditorEvent(null)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-[0.1em] font-semibold pb-1 transition-all"
              style={{ color: '#5cae8e', borderBottom: '2px solid transparent' }}
            >
              {t('btn.add')}
            </button>
          </>)}
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
      {/* ── Vue série ── */}
      {viewMode === 'series' && (
        <SeriesTimeline
          volumes={volumes}
          allEvents={allEvents}
          arcPoints={arcPoints ?? []}
          onSelectVolume={handleSelectVolume}
        />
      )}

      {/* ── Vue chapitres : filtres + timeline horizontale ── */}
      {viewMode === 'chapters' && <>
      {/* ── Toggle filtres mobile ── */}
      {(() => {
        const activeFilterCount = [focusedCharId, threadFilter, outcomeFilter].filter(Boolean).length;
        return (
          <button
            onClick={() => setFiltersOpen(v => !v)}
            className="md:hidden flex items-center gap-2 px-4 py-2 border-b border-white/5 flex-shrink-0 text-xs font-bold uppercase tracking-widest"
            style={{ background: 'rgba(0,0,0,0.2)', color: activeFilterCount > 0 ? '#5cae8e' : '#475569' }}
          >
            <span><Icon name="controls" size={14} /></span>
            <span>{t('timeline.filters', 'Filtres')}</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black" style={{ backgroundColor: 'rgba(92,174,142,0.2)', color: '#5cae8e' }}>
                {activeFilterCount}
              </span>
            )}
            <span className="ml-auto text-[10px]" style={{ color: 'var(--color-atlas-mute)' }}>{filtersOpen ? '▲' : '▼'}</span>
          </button>
        );
      })()}
      <div
        data-tour="timeline-filters"
        className={`flex-row flex-wrap items-center gap-x-6 gap-y-3 px-6 py-4 flex-shrink-0 border-b border-white/10 ${filtersOpen ? 'flex' : 'hidden'} md:flex`}
      >
        {/* Ligne 1 : label + toggle mode + dropdown personnage */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.16em] flex-shrink-0">{t('timeline.followBy')}</span>
          <div className="flex items-center rounded-lg overflow-hidden border border-white/10">
            {[
              { id: 'presence', label: t('timeline.presence'), icon: 'user' },
              { id: 'pov',      label: t('timeline.pov'),      icon: 'pov' },
            ].map(({ id, label, icon }) => {
              const active = filterMode === id;
              return (
                <button
                  key={id}
                  onClick={() => { setFilterMode(id); setFocusedCharId(null); }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 font-grotesk text-xs font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: active ? '#5cae8e' : 'transparent',
                    color:           active ? '#15171b' : '#8a96a2',
                  }}
                >
                  <span><Icon name={icon} size={14} /></span>
                  {id === 'pov' ? <Term id="pov">{label}</Term> : label}
                </button>
              );
            })}
          </div>
          <div className="hidden md:block w-px self-stretch" style={{ backgroundColor: 'rgba(255,255,255,0.07)' }} />
          {/* Dropdown personnage */}
          <div className="relative" ref={charMenuRef}>
            <button
              onClick={() => setCharMenuOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                backgroundColor: focusedCharId ? (() => { const c = characters.find(c => c.id === focusedCharId); return c ? `rgba(${hexToRgb(c.color)},0.15)` : 'rgba(255,255,255,0.06)'; })() : 'rgba(255,255,255,0.06)',
                color:           focusedCharId ? (() => { const c = characters.find(c => c.id === focusedCharId); return c?.color ?? '#94a3b8'; })() : '#94a3b8',
                border:          focusedCharId ? (() => { const c = characters.find(c => c.id === focusedCharId); return c ? `1px solid rgba(${hexToRgb(c.color)},0.35)` : '1px solid rgba(255,255,255,0.1)'; })() : '1px solid rgba(255,255,255,0.1)',
                minWidth: 160,
              }}
            >
              {focusedCharId ? (
                <>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: characters.find(c => c.id === focusedCharId)?.color ?? '#94a3b8' }} />
                  {characters.find(c => c.id === focusedCharId)?.name ?? '—'}
                </>
              ) : (
                <>
                  <span className="text-atlas-soft"><Icon name="user" size={14} /></span>
                  {t('timeline.allCharacters')}
                </>
              )}
              <span className="ml-auto text-atlas-mute text-[10px]">{charMenuOpen ? '▲' : '▼'}</span>
            </button>

            {charMenuOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-30 rounded-none overflow-y-auto"
                style={{ minWidth: 200, maxHeight: 'calc(100vh - 120px)', backgroundColor: 'var(--color-atlas-ink)', border: '1px solid var(--color-atlas-line)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
              >
                <button
                  onClick={() => { setFocusedCharId(null); setCharMenuOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-100 hover:bg-white/5"
                  style={{ color: !focusedCharId ? '#5cae8e' : 'var(--color-atlas-soft)' }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-600" />
                  {t('timeline.allCharacters')}
                  {!focusedCharId && <Icon name="check" size={13} className="ml-auto text-[#5cae8e]" />}
                </button>
                <div className="border-t border-white/5" />
                {characters.map(char => {
                  const isActive = focusedCharId === char.id;
                  return (
                    <button
                      key={char.id}
                      onClick={() => { setFocusedCharId(isActive ? null : char.id); setCharMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-100 hover:bg-white/5"
                      style={{ color: isActive ? char.color : 'var(--color-atlas-soft)' }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />
                      {char.name}
                      {isActive && <Icon name="check" size={13} className="ml-auto" style={{ color: char.color }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Ligne 2 : filtre fil narratif (dropdown) */}
        {threads.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.16em] flex-shrink-0">{t('label.threads')}</span>
            <div className="relative" ref={threadMenuRef}>
              <button
                onClick={() => setThreadMenuOpen(v => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                style={{
                  backgroundColor: threadFilter ? (() => { const th = threads.find(th => th.id === threadFilter); return th ? `${th.color}15` : 'rgba(255,255,255,0.06)'; })() : 'rgba(255,255,255,0.06)',
                  color:           threadFilter ? (() => { const th = threads.find(th => th.id === threadFilter); return th?.color ?? '#94a3b8'; })() : '#94a3b8',
                  border:          threadFilter ? (() => { const th = threads.find(th => th.id === threadFilter); return th ? `1px solid ${th.color}40` : '1px solid rgba(255,255,255,0.1)'; })() : '1px solid rgba(255,255,255,0.1)',
                  minWidth: 160,
                }}
              >
                {threadFilter ? (
                  <>
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: threads.find(th => th.id === threadFilter)?.color ?? '#94a3b8' }} />
                    {threads.find(th => th.id === threadFilter)?.name ?? '—'}
                  </>
                ) : (
                  <>
                    <span className="text-atlas-soft"><Icon name="thread" size={14} /></span>
                    {t('review.filterAll', 'Tous')}
                  </>
                )}
                <span className="ml-auto text-atlas-mute text-[10px]">{threadMenuOpen ? '▲' : '▼'}</span>
              </button>

              {threadMenuOpen && (
                <div
                  className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-y-auto"
                  style={{ minWidth: 200, maxHeight: 'calc(100vh - 120px)', backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
                >
                  <button
                    onClick={() => { setThreadFilter(null); setThreadMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-100 hover:bg-white/5"
                    style={{ color: !threadFilter ? '#5cae8e' : 'var(--color-atlas-soft)' }}
                  >
                    <span className="w-2 h-2 rounded-full flex-shrink-0 bg-slate-600" />
                    {t('review.filterAll', 'Tous')}
                    {!threadFilter && <Icon name="check" size={13} className="ml-auto text-[#5cae8e]" />}
                  </button>
                  <div className="border-t border-white/5" />
                  {threads.map(th => {
                    const isActive = threadFilter === th.id;
                    return (
                      <button
                        key={th.id}
                        onClick={() => { setThreadFilter(isActive ? null : th.id); setThreadMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-all duration-100 hover:bg-white/5"
                        style={{ color: isActive ? th.color : 'var(--color-atlas-soft)' }}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: th.color }} />
                        {th.name}
                        {isActive && <Icon name="check" size={13} className="ml-auto" style={{ color: th.color }} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ligne 3 : filtre issue */}
        <div className="flex items-center gap-2">
          <span className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.16em] flex-shrink-0">{t('timeline.outcome')}</span>
          <div className="flex items-center gap-1 rounded-lg px-1.5 py-1" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <button
              onClick={() => setOutcomeFilter(null)}
              className="text-[10px] px-2 py-0.5 rounded font-bold transition-all duration-150"
              style={{
                backgroundColor: !outcomeFilter ? 'rgba(255,255,255,0.1)' : 'transparent',
                color:           !outcomeFilter ? '#cbd5e1' : 'var(--color-atlas-mute)',
              }}
            >
              {t('review.filterAll', 'Tous')}
            </button>
            {OUTCOMES.map(o => (
              <button
                key={o.id}
                onClick={() => setOutcomeFilter(prev => prev === o.id ? null : o.id)}
                className="text-[10px] px-2 py-1 rounded font-bold transition-all duration-150"
                style={{
                  backgroundColor: outcomeFilter === o.id ? `${o.color}20` : 'transparent',
                  color:           outcomeFilter === o.id ? o.color : 'var(--color-atlas-mute)',
                  border:          outcomeFilter === o.id ? `1px solid ${o.color}40` : '1px solid transparent',
                }}
                title={t(`outcome.${o.id}`, o.label)}
              >
                <Icon name={o.icon} size={13} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Timeline horizontale ── */}
      <div className="relative px-6 pb-6">
        {/* Flèche gauche */}
        {canLeft && (
          <>
            <div className="absolute left-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to right, #15171b 0%, transparent 100%)' }} />
            <button
              onClick={() => scrollBy(-1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
              style={{ backgroundColor: 'rgba(92,174,142,0.22)', border: '1px solid rgba(92,174,142,0.45)', color: '#5cae8e' }}
            >
              ‹
            </button>
          </>
        )}

        {/* Flèche droite */}
        {canRight && (
          <>
            <div className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to left, #15171b 0%, transparent 100%)' }} />
            <button
              onClick={() => scrollBy(1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
              style={{ backgroundColor: 'rgba(92,174,142,0.22)', border: '1px solid rgba(92,174,142,0.45)', color: '#5cae8e' }}
            >
              ›
            </button>
          </>
        )}

        <div
          ref={(el) => { dragScroll.ref.current = el; scrollRef.current = el; }}  
          className="overflow-x-auto no-scrollbar"
          style={{ cursor: 'grab' }}
          onScroll={updateArrows}
          onMouseDown={dragScroll.onMouseDown}
          onMouseMove={dragScroll.onMouseMove}
          onMouseUp={dragScroll.onMouseUp}
          onMouseLeave={dragScroll.onMouseLeave}
        >
        <div style={{ minWidth: `${displayChapters.length * 290}px` }}>
          {/* ── Bandes d'acte (axe partagé avec la frise Save the Cat) ── */}
          {displayChapters.length >= 3 && (
            <div className="flex" style={{ width: displayChapters.length * 290 }}>
              {actSegments(displayChapters.length).map((seg, i, arr) => (
                <div
                  key={seg.key}
                  className="flex items-center flex-shrink-0"
                  style={{
                    width: seg.count * 290,
                    height: 24,
                    backgroundColor: `${seg.color}1a`,
                    borderRight: i < arr.length - 1 ? '1px dashed rgba(255,255,255,0.08)' : 'none',
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {/* Label collant : reste visible tant que l'acte est à l'écran */}
                  <span
                    className="text-[10px] font-mono uppercase tracking-widest"
                    style={{ color: seg.color, opacity: 0.85, position: 'sticky', left: 24, paddingRight: 16 }}
                  >
                    {t(`stc.act${seg.key}`)}
                  </span>
                </div>
              ))}
            </div>
          )}
          {showArc && (
            <ArcStrip chapters={chapters} arcPoints={arcPoints ?? []} />
          )}
        <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex">
          {displayChapters.map(({ number, title, isPreStory }) => {
            const chEvts = timeOrder === 'chronological'
              ? events.filter(e => {
                  const effNum = (e.isFlashback && e.storyChapterRef != null) ? e.storyChapterRef : e.chapter;
                  return effNum === number;
                })
              : events.filter(e => e.chapter === number);
            return (
              <div
                key={number}
                className="flex flex-col flex-shrink-0 border-r border-white/7"
                style={{ width: 290 }}
              >
                {/* En-tête chapitre */}
                <div
                  className="flex-shrink-0 px-4 pt-2 pb-4"
                  style={isPreStory ? { background: 'rgba(120,77,15,0.1)' } : undefined}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-mono uppercase tracking-widest" style={{ color: isPreStory ? '#d97706' : '#cba15e' }}>
                        {isPreStory ? t('timeline.ancientEra', { n: number }) : t('timeline.chapter', { n: number })}
                      </p>
                      <p className="font-serif text-base font-semibold text-slate-200 leading-snug mt-1">
                        {title}
                      </p>
                      <p className="text-xs text-atlas-mute mt-1">
                        {chEvts.length} {t('label.events').toLowerCase()}
                        {timeOrder === 'chronological' && chEvts.some(e => e.isFlashback) && (
                          <span className="inline-flex items-center gap-1" style={{ color: '#d97706' }}> · <Icon name="memory" size={12} /> flashback</span>
                        )}
                      </p>
                      <div className="h-0.5 mt-3" style={{ width: 32, backgroundColor: isPreStory ? 'rgba(217,119,6,0.6)' : 'rgba(203,161,94,0.55)' }} />
                    </div>
                    <button
                      onClick={() => setNoteOpen(prev => prev === number ? null : number)}
                      className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center mt-0.5 transition-all duration-150"
                      style={{
                        backgroundColor: notes[number] ? 'rgba(251,191,36,0.12)' : 'rgba(255,255,255,0.04)',
                        color:           notes[number] ? '#fbbf24' : 'var(--color-atlas-mute)',
                        border:          `1px solid ${notes[number] ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.07)'}`,
                      }}
                      title="Notes du chapitre"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                      </svg>
                    </button>
                  </div>
                  {noteOpen === number && (
                    <textarea
                      key={number}
                      defaultValue={notes[number] ?? ''}
                      onBlur={e => setNote(number, e.target.value)}
                      onMouseDown={e => e.stopPropagation()}
                      onClick={e => e.stopPropagation()}
                      placeholder={t('timeline.freeNotes')}
                      rows={3}
                      className="w-full mt-2 text-xs font-serif leading-relaxed resize-none rounded-lg outline-none"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        padding: '8px 10px',
                        color: '#cbd5e1',
                      }}
                    />
                  )}
                </div>

                {/* Événements */}
                <SortableContext id={`chapter-${number}`} items={chEvts.map(e => e.id)} strategy={verticalListSortingStrategy}>
                <ChapterDropZone chapterNum={number} isTargeted={hoverChapterNum === number} t={t}>
                  {chEvts.filter(evt =>
                    (!outcomeFilter || evt.sceneOutcome === outcomeFilter) &&
                    (!threadFilter  || (evt.threadIds ?? []).includes(threadFilter))
                  ).map(evt => {
                    const evtCharIds    = new Set(evt.entities.filter(e => e.entityType === 'character').map(e => e.id));
                    const matchesFilter = filterMode === 'pov'
                      ? evt.povCharacterId === focusedCharId
                      : evtCharIds.has(focusedCharId);
                    const isHighlighted = !focusedCharId || matchesFilter;
                    const isDimmed      = !!focusedCharId && !matchesFilter;
                    const evtVolume = evt.volumeId
                      ? volumes.find(v => v.id === evt.volumeId)
                      : null;
                    return (
                      <SortableEventCard key={evt.id} id={evt.id}>
                        {timeOrder === 'chronological' && evt.isFlashback && (
                          <p className="text-[9px] font-bold uppercase tracking-wider mb-1 px-1 flex items-center gap-1" style={{ color: '#d97706' }}>
                            <Icon name="memory" size={12} /> {t('timeline.narratedAtCh', { ch: evt.chapter })}
                          </p>
                        )}
                        <EventCard
                          event={evt}
                          isHighlighted={isHighlighted}
                          isDimmed={isDimmed}
                          flash={evt.id === flashId}
                          onEntityClick={handleEntityClick}
                          onEdit={setEditorEvent}
                          allIncoherences={incoherences}
                          beat={showStc && evt.beatId ? beatMap.get(evt.beatId) : null}
                          volumeLabel={!activeVolumeId && evtVolume ? `T${evtVolume.number}` : null}
                        />
                      </SortableEventCard>
                    );
                  })}
                </ChapterDropZone>
                </SortableContext>
              </div>
            );
          })}
        </div>
        {activeId && (
          <DragOverlay>
            <div className="rounded-xl p-3 text-sm font-bold text-slate-200 max-w-[260px] truncate"
              style={{ backgroundColor: 'rgba(63,81,181,0.3)', border: '1px solid rgba(99,102,241,0.5)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
              {events?.find(e => e.id === activeId)?.title ?? ''}
            </div>
          </DragOverlay>
        )}
        </DndContext>
        </div>
        </div>
      </div>

      {/* ── EventEditor ── */}
      {editorEvent !== undefined && (
        <EventEditor
          event={editorEvent ?? undefined}
          chapters={chapters}
          onClose={() => setEditorEvent(undefined)}
        />
      )}
      </>}
      </div>
    </div>
  );
}
