import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getEntityMeta, ENTITY_COLORS } from '../../utils/entityUtils';
import DarkCard from '../ui/DarkCard';
import CustomFieldChips from '../ui/CustomFieldChips';

export default function ObjectCard({ obj, highlighted, onCharacterClick, onRelations }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  const [hoveredChar, setHoveredChar] = useState(null);
  useEffect(() => {
    if (highlighted && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  return (
    <DarkCard ref={ref} color={ENTITY_COLORS.object} accent={ENTITY_COLORS.object} highlighted={highlighted}>
      <div className="p-4 flex flex-col gap-3">
        <div>
          {obj.type && <span className="text-xs px-2 py-0.5 rounded bg-amber-900/30 text-amber-400 border border-amber-800/40">{obj.type}</span>}
          <h3 className={`font-serif text-lg font-semibold text-atlas-text${obj.type ? " mt-1" : ""}`}>{obj.name}</h3>
          {obj.creator && <p className="text-xs text-atlas-soft italic mt-0.5">{t('lore.forgedBy', { name: obj.creator })}</p>}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-serif line-clamp-3">{obj.description}</p>
        <CustomFieldChips fields={obj.customFields} />
        {obj.powers?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {obj.powers.map((p, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded text-amber-300 bg-amber-900/20 border border-amber-800/30">{p}</span>
            ))}
          </div>
        )}
        {obj.holders?.length > 0 && (
          <div>
            <p className="text-xs text-atlas-mute uppercase tracking-widest mb-1.5">{t('lore.bearers')}</p>
            <div className="flex flex-wrap gap-1.5">
              {obj.holders.map((char) => {
                const meta = getEntityMeta(char.id, 'character');
                const displayName = meta?.name ?? char.name;
                const color = meta?.color ?? char.color;
                const hex = color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return (
                  <button
                    key={char.id}
                    onClick={e => { e.stopPropagation(); onCharacterClick?.(displayName); }}
                    onMouseEnter={() => setHoveredChar(char.id)}
                    onMouseLeave={() => setHoveredChar(null)}
                    className="flex items-center gap-1 text-xs px-2 py-0.5 rounded transition-all duration-150"
                    style={{
                      backgroundColor: hoveredChar === char.id ? `rgba(${r},${g},${b},0.25)` : `rgba(${r},${g},${b},0.12)`,
                      color,
                      border: `1px solid rgba(${r},${g},${b},${hoveredChar === char.id ? '0.6' : '0.3'})`,
                      cursor: onCharacterClick ? 'pointer' : 'default',
                      transform: hoveredChar === char.id ? 'translateY(-1px)' : 'none',
                      boxShadow: hoveredChar === char.id ? `0 3px 8px rgba(${r},${g},${b},0.3)` : 'none',
                    }}
                    title={t('lore.viewProfile', { name: displayName })}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                    {displayName.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        {obj.inscription && (
          <p className="text-xs text-amber-600/70 font-serif italic border-l-2 border-amber-800/40 pl-2">{obj.inscription}</p>
        )}
        {onRelations && (
          <div className="flex justify-end mt-1">
            <button
              onClick={e => { e.stopPropagation(); onRelations(); }}
              className="flex items-center gap-1 px-2 py-1 font-grotesk text-[10px] font-bold uppercase tracking-[0.06em] transition-all duration-150 hover:brightness-125"
              style={{ backgroundColor: 'rgba(92,174,142,0.12)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.25)', cursor: 'pointer' }}
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="2" cy="7" r="1.5"/><circle cx="12" cy="2" r="1.5"/><circle cx="12" cy="12" r="1.5"/>
                <line x1="3.5" y1="6.3" x2="10.5" y2="3"/><line x1="3.5" y1="7.7" x2="10.5" y2="11"/>
              </svg>
              {t('lore.relations')}
            </button>
          </div>
        )}
      </div>
    </DarkCard>
  );
}
