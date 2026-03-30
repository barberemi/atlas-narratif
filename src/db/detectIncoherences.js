/**
 * Détection client-side d'incohérences après modifications CRUD.
 * Ne requiert pas l'API Claude — travaille sur les données déjà chargées.
 * Retourne un tableau d'incohérences au même format que getIncoherences().
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(type, ...parts) {
  return `scan_${type}_${parts.join('_')}`;
}

// ── Catalogue des détecteurs ──────────────────────────────────────────────────
// Exporté pour l'affichage UI dans DetectorCatalog.

export const DETECTOR_CATALOG = [
  {
    type:        'Continuité de Personnage',
    icon:        '💀',
    severity:    'critical',
    description: 'Un personnage marqué comme mort réapparaît dans un événement postérieur à sa mort.',
  },
  {
    type:        "Continuité d'Objet",
    icon:        '⚙',
    severity:    'high',
    description: 'Un objet perdu ou détruit est encore utilisé dans des scènes après son changement de statut.',
  },
  {
    type:        'Payoff Avant Plant',
    icon:        '⏪',
    severity:    'high',
    description: "Le payoff d'une amorce narrative est placé à un chapitre antérieur à l'amorce elle-même.",
  },
  {
    type:        'Entité Non Référencée',
    icon:        '🔗',
    severity:    'high',
    description: 'Une entité supprimée du lore est encore référencée dans des événements de la timeline.',
  },
  {
    type:        'Incohérence de Porteur',
    icon:        '🎒',
    severity:    'medium',
    description: "Le détenteur actuel d'un objet ne correspond à aucun personnage connu dans le lore.",
  },
  {
    type:        'Affiliation Fantôme',
    icon:        '👻',
    severity:    'medium',
    description: 'Un groupe référence un membre dont le personnage a été supprimé du lore.',
  },
  {
    type:        'Personnage POV Absent',
    icon:        '👁',
    severity:    'medium',
    description: "Le personnage défini comme POV d'une scène n'est pas listé parmi les entités de cette scène.",
  },
  {
    type:        'Plant Sans Payoff',
    icon:        '🌱',
    severity:    'medium',
    description: "Une amorce narrative est marquée comme ouverte sans payoff défini jusqu'à la fin du récit.",
  },
  {
    type:        'Fil Narratif Vide',
    icon:        '🧵',
    severity:    'low',
    description: "Un fil narratif existe dans la base mais aucun événement de la timeline n'y est associé.",
  },
  {
    type:        'Entité Orpheline',
    icon:        '🔗',
    severity:    'low',
    description: "Un personnage ou un lieu existe dans le lore mais n'est jamais associé à un événement de la timeline.",
  },
  {
    type:        'Scène Vide',
    icon:        '◯',
    severity:    'low',
    description: "Un événement de la timeline n'est lié à aucune entité (personnage, lieu ou objet).",
  },
  {
    type:        'Mort Cross-Tomes',
    icon:        '💀',
    severity:    'critical',
    description: 'Un personnage mort dans un tome réapparaît vivant dans un tome ultérieur.',
  },
  {
    type:        'Objet Cross-Tomes',
    icon:        '⚙',
    severity:    'high',
    description: "Un objet perdu ou détruit dans un tome est encore utilisé dans un tome ultérieur.",
  },
  {
    type:        'Plant Cross-Tomes',
    icon:        '🌱',
    severity:    'medium',
    description: "Une amorce narrative posée dans un tome n'a aucun payoff dans toute la série.",
  },
];

// ── Détecteurs existants ──────────────────────────────────────────────────────

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
      type:        'Entité Orpheline',
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
      type:        'Entité Orpheline',
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

  const eventOrderMap = new Map(events.map((e, i) => [e.id, i]));

  for (const char of dead) {
    const deathIdx = eventOrderMap.get(char.deathEventId);
    if (deathIdx === undefined) continue;

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
      type:        "Continuité d'Objet",
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

// ── Nouveaux détecteurs ───────────────────────────────────────────────────────

/**
 * Payoff d'une amorce narrative placé avant l'amorce elle-même.
 */
