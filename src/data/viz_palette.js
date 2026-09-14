// ── Palette data-viz unifiée ──────────────────────────────────────────────────
// Source unique de vérité pour TOUTES les couleurs de données de l'app
// (frise Save the Cat, arc émotionnel, Voyage du Héros).
//
// Dérivée de l'identité « Maison d'édition » (vert sauge / or / encre, cf.
// src/index.css) et VALIDÉE avec la skill « dataviz » (scripts/validate_palette.js) :
// CVD ≥ 12, chroma, bande de clarté, contraste — ALL PASS sur la surface carte
// sombre (#21252c). L'app est dark-only : une seule colonne de valeurs.
//
// Principe (dataviz) : la couleur suit le JOB, jamais un arc-en-ciel générique.
//   • Catégoriel = identité   → teintes en ordre fixe, jamais cyclées
//   • Séquentiel = magnitude  → une seule teinte, clair→foncé
//   • Statut     = état        → réservé au sémantique (alertes), jamais une série
//
// ⚠️ Les valeurs restent des chaînes hex : de nombreux composants concatènent
//    l'alpha (`${color}20`, `color + '65'`). Ne pas remplacer par des var(--x).

// ── Catégoriel — identité (actes STC, phases du Voyage du Héros) ───────────────
// Ordre fixe (vert → or → ardoise). L'ordre EST le mécanisme de sécurité CVD :
// worst adjacent ΔE 26.9 (protan) sur fond #21252c. Ne jamais réordonner ni cycler.
export const VIZ_CATEGORICAL = ['#3aa981', '#b5871f', '#5a8fc9'];

// ── Séquentiel — magnitude (intensité de l'arc émotionnel) ────────────────────
// Une seule teinte (or), clair→foncé. Monotone, extrémité foncée à 4.19:1 vs surface.
export const VIZ_SEQUENTIAL = ['#e6cf93', '#d8b662', '#c49a3a', '#a87f22'];

// ── Statut — réservé au sémantique (état bon / attention / critique) ──────────
// Source UNIQUE des couleurs d'état : scores, sévérités, alertes, complet/incomplet.
// Rouge franc (choix produit). Ne JAMAIS réutiliser comme couleur de série ni
// comme accent de marque (le vert de marque #5cae8e reste distinct, réservé à l'UI).
export const VIZ_STATUS = {
  ok:      '#10b981', // bon / complet / résolu
  warn:    '#f59e0b', // attention (ambre)
  serious: '#f97316', // sérieux / élevé (orange)
  crit:    '#ef4444', // critique (rouge franc)
  neutral: '#64748b', // faible / neutre
};

// ── Couleurs par type d'entité (catégoriel — identité) ────────────────────────
// 4 teintes validées CVD ensemble sur fond #21252c (worst adjacent ΔE ≥ 12).
// character=vert, object=or, location=ardoise, group=rose. Sert de FALLBACK :
// une entité qui porte sa propre couleur (personnages, groupes seedés) la garde.
export const ENTITY_VIZ = {
  character: VIZ_CATEGORICAL[0], // vert
  object:    VIZ_CATEGORICAL[1], // or
  location:  VIZ_CATEGORICAL[2], // ardoise
  group:     '#b56e9e',          // rose (4e teinte, distincte de l'ardoise en daltonisme)
};

// ── Actes Save the Cat (répartition Blake Snyder 5 / 7 / 3) ───────────────────
// Acte I : beats 1-5 · Acte II : 6-12 (basculement → nuit noire) · Acte III : 13-15
export const STC_ACTS = [
  { id: 'act1', from: 1,  to: 5,  color: VIZ_CATEGORICAL[0] },
  { id: 'act2', from: 6,  to: 12, color: VIZ_CATEGORICAL[1] },
  { id: 'act3', from: 13, to: 15, color: VIZ_CATEGORICAL[2] },
];

/** Couleur catégorielle d'un beat STC d'après son numéro (1-15). */
export function actColorForBeatNumber(n) {
  const act = STC_ACTS.find(a => n >= a.from && n <= a.to);
  return (act ?? STC_ACTS[0]).color;
}

/**
 * Rampe séquentielle : intensité moyenne (1-10) → une teinte or.
 * Conserve les paliers historiques (<3 / 3-5 / 5-7 / ≥7) mais mono-teinte.
 */
export function seqColor(avg) {
  if (!avg)      return VIZ_SEQUENTIAL[0];
  if (avg >= 7)  return VIZ_SEQUENTIAL[3];
  if (avg >= 5)  return VIZ_SEQUENTIAL[2];
  if (avg >= 3)  return VIZ_SEQUENTIAL[1];
  return VIZ_SEQUENTIAL[0];
}
