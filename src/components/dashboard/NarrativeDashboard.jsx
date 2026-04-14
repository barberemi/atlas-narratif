import { useMemo, useState, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SEVERITY_CONFIG, SEVERITY_ORDER } from '../../data/severity_config';
import Skeleton from '../ui/Skeleton';
import { getEntityMeta, ENTITY_ICONS } from '../../utils/entityUtils';
import { useIncStore }          from '../../stores/useIncStore';
import { useLoreStore }         from '../../stores/useLoreStore';
import { useTimelineStore }     from '../../stores/useTimelineStore';
import { useStcStore }          from '../../stores/useStcStore';
import { usePlantStore }        from '../../stores/usePlantStore';
import { useArcStore }          from '../../stores/useArcStore';
import { useHeroJourneyStore }  from '../../stores/useHeroJourneyStore';
import { useVolumeStore }       from '../../stores/useVolumeStore';
import { useCharacterArcStore } from '../../stores/useCharacterArcStore';
import { useThreadStore }       from '../../stores/useThreadStore';
import { useStoreLoader }       from '../../hooks/useStoreLoader';
import { PLANT_TYPES }          from '../../pages/PlantsBrowser';
import EntityEditor      from '../lore/EntityEditor';
import CircularGauge     from './CircularGauge';
import SectionTitle      from './SectionTitle';
import StatCard          from './StatCard';
import RecommendationRow from './RecommendationRow';

const TYPE_ICONS = {
  'Contradiction Temporelle':    '⏱',
  'Entité Non Référencée':       '🔗',
  'Incohérence de Porteur':      '🎒',
  'Téléportation de Personnage': '🌀',
  'Créateur Non Référencé':      '⚒',
  "Lieu d'Origine Inexistant":   '📍',
  'Affiliation Fantôme':         '👻',
  'Objet sans Lieu de Création': '❓',
};

const TOTAL_BEATS    = 15;
const TOTAL_VH_STAGES = 12;

// ── FrameworkCard ─────────────────────────────────────────────────────────────

