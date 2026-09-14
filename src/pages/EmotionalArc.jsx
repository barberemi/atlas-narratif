import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useArcStore } from '../stores/useArcStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useStcStore } from '../stores/useStcStore';
import { useStoreLoader } from '../hooks/useStoreLoader';
import { useVolumeFilter } from '../hooks/useVolumeFilter';
import { useVolumeStore }  from '../stores/useVolumeStore';
import { BEATS } from '../data/beats_config';
import { VIZ_SEQUENTIAL, VIZ_STATUS } from '../data/viz_palette';
import { CHART_H, PAD, yToSvg, xToSvg, smoothPath, arcColor } from '../utils/arcUtils';
import { extractChapters } from '../utils/reviewUtils';
import { diagnoseArc } from '../utils/craftDiagnostics';
import CharacterArcView from '../components/arc/CharacterArcView';
import CraftDiagnostics from '../components/ui/CraftDiagnostics';
import Term from '../components/ui/Term';
import { HeaderToggle } from '../components/ui/HeaderButton';

// ── Composant principal ───────────────────────────────────────────────────────

export default function EmotionalArc() {
  const { t } = useTranslation();

  const INTENSITY_LABELS = {
    1: t('arc.intensity1'),   2: t('arc.intensity2'),   3: t('arc.intensity3'),
    4: t('arc.intensity4'),   5: t('arc.intensity5'),   6: t('arc.intensity6'),
    7: t('arc.intensity7'),   8: t('arc.intensity8'),   9: t('arc.intensity9'),
    10: t('arc.intensity10'),
  };

  const TABS = [
    { id: 'global',      label: t('arc.tabGlobal', 'Arc global') },
    { id: 'personnages', label: t('arc.tabCharacters', 'Arc personnages') },
  ];

  const [tab, setTab] = useState('global');

  const filterByVolume  = useVolumeFilter();
  const _volumes        = useVolumeStore(s => s.volumes);
  const volumes         = useMemo(() => _volumes ?? [], [_volumes]);
  const activeVolumeId  = useVolumeStore(s => s.activeVolumeId);

  const pointsRaw    = useArcStore(s => s.points);
  const setIntensity = useArcStore(s => s.setIntensity);

  const eventsRaw      = useTimelineStore(s => s.events);
  const stcChaptersRaw = useStcStore(s => s.chapters);

  const points      = filterByVolume(pointsRaw    ?? []);
  const events      = filterByVolume(eventsRaw    ?? []);
  const stcChapters = filterByVolume(stcChaptersRaw ?? []);

  useStoreLoader([useArcStore, useTimelineStore, useStcStore]);

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

  // ── Diagnostics de craft (constats actionnables sur la courbe) ─────────────
  const arcFindings = useMemo(() => diagnoseArc(allPoints), [allPoints]);

  // ── Chapitre actif (slider) ────────────────────────────────────────────────
  const [active, setActive] = useState(null);
  const activePoint = active != null ? allPoints.find(p => p.number === active) : null;

  // ── Plage mise en avant depuis un constat de craft ─────────────────────────
  // Cliquer un constat surligne sa plage de chapitres sur la courbe, ouvre le
  // chapitre concerné et ramène le graphe dans la vue (l'effet devient visible).
  const [highlight, setHighlight] = useState(null);
  const pickFinding = (f) => {
    setHighlight(prev => (prev?.id === f.id ? null : f));
    setActive(f.from);
    if (containerEl) containerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  const highlightBand = useMemo(() => {
    if (!highlight) return null;
    const xf = svgPoints.find(p => p.number === highlight.from)?.x;
    const xt = svgPoints.find(p => p.number === highlight.to)?.x;
    if (xf == null) return null;
    const a = Math.min(xf, xt ?? xf) - 10;
    const b = Math.max(xf, xt ?? xf) + 10;
    return { x: a, w: b - a, color: highlight.severity === 'ok' ? VIZ_STATUS.ok : VIZ_STATUS.warn };
  }, [highlight, svgPoints]);

  // ── Rendu ─────────────────────────────────────────────────────────────────
  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">

      {/* Header */}
      <header data-tour="arc-chart" className="flex items-center px-6 py-5 border-b border-atlas-line flex-shrink-0 gap-6">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Écrire · arc émotionnel'}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            <Term id="arc">{t('arc.titlePrefix', 'Arc')} <span className="italic" style={{ color: '#5cae8e' }}>{t('arc.titleHighlight', '\u00c9motionnel')}</span></Term>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {tab === 'global'
              ? `${t('arc.tensionCurve', 'Courbe de tension narrative')} \u00b7 ${chapters.length} ${t('label.chapters', 'chapitre(s)')}${avgIntensity != null ? ` \u00b7 ${t('arc.avgIntensity', 'intensit\u00e9 moy.')} ${avgIntensity.toFixed(1)}/10` : ''}`
              : t('arc.characterEvolution', '\u00c9volution individuelle des personnages par axe')}
          </p>
        </div>
        <div className="flex items-center gap-5 flex-shrink-0">
          {TABS.map(tb => (
            <HeaderToggle key={tb.id} active={tab === tb.id} onClick={() => setTab(tb.id)}>
              {tb.label}
            </HeaderToggle>
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
            <p className="text-atlas-mute font-serif italic">{t('empty.noEvents', 'Aucun chapitre dans la timeline.')}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 max-w-5xl mx-auto">

            {/* ── Diagnostics de craft ── */}
            <CraftDiagnostics findings={arcFindings} onPick={pickFinding} dataTour="arc-diagnostics" />

            {/* ── Graphe SVG ── */}
            <div
              data-tour="arc-graph"
              ref={setContainerEl}
              className="relative overflow-hidden"
              style={{ height: svgH, backgroundColor: 'rgba(255,255,255,0.02)' }}
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

                {/* Plage surlignée depuis un constat de craft */}
                {highlightBand && (
                  <g>
                    <rect x={highlightBand.x} y={PAD.top} width={highlightBand.w} height={CHART_H}
                      fill={highlightBand.color} opacity="0.10" />
                    <line x1={highlightBand.x} y1={PAD.top} x2={highlightBand.x} y2={PAD.top + CHART_H}
                      stroke={highlightBand.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                    <line x1={highlightBand.x + highlightBand.w} y1={PAD.top} x2={highlightBand.x + highlightBand.w} y2={PAD.top + CHART_H}
                      stroke={highlightBand.color} strokeWidth="1" strokeDasharray="3,3" opacity="0.6" />
                  </g>
                )}

                {/* Points définis */}
                {svgPoints.filter(p => p.y !== null).map(pt => (
                  <circle key={pt.number}
                    cx={pt.x} cy={pt.y}
                    r={active === pt.number ? 7 : 5}
                    fill={active === pt.number ? color : '#15171b'}
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
                className="rounded-none p-4 flex flex-col gap-4"
                style={{ backgroundColor: `${color}0f`, border: `1px solid ${color}35` }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-base font-semibold text-atlas-text">
                      {t('arc.chapterLabel', 'Chapitre {{number}} : {{title}}', { number: activePoint.number, title: activePoint.title })}
                    </p>
                    <p className="text-xs text-atlas-soft mt-0.5 font-serif italic">
                      {activePoint.intensity != null
                        ? INTENSITY_LABELS[activePoint.intensity]
                        : t('arc.intensityUndefined', 'Intensit\u00e9 non d\u00e9finie \u2014 d\u00e9place le curseur')}
                    </p>
                  </div>
                  <div className="text-3xl font-black flex-shrink-0" style={{ color, minWidth: 40, textAlign: 'right' }}>
                    {activePoint.intensity ?? '·'}
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
                  className="flex flex-col items-center gap-1 px-2 py-2.5 rounded-none transition-all duration-150"
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
                    className="w-9 h-9 rounded-none flex items-center justify-center font-black text-base"
                    style={{
                      backgroundColor: pt.intensity != null
                        ? `${color}${Math.round(pt.intensity / 10 * 40 + 8).toString(16).padStart(2, '0')}`
                        : 'rgba(255,255,255,0.03)',
                      color: pt.intensity != null ? color : '#334155',
                    }}
                  >
                    {pt.intensity ?? '·'}
                  </div>
                  <span className="text-[10px] text-atlas-mute">Ch.{pt.number}</span>
                </button>
              ))}
            </div>

            {/* ── Légende couleur de courbe ── */}
            <div
              className="rounded-none p-4 flex flex-col gap-3"
              style={{ borderTop: '1px solid var(--color-atlas-line)' }}
            >
              <p className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em]">{t('arc.curveColor', 'Couleur de la courbe')}</p>
              <div className="flex items-center gap-3">
                {[
                  { color: VIZ_SEQUENTIAL[0], label: '< 3', desc: t('arc.calm', 'Calme') },
                  { color: VIZ_SEQUENTIAL[1], label: '3\u20135', desc: t('arc.moderate', 'Mod\u00e9r\u00e9') },
                  { color: VIZ_SEQUENTIAL[2], label: '5\u20137', desc: t('arc.dramatic', 'Dramatique') },
                  { color: VIZ_SEQUENTIAL[3], label: '\u2265 7', desc: t('arc.intense', 'Intense') },
                ].map(({ color: c, label, desc }) => (
                  <div key={label} className="flex items-center gap-1.5 flex-1">
                    <div className="w-8 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c }} />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold" style={{ color: c }}>{desc}</span>
                      <span className="text-[9px] text-slate-700">{t('arc.avgLabel')} {label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-700 italic">
                {t('arc.colorExplanation', 'La couleur refl\u00e8te l\'intensit\u00e9 moyenne de tous les chapitres d\u00e9finis.')}
              </p>
            </div>

            {/* ── Légende beats ── */}
            {beatMarkers.length > 0 && (
              <div
                className="rounded-none p-4"
                style={{ borderTop: '1px solid var(--color-atlas-line)' }}
              >
                <p className="font-grotesk text-[10px] font-bold text-atlas-mute uppercase tracking-[0.2em] mb-3">{t('arc.beatsPlaced', 'Beats STC plac\u00e9s')}</p>
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
