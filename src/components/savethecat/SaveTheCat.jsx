import { useMemo, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BEATS } from '../../data/beats_config';
import { VIZ_STATUS } from '../../data/viz_palette';
import { computeAlertsFromEvents } from '../../db/queries';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useStcStore } from '../../stores/useStcStore';
import { useVolumeFilter } from '../../hooks/useVolumeFilter';
import { useVolumeStore } from '../../stores/useVolumeStore';
import { useStoreLoader } from '../../hooks/useStoreLoader';
import Frise from './Frise';
import BeatDrawer from './BeatDrawer';
import CraftDiagnostics from '../ui/CraftDiagnostics';
import { diagnoseStc, buildStcTome } from '../../utils/craftDiagnostics';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import Term from '../ui/Term';
import EventEditor from '../timeline/EventEditor';
import { extractChapters } from '../../utils/reviewUtils';
import { buildCoverageMap } from '../../utils/coverageUtils';

const ENTITY_SECTION_KEYS = [
  { type: 'character', labelKey: 'label.characters', color: (e) => e.color ?? '#5cae8e' },
  { type: 'location',  labelKey: 'label.locations',  color: ()  => '#60a5fa'             },
  { type: 'object',    labelKey: 'label.objects',     color: ()  => '#a78bfa'             },
];

