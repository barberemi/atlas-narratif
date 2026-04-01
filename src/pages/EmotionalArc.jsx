import { useState, useEffect, useMemo } from 'react';
import { useDb } from '../db/DbContext';
import { useProject } from '../db/ProjectContext';
import { useArcStore } from '../stores/useArcStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useStcStore } from '../stores/useStcStore';
import { useVolumeFilter } from '../hooks/useVolumeFilter';
import { useVolumeStore }  from '../stores/useVolumeStore';
import { BEATS } from '../data/beats_config';
import { CHART_H, PAD, yToSvg, xToSvg, smoothPath, arcColor } from '../utils/arcUtils';
import { extractChapters } from '../utils/reviewUtils';
import CharacterArcView from '../components/arc/CharacterArcView';

// ── Constantes ────────────────────────────────────────────────────────────────

const INTENSITY_LABELS = {
  1: 'Calme plat',      2: 'Paisible',        3: 'Légère tension',
  4: 'Tension',         5: 'Montée',           6: 'Dramatique',
  7: 'Intense',         8: 'Très intense',     9: 'Climax',
  10: 'Paroxysme',
};

// ── Composant principal ───────────────────────────────────────────────────────

const TABS = [
  { id: 'global',      label: 'Arc global' },
  { id: 'personnages', label: 'Arc personnages' },
];

