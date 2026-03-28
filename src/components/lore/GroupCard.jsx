import { useState } from 'react';
import { useLoreStore } from '../../stores/useLoreStore';

export default function GroupCard({ group, onCharacterClick, onRelations }) {
  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);
  const [hoveredChar, setHoveredChar] = useState(null);

  const memberChars = group.members
    .map(m => characters.find(c => c.id === m.characterId))
    .filter(Boolean);

  const homeland = group.homelandId
    ? locations.find(l => l.id === group.homelandId)
    : null;

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col transition-all duration-150"
      style={{ border: '1px solid rgba(255,255,255,0.07)', backgroundColor: 'rgba(255,255,255,0.02)' }}
    >
      {/* Bandeau couleur */}
      <div className="h-1 w-full flex-shrink-0" style={{ backgroundColor: group.color }} />

      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* En-tête */}
        <div>
          <p className="text-sm font-black text-white truncate">{group.name}</p>
          <span
            className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold"
            style={{
              backgroundColor: `${group.color}15`,
              color:           group.color,
              border:          `1px solid ${group.color}30`,
            }}
          >
            {group.type}
          </span>
        </div>

        {/* Description */}
        {group.description && (
          <p className="text-xs text-slate-500 font-serif italic leading-relaxed line-clamp-2">
            {group.description}
          </p>
        )}

        {/* Homeland */}
        {homeland && (
          <p className="text-[10px] text-slate-600">
            📍 {homeland.name}
          </p>
        )}

        {/* Membres */}
        <div className="mt-auto pt-2">
          <p className="text-[10px] text-slate-600 uppercase tracking-widest mb-1.5">
            {memberChars.length} membre{memberChars.length !== 1 ? 's' : ''}
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
                    title={`Voir la fiche de ${c.name}`}
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
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-150 hover:scale-105 hover:brightness-125"
              style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer' }}
            >
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="2" cy="7" r="1.5"/><circle cx="12" cy="2" r="1.5"/><circle cx="12" cy="12" r="1.5"/>
                <line x1="3.5" y1="6.3" x2="10.5" y2="3"/><line x1="3.5" y1="7.7" x2="10.5" y2="11"/>
              </svg>
              Relations
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
