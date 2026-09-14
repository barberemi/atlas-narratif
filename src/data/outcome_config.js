export const OUTCOMES = [
  { id: 'success',     label: 'Succès',     color: '#22c55e', icon: 'check' },
  { id: 'failure',     label: 'Échec',      color: '#ef4444', icon: 'critical' },
  { id: 'disaster',    label: 'Désastre',   color: '#f97316', icon: 'death' },
  { id: 'revelation',  label: 'Révélation', color: '#a855f7', icon: 'sparkles' },
  { id: 'mixed',       label: 'Mitigé',     color: '#eab308', icon: 'dot' },
];

export const OUTCOME_MAP = Object.fromEntries(OUTCOMES.map(o => [o.id, o]));
