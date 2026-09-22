import { ENTITY_VIZ } from '../data/viz_palette';

// Couleurs par type d'entité — dérivées de la palette data-viz unifiée (validée CVD).
export const ENTITY_COLORS = ENTITY_VIZ;
export const ENTITY_ICONS  = { character: 'user', location: 'location', object: 'object', group: 'group', custom: 'gem' }; // noms d'icônes lucide (cf. ui/Icon.jsx)
const CUSTOM_COLOR = '#a78bfa';

// ── Cache module-level (initialisé depuis la DB via DbContext) ────────────────
let _cache = { characters: [], locations: [], objects: [], groups: [], customEntities: [], customTypes: [], relations: [] };

/**
 * Initialise le cache d'entités depuis les données DB (lore).
 * Préserve les entités custom et les relations (alimentées séparément).
 */
export function initEntityCache(loreData) {
  _cache = {
    ...loreData,
    customEntities: _cache.customEntities ?? [],
    customTypes: _cache.customTypes ?? [],
    relations: _cache.relations ?? [],
  };
}

/** Alimente le cache avec les types & entités custom (couche 3). */
export function setCustomEntityCache(entities = [], types = []) {
  _cache = { ..._cache, customEntities: entities, customTypes: types };
}

/** Alimente le cache avec les relations explicites (Niveau 3). */
export function setRelationCache(relations = []) {
  _cache = { ..._cache, relations };
}

/** Accès direct au cache — utilisé par buildGraph. */
export function getLoreCache() {
  return _cache;
}

/**
 * Résout un ID d'entité en métadonnées { name, type, color, icon }.
 * @param {string} id
 * @param {'character'|'location'|'object'} [type] — optionnel, accélère la recherche
 * @returns {{ name: string, type: string, color: string, icon: string } | null}
 */
export function getEntityMeta(id, type) {
  if (!type || type === 'character') {
    const c = _cache.characters.find(e => e.id === id);
    if (c) return { name: c.name, type: 'character', color: c.color || ENTITY_COLORS.character, icon: ENTITY_ICONS.character };
    if (type) return null;
  }
  if (!type || type === 'location') {
    const l = _cache.locations.find(e => e.id === id);
    if (l) return { name: l.name, type: 'location', color: ENTITY_COLORS.location, icon: ENTITY_ICONS.location };
    if (type) return null;
  }
  if (!type || type === 'object') {
    const o = _cache.objects.find(e => e.id === id);
    if (o) return { name: o.name, type: 'object', color: ENTITY_COLORS.object, icon: ENTITY_ICONS.object };
    if (type) return null;
  }
  if (!type || type === 'group') {
    const g = (_cache.groups ?? []).find(e => e.id === id);
    if (g) return { name: g.name, type: 'group', color: g.color || ENTITY_COLORS.group, icon: ENTITY_ICONS.group };
    if (type) return null;
  }
  if (!type || type === 'custom') {
    const ce = (_cache.customEntities ?? []).find(e => e.id === id);
    if (ce) {
      const color = (_cache.customTypes ?? []).find(t => t.id === ce.typeId)?.color || CUSTOM_COLOR;
      return { name: ce.name, type: 'custom', color, icon: ENTITY_ICONS.custom };
    }
  }
  return null;
}

/**
 * Variante qui ne retourne jamais null — utile pour les graphes et rendus SVG.
 * @param {string} id
 * @returns {{ name: string, type: string, color: string, icon: string }}
 */
export function getEntityInfo(id) {
  return getEntityMeta(id) ?? { name: id, type: 'unknown', color: '#64748b', icon: 'help' };
}

/**
 * Construit l'URL vers la FICHE d'une entité (convention recherche globale) :
 * `/lore?tab=<type>&search=<nom>` pour le noyau typé, `/custom?type=&entity=`
 * (deep-link) pour une entité custom. Utilisé par WikiText, le chat, etc.
 */
