import { useState, useMemo, useEffect, useRef } from 'react';
import { SEVERITY_CONFIG, SEVERITY_ORDER } from '../../data/severity_config';
import { useIncStore }      from '../../stores/useIncStore';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { usePlantStore }    from '../../stores/usePlantStore';
import { useThreadStore }   from '../../stores/useThreadStore';
import { useVolumeStore }   from '../../stores/useVolumeStore';
import { DETECTOR_CATALOG } from '../../db/detectIncoherences';
import EntityEditor      from '../lore/EntityEditor';
import IncoherenceCard   from './IncoherenceCard';
import DetectorCatalog   from './DetectorCatalog';

const SEVERITY_OPTIONS = [
  { key: 'all',      label: 'Toutes' },
  { key: 'critical', label: 'Critique' },
  { key: 'high',     label: 'Élevée' },
  { key: 'medium',   label: 'Moyenne' },
  { key: 'low',      label: 'Faible' },
];

const TYPE_OPTIONS = [
  { key: 'all', label: 'Tous les types' },
  ...DETECTOR_CATALOG.map(d => ({ key: d.type, label: `${d.icon} ${d.type}` })),
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
  const groups        = useLoreStore(s => s.groups)        ?? [];
  const events        = useTimelineStore(s => s.events)    ?? [];
  const plants        = usePlantStore(s => s.plants)       ?? [];
  const threads       = useThreadStore(s => s.threads)     ?? [];
  const volumes       = useVolumeStore(s => s.volumes)     ?? [];

  const [severityFilter, setSeverityFilter] = useState(initialFilter);
  const [typeFilter,     setTypeFilter]     = useState('all');
  const [entityFilter,   setEntityFilter]   = useState(null); // { entityId, entityType, label }
  const [editorState,    setEditorState]    = useState(null);
  const [showCatalog,    setShowCatalog]    = useState(false);
  const [typeDropOpen,   setTypeDropOpen]   = useState(false);
  const typeDropRef = useRef(null);

  useEffect(() => { setSeverityFilter(initialFilter); }, [initialFilter]);

  useEffect(() => {
    if (!typeDropOpen) return;
    const handler = (e) => {
      if (typeDropRef.current && !typeDropRef.current.contains(e.target)) setTypeDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [typeDropOpen]);

  // ── Scan automatique ────────────────────────────────────────────────────────
  // Se déclenche 1.5s après un changement de données (après le mount initial).
  const mountedRef  = useRef(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (scanning) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      rescan({ characters, locations, objects, events, plants, threads, groups, volumes });
    }, 1500);
    return () => clearTimeout(debounceRef.current);
  }, [characters, locations, objects, events, plants, threads, groups, volumes]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleFix = (link) => {
    const storeMap = { character: characters, location: locations, object: objects };
    const entity   = storeMap[link.entityType]?.find(e => e.id === link.entityId);
    if (!entity) return;
    setEditorState({ entity, entityType: link.entityType });
  };

  const handleEntityFilter = (entityId, entityType, label) => {
    setEntityFilter(prev =>
      prev?.entityId === entityId ? null : { entityId, entityType, label }
    );
  };

  const runRescan = () =>
    rescan({ characters, locations, objects, events, plants, threads, groups });

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = incoherences ?? [];
    if (severityFilter !== 'all') list = list.filter(i => i.severity === severityFilter);
    if (typeFilter     !== 'all') list = list.filter(i => i.type === typeFilter);
    if (entityFilter)             list = list.filter(i =>
      i.links?.some(l => l.entityId === entityFilter.entityId)
    );
    return [...list].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
  }, [incoherences, severityFilter, typeFilter, entityFilter]);

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

  // Types présents dans les données actuelles (pour griser les options vides)
  const presentTypes = useMemo(
    () => new Set((incoherences ?? []).map(i => i.type)),
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
            Analyse narrative — scan auto actif
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center gap-0.5">
            <button
              onClick={runRescan}
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
                : '⚡ Relancer'
              }
            </button>
            {lastScanCount !== null && (
              <span className="text-[10px] text-slate-600">
                {lastScanCount} détectée{lastScanCount > 1 ? 's' : ''} au dernier scan
              </span>
            )}
          </div>
          <button
            onClick={() => setShowCatalog(true)}
            className="text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all duration-150"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }}
            title="Voir tous les types d'incohérences détectables"
          >
            ? Guide
          </button>
          <span className="text-xs font-mono text-slate-600">
            {resolvedCount} résolu{resolvedCount !== 1 ? 's' : ''} / {incoherences.length}
          </span>
        </div>
      </header>

      {/* ── Filtres ── */}
      <div className="px-6 pt-4 pb-3 flex flex-col gap-3 flex-shrink-0">

        {/* Sévérité */}
        <nav className="flex gap-1 border-b border-white/10">
          {SEVERITY_OPTIONS.map(opt => {
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

        {/* Type + filtre entité actif */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative" ref={typeDropRef}>
            <button
              onClick={() => setTypeDropOpen(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
              style={{
                minWidth: 200,
                backgroundColor: typeFilter !== 'all' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.06)',
                color:           typeFilter !== 'all' ? '#818cf8' : '#94a3b8',
                border:          typeFilter !== 'all' ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {typeFilter === 'all'
                ? <><span className="text-slate-500">⚠</span> Tous les types</>
                : <>{DETECTOR_CATALOG.find(d => d.type === typeFilter)?.icon} {typeFilter}</>
              }
              <span className="ml-auto text-slate-600 text-[10px]">{typeDropOpen ? '▲' : '▼'}</span>
            </button>

            {typeDropOpen && (
              <div
                className="absolute left-0 top-full mt-1 z-30 rounded-xl overflow-hidden overflow-y-auto"
                style={{ minWidth: 240, maxHeight: 320, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)' }}
              >
                {TYPE_OPTIONS.map(opt => {
                  const isActive   = typeFilter === opt.key;
                  const isDisabled = opt.key !== 'all' && !presentTypes.has(opt.key);
                  return (
                    <div
                      key={opt.key}
                      onClick={() => { if (!isDisabled) { setTypeFilter(opt.key); setTypeDropOpen(false); } }}
                      className="flex items-center gap-2 px-3 py-2 text-xs transition-all duration-100"
                      style={{
                        cursor:          isDisabled ? 'default' : 'pointer',
                        opacity:         isDisabled ? 0.3 : 1,
                        backgroundColor: isActive ? 'rgba(99,102,241,0.15)' : 'transparent',
                        color:           isActive ? '#818cf8' : '#94a3b8',
                      }}
                      onMouseEnter={e => { if (!isDisabled && !isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {opt.key === 'all' ? <span className="text-slate-500">⚠</span> : <span>{DETECTOR_CATALOG.find(d => d.type === opt.key)?.icon}</span>}
                      <span>{opt.key === 'all' ? 'Tous les types' : opt.key}</span>
                      {isActive && <span className="ml-auto text-[10px]">✓</span>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {entityFilter && (
            <button
              onClick={() => setEntityFilter(null)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-all duration-150"
              style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}
              title="Supprimer le filtre entité"
            >
              👤 {entityFilter.label}
              <span className="opacity-60 ml-0.5">✕</span>
            </button>
          )}

          {(typeFilter !== 'all' || entityFilter) && (
            <button
              onClick={() => { setTypeFilter('all'); setEntityFilter(null); }}
              className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors"
            >
              Tout effacer
            </button>
          )}

          <span className="ml-auto text-xs font-mono text-slate-600">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Grille de cartes ── */}
      <main className="flex-1 min-h-0 overflow-y-auto no-scrollbar px-6 py-4 bg-[#0B1621]">
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
                onToggleResolved={toggle}
                onEntityClick={onEntityClick}
                onEntityFilter={handleEntityFilter}
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

      {showCatalog && <DetectorCatalog onClose={() => setShowCatalog(false)} />}
    </div>
  );
}
