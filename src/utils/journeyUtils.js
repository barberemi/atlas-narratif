/**
 * Calcul automatique des trajets depuis les événements de la timeline.
 * Indépendant de tout store — fonction pure.
 */
export function computeAutoJourneys(events, locations, characters) {
  const locMap         = new Map(locations.map(l => [l.id, l]));
  const charMap        = new Map(characters.map(c => [c.id, c]));
  const unlocalizedMap = new Map();

  const result = {};

  for (const char of characters) {
    // Tous les événements où ce personnage apparaît, triés par chapitre
    const charEvents = events
      .filter(evt => evt.entities.some(e => e.entityType === 'character' && e.id === char.id))
      .sort((a, b) => a.chapter - b.chapter);

    if (!charEvents.length) continue;

    const steps = charEvents.map((evt, i) => {
      const loc       = evt.locationId ? locMap.get(evt.locationId) : null;
      const hasCoords = !!(loc?.coordinates);
      const isMissing = !!(evt.locationId && !hasCoords);

      if (isMissing) unlocalizedMap.set(evt.locationId, loc?.name ?? evt.locationId);

      // Autres personnages présents dans l'événement
      const allies = evt.entities
        .filter(e => e.entityType === 'character' && e.id !== char.id)
        .map(e => charMap.get(e.id)?.name)
        .filter(Boolean);

      return {
        etape:           i + 1,
        eventId:         evt.id,
        chapterNum:      evt.chapter,
        chapitre:        `Ch.${evt.chapter} — ${evt.chapterTitle}`,
        lieu:            loc?.name ?? (evt.locationId ? 'Lieu non localisé' : 'Aucun lieu précisé'),
        sous_lieu:       evt.title,
        action:          evt.description ?? '',
        allies,
        x:               hasCoords ? loc.coordinates.x : null,
        y:               hasCoords ? loc.coordinates.y : null,
        isMissing,
        isFlashback:     evt.isFlashback ?? false,
        storyChapterRef: evt.storyChapterRef ?? null,
      };
    });

    // Clé : journeyKey si dispo (compatibilité mode manuel), sinon id
    const key = char.journeyKey ?? char.id;
    result[key] = steps;
  }

  return {
    autoJourneys: result,
    unlocalized:  [...unlocalizedMap.entries()].map(([id, name]) => ({ id, name })),
  };
}
