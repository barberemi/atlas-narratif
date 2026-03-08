import { useMemo, useState } from 'react';
import { BEATS, chaptersDB, generateAlerts } from '../../data/save_the_cat_database';
import { useDragScroll } from '../../hooks/useDragScroll';
import Frise from './Frise';
import AlertCard from './AlertCard';
import BeatRow from './BeatRow';
import ChapterCard from './ChapterCard';

// ── SaveTheCat ─────────────────────────────────────────────────────────────────
export default function SaveTheCat() {
  const [hoveredBeat, setHoveredBeat] = useState(null);
  const dragScroll = useDragScroll();

  const alerts = useMemo(() => generateAlerts(), []);

  const alertBeatIds = useMemo(() => new Set(alerts.map(a => a.beat.id)), [alerts]);

  const beatChapterMap = useMemo(() => {
    const map = {};
    chaptersDB.forEach(ch => ch.beats.forEach(id => { map[id] = ch; }));
    return map;
  }, []);

  const placedCount   = BEATS.filter(b => beatChapterMap[b.id]).length;
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount  = alerts.filter(a => a.severity !== 'critical').length;

  return (
    <div className="min-h-full w-full flex flex-col bg-[#0B1621] text-slate-200">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="text-center flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Save the <span style={{ color: '#f97316' }}>Cat</span>
          </h1>
          <p className="text-sm text-slate-500 font-serif italic">
            {chaptersDB.length} chapitres · {placedCount}/{BEATS.length} beats placés
            {criticalCount > 0 && (
              <span style={{ color: '#ef4444' }}>
                {' '}· {criticalCount} alerte{criticalCount > 1 ? 's' : ''} critique{criticalCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span style={{ color: '#fbbf24' }}>
                {' '}· {warningCount} attention{warningCount > 1 ? 's' : ''}
              </span>
            )}
          </p>
        </div>
      </header>

      {/* ── Légende ── */}
      <div
        className="flex items-center gap-6 justify-center px-8 py-2 border-b border-white/5 flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="inline-block rounded-full border"
            style={{ width: 12, height: 12, backgroundColor: 'rgba(129,140,248,0.15)', borderColor: 'rgba(129,140,248,0.55)' }}
          />
          Beat placé (position réelle)
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span
            className="inline-block"
            style={{ width: 10, height: 10, transform: 'rotate(45deg)', border: '1.5px solid rgba(129,140,248,0.5)', backgroundColor: 'rgba(129,140,248,0.15)' }}
          />
          Position idéale
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span style={{ color: '#fbbf24' }}>⚠</span>
          Déviation
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <span style={{ color: '#ef4444' }}>⛔</span>
          Critique
        </span>
      </div>

      {/* ── Frise ── */}
      <div className="px-10 pt-6 pb-2 flex-shrink-0">
        <Frise
          alerts={alerts}
          hoveredBeat={hoveredBeat}
          onHoverBeat={setHoveredBeat}
        />
      </div>

      {/* ── Section chapitres ── */}
      <div className="border-t border-white/5 px-5 py-4 flex-shrink-0" style={{ background: 'rgba(0,0,0,0.1)' }}>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
          Chapitres <span className="font-normal text-slate-700">({chaptersDB.length})</span>
        </p>
        <div
          ref={dragScroll.ref}
          className="flex gap-3 overflow-x-auto no-scrollbar pb-1"
          style={{ cursor: 'grab' }}
          onMouseDown={dragScroll.onMouseDown}
          onMouseMove={dragScroll.onMouseMove}
          onMouseUp={dragScroll.onMouseUp}
          onMouseLeave={dragScroll.onMouseLeave}
        >
          {chaptersDB.map(ch => (
            <ChapterCard
              key={ch.id}
              chapter={ch}
              alertBeatIds={alertBeatIds}
              hasDragged={dragScroll.hasDragged}
            />
          ))}
        </div>
      </div>

      {/* ── Panels bas ── */}
      <div className="flex-1 flex min-h-0 border-t border-white/5">

        {/* Alertes */}
        <div className="flex-1 p-5 border-r border-white/5 overflow-y-auto no-scrollbar">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Alertes narratives
            {alerts.length > 0 && (
              <span className="ml-2 font-normal text-slate-600">({alerts.length})</span>
            )}
          </p>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">✓</span>
              <p className="text-base text-slate-400 font-bold">Structure narrative solide !</p>
              <p className="text-sm text-slate-600 font-serif italic">Tous les beats sont bien placés dans les intervalles recommandés.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {alerts.filter(a => a.severity === 'critical').map((a, i) => (
                <AlertCard key={`crit-${i}`} alert={a} isHovered={hoveredBeat === a.beat.id} onHover={setHoveredBeat} />
              ))}
              {alerts.filter(a => a.severity !== 'critical').map((a, i) => (
                <AlertCard key={`warn-${i}`} alert={a} isHovered={hoveredBeat === a.beat.id} onHover={setHoveredBeat} />
              ))}
            </div>
          )}
        </div>

        {/* Checklist beats */}
        <div className="w-80 flex-shrink-0 p-5 overflow-y-auto no-scrollbar">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Les 15 beats
          </p>
          <div className="space-y-1">
            {BEATS.map(beat => (
              <BeatRow
                key={beat.id}
                beat={beat}
                chapter={beatChapterMap[beat.id] || null}
                isAlert={alertBeatIds.has(beat.id)}
                isHovered={hoveredBeat === beat.id}
                onHover={setHoveredBeat}
              />
            ))}
          </div>

          <div
            className="mt-5 p-4 rounded-xl text-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs text-slate-600 uppercase tracking-widest mb-1">Couverture</p>
            <p className="text-3xl font-black" style={{ color: placedCount === 15 ? '#10b981' : '#fbbf24' }}>
              {placedCount}<span className="text-sm font-normal text-slate-600">/15</span>
            </p>
            <div className="w-full h-2 rounded-full mt-3" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${(placedCount / 15) * 100}%`,
                  backgroundColor: placedCount === 15 ? '#10b981' : '#fbbf24',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