export function hrefForEntity({ id, name, type, typeId }) {
  const tab = { character: 'characters', location: 'locations', object: 'objects' }[type];
  if (tab) return `/lore?tab=${tab}&search=${encodeURIComponent(name ?? '')}`;
  if (type === 'custom') {
    return typeId
      ? `/custom?type=${encodeURIComponent(typeId)}&entity=${encodeURIComponent(id)}`
      : '/custom';
  }
  return `/lore?search=${encodeURIComponent(name ?? '')}`; // groupe / fallback
}

/** URL de fiche à partir d'un ID d'entité seul (résout type/nom/typeId via le cache). */
export function entityHrefById(id) {
  const meta = getEntityMeta(id);
  if (!meta) return null;
  const typeId = meta.type === 'custom'
    ? (_cache.customEntities ?? []).find(e => e.id === id)?.typeId
    : undefined;
  return hrefForEntity({ id, name: meta.name, type: meta.type, typeId });
}

// Route de destination par type de source de chat NON-entité → pont du chat vers
// la vue correspondante. Les types entité (character/location/object/custom) sont
// gérés par entityHrefById (fiche). Aligné avec les types de passages serveur.
const CHAT_SOURCE_ROUTE = {
  event: '/timeline', beat: '/savethecat', plant: '/plants',
  thread: '/threads', hero: '/heros', incoherence: '/incoherences', note: '/timeline',
};

/**
 * URL de destination pour une source citée par le chat ({ id, type }).
 * Entité (perso/lieu/objet/custom) → sa fiche ; autre type → la vue dédiée.
 * Retourne null si non navigable (→ affiché non cliquable).
 */
export function chatSourceHref({ id, type } = {}) {
  return entityHrefById(id) ?? CHAT_SOURCE_ROUTE[type] ?? null;
}

/** Normalise un nom pour comparaison : minuscules, sans accents, séparateurs unifiés. */
function normalizeName(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[_\s-]+/g, ' ')
    .trim();
}

/**
 * Résout un nom (ou alias) d'entité — toutes couches confondues — en
 * { id, name, type, color }. Sert au rendu des wikilinks `[[Nom]]` importés
 * d'Obsidian. Insensible à la casse, aux accents et aux séparateurs (_ / espace).
 * @param {string} name
 * @returns {{ id, name, type, color } | null}
 */
export function resolveEntityByName(name) {
  const n = normalizeName(name);
  if (!n) return null;
  const buckets = [
    [_cache.characters, 'character'],
    [_cache.locations, 'location'],
    [_cache.objects, 'object'],
    [_cache.groups ?? [], 'group'],
    [_cache.customEntities ?? [], 'custom'],
  ];
  for (const [list, type] of buckets) {
    for (const e of list) {
      const names = [e.name, ...(e.aliases ?? [])];
      if (names.some(x => normalizeName(x) === n)) {
        const meta = getEntityMeta(e.id, type);
        // `typeId` (entités custom uniquement) permet le deep-link /custom?type=…&entity=…
        return { id: e.id, name: e.name, type, color: meta?.color ?? '#64748b', typeId: e.typeId };
      }
    }
  }
  return null;
}

/**
 * Recherche floue d'un personnage par nom/alias (ex : noms d'alliés dans les trajets).
 * @param {string} allyName
 * @returns {object|undefined}
 */
export function findCharacterByAllyName(allyName) {
  const base = allyName
    .split('(')[0]
    .replace(/^(le |la |les |l')/i, '')
    .trim()
    .toLowerCase();

  return _cache.characters.find((c) => {
    const cName    = c.name.toLowerCase();
    const cAliases = (c.aliases ?? []).map((a) => a.toLowerCase());
    return (
      cName.includes(base) ||
      base.includes(cName.split(' ')[0]) ||
      cAliases.some((a) => a.includes(base) || base.includes(a.split(' ')[0]))
    );
  });
}
