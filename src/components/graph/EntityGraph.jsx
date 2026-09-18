import { useState, useEffect, useLayoutEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { buildGraph, RELATION_COLORS } from '../../utils/buildGraph';
import { getMaxSeverity, SEVERITY_CONFIG } from '../../data/severity_config';
import { hexToRgb } from '../../utils/color';
import { getEntityInfo, ENTITY_COLORS } from '../../utils/entityUtils';
import { useGraphSimulation, W, H, CX, CY } from './useGraphSimulation';
import IncPanel from './IncPanel';
import Icon from '../ui/Icon';
import { useIncStore } from '../../stores/useIncStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { useStoreLoader } from '../../hooks/useStoreLoader';

// ── Constantes de rendu ───────────────────────────────────────────────────────
const CENTER_R = 52;
const NODE_R   = 34;
const REL_W    = 58;
const REL_H    = 20;
const REL_R    = 12;
const NODE_COLORS = ENTITY_COLORS; // couleurs par type d'entité — palette data-viz unifiée
// icônes de type rendues via TYPE_ICON_NAMES (lucide, en <foreignObject> dans le SVG)
const TYPE_ICON_NAMES = { character: 'user', location: 'location', object: 'object', group: 'group', custom: 'gem' };

function getColor(node) {
  if (node.entityType === 'character' || node.entityType === 'group' || node.entityType === 'custom') return node.color || NODE_COLORS[node.entityType] || '#a78bfa';
  return NODE_COLORS[node.entityType];
}
function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n - 1) + '…' : (str ?? '');
}

// Tooltip auto-placé : se mesure lui-même + son conteneur pour se poser au-dessus
// OU en dessous du nœud (selon la place dispo) et se clampe horizontalement — jamais
// coupé par l'overflow du conteneur, même pour les nœuds tout en haut.
function GraphTooltip({ pos, node, color, rgb, t }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({ transform: 'translate(-50%, calc(-100% - 46px))', visibility: 'hidden' });
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.offsetParent;
    if (!el || !parent) return;
    const pw = parent.clientWidth, ph = parent.clientHeight;
    const w = el.offsetWidth, h = el.offsetHeight;
    const nodeX = (pos.x / W) * pw;
    const nodeY = (pos.y / H) * ph;
    const gap = NODE_R + 12;
    const ty = (nodeY - gap) >= (h + 4) ? `calc(-100% - ${gap}px)` : `${gap}px`;
    let txPx = -w / 2;
    if (nodeX + txPx < 4) txPx = 4 - nodeX;
    else if (nodeX + w / 2 > pw - 4) txPx = pw - 4 - w - nodeX;
    setStyle({ transform: `translate(${txPx}px, ${ty})`, visibility: 'visible' });
  }, [pos.x, pos.y, node.id]);
  return (
    <div
      ref={ref}
      className="absolute pointer-events-none rounded-none p-3 max-w-[220px] shadow-2xl"
      style={{
        left: `${(pos.x / W) * 100}%`, top: `${(pos.y / H) * 100}%`,
        zIndex: 50, backgroundColor: '#15171b',
        border: `1px solid rgba(${rgb},0.35)`,
        boxShadow: `0 0 20px rgba(${rgb},0.15)`,
        ...style,
      }}
    >
      <p className="font-serif text-base font-semibold text-white leading-tight">{node.name}</p>
      {node.race        && <p className="text-xs mt-0.5" style={{ color }}>{node.race}</p>}
      {node.type        && <p className="text-xs mt-0.5" style={{ color }}>{node.type}</p>}
      {node.description && <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-serif line-clamp-2">{node.description}</p>}
      <p className="text-xs text-atlas-mute mt-1.5 italic">{t('graph.clickToExplore')}</p>
    </div>
  );
}

