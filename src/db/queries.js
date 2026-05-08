/**
 * Couche d'accès aux données — AtlasNarratif
 *
 * Toutes les fonctions prennent un `db` (PGliteWorker) et un `projectId`.
 * Elles retournent des objets au même format que les fichiers JS existants,
 * ce qui facilite la substitution view par view en Phase 3.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

const SOURCE_CASE = `source = CASE WHEN source='import' THEN 'modified' ELSE source END`;

function makeId(prefix, projectId) {
  return `${prefix}_${projectId}_${Date.now()}`;
}

async function deleteEntity(db, table, id, projectId) {
  await db.query(`DELETE FROM ${table} WHERE id=$1 AND project_id=$2`, [id, projectId]);
}

function parseJsonField(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value; // PGlite peut renvoyer l'objet directement si le type est JSONB
}

// ── Volumes ───────────────────────────────────────────────────────────────────

export async function getVolumes(db, projectId) {
  const { rows } = await db.query(
    `SELECT * FROM volumes WHERE project_id = $1 ORDER BY number`,
    [projectId],
  );
  return rows.map(r => ({
    id:          r.id,
    number:      r.number,
    title:       r.title,
    description: r.description ?? null,
  }));
}

export async function insertVolume(db, data, projectId) {
  const id = makeId('vol', projectId);
  await db.query(
    `INSERT INTO volumes (id, project_id, number, title, description)
     VALUES ($1,$2,$3,$4,$5)`,
    [id, projectId, data.number, data.title, data.description ?? null],
  );
  return id;
}

export async function updateVolume(db, volumeId, data, projectId) {
  await db.query(
    `UPDATE volumes SET number=$1, title=$2, description=$3
     WHERE id=$4 AND project_id=$5`,
    [data.number, data.title, data.description ?? null, volumeId, projectId],
  );
}

export async function deleteVolume(db, volumeId, projectId) {
  await db.query(
    `DELETE FROM volumes WHERE id=$1 AND project_id=$2`,
    [volumeId, projectId],
  );
}

// ── Personnages ───────────────────────────────────────────────────────────────

export async function getCharacters(db, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT * FROM characters WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );
  return rows.map(r => ({
    id:           r.id,
    name:         r.name,
    aliases:      parseJsonField(r.aliases, []),
    origin:       r.origin,
    description:  r.description,
    color:        r.color,
    journeyKey:   r.journey_key,
    race:         r.race         ?? null,
    role:         r.role         ?? null,
    affiliations: parseJsonField(r.affiliations, []),
    traits:       parseJsonField(r.traits, []),
    deathEventId: r.death_event_id ?? null,
    source:       r.source ?? 'import',
  }));
}

export async function findCharacterByName(db, search, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT * FROM characters
     WHERE project_id = $1
       AND (name ILIKE $2 OR aliases::text ILIKE $2)
     LIMIT 1`,
    [projectId, `%${search}%`],
  );
  if (!rows.length) return null;
  const r = rows[0];
  return {
    id: r.id, name: r.name,
    aliases: parseJsonField(r.aliases, []),
  };
}

// ── Lieux ─────────────────────────────────────────────────────────────────────

export async function getLocations(db, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT * FROM locations WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );
  return rows.map(r => ({
    id:          r.id,
    name:        r.name,
    type:        r.type,
    regime:      r.regime,
    description: r.description,
    coordinates: parseJsonField(r.coordinates, null),
    inhabitants: parseJsonField(r.inhabitants, []),
    visitedBy:   parseJsonField(r.visited_by, []),
    keyPlaces:   parseJsonField(r.key_places, []),
    source:      r.source ?? 'import',
  }));
}

// ── Objets ────────────────────────────────────────────────────────────────────

export async function getObjects(db, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT * FROM objects WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );
  return rows.map(r => ({
    id:                     r.id,
    name:                   r.name,
    type:                   r.type,
    description:            r.description,
    creator:                r.creator,
    currentHolder:          r.current_holder,
    powers:                 parseJsonField(r.powers, []),
    holders:                parseJsonField(r.holders, []),
    createdIn:              r.created_in ?? null,
    inscription:            r.inscription ?? null,
    status:                 r.status ?? 'active',
    statusChangedAtChapter: r.status_changed_at_chapter ?? null,
    source:                 r.source ?? 'import',
  }));
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export async function getTimelineEvents(db, projectId = 'lotr') {
  const { rows: evtRows } = await db.query(
    `SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY chapter_num, scene_order, id`,
    [projectId],
  );
  const { rows: entRows } = await db.query(
    `SELECT * FROM event_entities WHERE project_id = $1`,
    [projectId],
  );

  // Groupe les entités par event_id
  const entitiesByEvent = {};
  for (const e of entRows) {
    if (!entitiesByEvent[e.event_id]) entitiesByEvent[e.event_id] = [];
    entitiesByEvent[e.event_id].push({ id: e.entity_id, entityType: e.entity_type });
  }

  return evtRows.map(r => ({
      id:             r.id,
      chapter:        r.chapter_num,
      chapterTitle:   r.chapter_title,
      title:          r.title,
      description:    r.description,
      locationId:     r.location_id,
      beatId:         r.beat_id ?? null,
      povCharacterId: r.pov_character_id ?? null,
      sceneOrder:     r.scene_order ?? 0,
      sceneGoal:      r.scene_goal     ?? null,
      sceneConflict:  r.scene_conflict ?? null,
      sceneOutcome:   r.scene_outcome  ?? null,
      entities:       entitiesByEvent[r.id] ?? [],
      threadIds:        parseJsonField(r.thread_ids, []),
      source:           r.source ?? 'import',
      volumeId:         r.volume_id ?? null,
      isFlashback:      r.is_flashback ?? false,
      storyChapterRef:  r.story_chapter_ref ?? null,
  }));
}

export async function getChapters(db, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT DISTINCT chapter_num AS number, chapter_title AS title
     FROM timeline_events WHERE project_id = $1
     ORDER BY chapter_num`,
    [projectId],
  );
  return rows;
}

export async function getChapterEvents(db, chapterNum, projectId = 'lotr') {
  const all = await getTimelineEvents(db, projectId);
  return all.filter(e => e.chapter === chapterNum);
}

// ── CRUD Personnages ──────────────────────────────────────────────────────────

export async function insertCharacter(db, data, projectId) {
  const id = makeId('char', projectId);
  await db.query(
    `INSERT INTO characters
       (id, project_id, name, aliases, race, role, affiliations, traits, origin, description, color, death_event_id, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,'manual')`,
    [
      id, projectId, data.name,
      JSON.stringify(data.aliases ?? []),
      data.race        ?? null,
      data.role        ?? null,
      JSON.stringify(data.affiliations ?? []),
      JSON.stringify(data.traits       ?? []),
      data.origin      ?? null,
      data.description ?? null,
      data.color       ?? '#64748b',
      data.deathEventId ?? null,
    ],
  );
  return id;
}

export async function updateCharacter(db, charId, data, projectId) {
  await db.query(
    `UPDATE characters SET
       name=$1, aliases=$2, race=$3, role=$4, affiliations=$5, traits=$6,
       origin=$7, description=$8, color=$9, death_event_id=$10,
       ${SOURCE_CASE}
     WHERE id=$11 AND project_id=$12`,
    [
      data.name,
      JSON.stringify(data.aliases      ?? []),
      data.race        ?? null,
      data.role        ?? null,
      JSON.stringify(data.affiliations ?? []),
      JSON.stringify(data.traits       ?? []),
      data.origin      ?? null,
      data.description ?? null,
      data.color       ?? '#64748b',
      data.deathEventId ?? null,
      charId, projectId,
    ],
  );
}

export async function deleteCharacter(db, charId, projectId) {
  await deleteEntity(db, 'characters', charId, projectId);
}

// ── CRUD Lieux ────────────────────────────────────────────────────────────────

export async function insertLocation(db, data, projectId) {
  const id = makeId('loc', projectId);
  await db.query(
    `INSERT INTO locations (id, project_id, name, type, regime, description, inhabitants, visited_by, key_places, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'manual')`,
    [
      id, projectId, data.name,
      data.type        ?? null,
      data.regime      ?? null,
      data.description ?? null,
      JSON.stringify(data.inhabitants ?? []),
      JSON.stringify(data.visitedBy   ?? []),
      JSON.stringify(data.keyPlaces   ?? []),
    ],
  );
  return id;
}

export async function updateLocation(db, locId, data, projectId) {
  await db.query(
    `UPDATE locations SET
       name=$1, type=$2, regime=$3, description=$4,
       inhabitants=$5, visited_by=$6, key_places=$7,
       ${SOURCE_CASE}
     WHERE id=$8 AND project_id=$9`,
    [
      data.name,
      data.type        ?? null,
      data.regime      ?? null,
      data.description ?? null,
      JSON.stringify(data.inhabitants ?? []),
      JSON.stringify(data.visitedBy   ?? []),
      JSON.stringify(data.keyPlaces   ?? []),
      locId, projectId,
    ],
  );
}

export async function deleteLocation(db, locId, projectId) {
  await deleteEntity(db, 'locations', locId, projectId);
}

// ── CRUD Objets ───────────────────────────────────────────────────────────────

export async function insertObject(db, data, projectId) {
  const id = makeId('obj', projectId);
  await db.query(
    `INSERT INTO objects
       (id, project_id, name, type, description, creator, current_holder,
        powers, holders, created_in, inscription, status, status_changed_at_chapter, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'manual')`,
    [
      id, projectId, data.name,
      data.type           ?? null,
      data.description    ?? null,
      data.creator        ?? null,
      data.currentHolder  ?? null,
      JSON.stringify(data.powers  ?? []),
      JSON.stringify(data.holders ?? []),
      data.createdIn      ?? null,
      data.inscription    ?? null,
      data.status         ?? 'active',
      data.statusChangedAtChapter ?? null,
    ],
  );
  return id;
}

export async function updateObject(db, objId, data, projectId) {
  await db.query(
    `UPDATE objects SET
       name=$1, type=$2, description=$3, creator=$4, current_holder=$5,
       powers=$6, holders=$7, created_in=$8, inscription=$9,
       status=$10, status_changed_at_chapter=$11,
       ${SOURCE_CASE}
     WHERE id=$12 AND project_id=$13`,
    [
      data.name,
      data.type          ?? null,
      data.description   ?? null,
      data.creator       ?? null,
      data.currentHolder ?? null,
      JSON.stringify(data.powers  ?? []),
      JSON.stringify(data.holders ?? []),
      data.createdIn     ?? null,
      data.inscription   ?? null,
      data.status        ?? 'active',
      data.statusChangedAtChapter ?? null,
      objId, projectId,
    ],
  );
}

export async function deleteObject(db, objId, projectId) {
  await deleteEntity(db, 'objects', objId, projectId);
}

// ── CRUD Événements Timeline ──────────────────────────────────────────────────

export async function insertTimelineEvent(db, data, projectId) {
  const id = makeId('evt', projectId);
  const { rows: maxRows } = await db.query(
    `SELECT COALESCE(MAX(scene_order), 0) AS max_order FROM timeline_events WHERE project_id = $1 AND chapter_num = $2`,
    [projectId, data.chapter],
  );
  const sceneOrder = data.sceneOrder ?? ((maxRows[0]?.max_order ?? 0) + 1);
  await db.query(
    `INSERT INTO timeline_events
       (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id,
        pov_character_id, scene_order, scene_goal, scene_conflict, scene_outcome,
        thread_ids, volume_id, is_flashback, story_chapter_ref, source)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,'manual')`,
    [
      id, projectId, data.chapter, data.chapterTitle, data.title,
      data.description ?? null, data.locationId ?? null, data.beatId ?? null,
      data.povCharacterId ?? null, sceneOrder,
      data.sceneGoal ?? null, data.sceneConflict ?? null, data.sceneOutcome ?? null,
      JSON.stringify(data.threadIds ?? []), data.volumeId ?? null,
      data.isFlashback ?? false, data.storyChapterRef ?? null,
    ],
  );
  for (const e of (data.entities ?? [])) {
    await db.query(
      `INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [id, projectId, e.id, e.entityType],
    );
  }
  return id;
}

export async function updateTimelineEvent(db, eventId, data, projectId) {
  await db.query(
    `UPDATE timeline_events SET
       chapter_num=$1, chapter_title=$2, title=$3, description=$4, location_id=$5, beat_id=$6,
       pov_character_id=$7, scene_order=$8,
       scene_goal=$9, scene_conflict=$10, scene_outcome=$11,
       thread_ids=$12, volume_id=$13,
       is_flashback=$14, story_chapter_ref=$15,
       ${SOURCE_CASE}
     WHERE id=$16 AND project_id=$17`,
    [
      data.chapter, data.chapterTitle, data.title,
      data.description ?? null, data.locationId ?? null, data.beatId ?? null,
      data.povCharacterId ?? null, data.sceneOrder ?? 0,
      data.sceneGoal ?? null, data.sceneConflict ?? null, data.sceneOutcome ?? null,
      JSON.stringify(data.threadIds ?? []), data.volumeId ?? null,
      data.isFlashback ?? false, data.storyChapterRef ?? null,
      eventId, projectId,
    ],
  );
  await db.query(`DELETE FROM event_entities WHERE event_id=$1 AND project_id=$2`, [eventId, projectId]);
  for (const e of (data.entities ?? [])) {
    await db.query(
      `INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [eventId, projectId, e.id, e.entityType],
    );
  }
}

export async function deleteTimelineEvent(db, eventId, projectId) {
  await db.query(`DELETE FROM event_entities WHERE event_id=$1 AND project_id=$2`, [eventId, projectId]);
  await db.query(`DELETE FROM timeline_events WHERE id=$1 AND project_id=$2`, [eventId, projectId]);
}

// ── Incohérences ──────────────────────────────────────────────────────────────

export async function getIncoherences(db, projectId = 'lotr') {
  const { rows: incRows } = await db.query(
    `SELECT * FROM incoherences WHERE project_id = $1 ORDER BY
       CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END`,
    [projectId],
  );
  const { rows: linkRows } = await db.query(
    `SELECT * FROM incoherence_links WHERE project_id = $1`,
    [projectId],
  );

  const linksByInc = {};
  for (const l of linkRows) {
    if (!linksByInc[l.incoherence_id]) linksByInc[l.incoherence_id] = [];
    linksByInc[l.incoherence_id].push({
      label:      l.label,
      entityId:   l.entity_id,
      entityType: l.entity_type,
    });
  }

  return incRows.map(r => ({
    id:             r.id,
    type:           r.type,
    severity:       r.severity,
    title:          r.title,
    explanation:    r.explanation,
    resolved:       r.resolved,
    resolutionNote: r.resolution_note ?? null,
    links:          linksByInc[r.id] ?? [],
  }));
}

export async function getEntityIncoherences(db, entityId, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT i.* FROM incoherences i
     JOIN incoherence_links l
       ON l.incoherence_id = i.id AND l.project_id = i.project_id
     WHERE i.project_id = $1 AND l.entity_id = $2`,
    [projectId, entityId],
  );
  return rows;
}

export async function deleteScanIncoherences(db, projectId) {
  // Récupère les IDs des incohérences scan_ pour nettoyer les liens d'abord
  const { rows } = await db.query(
    `SELECT id FROM incoherences WHERE project_id = $1 AND id LIKE 'scan_%'`,
    [projectId],
  );
  for (const r of rows) {
    await db.query(`DELETE FROM incoherence_links WHERE incoherence_id = $1 AND project_id = $2`, [r.id, projectId]);
  }
  await db.query(`DELETE FROM incoherences WHERE project_id = $1 AND id LIKE 'scan_%'`, [projectId]);
}

export async function insertScannedIncoherence(db, inc, projectId) {
  await db.query(
    `INSERT INTO incoherences (id, project_id, type, severity, title, explanation, resolved)
     VALUES ($1,$2,$3,$4,$5,$6,false)
     ON CONFLICT (id, project_id) DO NOTHING`,
    [inc.id, projectId, inc.type, inc.severity, inc.title, inc.explanation],
  );
  for (const link of (inc.links ?? [])) {
    await db.query(
      `INSERT INTO incoherence_links (incoherence_id, project_id, entity_id, entity_type, label)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [inc.id, projectId, link.entityId, link.entityType, link.label],
    );
  }
}

export async function setIncoherenceResolved(db, incId, resolved, projectId = 'lotr') {
  await db.query(
    `UPDATE incoherences SET resolved = $1 WHERE id = $2 AND project_id = $3`,
    [resolved, incId, projectId],
  );
}

export async function setResolutionNote(db, incId, note, projectId = 'lotr') {
  await db.query(
    `UPDATE incoherences SET resolution_note = $1 WHERE id = $2 AND project_id = $3`,
    [note || null, incId, projectId],
  );
}

// ── Save the Cat ──────────────────────────────────────────────────────────────

export async function getStcChapters(db, projectId = 'lotr') {
  const { rows: chRows } = await db.query(
    `SELECT * FROM stc_chapters WHERE project_id = $1 ORDER BY number`,
    [projectId],
  );
  const { rows: beatRows } = await db.query(
    `SELECT * FROM stc_chapter_beats WHERE project_id = $1`,
    [projectId],
  );
  const { rows: entityRows } = await db.query(
    `SELECT * FROM stc_chapter_entities WHERE project_id = $1`,
    [projectId],
  );

  const beatsByChapter = {};
  for (const b of beatRows) {
    if (!beatsByChapter[b.chapter_id]) beatsByChapter[b.chapter_id] = [];
    beatsByChapter[b.chapter_id].push(b.beat_id);
  }

  const entitiesByChapter = {};
  for (const e of entityRows) {
    if (!entitiesByChapter[e.chapter_id]) entitiesByChapter[e.chapter_id] = [];
    entitiesByChapter[e.chapter_id].push({ id: e.entity_id, entityType: e.entity_type });
  }

  return chRows.map(r => ({
    id:       r.id,
    number:   r.number,
    title:    r.title,
    summary:  r.summary,
    beats:    beatsByChapter[r.id]    ?? [],
    entities: entitiesByChapter[r.id] ?? [],
    volumeId: r.volume_id ?? null,
  }));
}

export async function insertStcChapter(db, { number, title, summary, beats, entities }, projectId = 'lotr') {
  const id = makeId('ch', projectId);
  await db.query(
    `INSERT INTO stc_chapters (id, project_id, number, title, summary) VALUES ($1,$2,$3,$4,$5)`,
    [id, projectId, number, title, summary ?? null],
  );
  for (const beatId of (beats ?? [])) {
    await db.query(
      `INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [id, projectId, beatId],
    );
  }
  for (const e of (entities ?? [])) {
    await db.query(
      `INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [id, projectId, e.id, e.entityType],
    );
  }
  return id;
}

export async function updateStcChapter(db, chapterId, { number, title, summary, beats, entities }, projectId = 'lotr') {
  await db.query(
    `UPDATE stc_chapters SET number=$1, title=$2, summary=$3 WHERE id=$4 AND project_id=$5`,
    [number, title, summary ?? null, chapterId, projectId],
  );
  await db.query(`DELETE FROM stc_chapter_beats WHERE chapter_id=$1 AND project_id=$2`, [chapterId, projectId]);
  for (const beatId of (beats ?? [])) {
    await db.query(
      `INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [chapterId, projectId, beatId],
    );
  }
  await db.query(`DELETE FROM stc_chapter_entities WHERE chapter_id=$1 AND project_id=$2`, [chapterId, projectId]);
  for (const e of (entities ?? [])) {
    await db.query(
      `INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [chapterId, projectId, e.id, e.entityType],
    );
  }
}

export async function deleteStcChapter(db, chapterId, projectId = 'lotr') {
  await db.query(`DELETE FROM stc_chapter_entities WHERE chapter_id=$1 AND project_id=$2`, [chapterId, projectId]);
  await db.query(`DELETE FROM stc_chapters WHERE id=$1 AND project_id=$2`, [chapterId, projectId]);
}

// ── Arc émotionnel ────────────────────────────────────────────────────────────

export async function getArcPoints(db, projectId) {
  const { rows } = await db.query(
    `SELECT chapter_number, intensity, note FROM arc_points WHERE project_id = $1 ORDER BY chapter_number`,
    [projectId],
  );
  return rows.map(r => ({ chapterNumber: r.chapter_number, intensity: r.intensity, note: r.note, volumeId: r.volume_id ?? null }));
}

export async function upsertArcPoint(db, projectId, chapterNumber, intensity) {
  await db.query(
    `INSERT INTO arc_points (project_id, chapter_number, intensity)
     VALUES ($1, $2, $3)
     ON CONFLICT (project_id, chapter_number) DO UPDATE SET intensity = $3`,
    [projectId, chapterNumber, intensity],
  );
}

// ── Notes libres par chapitre ─────────────────────────────────────────────────

export async function getChapterNotes(db, projectId) {
  const { rows } = await db.query(
    `SELECT chapter_num, content FROM chapter_notes WHERE project_id=$1`,
    [projectId],
  );
  return Object.fromEntries(rows.map(r => [r.chapter_num, r.content]));
}

export async function setChapterNote(db, projectId, chapterNum, content) {
  await db.query(
    `INSERT INTO chapter_notes (project_id, chapter_num, content)
     VALUES ($1,$2,$3)
     ON CONFLICT (project_id, chapter_num) DO UPDATE SET content=$3`,
    [projectId, chapterNum, content],
  );
}

// ── Projets ───────────────────────────────────────────────────────────────────

export async function getProjects(db) {
  const { rows } = await db.query(
    `SELECT id, name, description, created_at FROM projects ORDER BY created_at`,
  );
  return rows.map(r => ({ id: r.id, name: r.name, description: r.description, createdAt: r.created_at }));
}

export async function createProject(db, { name, description }) {
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 20);
  const id   = `${slug}_${Date.now()}`;
  await db.query(
    `INSERT INTO projects (id, name, description) VALUES ($1, $2, $3)`,
    [id, name.trim(), description?.trim() ?? null],
  );
  return id;
}

export async function deleteProject(db, projectId) {
  await db.query(`DELETE FROM projects WHERE id = $1`, [projectId]);
}

export async function getProjectMapImage(db, projectId) {
  const { rows } = await db.query(`SELECT map_image FROM projects WHERE id = $1`, [projectId]);
  return rows[0]?.map_image ?? null;
}

export async function setProjectMapImage(db, projectId, base64) {
  await db.query(`UPDATE projects SET map_image = $1 WHERE id = $2`, [base64, projectId]);
}

export async function setLocationCoordinates(db, locId, projectId, coords) {
  await db.query(
    `UPDATE locations SET coordinates = $1 WHERE id = $2 AND project_id = $3`,
    [coords ? JSON.stringify(coords) : null, locId, projectId],
  );
}

export async function saveJourney(db, projectId, charKey, steps) {
  await db.query(
    `DELETE FROM character_journeys WHERE project_id = $1 AND char_key = $2`,
    [projectId, charKey],
  );
  for (let i = 0; i < steps.length; i++) {
    await db.query(
      `INSERT INTO character_journeys (project_id, char_key, step_index, data) VALUES ($1,$2,$3,$4)`,
      [projectId, charKey, i, JSON.stringify(steps[i])],
    );
  }
}

// ── Lore agrégé ───────────────────────────────────────────────────────────────

/**
 * Charge characters + locations + objects en parallèle.
 * Format identique aux fichiers JS loreDB — utilisé pour initialiser le cache entityUtils.
 */
