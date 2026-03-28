import { hexToRgb } from '../../utils/color';
import { getEntityMeta, ENTITY_ICONS } from '../../utils/entityUtils';

export default function EntityChip({ entity, onClick }) {
  const meta = getEntityMeta(entity.id, entity.entityType);
  if (!meta) return null;
  const color = meta.color;
  const rgb   = hexToRgb(color);
  return (
    <button
      onClick={e => { e.stopPropagation(); onClick(entity); }}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium transition-all duration-150"
      style={{ cursor: 'pointer', backgroundColor: `rgba(${rgb},0.08)`, color: '#94a3b8', border: `1px solid rgba(${rgb},0.2)` }}
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = `rgba(${rgb},0.15)`; e.currentTarget.style.border = `1px solid rgba(${rgb},0.4)`; e.currentTarget.style.color = '#e2e8f0'; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = `rgba(${rgb},0.08)`; e.currentTarget.style.border = `1px solid rgba(${rgb},0.2)`; e.currentTarget.style.color = '#94a3b8'; }}
      title={`Voir ${meta.name}`}
    >
      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color, opacity: 0.7 }} />
      <span className="leading-none">{ENTITY_ICONS[entity.entityType]}</span>
      <span className="leading-none">{meta.name}</span>
    </button>
  );
}
