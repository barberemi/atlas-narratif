import { useState, useEffect, useRef, useMemo } from 'react';
import { buildGraph, buildFullGraph, RELATION_COLORS, RELATION_LABELS } from '../../utils/buildGraph';
import { getEntityIncoherences, getMaxSeverity, SEVERITY_CONFIG } from '../../data/incoherences_database';
import { hexToRgb } from '../../utils/color';
import { getEntityInfo } from '../../utils/entityUtils';
import { useGraphSimulation, W, H, CX, CY } from './useGraphSimulation';
import IncPanel from './IncPanel';

// ── Constantes de rendu ───────────────────────────────────────────────────────
const CENTER_R   = 52;
const NODE_R     = 34;
const FULL_MIN_R = 14;
const FULL_MAX_R = 46;

const TYPE_ICONS  = { character: '👤', location: '📍', object: '⚔️' };
const REL_W = 58;
const REL_H = 20;
const REL_R = 12;
const NODE_COLORS = { location: '#3B82F6', object: '#F59E0B', character: '#64748B' };

function getColor(node) {
  if (node.entityType === 'character') return node.color || NODE_COLORS.character;
  return NODE_COLORS[node.entityType];
}
function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + '…' : (str ?? '');
}

// ── Composant principal ──────────────────────────────────────────────────────
export default function EntityGraph({ entityId, initialMode = 'centered', onNodeClick }) {
  const [mode, setMode]                     = useState(initialMode);
  const [currentId, setCurrentId]           = useState(entityId);
  const [history, setHistory]               = useState([entityId]);
  const [historyIndex, setHistoryIndex]     = useState(0);
  const [focusedId, setFocusedId]           = useState(null);
  const [hovered, setHovered]               = useState(null);
  const [hoveredBadge, setHoveredBadge]     = useState(null);
  const [positions, setPositions]           = useState({});
  const [hiddenRelTypes, setHiddenRelTypes] = useState(new Set(['visited_by', 'visited']));
  const [incPanelId, setIncPanelId]         = useState(null);
  const posRef      = useRef({});
  const internalNav = useRef(false);

  const graph     = useMemo(() => buildGraph(currentId), [currentId]);
  const fullGraph = useMemo(() => buildFullGraph(), []);

  const visibleFullEdges = useMemo(
    () => fullGraph.edges.filter(e => !hiddenRelTypes.has(e.relType)),
    [fullGraph.edges, hiddenRelTypes]
  );

  // Reset depuis l'extérieur (LoreBrowser → graph)
  useEffect(() => {
    if (internalNav.current) { internalNav.current = false; return; }
    setCurrentId(entityId);
    setHistory([entityId]);
    setHistoryIndex(0);
  }, [entityId]);

  useGraphSimulation({ mode, graph, fullGraph, visibleFullEdges, setPositions, posRef });

  const navigateTo = (id) => {
    internalNav.current = true;
    const existingIdx = history.indexOf(id);
    if (existingIdx !== -1) {
      setHistory(history.slice(0, existingIdx + 1));
      setHistoryIndex(existingIdx);
    } else {
      const h = history.slice(0, historyIndex + 1).concat(id);
      setHistory(h);
      setHistoryIndex(h.length - 1);
    }
    setCurrentId(id);
    onNodeClick(id);
  };

  const navigateToIndex = (idx) => {
    internalNav.current = true;
    setHistoryIndex(idx);
    setCurrentId(history[idx]);
    onNodeClick(history[idx]);
  };

  const connectedIds = useMemo(() => {
    if (!focusedId || mode !== 'full') return null;
    const s = new Set([focusedId]);
    visibleFullEdges.forEach(({ fromId, toId }) => {
      if (fromId === focusedId) s.add(toId);
      if (toId   === focusedId) s.add(fromId);
    });
    return s;
  }, [focusedId, visibleFullEdges, mode]);

  const relNodeIds = useMemo(
    () => new Set((graph?.relNodes ?? []).map(r => r.id)),
    [graph]
  );

  if (!graph && mode === 'centered') {
    return <div className="h-full flex items-center justify-center bg-[#0B1621] text-slate-400">Entité introuvable.</div>;
  }

  const { central, satellites, edges, relNodes: graphRelNodes = [] } = graph ?? { central: null, satellites: [], edges: [], relNodes: [] };
  const N             = satellites.length;
  const centralColor  = central ? getColor(central) : '#3F51B5';
  const centralRgb    = hexToRgb(centralColor);
  const usedRelTypes  = [...new Set((mode === 'centered' ? edges : fullGraph.edges).map(e => e.relType))];

  const getFullR    = (id) => FULL_MIN_R + ((fullGraph.degree.get(id) || 0) / fullGraph.maxDegree) * (FULL_MAX_R - FULL_MIN_R);
  const nodeOpacity = (id) => !connectedIds ? 1 : connectedIds.has(id) ? 1 : 0.07;

  const focusedNode = focusedId ? fullGraph.nodes.find(n => n.id === focusedId) : null;

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Atlas <span style={{ color: '#3F51B5' }}>Relations</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {mode === 'centered'
              ? `${central?.name ?? '…'} — ${N} connexion${N !== 1 ? 's' : ''}`
              : `${fullGraph.nodes.length} entités · ${visibleFullEdges.length} / ${fullGraph.edges.length} relations`}
          </p>
        </div>
        {/* Toggle de mode */}
        <div className="flex gap-1.5">
          {mode === 'centered' && (
            <button
              className="text-xs px-3 py-1.5 rounded-lg font-bold"
              style={{
                backgroundColor: 'rgba(63,81,181,0.25)',
                color:           '#818cf8',
                border:          '1px solid rgba(99,102,241,0.4)',
              }}
            >
              Vue centrée
            </button>
          )}
          <button
            onClick={() => { if (mode !== 'full') { setHistory([currentId]); setHistoryIndex(0); setMode('full'); setFocusedId(null); } }}
            className="text-xs px-3 py-1.5 rounded-lg font-bold transition-all duration-200"
            style={{
              backgroundColor: mode === 'full' ? 'rgba(63,81,181,0.25)' : 'rgba(255,255,255,0.04)',
              color:           mode === 'full' ? '#818cf8' : '#475569',
              border:          `1px solid ${mode === 'full' ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            Vue globale
          </button>
        </div>
      </header>

      {/* ── Filtres de types de relation (mode global uniquement) ── */}
      {mode === 'full' && (
        <div className="flex items-center gap-2 px-6 py-2 border-b border-white/5 flex-wrap flex-shrink-0" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <span className="text-xs text-slate-600 uppercase tracking-widest flex-shrink-0">Relations</span>
          {Object.entries(RELATION_LABELS).map(([type, label]) => {
            const color   = RELATION_COLORS[type] || '#64748b';
            const hidden  = hiddenRelTypes.has(type);
            const hex     = color.replace('#', '');
            const r = parseInt(hex.slice(0, 2), 16);
            const g = parseInt(hex.slice(2, 4), 16);
            const b = parseInt(hex.slice(4, 6), 16);
            const count   = fullGraph.edges.filter(e => e.relType === type).length;
            if (count === 0) return null;
            return (
              <button
                key={type}
                onClick={() => {
                  setHiddenRelTypes(prev => {
                    const next = new Set(prev);
                    if (next.has(type)) next.delete(type); else next.add(type);
                    return next;
                  });
                }}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: hidden ? 'rgba(255,255,255,0.03)' : `rgba(${r},${g},${b},0.15)`,
                  color:           hidden ? '#475569' : color,
                  border:          `1px solid ${hidden ? 'rgba(255,255,255,0.06)' : `rgba(${r},${g},${b},0.4)`}`,
                  opacity:         hidden ? 0.5 : 1,
                }}
                title={hidden ? `Afficher "${label}"` : `Masquer "${label}"`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: hidden ? '#475569' : color }}
                />
                {label}
                <span className="font-mono text-[10px] opacity-60">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── Fil d'Ariane (mode centré uniquement) ── */}
      {mode === 'centered' && history.length > 1 && (
        <nav className="flex items-center gap-1 px-6 py-2 border-b border-white/5 overflow-x-auto flex-shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
          {history.map((id, idx) => {
            const info      = getEntityInfo(id);
            const isCurrent = idx === historyIndex;
            const isFuture  = idx > historyIndex;
            return (
              <div key={`${id}-${idx}`} className="flex items-center gap-1 flex-shrink-0">
                {idx > 0 && <span className="text-slate-600 text-xs select-none" style={{ opacity: isFuture ? 0.35 : 1 }}>›</span>}
                <button
                  onClick={() => navigateToIndex(idx)}
                  className="flex items-center gap-1.5 rounded px-2 py-0.5 transition-all duration-150"
                  style={{
                    cursor:          isCurrent ? 'default' : 'pointer',
                    opacity:         isFuture ? 0.4 : 1,
                    backgroundColor: isCurrent ? `rgba(${hexToRgb(info.color)},0.12)` : 'transparent',
                    border:          isCurrent ? `1px solid rgba(${hexToRgb(info.color)},0.3)` : '1px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (isCurrent) return;
                    e.currentTarget.style.backgroundColor = `rgba(${hexToRgb(info.color)},0.08)`;
                    e.currentTarget.style.border = `1px solid rgba(${hexToRgb(info.color)},0.2)`;
                    e.currentTarget.style.opacity = '1';
                  }}
                  onMouseLeave={e => {
                    if (isCurrent) return;
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.border = '1px solid transparent';
                    e.currentTarget.style.opacity = isFuture ? '0.4' : '1';
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: info.color, boxShadow: isCurrent ? `0 0 6px ${info.color}` : 'none', opacity: isCurrent ? 1 : 0.5 }} />
                  <span className="text-[10px] leading-none">{info.icon}</span>
                  <span className="text-xs leading-none" style={{ color: isCurrent ? '#e2e8f0' : '#475569', fontWeight: isCurrent ? '700' : '400' }}>
                    {truncate(info.name, 18)}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>
      )}

      {/* ── Graphe ── */}
      <div className="flex-1 relative overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full" style={{ display: 'block' }}>
          <defs>
            <filter id="glow-c" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="10" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="glow-n" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {Object.entries(RELATION_COLORS).map(([type, color]) => (
              <marker key={type} id={`arrow-${type}`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" markerUnits="userSpaceOnUse" orient="auto">
                <path d="M0,1 L0,9 L9,5 z" fill={color} opacity="0.85" />
              </marker>
            ))}
            <radialGradient id="bg-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor={centralColor} stopOpacity="0.04" />
              <stop offset="100%" stopColor="#0B1621"       stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={350} fill="url(#bg-grad)" />

          {/* ════════════ MODE CENTRÉ ════════════ */}
          {mode === 'centered' && graph && (
            <>
              {edges.map((edge, i) => {
                const from  = positions[edge.fromId] ?? { x: CX, y: CY };
                const to    = positions[edge.toId]   ?? { x: CX, y: CY };
                const color = RELATION_COLORS[edge.relType] || '#64748b';
                const dx = to.x - from.x, dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const ux = dx / dist, uy = dy / dist;
                const fC   = edge.fromId === central.id;
                const tC   = edge.toId   === central.id;
                const fRel = relNodeIds.has(edge.fromId);
                const tRel = relNodeIds.has(edge.toId);
                const r1   = fC ? CENTER_R + 4  : fRel ? REL_R : NODE_R + 4;
                const r2   = tC ? CENTER_R + 14 : tRel ? REL_R : NODE_R + 14;
                const x1 = from.x + ux * r1;
                const y1 = from.y + uy * r1;
                const x2 = to.x   - ux * r2;
                const y2 = to.y   - uy * r2;
                const showLabel = !fRel && !tRel;
                const label = showLabel ? (RELATION_LABELS[edge.relType] || '') : '';
                const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
                const lw = label.length * 6 + 10;
                return (
                  <g key={i}>
                    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color}
                      strokeWidth={fRel || tRel ? 1 : 1.5}
                      strokeOpacity={fRel || tRel ? 0.35 : 0.5}
                      strokeDasharray="5 4"
                      markerEnd={`url(#arrow-${edge.relType})`}
                    />
                    {showLabel && (
                      <>
                        <rect x={mx - lw / 2} y={my - 8} width={lw} height={14} rx="3" fill="#0B1621" fillOpacity="0.85" />
                        <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="9" opacity="0.9" style={{ pointerEvents: 'none', fontWeight: 600 }}>{label}</text>
                      </>
                    )}
                  </g>
                );
              })}

              {satellites.map((node) => {
                const pos    = positions[node.id];
                if (!pos) return null;
                const color  = getColor(node), rgb = hexToRgb(color);
                const isHov  = hovered === node.id;
                const nodeIncs = getEntityIncoherences(node.id);
                const incSev   = getMaxSeverity(nodeIncs);
                const incColor = incSev ? SEVERITY_CONFIG[incSev].color : null;
                return (
                  <g key={node.id} onMouseEnter={() => setHovered(node.id)} onMouseLeave={() => setHovered(null)}>
                    {incColor && (
                      <circle cx={pos.x} cy={pos.y} r={NODE_R + 7}
                        fill="none" stroke={incColor} strokeWidth="1.5"
                        strokeDasharray="4 3" strokeOpacity="0.7"
                      />
                    )}
                    {isHov && <circle cx={pos.x} cy={pos.y} r={NODE_R + 10} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.35" />}
                    <g onClick={() => navigateTo(node.id)} style={{ cursor: 'pointer' }} filter={isHov ? 'url(#glow-n)' : undefined}>
                      <circle cx={pos.x} cy={pos.y} r={NODE_R} fill={`rgba(${rgb},${isHov ? 0.22 : 0.12})`} stroke={color} strokeWidth={isHov ? 2 : 1.5} />
                      <text x={pos.x} y={pos.y - 3} textAnchor="middle" dominantBaseline="middle" fontSize="17" style={{ pointerEvents: 'none' }}>{TYPE_ICONS[node.entityType]}</text>
                      <text x={pos.x} y={pos.y + NODE_R + 14} textAnchor="middle" fill={isHov ? '#fff' : '#94a3b8'} fontSize="10" fontWeight={isHov ? 'bold' : 'normal'} style={{ pointerEvents: 'none' }}>{truncate(node.name, 15)}</text>
                    </g>
                    {incColor && (() => {
                      const bx = pos.x + NODE_R - 2, by = pos.y - NODE_R + 2;
                      const isHovBadge = hoveredBadge === node.id;
                      return (
                        <g
                          onClick={(e) => { e.stopPropagation(); setIncPanelId(prev => prev === node.id ? null : node.id); }}
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredBadge(node.id); setHovered(null); }}
                          onMouseLeave={(e) => { e.stopPropagation(); setHoveredBadge(null); }}
                          style={{ cursor: 'pointer' }}
                        >
                          {isHovBadge && <circle cx={bx} cy={by} r="13" fill="none" stroke={incColor} strokeWidth="1.5" strokeOpacity="0.5" />}
                          <circle cx={bx} cy={by} r={isHovBadge ? 11 : 9} fill={incColor} style={{ transition: 'r 0.1s' }} />
                          <text x={bx} y={by} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={isHovBadge ? 9 : 8} fontWeight="bold" style={{ pointerEvents: 'none' }}>{nodeIncs.length}</text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })}

              {/* ── Nœuds relation (carrés intermédiaires) ── */}
              {graphRelNodes.map(relNode => {
                const pos = positions[relNode.id];
                if (!pos) return null;
                const hex = relNode.color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                const rgb = `${r},${g},${b}`;
                return (
                  <g key={relNode.id} style={{ pointerEvents: 'none' }}>
                    <rect
                      x={pos.x - REL_W / 2} y={pos.y - REL_H / 2}
                      width={REL_W} height={REL_H} rx="5"
                      fill={`rgba(${rgb},0.18)`}
                      stroke={relNode.color}
                      strokeWidth="1.5"
                    />
                    <text
                      x={pos.x} y={pos.y}
                      textAnchor="middle" dominantBaseline="middle"
                      fill={relNode.color} fontSize="8" fontWeight="800"
                      style={{ letterSpacing: '0.06em', textTransform: 'uppercase' }}
                    >
                      {relNode.label.toUpperCase()}
                    </text>
                  </g>
                );
              })}

              {(() => {
                const centralIncs  = getEntityIncoherences(central.id);
                const centralSev   = getMaxSeverity(centralIncs);
                const centralIncC  = centralSev ? SEVERITY_CONFIG[centralSev].color : null;
                return (
                  <g>
                    {centralIncC && (
                      <circle cx={CX} cy={CY} r={CENTER_R + 30}
                        fill="none" stroke={centralIncC} strokeWidth="1.5"
                        strokeDasharray="4 3" strokeOpacity="0.6"
                      />
                    )}
                    <g filter="url(#glow-c)">
                      <circle cx={CX} cy={CY} r={CENTER_R + 22} fill="none" stroke={centralColor} strokeWidth="1" strokeOpacity="0.15" />
                      <circle cx={CX} cy={CY} r={CENTER_R + 12} fill="none" stroke={centralColor} strokeWidth="1" strokeOpacity="0.25" />
                      <circle cx={CX} cy={CY} r={CENTER_R} fill={`rgba(${centralRgb},0.18)`} stroke={centralColor} strokeWidth="2.5" />
                      <text x={CX} y={CY - 5} textAnchor="middle" dominantBaseline="middle" fontSize="24" style={{ pointerEvents: 'none' }}>{TYPE_ICONS[central.entityType]}</text>
                      <text x={CX} y={CY + CENTER_R + 16} textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" style={{ pointerEvents: 'none' }}>{truncate(central.name, 20)}</text>
                    </g>
                    {centralIncC && (() => {
                      const bx = CX + CENTER_R - 2, by = CY - CENTER_R + 2;
                      const isHovBadge = hoveredBadge === central.id;
                      return (
                        <g
                          onClick={(e) => { e.stopPropagation(); setIncPanelId(prev => prev === central.id ? null : central.id); }}
                          onMouseEnter={(e) => { e.stopPropagation(); setHoveredBadge(central.id); }}
                          onMouseLeave={(e) => { e.stopPropagation(); setHoveredBadge(null); }}
                          style={{ cursor: 'pointer' }}
                        >
                          {isHovBadge && <circle cx={bx} cy={by} r="15" fill="none" stroke={centralIncC} strokeWidth="1.5" strokeOpacity="0.5" />}
                          <circle cx={bx} cy={by} r={isHovBadge ? 13 : 10} fill={centralIncC} />
                          <text x={bx} y={by} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={isHovBadge ? 10 : 9} fontWeight="bold" style={{ pointerEvents: 'none' }}>{centralIncs.length}</text>
                        </g>
                      );
                    })()}
                  </g>
                );
              })()}
              {N === 0 && <text x={CX} y={CY + CENTER_R + 50} textAnchor="middle" fill="#475569" fontSize="13" fontStyle="italic">Aucune connexion trouvée dans la base de données</text>}
            </>
          )}

          {/* ════════════ MODE GLOBAL ════════════ */}
          {mode === 'full' && (
            <>
              {visibleFullEdges.map((edge, i) => {
                const from = positions[edge.fromId], to = positions[edge.toId];
                if (!from || !to) return null;
                if (connectedIds && edge.fromId !== focusedId && edge.toId !== focusedId) return null;
                const color = RELATION_COLORS[edge.relType] || '#64748b';
                const dx = to.x - from.x, dy = to.y - from.y;
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                const ux = dx / dist, uy = dy / dist;
                const rF = getFullR(edge.fromId), rT = getFullR(edge.toId);
                const x1 = from.x + ux * (rF + 3), y1 = from.y + uy * (rF + 3);
                const x2 = to.x   - ux * (rT + 12), y2 = to.y - uy * (rT + 12);
                return (
                  <g key={i}>
                    <line
                      x1={x1} y1={y1} x2={x2} y2={y2}
                      stroke={color}
                      strokeWidth={connectedIds ? 1.5 : 1}
                      strokeDasharray="4 3"
                      markerEnd={connectedIds ? `url(#arrow-${edge.relType})` : undefined}
                    />
                  </g>
                );
              })}

              {fullGraph.nodes.map((node) => {
                const pos = positions[node.id];
                if (!pos) return null;
                const color  = getColor(node), rgb = hexToRgb(color);
                const r      = getFullR(node.id);
                const isHov  = hovered === node.id;
                const isFoc  = focusedId === node.id;
                const op     = nodeOpacity(node.id);
                const showLbl = r >= 28 || isHov || isFoc;
                return (
                  <g
                    key={node.id}
                    onClick={() => setFocusedId(prev => prev === node.id ? null : node.id)}
                    onMouseEnter={() => setHovered(node.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'pointer', opacity: op, transition: 'opacity 0.35s' }}
                    filter={isHov || isFoc ? 'url(#glow-n)' : undefined}
                  >
                    {(isHov || isFoc) && <circle cx={pos.x} cy={pos.y} r={r + 8} fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" />}
                    <circle cx={pos.x} cy={pos.y} r={r} fill={`rgba(${rgb},${isFoc ? 0.28 : isHov ? 0.2 : 0.12})`} stroke={color} strokeWidth={isFoc ? 2.5 : isHov ? 2 : 1.5} />
                    <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fontSize={Math.max(10, r * 0.55)} style={{ pointerEvents: 'none' }}>{TYPE_ICONS[node.entityType]}</text>
                    {showLbl && (
                      <text x={pos.x} y={pos.y + r + 12} textAnchor="middle" fill={isFoc ? '#fff' : isHov ? '#e2e8f0' : '#94a3b8'} fontSize="9" fontWeight={isFoc || isHov ? 'bold' : 'normal'} style={{ pointerEvents: 'none' }}>
                        {truncate(node.name, 14)}
                      </text>
                    )}
                  </g>
                );
              })}
            </>
          )}
        </svg>

        {/* ── Tooltip hover ── */}
        {hovered && (() => {
          const pos = positions[hovered];
          if (!pos) return null;
          const all  = mode === 'full' ? fullGraph.nodes : [...satellites, ...(central ? [central] : [])];
          const node = all.find(n => n.id === hovered);
          if (!node) return null;
          const color = getColor(node), rgb = hexToRgb(color);
          return (
            <div
              className="absolute pointer-events-none rounded-xl p-3 max-w-[220px] shadow-2xl"
              style={{
                left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%`,
                transform: 'translate(-50%, -175%)', zIndex: 20,
                backgroundColor: '#0f1e2d',
                border: `1px solid rgba(${rgb},0.35)`,
                boxShadow: `0 0 20px rgba(${rgb},0.15)`,
              }}
            >
              <p className="text-sm font-bold text-white leading-tight">{node.name}</p>
              {node.race        && <p className="text-xs mt-0.5" style={{ color }}>{node.race}</p>}
              {node.type        && <p className="text-xs mt-0.5" style={{ color }}>{node.type}</p>}
              {node.description && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-serif line-clamp-2">{node.description}</p>}
              {mode === 'full' && <p className="text-xs text-slate-500 mt-1">{fullGraph.degree.get(hovered) || 0} relation{(fullGraph.degree.get(hovered) || 0) !== 1 ? 's' : ''}</p>}
              <p className="text-xs text-slate-600 mt-1.5 italic">
                {mode === 'full' ? 'Cliquer pour focaliser' : 'Cliquer pour explorer →'}
              </p>
            </div>
          );
        })()}

        {/* ── Barre d'info (mode global, nœud focalisé) ── */}
        {mode === 'full' && focusedNode && (() => {
          const color = getColor(focusedNode), rgb = hexToRgb(color);
          const deg   = fullGraph.degree.get(focusedId) || 0;
          return (
            <div
              className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-sm"
              style={{ zIndex: 30, backgroundColor: 'rgba(10,18,28,0.92)', border: `1px solid rgba(${rgb},0.4)`, boxShadow: `0 0 28px rgba(${rgb},0.18)` }}
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }} />
              <span className="text-sm font-bold text-white">{focusedNode.name}</span>
              <span className="text-xs text-slate-500">{TYPE_ICONS[focusedNode.entityType]}</span>
              <span className="text-xs text-slate-500">{deg} lien{deg !== 1 ? 's' : ''}</span>
              <div className="w-px h-4 bg-white/10" />
              <button
                onClick={() => {
                  internalNav.current = true;
                  setHistory([focusedId]);
                  setHistoryIndex(0);
                  setCurrentId(focusedId);
                  setMode('centered');
                  setFocusedId(null);
                  onNodeClick(focusedId);
                }}
                className="text-xs font-bold px-3 py-1 rounded-lg transition-all duration-200"
                style={{ backgroundColor: `rgba(${rgb},0.18)`, color, border: `1px solid rgba(${rgb},0.35)` }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = `rgba(${rgb},0.3)`; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = `rgba(${rgb},0.18)`; }}
              >
                Explorer →
              </button>
              <button onClick={() => setFocusedId(null)} className="text-slate-500 hover:text-slate-300 text-xs transition-colors leading-none">✕</button>
            </div>
          );
        })()}

        {/* ── Panneau incohérences (mode centré) ── */}
        {mode === 'centered' && incPanelId && (
          <IncPanel
            incPanelId={incPanelId}
            onClose={() => setIncPanelId(null)}
            central={central}
            satellites={satellites}
            navigateTo={navigateTo}
          />
        )}

        {/* ── Hint mode global (sans focus) ── */}
        {mode === 'full' && !focusedId && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[11px] text-slate-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5 pointer-events-none">
            Cliquer sur une entité pour focaliser ses relations
          </div>
        )}

        {/* ── Légende relations ── */}
        {usedRelTypes.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-3">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Relations</p>
            <div className="space-y-1.5">
              {usedRelTypes.map(key => {
                const color = RELATION_COLORS[key];
                return (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-4" style={{ backgroundColor: color, height: '1.5px', boxShadow: `0 0 4px ${color}` }}></div>
                    </div>
                    <span className="text-[11px] text-slate-400">{RELATION_LABELS[key]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Légende types ── */}
        <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-sm border border-white/10 rounded-xl p-3">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Entités</p>
          <div className="space-y-1.5">
            {[
              { type: 'character', label: 'Personnage', color: '#9CA3AF' },
              { type: 'location',  label: 'Lieu',       color: NODE_COLORS.location },
              { type: 'object',    label: 'Objet',      color: NODE_COLORS.object },
            ].map(({ type, label, color }) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-slate-400">{TYPE_ICONS[type]} {label}</span>
              </div>
            ))}
          </div>
          {mode === 'full' && (
            <p className="text-[10px] text-slate-600 mt-2 pt-2 border-t border-white/5 italic">Taille = nb de relations</p>
          )}
        </div>

      </div>
    </div>
  );
}
