export default function SectionTitle({ children }) {
  return (
    <p
      className="font-grotesk text-xs font-bold text-atlas-mute uppercase tracking-[0.2em] pb-2 pt-2"
      style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
    >
      {children}
    </p>
  );
}
