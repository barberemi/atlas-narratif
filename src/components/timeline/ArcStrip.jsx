import { useMemo } from 'react';
import { seqColor as arcColor } from '../../data/viz_palette';

const COL_W    = 290;
const STRIP_H  = 60;
const STRIP_PY = 8;

function stripY(intensity) {
  return STRIP_PY + ((10 - intensity) / 9) * (STRIP_H - STRIP_PY * 2);
}

function arcSmoothPath(pts) {
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
  const d = [`M ${pts[0].x} ${pts[0].y}`];
  for (let i = 1; i < pts.length; i++) {
    const cp = (pts[i - 1].x + pts[i].x) / 2;
    d.push(`C ${cp},${pts[i - 1].y} ${cp},${pts[i].y} ${pts[i].x},${pts[i].y}`);
  }
  return d.join(' ');
}

export { COL_W };

export default function ArcStrip({ chapters, arcPoints }) {
  const totalW = chapters.length * COL_W;

  const intensityMap = useMemo(
    () => new Map((arcPoints ?? []).map(p => [p.chapterNumber, p.intensity])),
    [arcPoints],
  );

  const pts = useMemo(() => chapters.map((ch, i) => {
    const intensity = intensityMap.get(ch.number) ?? null;
    return { number: ch.number, intensity, x: i * COL_W + COL_W / 2, y: intensity != null ? stripY(intensity) : null };
  }), [chapters, intensityMap]);

  const definedPts = pts.filter(p => p.y !== null);
  const linePath   = arcSmoothPath(definedPts.map(p => ({ x: p.x, y: p.y })));
  const areaPath   = definedPts.length
    ? `${linePath} L ${definedPts.at(-1).x},${STRIP_H} L ${definedPts[0].x},${STRIP_H} Z`
    : '';

  const avg   = definedPts.length ? definedPts.reduce((s, p) => s + p.intensity, 0) / definedPts.length : null;
  const color = arcColor(avg);

  return (
    <div style={{ width: totalW, height: STRIP_H, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative' }}>
      <svg width={totalW} height={STRIP_H} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="arc-strip-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {chapters.map((_, i) => i > 0 && (
          <line key={i} x1={i * COL_W} y1={0} x2={i * COL_W} y2={STRIP_H} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}

        {areaPath && <path d={areaPath} fill="url(#arc-strip-fill)" />}
        {linePath && <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />}

        {definedPts.map(pt => (
          <g key={pt.number}>
            <circle cx={pt.x} cy={pt.y} r={3} fill="#15171b" stroke={color} strokeWidth="1.5" />
            <text x={pt.x} y={pt.y < 18 ? pt.y + 14 : pt.y - 6} textAnchor="middle" fontSize="9" fontWeight="700" fill={color} style={{ pointerEvents: 'none' }}>
              {pt.intensity}
            </text>
          </g>
        ))}

        {pts.filter(p => p.y === null).map(pt => (
          <circle key={pt.number} cx={pt.x} cy={STRIP_H - 6} r={2} fill="transparent" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="2,2" />
        ))}
      </svg>

      <span className="absolute top-1 left-2 text-[9px] uppercase tracking-widest font-bold pointer-events-none" style={{ color: `${color}90` }}>
        Arc émotionnel
      </span>
    </div>
  );
}
