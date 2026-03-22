import { useState } from 'react';
import { useLoreStore } from '../../stores/useLoreStore';

export default function GroupCard({ group, onEdit }) {
  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);

  const [expanded, setExpanded] = useState(false);

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
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
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
          <button
            onClick={() => onEdit(group)}
            className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center opacity-40 hover:opacity-100 transition-all duration-200"
            style={{ backgroundColor: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.3)' }}
            title="Modifier"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
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
        <div className="mt-auto pt-2 border-t border-white/05">
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            disabled={memberChars.length === 0}
          >
            <span className="font-mono" style={{ color: group.color }}>{memberChars.length}</span>
            membre{memberChars.length !== 1 ? 's' : ''}
            {memberChars.length > 0 && (
              <span className="ml-1">{expanded ? '▲' : '▼'}</span>
            )}
          </button>

          {expanded && memberChars.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {memberChars.map(c => (
                <span
                  key={c.id}
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]"
                  style={{
                    backgroundColor: `${c.color}15`,
                    color:           c.color,
                    border:          `1px solid ${c.color}30`,
                  }}
                >
                  👤 {c.name.split(' ')[0]}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
