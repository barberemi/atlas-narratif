import { useMemo } from 'react';
import { getEntityMeta, ENTITY_COLORS } from '../../utils/entityUtils';

export default function EntityChip({ link, onEntityClick, onEntityFilter }) {
  const meta = useMemo(() => getEntityMeta(link.entityId, link.entityType), [link]);
  const displayName = meta?.name ?? link.label;

  const color = meta?.color ?? ENTITY_COLORS[link.entityType] ?? '#64748B';
  const hex   = color.replace('#', '');
  const r     = parseInt(hex.slice(0, 2), 16);
  const g     = parseInt(hex.slice(2, 4), 16);
  const b     = parseInt(hex.slice(4, 6), 16);
  const rgb   = `${r},${g},${b}`;

  const typeIcons = { character: '👤', location: '📍', object: '⚔️' };
  const icon = typeIcons[link.entityType] ?? '·';

  const handleClick = (e) => {
    if (!meta) return;
    if (e.shiftKey && onEntityClick) {
      onEntityClick(link.entityId, link.entityType);
    } else if (onEntityFilter) {
      onEntityFilter(link.entityId, link.entityType, link.label);
    } else if (onEntityClick) {
      onEntityClick(link.entityId, link.entityType);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium transition-all duration-150 hover:scale-105"
      style={{
        backgroundColor: `rgba(${rgb},0.15)`,
        color,
        border:  `1px solid rgba(${rgb},0.35)`,
        cursor:  meta ? 'pointer' : 'default',
        opacity: meta ? 1 : 0.5,
      }}
      title={meta
        ? onEntityFilter
          ? `Filtrer par ${displayName} (Shift+clic → relations)`
          : `Ouvrir la fiche de ${displayName}`
        : 'Entité non trouvée dans la base'
      }
    >
      <span>{icon}</span>
      {displayName}
    </button>
  );
}