export async function getLoreData(db, projectId = 'lotr') {
  const [characters, locations, objects, groups] = await Promise.all([
    getCharacters(db, projectId),
    getLocations(db, projectId),
    getObjects(db, projectId),
    getGroups(db, projectId),
  ]);
  return { characters, locations, objects, groups };
}

// ── Trajets personnages ────────────────────────────────────────────────────────

export async function getJourney(db, charKey, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT data FROM character_journeys
     WHERE project_id = $1 AND char_key = $2
     ORDER BY step_index`,
    [projectId, charKey],
  );
  return rows.map(r => (typeof r.data === 'string' ? JSON.parse(r.data) : r.data));
}

export async function getAllJourneys(db, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT char_key, data FROM character_journeys
     WHERE project_id = $1
     ORDER BY char_key, step_index`,
    [projectId],
  );
  const result = {};
  for (const r of rows) {
    if (!result[r.char_key]) result[r.char_key] = [];
    result[r.char_key].push(typeof r.data === 'string' ? JSON.parse(r.data) : r.data);
  }
  return result;
}

// ── Utilitaires synchrones (travaillent sur données déjà chargées) ─────────────

/**
 * Génère les alertes Save the Cat à partir des chapitres chargés depuis la DB
 * et des beats statiques (BEATS constant du JS).
 */
