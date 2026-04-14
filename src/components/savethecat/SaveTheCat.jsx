import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BEATS } from '../../data/beats_config';
import { computeAlertsFromEvents } from '../../db/queries';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useStcStore } from '../../stores/useStcStore';
import { useVolumeFilter } from '../../hooks/useVolumeFilter';
import { useVolumeStore } from '../../stores/useVolumeStore';
import { useStoreLoader } from '../../hooks/useStoreLoader';
import Frise from './Frise';
import AlertCard from './AlertCard';
import BeatRow from './BeatRow';
import EmptyState from '../ui/EmptyState';
import Skeleton from '../ui/Skeleton';
import EventEditor from '../timeline/EventEditor';
import { extractChapters } from '../../utils/reviewUtils';
import { buildCoverageMap } from '../../utils/coverageUtils';

const ENTITY_SECTION_KEYS = [
  { type: 'character', labelKey: 'label.characters', color: (e) => e.color ?? '#818cf8' },
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
        className="p-4 rounded-xl text-center"
        style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">{t('stc.entityCoverage')}</p>
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
      {ENTITY_SECTION_KEYS.map(({ type, labelKey, color }) => {
        const list = entityListByType[type] ?? [];
        if (!list.length) return null;
        const uncovered = list.filter(e => !coverageMap[`${type}:${e.id}`]);
        return (
          <div key={type}>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
              {t(labelKey)}
              {uncovered.length > 0 && (
                <span className="font-normal normal-case" style={{ color: '#ef4444' }}>
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
                        <p className="text-[10px] mt-0.5" style={{ color: '#ef4444' }}>{t('stc.noChapter')}</p>
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
  const [rightTab,     setRightTab]     = useState('beats'); // 'beats' | 'entities'
  const [assigning,    setAssigning]    = useState(null);    // { beat, event | null }

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

  // Alertes : agrégées par tome en mode série, globales sinon
  const alerts = useMemo(() => {
    if (isSeriesMode && volumeData) return volumeData.flatMap(vd => vd.alerts);
    return totalChapters > 0 ? computeAlertsFromEvents(beatEventMap, totalChapters, BEATS) : [];
  }, [isSeriesMode, volumeData, beatEventMap, totalChapters]);

  const alertBeatIds = useMemo(() => new Set(alerts.map(a => a.beat.id)), [alerts]);

  const handleAssign = (beat, event) => setAssigning({ beat, event: event ?? null });

  if (!events) return <Skeleton variant="list" />;

  if (events.length === 0) return (
    <div className="h-full flex items-center justify-center">
      <EmptyState icon="🎬" title={t('stc.emptyTitle')} hint={t('stc.emptyHint')} />
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
    <div className="h-full w-full overflow-y-auto no-scrollbar flex flex-col bg-[#0B1621] text-slate-200">

      {/* ── Header ── */}
      <header data-tour="stc-beats" className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Save the <span style={{ color: '#f97316' }}>Cat</span>
          </h1>
          <p className="text-sm text-slate-500 font-serif italic">
            {placedByVolume
              ? placedByVolume.map((pv, i) => (
                  <span key={pv.volume.id}>
                    {i > 0 && <span className="mx-1.5 opacity-40">·</span>}
                    <span>T.{pv.volume.number} : </span>
                    <span style={{ color: pv.count === BEATS.length ? '#10b981' : '#94a3b8' }}>
                      {pv.count}/{BEATS.length}
                    </span>
                  </span>
                ))
              : `${placedCount}/${BEATS.length}`
            }
            {' '}{t('stc.beatsPlaced')}
            {criticalCount > 0 && (
              <span style={{ color: '#ef4444' }}>
                {' '}· {t('stc.criticalAlerts', { count: criticalCount })}
              </span>
            )}
            {warningCount > 0 && (
              <span style={{ color: '#fbbf24' }}>
                {' '}· {t('stc.warnings', { count: warningCount })}
              </span>
            )}
          </p>
        </div>
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
          {t('stc.legendPlaced')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="inline-block"
            style={{ width: 10, height: 10, transform: 'rotate(45deg)', border: '1.5px solid rgba(129,140,248,0.5)', backgroundColor: 'rgba(129,140,248,0.15)' }}
          />
          {t('stc.legendIdeal')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span style={{ color: '#fbbf24' }}>⚠</span>
          {t('stc.legendDeviation')}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span style={{ color: '#ef4444' }}>⛔</span>
          {t('severity.critical')}
        </span>
      </div>

      {/* ── Frise(s) ── */}
      <div>
      {isSeriesMode && volumeData ? (
        <div className="px-10 pt-5 pb-2 flex-shrink-0 space-y-6">
          {volumeData.map((vd, idx) => (
            <div key={vd.volume.id} data-tour={idx === 0 ? 'stc-frise' : undefined}>
              <p
                className="text-[11px] font-bold uppercase tracking-widest mb-3"
                style={{ color: 'rgba(129,140,248,0.6)' }}
              >
                {t('volume.tome', { number: vd.volume.number })} — {vd.volume.title}
              </p>
              <Frise
                chapters={vd.chapters}
                beatEventMap={vd.beatEventMap}
                alerts={vd.alerts}
                hoveredBeat={hoveredBeat}
                onHoverBeat={setHoveredBeat}
              />
            </div>
          ))}
        </div>
      ) : (
        <div data-tour="stc-frise" className="px-10 pt-6 pb-2 flex-shrink-0">
          <Frise
            chapters={timelineChapters}
            beatEventMap={beatEventMap}
            alerts={alerts}
            hoveredBeat={hoveredBeat}
            onHoverBeat={setHoveredBeat}
          />
        </div>
      )}
      </div>


      {/* ── Panels bas ── */}
      <div data-tour="stc-panels" className="flex flex-col md:flex-row border-t border-white/5">

        {/* Alertes */}
        <div className="flex-1 p-5 md:border-r border-white/5">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            {t('stc.narrativeAlerts')}
            {alerts.length > 0 && (
              <span className="ml-2 font-normal text-slate-600">({alerts.length})</span>
            )}
          </p>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">✓</span>
              <p className="text-base text-slate-400 font-bold">{t('stc.solidStructure')}</p>
              <p className="text-sm text-slate-600 font-serif italic">{t('stc.solidStructureHint')}</p>
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
              { id: 'beats',    label: t('stc.the15beats') },
              { id: 'entities', label: t('stc.entities') },
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
                    events={beatEventMap.get(beat.id) ?? []}
                    volumes={volumes}
                    isAlert={alertBeatIds.has(beat.id)}
                    isHovered={hoveredBeat === beat.id}
                    onHover={setHoveredBeat}
                    totalChapters={isSeriesMode ? 0 : totalChapters}
                    onAssign={handleAssign}
                  />
                ))}
              </div>
              <div
                className="mt-5 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-600 uppercase tracking-widest mb-3 text-center">{t('stc.beatsCoverage')}</p>
                {placedByVolume ? (
                  <div className="space-y-2.5">
                    {placedByVolume.map(pv => {
                      const color = pv.count === BEATS.length ? '#10b981' : '#fbbf24';
                      return (
                        <div key={pv.volume.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-500">T.{pv.volume.number} — {pv.volume.title}</span>
                            <span className="text-xs font-black" style={{ color }}>
                              {pv.count}<span className="text-[10px] font-normal text-slate-600">/{BEATS.length}</span>
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
                    <p className="text-3xl font-black text-center" style={{ color: placedCount === BEATS.length ? '#10b981' : '#fbbf24' }}>
                      {placedCount}<span className="text-sm font-normal text-slate-600">/{BEATS.length}</span>
                    </p>
                    <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${(placedCount / BEATS.length) * 100}%`, backgroundColor: placedCount === BEATS.length ? '#10b981' : '#fbbf24' }}
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
