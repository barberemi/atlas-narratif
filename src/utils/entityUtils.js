import { ENTITY_VIZ } from '../data/viz_palette';

// Couleurs par type d'entité — dérivées de la palette data-viz unifiée (validée CVD).
export const ENTITY_COLORS = ENTITY_VIZ;
export const ENTITY_ICONS  = { character: 'user', location: 'location', object: 'object', group: 'group', custom: 'gem' }; // noms d'icônes lucide (cf. ui/Icon.jsx)
const CUSTOM_COLOR = '#a78bfa';

// ── Cache module-level (initialisé depuis la DB via DbContext) ────────────────
let _cache = { characters: [], locations: [], objects: [], groups: [], customEntities: [], customTypes: [] };

/**
 * Initialise le cache d'entités depuis les données DB (lore).
 * Préserve les entités custom (alimentées séparément par useCustomEntityStore).
 */
export function initEntityCache(loreData) {
  _cache = { ...loreData, customEntities: _cache.customEntities ?? [], customTypes: _cache.customTypes ?? [] };
}

/** Alimente le cache avec les types & entités custom (couche 3). */
export function setCustomEntityCache(entities = [], types = []) {
  _cache = { ..._cache, customEntities: entities, customTypes: types };
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