export function computeAlerts(chapters, beats) {
  const total   = chapters.length;
  const beatMap = {};
  chapters.forEach(ch => ch.beats.forEach(id => { beatMap[id] = ch; }));

  const alerts = [];
  for (const beat of beats) {
    const ch = beatMap[beat.id];
    if (!ch) {
      if (beat.alertMessages.missing) {
        alerts.push({ type: 'missing', severity: 'warning', beat, message: beat.alertMessages.missing });
      }
      continue;
    }
    const actualPct = ((ch.number - 1 + 0.5) / total) * 100;
    const diff      = actualPct - beat.idealPercent;
    if (Math.abs(diff) > beat.tolerance) {
      const direction = diff > 0 ? 'late' : 'early';
      const severity  = Math.abs(diff) > beat.tolerance * 2 ? 'critical' : 'warning';
      const rawMsg    = diff > 0 ? beat.alertMessages.too_late : beat.alertMessages.too_early;
      alerts.push({
        type: 'position', severity, beat,
        actualPct: Math.round(actualPct * 10) / 10,
        idealPct: beat.idealPercent,
        diff: Math.round(diff * 10) / 10,
        direction, chapterTitle: ch.title, chapterNumber: ch.number, message: rawMsg ?? null,
      });
    }
  }
  return alerts;
}

