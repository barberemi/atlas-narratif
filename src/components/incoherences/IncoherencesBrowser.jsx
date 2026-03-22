import { useState, useMemo, useEffect } from 'react';
import { SEVERITY_CONFIG, SEVERITY_ORDER } from '../../data/severity_config';
import { getEntityMeta, ENTITY_COLORS } from '../../utils/entityUtils';
import { useIncStore } from '../../stores/useIncStore';

// ── Helpers ──────────────────────────────────────────────────────────────────
const TYPE_ICONS = {
  'Contradiction Temporelle':  '⏱',
  'Entité Non Référencée':     '🔗',
  'Incohérence de Porteur':    '🎒',
  'Téléportation de Personnage': '🌀',
  'Créateur Non Référencé':    '⚒',
  "Lieu d'Origine Inexistant": '📍',
  'Affiliation Fantôme':       '👻',
  'Objet sans Lieu de Création': '❓',
};

const SEVERITY_LABELS = { critical: 'Critique', high: 'Élevée', medium: 'Moyenne', low: 'Faible' };
const FILTER_OPTIONS  = [
  { key: 'all',      label: 'Toutes' },
  { key: 'critical', label: 'Critique' },
  { key: 'high',     label: 'Élevée' },
  { key: 'medium',   label: 'Moyenne' },
  { key: 'low',      label: 'Faible' },
];

// ── Chip d'entité cliquable ───────────────────────────────────────────────────
function EntityChip({ link, onEntityClick }) {
  const meta = useMemo(() => getEntityMeta(link.entityId, link.entityType), [link]);

  const color = meta?.color ?? ENTITY_COLORS[link.entityType] ?? '#64748B';
  const hex   = color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const rgb = `${r},${g},${b}`;

  const typeIcons = { character: '👤', location: '📍', object: '⚔️' };
  const icon = typeIcons[link.entityType] ?? '·';

  return (
    <button
      onClick={() => meta && onEntityClick(link.entityId, link.entityType)}
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-150 hover:scale-105"
      style={{
        backgroundColor: `rgba(${rgb},0.15)`,
        color:           color,
        border:          `1px solid rgba(${rgb},0.35)`,
        cursor:          meta ? 'pointer' : 'default',
        opacity:         meta ? 1 : 0.5,
      }}
      title={meta ? `Ouvrir la fiche de ${link.label}` : 'Entité non trouvée dans la base'}
    >
      <span>{icon}</span>
      {link.label}
    </button>
  );
}

