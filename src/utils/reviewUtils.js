/**
 * Fonctions pures extraites de ReviewPage et SaveTheCat.
 * Utilisées aussi par EmotionalArc pour l'extraction des chapitres.
 */

/**
 * Filtre un tableau d'entités par source.
 * @param {Array} items - Entités avec un champ `source`
 * @param {'all'|'import'|'manual'|'modified'} sourceFilter
 */
export function filterBySource(items, sourceFilter) {
  if (sourceFilter === 'all') return items;
  return items.filter(i => (i.source ?? 'import') === sourceFilter);
}

/**
 * Calcule les comptages globaux du projet.
 * @param {Array} characters
 * @param {Array} locations
 * @param {Array} objects
 * @param {Array} events
 */
export function computeStats(characters, locations, objects, events) {
  return {
    characters: characters.length,
    locations:  locations.length,
    objects:    objects.length,
    events:     events.length,
    modified:   [...characters, ...locations, ...objects, ...events]
      .filter(e => e.source === 'modified' || e.source === 'manual').length,
  };
}

/**
 * Extrait la liste dédupliquée des chapitres depuis des événements, triée par numéro.
 * @param {Array} events - Événements avec `chapter` (number) et `chapterTitle` (string)
 * @returns {{ number: number, title: string }[]}
 */
export function extractChapters(events) {
  const seen = new Set();
  const chs  = [];
  for (const e of (events ?? [])) {
    if (!seen.has(e.chapter)) {
      seen.add(e.chapter);
      chs.push({ number: e.chapter, title: e.chapterTitle || `Chapitre ${e.chapter}` });
    }
  }
  return chs.sort((a, b) => a.number - b.number);
}
