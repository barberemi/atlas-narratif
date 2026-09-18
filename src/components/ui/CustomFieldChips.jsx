/**
 * Affiche en lecture seule les champs custom (couche 2) d'une entité, sous
 * forme de petites puces « clé : valeur ». Rien n'est rendu si vide.
 */
function displayVal(v) {
  if (Array.isArray(v)) return v.join(', ');
  if (v && typeof v === 'object') return JSON.stringify(v);
  return v ?? '';
}

export default function CustomFieldChips({ fields, max = 6 }) {
  const entries = Object.entries(fields ?? {}).filter(([, v]) => displayVal(v) !== '');
  if (entries.length === 0) return null;

  const shown = entries.slice(0, max);
  const rest = entries.length - shown.length;

  return (
    <div className="flex flex-wrap gap-1" data-testid="custom-field-chips">
      {shown.map(([key, val]) => (
        <span
          key={key}
          className="text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1"
          style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--color-atlas-soft)', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          <span className="font-bold opacity-70">{key}</span>
          <span className="truncate max-w-[120px]">{displayVal(val)}</span>
        </span>
      ))}
      {rest > 0 && (
        <span className="text-[10px] px-1.5 py-0.5 text-atlas-mute">+{rest}</span>
      )}
    </div>
  );
}
