import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CHAR_COL_W = 100;
const CH_COL_W   = 140;
const SCROLL_STEP = CH_COL_W * 2;

export default function JourneyMatrix({ events, characters, activeVolumeId, onEventSelect }) {
  const { t } = useTranslation();
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [hovered, setHovered]                 = useState(null); // { eventId, x, y }
  const [canScrollLeft, setCanScrollLeft]     = useState(false);
  const [canScrollRight, setCanScrollRight]   = useState(false);
  const containerRef = useRef(null);

  // ── Build matrix data ──────────────────────────────────────────────────────
  const { chapters, charRows, matrix } = useMemo(() => {
    if (!events?.length || !characters?.length) return { chapters: [], charRows: [], matrix: new Map() };

    const filtered = activeVolumeId
      ? events.filter(e => e.volumeId === activeVolumeId)
      : events;

    // Chapters sorted by number
    const chapMap = new Map();
    for (const e of filtered) {
      if (!chapMap.has(e.chapter)) chapMap.set(e.chapter, { number: e.chapter, title: e.chapterTitle });
    }
    const chs = [...chapMap.values()].sort((a, b) => a.number - b.number);

    // Matrix: charId -> chapterNum -> events[]
    const mat = new Map();
    const charIdSet = new Set();

    for (const evt of filtered) {
      const charEntities = (evt.entities ?? []).filter(e => e.entityType === 'character');
      for (const ent of charEntities) {
        charIdSet.add(ent.id);
        if (!mat.has(ent.id)) mat.set(ent.id, new Map());
        const charMap = mat.get(ent.id);
        if (!charMap.has(evt.chapter)) charMap.set(evt.chapter, []);
        charMap.get(evt.chapter).push({
          eventId:     evt.id,
          title:       evt.title,
          description: evt.description,
          isPov:       evt.povCharacterId === ent.id,
          locationId:  evt.locationId,
          chapter:     evt.chapter,
          chapterTitle: evt.chapterTitle,
          isFlashback: evt.isFlashback,
          povCharName: evt.povCharacterId
            ? characters.find(c => c.id === evt.povCharacterId)?.name ?? null
            : null,
        });
      }
    }

    // Only characters that appear in events, sorted by appearance order
    const rows = characters.filter(c => charIdSet.has(c.id));

    return { chapters: chs, charRows: rows, matrix: mat };
  }, [events, characters, activeVolumeId]);

  const handleDotClick = (eventEntry) => {
    setSelectedEventId(eventEntry.eventId);
    if (onEventSelect) {
      const fullEvent = events.find(e => e.id === eventEntry.eventId);
      if (fullEvent) onEventSelect(fullEvent);
    }
  };

  const handleDotHover = (entry, e) => {
    if (!e) { setHovered(null); return; }
    const rect = e.currentTarget.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect();
    setHovered({
      eventId: entry.eventId,
      title: entry.title,
      x: rect.left - (containerRect?.left ?? 0) + rect.width / 2,
      y: rect.top  - (containerRect?.top ?? 0)  - 4,
    });
  };

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 4);
  };

  useEffect(() => { updateScrollState(); });

  const scrollBy = (dir) => {
    const el = containerRef.current;
    if (el) el.scrollBy({ left: dir * SCROLL_STEP, behavior: 'smooth' });
  };

  if (!chapters.length) return null;

  return (
    <div className="flex flex-col" style={{ backgroundColor: 'rgba(11,22,33,0.97)' }}>

      {/* ── Matrix grid ── */}
      <div className="relative">
      <div ref={containerRef} className="overflow-x-auto overflow-y-hidden no-scrollbar relative" style={{ maxHeight: '35vh' }}
        onScroll={updateScrollState}
      >

        {/* Tooltip */}
        {hovered && (
          <div
            className="absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-slate-200 whitespace-nowrap"
            style={{
              left: hovered.x,
              top: hovered.y,
              transform: 'translate(-50%, -100%)',
              backgroundColor: 'rgba(8,14,30,0.97)',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {hovered.title}
          </div>
        )}

        <table className="border-collapse" style={{ minWidth: CHAR_COL_W + chapters.length * CH_COL_W }}>

          {/* ── Header row: chapter columns ── */}
          <thead>
            <tr>
              <th
                className="sticky left-0 top-0 z-20 text-left px-3 py-2"
                style={{ width: CHAR_COL_W, minWidth: CHAR_COL_W, backgroundColor: 'rgba(11,22,33,0.99)' }}
              />
              {chapters.map(ch => (
                <th
                  key={ch.number}
                  className="sticky top-0 z-10 px-2 py-2 text-center align-bottom"
                  style={{ width: CH_COL_W, minWidth: CH_COL_W, backgroundColor: 'rgba(11,22,33,0.99)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                >
                  <p className="text-[9px] font-mono uppercase tracking-wider text-slate-600">
                    {t('timeline.chapter', { n: ch.number })}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate max-w-[120px] mx-auto mt-0.5" title={ch.title}>
                    {ch.title}
                  </p>
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body: character rows ── */}
          <tbody>
            {charRows.map(char => {
              const charEvents = matrix.get(char.id);
              return (
                <tr key={char.id} className="group">
                  {/* Character label — sticky left */}
                  <td
                    className="sticky left-0 z-10 px-3 py-2"
                    style={{ backgroundColor: 'rgba(11,22,33,0.99)', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />
                      <span className="text-xs font-semibold truncate" style={{ color: char.color }}>
                        {char.name}
                      </span>
                    </div>
                  </td>

                  {/* Cells — one per chapter */}
                  {chapters.map(ch => {
                    const entries = charEvents?.get(ch.number) ?? [];
                    return (
                      <td
                        key={ch.number}
                        className="px-2 py-2 text-center"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', borderLeft: '1px solid rgba(255,255,255,0.03)' }}
                      >
                        {entries.length > 0 && (
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {entries.map(entry => {
                              const isSelected = selectedEventId === entry.eventId;
                              return (
                                <button
                                  key={entry.eventId}
                                  onClick={() => handleDotClick(entry)}
                                  onMouseEnter={(e) => handleDotHover(entry, e)}
                                  onMouseLeave={() => setHovered(null)}
                                  className={`rounded-full flex-shrink-0 transition-all duration-200 hover:scale-150 ${
                                    isSelected ? 'w-4 h-4 scale-125' : 'w-3 h-3'
                                  }`}
                                  style={{
                                    backgroundColor: entry.isPov ? char.color : 'transparent',
                                    border: isSelected
                                      ? '3px solid #fff'
                                      : `2px solid ${char.color}`,
                                    opacity: isSelected ? 1 : 0.7,
                                    boxShadow: isSelected
                                      ? `0 0 10px ${char.color}, 0 0 20px ${char.color}40`
                                      : 'none',
                                  }}
                                  title={entry.title}
                                />
                              );
                            })}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Fade left */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-10 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to right, rgba(5,10,18,0.95), transparent)' }} />
      )}
      {/* Fade right */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-10 pointer-events-none z-10"
          style={{ background: 'linear-gradient(to left, rgba(5,10,18,0.95), transparent)' }} />
      )}

      {/* Arrow left */}
      {canScrollLeft && (
        <button
          onClick={() => scrollBy(-1)}
          className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: 'rgba(63,81,181,0.3)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
        >
          ‹
        </button>
      )}
      {/* Arrow right */}
      {canScrollRight && (
        <button
          onClick={() => scrollBy(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ backgroundColor: 'rgba(63,81,181,0.3)', border: '1px solid rgba(99,102,241,0.4)', color: '#818cf8' }}
        >
          ›
        </button>
      )}
      </div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-6 px-6 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#94a3b8' }} />
          <span className="text-[10px] text-slate-500">{t('map.povLegend', 'POV principal')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border-2" style={{ borderColor: '#94a3b8', backgroundColor: 'transparent' }} />
          <span className="text-[10px] text-slate-500">{t('map.presenceLegend', 'Présent dans la scène')}</span>
        </div>
      </div>
    </div>
  );
}