export default function EntityGraph({ entityId, onNodeClick }) {
  const { t } = useTranslation();
  useStoreLoader([useIncStore, useLoreStore, useTimelineStore, useCustomEntityStore]);
  const rawIncs = useIncStore(s => s.data);
  const events  = useTimelineStore(s => s.events);
  const customEntities = useCustomEntityStore(s => s.entities);
  // Abonnement au lore : buildGraph lit le cache module (getLoreCache), non réactif —
  // on s'abonne aux tableaux du store pour recalculer le graphe quand le lore arrive
  // (sinon un reload direct sur /relations?entity=… reste bloqué sur « introuvable »).
  const loreReady  = useLoreStore(s => s.ready);
  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);
  const objects    = useLoreStore(s => s.objects);
  const groups     = useLoreStore(s => s.groups);
  const [currentId,     setCurrentId]     = useState(entityId);
  const [history,       setHistory]       = useState([entityId]);
  const [historyIndex,  setHistoryIndex]  = useState(0);
  const [hovered,       setHovered]       = useState(null);
  const [hoveredBadge,  setHoveredBadge]  = useState(null);
  const [positions,     setPositions]     = useState({});
  const [incPanelId,    setIncPanelId]    = useState(null);
  const posRef      = useRef({});
  const internalNav = useRef(false);

  const entityIncMap = useMemo(() => {
    const map = {};
    (rawIncs ?? []).forEach(inc => {
      (inc.links ?? []).forEach(link => {
        if (!map[link.entityId]) map[link.entityId] = [];
        map[link.entityId].push(inc);
      });
    });
    return map;
  }, [rawIncs]);

  // Deps lore volontaires : buildGraph lit getLoreCache() (cache module invisible à ESLint) ;
  // ces refs déclenchent le recalcul quand le lore (re)charge. Ne pas les retirer.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const graph = useMemo(() => buildGraph(currentId, events ?? []), [currentId, characters, locations, objects, groups, events, customEntities]);

  // Reset depuis l'extérieur
  useEffect(() => {
    if (internalNav.current) { internalNav.current = false; return; }
    setCurrentId(entityId);
    setHistory([entityId]);
    setHistoryIndex(0);
  }, [entityId]);

  useGraphSimulation({ graph, setPositions, posRef });

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

  const relNodeIds = useMemo(
    () => new Set((graph?.relNodes ?? []).map(r => r.id)),
    [graph]
  );

  if (!graph) {
    // Lore pas encore chargé → état de chargement ; chargé mais entité absente → introuvable
    return (
      <div className="h-full flex items-center justify-center bg-atlas-ink text-slate-400">
        {loreReady ? t('graph.entityNotFound') : t('common.loading', 'Chargement…')}
      </div>
    );
  }

  const { central, satellites, edges, relNodes: graphRelNodes = [] } = graph;
  const N            = satellites.length;
  const centralColor = getColor(central);
  const centralRgb   = hexToRgb(centralColor);
  const usedRelTypes = [...new Set(edges.map(e => e.relType))];

  return (
    <div className="h-full w-full flex flex-col bg-atlas-ink text-slate-200">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Univers · réseau de relations'}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            Atlas <span className="italic" style={{ color: '#5cae8e' }}>{t('graph.relations')}</span>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {central.name} — {t('graph.connections', { count: N })}
          </p>
        </div>
      </header>

      {/* ── Fil d'Ariane ── */}
      {history.length > 1 && (
        <nav className="flex items-center gap-1 px-6 py-2 border-b border-atlas-line overflow-x-auto flex-shrink-0" style={{ background: 'rgba(0,0,0,0.25)' }}>
          {history.map((id, idx) => {
            const info      = getEntityInfo(id);
            const isCurrent = idx === historyIndex;
            const isFuture  = idx > historyIndex;
            return (
              <div key={`${id}-${idx}`} className="flex items-center gap-1 flex-shrink-0">
                {idx > 0 && <span className="text-atlas-mute text-xs select-none" style={{ opacity: isFuture ? 0.35 : 1 }}>›</span>}
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
                  <Icon name={info.icon} size={13} className="flex-shrink-0" />
                  <span className="text-xs leading-none" style={{ color: isCurrent ? '#e2e8f0' : 'var(--color-atlas-mute)', fontWeight: isCurrent ? '700' : '400' }}>
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
              <stop offset="100%" stopColor="#15171b"       stopOpacity="0" />
            </radialGradient>
          </defs>

          <circle cx={CX} cy={CY} r={350} fill="url(#bg-grad)" />

          {/* Arêtes */}
          {edges.map((edge, i) => {
            const from  = positions[edge.fromId] ?? { x: CX, y: CY };
            const to    = positions[edge.toId]   ?? { x: CX, y: CY };
            const color = RELATION_COLORS[edge.relType] || 'var(--color-atlas-soft)';
            const dx = to.x - from.x, dy = to.y - from.y;
            const dist = Math.sqrt(dx * dx + dy * dy) || 1;
            const ux = dx / dist, uy = dy / dist;
            const fC   = edge.fromId === central.id;
            const tC   = edge.toId   === central.id;
            const fRel = relNodeIds.has(edge.fromId);
            const tRel = relNodeIds.has(edge.toId);
            const r1   = fC ? CENTER_R + 4  : fRel ? REL_R : NODE_R + 4;
            const r2   = tC ? CENTER_R + 14 : tRel ? REL_R : NODE_R + 14;
            const x1 = from.x + ux * r1, y1 = from.y + uy * r1;
            const x2 = to.x   - ux * r2, y2 = to.y   - uy * r2;
            const showLabel = !fRel && !tRel;
            const label = showLabel ? (t(`graph.rel_${edge.relType}`) || '') : '';
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
                    <rect x={mx - lw / 2} y={my - 8} width={lw} height={14} rx="3" fill="#15171b" fillOpacity="0.85" />
                    <text x={mx} y={my + 1} textAnchor="middle" dominantBaseline="middle" fill={color} fontSize="9" opacity="0.9" style={{ pointerEvents: 'none', fontWeight: 600 }}>{label}</text>
                  </>
                )}
              </g>
            );
          })}

          {/* Nœuds satellites — le survolé est rendu en dernier (peint au-dessus :
              en SVG l'ordre de peinture = ordre du DOM, z-index n'a pas d'effet) */}
          {[...satellites].sort((a, b) => (a.id === hovered ? 1 : 0) - (b.id === hovered ? 1 : 0)).map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;
            const color    = getColor(node), rgb = hexToRgb(color);
            const isHov    = hovered === node.id;
            const nodeIncs = entityIncMap[node.id] ?? [];
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
                  <foreignObject x={pos.x - 9} y={pos.y - 12} width={18} height={18} style={{ pointerEvents: 'none' }}>
                    <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icon name={TYPE_ICON_NAMES[node.entityType]} size={16} />
                    </div>
                  </foreignObject>
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

          {/* Nœuds relation (carrés intermédiaires) */}
          {graphRelNodes.map(relNode => {
            const pos = positions[relNode.id];
            if (!pos) return null;
            const hex = relNode.color.replace('#', '');
            const rr = parseInt(hex.slice(0, 2), 16);
            const gg = parseInt(hex.slice(2, 4), 16);
            const bb = parseInt(hex.slice(4, 6), 16);
            const rgb = `${rr},${gg},${bb}`;
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
                  {(t(`graph.rel_${relNode.relType}`) || relNode.label).toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* Nœud central */}
          {(() => {
            const centralIncs = entityIncMap[central.id] ?? [];
            const centralSev  = getMaxSeverity(centralIncs);
            const centralIncC = centralSev ? SEVERITY_CONFIG[centralSev].color : null;
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
                  <foreignObject x={CX - 12} y={CY - 17} width={24} height={24} style={{ pointerEvents: 'none' }}>
                    <div style={{ width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                      <Icon name={TYPE_ICON_NAMES[central.entityType]} size={22} />
                    </div>
                  </foreignObject>
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
          {N === 0 && <text x={CX} y={CY + CENTER_R + 50} textAnchor="middle" fill="#475569" fontSize="13" fontStyle="italic">{t('graph.noConnections')}</text>}
        </svg>

        {/* Tooltip hover — auto-placé (au-dessus/dessous + clamp) selon la place dispo */}
        {hovered && (() => {
          const pos  = positions[hovered];
          if (!pos) return null;
          const node = [...satellites, central].find(n => n.id === hovered);
          if (!node) return null;
          const color = getColor(node);
          return <GraphTooltip pos={pos} node={node} color={color} rgb={hexToRgb(color)} t={t} />;
        })()}

        {/* Panneau incohérences */}
        {incPanelId && (
          <IncPanel
            incPanelId={incPanelId}
            panelIncs={entityIncMap[incPanelId] ?? []}
            onClose={() => setIncPanelId(null)}
            central={central}
            satellites={satellites}
            navigateTo={navigateTo}
          />
        )}

        {/* Légende relations */}
        {usedRelTypes.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-atlas-ink/80 backdrop-blur-sm border border-atlas-line rounded-none p-3">
            <p className="font-grotesk text-[10px] font-bold text-atlas-gold uppercase tracking-[0.2em] mb-2">{t('graph.relations')}</p>
            <div className="space-y-1.5">
              {usedRelTypes.map(key => (
                <div key={key} className="flex items-center gap-2">
                  <div className="w-4" style={{ backgroundColor: RELATION_COLORS[key], height: '1.5px', boxShadow: `0 0 4px ${RELATION_COLORS[key]}` }} />
                  <span className="text-[11px] text-slate-400">{t(`graph.rel_${key}`)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Légende types */}
        <div className="absolute bottom-4 right-4 bg-atlas-ink/80 backdrop-blur-sm border border-atlas-line rounded-none p-3">
          <p className="font-grotesk text-[10px] font-bold text-atlas-gold uppercase tracking-[0.2em] mb-2">{t('graph.entities')}</p>
          <div className="space-y-1.5">
            {[
              { type: 'character', label: t('label.characters'), color: NODE_COLORS.character },
              { type: 'location',  label: t('label.locations'),  color: NODE_COLORS.location },
              { type: 'object',    label: t('label.objects'),    color: NODE_COLORS.object },
              { type: 'group',     label: t('label.groups'),     color: NODE_COLORS.group },
            ].map(({ type, label, color }) => (
              <div key={type} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-[11px] text-slate-400 inline-flex items-center gap-1"><Icon name={TYPE_ICON_NAMES[type]} size={13} /> {label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
