import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTranslation } from 'react-i18next';

/**
 * Wrapper draggable pour EventCard.
 * Ajoute un handle grip (⠿) et le comportement dnd-kit sortable.
 */
export default function SortableEventCard({ id, children }) {
  const { t } = useTranslation();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    position: 'relative',
  };

  // Merge dnd-kit listeners with stopPropagation to prevent useDragScroll conflict
  const handlePointerDown = (e) => {
    e.stopPropagation();
    listeners?.onPointerDown?.(e);
  };

  return (
    <div ref={setNodeRef} style={style}>
      <button
        {...attributes}
        {...listeners}
        onPointerDown={handlePointerDown}
        onMouseDown={e => e.stopPropagation()}
        className="absolute top-2 left-1 z-10 w-5 h-5 flex items-center justify-center rounded text-slate-600 hover:text-slate-300 hover:bg-white/10 cursor-grab active:cursor-grabbing transition-colors"
        title={t('dnd.dragToReorder')}
        onClick={e => e.stopPropagation()}
      >
        ⠿
      </button>
      {children}
    </div>
  );
}
