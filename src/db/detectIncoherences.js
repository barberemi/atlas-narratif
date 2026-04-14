/**
 * Détection client-side d'incohérences après modifications CRUD.
 * Ne requiert pas l'API Claude — travaille sur les données déjà chargées.
 * Retourne un tableau d'incohérences au même format que getIncoherences().
 */

import i18n from '../i18n';

const t = (key, opts) => i18n.t(`detect.${key}`, opts);

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
  {
    type:        'Flashback Temporel',
    icon:        '↩',
    severity:    'critical',
    description: "Un personnage ou un objet apparaît dans un flashback dont la position diégétique est postérieure à sa mort ou à sa destruction.",
  },
  {
    type:        'Flashback Non Ancré',
    icon:        '↩',
    severity:    'low',
    description: "Un flashback ne possède pas de position diégétique définie, rendant toute vérification de cohérence temporelle impossible.",
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
      title:       t('orphanChar.title', { name: c.name }),
      explanation: t('orphanChar.explanation', { name: c.name }),
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
      title:       t('orphanLoc.title', { name: l.name }),
      explanation: t('orphanLoc.explanation', { name: l.name }),
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
      title:       t('brokenHolder.title', { name: o.name }),
      explanation: t('brokenHolder.explanation', { name: o.name, holder: o.currentHolder }),
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
        title:       t('brokenRef.title'),
        explanation: t('brokenRef.explanation', { entityId: entity.id, eventTitle: evt.title }),
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

    const deathEvent  = events[deathIdx];

    const afterDeath = events.filter((evt, idx) =>
      idx > deathIdx &&
      evt.entities.some(e => e.entityType === 'character' && e.id === char.id) &&
      // Un flashback diégétiquement antérieur à la mort est valide — ne pas le flaguer
      !(evt.isFlashback && evt.storyChapterRef != null && evt.storyChapterRef < deathEvent.chapter)
    );
    if (!afterDeath.length) continue;
    const eventTitles = afterDeath.map(e => `"${e.title}" (ch.${e.chapter})`).join(', ');
    results.push({
      id:          makeId('dead_reappear', char.id),
      type:        'Continuité de Personnage',
      severity:    'critical',
      title:       t('deadReappear.title', { name: char.name, deathEvent: deathEvent.title }),
      explanation: t('deadReappear.explanation', { name: char.name, deathEvent: deathEvent.title, deathChapter: deathEvent.chapter, events: eventTitles }),
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
      evt.entities.some(e => e.entityType === 'object' && e.id === obj.id) &&
      // Un flashback diégétiquement antérieur à la destruction est valide
      !(evt.isFlashback && evt.storyChapterRef != null && evt.storyChapterRef < obj.statusChangedAtChapter)
    );
    if (!afterChange.length) continue;
    const statusLabel = t(`status.${obj.status}`);
    const eventTitles = afterChange.map(e => `"${e.title}" (ch.${e.chapter})`).join(', ');
    results.push({
      id:          makeId('inactive_obj', obj.id),
      type:        "Continuité d'Objet",
      severity:    'high',
      title:       t('inactiveObj.title', { name: obj.name, status: statusLabel, chapter: obj.statusChangedAtChapter }),
      explanation: t('inactiveObj.explanation', { name: obj.name, status: statusLabel, chapter: obj.statusChangedAtChapter, events: eventTitles }),
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
      title:       t('payoffBeforePlant.title', { label: p.label }),
      explanation: t('payoffBeforePlant.explanation', { label: p.label, plantChapter: p.plantChapterNum, payoffChapter: p.payoffChapterNum }),
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
        title:       t('ghostAffil.title', { name: group.name }),
        explanation: t('ghostAffil.explanation', { name: group.name, charId: member.characterId }),
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
      title:       t('openPlant.title', { label: p.label }),
      explanation: t('openPlant.explanation', { label: p.label, plantChapter: p.plantChapterNum, maxChapter }),
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
    .filter(th => !usedThreadIds.has(th.id))
    .map(th => ({
      id:          makeId('empty_thread', th.id),
      type:        'Fil Narratif Vide',
      severity:    'low',
      title:       t('emptyThread.title', { name: th.name }),
      explanation: t('emptyThread.explanation', { name: th.name }),
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
      title:       t('povMissing.title', { title: e.title }),
      explanation: t('povMissing.explanation', { title: e.title, chapter: e.chapter }),
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
      title:       t('emptyScene.title', { title: e.title }),
      explanation: t('emptyScene.explanation', { title: e.title, chapter: e.chapter }),
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
      title:       t('crossDead.title', { name: char.name, volume: deathVolume?.number ?? '?' }),
      explanation: t('crossDead.explanation', { name: char.name, deathEvent: deathEvent.title, volume: deathVolume?.number ?? '?', events: eventTitles }),
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
    const statusLabel  = t(`status.${obj.status}`);
    const eventTitles  = afterChange.map(e => {
      const vol = volumes.find(v => v.id === e.volumeId);
      return `"${e.title}" (T${vol?.number ?? '?'})`;
    }).join(', ');

    results.push({
      id:          makeId('cross_obj', obj.id),
      type:        'Objet Cross-Tomes',
      severity:    'high',
      title:       t('crossObj.title', { name: obj.name, status: statusLabel, volume: changeVolume?.number ?? '?' }),
      explanation: t('crossObj.explanation', { name: obj.name, status: statusLabel, chapter: obj.statusChangedAtChapter, volume: changeVolume?.number ?? '?', events: eventTitles }),
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
        title:       t('crossPlant.title', { label: p.label }),
        explanation: t('crossPlant.explanation', { label: p.label, volume: plantVol?.number ?? '?' }),
        resolved:    false,
        resolutionNote: null,
        links:       [],
      };
    });
}

// ── Détecteurs flashback ──────────────────────────────────────────────────────

/**
 * Personnage dans un flashback dont la position diégétique est après sa mort.
 */
function detectFlashbackAfterDeath(characters, events) {
  const results = [];
  const dead = characters.filter(c => c.deathEventId != null);
  const eventChapterMap = new Map(events.map(e => [e.id, e.chapter]));

  for (const char of dead) {
    const deathChapter = eventChapterMap.get(char.deathEventId);
    if (deathChapter == null) continue;

    const bad = events.filter(evt =>
      evt.isFlashback &&
      evt.storyChapterRef != null &&
      evt.storyChapterRef > deathChapter &&
      evt.entities.some(e => e.entityType === 'character' && e.id === char.id)
    );
    if (!bad.length) continue;

    const titles = bad.map(e => `"${e.title}" (ch.${e.chapter} → ch.${e.storyChapterRef})`).join(', ');
    results.push({
      id:             makeId('flash_death', char.id),
      type:           'Flashback Temporel',
      severity:       'critical',
      title:          t('flashDeath.title', { name: char.name, chapter: deathChapter }),
      explanation:    t('flashDeath.explanation', { name: char.name, chapter: deathChapter, events: titles }),
      resolved:       false,
      resolutionNote: null,
      links:          [{ entityId: char.id, entityType: 'character', label: char.name }],
    });
  }
  return results;
}

/**
 * Objet perdu/détruit présent dans un flashback diégétiquement postérieur à sa destruction.
 */
function detectFlashbackObjectDestroyed(objects, events) {
  const results = [];
  const inactive = objects.filter(o => o.status !== 'active' && o.statusChangedAtChapter != null);

  for (const obj of inactive) {
    const bad = events.filter(evt =>
      evt.isFlashback &&
      evt.storyChapterRef != null &&
      evt.storyChapterRef >= obj.statusChangedAtChapter &&
      evt.entities.some(e => e.entityType === 'object' && e.id === obj.id)
    );
    if (!bad.length) continue;

    const statusLabel = t(`status.${obj.status}`);
    const titles = bad.map(e => `"${e.title}" (ch.${e.storyChapterRef})`).join(', ');
    results.push({
      id:             makeId('flash_obj', obj.id),
      type:           'Flashback Temporel',
      severity:       'high',
      title:          t('flashObj.title', { name: obj.name, status: statusLabel, chapter: obj.statusChangedAtChapter }),
      explanation:    t('flashObj.explanation', { name: obj.name, status: statusLabel, chapter: obj.statusChangedAtChapter, events: titles }),
      resolved:       false,
      resolutionNote: null,
      links:          [{ entityId: obj.id, entityType: 'object', label: obj.name }],
    });
  }
  return results;
}

/**
 * Flashback sans position diégétique (storyChapterRef null).
 */
function detectFlashbackWithoutStoryRef(events) {
  return events
    .filter(e => e.isFlashback && e.storyChapterRef == null)
    .map(e => ({
      id:             makeId('flash_noref', e.id),
      type:           'Flashback Non Ancré',
      severity:       'low',
      title:          t('flashNoRef.title', { title: e.title }),
      explanation:    t('flashNoRef.explanation', { title: e.title, chapter: e.chapter }),
      resolved:       false,
      resolutionNote: null,
      links:          [],
    }));
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
    // flashbacks
    ...detectFlashbackAfterDeath(characters, events),
    ...detectFlashbackObjectDestroyed(objects, events),
    ...detectFlashbackWithoutStoryRef(events),
  ];
}
