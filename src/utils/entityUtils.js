import { loreDB } from '../data/lore_database';

export const ENTITY_COLORS = { character: '#64748B', location: '#3B82F6', object: '#F59E0B' };
export const ENTITY_ICONS  = { character: '👤', location: '📍', object: '⚔️' };

/**
 * Résout un ID d'entité en métadonnées { name, type, color, icon }.
 * @param {string} id
 * @param {'character'|'location'|'object'} [type] — optionnel, accélère la recherche
 * @returns {{ name: string, type: string, color: string, icon: string } | null}
 */
export function getEntityMeta(id, type) {
  if (!type || type === 'character') {
    const c = loreDB.characters.find(e => e.id === id);
    if (c) return { name: c.name, type: 'character', color: c.color || ENTITY_COLORS.character, icon: ENTITY_ICONS.character };
    if (type) return null;
  }
  if (!type || type === 'location') {
    const l = loreDB.locations.find(e => e.id === id);
    if (l) return { name: l.name, type: 'location', color: ENTITY_COLORS.location, icon: ENTITY_ICONS.location };
    if (type) return null;
  }
  if (!type || type === 'object') {
    const o = loreDB.objects.find(e => e.id === id);
    if (o) return { name: o.name, type: 'object', color: ENTITY_COLORS.object, icon: ENTITY_ICONS.object };
  }
  return null;
}

/**
 * Variante qui ne retourne jamais null — utile pour les graphes et rendus SVG.
 * @param {string} id
 * @returns {{ name: string, type: string, color: string, icon: string }}
 */
export function getEntityInfo(id) {
  return getEntityMeta(id) ?? { name: id, type: 'unknown', color: '#64748b', icon: '?' };
}
