export default function RecommendationRow({ icon, color, label, action, actionLabel }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ backgroundColor: `${color}08`, border: `1px solid ${color}20` }}
    >
      <span className="text-base flex-shrink-0">{icon}</span>
      <span className="text-sm text-slate-300 flex-1">{label}</span>
      <button
        onClick={action}
        className="text-xs font-black px-3 py-1.5 rounded-lg flex-shrink-0 transition-all duration-150"
        style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}35` }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = `${color}28`; }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${color}18`; }}
      >
        {actionLabel} →
      </button>
    </div>
  );
}
