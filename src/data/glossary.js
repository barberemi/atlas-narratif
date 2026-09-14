// ── Glossaire des termes narratifs ────────────────────────────────────────────
// Filet terminologique : id → { label, def }. Texte FR (l'app est FR par défaut,
// cf. beats_config.js). Consommé par src/components/ui/Term.jsx.
export const GLOSSARY = {
  beat:        { label: 'Beat',            def: "Unité de structure Save the Cat : un moment-clé du récit (ex. « Élément déclencheur »). 15 beats jalonnent l'histoire." },
  stc:         { label: 'Save the Cat',    def: "Méthode de structure en 15 beats de Blake Snyder, du scénario au roman." },
  pov:         { label: 'POV',             def: "Point de vue (Point Of View) : le personnage à travers les yeux duquel une scène est racontée." },
  plant:       { label: 'Amorce',          def: "Élément semé tôt dans le récit (objet, réplique, détail) destiné à « payer » plus tard." },
  payoff:      { label: 'Payoff',          def: "Résolution d'une amorce : le moment où l'élément semé plus tôt prend tout son sens." },
  arc:         { label: 'Arc émotionnel',  def: "Courbe d'intensité émotionnelle du récit, chapitre par chapitre." },
  heroJourney: { label: 'Voyage du Héros', def: "Structure en 12 étapes de Joseph Campbell : Départ, Initiation, Retour." },
  thread:      { label: 'Fil narratif',    def: "Sous-intrigue suivie en parallèle de l'intrigue principale (subplot)." },
  anatomy:     { label: 'Anatomie de scène', def: "Décomposition d'une scène en objectif / conflit / issue." },
  volume:      { label: 'Tome',            def: "Un livre de la série ; permet de filtrer les vues par tome." },
};
