import { useMemo, useState, useRef, useCallback, useEffect } from 'react';
import { BEATS } from '../../data/beats_config';
import { computeAlerts } from '../../db/queries';
import { useStcStore } from '../../stores/useStcStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useDragScroll } from '../../hooks/useDragScroll';
import Frise from './Frise';
import AlertCard from './AlertCard';
import BeatRow from './BeatRow';
import ChapterCard from './ChapterCard';
import ChapterEditor from './ChapterEditor';

const ENTITY_SECTIONS = [
  { type: 'character', label: 'Personnages', color: (e) => e.color ?? '#818cf8' },
  { type: 'location',  label: 'Lieux',       color: ()  => '#60a5fa'             },
  { type: 'object',    label: 'Objets',      color: ()  => '#a78bfa'             },
];

// ── Panneau couverture des entités ─────────────────────────────────────────────
function EntityCoveragePanel({ chapters, characters, locations, objects }) {
  const entityListByType = {
    character: characters,
    location:  locations,
    object:    objects,
  };

  // Pour chaque entité, quels chapitres la mentionnent ?
  const coverageMap = useMemo(() => {
    const map = {}; // entityType:id → [chapter, ...]
    (chapters ?? []).forEach(ch => {
      (ch.entities ?? []).forEach(e => {
        const key = `${e.entityType}:${e.id}`;
        if (!map[key]) map[key] = [];
        map[key].push(ch);
      });
    });
    return map;
  }, [chapters]);

  const allCount    = characters.length + locations.length + objects.length;
  const coveredCount = useMemo(() => {
    return Object.keys(coverageMap).length;
  }, [coverageMap]);

  return (
    <div className="p-5 space-y-5">
      {/* Barre de couverture globale */}
      <div
        className="p-4 rounded-xl text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Couverture entités</p>
        <p className="text-3xl font-black" style={{ color: coveredCount === allCount ? '#10b981' : '#fbbf24' }}>
          {coveredCount}<span className="text-sm font-normal text-slate-600">/{allCount}</span>
        </p>
        <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: allCount ? `${(coveredCount / allCount) * 100}%` : '0%',
              backgroundColor: coveredCount === allCount ? '#10b981' : '#fbbf24',
            }}
          />
        </div>
      </div>

      {/* Liste par type */}
      {ENTITY_SECTIONS.map(({ type, label, color }) => {
        const list = entityListByType[type] ?? [];
        if (!list.length) return null;
        const uncovered = list.filter(e => !coverageMap[`${type}:${e.id}`]);
        return (
          <div key={type}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              {label}
              {uncovered.length > 0 && (
                <span className="font-normal normal-case" style={{ color: '#ef4444' }}>
                  {uncovered.length} non couvert{uncovered.length > 1 ? 's' : ''}
                </span>
              )}
            </p>
            <div className="space-y-1">
              {list.map(e => {
                const key  = `${type}:${e.id}`;
                const chs  = coverageMap[key] ?? [];
                const col  = color(e);
                const none = chs.length === 0;
                return (
                  <div
                    key={e.id}
                    className="flex items-start gap-2 px-2.5 py-2 rounded-lg"
                    style={{
                      backgroundColor: none ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${none ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: none ? '#ef4444' : col, opacity: none ? 0.6 : 1 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: none ? '#64748b' : '#cbd5e1' }}>
                        {e.name}
                      </p>
                      {none ? (
                        <p className="text-[10px] mt-0.5" style={{ color: '#ef4444' }}>Aucun chapitre</p>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chs.map(ch => (
                            <span
                              key={ch.id}
                              className="text-[9px] px-1.5 py-0.5 rounded font-mono font-bold"
                              style={{ backgroundColor: `${col}18`, color: col, border: `1px solid ${col}35` }}
                              title={ch.title}
                            >
                              Ch.{ch.number}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {allCount === 0 && (
        <p className="text-xs text-slate-700 italic text-center py-8">
          Aucune entité dans la base de données.
        </p>
      )}
    </div>
  );
}

// ── SaveTheCat ─────────────────────────────────────────────────────────────────
export default function SaveTheCat() {
  const { chapters: chaptersDB, saving, save, remove } = useStcStore();
  const { characters, locations, objects } = useLoreStore();
  const [hoveredBeat,   setHoveredBeat]   = useState(null);
  const [rightTab,      setRightTab]      = useState('beats'); // 'beats' | 'entities'
  const [editorChapter, setEditorChapter] = useState(undefined); // undefined = fermé, null = création, obj = édition
  const dragScroll  = useDragScroll();
  const chapScrollRef = useRef(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const updateArrows = useCallback(() => {
    const el = chapScrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => { updateArrows(); }, [chaptersDB, updateArrows]);

  const scrollChapters = (dir) => {
    chapScrollRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' });
  };

  const alerts = useMemo(() => chaptersDB ? computeAlerts(chaptersDB, BEATS) : [], [chaptersDB]);
  const alertBeatIds = useMemo(() => new Set(alerts.map(a => a.beat.id)), [alerts]);

  const beatChapterMap = useMemo(() => {
    const map = {};
    (chaptersDB ?? []).forEach(ch => ch.beats.forEach(id => { map[id] = ch; }));
    return map;
  }, [chaptersDB]);

  const handleSave = async (data) => {
    await save(editorChapter?.id ?? null, data);
    setEditorChapter(undefined);
  };

  const handleDelete = async () => {
    if (!editorChapter?.id) return;
    await remove(editorChapter.id);
    setEditorChapter(undefined);
  };

  if (!chaptersDB) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  const placedCount   = BEATS.filter(b => beatChapterMap[b.id]).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount  = alerts.filter(a => a.severity !== 'critical').length;
  const nextNumber    = chaptersDB.length > 0 ? Math.max(...chaptersDB.map(c => c.number)) + 1 : 1;

  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar flex flex-col bg-[#0B1621] text-slate-200">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Save the <span style={{ color: '#f97316' }}>Cat</span>
          </h1>
          <p className="text-sm text-slate-500 font-serif italic">
            {chaptersDB.length} chapitres · {placedCount}/{BEATS.length} beats placés
            {criticalCount > 0 && (
              <span style={{ color: '#ef4444' }}>
                {' '}· {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span style={{ color: '#fbbf24' }}>
                {' '}· {warningCount} attention{warningCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => setEditorChapter(null)}
          className="text-xs px-3 py-1.5 rounded-lg font-black transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
          style={{
            backgroundColor: 'rgba(249,115,22,0.12)',
            color: '#f97316',
            border: '1px solid rgba(249,115,22,0.3)',
          }}
        >
          + Chapitre
        </button>
      </header>

      {/* ── Légende ── */}
      <div
        className="flex items-center gap-6 justify-center px-8 py-2 border-b border-white/5 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="inline-block rounded-full border"
            style={{ width: 12, height: 12, backgroundColor: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.55)' }}
          />
          Beat placé (position réelle)
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="inline-block"
            style={{ width: 10, height: 10, transform: 'rotate(45deg)', border: '1.5px solid rgba(129,140,248,0.5)', backgroundColor: 'rgba(129,140,248,0.15)' }}
          />
          Position idéale
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span style={{ color: '#fbbf24' }}>⚠</span>
          Déviation
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span style={{ color: '#ef4444' }}>⛔</span>
          Critique
        </span>
      </div>

      {/* ── Frise ── */}
      <div className="px-10 pt-6 pb-2 flex-shrink-0">
        <Frise
          chapters={chaptersDB}
          alerts={alerts}
          hoveredBeat={hoveredBeat}
          onHoverBeat={setHoveredBeat}
        />
      </div>

      {/* ── Section chapitres ── */}
      <div className="border-t border-white/5 px-5 py-4 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.1)' }}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Chapitres <span className="font-normal text-slate-700">({chaptersDB.length})</span>
        </p>
        <div className="relative">
          {/* Flèche gauche */}
          {canLeft && (
            <>
              <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, #0B1621 0%, transparent 100%)' }} />
              <button
                onClick={() => scrollChapters(-1)}
                className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                style={{ backgroundColor: 'rgba(63,81,181,0.25)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
              >‹</button>
            </>
          )}
          {/* Flèche droite */}
          {canRight && (
            <>
              <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, #0B1621 0%, transparent 100%)' }} />
              <button
                onClick={() => scrollChapters(1)}
                className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 hover:scale-110"
                style={{ backgroundColor: 'rgba(63,81,181,0.25)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
              >›</button>
            </>
          )}
          <div
            ref={(el) => { dragScroll.ref.current = el; chapScrollRef.current = el; }}
            className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
            style={{ cursor: 'grab' }}
            onScroll={updateArrows}
            onMouseDown={dragScroll.onMouseDown}
            onMouseMove={dragScroll.onMouseMove}
            onMouseUp={dragScroll.onMouseUp}
            onMouseLeave={dragScroll.onMouseLeave}
          >
          {chaptersDB.map(ch => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              alertBeatIds={alertBeatIds}
              hasDragged={dragScroll.hasDragged}
              onEdit={setEditorChapter}
            />
          ))}
          {/* Carte "Ajouter" */}
          <button
            onClick={() => setEditorChapter(null)}
            className="flex-shrink-0 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all duration-200 hover:border-orange-500/30 hover:bg-orange-500/04"
            style={{
              width: 140,
              minHeight: 120,
              borderColor: 'rgba(255,255,255,0.06)',
              backgroundColor: 'rgba(255,255,255,0.02)',
              cursor: 'pointer',
            }}
          >
            <span className="text-2xl text-slate-700">+</span>
            <span className="text-[11px] text-slate-600 font-semibold">Nouveau chapitre</span>
          </button>
          </div>
        </div>
      </div>

      {/* ── Panels bas ── */}
      <div className="flex flex-col md:flex-row border-t border-white/5">

        {/* Alertes */}
        <div className="flex-1 p-5 md:border-r border-white/5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Alertes narratives
            {alerts.length > 0 && (
              <span className="ml-2 font-normal text-slate-600">({alerts.length})</span>
            )}
          </p>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">✓</span>
              <p className="text-base text-slate-400 font-bold">Structure narrative solide !</p>
              <p className="text-sm text-slate-600 font-serif italic">Tous les beats sont bien placés dans les intervalles recommandés.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.filter(a => a.severity === 'critical').map((a, i) => (
                <AlertCard key={`crit-${i}`} alert={a} isHovered={hoveredBeat === a.beat.id} onHover={setHoveredBeat} />
              ))}
              {alerts.filter(a => a.severity !== 'critical').map((a, i) => (
                <AlertCard key={`warn-${i}`} alert={a} isHovered={hoveredBeat === a.beat.id} onHover={setHoveredBeat} />
              ))}
            </div>
          )}
        </div>

        {/* Panneau droit : beats / entités */}
        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/5 w-full md:w-[380px] lg:w-[480px]">

          {/* Onglets */}
          <div className="flex border-b border-white/5 flex-shrink-0">
            {[
              { id: 'beats',    label: 'Les 15 beats' },
              { id: 'entities', label: 'Entités' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className="flex-1 py-3 text-xs font-bold transition-all duration-150"
                style={{
                  color: rightTab === tab.id ? '#f97316' : '#475569',
                  borderBottom: `2px solid ${rightTab === tab.id ? '#f97316' : 'transparent'}`,
                  backgroundColor: 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu beats */}
          {rightTab === 'beats' && (
            <div className="p-5">
              <div className="space-y-1">
                {BEATS.map(beat => (
                  <BeatRow
                    key={beat.id}
                    beat={beat}
                    chapter={beatChapterMap[beat.id] || null}
                    isAlert={alertBeatIds.has(beat.id)}
                    isHovered={hoveredBeat === beat.id}
                    onHover={setHoveredBeat}
                    totalChapters={chaptersDB.length}
                  />
                ))}
              </div>
              <div
                className="mt-5 p-4 rounded-xl text-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Couverture beats</p>
                <p className="text-3xl font-black" style={{ color: placedCount === 15 ? '#10b981' : '#fbbf24' }}>
                  {placedCount}<span className="text-sm font-normal text-slate-600">/15</span>
                </p>
                <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(placedCount / 15) * 100}%`, backgroundColor: placedCount === 15 ? '#10b981' : '#fbbf24' }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contenu entités */}
          {rightTab === 'entities' && (
            <EntityCoveragePanel
              chapters={chaptersDB}
              characters={characters}
              locations={locations}
              objects={objects}
            />
          )}
        </div>
      </div>

      {/* ── Éditeur de chapitre ── */}
      {editorChapter !== undefined && (
        <ChapterEditor
          chapter={editorChapter}
          nextNumber={nextNumber}
          onSave={handleSave}
          onDelete={editorChapter ? handleDelete : undefined}
          onClose={() => setEditorChapter(undefined)}
          saving={saving}
        />
      )}
    </div>
  );
}
