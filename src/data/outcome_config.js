export const OUTCOMES = [
  { id: 'success',     label: 'Succès',     color: '#22c55e', icon: '✓' },
  { id: 'failure',     label: 'Échec',      color: '#ef4444', icon: '✗' },
  { id: 'disaster',    label: 'Désastre',   color: '#f97316', icon: '↯' },
  { id: 'revelation',  label: 'Révélation', color: '#a855f7', icon: '◉' },
  { id: 'mixed',       label: 'Mitigé',     color: '#eab308', icon: '~' },
];

export const OUTCOME_MAP = Object.fromEntries(OUTCOMES.map(o => [o.id, o]));