function detectPayoffBeforePlant(plants) {
  return plants
    .filter(p =>
      p.payoffChapterNum != null &&
      p.plantChapterNum  != null &&
      p.payoffChapterNum < p.plantChapterNum
    )
    .map(p => ({
      id:          makeId('payoff_before_plant', p.id),
      type:        'Payoff Avant Plant',
      severity:    'high',
      title:       `Le payoff de "${p.label}" précède son amorce`,
      explanation: `L'amorce "${p.label}" est posée au chapitre ${p.plantChapterNum} mais son payoff est au chapitre ${p.payoffChapterNum}, ce qui est impossible.`,
      resolved:    false,
      resolutionNote: null,
      links:       [],
    }));
}

/**
 * Groupe contenant un membre dont le personnage n'existe plus dans le lore.
 */
function detectGhostAffiliations(groups, characters) {
  const charIds = new Set(characters.map(c => c.id));
  const results = [];
  const seen    = new Set();

  for (const group of groups) {
    for (const member of (group.members ?? [])) {
      if (charIds.has(member.characterId)) continue;
      const key = `${group.id}_${member.characterId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        id:          makeId('ghost_affil', group.id, member.characterId),
        type:        'Affiliation Fantôme',
        severity:    'medium',
        title:       `Membre introuvable dans le groupe "${group.name}"`,
        explanation: `Le groupe "${group.name}" référence un personnage (id: ${member.characterId}) qui n'existe plus dans le lore.`,
        resolved:    false,
        resolutionNote: null,
        links:       [],
      });
    }
  }
  return results;
}

/**
 * Amorce narrative ouverte sans payoff défini jusqu'à la fin du récit.
 */
function detectOpenPlants(plants, events) {
  if (!plants.length) return [];
  const maxChapter = events.length ? Math.max(...events.map(e => e.chapter)) : 0;
  return plants
    .filter(p =>
      p.status === 'open' &&
      !p.payoffEventId &&
      p.payoffChapterNum == null &&
      p.plantChapterNum  != null &&
      p.plantChapterNum  <  maxChapter
    )
    .map(p => ({
      id:          makeId('open_plant', p.id),
      type:        'Plant Sans Payoff',
      severity:    'medium',
      title:       `Amorce non résolue : "${p.label}"`,
      explanation: `L'amorce "${p.label}" (posée ch.${p.plantChapterNum}) n'a aucun payoff défini alors que le récit va jusqu'au chapitre ${maxChapter}.`,
      resolved:    false,
      resolutionNote: null,
      links:       [],
    }));
}

/**
 * Fil narratif sans aucun événement associé.
 */
function detectEmptyThreads(threads, events) {
  if (!threads.length) return [];
  const usedThreadIds = new Set(events.flatMap(e => e.threadIds ?? []));
  return threads
    .filter(t => !usedThreadIds.has(t.id))
    .map(t => ({
      id:          makeId('empty_thread', t.id),
      type:        'Fil Narratif Vide',
      severity:    'low',
      title:       `Le fil narratif "${t.name}" n'est lié à aucune scène`,
      explanation: `Le fil narratif "${t.name}" existe mais aucun événement de la timeline n'y est associé.`,
      resolved:    false,
      resolutionNote: null,
      links:       [],
    }));
}

/**
 * Le personnage POV d'une scène n'est pas dans ses entités.
 */