// ── Plant / Payoff ────────────────────────────────────────────────────────────

export async function getPlants(db, projectId) {
  const { rows } = await db.query(
    `SELECT * FROM plant_payoffs WHERE project_id=$1 ORDER BY plant_chapter_num NULLS LAST, id`,
    [projectId],
  );
  return rows.map(r => ({
    id:               r.id,
    label:            r.label,
    type:             r.type ?? 'information',
    plantChapterNum:  r.plant_chapter_num  ?? null,
    plantEventId:     r.plant_event_id     ?? null,
    plantVolumeId:    r.plant_volume_id    ?? null,
    payoffChapterNum: r.payoff_chapter_num ?? null,
    payoffEventId:    r.payoff_event_id    ?? null,
    payoffVolumeId:   r.payoff_volume_id   ?? null,
    entityId:         r.entity_id          ?? null,
    entityType:       r.entity_type        ?? null,
    status:           r.status             ?? 'open',
    notes:            r.notes              ?? null,
  }));
}

export async function insertPlant(db, data, projectId) {
  const id = makeId('plant', projectId);
  await db.query(
    `INSERT INTO plant_payoffs
       (id, project_id, label, type, plant_chapter_num, plant_event_id,
        plant_volume_id, payoff_chapter_num, payoff_event_id, payoff_volume_id,
        entity_id, entity_type, status, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      id, projectId, data.label, data.type ?? 'information',
      data.plantChapterNum  ?? null, data.plantEventId    ?? null,
      data.plantVolumeId    ?? null,
      data.payoffChapterNum ?? null, data.payoffEventId   ?? null,
      data.payoffVolumeId   ?? null,
      data.entityId         ?? null, data.entityType      ?? null,
      data.status           ?? 'open', data.notes         ?? null,
    ],
  );
  return id;
}

export async function updatePlant(db, plantId, data, projectId) {
  await db.query(
    `UPDATE plant_payoffs SET
       label=$1, type=$2, plant_chapter_num=$3, plant_event_id=$4,
       plant_volume_id=$5, payoff_chapter_num=$6, payoff_event_id=$7,
       payoff_volume_id=$8, entity_id=$9, entity_type=$10, status=$11, notes=$12
     WHERE id=$13 AND project_id=$14`,
    [
      data.label, data.type ?? 'information',
      data.plantChapterNum  ?? null, data.plantEventId    ?? null,
      data.plantVolumeId    ?? null,
      data.payoffChapterNum ?? null, data.payoffEventId   ?? null,
      data.payoffVolumeId   ?? null,
      data.entityId         ?? null, data.entityType      ?? null,
      data.status           ?? 'open', data.notes         ?? null,
      plantId, projectId,
    ],
  );
}

export async function deletePlant(db, plantId, projectId) {
  await db.query(`DELETE FROM plant_payoffs WHERE id=$1 AND project_id=$2`, [plantId, projectId]);
}

// ── Groupes d'appartenance ─────────────────────────────────────────────────────

export async function getGroups(db, projectId) {
  const { rows: groupRows } = await db.query(
    `SELECT * FROM groups WHERE project_id=$1 ORDER BY name`,
    [projectId],
  );
  const { rows: memberRows } = await db.query(
    `SELECT * FROM character_groups WHERE project_id=$1`,
    [projectId],
  );
  const membersByGroup = {};
  for (const m of memberRows) {
    if (!membersByGroup[m.group_id]) membersByGroup[m.group_id] = [];
    membersByGroup[m.group_id].push({ characterId: m.character_id, roleInGroup: m.role_in_group ?? null });
  }
  return groupRows.map(r => ({
    id:          r.id,
    name:        r.name,
    type:        r.type        ?? 'autre',
    color:       r.color       ?? '#64748B',
    description: r.description ?? null,
    homelandId:  r.homeland_id ?? null,
    members:     membersByGroup[r.id] ?? [],
  }));
}

export async function insertGroup(db, data, projectId) {
  const id = makeId('grp', projectId);
  await db.query(
    `INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, projectId, data.name, data.type ?? 'autre', data.color ?? '#64748B', data.description ?? null, data.homelandId ?? null],
  );
  return id;
}

