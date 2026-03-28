/**
 * Détection client-side d'incohérences après modifications CRUD.
 * Ne requiert pas l'API Claude — travaille sur les données déjà chargées.
 * Retourne un tableau d'incohérences au même format que getIncoherences().
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(type, ...parts) {
  return `scan_${type}_${parts.join('_')}`;
}

// ── Détecteurs ────────────────────────────────────────────────────────────────

/**
 * Personnages sans aucun événement dans la timeline.
 */
function detectOrphanCharacters(characters, events) {
  const charIdsInEvents = new Set(
    events.flatMap(e => e.entities.filter(x => x.entityType === 'character').map(x => x.id))
  );
  return characters
    .filter(c => !charIdsInEvents.has(c.id))
    .map(c => ({
      id:          makeId('orphan_char', c.id),
      type:        'Entité Non Référencée',
      severity:    'low',
      title:       `${c.name} n'apparaît dans aucun événement`,
      explanation: `Le personnage "${c.name}" existe dans le lore mais n'est associé à aucun événement de la timeline.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: c.id, entityType: 'character', label: c.name }],
    }));
}

/**
 * Lieux sans aucun événement dans la timeline.
 */
function detectOrphanLocations(locations, events) {
  const locIdsInEvents = new Set([
    ...events.map(e => e.locationId).filter(Boolean),
    ...events.flatMap(e => e.entities.filter(x => x.entityType === 'location').map(x => x.id)),
  ]);
  return locations
    .filter(l => !locIdsInEvents.has(l.id))
    .map(l => ({
      id:          makeId('orphan_loc', l.id),
      type:        'Entité Non Référencée',
      severity:    'low',
      title:       `Le lieu "${l.name}" n'est jamais visité`,
      explanation: `Le lieu "${l.name}" existe dans le lore mais n'est associé à aucun événement de la timeline.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: l.id, entityType: 'location', label: l.name }],
    }));
}

/**
 * Objets dont le détenteur actuel n'existe pas dans les personnages.
 */
function detectBrokenHolders(objects, characters) {
  const charNames = new Set(characters.map(c => c.name));
  return objects
    .filter(o => o.currentHolder && !charNames.has(o.currentHolder))
    .map(o => ({
      id:          makeId('holder', o.id),
      type:        'Incohérence de Porteur',
      severity:    'medium',
      title:       `Détenteur inconnu pour "${o.name}"`,
      explanation: `L'objet "${o.name}" est attribué à "${o.currentHolder}" mais ce personnage n'existe pas dans la base.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: o.id, entityType: 'object', label: o.name }],
    }));
}

/**
 * Entités référencées dans des événements mais absentes du lore (supprimées).
 */
function detectBrokenReferences(events, characters, locations, objects) {
  const charIds = new Set(characters.map(c => c.id));
  const locIds  = new Set(locations.map(l => l.id));
  const objIds  = new Set(objects.map(o => o.id));

  const results = [];
  const seen    = new Set();

  for (const evt of events) {
    for (const entity of evt.entities) {
      const key = entity.id;
      if (seen.has(key)) continue;
      const isBroken =
        (entity.entityType === 'character' && !charIds.has(entity.id)) ||
        (entity.entityType === 'location'  && !locIds.has(entity.id))  ||
        (entity.entityType === 'object'    && !objIds.has(entity.id));
      if (!isBroken) continue;
      seen.add(key);
      results.push({
        id:          makeId('broken_ref', entity.id),
        type:        'Entité Non Référencée',
        severity:    'high',
        title:       `Entité supprimée encore liée à des événements`,
        explanation: `Une entité (id: ${entity.id}) est référencée dans "${evt.title}" mais n'existe plus dans le lore. Elle a peut-être été supprimée.`,
        resolved:    false,
        resolutionNote: null,
        links:       [],
      });
    }
  }
  return results;
}

/**
 * Personnage avec deathEventId apparaissant dans un événement après sa mort.
 */
function detectDeadCharacterReappearance(characters, events) {
  const results = [];
  const dead = characters.filter(c => c.deathEventId != null);

  // Index de position pour comparer l'ordre des événements (déjà triés chapter_num, id)
  const eventOrderMap = new Map(events.map((e, i) => [e.id, i]));

  for (const char of dead) {
    const deathIdx = eventOrderMap.get(char.deathEventId);
    if (deathIdx === undefined) continue; // événement de mort supprimé

    const afterDeath = events.filter((evt, idx) =>
      idx > deathIdx &&
      evt.entities.some(e => e.entityType === 'character' && e.id === char.id)
    );
    if (!afterDeath.length) continue;

    const deathEvent  = events[deathIdx];
    const eventTitles = afterDeath.map(e => `"${e.title}" (ch.${e.chapter})`).join(', ');
    results.push({
      id:          makeId('dead_reappear', char.id),
      type:        'Continuité de Personnage',
      severity:    'critical',
      title:       `${char.name} apparaît après sa mort ("${deathEvent.title}")`,
      explanation: `${char.name} est marqué comme mort lors de "${deathEvent.title}" (ch.${deathEvent.chapter}) mais apparaît dans : ${eventTitles}.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: char.id, entityType: 'character', label: char.name }],
    });
  }
  return results;
}

/**
 * Objet perdu ou détruit encore référencé dans des événements après son changement d'état.
 */
function detectUsedInactiveObject(objects, events) {
  const results = [];
  const inactive = objects.filter(o => o.status !== 'active' && o.statusChangedAtChapter != null);

  for (const obj of inactive) {
    const afterChange = events.filter(evt =>
      evt.chapter > obj.statusChangedAtChapter &&
      evt.entities.some(e => e.entityType === 'object' && e.id === obj.id)
    );
    if (!afterChange.length) continue;
    const label      = obj.status === 'lost' ? 'perdu' : 'détruit';
    const eventTitles = afterChange.map(e => `"${e.title}" (ch.${e.chapter})`).join(', ');
    results.push({
      id:          makeId('inactive_obj', obj.id),
      type:        'Continuité d\'Objet',
      severity:    'high',
      title:       `"${obj.name}" utilisé après avoir été ${label} (ch.${obj.statusChangedAtChapter})`,
      explanation: `L'objet "${obj.name}" est marqué comme ${label} depuis le chapitre ${obj.statusChangedAtChapter} mais apparaît dans : ${eventTitles}.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: obj.id, entityType: 'object', label: obj.name }],
    });
  }
  return results;
}

// ── Entrée principale ─────────────────────────────────────────────────────────

/**
 * Lance toutes les détections et retourne un tableau d'incohérences.
 * @param {{ characters, locations, objects, events }} loreAndEvents
 */
export function runDetection({ characters, locations, objects, events }) {
  return [
    ...detectDeadCharacterReappearance(characters, events),
    ...detectUsedInactiveObject(objects, events),
    ...detectOrphanCharacters(characters, events),
    ...detectOrphanLocations(locations, events),
    ...detectBrokenHolders(objects, characters),
    ...detectBrokenReferences(events, characters, locations, objects),
  ];
}
