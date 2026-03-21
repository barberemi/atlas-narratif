import { useState, useMemo } from 'react';
import { BEATS } from '../../data/beats_config';

const FRISE_H   = 340;
const BAR_TOP   = 225;
const BAR_H     = 10;
const BEAT_SIZE = 28;
const BEAT_STEP = 34;

export default function Frise({ chapters, alerts, hoveredBeat, onHoverBeat }) {
  const [hoveredChapterId, setHoveredChapterId] = useState(null);

  const total = chapters.length;
  const getChapterPercent = (n) => ((n - 1 + 0.5) / total) * 100;
  const getBeatActualPercent = (beatId) => {
    const ch = chapters.find(c => c.beats.includes(beatId));
    return ch ? ((ch.number - 1 + 0.5) / total) * 100 : null;
  };

  const alertBeatIds = useMemo(() => new Set(alerts.map(a => a.beat.id)), [alerts]);

  const beatsByChapter = useMemo(() => {
    const map = {};
    chapters.forEach(ch => {
      map[ch.number] = ch.beats
        .map(id => BEATS.find(b => b.id === id))
        .filter(Boolean);
    });
    return map;
  }, [chapters]);

  return (
    <div className="relative w-full select-none" style={{ height: FRISE_H }}>

      {/* ── Zones de fond par acte ── */}
      {[
        { from: 0,  to: 25,  label: 'Acte I',   color: 'rgba(99,102,241,0.04)' },
        { from: 25, to: 75,  label: 'Acte II',  color: 'rgba(234,179,8,0.04)'  },
        { from: 75, to: 100, label: 'Acte III', color: 'rgba(239,68,68,0.04)'  },
      ].map(({ from, to, label, color }) => (
        <div
          key={label}
          className="absolute"
          style={{
            left: `${from}%`, width: `${to - from}%`,
            top: 0, height: BAR_TOP + BAR_H,
            backgroundColor: color,
            borderRight: to < 100 ? '1px dashed rgba(255,255,255,0.06)' : 'none',
          }}
        >
          <span
            className="absolute text-[11px] font-mono tracking-widest uppercase"
            style={{ bottom: BAR_H + 6, left: 8, color: 'rgba(255,255,255,0.15)' }}
          >
            {label}
          </span>
        </div>
      ))}

      {/* ── Chapitres : lignes verticales + labels ── */}
      {chapters.map((ch) => {
        const x       = getChapterPercent(ch.number);
        const chBeats = beatsByChapter[ch.number] || [];
        const lineTop = chBeats.length > 0
          ? BAR_TOP - chBeats.length * BEAT_STEP - 12
          : BAR_TOP - 20;

        const isChHovered = hoveredChapterId === ch.id;
        const chHasAlert  = (beatsByChapter[ch.number] || []).some(b => alertBeatIds.has(b.id));

        return (
          <div key={ch.id}>
            <div
              className="absolute"
              style={{
                left: `${x}%`, top: lineTop,
                height: BAR_TOP - lineTop,
                width: 1,
                backgroundColor: isChHovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.07)',
                transform: 'translateX(-0.5px)',
                transition: 'background-color 0.15s',
              }}
            />
            <div
              className="absolute text-[11px] font-mono text-center whitespace-nowrap font-semibold cursor-default"
              style={{
                left: `${x}%`, top: lineTop - 18,
                transform: 'translateX(-50%)',
                color: isChHovered ? '#e2e8f0' : chHasAlert ? 'rgba(251,191,36,0.7)' : 'rgba(148,163,184,0.6)',
                transition: 'color 0.15s',
                zIndex: 20,
              }}
              onMouseEnter={() => setHoveredChapterId(ch.id)}
              onMouseLeave={() => setHoveredChapterId(null)}
            >
              Ch.{ch.number}
            </div>

            {/* Tooltip chapitre */}
            {isChHovered && (
              <div
                className="absolute z-30 pointer-events-none"
                style={{
                  left: `${x}%`,
                  top: 4,
                  transform: x > 70 ? 'translateX(-90%)' : x < 15 ? 'translateX(-10%)' : 'translateX(-50%)',
                  width: 220,
                }}
              >
                <div
                  className="rounded-xl p-3 space-y-2"
                  style={{
                    backgroundColor: 'rgba(11,22,33,0.97)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(12px)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded font-bold"
                      style={{ backgroundColor: 'rgba(63,81,181,0.25)', color: '#818cf8' }}
                    >
                      Ch.{ch.number}
                    </span>
                    <span className="text-xs font-bold text-slate-200 leading-snug">{ch.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-serif italic">
                    {ch.summary.length > 120 ? ch.summary.slice(0, 120) + '…' : ch.summary}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-white/5">
                    {(beatsByChapter[ch.number] || []).map(beat => (
                      <span
                        key={beat.id}
                        className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: `${beat.color}18`,
                          color: alertBeatIds.has(beat.id) ? '#fbbf24' : beat.color,
                          border: `1px solid ${alertBeatIds.has(beat.id) ? 'rgba(251,191,36,0.3)' : beat.color + '40'}`,
                        }}
                      >
                        {beat.number}. {beat.label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {chBeats.map((beat, bi) => {
              const circleTop = BAR_TOP - (bi + 1) * BEAT_STEP - 4;
              const isAlert   = alertBeatIds.has(beat.id);
              const isHovered = hoveredBeat === beat.id;

              return (
                <div key={beat.id}>
                  {bi === 0 && (
                    <div
                      className="absolute"
                      style={{
                        left: `${x}%`,
                        top: circleTop + BEAT_SIZE,
                        height: BAR_TOP - (circleTop + BEAT_SIZE),
                        width: 1,
                        backgroundColor: `${beat.color}35`,
                        transform: 'translateX(-0.5px)',
                      }}
                    />
                  )}
                  <div
                    className="absolute flex items-center justify-center rounded-full font-bold cursor-default transition-all duration-150"
                    style={{
                      left: `${x}%`,
                      top: circleTop,
                      width: BEAT_SIZE,
                      height: BEAT_SIZE,
                      transform: 'translateX(-50%)',
                      backgroundColor: `${beat.color}15`,
                      border: `2px solid ${isAlert ? '#fbbf24' : beat.color + (isHovered ? 'cc' : '60')}`,
                      boxShadow: isHovered
                        ? `0 0 16px ${beat.color}70`
                        : isAlert
                          ? `0 0 10px rgba(251,191,36,0.4)`
                          : `0 0 8px ${beat.color}25`,
                      color: isAlert ? '#fbbf24' : beat.color,
                      fontSize: 11,
                      zIndex: 10,
                    }}
                    title={`${beat.number}. ${beat.label}${isAlert ? ' ⚠' : ''}`}
                    onMouseEnter={() => onHoverBeat(beat.id)}
                    onMouseLeave={() => onHoverBeat(null)}
                  >
                    {beat.number}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}

      {/* ── La Barre ── */}
      <div className="absolute left-0 right-0" style={{ top: BAR_TOP, height: BAR_H }}>
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(to right, #6366f1 0%, #10b981 35%, #facc15 50%, #f97316 70%, #ef4444 82%, #ec4899 100%)',
            opacity: 0.3,
          }}
        />
        <div
          className="absolute inset-0 rounded-full"
          style={{ border: '1px solid rgba(255,255,255,0.12)' }}
        />
        {[0, 10, 25, 50, 75, 90, 100].map(p => (
          <div
            key={p}
            className="absolute top-0 bottom-0"
            style={{
              left: `${p}%`, width: 1,
              backgroundColor: 'rgba(255,255,255,0.2)',
              transform: 'translateX(-0.5px)',
            }}
          />
        ))}
      </div>

      {/* ── Marqueurs idéaux (diamants sous la barre) ── */}
      {BEATS.map(beat => {
        const isHovered = hoveredBeat === beat.id;
        const hasActual = getBeatActualPercent(beat.id) !== null;
        return (
          <div
            key={`ideal-${beat.id}`}
            className="absolute cursor-default"
            style={{
              left: `${beat.idealPercent}%`,
              top: BAR_TOP + BAR_H + 12,
              transform: 'translateX(-50%)',
            }}
            title={`${beat.number}. ${beat.label} — idéal : ${beat.idealPercent}%`}
            onMouseEnter={() => onHoverBeat(beat.id)}
            onMouseLeave={() => onHoverBeat(null)}
          >
            <div
              style={{
                width: 10, height: 10,
                transform: 'rotate(45deg)',
                backgroundColor: isHovered ? `${beat.color}55` : `${beat.color}20`,
                border: `1.5px solid ${isHovered ? beat.color : beat.color + '50'}`,
                transition: 'all 0.15s',
              }}
            />
            {!hasActual && (
              <div
                className="absolute text-[10px] font-mono"
                style={{ top: 14, left: '50%', transform: 'translateX(-50%)', color: '#475569' }}
              >
                ?
              </div>
            )}
          </div>
        );
      })}

      {/* ── Labels % ── */}
      {[0, 25, 50, 75, 100].map(p => (
        <div
          key={p}
          className="absolute font-mono font-semibold"
          style={{
            left: `${p}%`, top: BAR_TOP + BAR_H + 32,
            transform: 'translateX(-50%)',
            color: 'rgba(100,116,139,0.8)',
            fontSize: 11,
          }}
        >
          {p}%
        </div>
      ))}

      {/* ── Labels beats clés sous les diamants ── */}
      {BEATS.filter(b => [1, 4, 6, 9, 11, 13, 15].includes(b.number)).map(beat => (
        <div
          key={`label-${beat.id}`}
          className="absolute text-center pointer-events-none"
          style={{
            left: `${beat.idealPercent}%`,
            top: BAR_TOP + BAR_H + 54,
            transform: 'translateX(-50%)',
            color: hoveredBeat === beat.id ? beat.color : `${beat.color}65`,
            fontSize: 10,
            maxWidth: 64,
            lineHeight: 1.3,
            whiteSpace: 'nowrap',
            transition: 'color 0.15s',
          }}
        >
          {beat.label.split(' ').slice(0, 2).join(' ')}
        </div>
      ))}
    </div>
  );
}
