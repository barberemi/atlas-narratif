import { useMemo } from 'react';
import { incoherencesDB, SEVERITY_CONFIG, SEVERITY_ORDER } from '../../data/incoherences_database';
import { getEntityMeta, ENTITY_ICONS } from '../../utils/entityUtils';

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
function CircularGauge({ score }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : score >= 25 ? '#F97316' : '#EF4444';
  const label = score >= 80 ? 'Bon' : score >= 50 ? 'Moyen' : score >= 25 ? 'Faible' : 'Critique';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Track */}
        <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        {/* Arc */}
        <circle
          cx="90" cy="90" r={R} fill="none"
          stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C}`}
          strokeDashoffset={C / 4}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
        {/* Glow bg */}
        <circle cx="90" cy="90" r="54" fill={`${color}0d`} />
        {/* Score */}
        <text x="90" y="84" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="28" fontWeight="900">
          {score}
        </text>
        <text x="90" y="106" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
          {label}
        </text>
      </svg>
      <p className="text-xs text-slate-500 font-serif italic">Score de santé narrative</p>
    </div>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────
export default function NarrativeDashboard({ onEntityClick, onOpenIncoherences, resolvedIds }) {
  // ── Calculs ────────────────────────────────────────────────────────────────
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };

  const { totalWeight, resolvedWeight, bySeverity, resolvedBySeverity, byType, topEntities } = useMemo(() => {
    let totalWeight   = 0;
    let resolvedWeight = 0;
    const bySev         = { critical: 0, high: 0, medium: 0, low: 0 };
    const resolvedBySev = { critical: 0, high: 0, medium: 0, low: 0 };
    const byType = {};
    const entityMap = new Map(); // entityId → { count, maxSev, meta }

    incoherencesDB.forEach(inc => {
      const w = weights[inc.severity];
      totalWeight += w;
      if (resolvedIds.has(inc.id)) { resolvedWeight += w; resolvedBySev[inc.severity]++; }
      bySev[inc.severity]++;
      byType[inc.type] = (byType[inc.type] || 0) + 1;

      inc.links.forEach(link => {
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
  }, [resolvedIds]);

  const score = totalWeight === 0 ? 100 : Math.round(((totalWeight - (totalWeight - resolvedWeight)) / totalWeight) * 100);
  // Score basé sur : penalités restantes / penalités totales
  const penaltyScore = totalWeight === 0 ? 100 : Math.round(100 - ((totalWeight - resolvedWeight) / totalWeight) * 100);

  const resolvedCount = resolvedIds.size;
  const total = incoherencesDB.length;
  const resolvedPct = total === 0 ? 100 : Math.round((resolvedCount / total) * 100);

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Santé <span style={{ color: '#3F51B5' }}>Narrative</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">Tableau de bord de cohérence</p>
        </div>
        <button
          onClick={() => onOpenIncoherences('all')}
          className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-200"
          style={{ backgroundColor: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.25)' }}
        >
          ⚠ Voir toutes
        </button>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* ── Ligne 1 : Score + Progression ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {/* Score circulaire */}
            <div
              className="rounded-2xl p-6 flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <CircularGauge score={penaltyScore} />
            </div>

            {/* Progression de résolution */}
            <div
              className="rounded-2xl p-6 flex flex-col justify-between md:col-span-2"
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
