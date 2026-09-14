import Icon from '../ui/Icon';

export default function StatCard({ icon, value, label, sub }) {
  return (
    <div
      className="pt-4 flex flex-col gap-1"
      style={{ borderTop: '1px solid var(--color-atlas-line)' }}
    >
      <Icon name={icon} size={18} className="text-atlas-soft" />
      <span className="font-serif text-3xl font-semibold text-atlas-text leading-none">{value}</span>
      <span className="font-grotesk text-[11px] text-atlas-mute font-bold uppercase tracking-[0.12em]">{label}</span>
      {sub && <span className="text-[10px] text-atlas-mute">{sub}</span>}
    </div>
  );
}
