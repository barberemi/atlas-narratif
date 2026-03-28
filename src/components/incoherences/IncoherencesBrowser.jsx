import { useState, useMemo, useEffect } from 'react';
import { SEVERITY_CONFIG, SEVERITY_ORDER } from '../../data/severity_config';
import { useIncStore }      from '../../stores/useIncStore';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import EntityEditor      from '../lore/EntityEditor';
import IncoherenceCard   from './IncoherenceCard';

const FILTER_OPTIONS  = [
  { key: 'all',      label: 'Toutes' },
  { key: 'critical', label: 'Critique' },
  { key: 'high',     label: 'Élevée' },
  { key: 'medium',   label: 'Moyenne' },
  { key: 'low',      label: 'Faible' },
];

// ── IncoherencesBrowser principal ────────────────────────────────────────────
export default function IncoherencesBrowser({ onEntityClick, initialFilter = 'all' }) {
  const incoherences  = useIncStore(s => s.data);
  const toggle        = useIncStore(s => s.toggle);
  const rescan        = useIncStore(s => s.rescan);
  const scanning      = useIncStore(s => s.scanning);
  const lastScanCount = useIncStore(s => s.lastScanCount);
  const characters    = useLoreStore(s => s.characters);
  const locations     = useLoreStore(s => s.locations);
  const objects       = useLoreStore(s => s.objects);
  const events        = useTimelineStore(s => s.events) ?? [];
  const [severityFilter, setSeverityFilter] = useState(initialFilter);
  const [editorState,    setEditorState]    = useState(null); // { entity, entityType }

  useEffect(() => { setSeverityFilter(initialFilter); }, [initialFilter]);

  const handleToggle = (incId) => toggle(incId);

  const handleFix = (link) => {
    const storeMap = { character: characters, location: locations, object: objects };
    const entity   = storeMap[link.entityType]?.find(e => e.id === link.entityId);
    if (!entity) return;
    setEditorState({ entity, entityType: link.entityType });
  };

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
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Détecteur d'<span style={{ color: '#EF4444' }}>Incohérences</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            Analyse narrative — La Communauté de l'Anneau
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={() => rescan({ characters, locations, objects, events })}
              disabled={scanning}
              className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all duration-150"
              style={{
                backgroundColor: scanning ? 'rgba(255,255,255,0.03)' : 'rgba(129,140,248,0.12)',
                color:           scanning ? '#334155'                 : '#818cf8',
                border:          `1px solid ${scanning ? 'rgba(255,255,255,0.06)' : 'rgba(129,140,248,0.3)'}`,
                cursor:          scanning ? 'default' : 'pointer',
              }}
            >
              {scanning
                ? <><span className="animate-spin inline-block w-3 h-3 border border-indigo-400/30 border-t-indigo-400 rounded-full" /> Analyse…</>
                : '⚡ Relancer l\'analyse'
              }
            </button>
            {lastScanCount !== null && (
              <span className="text-[10px] text-slate-600">
                {lastScanCount} détectée{lastScanCount > 1 ? 's' : ''} au dernier scan
              </span>
            )}
          </div>
          <span className="text-xs font-mono text-slate-600">
            {resolvedCount} résolu{resolvedCount !== 1 ? 's' : ''} / {incoherences.length}
          </span>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-7xl mx-auto items-start">
            {filtered.map(inc => (
              <IncoherenceCard
                key={inc.id}
                inc={inc}
                resolved={inc.resolved}
                onToggleResolved={handleToggle}
                onEntityClick={onEntityClick}
                onFix={handleFix}
              />
            ))}
          </div>
        )}
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
