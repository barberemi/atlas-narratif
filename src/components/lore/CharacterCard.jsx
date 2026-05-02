import { useEffect, useRef, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoreStore }    from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import SourceBadge from '../ui/SourceBadge';
import DarkCard from '../ui/DarkCard';

export default function CharacterCard({ char, highlighted, onRelations }) {
  const { t } = useTranslation();
  const ref = useRef(null);
  useEffect(() => {
    if (highlighted && ref.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlighted]);

  const groups = useLoreStore(s => s.groups) ?? [];
  const charGroups = groups.filter(g => (g.members ?? []).some(m => m.characterId === char.id));

  const allEvents = useTimelineStore(s => s.events);
  const flashbacks = useMemo(() =>
    (allEvents ?? [])
      .filter(e => e.isFlashback && e.entities.some(en => en.entityType === 'character' && en.id === char.id))
      .sort((a, b) => {
        const ra = a.storyChapterRef ?? Infinity;
        const rb = b.storyChapterRef ?? Infinity;
        return ra - rb;
      }),
    [allEvents, char.id],
  );

  const [memoriesOpen, setMemoriesOpen] = useState(false);

  return (
    <DarkCard ref={ref} color={char.color || '#64748b'} highlighted={highlighted}>
      <SourceBadge source={char.source} />
      <div className="h-1" style={{ backgroundColor: char.color }} />
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-base font-black text-white leading-tight">{char.name}</h3>
          {char.aliases?.length > 0 && (
            <p className="text-xs text-slate-500 italic mt-0.5">{char.aliases.slice(0, 2).join(' · ')}</p>
          )}
          {charGroups.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {charGroups.map(g => (
                <span
                  key={g.id}
                  className="text-[10px] px-1.5 py-0.5 rounded-full font-bold"
                  style={{ backgroundColor: `${g.color}20`, color: g.color, border: `1px solid ${g.color}40` }}
                >
                  {g.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-serif line-clamp-3">{char.description}</p>
        {char.origin && <p className="text-xs text-slate-600 italic">{char.origin}</p>}
        {/* ── Mémoires / Flashbacks ── */}
        {flashbacks.length > 0 && (
          <div className="border-t pt-2" style={{ borderColor: 'rgba(217,119,6,0.2)' }}>
            <button
              onClick={e => { e.stopPropagation(); setMemoriesOpen(v => !v); }}
              className="flex items-center gap-1.5 w-full text-left transition-colors"
              style={{ color: memoriesOpen ? '#fbbf24' : '#92680a' }}
            >
              <span className="text-[10px] font-bold tracking-wider uppercase" style={{ color: 'inherit' }}>
                ↩ {flashbacks.length} mémoire{flashbacks.length > 1 ? 's' : ''}
              </span>
              <span className="ml-auto text-[9px]" style={{ color: 'rgba(217,119,6,0.5)' }}>
                {memoriesOpen ? '▲' : '▼'}
              </span>
            </button>

            {memoriesOpen && (
              <div className="mt-2 space-y-1.5">
                {flashbacks.map(evt => {
                  const ref = evt.storyChapterRef;
                  const posLabel = ref == null ? '?' : ref < 1 ? `Ère ancienne (~${ref})` : `Ch. ${ref}`;
                  return (
                    <div
                      key={evt.id}
                      className="rounded-lg px-2.5 py-2 flex flex-col gap-0.5"
                      style={{ backgroundColor: 'rgba(120,77,15,0.12)', border: '1px solid rgba(217,119,6,0.2)' }}
                    >
                      <p className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#d97706' }}>
                        {posLabel}
                      </p>
                      <p className="text-[11px] font-semibold text-slate-300 leading-snug">{evt.title}</p>
                      <p className="text-[9px] text-slate-600">narré ch. {evt.chapter}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {onRelations && (
          <div className="flex justify-end">
            <button
              onClick={e => { e.stopPropagation(); onRelations(); }}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold transition-all duration-150 hover:scale-105 hover:brightness-125"
              style={{ backgroundColor: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)', cursor: 'pointer' }}
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
