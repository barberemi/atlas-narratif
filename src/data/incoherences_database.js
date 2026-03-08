// Base de données des incohérences narratives détectées par l'IA
// Sévérités : 'critical' | 'high' | 'medium' | 'low'

export const incoherencesDB = [
  {
    id: 'inc_001',
    type: 'Contradiction Temporelle',
    severity: 'critical',
    title: "Gandalf emprisonné à Isengard : avant ou après le Conseil ?",
    explanation:
      "Gandalf est listé comme visiteur d'Isengard (loc_isengard) et y est emprisonné par Saroumane, mais aucune donnée chronologique ne précise si cette capture a eu lieu avant ou après la formation de la Communauté à Fondcombe. Sa présence simultanée comme guide de la Communauté et prisonnier d'Orthanc crée une ambiguïté temporelle non résolue.",
    links: [
      { label: 'Gandalf le Gris', entityId: 'char_gandalf',   entityType: 'character' },
      { label: 'Isengard',        entityId: 'loc_isengard',   entityType: 'location'  },
      { label: 'Fondcombe',       entityId: 'loc_rivendell',  entityType: 'location'  },
    ],
  },
  {
    id: 'inc_002',
    type: 'Entité Non Référencée',
    severity: 'critical',
    title: "Thorin Écu-de-Chêne mentionné mais absent de la base",
    explanation:
      "La Cotte de mailles en Mithril indique qu'elle fut 'offerte à Bilbo par Thorin Écu-de-Chêne', mais Thorin n'existe pas comme entité dans la base de données. Ce personnage crucial est cité dans la description d'un objet sans être référençable, rendant la chaîne de possession incomplète.",
    links: [
      { label: 'Cotte de mailles en Mithril', entityId: 'obj_mithril',    entityType: 'object'    },
      { label: 'Bilbo Sacquet',               entityId: 'char_bilbo',     entityType: 'character' },
      { label: 'Frodo Sacquet',               entityId: 'char_frodo',     entityType: 'character' },
    ],
  },
  {
    id: 'inc_003',
    type: 'Incohérence de Porteur',
    severity: 'high',
    title: "Gandalf dans les holders du Lembas malgré son absence à Lothlórien",
    explanation:
      "Le Lembas liste Gandalf parmi ses holders, alors que ce pain elfique fut offert par Galadriel à Lothlórien après la traversée de la Moria. Or Gandalf tombe au Pont de Khazad-dûm avant que la Communauté n'atteigne Lothlórien — il ne peut donc pas figurer parmi les porteurs du Lembas.",
    links: [
      { label: 'Lembas',         entityId: 'obj_lembas',      entityType: 'object'    },
      { label: 'Gandalf le Gris', entityId: 'char_gandalf',   entityType: 'character' },
      { label: 'Galadriel',      entityId: 'char_galadriel',  entityType: 'character' },
      { label: 'Mines de la Moria', entityId: 'loc_moria',    entityType: 'location'  },
    ],
  },
  {
    id: 'inc_004',
    type: 'Téléportation de Personnage',
    severity: 'high',
    title: "Glorfindel absent de Fondcombe malgré son rôle de Seigneur",
    explanation:
      "Glorfindel est listé comme visiteur du Gué de Bruinen et son origine est 'Fondcombe — Imladris', mais il n'apparaît pas dans la liste visitedBy de Fondcombe. Un Seigneur de Fondcombe qui surgit au Gué sans trace de sa présence dans la cité elfique qu'il est censé protéger constitue une incohérence de traçabilité.",
    links: [
      { label: 'Glorfindel',    entityId: 'char_glorfindel', entityType: 'character' },
      { label: 'Fondcombe',     entityId: 'loc_rivendell',   entityType: 'location'  },
      { label: 'Gué de Bruinen', entityId: 'loc_ford',       entityType: 'location'  },
    ],
  },
  {
    id: 'inc_005',
    type: 'Créateur Non Référencé',
    severity: 'medium',
    title: "Andúril forgée par des 'Elfes de Fondcombe' sans entité associée",
    explanation:
      "Le créateur d'Andúril est 'Elfes de Fondcombe (reforge de Narsil)', mais cette entité collective n'est pas référencée. Elrond, Seigneur de Fondcombe et porteur de Vilya, serait le maître d'œuvre logique de cette reforge — pourtant aucun lien direct n'est établi entre lui et l'épée dans la base.",
    links: [
      { label: 'Andúril',  entityId: 'obj_anduril',    entityType: 'object'    },
      { label: 'Elrond',   entityId: 'char_elrond',    entityType: 'character' },
      { label: 'Aragorn',  entityId: 'char_aragorn',   entityType: 'character' },
      { label: 'Fondcombe', entityId: 'loc_rivendell', entityType: 'location'  },
    ],
  },
  {
    id: 'inc_006',
    type: 'Lieu d\'Origine Inexistant',
    severity: 'medium',
    title: "Tom Bombadil originaire d'un lieu non référencé",
    explanation:
      "Tom Bombadil a pour origine 'Forêt Ancienne' et pour affiliation 'Forêt Ancienne (indépendant)', mais ce lieu n'existe pas comme entité dans la base de données des lieux. Son domaine — les Hauts-des-Galgals — est présent, mais la Forêt Ancienne elle-même reste une référence orpheline.",
    links: [
      { label: 'Tom Bombadil',       entityId: 'char_tom_bombadil',  entityType: 'character' },
      { label: 'Hauts-des-Galgals',  entityId: 'loc_barrowdowns',    entityType: 'location'  },
    ],
  },
  {
    id: 'inc_007',
    type: 'Affiliation Fantôme',
    severity: 'medium',
    title: "Boromir affilié à 'Gondor' : lieu absent de la base",
    explanation:
      "Boromir porte l'affiliation 'Gondor', mais Gondor n'existe ni comme lieu ni comme entité dans la base de données. Son origine 'Minas Tirith — Gondor' suggère que Gondor devrait être un lieu référencé. Cette affiliation orpheline empêche la création de tout lien graphique vers sa faction natale.",
    links: [
      { label: 'Boromir', entityId: 'char_boromir', entityType: 'character' },
    ],
  },
  {
    id: 'inc_008',
    type: 'Objet sans Lieu de Création',
    severity: 'low',
    title: "Le Bâton de Gandalf : créateur et lieu de création inconnus",
    explanation:
      "Le Bâton de Gandalf indique 'Inconnu (apporté de Valinor ?)' comme créateur et 'Inconnu' comme lieu de création. Or Valinor est mentionné comme l'origine de Gandalf lui-même — une cohérence minimale voudrait que son bâton soit associé à la même origine, ou que Valinor soit ajouté comme entité lieu.",
    links: [
      { label: 'Bâton de Gandalf', entityId: 'obj_staves',    entityType: 'object'    },
      { label: 'Gandalf le Gris',  entityId: 'char_gandalf',  entityType: 'character' },
    ],
  },
];

// ── Utilitaires ───────────────────────────────────────────────────────────────

/** Retourne toutes les incohérences impliquant une entité donnée */
export function getEntityIncoherences(entityId) {
  return incoherencesDB.filter(inc =>
    inc.links.some(link => link.entityId === entityId)
  );
}

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
