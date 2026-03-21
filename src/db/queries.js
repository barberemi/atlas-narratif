/**
 * Couche d'accès aux données — AtlasNarratif
 *
 * Toutes les fonctions prennent un `db` (PGliteWorker) et un `projectId`.
 * Elles retournent des objets au même format que les fichiers JS existants,
 * ce qui facilite la substitution view par view en Phase 3.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseJsonField(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value; // PGlite peut renvoyer l'objet directement si le type est JSONB
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
    aliases:      parseJsonField(r.aliases,      []),
    race:         r.race,
    role:         r.role,
    origin:       r.origin,
    affiliation:  parseJsonField(r.affiliations, []),  // stocké dans col 'affiliations' (issu de c.affiliation)
    description:  r.description,
    traits:       parseJsonField(r.traits,       []),
    color:        r.color,
    journeyKey:   r.journey_key,
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
  return rows.map(r => {
    const extra = parseJsonField(r.extra, {});
    return {
      id:          r.id,
      name:        r.name,
      type:        r.type,
      regime:      r.regime,
      description: r.description,
      coordinates: parseJsonField(r.coordinates, null),
      inhabitants: extra.inhabitants ?? [],
      visitedBy:   extra.visitedBy   ?? [],
      keyPlaces:   extra.keyPlaces   ?? [],
    };
  });
}

// ── Objets ────────────────────────────────────────────────────────────────────

export async function getObjects(db, projectId = 'lotr') {
  const { rows } = await db.query(
    `SELECT * FROM objects WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );
  return rows.map(r => {
    const extra = parseJsonField(r.extra, {});
    return {
      id:            r.id,
      name:          r.name,
      type:          r.type,
      description:   r.description,
      creator:       r.creator,
      currentHolder: r.current_holder,
      powers:        extra.powers      ?? [],
      holders:       extra.holders     ?? [],
      createdIn:     extra.createdIn   ?? null,
      inscription:   extra.inscription ?? null,
    };
  });
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export async function getTimelineEvents(db, projectId = 'lotr') {
  const { rows: evtRows } = await db.query(
    `SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY chapter_num, id`,
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
    id:           r.id,
    chapter:      r.chapter_num,
    chapterTitle: r.chapter_title,
    title:        r.title,
    description:  r.description,
    locationId:   r.location_id,
    entities:     entitiesByEvent[r.id] ?? [],
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
    id:          r.id,
    type:        r.type,
    severity:    r.severity,
    title:       r.title,
    explanation: r.explanation,
    resolved:    r.resolved,
    links:       linksByInc[r.id] ?? [],
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

export async function setIncoherenceResolved(db, incId, resolved, projectId = 'lotr') {
  await db.query(
    `UPDATE incoherences SET resolved = $1 WHERE id = $2 AND project_id = $3`,
    [resolved, incId, projectId],
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
  }));
}

export async function insertStcChapter(db, { number, title, summary, beats, entities }, projectId = 'lotr') {
  const id = `ch_${projectId}_${Date.now()}`;
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

// ── Lore agrégé ───────────────────────────────────────────────────────────────

/**
 * Charge characters + locations + objects en parallèle.
 * Format identique aux fichiers JS loreDB — utilisé pour initialiser le cache entityUtils.
 */
export async function getLoreData(db, projectId = 'lotr') {
  const [characters, locations, objects] = await Promise.all([
    getCharacters(db, projectId),
    getLocations(db, projectId),
    getObjects(db, projectId),
  ]);
  return { characters, locations, objects };
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
 * Détecte les conflits de présence simultanée (même perso, lieux différents,
 * même chapitre). Accepte le tableau d'événements en paramètre.
 * Retourne un Set d'eventIds en conflit.
 */
export function computeConflicts(events) {
  const conflictEventIds = new Set();
  const chapters = [...new Set(events.map(e => e.chapter))].sort((a, b) => a - b);

  for (const chNum of chapters) {
    const chEvts = events.filter(e => e.chapter === chNum);
    const charLocations = new Map();

    for (const evt of chEvts) {
      if (!evt.locationId) continue;
      for (const entity of evt.entities.filter(e => e.entityType === 'character')) {
        if (!charLocations.has(entity.id)) charLocations.set(entity.id, []);
        charLocations.get(entity.id).push({ locationId: evt.locationId, eventId: evt.id });
      }
    }
    for (const [, presences] of charLocations) {
      if (new Set(presences.map(p => p.locationId)).size > 1) {
        presences.forEach(p => conflictEventIds.add(p.eventId));
      }
    }
  }
  return conflictEventIds;
}

/**
 * Pour un événement en conflit, retourne quels personnages apparaissent
 * aussi dans un autre lieu du même chapitre, et où.
 */
export function computeConflictDetails(eventId, events) {
  const event = events.find(e => e.id === eventId);
  if (!event?.locationId) return [];

  const sameChapter = events.filter(e =>
    e.chapter === event.chapter && e.id !== eventId &&
    e.locationId && e.locationId !== event.locationId,
  );
  const eventCharIds = event.entities.filter(e => e.entityType === 'character').map(e => e.id);
  const result = [];

  for (const other of sameChapter) {
    const otherCharIds = other.entities.filter(e => e.entityType === 'character').map(e => e.id);
    const shared = eventCharIds.filter(id => otherCharIds.includes(id));
    if (shared.length > 0) {
      result.push({ charIds: shared, otherEventTitle: other.title, otherLocationId: other.locationId });
    }
  }
  return result;
}

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
      const direction = diff > 0 ? 'tard' : 'tôt';
      const severity  = Math.abs(diff) > beat.tolerance * 2 ? 'critical' : 'warning';
      const rawMsg    = diff > 0 ? beat.alertMessages.too_late : beat.alertMessages.too_early;
      const message   = rawMsg
        || `"${beat.label}" arrive trop ${direction} (${Math.round(actualPct)}% au lieu de ${beat.idealPercent}%).`;
      alerts.push({
        type: 'position', severity, beat,
        actualPct: Math.round(actualPct * 10) / 10,
        idealPct: beat.idealPercent,
        diff: Math.round(diff * 10) / 10,
        direction, chapterTitle: ch.title, chapterNumber: ch.number, message,
      });
    }
  }
  return alerts;
}
