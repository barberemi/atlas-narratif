import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDragScroll } from '../../hooks/useDragScroll';
import { timelineDB, getChapters, detectConflicts, getConflictDetails } from '../../data/timeline_database';
import { incoherencesDB, SEVERITY_CONFIG } from '../../data/incoherences_database';
import { hexToRgb } from '../../utils/color';
import { getEntityMeta, ENTITY_ICONS } from '../../utils/entityUtils';

// ── Chip d'entité ─────────────────────────────────────────────────────────────
function EntityChip({ entity, onClick }) {
  const meta = getEntityMeta(entity.id, entity.entityType);
  if (!meta) return null;
  const color = meta.color;
  const rgb   = hexToRgb(color);
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(entity); }}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium transition-all duration-150"
      style={{
        cursor: 'pointer',
        backgroundColor: `rgba(${rgb},0.08)`,
        color: '#94a3b8',
        border: `1px solid rgba(${rgb},0.2)`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = `rgba(${rgb},0.15)`;
        e.currentTarget.style.border = `1px solid rgba(${rgb},0.4)`;
        e.currentTarget.style.color = '#e2e8f0';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = `rgba(${rgb},0.08)`;
        e.currentTarget.style.border = `1px solid rgba(${rgb},0.2)`;
        e.currentTarget.style.color = '#94a3b8';
      }}
      title={`Voir ${meta.name}`}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, opacity: 0.7 }} />
      <span className="leading-none">{ENTITY_ICONS[entity.entityType]}</span>
      <span className="leading-none">{meta.name}</span>
    </button>
  );
}