// ── Panneau couverture des entités ─────────────────────────────────────────────
function EntityCoveragePanel({ events, characters, locations, objects, t }) {
  const entityListByType = {
    character: characters,
    location:  locations,
    object:    objects,
  };

  // Pour chaque entité, quels chapitres la mentionnent ? (dédupliqué par chapitre)
  const coverageMap = useMemo(() => buildCoverageMap(events), [events]);

  const allCount    = characters.length + locations.length + objects.length;
  const coveredCount = useMemo(() => {
    return Object.keys(coverageMap).length;
  }, [coverageMap]);

  return (
    <div className="p-5 space-y-5">
      {/* Barre de couverture globale */}
      <div
        className="p-4 rounded-none text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
      >
        <p className="text-xs font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em] mb-1">{t('stc.entityCoverage')}</p>
        <p className="text-3xl font-black" style={{ color: coveredCount === allCount ? VIZ_STATUS.ok : VIZ_STATUS.warn }}>
          {coveredCount}<span className="text-sm font-normal text-atlas-mute">/{allCount}</span>
        </p>
        <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: allCount ? `${(coveredCount / allCount) * 100}%` : '0%',
              backgroundColor: coveredCount === allCount ? VIZ_STATUS.ok : VIZ_STATUS.warn,
            }}
          />
        </div>
      </div>

      {/* Liste par type */}
      {ENTITY_SECTION_KEYS.map(({ type, labelKey, color }) => {
        const list = entityListByType[type] ?? [];
        if (!list.length) return null;
        const uncovered = list.filter(e => !coverageMap[`${type}:${e.id}`]);
        return (
          <div key={type}>
            <p className="text-[10px] font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
              {t(labelKey)}
              {uncovered.length > 0 && (
                <span className="font-normal normal-case" style={{ color: VIZ_STATUS.crit }}>
                  {t('stc.uncovered', { count: uncovered.length })}
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
                    className="flex items-start gap-2 px-2.5 py-2 rounded-none"
                    style={{
                      backgroundColor: none ? 'rgba(239,68,68,0.04)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${none ? 'rgba(239,68,68,0.18)' : 'rgba(255,255,255,0.05)'}`,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
                      style={{ backgroundColor: none ? VIZ_STATUS.crit : col, opacity: none ? 0.6 : 1 }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: none ? 'var(--color-atlas-soft)' : '#cbd5e1' }}>
                        {e.name}
                      </p>
                      {none ? (
                        <p className="text-[10px] mt-0.5" style={{ color: VIZ_STATUS.crit }}>{t('stc.noChapter')}</p>
                      ) : (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {chs.map(ch => (
                            <span
                              key={ch.number}
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
          {t('stc.noEntities')}
        </p>
      )}
    </div>
  );
}

// ── SaveTheCat ─────────────────────────────────────────────────────────────────
export default function SaveTheCat() {
  const { t } = useTranslation();
  useStoreLoader([useTimelineStore, useStcStore]);
  const filterByVolume             = useVolumeFilter();
  const { events: allEvents }      = useTimelineStore();
  const events                     = filterByVolume(allEvents);
  const volumes                    = useVolumeStore(s => s.volumes);
  const activeVolumeId             = useVolumeStore(s => s.activeVolumeId);
  const { characters, locations, objects } = useLoreStore();
  const [hoveredBeat,  setHoveredBeat]  = useState(null);
  const [selectedBeatId, setSelectedBeatId] = useState(null); // beat ouvert dans le tiroir
  const [seriesTomeId, setSeriesTomeId] = useState(null);    // tome affiché en mode série (chantier 5)
  const [rightTab,     setRightTab]     = useState('beats'); // 'beats' | 'entities'
  const [assigning,    setAssigning]    = useState(null);    // { beat, event | null }

  // Clic sur un beat de la frise → ouvre son détail dans le tiroir (chantier 4)
  const handleSelectBeat = (beatId) => {
    setSelectedBeatId(beatId);
    setRightTab('beats');
  };

  // Mode série : pas de filtre actif ET plusieurs tomes
  const isSeriesMode = !activeVolumeId && !!volumes && volumes.length > 1;

  // Map<beatId, event[]> — source de vérité pour les beats placés (supporte multi-tome)
  const beatEventMap = useMemo(() => {
    if (!events) return new Map();
    const map = new Map();
    for (const e of events) {
      if (!e.beatId) continue;
      const existing = map.get(e.beatId) ?? [];
      map.set(e.beatId, [...existing, e]);
    }
    return map;
  }, [events]);

  // Chapitres uniques issus des événements timeline (pour EventEditor)
  const timelineChapters = useMemo(() => extractChapters(events ?? []), [events]);

  const totalChapters = timelineChapters.length;

  // Données par tome (mode série uniquement) : chapitres + beatEventMap + alertes propres à chaque tome
  const volumeData = useMemo(() => {
    if (!isSeriesMode || !events) return null;
    return (volumes ?? []).map(vol => {
      const volEvents  = events.filter(e => e.volumeId === vol.id);
      const volChaps   = extractChapters(volEvents);
      const volBeatMap = new Map(volEvents.filter(e => e.beatId).map(e => [e.beatId, e]));
      const volAlerts  = volChaps.length > 0
        ? computeAlertsFromEvents(volBeatMap, volChaps.length, BEATS)
        : [];
      return { volume: vol, chapters: volChaps, beatEventMap: volBeatMap, alerts: volAlerts };
    }).filter(vd => vd.chapters.length > 0);
  }, [isSeriesMode, volumes, events]);

  // Tome affiché en mode série (bascule locale, chantier 5) — repli sur le 1er tome
  const activeSeriesTome = useMemo(() => {
    if (!isSeriesMode || !volumeData?.length) return null;
    return volumeData.find(vd => vd.volume.id === seriesTomeId) ?? volumeData[0];
  }, [isSeriesMode, volumeData, seriesTomeId]);

  // Alertes : agrégées par tome en mode série, globales sinon
  const alerts = useMemo(() => {
    if (isSeriesMode && volumeData) return volumeData.flatMap(vd => vd.alerts);
    return totalChapters > 0 ? computeAlertsFromEvents(beatEventMap, totalChapters, BEATS) : [];
  }, [isSeriesMode, volumeData, beatEventMap, totalChapters]);

  const alertBeatIds = useMemo(() => new Set(alerts.map(a => a.beat.id)), [alerts]);

  // Diagnostic de craft (verdict + notes) — positions calculées par tome.
  const stcFindings = useMemo(() => {
    const tomes = isSeriesMode && volumeData
      ? volumeData.map(vd => buildStcTome(vd.volume.id, `T${vd.volume.number}`, vd.chapters, vd.beatEventMap))
      : [buildStcTome('all', null, timelineChapters, beatEventMap)];
    return diagnoseStc(tomes);
  }, [isSeriesMode, volumeData, timelineChapters, beatEventMap]);

  const friseRef = useRef(null);
  const pickStcFinding = (f) => {
    setHoveredBeat(f.anchor ?? null);
    if (f.anchor) handleSelectBeat(f.anchor);
    if (friseRef.current) friseRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleAssign = (beat, event) => setAssigning({ beat, event: event ?? null });

  if (!events) return <Skeleton variant="list" />;

  if (events.length === 0) return (
    <div className="h-full flex items-center justify-center">
      <EmptyState
        icon={<Icon name="scene" size={40} className="text-atlas-mute" />}
        title={t('stc.emptyTitle')}
        hint={t('stc.emptyHint')}
        action={
          <button
            onClick={() => setAssigning({ beat: { id: null }, event: null })}
            className="px-4 py-2 rounded-none text-sm font-black transition-all duration-200"
            style={{ backgroundColor: 'rgba(92,174,142,0.18)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.4)' }}
          >
            {t('stc.emptyAction')}
          </button>
        }
      />
      {assigning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setAssigning(null); }}
        >
          <div className="w-full max-w-lg mx-4">
            <EventEditor
              event={assigning.event}
              chapters={timelineChapters}
              defaultBeatId={assigning.beat?.id ?? undefined}
              onClose={() => setAssigning(null)}
            />
          </div>
        </div>
      )}
    </div>
  );

  const placedCount   = BEATS.filter(b => beatEventMap.has(b.id)).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount  = alerts.filter(a => a.severity !== 'critical').length;

  // En mode série : comptage de beats placés par tome
  const placedByVolume = isSeriesMode && volumeData
    ? volumeData.map(vd => ({ volume: vd.volume, count: vd.beatEventMap.size }))
    : null;

  return (
    <div className="h-full w-full overflow-hidden no-scrollbar max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200">

      {/* ── Header ── */}
      <header data-tour="stc-beats" className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">Écrire · structure Save the Cat</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            <Term id="stc">Save the <span className="italic" style={{ color: '#5cae8e' }}>Cat</span></Term>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {placedByVolume
              ? placedByVolume.map((pv, i) => (
                  <span key={pv.volume.id}>
                    {i > 0 && <span className="mx-1.5 opacity-40">·</span>}
                    <span>T.{pv.volume.number} : </span>
                    <span style={{ color: pv.count === BEATS.length ? VIZ_STATUS.ok : '#94a3b8' }}>
                      {pv.count}/{BEATS.length}
                    </span>
                  </span>
                ))
              : `${placedCount}/${BEATS.length}`
            }
            {' '}<Term id="beat">{t('stc.beatsPlaced')}</Term>
            {criticalCount > 0 && (
              <span style={{ color: VIZ_STATUS.crit }}>
                {' '}· {t('stc.criticalAlerts', { count: criticalCount })}
              </span>
            )}
            {warningCount > 0 && (
              <span style={{ color: VIZ_STATUS.warn }}>
                {' '}· {t('stc.warnings', { count: warningCount })}
              </span>
            )}
          </p>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
      {/* ── Légende ── */}
      <div
        className="flex items-center gap-6 justify-center px-8 py-2 border-b border-atlas-line flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        <span className="flex items-center gap-1.5 text-[11px] text-atlas-soft">
          <span
            className="inline-block rounded-full border"
            style={{ width: 12, height: 12, backgroundColor: 'rgba(92,174,142,0.15)', borderColor: 'rgba(92,174,142,0.55)' }}
          />
          {t('stc.legendPlaced')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-atlas-soft">
          <span
            className="inline-block"
            style={{ width: 10, height: 10, transform: 'rotate(45deg)', border: '1.5px solid rgba(92,174,142,0.5)', backgroundColor: 'rgba(92,174,142,0.15)' }}
          />
          {t('stc.legendIdeal')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-atlas-soft">
          <span
            className="inline-block rounded-full"
            style={{ width: 20, height: 10, backgroundColor: 'rgba(92,174,142,0.12)', border: '1px solid rgba(92,174,142,0.35)' }}
          />
          {t('stc.legendTolerance')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-atlas-soft">
          <Icon name="warning" size={13} style={{ color: VIZ_STATUS.warn }} />
          {t('stc.legendDeviation')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-atlas-soft">
          <Icon name="critical" size={13} style={{ color: VIZ_STATUS.crit }} />
          {t('severity.critical')}
        </span>
      </div>

      {/* ── Frise(s) ── */}
      <div ref={friseRef}>
      {isSeriesMode && volumeData && activeSeriesTome ? (
        <div className="px-10 pt-5 pb-2 flex-shrink-0">
          {/* Bande série compacte : sélecteur de tome + couverture (chantier 5) */}
          <div className="flex gap-2 mb-5" role="tablist" aria-label={t('dashboard.seriesView')}>
            {volumeData.map(vd => {
              const count    = vd.beatEventMap.size;
              const isActive = activeSeriesTome.volume.id === vd.volume.id;
              const color    = count === BEATS.length ? VIZ_STATUS.ok : VIZ_STATUS.warn;
              return (
                <button
                  key={vd.volume.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSeriesTomeId(vd.volume.id)}
                  className="flex-1 text-left px-3 py-2 rounded-none transition-all duration-150"
                  style={{
                    border: `1px solid ${isActive ? 'rgba(92,174,142,0.5)' : 'var(--color-atlas-line)'}`,
                    backgroundColor: isActive ? 'rgba(92,174,142,0.08)' : 'transparent',
                  }}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: 'rgba(92,174,142,0.2)', color: '#5cae8e' }}
                      >
                        T{vd.volume.number}
                      </span>
                      <span className="text-[11px] truncate" style={{ color: isActive ? '#e2e8f0' : 'var(--color-atlas-soft)' }}>
                        {vd.volume.title}
                      </span>
                    </span>
                    <span className="text-[11px] font-black flex-shrink-0" style={{ color }}>
                      {count}<span className="text-[9px] font-normal text-atlas-mute">/{BEATS.length}</span>
                    </span>
                  </div>
                  <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(count / BEATS.length) * 100}%`, backgroundColor: color }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Frise du tome sélectionné */}
          <div data-tour="stc-frise">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(92,174,142,0.6)' }}>
              {t('volume.tome', { number: activeSeriesTome.volume.number })} · {activeSeriesTome.volume.title}
            </p>
            <Frise
              chapters={activeSeriesTome.chapters}
              beatEventMap={activeSeriesTome.beatEventMap}
              alerts={activeSeriesTome.alerts}
              hoveredBeat={hoveredBeat}
              onHoverBeat={setHoveredBeat}
              selectedBeat={selectedBeatId}
              onSelectBeat={handleSelectBeat}
            />
          </div>
        </div>
      ) : (
        <div data-tour="stc-frise" className="px-10 pt-6 pb-2 flex-shrink-0">
          <Frise
            chapters={timelineChapters}
            beatEventMap={beatEventMap}
            alerts={alerts}
            selectedBeat={selectedBeatId}
            onSelectBeat={handleSelectBeat}
            hoveredBeat={hoveredBeat}
            onHoverBeat={setHoveredBeat}
          />
        </div>
      )}
      </div>


      {/* ── Panels bas ── */}
      <div data-tour="stc-panels" className="flex flex-col md:flex-row border-t border-white/5">

        {/* Diagnostic de craft (verdict + notes) */}
        <div className="flex-1 p-5 md:border-r border-white/5">
          <CraftDiagnostics findings={stcFindings} onPick={pickStcFinding} dataTour="stc-diagnostics" />
        </div>

        {/* Panneau droit : beats / entités */}
        <div className="flex flex-col border-t md:border-t-0 md:border-l border-white/5 w-full md:w-[380px] lg:w-[480px]">

          {/* Onglets */}
          <div className="flex border-b border-atlas-line flex-shrink-0">
            {[
              { id: 'beats',    label: t('stc.beatDetailTab') },
              { id: 'entities', label: t('stc.entities') },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRightTab(tab.id)}
                className="flex-1 py-3 text-xs font-bold transition-all duration-150"
                style={{
                  color: rightTab === tab.id ? '#5cae8e' : 'var(--color-atlas-mute)',
                  borderBottom: `2px solid ${rightTab === tab.id ? '#5cae8e' : 'transparent'}`,
                  backgroundColor: 'transparent',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Contenu beats — tiroir contextuel du beat sélectionné (chantier 4) */}
          {rightTab === 'beats' && (
            <div className="p-5">
              {selectedBeatId ? (
                <BeatDrawer
                  beat={BEATS.find(b => b.id === selectedBeatId)}
                  events={beatEventMap.get(selectedBeatId) ?? []}
                  volumes={volumes}
                  isSeriesMode={isSeriesMode}
                  totalChapters={totalChapters}
                  isAlert={alertBeatIds.has(selectedBeatId)}
                  notes={stcFindings.filter(f => f.anchor === selectedBeatId)}
                  onAssign={handleAssign}
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-center gap-2 py-10">
                  <Icon name="scene" size={28} className="text-atlas-mute" />
                  <p className="text-xs text-atlas-mute italic max-w-[22ch]">{t('stc.selectBeatHint')}</p>
                </div>
              )}
              <div
                className="mt-5 p-4 rounded-none"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)' }}
              >
                <p className="text-xs font-grotesk font-bold text-atlas-mute uppercase tracking-[0.2em] mb-3 text-center">{t('stc.beatsCoverage')}</p>
                {placedByVolume ? (
                  <div className="space-y-2.5">
                    {placedByVolume.map(pv => {
                      const color = pv.count === BEATS.length ? VIZ_STATUS.ok : VIZ_STATUS.warn;
                      return (
                        <div key={pv.volume.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-atlas-soft">T.{pv.volume.number} · {pv.volume.title}</span>
                            <span className="text-xs font-black" style={{ color }}>
                              {pv.count}<span className="text-[10px] font-normal text-atlas-mute">/{BEATS.length}</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{ width: `${(pv.count / BEATS.length) * 100}%`, backgroundColor: color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <p className="text-3xl font-black text-center" style={{ color: placedCount === BEATS.length ? VIZ_STATUS.ok : VIZ_STATUS.warn }}>
                      {placedCount}<span className="text-sm font-normal text-atlas-mute">/{BEATS.length}</span>
                    </p>
                    <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(placedCount / BEATS.length) * 100}%`, backgroundColor: placedCount === BEATS.length ? VIZ_STATUS.ok : VIZ_STATUS.warn }}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Contenu entités */}
          {rightTab === 'entities' && (
            <EntityCoveragePanel
              events={events}
              characters={characters}
              locations={locations}
              objects={objects}
              t={t}
            />
          )}
        </div>
      </div>
      </div>

      {/* ── EventEditor modal (assigner un beat) ── */}
      {assigning && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setAssigning(null); }}
        >
          <div className="w-full max-w-lg mx-4">
            <EventEditor
              event={assigning.event}
              chapters={timelineChapters}
              defaultBeatId={assigning.event ? undefined : assigning.beat.id}
              onClose={() => setAssigning(null)}
            />
          </div>
        </div>
      )}

    </div>
  );
}
