/**
 * Seeder générique — insère n'importe quel projet narratif en DB.
 *
 * Usage :
 *   import { seedProject } from './seed.generic';
 *   await seedProject(db, meta, data);
 *
 * @param {object} db        — instance PGlite
 * @param {object} meta      — { id, name, description }
 * @param {object} data      — { loreDB, timelineDB, incoherencesDB, chaptersDB, journeys }
 *   loreDB        → { characters[], locations[], objects[] }
 *   timelineDB    → timeline_events[]
 *   incoherencesDB→ incoherences[]
 *   chaptersDB    → stc_chapters[]
 *   journeys      → [{ key, data[] }]  (optionnel)
 */
export async function seedProject(db, meta, data) {
  const projectId = meta.id;

  await db.exec('BEGIN');
  try {
    const { rows } = await db.query('SELECT id FROM projects WHERE id = $1', [projectId]);
    if (rows.length > 0) {
      const { rows: inc } = await db.query(
        'SELECT COUNT(*) AS n FROM incoherences WHERE project_id = $1', [projectId],
      );
      if (Number(inc[0].n) > 0) {
        await db.exec('ROLLBACK');
        // Migration additive : ajoute les trajets si absents
        await _seedJourneysIfMissing(db, projectId, data.journeys ?? []);
        return;
      }
      // Seed partiel → supprimer (CASCADE) et recommencer
      await db.query('DELETE FROM projects WHERE id = $1', [projectId]);
    }
    await _doSeed(db, projectId, meta, data);
    if (meta.mapImage) {
      await db.query(`UPDATE projects SET map_image = $1 WHERE id = $2`, [meta.mapImage, projectId]);
    }
    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }
}

// ── Privé ──────────────────────────────────────────────────────────────────────

async function _seedJourneysIfMissing(db, projectId, journeys) {
  if (!journeys.length) return;
  const { rows } = await db.query(
    'SELECT COUNT(*) AS n FROM character_journeys WHERE project_id = $1', [projectId],
  );
  if (Number(rows[0].n) > 0) return;
  for (const { key, data } of journeys) {
    for (let i = 0; i < data.length; i++) {
      await db.query(
        `INSERT INTO character_journeys (project_id, char_key, step_index, data)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [projectId, key, i, JSON.stringify(data[i])],
      );
    }
  }
}

async function _doSeed(db, projectId, meta, data) {
  const { loreDB = {}, timelineDB = [], incoherencesDB = [], chaptersDB = [], journeys = [] } = data;

  // ── Projet ──────────────────────────────────────────────────────────────────
  await db.query(
    `INSERT INTO projects (id, name, description) VALUES ($1, $2, $3)`,
    [projectId, meta.name, meta.description ?? null],
  );

  // ── Personnages ─────────────────────────────────────────────────────────────
  for (const c of (loreDB.characters ?? [])) {
    await db.query(
      `INSERT INTO characters
         (id, project_id, name, aliases, race, role, origin, affiliations, description, traits, color, journey_key, extra)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        c.id, projectId, c.name,
        JSON.stringify(c.aliases     ?? []),
        c.race        ?? null,
        c.role        ?? null,
        c.origin      ?? null,
        JSON.stringify(c.affiliation ?? []),
        c.description ?? null,
        JSON.stringify(c.traits      ?? []),
        c.color       ?? '#64748b',
        c.journeyKey  ?? null,
        JSON.stringify({}),
      ],
    );
  }

  // ── Lieux ───────────────────────────────────────────────────────────────────
  for (const l of (loreDB.locations ?? [])) {
    await db.query(
      `INSERT INTO locations
         (id, project_id, name, type, regime, description, coordinates, extra)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        l.id, projectId, l.name,
        l.type        ?? null,
        l.regime      ?? null,
        l.description ?? null,
        l.coordinates ? JSON.stringify(l.coordinates) : 'null',
        JSON.stringify({
          inhabitants: l.inhabitants ?? [],
          visitedBy:   l.visitedBy   ?? [],
          keyPlaces:   l.keyPlaces   ?? [],
        }),
      ],
    );
  }

  // ── Objets ──────────────────────────────────────────────────────────────────
  for (const o of (loreDB.objects ?? [])) {
    await db.query(
      `INSERT INTO objects
         (id, project_id, name, type, description, creator, current_holder, extra)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        o.id, projectId, o.name,
        o.type          ?? null,
        o.description   ?? null,
        o.creator       ?? null,
        o.currentHolder ?? null,
        JSON.stringify({
          powers:      o.powers      ?? [],
          holders:     o.holders     ?? [],
          createdIn:   o.createdIn   ?? null,
          inscription: o.inscription ?? null,
        }),
      ],
    );
  }

  // ── Événements timeline ─────────────────────────────────────────────────────
  for (const evt of timelineDB) {
    await db.query(
      `INSERT INTO timeline_events
         (id, project_id, chapter_num, chapter_title, title, description, location_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        evt.id, projectId,
        evt.chapter, evt.chapterTitle,
        evt.title,   evt.description ?? null,
        evt.locationId ?? null,
      ],
    );
    for (const entity of (evt.entities ?? [])) {
      await db.query(
        `INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [evt.id, projectId, entity.id, entity.entityType],
      );
    }
  }

  // ── Incohérences ────────────────────────────────────────────────────────────
  for (const inc of incoherencesDB) {
    await db.query(
      `INSERT INTO incoherences
         (id, project_id, type, severity, title, explanation)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [inc.id, projectId, inc.type, inc.severity, inc.title, inc.explanation ?? null],
    );
    for (const link of (inc.links ?? [])) {
      await db.query(
        `INSERT INTO incoherence_links
           (incoherence_id, project_id, entity_id, entity_type, label)
         VALUES ($1,$2,$3,$4,$5)`,
        [inc.id, projectId, link.entityId, link.entityType, link.label ?? null],
      );
    }
  }

  // ── Save the Cat ────────────────────────────────────────────────────────────
  for (const ch of chaptersDB) {
    await db.query(
      `INSERT INTO stc_chapters (id, project_id, number, title, summary)
       VALUES ($1,$2,$3,$4,$5)`,
      [ch.id, projectId, ch.number, ch.title, ch.summary ?? null],
    );
    for (const beatId of (ch.beats ?? [])) {
      await db.query(
        `INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
         VALUES ($1,$2,$3)`,
        [ch.id, projectId, beatId],
      );
    }
  }

  // ── Trajets personnages ──────────────────────────────────────────────────────
  for (const { key, data } of journeys) {
    for (let i = 0; i < data.length; i++) {
      await db.query(
        `INSERT INTO character_journeys (project_id, char_key, step_index, data)
         VALUES ($1,$2,$3,$4)`,
        [projectId, key, i, JSON.stringify(data[i])],
      );
    }
  }
}
