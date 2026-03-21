// ── Configuration des sévérités d'incohérences ────────────────────────────────
// Utilisé par les composants UI pour les couleurs, labels et tri.
// Indépendant de tout projet narratif.

/** Retourne la sévérité la plus haute parmi une liste d'incohérences */
export function getMaxSeverity(incs) {
  if (!incs.length) return null;
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return incs.reduce((best, inc) =>
    order[inc.severity] < order[best] ? inc.severity : best,
    incs[0].severity
  );
}

export const SEVERITY_CONFIG = {
  critical: { label: 'Critique',  color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
  high:     { label: 'Élevée',    color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.3)'  },
  medium:   { label: 'Moyenne',   color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  low:      { label: 'Faible',    color: '#64748B', bg: 'rgba(100,116,139,0.12)', border: 'rgba(100,116,139,0.3)' },
};

export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