export default function EmotionalArc() {
  const [tab, setTab] = useState('global');
  const db        = useDb();
  const { projectId } = useProject();

  const filterByVolume  = useVolumeFilter();
  const volumes         = useVolumeStore(s => s.volumes)      ?? [];
  const activeVolumeId  = useVolumeStore(s => s.activeVolumeId);

  const pointsRaw    = useArcStore(s => s.points);
  const loadArc      = useArcStore(s => s.load);
  const setIntensity = useArcStore(s => s.setIntensity);

  const eventsRaw      = useTimelineStore(s => s.events);
  const loadTimeline   = useTimelineStore(s => s.load);
  const stcChaptersRaw = useStcStore(s => s.chapters);
  const loadStc        = useStcStore(s => s.load);

  const points      = filterByVolume(pointsRaw    ?? []);
  const events      = filterByVolume(eventsRaw    ?? []);
  const stcChapters = filterByVolume(stcChaptersRaw ?? []);

  useEffect(() => {
    if (!db || !projectId) return;
    loadArc(db, projectId);
    if (!eventsRaw)       loadTimeline(db, projectId);
    if (!stcChaptersRaw)  loadStc(db, projectId);
  }, [db, projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chapitres depuis la timeline ──────────────────────────────────────────
  const chapters = useMemo(() => extractChapters(events), [events]);

  // ── Offsets de volumes pour l'arc personnages ─────────────────────────────
  // chapter_num global = chapter_num local + offset_du_volume
  const volumeOffsets = useMemo(() => {
    if (!volumes.length) return new Map();
    const sorted = [...volumes].sort((a, b) => a.number - b.number);
    const maxByVolume = new Map();
    (eventsRaw ?? []).forEach(e => {
      if (!e.volumeId) return;
      maxByVolume.set(e.volumeId, Math.max(maxByVolume.get(e.volumeId) ?? 0, e.chapter));
    });
    const offsets = new Map();
    let cum = 0;
    for (const v of sorted) {
      offsets.set(v.id, cum);
      cum += maxByVolume.get(v.id) ?? 0;
    }
    return offsets;
  }, [volumes, eventsRaw]);

  // Offset du tome actif (0 = série complète ou mono-tome)
  const currentOffset = activeVolumeId ? (volumeOffsets.get(activeVolumeId) ?? 0) : 0;

  // En vue série : chapitres avec numérotation globale (T2 ch.1 → ch.N+1)
  const charArcChapters = useMemo(() => {
    if (activeVolumeId || volumes.length < 2) return chapters;
    const sorted = [...volumes].sort((a, b) => a.number - b.number);
    const result = [];
    for (const v of sorted) {
      const offset   = volumeOffsets.get(v.id) ?? 0;
      const vChapters = extractChapters((eventsRaw ?? []).filter(e => e.volumeId === v.id));
      for (const ch of vChapters) {
        result.push({ ...ch, number: ch.number + offset, volumeId: v.id, localNumber: ch.number });
      }
    }
    return result;
  }, [activeVolumeId, volumes, volumeOffsets, eventsRaw, chapters]);

  // Séparateurs de tomes pour le graphe (positions globales du début de chaque tome)
  const volumeSeparators = useMemo(() => {
    if (activeVolumeId || volumes.length < 2) return [];
    const sorted = [...volumes].sort((a, b) => a.number - b.number);
    return sorted.slice(1).map(v => ({
      chapterNum: volumeOffsets.get(v.id) ?? 0,
      label:      `T${v.number}`,
    })).filter(s => s.chapterNum > 0);
  }, [activeVolumeId, volumes, volumeOffsets]);

  // ── Index des points arc ──────────────────────────────────────────────────
  const pointsMap = useMemo(() => {
    const m = new Map();
    for (const p of (points ?? [])) m.set(p.chapterNumber, p);
    return m;
  }, [points]);

  // ── Dimensions SVG réactives ──────────────────────────────────────────────
  const [svgW, setSvgW] = useState(0);
  const [containerEl, setContainerEl] = useState(null);

  useEffect(() => {
    if (!containerEl) return;
    const obs = new ResizeObserver(entries => setSvgW(entries[0].contentRect.width));
    obs.observe(containerEl);
    return () => obs.disconnect();
  }, [containerEl]);

  const chartW = svgW - PAD.left - PAD.right;
  const svgH   = CHART_H + PAD.top + PAD.bottom;

  // ── Chapitres affichés dans le SVG (jusqu'au dernier défini) ──────────────
  const svgChapters = useMemo(() => {
    const lastDefined = [...chapters].reverse().findIndex(ch => pointsMap.has(ch.number));
    if (lastDefined === -1) return chapters;
    const lastIdx = chapters.length - 1 - lastDefined;
    return chapters.slice(0, lastIdx + 1);
  }, [chapters, pointsMap]);

  // ── Beats STC placés ──────────────────────────────────────────────────────
  const beatMarkers = useMemo(() => {
    if (!stcChapters.length || !svgChapters.length) return [];
    const total   = svgChapters.length;
    const beatMap = new Map();
    for (const ch of stcChapters) {
      for (const beatId of ch.beats) beatMap.set(beatId, ch.number);
    }
    return BEATS
      .filter(b => beatMap.has(b.id))
      .map(b => {
        const chNum = beatMap.get(b.id);
        const idx   = svgChapters.findIndex(c => c.number === chNum);
        const xPct  = idx >= 0 ? idx / Math.max(total - 1, 1) : null;
        return { beat: b, chapterNumber: chNum, xPct };
      })
      .filter(m => m.xPct !== null);
  }, [stcChapters, svgChapters]);

  const svgPoints = useMemo(() => svgChapters.map((ch, i) => {
    const pt = pointsMap.get(ch.number);
    return {
      ...ch,
      intensity: pt?.intensity ?? null,
      x: xToSvg(i, svgChapters.length, chartW),
      y: pt?.intensity != null ? yToSvg(pt.intensity) : null,
    };
  }), [svgChapters, pointsMap, chartW]);

  // Tous les chapitres pour la grille (avec ou sans data)
  const allPoints = useMemo(() => chapters.map(ch => {
    const pt = pointsMap.get(ch.number);
    const svgPt = svgPoints.find(p => p.number === ch.number);
    return { ...ch, intensity: pt?.intensity ?? null, x: svgPt?.x ?? null, y: svgPt?.y ?? null };
  }), [chapters, pointsMap, svgPoints]);

  const definedPts = useMemo(
    () => svgPoints.filter(p => p.y !== null).map(p => ({ x: p.x, y: p.y })),
    [svgPoints],
  );

  const linePath = useMemo(() => smoothPath(definedPts), [definedPts]);

  const areaPath = useMemo(() => {
    if (!definedPts.length) return '';
    const bottom = PAD.top + CHART_H;
    return `${linePath} L ${definedPts[definedPts.length - 1].x},${bottom} L ${definedPts[0].x},${bottom} Z`;
  }, [definedPts, linePath]);

  const avgIntensity = useMemo(() => {
    const defined = allPoints.filter(p => p.intensity != null);
    if (!defined.length) return null;
    return defined.reduce((s, p) => s + p.intensity, 0) / defined.length;
  }, [allPoints]);

  const color = arcColor(avgIntensity);

  // ── Chapitre actif (slider) ────────────────────────────────────────────────
  const [active, setActive] = useState(null);
  const activePoint = active != null ? allPoints.find(p => p.number === active) : null;

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-hidden">

      {/* Header */}
      <header className="flex items-center px-6 py-3 border-b border-white/10 flex-shrink-0 gap-6">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Arc <span style={{ color }}>Émotionnel</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {tab === 'global'
              ? `Courbe de tension narrative · ${chapters.length} chapitre${chapters.length !== 1 ? 's' : ''}${avgIntensity != null ? ` · intensité moy. ${avgIntensity.toFixed(1)}/10` : ''}`
              : 'Évolution individuelle des personnages par axe'}
          </p>
        </div>
        <div className="flex items-center gap-1 p-1 rounded-xl flex-shrink-0"
          style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={{
                backgroundColor: tab === t.id ? 'rgba(99,102,241,0.2)' : 'transparent',
                border:          tab === t.id ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                color:           tab === t.id ? '#818cf8' : '#64748b',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </header>

      {/* Contenu */}
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-6">

        {/* Tab : Arc personnages */}
        {tab === 'personnages' && (
          <CharacterArcView
            chapters={charArcChapters}
            chapterOffset={currentOffset}
            volumes={volumes}
            activeVolumeId={activeVolumeId}
            volumeSeparators={volumeSeparators}
          />
        )}

        {/* Tab : Arc global */}
        {tab === 'global' && (chapters.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-slate-600 font-serif italic">Aucun chapitre dans la timeline.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">

            {/* ── Graphe SVG ── */}
            <div
              ref={setContainerEl}
              className="relative rounded-2xl overflow-hidden"
              style={{ height: svgH, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              {svgW > 0 && <svg width={svgW} height={svgH}>
                <defs>
                  <linearGradient id="arc-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {/* Grille Y */}
                {[1, 3, 5, 7, 10].map(v => {
                  const y = yToSvg(v);
                  return (
                    <g key={v}>
                      <line x1={PAD.left} y1={y} x2={svgW - PAD.right} y2={y}
                        stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                      <text x={PAD.left - 6} y={y + 4} textAnchor="end" fontSize="10" fill="#334155">{v}</text>
                    </g>
                  );
                })}

                {/* Labels X (chapitres) */}
                {(() => {
                  const step = Math.max(1, Math.ceil(chapters.length / 16));
                  return svgPoints
                    .filter((_, i) => i % step === 0 || i === svgPoints.length - 1)
                    .map(pt => (
                      <text key={pt.number} x={pt.x} y={svgH - PAD.bottom + 16}
                        textAnchor="middle" fontSize="10" fill="#334155">
                        {pt.number}
                      </text>
                    ));
                })()}

                {/* Marqueurs beats STC */}
                {beatMarkers.map(({ beat, xPct }) => {
                  const x = PAD.left + xPct * chartW;
                  return (
                    <g key={beat.id}>
                      <line x1={x} y1={PAD.top} x2={x} y2={PAD.top + CHART_H}
                        stroke={beat.color} strokeWidth="1" strokeDasharray="3,3" strokeOpacity="0.45" />
                    </g>
                  );
                })}

                {/* Remplissage dégradé */}
                {areaPath && <path d={areaPath} fill="url(#arc-fill)" />}

                {/* Courbe */}
                {linePath && (
                  <path d={linePath} fill="none" stroke={color} strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                )}

                {/* Points définis */}
                {svgPoints.filter(p => p.y !== null).map(pt => (
                  <circle key={pt.number}
                    cx={pt.x} cy={pt.y}
                    r={active === pt.number ? 7 : 5}
                    fill={active === pt.number ? color : '#0B1621'}
                    stroke={color} strokeWidth="2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActive(active === pt.number ? null : pt.number)}
                  />
                ))}

                {/* Points non définis (petits creux en bas) */}
                {svgPoints.filter(p => p.y === null).map(pt => (
                  <circle key={pt.number}
                    cx={pt.x} cy={PAD.top + CHART_H - 6}
                    r={3}
                    fill="transparent"
                    stroke="rgba(255,255,255,0.12)" strokeWidth="1.5"
                    strokeDasharray="2,2"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setActive(active === pt.number ? null : pt.number)}
                  />
                ))}
              </svg>}
            </div>

            {/* ── Slider chapitre actif ── */}
            {activePoint && (
              <div
                className="rounded-xl p-4 flex flex-col gap-4"
                style={{ backgroundColor: `${color}0f`, border: `1px solid ${color}35` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black text-slate-200">
                      Chapitre {activePoint.number} — {activePoint.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5 font-serif italic">
                      {activePoint.intensity != null
                        ? INTENSITY_LABELS[activePoint.intensity]
                        : 'Intensité non définie — déplace le curseur'}
                    </p>
                  </div>
                  <div className="text-3xl font-black flex-shrink-0" style={{ color, minWidth: 40, textAlign: 'right' }}>
                    {activePoint.intensity ?? '—'}
                  </div>
                </div>

                <input
                  type="range"
                  min={1} max={10} step={1}
                  value={activePoint.intensity ?? 5}
                  onChange={e => setIntensity(activePoint.number, Number(e.target.value))}
                  className="w-full"
                  style={{ cursor: 'pointer', accentColor: color }}
                />

                <div className="flex justify-between text-[10px] text-slate-700">
                  {[1,2,3,4,5,6,7,8,9,10].map(v => (
                    <span key={v} style={{ color: activePoint.intensity === v ? color : undefined }}>{v}</span>
                  ))}
                </div>
              </div>
            )}

            {/* ── Grille chapitres ── */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {allPoints.map(pt => (
                <button
                  key={pt.number}
                  onClick={() => setActive(active === pt.number ? null : pt.number)}
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl transition-all duration-150"
                  style={{
                    backgroundColor: active === pt.number
                      ? `${color}20`
                      : pt.intensity != null ? 'rgba(255,255,255,0.03)' : 'transparent',
                    border: active === pt.number
                      ? `1px solid ${color}50`
                      : '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center font-black text-base"
                    style={{
                      backgroundColor: pt.intensity != null
                        ? `${color}${Math.round(pt.intensity / 10 * 40 + 8).toString(16).padStart(2, '0')}`
                        : 'rgba(255,255,255,0.03)',
                      color: pt.intensity != null ? color : '#334155',
                    }}
                  >
                    {pt.intensity ?? '·'}
                  </div>
                  <span className="text-[10px] text-slate-600">Ch.{pt.number}</span>
                </button>
              ))}
            </div>

            {/* ── Légende couleur de courbe ── */}
            <div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <p className="text-[10px] text-slate-600 uppercase tracking-widest">Couleur de la courbe</p>
              <div className="flex items-center gap-3">
                {[
                  { color: '#60a5fa', label: '< 3', desc: 'Calme' },
                  { color: '#facc15', label: '3–5', desc: 'Modéré' },
                  { color: '#fb923c', label: '5–7', desc: 'Dramatique' },
                  { color: '#f87171', label: '≥ 7', desc: 'Intense' },
                ].map(({ color: c, label, desc }) => (
                  <div key={label} className="flex items-center gap-1.5 flex-1">
                    <div className="w-8 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold" style={{ color: c }}>{desc}</span>
                      <span className="text-[9px] text-slate-700">moy. {label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-700 italic">
                La couleur reflète l'intensité moyenne de tous les chapitres définis.
              </p>
            </div>

            {/* ── Légende beats ── */}
            {beatMarkers.length > 0 && (
              <div
                className="rounded-xl p-4"
                style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-3">Beats STC placés</p>
                <div className="flex flex-wrap gap-2">
                  {beatMarkers.map(({ beat, chapterNumber }) => (
                    <span
                      key={beat.id}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${beat.color}15`, color: beat.color, border: `1px solid ${beat.color}30` }}
                    >
                      {beat.label} <span style={{ opacity: 0.5 }}>ch.{chapterNumber}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}