export async function updateGroup(db, groupId, data, projectId) {
  await db.query(
    `UPDATE groups SET name=$1, type=$2, color=$3, description=$4, homeland_id=$5
     WHERE id=$6 AND project_id=$7`,
    [data.name, data.type ?? 'autre', data.color ?? '#64748B', data.description ?? null, data.homelandId ?? null, groupId, projectId],
  );
}

export async function deleteGroup(db, groupId, projectId) {
  await db.query(`DELETE FROM character_groups WHERE group_id=$1 AND project_id=$2`, [groupId, projectId]);
  await db.query(`DELETE FROM groups WHERE id=$1 AND project_id=$2`, [groupId, projectId]);
}

export async function setCharacterGroups(db, characterId, groupIds, projectId) {
  await db.query(`DELETE FROM character_groups WHERE character_id=$1 AND project_id=$2`, [characterId, projectId]);
  for (const groupId of groupIds) {
    await db.query(
      `INSERT INTO character_groups (character_id, group_id, project_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
      [characterId, groupId, projectId],
    );
  }
}

// ── Fils narratifs ─────────────────────────────────────────────────────────────

export async function getThreads(db, projectId) {
  const { rows } = await db.query(
    `SELECT * FROM narrative_threads WHERE project_id=$1 ORDER BY sort_order, id`,
    [projectId],
  );
  return rows.map(r => ({
    id:          r.id,
    name:        r.name,
    color:       r.color       ?? '#3F51B5',
    role:        r.role        ?? 'subplot',
    description: r.description ?? null,
    sortOrder:   r.sort_order  ?? 0,
  }));
}

export async function insertThread(db, data, projectId) {
  const id = makeId('thread', projectId);
  await db.query(
    `INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, projectId, data.name, data.color ?? '#3F51B5', data.role ?? 'subplot', data.description ?? null, data.sortOrder ?? 0],
  );
  return id;
}

