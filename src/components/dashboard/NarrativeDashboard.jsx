import { useMemo } from 'react';
import { SEVERITY_CONFIG, SEVERITY_ORDER } from '../../data/severity_config';
import { getEntityMeta, ENTITY_ICONS } from '../../utils/entityUtils';
import { useIncStore } from '../../stores/useIncStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useStcStore } from '../../stores/useStcStore';

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

// ── Jauge circulaire ──────────────────────────────────────────────────────────
function CircularGauge({ score, title, valueLabel }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const color = score === 100 ? '#A78BFA' : score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : score >= 25 ? '#F97316' : '#EF4444';
  const statusLabel = score === 100 ? 'Parfait' : score >= 80 ? 'Bon' : score >= 50 ? 'Moyen' : score >= 25 ? 'Faible' : 'Critique';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="160" height="160" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={R} fill="none"
          stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          strokeDashoffset={C / 4}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
        <circle cx="90" cy="90" r="54" fill={`${color}0d`} />
        <text x="90" y="84" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="28" fontWeight="900">
          {valueLabel ?? score}
        </text>
        <text x="90" y="106" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
          {statusLabel}
        </text>
      </svg>
      <p className="text-xs text-slate-500 font-serif italic text-center">{title}</p>
    </div>
  );
}

const TOTAL_BEATS = 15;

function SectionTitle({ children }) {
  return (
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest pt-2">
      {children}
    </p>
  );
}

// ── Carte stat ─────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, sub }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-3xl font-black text-white leading-none">{value}</span>
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function NarrativeDashboard({ onEntityClick, onOpenIncoherences }) {
  const incoherences = useIncStore(s => s.data);
  const characters   = useLoreStore(s => s.characters);
  const locations    = useLoreStore(s => s.locations);
  const objects      = useLoreStore(s => s.objects);
  const events       = useTimelineStore(s => s.events);
  const stcChapters  = useStcStore(s => s.chapters);

  // ── Calculs ────────────────────────────────────────────────────────────────
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };

  const { totalWeight, resolvedWeight, bySeverity, resolvedBySeverity, byType, topEntities } = useMemo(() => {
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
  }, [incoherences, weights]);

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

  if (!incoherences) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  const penaltyScore = totalWeight === 0 ? 100 : Math.round(100 - ((totalWeight - resolvedWeight) / totalWeight) * 100);

  const resolvedCount = (incoherences ?? []).filter(i => i.resolved).length;
  const total         = (incoherences ?? []).length;
  const resolvedPct   = total === 0 ? 100 : Math.round((resolvedCount / total) * 100);

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-y-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Santé <span style={{ color: '#3F51B5' }}>Narrative</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">Tableau de bord de cohérence</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 bg-[#0B1621]">
        <div className="max-w-6xl mx-auto space-y-6">

          <SectionTitle>Vue d'ensemble</SectionTitle>

          {/* ── Inventaire narratif ── */}
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <StatCard icon="👤" value={inventory.characters} label="Personnages" />
            <StatCard icon="📍" value={inventory.locations}  label="Lieux" />
            <StatCard icon="⚔️" value={inventory.objects}    label="Objets" />
            <StatCard icon="📖" value={inventory.chapters}   label="Chapitres" />
            <StatCard icon="📅" value={inventory.events}     label="Événements" />
            <StatCard
              icon="🐱"
              value={`${inventory.beats}/${TOTAL_BEATS}`}
              label="Beats STC"
              sub={inventory.beats === TOTAL_BEATS ? 'Structure complète' : `${TOTAL_BEATS - inventory.beats} manquant${TOTAL_BEATS - inventory.beats > 1 ? 's' : ''}`}
            />
          </div>

          {/* ── 3 jauges ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                score: penaltyScore,
                title: 'Correction des incohérences',
              },
              {
                score: inventory.characters === 0 ? 100 : Math.round(((inventory.characters - coverage.orphanChars.length) / inventory.characters) * 100),
                title: 'Couverture des personnages',
                valueLabel: `${inventory.characters - coverage.orphanChars.length}/${inventory.characters}`,
              },
              {
                score: Math.round((inventory.beats / TOTAL_BEATS) * 100),
                title: 'Structure Save the Cat',
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

          <SectionTitle>Rythme &amp; Présences</SectionTitle>

          {/* ── Couverture des entités ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Personnages les plus présents */}
            <div
              className="rounded-2xl p-5 md:col-span-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Personnages actifs</p>
              {coverage.topChars.length === 0 ? (
                <p className="text-xs text-slate-600 italic">Aucun événement timeline</p>
              ) : (
                <div className="flex flex-col gap-2.5">
                  {coverage.topChars.map(({ id, name, color, count }) => (
                    <div key={id} className="flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-300 truncate">{name}</span>
                        <span className="text-[10px] font-mono text-slate-500 flex-shrink-0 ml-2">
                          {count} scène{count > 1 ? 's' : ''}
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
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Hors timeline</p>
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
                  <p className="text-xs text-green-500 italic">Tous les personnages sont présents</p>
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
                  <p className="text-xs text-slate-500 uppercase tracking-widest">Lieux non visités</p>
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
                  <p className="text-xs text-green-500 italic">Tous les lieux sont utilisés</p>
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

              {/* Événements par chapitre */}
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Événements par chapitre</p>
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

              {/* Personnages actifs par chapitre */}
              <div
                className="rounded-2xl p-5"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Personnages actifs par chapitre</p>
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

          <SectionTitle>Incohérences</SectionTitle>

          {/* ── Progression ── */}
          <div className="grid grid-cols-1 gap-4">

            {/* Progression de résolution */}
            <div
              className="rounded-2xl p-6 flex flex-col justify-between"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Progression de résolution</p>
                <div className="flex items-end gap-3 mb-4">
                  <span className="text-5xl font-black text-white">{resolvedCount}</span>
                  <span className="text-slate-500 text-lg mb-1">/ {total} incohérences résolues</span>
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
                <p className="text-xs text-slate-600 mt-2 font-mono">{resolvedPct}% complété</p>
              </div>

              {/* Blocs par sévérité */}
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
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">{cfg.label}</p>
                      {/* Barre de résolution */}
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
                        {resolved > 0 ? `${resolved} résolu${resolved > 1 ? 's' : ''}` : 'aucun résolu'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Ligne 2 : Entités les + touchées + Types ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Top entités */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Entités les plus impliquées</p>
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
                      <span className="text-xs font-mono" style={{ color: e.meta.color }}>{e.count} lien{e.count > 1 ? 's' : ''}</span>
                      {cfg && (
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                        >
                          {cfg.label}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Types d'incohérences */}
            <div
              className="rounded-2xl p-5"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-4">Répartition par type</p>
              <div className="space-y-3">
                {Object.entries(byType)
                  .sort((a, b) => b[1] - a[1])
                  .map(([type, count]) => {
                    const pct = Math.round((count / total) * 100);
                    const icon = TYPE_ICONS[type] ?? '⚠';
                    return (
                      <div key={type}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-slate-400">{icon} {type}</span>
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

        </div>
      </main>
    </div>
  );
}