// ── Carte événement ───────────────────────────────────────────────────────────
function EventCard({ event, isConflict, isHighlighted, isDimmed, onEntityClick }) {
  const [expanded, setExpanded] = useState(false);

  const linkedIncs = useMemo(() =>
    (event.incoherenceIds ?? []).map(id => incoherencesDB.find(i => i.id === id)).filter(Boolean),
    [event]
  );

  const conflictDetails = useMemo(() =>
    isConflict ? getConflictDetails(event.id) : [],
    [event.id, isConflict]
  );

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all duration-300 cursor-pointer select-none"
      style={{
        borderColor: isConflict
          ? 'rgba(239,68,68,0.5)'
          : 'rgba(255,255,255,0.07)',
        backgroundColor: isConflict
          ? 'rgba(239,68,68,0.07)'
          : 'rgba(255,255,255,0.03)',
        opacity: isDimmed ? 0.25 : 1,
        boxShadow: isConflict ? '0 0 12px rgba(239,68,68,0.15)' : 'none',
      }}
      onClick={() => setExpanded(p => !p)}
    >
      {/* Bandeau couleur */}
      <div
        className="h-0.5"
        style={{ backgroundColor: isConflict ? '#EF4444' : 'rgba(63,81,181,0.5)' }}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-slate-200 leading-snug flex-1">{event.title}</p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {isConflict && (
              <span
                className="text-[11px] font-black px-2 py-0.5 rounded-full"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.4)' }}
              >
                ⚠ CONFLIT
              </span>
            )}
            <span className="text-slate-600 text-xs">{expanded ? '▲' : '▼'}</span>
          </div>
        </div>

        {/* Description (collapsible) */}
        {expanded && (
          <p className="text-xs text-slate-400 leading-relaxed font-serif">
            {event.description}
          </p>
        )}

        {/* Entités */}
        <div className="flex flex-wrap gap-1">
          {event.entities.map(entity => (
            <EntityChip
              key={entity.id + entity.entityType}
              entity={entity}
              onClick={onEntityClick}
            />
          ))}
        </div>

        {/* Détails du conflit */}
        {expanded && conflictDetails.length > 0 && (
          <div className="pt-2 border-t border-red-500/20 space-y-1">
            {conflictDetails.map((d, i) => (
              <div
                key={i}
                className="text-xs px-2.5 py-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)' }}
              >
                ⚠ {d.charIds.map(id => getEntityMeta(id, 'character')?.name).filter(Boolean).join(', ')} présent(s) aussi dans "{d.otherEventTitle}"
              </div>
            ))}
          </div>
        )}

        {/* Incohérences liées */}
        {expanded && linkedIncs.length > 0 && (
          <div className="pt-1 border-t border-white/5 space-y-1">
            {linkedIncs.map(inc => {
              const cfg = SEVERITY_CONFIG[inc.severity];
              return (
                <div
                  key={inc.id}
                  className="text-xs px-2.5 py-1 rounded-lg"
                  style={{ backgroundColor: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
                >
                  ⚠ {inc.title}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── TimelineBrowser ───────────────────────────────────────────────────────────
export default function TimelineBrowser() {
  const navigate   = useNavigate();
  const [focusedCharId, setFocusedCharId] = useState(null);
  const dragScroll = useDragScroll();

  const chapters      = useMemo(() => getChapters(), []);
  const conflictIds   = useMemo(() => detectConflicts(), []);

  // Liste des personnages présents dans la timeline
  const characters = useMemo(() => {
    const map = new Map();
    timelineDB.forEach(evt => {
      evt.entities.forEach(e => {
        if (e.entityType !== 'character') return;
        if (map.has(e.id)) return;
        const meta = getEntityMeta(e.id, 'character');
        if (meta) map.set(e.id, { id: e.id, ...meta });
      });
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const handleEntityClick = (entity) => {
    if (entity.entityType === 'character' || entity.entityType === 'object') {
      navigate(`/graph?entity=${entity.id}`);
    } else if (entity.entityType === 'location') {
      const loc = loreDB.locations.find(l => l.id === entity.id);
      navigate(`/lore?tab=locations&search=${encodeURIComponent(loc?.name ?? entity.id)}`);
    }
  };

  const conflictCount = useMemo(() =>
    timelineDB.filter(e => conflictIds.has(e.id)).length,
    [conflictIds]
  );

  return (
    <div className="min-h-full w-full flex flex-col bg-[#0B1621] text-slate-200">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Timeline <span style={{ color: '#3F51B5' }}>Narrative</span>
          </h1>
          <p className="text-sm text-slate-500 font-serif italic">
            {chapters.length} chapitres · {timelineDB.length} événements
            {conflictCount > 0 && (
              <span style={{ color: '#EF4444' }}> · {conflictCount} conflits détectés</span>
            )}
          </p>
        </div>
      </header>

      {/* ── Filtre personnages ── */}
      <div
        className="flex items-center gap-2 px-4 py-2 border-b border-white/5 overflow-x-auto flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.2)' }}
      >
        <span className="text-xs text-slate-600 uppercase tracking-widest flex-shrink-0">Suivre</span>
        <button
          onClick={() => setFocusedCharId(null)}
          className="text-xs px-3 py-1.5 rounded font-semibold flex-shrink-0 transition-all duration-150"
          style={{
            cursor:          'pointer',
            backgroundColor: !focusedCharId ? 'rgba(63,81,181,0.2)' : 'rgba(255,255,255,0.04)',
            color:           !focusedCharId ? '#818cf8' : '#475569',
            border:          `1px solid ${!focusedCharId ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
          }}
          onMouseEnter={e => { if (focusedCharId) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#94a3b8'; } }}
          onMouseLeave={e => { if (focusedCharId) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#475569'; } }}
        >
          Tous
        </button>
        {characters.map(char => {
          const isActive = focusedCharId === char.id;
          const rgb = hexToRgb(char.color);
          return (
            <button
              key={char.id}
              onClick={() => setFocusedCharId(prev => prev === char.id ? null : char.id)}
              className="flex items-center gap-1 text-xs px-3 py-1.5 rounded font-semibold flex-shrink-0 transition-all duration-150"
              style={{
                cursor:          'pointer',
                backgroundColor: isActive ? `rgba(${rgb},0.18)` : 'rgba(255,255,255,0.03)',
                color:           isActive ? char.color : '#475569',
                border:          `1px solid ${isActive ? `rgba(${rgb},0.4)` : 'rgba(255,255,255,0.06)'}`,
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = `rgba(${rgb},0.1)`; e.currentTarget.style.color = char.color; e.currentTarget.style.border = `1px solid rgba(${rgb},0.25)`; } }}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#475569'; e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; } }}
            >
              👤 {char.name.split(' ')[0]}
            </button>
          );
        })}
      </div>

      {/* ── Timeline horizontale ── */}
      <div
        ref={dragScroll.ref}
        className="overflow-x-auto no-scrollbar"
        style={{ cursor: 'grab' }}
        onMouseDown={dragScroll.onMouseDown}
        onMouseMove={dragScroll.onMouseMove}
        onMouseUp={dragScroll.onMouseUp}
        onMouseLeave={dragScroll.onMouseLeave}
      >
        <div className="flex" style={{ minWidth: `${chapters.length * 290}px` }}>
          {chapters.map(({ number, title }) => {
            const events = timelineDB.filter(e => e.chapter === number);
            return (
              <div
                key={number}
                className="flex flex-col flex-shrink-0 border-r border-white/7"
                style={{ width: 290 }}
              >
                {/* En-tête chapitre */}
                <div
                  className="flex-shrink-0 px-4 py-3 border-b border-white/10"
                  style={{ background: 'rgba(63,81,181,0.06)' }}
                >
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                    Chapitre {number}
                  </p>
                  <p className="text-sm font-bold text-slate-300 leading-snug mt-1">
                    {title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {events.length} événement{events.length > 1 ? 's' : ''}
                    {events.some(e => conflictIds.has(e.id)) && (
                      <span style={{ color: '#EF4444' }}> · ⚠ conflit</span>
                    )}
                  </p>
                </div>

                {/* Événements */}
                <div className="p-3 space-y-2.5">
                  {events.map(evt => {
                    const isConflict    = conflictIds.has(evt.id);
                    const evtCharIds    = new Set(evt.entities.filter(e => e.entityType === 'character').map(e => e.id));
                    const isHighlighted = !focusedCharId || evtCharIds.has(focusedCharId);
                    const isDimmed      = !!focusedCharId && !evtCharIds.has(focusedCharId);
                    return (
                      <EventCard
                        key={evt.id}
                        event={evt}
                        isConflict={isConflict}
                        isHighlighted={isHighlighted}
                        isDimmed={isDimmed}
                        onEntityClick={handleEntityClick}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