export async function updateThread(db, threadId, data, projectId) {
  await db.query(
    `UPDATE narrative_threads SET name=$1, color=$2, role=$3, description=$4, sort_order=$5
     WHERE id=$6 AND project_id=$7`,
    [data.name, data.color ?? '#3F51B5', data.role ?? 'subplot', data.description ?? null, data.sortOrder ?? 0, threadId, projectId],
  );
}

export async function deleteThread(db, threadId, projectId) {
  await db.query(`DELETE FROM narrative_threads WHERE id=$1 AND project_id=$2`, [threadId, projectId]);
}

// ── Arc des personnages ────────────────────────────────────────────────────────

/** Retourne tous les axes d'un personnage (triés par label). */
export async function getCharacterAxes(db, characterId, projectId) {
  const { rows } = await db.query(
    `SELECT * FROM character_arc_axes WHERE project_id=$1 AND character_id=$2 ORDER BY label`,
    [projectId, characterId],
  );
  return rows.map(r => ({ id: r.id, characterId: r.character_id, label: r.label, color: r.color }));
}

/** Retourne tous les labels d'axes du projet (pour l'autocomplétion). */
export async function getAllProjectAxisLabels(db, projectId) {
  const { rows } = await db.query(
    `SELECT DISTINCT label FROM character_arc_axes WHERE project_id=$1 ORDER BY label`,
    [projectId],
  );
  return rows.map(r => r.label);
}