function detectMissingPovInScene(events) {
  return events
    .filter(e =>
      e.povCharacterId &&
      !e.entities.some(ent => ent.entityType === 'character' && ent.id === e.povCharacterId)
    )
    .map(e => ({
      id:          makeId('pov_missing', e.id),
      type:        'Personnage POV Absent',
      severity:    'medium',
      title:       `Le personnage POV est absent de la scène "${e.title}"`,
      explanation: `La scène "${e.title}" (ch.${e.chapter}) a un personnage POV défini mais ce personnage ne figure pas dans les entités de la scène.`,
      resolved:    false,
      resolutionNote: null,
      links:       [],
    }));
}

/**
 * Événement sans aucune entité ni lieu associé.
 */
function detectEmptyScenes(events) {
  return events
    .filter(e => e.entities.length === 0 && !e.locationId)
    .map(e => ({
      id:          makeId('empty_scene', e.id),
      type:        'Scène Vide',
      severity:    'low',
      title:       `Scène sans entités ni lieu : "${e.title}"`,
      explanation: `L'événement "${e.title}" (ch.${e.chapter}) n'est lié à aucun personnage, lieu ou objet.`,
      resolved:    false,
      resolutionNote: null,
      links:       [],
    }));
}

// ── Détecteurs cross-tomes ────────────────────────────────────────────────────

/**
 * Personnage mort dans un tome qui réapparaît dans un tome ultérieur.
 * Requiert que les volumes soient triés par number (croissant).
 */
function detectCrossVolumeDeadCharacter(characters, events, volumes) {
  if (!volumes.length) return [];

  // Map volumeId → order (index dans le tableau trié par number)
  const volumeOrder = new Map(
    [...volumes].sort((a, b) => a.number - b.number).map((v, i) => [v.id, i])
  );

  const results = [];
  const dead = characters.filter(c => c.deathEventId != null);

  for (const char of dead) {
    const deathEvent = events.find(e => e.id === char.deathEventId);
    if (!deathEvent || !deathEvent.volumeId) continue;

    const deathVolumeOrder = volumeOrder.get(deathEvent.volumeId);
    if (deathVolumeOrder === undefined) continue;

    const afterDeath = events.filter(evt =>
      evt.volumeId &&
      (volumeOrder.get(evt.volumeId) ?? -1) > deathVolumeOrder &&
      evt.entities.some(e => e.entityType === 'character' && e.id === char.id)
    );
    if (!afterDeath.length) continue;

    const deathVolume  = volumes.find(v => v.id === deathEvent.volumeId);
    const eventTitles  = afterDeath.map(e => {
      const vol = volumes.find(v => v.id === e.volumeId);
      return `"${e.title}" (T${vol?.number ?? '?'})`;
    }).join(', ');

    results.push({
      id:          makeId('cross_dead', char.id),
      type:        'Mort Cross-Tomes',
      severity:    'critical',
      title:       `${char.name} mort au T${deathVolume?.number ?? '?'} réapparaît dans un tome ultérieur`,
      explanation: `${char.name} est marqué comme mort dans "${deathEvent.title}" (T${deathVolume?.number ?? '?'}) mais apparaît dans : ${eventTitles}.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: char.id, entityType: 'character', label: char.name }],
    });
  }
  return results;
}

/**
 * Objet perdu/détruit dans un tome encore utilisé dans un tome ultérieur.
 */
function detectCrossVolumeInactiveObject(objects, events, volumes) {
  if (!volumes.length) return [];

  const volumeOrder = new Map(
    [...volumes].sort((a, b) => a.number - b.number).map((v, i) => [v.id, i])
  );

  const results = [];
  const inactive = objects.filter(o => o.status !== 'active' && o.statusChangedAtChapter != null);

  for (const obj of inactive) {
    // Find the last event (by chapter) in a volume where the object was used with that status
    // We use the statusChangedAtChapter to find which volume it happened in
    const changeEvent = events.find(e =>
      e.chapter === obj.statusChangedAtChapter &&
      e.volumeId &&
      e.entities.some(en => en.entityType === 'object' && en.id === obj.id)
    ) ?? events.filter(e => e.chapter <= obj.statusChangedAtChapter && e.volumeId).pop();

    if (!changeEvent?.volumeId) continue;

    const changeVolumeOrder = volumeOrder.get(changeEvent.volumeId);
    if (changeVolumeOrder === undefined) continue;

    const afterChange = events.filter(evt =>
      evt.volumeId &&
      (volumeOrder.get(evt.volumeId) ?? -1) > changeVolumeOrder &&
      evt.entities.some(e => e.entityType === 'object' && e.id === obj.id)
    );
    if (!afterChange.length) continue;

    const changeVolume = volumes.find(v => v.id === changeEvent.volumeId);
    const label        = obj.status === 'lost' ? 'perdu' : 'détruit';
    const eventTitles  = afterChange.map(e => {
      const vol = volumes.find(v => v.id === e.volumeId);
      return `"${e.title}" (T${vol?.number ?? '?'})`;
    }).join(', ');

    results.push({
      id:          makeId('cross_obj', obj.id),
      type:        'Objet Cross-Tomes',
      severity:    'high',
      title:       `"${obj.name}" ${label} au T${changeVolume?.number ?? '?'} mais utilisé dans un tome ultérieur`,
      explanation: `L'objet "${obj.name}" est marqué comme ${label} (ch.${obj.statusChangedAtChapter}, T${changeVolume?.number ?? '?'}) mais apparaît dans : ${eventTitles}.`,
      resolved:    false,
      resolutionNote: null,
      links:       [{ entityId: obj.id, entityType: 'object', label: obj.name }],
    });
  }
  return results;
}

