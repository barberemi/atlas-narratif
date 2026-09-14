import { VIZ_STATUS } from '../../data/viz_palette';

export default function CircularGauge({ score, title, valueLabel }) {
  const R = 70;
  const C = 2 * Math.PI * R;
  const dash = (score / 100) * C;
  const color = score >= 80 ? VIZ_STATUS.ok : score >= 50 ? VIZ_STATUS.warn : score >= 25 ? VIZ_STATUS.serious : VIZ_STATUS.crit;
  const statusLabel = score === 100 ? 'Parfait' : score >= 80 ? 'Bon' : score >= 50 ? 'Moyen' : score >= 25 ? 'Faible' : 'Critique';

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width="160" height="160" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={R} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        <circle
          cx="90" cy="90" r={R} fill="none"
          stroke={color} strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${C - dash}`}
          strokeDashoffset={C / 4}
          style={{ filter: `drop-shadow(0 0 8px ${color})`, transition: 'stroke-dasharray 1s ease' }}
        />
        <circle cx="90" cy="90" r="54" fill={`${color}0d`} />
        <text x="90" y="84" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="28" fontWeight="900">
          {valueLabel ?? score}
        </text>
        <text x="90" y="106" textAnchor="middle" fill={color} fontSize="11" fontWeight="700">
          {statusLabel}
        </text>
      </svg>
      <p className="text-xs text-atlas-mute font-serif italic text-center">{title}</p>
    </div>
  );
}
