/**
 * Calcul de couverture des entités par les événements de la timeline.
 * Extrait de EntityCoveragePanel (SaveTheCat.jsx).
 */

/**
 * Construit une map de couverture : `entityType:id` → chapitres triés.
 * @param {Array} events - Événements avec `entities[]`, `chapter`, `chapterTitle`
 * @returns {Object} map : `"character:char_frodo"` → `[{ number, title }, ...]`
 */
export function buildCoverageMap(events) {
  const map = {};
  (events ?? []).forEach(evt => {
    (evt.entities ?? []).forEach(e => {
      const key = `${e.entityType}:${e.id}`;
      if (!map[key]) map[key] = new Map();
      if (!map[key].has(evt.chapter)) {
        map[key].set(evt.chapter, {
          number: evt.chapter,
          title:  evt.chapterTitle || `Chapitre ${evt.chapter}`,
        });
      }
    });
  });
  const result = {};
  Object.entries(map).forEach(([k, m]) => {
    result[k] = Array.from(m.values()).sort((a, b) => a.number - b.number);
  });
  return result;
}