/** Retourne tous les axes de tous les personnages du projet (pour la vue multi-personnages). */
export async function getAllCharacterAxes(db, projectId) {
  const { rows } = await db.query(
    `SELECT * FROM character_arc_axes WHERE project_id=$1 ORDER BY character_id, label`,
    [projectId],
  );
  return rows.map(r => ({ id: r.id, characterId: r.character_id, label: r.label, color: r.color }));
}

/** Crée un nouvel axe d'arc pour un personnage. */
export async function insertCharacterAxis(db, data, projectId) {
  const id = makeId('cax', projectId);
  await db.query(
    `INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
     VALUES ($1,$2,$3,$4,$5)`,
    [id, projectId, data.characterId, data.label, data.color ?? '#64748b'],
  );
  return id;
}

/** Supprime un axe et tous ses points. */
export async function deleteCharacterAxis(db, axisId, projectId) {
  await db.query(
    `DELETE FROM character_arc_points WHERE axis_id=$1 AND project_id=$2`,
    [axisId, projectId],
  );
  await db.query(
    `DELETE FROM character_arc_axes WHERE id=$1 AND project_id=$2`,
    [axisId, projectId],
  );
}

/** Insère ou met à jour un point de valeur sur un axe/chapitre. */
export async function upsertCharacterArcPoint(db, projectId, axisId, chapterNum, value, note, volumeId) {
  await db.query(
    `INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note, volume_id)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (project_id, axis_id, chapter_num)
     DO UPDATE SET value=$4, note=$5, volume_id=$6`,
    [projectId, axisId, chapterNum, value, note ?? null, volumeId ?? null],
  );
}

