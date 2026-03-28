export default function SourceBadge({ source }) {
  if (!source || source === 'import') return null;
  const label = source === 'manual' ? '✏️ Manuel' : '📄✏️ Modifié';
  return (
    <div
      className="absolute bottom-2 right-2 text-[9px] px-1.5 py-0.5 rounded font-bold z-10"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {label}
    </div>
  );
}
