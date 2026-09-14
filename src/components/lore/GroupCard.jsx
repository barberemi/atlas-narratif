import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoreStore } from '../../stores/useLoreStore';
import { ENTITY_COLORS } from '../../utils/entityUtils';
import DarkCard from '../ui/DarkCard';
import Icon from '../ui/Icon';

export default function GroupCard({ group, onCharacterClick, onRelations }) {
  const { t } = useTranslation();
  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);
  const [hoveredChar, setHoveredChar] = useState(null);

  const memberChars = group.members
    .map(m => characters.find(c => c.id === m.characterId))
    .filter(Boolean);

  const homeland = group.homelandId
    ? locations.find(l => l.id === group.homelandId)
    : null;

  const accent = group.color || ENTITY_COLORS.group;

  return (
    <DarkCard color={accent} accent={accent} className="flex flex-col">
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* En-tête */}
        <div>
          <p className="font-serif text-base font-semibold text-atlas-text truncate">{group.name}</p>
          {group.type && (
            <span
              className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold"
              style={{
                backgroundColor: `${accent}15`,
                color:           accent,
                border:          `1px solid ${accent}30`,
              }}
            >
              {group.type}
            </span>
          )}
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-xs text-atlas-soft font-serif italic leading-relaxed line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Homeland */}
        {homeland && (
          <p className="text-[10px] text-atlas-mute flex items-center gap-1">
            <Icon name="location" size={14} />{homeland.name}
          </p>
        )}

        {/* Membres */}
        <div className="mt-auto pt-2">
          <p className="text-[10px] text-atlas-mute uppercase tracking-widest mb-1.5">
            {t('label.memberCount', { count: memberChars.length })}
          </p>
          {memberChars.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {memberChars.map(c => {
                const hex = c.color.replace('#', '');
                const r = parseInt(hex.slice(0, 2), 16);
                const g = parseInt(hex.slice(2, 4), 16);
                const b = parseInt(hex.slice(4, 6), 16);
                return (
                  <button
                    key={c.id}
                    onClick={e => { e.stopPropagation(); onCharacterClick?.(c.name); }}
                    onMouseEnter={() => setHoveredChar(c.id)}
                    onMouseLeave={() => setHoveredChar(null)}
                    className="flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded transition-all duration-150"
                    style={{
                      backgroundColor: hoveredChar === c.id ? `rgba(${r},${g},${b},0.25)` : `rgba(${r},${g},${b},0.12)`,
                      color:           c.color,
                      border:          `1px solid rgba(${r},${g},${b},${hoveredChar === c.id ? '0.6' : '0.3'})`,
                      cursor:          onCharacterClick ? 'pointer' : 'default',
                      transform:       hoveredChar === c.id ? 'translateY(-1px)' : 'none',
                      boxShadow:       hoveredChar === c.id ? `0 3px 8px rgba(${r},${g},${b},0.3)` : 'none',
                    }}
                    title={t('lore.viewProfile', { name: c.name })}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                    {c.name.split(' ')[0]}
                  </button>
                );
              })}
            </div>
          )}
        </div>

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