// ── Carte d'incohérence ───────────────────────────────────────────────────────
function IncoherenceCard({ inc, resolved, onToggleResolved, onEntityClick }) {
  const cfg = SEVERITY_CONFIG[inc.severity];
  const icon = TYPE_ICONS[inc.type] ?? '⚠';

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300 relative"
      style={{
        borderColor:     resolved ? 'rgba(255,255,255,0.05)' : cfg.border,
        backgroundColor: resolved ? 'rgba(255,255,255,0.015)' : cfg.bg,
        opacity:         resolved ? 0.2 : 1,
      }}
    >
      {/* Bandeau sévérité */}
      <div className="h-1" style={{ backgroundColor: resolved ? '#1e293b' : cfg.color }} />

      <div className="p-4 flex flex-col gap-3">

        {/* Header : type + sévérité + checkbox */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Type */}
            <span
              className="text-xs px-2 py-0.5 rounded font-mono font-bold tracking-wide"
              style={{
                backgroundColor: 'rgba(255,255,255,0.05)',
                color:           resolved ? '#475569' : cfg.color,
                border:          `1px solid rgba(255,255,255,0.08)`,
              }}
            >
              {icon} {inc.type}
            </span>
            {/* Sévérité */}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold"
              style={{
                backgroundColor: resolved ? 'rgba(255,255,255,0.04)' : cfg.bg,
                color:           resolved ? '#475569' : cfg.color,
                border:          `1px solid ${resolved ? 'rgba(255,255,255,0.06)' : cfg.border}`,
              }}
            >
              {SEVERITY_LABELS[inc.severity]}
            </span>
          </div>

          {/* Checkbox "Résolu" */}
          <label
            className="flex items-center gap-1.5 cursor-pointer group flex-shrink-0"
            title="Marquer comme résolu"
          >
            <span className="text-xs text-slate-600 group-hover:text-slate-400 transition-colors">
              Résolu
            </span>
            <div
              className="w-4 h-4 rounded border flex items-center justify-center transition-all duration-150"
              style={{
                backgroundColor: resolved ? cfg.color : 'transparent',
                borderColor:     resolved ? cfg.color : 'rgba(255,255,255,0.2)',
              }}
            >
              {resolved && <span className="text-white text-xs leading-none">✓</span>}
            </div>
            <input
              type="checkbox"
              className="sr-only"
              checked={resolved}
              onChange={() => onToggleResolved(inc.id)}
            />
          </label>
        </div>

        {/* Titre */}
        <h3
          className="text-sm font-black leading-snug"
          style={{ color: resolved ? '#475569' : '#e2e8f0' }}
        >
          {inc.title}
        </h3>

        {/* Explication */}
        <p className="text-xs text-slate-400 leading-relaxed font-serif">
          {inc.explanation}
        </p>

        {/* Liens vers entités */}
        {inc.links?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/5">
            {inc.links.map((link) => (
              <EntityChip
                key={link.entityId + link.label}
                link={link}
                onEntityClick={onEntityClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── IncoherencesBrowser principal ────────────────────────────────────────────
export default function IncoherencesBrowser({ onEntityClick, initialFilter = 'all' }) {
  const incoherences = useIncStore(s => s.data);
  const toggle       = useIncStore(s => s.toggle);
  const [severityFilter, setSeverityFilter] = useState(initialFilter);

  useEffect(() => { setSeverityFilter(initialFilter); }, [initialFilter]);

  const handleToggle = (incId) => toggle(incId);

  const filtered = useMemo(() => {
    const list = incoherences ?? [];
    const base = severityFilter === 'all' ? list : list.filter(i => i.severity === severityFilter);
    return [...base].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [incoherences, severityFilter]);

  const counts = useMemo(() => {
    const list = incoherences ?? [];
    const c = { all: list.length, critical: 0, high: 0, medium: 0, low: 0 };
    list.forEach(i => c[i.severity]++);
    return c;
  }, [incoherences]);

  const resolvedCount = useMemo(
    () => (incoherences ?? []).filter(i => i.resolved).length,
    [incoherences],
  );

  if (!incoherences) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-y-hidden">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Détecteur d'<span style={{ color: '#EF4444' }}>Incohérences</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            Analyse narrative — La Communauté de l'Anneau
          </p>
        </div>

        <span className="text-xs font-mono text-slate-600">
          {resolvedCount} résolu{resolvedCount !== 1 ? 's' : ''} / {incoherences.length}
        </span>
      </header>

      {/* ── Filtres par sévérité ── */}
      <div className="px-6 pt-4 pb-0 flex-shrink-0">
        <nav className="flex gap-1 border-b border-white/10">
          {FILTER_OPTIONS.map(opt => {
            const isActive = severityFilter === opt.key;
            const cfg      = opt.key !== 'all' ? SEVERITY_CONFIG[opt.key] : null;
            return (
              <button
                key={opt.key}
                onClick={() => setSeverityFilter(opt.key)}
                className="px-4 py-2.5 text-sm font-bold transition-all duration-200 relative"
                style={{ color: isActive ? (cfg?.color ?? '#fff') : '#475569' }}
              >
                {opt.label}
                <span
                  className="ml-2 text-xs font-mono"
                  style={{ color: isActive ? (cfg?.color ?? '#818cf8') : '#1e293b' }}
                >
                  {counts[opt.key]}
                </span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{ backgroundColor: cfg?.color ?? '#3F51B5' }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── Grille de cartes ── */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-6 bg-[#0B1621]">
        {filtered.length === 0 ? (
          <p className="text-slate-600 font-serif italic text-center mt-20">
            Aucune incohérence dans cette catégorie.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto">
            {filtered.map(inc => (
              <IncoherenceCard
                key={inc.id}
                inc={inc}
                resolved={inc.resolved}
                onToggleResolved={handleToggle}
                onEntityClick={onEntityClick}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
