export default function StatCard({ icon, value, label, sub }) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <span className="text-lg">{icon}</span>
      <span className="text-3xl font-black text-white leading-none">{value}</span>
      <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</span>
      {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
    </div>
  );
}