/**
 * Amorce posée dans un tome sans aucun payoff dans toute la série.
 * Ne se déclenche que quand des volumes existent (contexte multi-tomes).
 */
function detectCrossVolumePlantWithoutPayoff(plants, volumes) {
  if (!volumes.length) return [];

  return plants
    .filter(p =>
      p.status === 'open' &&
      !p.payoffEventId &&
      p.payoffChapterNum == null &&
      p.plantVolumeId    != null
    )
    .map(p => {
      const plantVol = volumes.find(v => v.id === p.plantVolumeId);
      return {
        id:          makeId('cross_plant', p.id),
        type:        'Plant Cross-Tomes',
        severity:    'medium',
        title:       `Amorce "${p.label}" sans payoff dans toute la série`,
        explanation: `L'amorce "${p.label}" est posée au T${plantVol?.number ?? '?'} mais n'a aucun payoff défini dans l'ensemble de la série.`,
        resolved:    false,
        resolutionNote: null,
        links:       [],
      };
    });
}

// ── Entrée principale ─────────────────────────────────────────────────────────

/**
 * Lance toutes les détections et retourne un tableau d'incohérences.
 * @param {{ characters, locations, objects, events, plants, threads, groups, volumes }} data
 */
export function runDetection({
  characters = [],
  locations  = [],
  objects    = [],
  events     = [],
  plants     = [],
  threads    = [],
  groups     = [],
  volumes    = [],
}) {
  return [
    // critical
    ...detectDeadCharacterReappearance(characters, events),
    // high
    ...detectUsedInactiveObject(objects, events),
    ...detectPayoffBeforePlant(plants),
    ...detectBrokenReferences(events, characters, locations, objects),
    // medium
    ...detectBrokenHolders(objects, characters),
    ...detectGhostAffiliations(groups, characters),
    ...detectMissingPovInScene(events),
    ...detectOpenPlants(plants, events),
    // low
    ...detectEmptyThreads(threads, events),
    ...detectOrphanCharacters(characters, events),
    ...detectOrphanLocations(locations, events),
    ...detectEmptyScenes(events),
    // cross-tomes (multi-volume only)
    ...detectCrossVolumeDeadCharacter(characters, events, volumes),
    ...detectCrossVolumeInactiveObject(objects, events, volumes),
    ...detectCrossVolumePlantWithoutPayoff(plants, volumes),
  ];
}
