import Icon from '../ui/Icon';

export default function RecommendationRow({ icon, color, label, action, actionLabel }) {
  return (
    <div
      className="flex items-center gap-3 pl-4 py-3"
      style={{ borderLeft: `2px solid ${color}`, borderBottom: '1px solid var(--color-atlas-line)' }}
    >
      <Icon name={icon} size={16} className="flex-shrink-0" style={{ color }} />
      <span className="text-sm text-atlas-soft flex-1">{label}</span>
      <button
        onClick={action}
        className="font-grotesk text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 flex-shrink-0 transition-colors duration-150"
        style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${color}28`; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${color}18`; }}
      >
        {actionLabel} →
      </button>
    </div>
  );
}
