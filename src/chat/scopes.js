/**
 * Portées de recherche du chat (« chat sur tout »).
 *
 * Les clés doivent rester alignées avec `SCOPE_TYPES` et l'enum du validateur
 * `ask` côté serveur (server/src/routes/ask.js, validators.js). Les libellés
 * passent par i18n (`chat.scopes.<key>`).
 *
 * Niveau 2 (RAG serveur) : toutes les portées sont couvertes (le serveur bâtit
 * des passages depuis TOUTES les sources). Niveau 1 (local déterministe) : seules
 * les portées « entités » sont résolvables localement (cf. SCOPE_ENTITY_TYPES) ;
 * pour les autres, le local invite à passer en recherche approfondie.
 */

/** Ordre d'affichage des chips. 'all' en premier. */
export const SCOPE_KEYS = [
  'all', 'characters', 'locations', 'objects', 'events', 'plot', 'notes', 'incoherences', 'custom',
];

/** Types d'entités résolvables par le niveau 1 local, par portée. */
export const SCOPE_ENTITY_TYPES = {
  characters: ['character'],
  locations:  ['location'],
  objects:    ['object'],
  custom:     ['custom'],
};

/**
 * Intent du routeur niveau 1 → portée, pour l'indice « recherche surtout dans : X ».
 * Dérivé du RÉSULTAT (l'intent détecté), donc indépendant de la langue de la
 * question. Le niveau 2 reçoit son indice du serveur (type dominant des passages).
 */
export const INTENT_SCOPE = {
  who:     'characters',
  where:   'locations',
  objects: 'objects',
  chapter: 'events',
};