/** Retourne tous les points d'un axe, triés par chapitre. */
export async function getCharacterArcPoints(db, axisId, projectId) {
  const { rows } = await db.query(
    `SELECT chapter_num, value, note, volume_id FROM character_arc_points
     WHERE project_id=$1 AND axis_id=$2
     ORDER BY chapter_num`,
    [projectId, axisId],
  );
  return rows.map(r => ({ chapterNum: r.chapter_num, value: r.value, note: r.note, volumeId: r.volume_id ?? null }));
}

/** Retourne tous les points de tous les axes du projet (pour la vue multi-personnages). */
export async function getAllCharacterArcPoints(db, projectId) {
  const { rows } = await db.query(
    `SELECT axis_id, chapter_num, value, note, volume_id FROM character_arc_points
     WHERE project_id=$1
     ORDER BY axis_id, chapter_num`,
    [projectId],
  );
  return rows.map(r => ({ axisId: r.axis_id, chapterNum: r.chapter_num, value: r.value, note: r.note, volumeId: r.volume_id ?? null }));
}

/**
 * Génère les alertes Save the Cat à partir d'une beatEventMap (Map<beatId, event> ou Map<beatId, event[]>)
 * et du nombre total de chapitres — pas de dépendance aux chapitres STC.
 */
export function computeAlertsFromEvents(beatEventMap, totalChapters, beats) {
  const alerts = [];
  for (const beat of beats) {
    const evtOrEvts = beatEventMap.get(beat.id);
    // Supporte Map<beatId, event> (ancien) et Map<beatId, event[]> (multi-tome)
    const event = Array.isArray(evtOrEvts) ? evtOrEvts[0] : evtOrEvts;
    if (!event) {
      if (beat.alertMessages.missing) {
        alerts.push({ type: 'missing', severity: 'warning', beat, message: beat.alertMessages.missing });
      }
      continue;
    }
    const actualPct = ((event.chapter - 1 + 0.5) / totalChapters) * 100;
    const diff      = actualPct - beat.idealPercent;
    if (Math.abs(diff) > beat.tolerance) {
      const direction = diff > 0 ? 'late' : 'early';
      const severity  = Math.abs(diff) > beat.tolerance * 2 ? 'critical' : 'warning';
      const rawMsg    = diff > 0 ? beat.alertMessages.too_late : beat.alertMessages.too_early;
      alerts.push({
        type: 'position', severity, beat,
        actualPct: Math.round(actualPct * 10) / 10,
        idealPct: beat.idealPercent,
        diff: Math.round(diff * 10) / 10,
        direction, chapterTitle: event.title, chapterNumber: event.chapter, message: rawMsg ?? null,
      });
    }
  }
  return alerts;
}
