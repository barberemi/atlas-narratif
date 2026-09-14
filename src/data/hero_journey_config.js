// Phases du Voyage du Héros = encodage catégoriel (identité) → palette unifiée.
// Même triade vert/or/ardoise que les actes Save the Cat (cf. viz_palette).
import { VIZ_CATEGORICAL } from './viz_palette';

export const HERO_PHASES = [
  { id: 'departure',   label: 'Départ',      color: VIZ_CATEGORICAL[0] },
  { id: 'initiation',  label: 'Initiation',  color: VIZ_CATEGORICAL[1] },
  { id: 'return',      label: 'Retour',      color: VIZ_CATEGORICAL[2] },
];

export const HERO_STAGES = [
  // Départ
  { key: 'ordinary_world',       phase: 'departure',  label: 'Monde Ordinaire',           icon: 'ordinaryWorld', desc: "Le héros est montré dans son environnement habituel. On découvre qui il est, ses forces, ses faiblesses, ses désirs." },
  { key: 'call_to_adventure',    phase: 'departure',  label: "Appel à l'Aventure",         icon: 'call', desc: "Un événement bouleverse l'équilibre du monde ordinaire et lance un défi ou une quête au héros." },
  { key: 'refusal',              phase: 'departure',  label: "Refus de l'Appel",           icon: 'refusal', desc: "Le héros hésite, craint l'inconnu ou se sent indigne. Cette résistance renforce l'enjeu." },
  { key: 'mentor',               phase: 'departure',  label: 'Rencontre du Mentor',        icon: 'mentor', desc: "Un guide expérimenté prépare le héros, lui offre conseils, objets magiques ou confiance en soi." },
  { key: 'threshold',            phase: 'departure',  label: 'Franchissement du Seuil',   icon: 'threshold', desc: "Le héros quitte définitivement son monde ordinaire et s'engage dans l'aventure. Point de non-retour." },
  // Initiation
  { key: 'tests',                phase: 'initiation', label: 'Épreuves & Alliés',         icon: 'tests', desc: "Le héros fait face à des obstacles, rencontre des alliés et identifie ses ennemis. Il apprend les règles du nouveau monde." },
  { key: 'inmost_cave',          phase: 'initiation', label: 'Approche de la Caverne',    icon: 'cave', desc: "Le héros s'approche du lieu le plus dangereux ou affronte la peur la plus profonde. Préparation à l'épreuve centrale." },
  { key: 'ordeal',               phase: 'initiation', label: 'Épreuve Suprême',           icon: 'ordeal', desc: "Crise majeure : le héros affronte sa mort (réelle ou symbolique). Moment le plus sombre — tout peut basculer." },
  { key: 'reward',               phase: 'initiation', label: 'Récompense',                icon: 'reward', desc: "Après l'épreuve, le héros s'empare de la récompense : objet, connaissance, réconciliation ou transformation intérieure." },
  // Retour
  { key: 'road_back',            phase: 'return',     label: 'Chemin du Retour',          icon: 'roadBack', desc: "Le héros choisit de rentrer dans son monde ordinaire, souvent pourchassé ou avec une nouvelle épreuve en vue." },
  { key: 'resurrection',         phase: 'return',     label: 'Résurrection',              icon: 'resurrection', desc: "Épreuve finale : le héros est purifié par une dernière confrontation. Il renaît transformé, prêt pour le monde ordinaire." },
  { key: 'return_with_elixir',   phase: 'return',     label: "Retour avec l'Élixir",      icon: 'elixir', desc: "Le héros rentre chez lui avec quelque chose de précieux — savoir, amour, liberté — qui bénéficie à tous." },
];

export const HERO_STAGE_MAP = Object.fromEntries(HERO_STAGES.map(s => [s.key, s]));
export const HERO_PHASE_MAP  = Object.fromEntries(HERO_PHASES.map(p => [p.id, p]));