function FrameworkCard({ icon, title, filled, total, score, path, onNavigate, subtitle, openLabel }) {
  const color = score >= 80 ? '#10B981' : score >= 40 ? '#f59e0b' : score > 0 ? '#ef4444' : '#475569';
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-xs font-bold text-slate-300">{title}</span>
        </div>
        <button
          onClick={() => onNavigate(path)}
          className="text-[10px] font-bold transition-opacity opacity-50 hover:opacity-100"
          style={{ color: '#818cf8' }}
        >
          {openLabel}
        </button>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-black leading-none" style={{ color }}>{filled}</span>
        <span className="text-sm text-slate-500 mb-0.5">/ {total}</span>
        <span className="text-xs text-slate-600 mb-0.5 ml-auto font-mono">{score}%</span>
      </div>
      {subtitle && <p className="text-[10px] text-slate-600 -mt-1">{subtitle}</p>}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${score}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
function NarrativeDashboard({ onEntityClick, onOpenIncoherences }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [editorState, setEditorState] = useState(null);

  // Lazy-load tous les stores nécessaires au dashboard
  useStoreLoader([useTimelineStore, useStcStore, useIncStore, usePlantStore, useArcStore, useHeroJourneyStore, useCharacterArcStore, useThreadStore]);

  const incoherences = useIncStore(s => s.data);
  const characters   = useLoreStore(s => s.characters);
  const locations    = useLoreStore(s => s.locations);
  const objects      = useLoreStore(s => s.objects);
  const groups       = useLoreStore(s => s.groups) ?? [];
  const events       = useTimelineStore(s => s.events);
  const stcChapters  = useStcStore(s => s.chapters);
  const plants       = usePlantStore(s => s.plants);
  const arcPoints    = useArcStore(s => s.points);
  const hjEntries    = useHeroJourneyStore(s => s.entries);
  const volumes       = useVolumeStore(s => s.volumes);
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);

  // ── Calculs incohérences ───────────────────────────────────────────────────
  const { totalWeight, resolvedWeight, bySeverity, resolvedBySeverity, byType, topEntities } = useMemo(() => {
    const weights = { critical: 4, high: 3, medium: 2, low: 1 };
    const list = incoherences ?? [];
    let totalWeight    = 0;
    let resolvedWeight = 0;
    const bySev         = { critical: 0, high: 0, medium: 0, low: 0 };
    const resolvedBySev = { critical: 0, high: 0, medium: 0, low: 0 };
    const byType = {};
    const entityMap = new Map();

    list.forEach(inc => {
      const w = weights[inc.severity];
      totalWeight += w;
      if (inc.resolved) { resolvedWeight += w; resolvedBySev[inc.severity]++; }
      bySev[inc.severity]++;
      byType[inc.type] = (byType[inc.type] || 0) + 1;

      (inc.links ?? []).forEach(link => {
        const meta = getEntityMeta(link.entityId);
        if (!meta) return;
        if (!entityMap.has(link.entityId)) {
          entityMap.set(link.entityId, { count: 0, maxSevOrder: 99, meta });
        }
        const entry = entityMap.get(link.entityId);
        entry.count++;
        if (SEVERITY_ORDER[inc.severity] < entry.maxSevOrder) {
          entry.maxSevOrder = SEVERITY_ORDER[inc.severity];
          entry.maxSev = inc.severity;
        }
      });
    });

    const topEntities = [...entityMap.entries()]
      .sort((a, b) => b[1].count - a[1].count || a[1].maxSevOrder - b[1].maxSevOrder)
      .slice(0, 6)
      .map(([id, data]) => ({ id, ...data }));

    return { totalWeight, resolvedWeight, bySeverity: bySev, resolvedBySeverity: resolvedBySev, byType, topEntities };
  }, [incoherences]);

  // ── Inventaire ────────────────────────────────────────────────────────────
  const inventory = useMemo(() => {
    const chapterCount = new Set((events ?? []).map(e => e.chapter)).size;
    const assignedBeats = new Set(
      (stcChapters ?? []).flatMap(ch => ch.beats ?? [])
    ).size;
    return {
      characters: characters.length,
      locations:  locations.length,
      objects:    objects.length,
      chapters:   chapterCount,
      events:     (events ?? []).length,
      beats:      assignedBeats,
    };
  }, [characters, locations, objects, events, stcChapters]);

  // ── Couverture entités ─────────────────────────────────────────────────────
  const coverage = useMemo(() => {
    const evtList = events ?? [];
    const charIdsInTimeline = new Set(
      evtList.flatMap(e => e.entities.filter(x => x.entityType === 'character').map(x => x.id))
    );
    const locIdsInTimeline = new Set([
      ...evtList.map(e => e.locationId).filter(Boolean),
      ...evtList.flatMap(e => e.entities.filter(x => x.entityType === 'location').map(x => x.id)),
    ]);

    const orphanChars = characters.filter(c => !charIdsInTimeline.has(c.id));
    const orphanLocs  = locations.filter(l => !locIdsInTimeline.has(l.id));

    const charEventCount = new Map();
    for (const evt of evtList) {
      for (const e of evt.entities) {
        if (e.entityType !== 'character') continue;
        charEventCount.set(e.id, (charEventCount.get(e.id) ?? 0) + 1);
      }
    }
    const topChars = [...charEventCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, count]) => {
        const char = characters.find(c => c.id === id);
        return { id, name: char?.name ?? id, color: char?.color ?? '#64748b', count };
      });
    const maxCount = topChars[0]?.count ?? 1;

    return { orphanChars, orphanLocs, topChars, maxCount };
  }, [characters, locations, events]);

  // ── Couverture des méthodes ────────────────────────────────────────────────
  const frameworkCoverage = useMemo(() => {
    const evtList      = events ?? [];
    const eventsTotal  = evtList.length;
    const chapterCount = inventory.chapters;
    const hjList       = hjEntries ?? [];
    const arcList      = arcPoints ?? [];

    // STC
    const beatsScore = Math.round((inventory.beats / TOTAL_BEATS) * 100);

    // Voyage du Héros — étapes uniques renseignées (au moins un summary)
    const filledVHStages = new Set(
      hjList.filter(e => e.summary?.trim()).map(e => e.stageKey)
    ).size;
    const vjScore = Math.round((filledVHStages / TOTAL_VH_STAGES) * 100);
    // Subtitle : personnage le plus avancé
    const hjByChar = new Map();
    for (const e of hjList.filter(x => x.summary?.trim())) {
      const cid = e.characterId ?? '__none__';
      hjByChar.set(cid, (hjByChar.get(cid) ?? 0) + 1);
    }
    const bestCharId = [...hjByChar.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
    const bestChar   = bestCharId && bestCharId !== '__none__' ? characters.find(c => c.id === bestCharId) : null;
    const vjSubtitle = bestChar ? { charName: bestChar.name, charFilled: hjByChar.get(bestCharId) } : null;

    // Arc émotionnel — chapitres avec au moins un point
    const arcCoveredChapters = new Set(arcList.map(p => p.chapterNumber)).size;
    const arcScore = chapterCount === 0 ? 0 : Math.round((arcCoveredChapters / chapterCount) * 100);

    // Anatomie de scène — événements avec goal + conflict + outcome
    const evtWithAnatomy = evtList.filter(
      e => e.sceneGoal && e.sceneConflict && e.sceneOutcome
    ).length;
    const anatomyScore = eventsTotal === 0 ? 0 : Math.round((evtWithAnatomy / eventsTotal) * 100);

    return {
      stc:     { filled: inventory.beats,    total: TOTAL_BEATS,    score: beatsScore,   subtitle: null },
      vj:      { filled: filledVHStages,     total: TOTAL_VH_STAGES, score: vjScore,     subtitle: vjSubtitle },
      arc:     { filled: arcCoveredChapters, total: chapterCount,    score: arcScore,    subtitle: null },
      anatomy: { filled: evtWithAnatomy,     total: eventsTotal,     score: anatomyScore, subtitle: null },
    };
  }, [events, inventory, hjEntries, arcPoints, characters]);

  // ── Rythme narratif ───────────────────────────────────────────────────────
  const rhythm = useMemo(() => {
    const evtList = events ?? [];
    const byChapter = new Map();
    for (const evt of evtList) {
      if (!byChapter.has(evt.chapter)) {
        byChapter.set(evt.chapter, { title: evt.chapterTitle, events: 0, chars: new Set() });
      }
      const ch = byChapter.get(evt.chapter);
      ch.events++;
      evt.entities.filter(e => e.entityType === 'character').forEach(e => ch.chars.add(e.id));
    }
    const chapters = [...byChapter.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([num, d]) => ({ num, title: d.title, events: d.events, chars: d.chars.size }));
    const maxEvents = Math.max(...chapters.map(c => c.events), 1);
    const maxChars  = Math.max(...chapters.map(c => c.chars), 1);
    return { chapters, maxEvents, maxChars };
  }, [events]);

  // ── Plants cross-tomes ────────────────────────────────────────────────────
  const crossTomePlants = useMemo(() => {
    const vols = volumes ?? [];
    if (vols.length < 2 || activeVolumeId !== null) return null;

    const volMap = new Map(vols.map(v => [v.id, v]));
    const plantList = plants ?? [];

    // Fil confirmé : plant et payoff dans deux tomes différents (fermé ou ouvert)
    const bridges = plantList
      .filter(p => p.plantVolumeId && p.payoffVolumeId && p.plantVolumeId !== p.payoffVolumeId)
      .map(p => ({
        ...p,
        fromVol: volMap.get(p.plantVolumeId),
        toVol:   volMap.get(p.payoffVolumeId),
      }))
      .filter(p => p.fromVol && p.toVol)
      .sort((a, b) => (a.fromVol.number - b.fromVol.number) || (a.toVol.number - b.toVol.number));

    // En suspens : plant assigné à un tome, payoff non encore défini
    const pending = plantList
      .filter(p => p.status === 'open' && p.plantVolumeId && !p.payoffVolumeId)
      .map(p => ({ ...p, fromVol: volMap.get(p.plantVolumeId) }))
      .filter(p => p.fromVol)
      .sort((a, b) => a.fromVol.number - b.fromVol.number);

    if (bridges.length === 0 && pending.length === 0) return null;
    return { bridges, pending };
  }, [volumes, activeVolumeId, plants]);

  // ── Vue Série ─────────────────────────────────────────────────────────────
  const seriesStats = useMemo(() => {
    const vols = volumes ?? [];
    if (vols.length < 2 || activeVolumeId !== null) return null;

    const evtList  = events ?? [];
    const stcList  = stcChapters ?? [];
    const arcList  = arcPoints ?? [];
    const incList  = incoherences ?? [];

    // entityId → Set<volumeId> — pour associer les incohérences aux tomes
    const entityVolumes = new Map();
    for (const evt of evtList) {
      if (!evt.volumeId) continue;
      for (const e of evt.entities ?? []) {
        if (!entityVolumes.has(e.id)) entityVolumes.set(e.id, new Set());
        entityVolumes.get(e.id).add(evt.volumeId);
      }
    }

    const maxDensity = Math.max(
      ...vols.map(vol => {
        const volEvts = evtList.filter(e => e.volumeId === vol.id);
        const chaps   = new Set(volEvts.map(e => e.chapter)).size;
        return chaps === 0 ? 0 : volEvts.length / chaps;
      }),
      1,
    );

    return vols.map(vol => {
      const volEvents   = evtList.filter(e => e.volumeId === vol.id);
      const chapterSet  = new Set(volEvents.map(e => e.chapter));
      const chapterCount = chapterSet.size;
      const eventCount   = volEvents.length;
      const density      = chapterCount === 0 ? 0 : eventCount / chapterCount;

      // STC — beats de ce tome
      const volBeats = new Set(
        stcList.filter(ch => ch.volumeId === vol.id).flatMap(ch => ch.beats ?? [])
      ).size;
      const stcScore = Math.round((volBeats / TOTAL_BEATS) * 100);

      // Arc — chapitres couverts de ce tome
      const arcCovered = new Set(
        arcList.filter(p => p.volumeId === vol.id).map(p => p.chapterNumber)
      ).size;
      const arcScore = chapterCount === 0 ? 0 : Math.round((arcCovered / chapterCount) * 100);

      // Incohérences non résolues liées à ce tome (proxy via entités)
      const unresolvedInc = incList.filter(inc => !inc.resolved);
      const volInc = unresolvedInc.filter(inc =>
        (inc.links ?? []).some(link => entityVolumes.get(link.entityId)?.has(vol.id))
      );
      const criticalInc = volInc.filter(i => i.severity === 'critical').length;
      const highInc     = volInc.filter(i => i.severity === 'high').length;

      return { vol, eventCount, chapterCount, density, maxDensity, stcScore, arcScore, criticalInc, highInc };
    });
  }, [volumes, activeVolumeId, events, stcChapters, arcPoints, incoherences]);

  // ── Scores de base ─────────────────────────────────────────────────────────
  const penaltyScore  = totalWeight === 0 ? 100 : Math.round(100 - ((totalWeight - resolvedWeight) / totalWeight) * 100);
  const coverageScore = inventory.characters === 0 ? 100
    : Math.round(((inventory.characters - coverage.orphanChars.length) / inventory.characters) * 100);

  // Score global adaptatif (n'inclut un axe que s'il y a des données)
  const globalScore = useMemo(() => {
    const parts = [
      { w: 2, v: penaltyScore },
      { w: 1, v: coverageScore },
      { w: 1, v: frameworkCoverage.stc.score },
    ];
    if (inventory.chapters > 0)      parts.push({ w: 1, v: frameworkCoverage.arc.score });
    if (inventory.events > 0)        parts.push({ w: 1, v: frameworkCoverage.anatomy.score });
    if ((hjEntries?.length ?? 0) > 0) parts.push({ w: 1, v: frameworkCoverage.vj.score });
    const totalW = parts.reduce((s, x) => s + x.w, 0);
    return Math.round(parts.reduce((s, x) => s + x.v * x.w, 0) / totalW);
  }, [penaltyScore, coverageScore, frameworkCoverage, inventory, hjEntries]);

  const globalColor = globalScore >= 80 ? '#10B981' : globalScore >= 50 ? '#f59e0b' : '#ef4444';
  const globalLabel = globalScore >= 80 ? t('dashboard.good') : globalScore >= 50 ? t('dashboard.average') : t('dashboard.critical');

  // ── Recommandations ─────────────────────────────────────────────────────────
  const recommendations = useMemo(() => {
    const list = [];
    const unresolved = (incoherences ?? []).filter(i => !i.resolved);
    const critical   = unresolved.filter(i => i.severity === 'critical');
    const high       = unresolved.filter(i => i.severity === 'high');

    if (critical.length > 0) list.push({
      icon: '🔴', color: '#ef4444',
      label: t('dashboard.recCritical', { count: critical.length }),
      actionLabel: t('dashboard.actionFix'), action: () => onOpenIncoherences('critical'),
    });
    else if (high.length > 0) list.push({
      icon: '🟠', color: '#f97316',
      label: t('dashboard.recHigh', { count: high.length }),
      actionLabel: t('dashboard.actionFix'), action: () => onOpenIncoherences('high'),
    });

    const missingBeats = TOTAL_BEATS - inventory.beats;
    if (missingBeats > 0) list.push({
      icon: '🐱', color: '#f59e0b',
      label: t('dashboard.recMissingBeats', { count: missingBeats }),
      actionLabel: t('dashboard.actionStructure'), action: () => navigate('/savethecat'),
    });

    if (coverage.orphanChars.length > 0) list.push({
      icon: '👤', color: '#818cf8',
      label: t('dashboard.recOrphanChars', { count: coverage.orphanChars.length }),
      actionLabel: t('dashboard.actionTimeline'), action: () => navigate('/timeline'),
    });

    if (inventory.chapters > 0 && frameworkCoverage.arc.score < 50) list.push({
      icon: '〰️', color: '#6366f1',
      label: t('dashboard.recArcIncomplete', { filled: frameworkCoverage.arc.filled, total: frameworkCoverage.arc.total }),
      actionLabel: t('dashboard.actionComplete'), action: () => navigate('/arc'),
    });

    if (frameworkCoverage.vj.score < 50 && characters.length > 0) list.push({
      icon: '⚔️', color: '#8B5CF6',
      label: t('dashboard.recHeroJourney', { filled: frameworkCoverage.vj.filled, total: TOTAL_VH_STAGES }),
      actionLabel: t('dashboard.actionFill'), action: () => navigate('/heros'),
    });

    if (inventory.events > 0 && frameworkCoverage.anatomy.score < 30) list.push({
      icon: '🔬', color: '#14b8a6',
      label: t('dashboard.recNoAnatomy', { count: frameworkCoverage.anatomy.total - frameworkCoverage.anatomy.filled }),
      actionLabel: t('dashboard.actionTimeline'), action: () => navigate('/timeline'),
    });

    const modifiedCount = [...characters, ...locations, ...objects].filter(e => e.source !== 'import').length;
    if (modifiedCount > 0) list.push({
      icon: '✏️', color: '#34d399',
      label: t('dashboard.recModified', { count: modifiedCount }),
      actionLabel: t('dashboard.actionReview'), action: () => navigate('/review'),
    });

    return list.slice(0, 6);
  }, [incoherences, inventory, coverage, frameworkCoverage, characters, locations, objects, navigate, onOpenIncoherences, t]);

  // ── Entités modifiées ──────────────────────────────────────────────────────
  const modifiedEntities = useMemo(() => {
    const all = [
      ...characters.filter(e => e.source !== 'import').map(e => ({ ...e, entityType: 'character' })),
      ...locations.filter(e => e.source  !== 'import').map(e => ({ ...e, entityType: 'location'  })),
      ...objects.filter(e => e.source    !== 'import').map(e => ({ ...e, entityType: 'object'    })),
    ];
    return all.slice(0, 5);
  }, [characters, locations, objects]);

  const SOURCE_COLORS = { manual: '#34d399', modified: '#f59e0b' };
  const SOURCE_LABELS = { manual: t('dashboard.sourceManual'), modified: t('dashboard.sourceModified') };

  if (!incoherences) return <Skeleton variant="dashboard" />;


  const resolvedCount = (incoherences ?? []).filter(i => i.resolved).length;
  const total         = (incoherences ?? []).length;
  const resolvedPct   = total === 0 ? 100 : Math.round((resolvedCount / total) * 100);

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-y-hidden">

      {/* ── Header ── */}
      <header data-tour="dashboard-stats" className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            {t('dashboard.narrativeHealth')} <span style={{ color: '#3F51B5' }}>{t('dashboard.narrativeHighlight')}</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">{t('dashboard.projectOverviewSubtitle')}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-3xl font-black leading-none" style={{ color: globalColor }}>{globalScore}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: globalColor }}>{globalLabel}</p>
          </div>
          <div className="w-16 h-16 relative flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15" fill="none"
                stroke={globalColor} strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${(globalScore / 100) * 94.25} 94.25`}
                style={{ filter: `drop-shadow(0 0 4px ${globalColor})`, transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 bg-[#0B1621]">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Inventaire narratif ── */}
          <SectionTitle>{t('dashboard.overview')}</SectionTitle>
          <div data-tour="dashboard-inventory" className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <StatCard icon="👤" value={inventory.characters} label={t('label.characters')} />
            <StatCard icon="📍" value={inventory.locations}  label={t('label.locations')} />
            <StatCard icon="⚔️" value={inventory.objects}    label={t('label.objects')} />
            <StatCard icon="📖" value={inventory.chapters}   label={t('label.chapters')} />
            <StatCard icon="📅" value={inventory.events}     label={t('label.events')} />
            <StatCard
              icon="🐱"
              value={`${inventory.beats}/${TOTAL_BEATS}`}
              label={`${t('label.beats')} STC`}
              sub={inventory.beats === TOTAL_BEATS ? t('dashboard.structureComplete') : t('dashboard.missing', { count: TOTAL_BEATS - inventory.beats })}
            />
          </div>

          {/* ── Vue Série ── */}
          {seriesStats && (
            <>
              <SectionTitle>{t('dashboard.seriesView')}</SectionTitle>
              <div
                data-tour="dashboard-series"
                className="rounded-2xl overflow-hidden"
                style={{ border: '1px solid rgba(255,255,255,0.07)' }}
              >
                {/* En-tête colonnes */}
                <div
                  className="grid items-center px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600"
                  style={{ gridTemplateColumns: '1fr 6fr 2rem 2rem 5rem', backgroundColor: 'rgba(255,255,255,0.02)', gap: '0.75rem' }}
                >
                  <span>{t('dashboard.volume')}</span>
                  <span>{t('dashboard.narrativeDensity')}</span>
                  <span className="text-center">STC</span>
                  <span className="text-center">Arc</span>
                  <span className="text-right">{t('dashboard.incoherences')}</span>
                </div>

                {seriesStats.map(({ vol, eventCount, chapterCount, density, maxDensity, stcScore, arcScore, criticalInc, highInc }, idx) => {
                  const stcColor  = stcScore  >= 80 ? '#10B981' : stcScore  >= 40 ? '#f59e0b' : '#ef4444';
                  const arcColor  = arcScore  >= 80 ? '#10B981' : arcScore  >= 40 ? '#f59e0b' : '#ef4444';
                  const hasAlerts = criticalInc > 0 || highInc > 0;
                  return (
                    <div
                      key={vol.id}
                      className="grid items-center px-4 py-3"
                      style={{
                        gridTemplateColumns: '1fr 6fr 2rem 2rem 5rem',
                        gap: '0.75rem',
                        backgroundColor: idx % 2 === 0 ? 'rgba(255,255,255,0.025)' : 'transparent',
                        borderTop: idx > 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      }}
                    >
                      {/* Badge tome + titre */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8' }}
                        >
                          T{vol.number}
                        </span>
                        <span className="text-xs text-slate-300 truncate">{vol.title}</span>
                      </div>

                      {/* Barre de densité */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${maxDensity === 0 ? 0 : Math.round((density / maxDensity) * 100)}%`,
                              backgroundColor: '#3F51B5',
                              opacity: 0.8,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 w-16 text-right">
                          {eventCount}ev · {chapterCount}ch
                        </span>
                      </div>

                      {/* STC % */}
                      <span className="text-xs font-black text-center" style={{ color: stcColor }}>{stcScore}%</span>

                      {/* Arc % */}
                      <span className="text-xs font-black text-center" style={{ color: arcColor }}>{arcScore}%</span>

                      {/* Incohérences */}
                      <div className="flex items-center justify-end gap-1">
                        {criticalInc > 0 && (
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}
                          >
                            {criticalInc} {t('dashboard.crit')}
                          </span>
                        )}
                        {highInc > 0 && (
                          <span
                            className="text-[10px] font-black px-1.5 py-0.5 rounded"
                            style={{ backgroundColor: 'rgba(249,115,22,0.15)', color: '#f97316' }}
                          >
                            {highInc} {t('dashboard.high')}
                          </span>
                        )}
                        {!hasAlerts && (
                          <span className="text-[10px] text-slate-600">—</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {/* ── Plants cross-tomes ── */}
          {crossTomePlants && (
            <>
              <SectionTitle>{t('dashboard.crossVolumeContinuity')}</SectionTitle>
              <div
                className="rounded-2xl p-5 flex flex-col gap-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                    {t('dashboard.crossVolumeSetups')}
                  </p>
                  <button
                    onClick={() => navigate('/plants')}
                    className="text-[10px] font-bold transition-opacity opacity-50 hover:opacity-100"
                    style={{ color: '#818cf8' }}
                  >
                    {t('dashboard.viewAll')}
                  </button>
                </div>

                {/* Fils confirmés (bridge) */}
                {crossTomePlants.bridges.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {t('dashboard.confirmed', { count: crossTomePlants.bridges.length })}
                    </p>
                    {crossTomePlants.bridges.map(p => {
                      const typeCfg = PLANT_TYPES.find(t => t.id === p.type) ?? PLANT_TYPES[2];
                      const isClosed = p.status === 'closed';
                      return (
                        <div key={p.id} className="flex items-center gap-3">
                          <span style={{ color: typeCfg.color }} className="flex-shrink-0 text-sm">{typeCfg.icon}</span>
                          <span className="text-xs text-slate-300 flex-1 truncate">{p.label}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className="text-[10px] font-black px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8' }}
                            >
                              T{p.fromVol.number}
                            </span>
                            <span className="text-slate-600 text-[10px]">→</span>
                            <span
                              className="text-[10px] font-black px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8' }}
                            >
                              T{p.toVol.number}
                            </span>
                            <span
                              className="text-[10px] font-bold px-1.5 py-0.5 rounded ml-1"
                              style={isClosed
                                ? { backgroundColor: 'rgba(16,185,129,0.12)', color: '#10B981' }
                                : { backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b' }
                              }
                            >
                              {isClosed ? t('dashboard.resolved') : t('dashboard.inProgress')}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* En suspens */}
                {crossTomePlants.pending.length > 0 && (
                  <div className="flex flex-col gap-2">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                      {t('dashboard.pending', { count: crossTomePlants.pending.length })}
                    </p>
                    {crossTomePlants.pending.map(p => {
                      const typeCfg = PLANT_TYPES.find(t => t.id === p.type) ?? PLANT_TYPES[2];
                      return (
                        <div key={p.id} className="flex items-center gap-3">
                          <span style={{ color: typeCfg.color }} className="flex-shrink-0 text-sm">{typeCfg.icon}</span>
                          <span className="text-xs text-slate-400 flex-1 truncate">{p.label}</span>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span
                              className="text-[10px] font-black px-1.5 py-0.5 rounded"
                              style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8' }}
                            >
                              T{p.fromVol.number}
                            </span>
                            <span className="text-slate-600 text-[10px]">→</span>
                            <span className="text-[10px] font-mono text-slate-600">?</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── Groupes ── */}
          {groups.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {groups.map(g => (
                <button
                  key={g.id}
                  onClick={() => navigate('/lore?tab=groups')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 hover:opacity-80"
                  style={{
                    backgroundColor: `${g.color}15`,
                    color:           g.color,
                    border:          `1px solid ${g.color}40`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: g.color }} />
                  {g.name}
                  <span className="opacity-50 text-[10px] font-normal">{g.type}</span>
                  <span
                    className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-black"
                    style={{ backgroundColor: `${g.color}25`, color: g.color }}
                  >
                    {(g.members ?? []).length}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* ── 3 jauges circulaires ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                score: penaltyScore,
                title: t('dashboard.incoherenceCorrection'),
              },
              {
                score: coverageScore,
                title: t('dashboard.characterCoverage'),
                valueLabel: `${inventory.characters - coverage.orphanChars.length}/${inventory.characters}`,
              },
              {
                score: frameworkCoverage.stc.score,
                title: t('dashboard.stcStructure'),
                valueLabel: `${inventory.beats}/${TOTAL_BEATS}`,
              },
            ].map(({ score, title, valueLabel }) => (
              <div
                key={title}
                className="rounded-2xl p-6 flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <CircularGauge score={score} title={title} valueLabel={valueLabel} />
              </div>
            ))}
          </div>

          {/* ── Couverture des méthodes ── */}
          <SectionTitle>{t('dashboard.methodCoverage')}</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <FrameworkCard
              icon="🐱"
              title={t('dashboard.saveTheCat')}
              filled={frameworkCoverage.stc.filled}
              total={frameworkCoverage.stc.total}
              score={frameworkCoverage.stc.score}
              path="/savethecat"
              onNavigate={navigate}
              openLabel={t('dashboard.open')}
              subtitle={t('dashboard.missingBeats', { count: frameworkCoverage.stc.total - frameworkCoverage.stc.filled })}
            />
            <FrameworkCard
              icon="⚔️"
              title={t('dashboard.heroJourney')}
              filled={frameworkCoverage.vj.filled}
              total={frameworkCoverage.vj.total}
              score={frameworkCoverage.vj.score}
              path="/heros"
              onNavigate={navigate}
              openLabel={t('dashboard.open')}
              subtitle={frameworkCoverage.vj.subtitle ? t('dashboard.bestChar', { name: frameworkCoverage.vj.subtitle.charName, filled: frameworkCoverage.vj.subtitle.charFilled }) : t('dashboard.missingStages', { count: frameworkCoverage.vj.total - frameworkCoverage.vj.filled })}
            />
            <FrameworkCard
              icon="〰️"
              title={t('dashboard.emotionalArc')}
              filled={frameworkCoverage.arc.filled}
              total={frameworkCoverage.arc.total}
              score={frameworkCoverage.arc.score}
              path="/arc"
              onNavigate={navigate}
              openLabel={t('dashboard.open')}
              subtitle={frameworkCoverage.arc.total === 0 ? t('dashboard.noChapters') : t('dashboard.chaptersWithoutPoint', { count: frameworkCoverage.arc.total - frameworkCoverage.arc.filled })}
            />
            <FrameworkCard
              icon="🔬"
              title={t('dashboard.sceneAnatomy')}
              filled={frameworkCoverage.anatomy.filled}
              total={frameworkCoverage.anatomy.total}
              score={frameworkCoverage.anatomy.score}
              path="/timeline"
              onNavigate={navigate}
              openLabel={t('dashboard.open')}
              subtitle={t('dashboard.goalConflictOutcome')}
            />
          </div>

          {/* ── À faire maintenant ── */}
          <SectionTitle>{t('dashboard.todoNow')}</SectionTitle>
          {recommendations.length === 0 ? (
            <div
              className="rounded-xl px-5 py-4 flex items-center gap-3"
              style={{ backgroundColor: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
            >
              <span className="text-lg">✅</span>
              <p className="text-sm text-emerald-400 font-semibold">{t('dashboard.allGood')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {recommendations.map((rec, i) => (
                <RecommendationRow key={i} {...rec} />
              ))}
            </div>
          )}

          {/* ── Amorces narratives ── */}
          {(plants?.length ?? 0) > 0 && (() => {
            const openPlants = plants.filter(p => p.status === 'open');
            return (
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{t('dashboard.narrativeSetups')}</p>
                  <button
                    onClick={() => navigate('/plants')}
                    className="text-[10px] font-bold transition-colors"
                    style={{ color: '#818cf8' }}
                  >
                    {t('dashboard.viewAll')}
                  </button>
                </div>
                <div className="flex items-center gap-6 mb-3">
                  <div className="flex flex-col">
                    <span className="text-2xl font-black" style={{ color: openPlants.length > 0 ? '#818cf8' : '#22c55e' }}>
                      {openPlants.length}
                    </span>
                    <span className="text-[10px] text-slate-500">{t('dashboard.pending')}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-slate-400">{plants.length}</span>
                    <span className="text-[10px] text-slate-500">{t('dashboard.total')}</span>
                  </div>
                </div>
                {openPlants.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    {openPlants.slice(0, 4).map(p => {
                      const typeCfg = PLANT_TYPES.find(t => t.id === p.type) ?? PLANT_TYPES[2];
                      return (
                        <div key={p.id} className="flex items-center gap-2 text-xs">
                          <span style={{ color: typeCfg.color }}>{typeCfg.icon}</span>
                          <span className="text-slate-300 flex-1 truncate">{p.label}</span>
                          <span className="text-slate-600 font-mono flex-shrink-0">
                            Ch.{p.plantChapterNum ?? '?'}
                          </span>
                        </div>
                      );
                    })}
                    {openPlants.length > 4 && (
                      <p className="text-[10px] text-slate-600 italic">{t('dashboard.others', { count: openPlants.length - 4 })}</p>
                    )}
                  </div>
                )}
                {openPlants.length === 0 && (
                  <p className="text-xs text-emerald-400 font-semibold">{t('dashboard.allSetupsResolved')}</p>
                )}
              </div>
            );
          })()}

          {/* ── Rythme & Présences ── */}
          <SectionTitle>{t('dashboard.rhythmAndPresence')}</SectionTitle>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Personnages les plus présents */}
            <div
              className="rounded-2xl p-5 md:col-span-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.activeCharacters')}</p>
              {coverage.topChars.length === 0 ? (
                <p className="text-xs text-slate-600 italic">{t('dashboard.noTimelineEvents')}</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {coverage.topChars.map(({ id, name, color, count }) => (
                    <div key={id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 truncate">{name}</span>
                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                          {t('dashboard.scene', { count })}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.round((count / coverage.maxCount) * 100)}%`, backgroundColor: color }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Orphelins */}
            <div
              className="rounded-2xl p-5 md:col-span-2 grid grid-cols-2 gap-4"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              {/* Personnages orphelins */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{t('dashboard.offTimeline')}</p>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: coverage.orphanChars.length > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)',
                      color: coverage.orphanChars.length > 0 ? '#F59E0B' : '#10B981',
                    }}
                  >
                    {coverage.orphanChars.length} 👤
                  </span>
                </div>
                {coverage.orphanChars.length === 0 ? (
                  <p className="text-xs text-green-500 italic">{t('dashboard.allPresent')}</p>
                ) : (
                  <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 160 }}>
                    {coverage.orphanChars.map(c => (
                      <div key={c.id} className="flex items-center gap-2 py-1 border-b border-white/05">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                        <span className="text-xs text-slate-400 truncate">{c.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Lieux orphelins */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-500 uppercase tracking-widest">{t('dashboard.unvisitedLocations')}</p>
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: coverage.orphanLocs.length > 0 ? 'rgba(245,158,11,0.12)' : 'rgba(16,185,129,0.1)',
                      color: coverage.orphanLocs.length > 0 ? '#F59E0B' : '#10B981',
                    }}
                  >
                    {coverage.orphanLocs.length} 📍
                  </span>
                </div>
                {coverage.orphanLocs.length === 0 ? (
                  <p className="text-xs text-green-500 italic">{t('dashboard.allUsed')}</p>
                ) : (
                  <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 160 }}>
                    {coverage.orphanLocs.map(l => (
                      <div key={l.id} className="flex items-center gap-2 py-1 border-b border-white/05">
                        <span className="text-slate-600 text-xs">📍</span>
                        <span className="text-xs text-slate-400 truncate">{l.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── Rythme narratif ── */}
          {rhythm.chapters.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.eventsPerChapter')}</p>
                <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 240 }}>
                  {rhythm.chapters.map(ch => (
                    <div key={ch.num} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600 w-6 text-right flex-shrink-0">{ch.num}</span>
                      <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                        <div
                          className="h-full rounded transition-all duration-700 flex items-center"
                          style={{
                            width: `${Math.round((ch.events / rhythm.maxEvents) * 100)}%`,
                            backgroundColor: '#3F51B5',
                            opacity: 0.75,
                            minWidth: ch.events > 0 ? 24 : 0,
                          }}
                        >
                          <span className="text-[9px] font-bold text-white/70 px-1.5">{ch.events}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-600 truncate w-24 flex-shrink-0">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.activeCharsPerChapter')}</p>
                <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 240 }}>
                  {rhythm.chapters.map(ch => (
                    <div key={ch.num} className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-600 w-6 text-right flex-shrink-0">{ch.num}</span>
                      <div className="flex-1 h-4 rounded overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }}>
                        <div
                          className="h-full rounded transition-all duration-700 flex items-center"
                          style={{
                            width: `${Math.round((ch.chars / rhythm.maxChars) * 100)}%`,
                            backgroundColor: '#6366f1',
                            opacity: 0.75,
                            minWidth: ch.chars > 0 ? 24 : 0,
                          }}
                        >
                          <span className="text-[9px] font-bold text-white/70 px-1.5">{ch.chars}</span>
                        </div>
                      </div>
                      <span className="text-[9px] text-slate-600 truncate w-24 flex-shrink-0">{ch.title}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ── Incohérences ── */}
          <SectionTitle>{t('label.incoherences')}</SectionTitle>

          <div className="grid grid-cols-1 gap-4">
            <div
              className="rounded-2xl p-6 flex flex-col justify-between"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">{t('dashboard.resolutionProgress')}</p>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-black text-white">{resolvedCount}</span>
                  <span className="text-slate-500 text-lg mb-1">{t('dashboard.resolvedIncoherences', { total })}</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${resolvedPct}%`,
                      background: resolvedPct === 100
                        ? 'linear-gradient(90deg, #10B981, #34D399)'
                        : 'linear-gradient(90deg, #3F51B5, #6366f1)',
                      boxShadow: '0 0 12px rgba(63,81,181,0.5)',
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600 mt-2 font-mono">{t('dashboard.percentComplete', { pct: resolvedPct })}</p>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-4">
                {Object.entries(bySeverity).map(([sev, count]) => {
                  const cfg      = SEVERITY_CONFIG[sev];
                  const resolved = resolvedBySeverity[sev];
                  const pct      = count === 0 ? 100 : Math.round((resolved / count) * 100);
                  const allDone  = resolved === count;
                  const halfDone = !allDone && resolved > 0;
                  const blockOpacity = allDone ? 0.3 : halfDone ? 0.65 : 1;
                  return (
                    <div
                      key={sev}
                      className="rounded-xl p-3 cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col gap-2"
                      style={{
                        backgroundColor: cfg.bg,
                        border: `1px solid ${allDone ? 'rgba(255,255,255,0.06)' : cfg.border}`,
                        opacity: blockOpacity,
                      }}
                      onClick={() => onOpenIncoherences(sev)}
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-2xl font-black leading-none" style={{ color: allDone ? '#475569' : cfg.color }}>
                          {count - resolved}
                          <span className="text-sm font-normal text-slate-600 ml-0.5">/{count}</span>
                        </p>
                        {allDone && <span className="text-[10px] text-green-500 font-bold">✓</span>}
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{t(`severity.${sev}`)}</p>
                      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: allDone ? '#10B981' : cfg.color,
                            opacity: 0.8,
                          }}
                        />
                      </div>
                      <p className="text-[10px] font-mono" style={{ color: allDone ? '#10B981' : '#475569' }}>
                        {t('dashboard.resolvedCount', { count: resolved })}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Entités les + touchées + Types ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.mostInvolvedEntities')}</p>
              <div className="space-y-2">
                {topEntities.map((e, idx) => {
                  const cfg     = e.maxSev ? SEVERITY_CONFIG[e.maxSev] : null;
                  const hexC    = e.meta.color.replace('#', '');
                  const rc = parseInt(hexC.slice(0,2),16), gc = parseInt(hexC.slice(2,4),16), bc = parseInt(hexC.slice(4,6),16);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onEntityClick(e.id, e.meta.type)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 hover:scale-[1.01] text-left group"
                      style={{ backgroundColor: `rgba(${rc},${gc},${bc},0.06)`, border: `1px solid rgba(${rc},${gc},${bc},0.12)` }}
                    >
                      <span className="text-slate-600 font-mono text-xs w-4 text-center flex-shrink-0">#{idx + 1}</span>
                      <span className="text-sm flex-shrink-0">{ENTITY_ICONS[e.meta.type]}</span>
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors flex-1 truncate">{e.meta.name}</span>
                      <span className="text-xs font-mono" style={{ color: e.meta.color }}>{t('dashboard.link', { count: e.count })}</span>
                      {cfg && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {t(`severity.${e.maxSev}`)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">{t('dashboard.distributionByType')}</p>
              <div className="space-y-3">
                {Object.entries(byType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const pct = Math.round((count / total) * 100);
                    const icon = TYPE_ICONS[type] ?? '⚠';
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{icon} {t(`incType.${type}`, type)}</span>
                          <span className="text-xs font-mono text-slate-500">{count}</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: '#3F51B5',
                              opacity: 0.7,
                              transition: 'width 0.7s ease',
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* ── Modifications depuis l'import ── */}
          {modifiedEntities.length > 0 && (
            <>
              <SectionTitle>{t('dashboard.modificationsSinceImport')}</SectionTitle>
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="space-y-1 mb-3">
                  {modifiedEntities.map(e => {
                    const srcColor = SOURCE_COLORS[e.source] ?? '#64748b';
                    const srcLabel = SOURCE_LABELS[e.source] ?? e.source;
                    return (
                      <div
                        key={e.id}
                        className="flex items-center gap-3 px-3 py-2 rounded-lg group transition-colors"
                        style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}
                      >
                        <span className="text-sm flex-shrink-0">{ENTITY_ICONS[e.entityType]}</span>
                        <span className="text-sm text-slate-300 flex-1 truncate">{e.name}</span>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                          style={{ color: srcColor, backgroundColor: `${srcColor}12`, border: `1px solid ${srcColor}30` }}
                        >
                          {srcLabel}
                        </span>
                        <button
                          onClick={() => setEditorState({ entity: e, entityType: e.entityType })}
                          className="opacity-0 group-hover:opacity-100 text-[11px] w-6 h-6 flex items-center justify-center rounded transition-opacity flex-shrink-0"
                          style={{ backgroundColor: 'rgba(129,140,248,0.12)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.25)' }}
                        >
                          ✎
                        </button>
                      </div>
                    );
                  })}
                </div>
                <button
                  onClick={() => navigate('/review')}
                  className="w-full py-2 rounded-lg text-xs font-bold transition-all duration-150"
                  style={{ backgroundColor: 'rgba(129,140,248,0.08)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}
                >
                  {t('dashboard.viewAllInReview')}
                </button>
              </div>
            </>
          )}

        </div>
      </main>

      {editorState && (
        <EntityEditor
          entity={editorState.entity}
          entityType={editorState.entityType}
          onClose={() => setEditorState(null)}
        />
      )}
    </div>
  );
}

export default memo(NarrativeDashboard);
