/**
 * Seeder générique — insère n'importe quel projet narratif en DB.
 *
 * Usage :
 *   import { seedProject } from './seed.generic';
 *   await seedProject(db, meta, data);
 *
 * @param {object} db        — instance PGlite
 * @param {object} meta      — { id, name, description }
 * @param {object} data      — { loreDB, timelineDB, incoherencesDB, chaptersDB, journeys, groupsDB, plantsDB, arcPointsDB }
 *   loreDB        → { characters[], locations[], objects[] }
 *   timelineDB    → timeline_events[]
 *   incoherencesDB→ incoherences[]
 *   chaptersDB    → stc_chapters[]
 *   journeys      → [{ key, data[] }]  (optionnel)
 *   groupsDB      → groups[] (optionnel)
 *   plantsDB      → plant_payoffs[] (optionnel)
 *   arcPointsDB   → arc_points[] (optionnel)
 */
export async function seedProject(db, meta, data, { onProgress } = {}) {
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
    await _doSeed(db, projectId, meta, data, onProgress);
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

async function _doSeed(db, projectId, meta, data, onProgress) {
  const { loreDB = {}, timelineDB = [], incoherencesDB = [], chaptersDB = [], journeys = [], groupsDB = [], plantsDB = [], arcPointsDB = [], threadsDB = [], eventExtrasDB = {}, characterArcsDB = [], heroJourneyDB = [], volumesDB = [] } = data;

  // Calcul du nombre total d'items pour le pourcentage
  const characters = loreDB.characters ?? [];
  const locations  = loreDB.locations  ?? [];
  const objects    = loreDB.objects    ?? [];
  const journeySteps = journeys.reduce((s, j) => s + j.data.length, 0);
  const arcPoints  = characterArcsDB.reduce((s, a) => s + (a.points ?? []).length, 0);
  const total = (
    volumesDB.length + characters.length + locations.length + objects.length +
    timelineDB.length + incoherencesDB.length + chaptersDB.length +
    journeySteps + groupsDB.length + plantsDB.length +
    arcPointsDB.length + threadsDB.length + arcPoints + heroJourneyDB.length
  ) || 1;
  let done = 0;
  const report = (message) => {
    if (onProgress) onProgress({ message, percent: Math.round((done / total) * 100) });
  };

  // ── Projet ──────────────────────────────────────────────────────────────────
  await db.query(
    `INSERT INTO projects (id, name, description) VALUES ($1, $2, $3)`,
    [projectId, meta.name, meta.description ?? null],
  );

  // ── Volumes ─────────────────────────────────────────────────────────────────
  report('Volumes…');
  for (const v of volumesDB) {
    await db.query(
      `INSERT INTO volumes (id, project_id, number, title, description)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [v.id, projectId, v.number, v.title, v.description ?? null],
    );
    done++;
  }

  // ── Personnages ─────────────────────────────────────────────────────────────
  report('Personnages…');
  for (const c of characters) {
    await db.query(
      `INSERT INTO characters
         (id, project_id, name, aliases, race, role, affiliations, traits, origin, description, color, journey_key, death_event_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        c.id, projectId, c.name,
        JSON.stringify(c.aliases                    ?? []),
        c.race                                      ?? null,
        c.role                                      ?? null,
        JSON.stringify(c.affiliation ?? c.affiliations ?? []),
        JSON.stringify(c.traits                     ?? []),
        c.origin                                    ?? null,
        c.description                               ?? null,
        c.color                                     ?? '#64748b',
        c.journeyKey                                ?? null,
        c.deathEventId                              ?? null,
      ],
    );
    done++;
  }

  // ── Lieux ───────────────────────────────────────────────────────────────────
  report('Lieux…');
  for (const l of locations) {
    await db.query(
      `INSERT INTO locations
         (id, project_id, name, type, regime, description, coordinates, inhabitants, visited_by, key_places)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        l.id, projectId, l.name,
        l.type        ?? null,
        l.regime      ?? null,
        l.description ?? null,
        l.coordinates ? JSON.stringify(l.coordinates) : 'null',
        JSON.stringify(l.inhabitants ?? []),
        JSON.stringify(l.visitedBy   ?? []),
        JSON.stringify(l.keyPlaces   ?? []),
      ],
    );
    done++;
  }

  // ── Objets ──────────────────────────────────────────────────────────────────
  report('Objets…');
  for (const o of objects) {
    await db.query(
      `INSERT INTO objects
         (id, project_id, name, type, description, creator, current_holder,
          powers, holders, created_in, inscription, status, status_changed_at_chapter)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        o.id, projectId, o.name,
        o.type          ?? null,
        o.description   ?? null,
        o.creator       ?? null,
        o.currentHolder ?? null,
        JSON.stringify(o.powers  ?? []),
        JSON.stringify(o.holders ?? []),
        o.createdIn     ?? null,
        o.inscription   ?? null,
        o.status        ?? 'active',
        o.statusChangedAtChapter ?? null,
      ],
    );
    done++;
  }

  // ── Événements timeline ─────────────────────────────────────────────────────
  report('Événements…');
  for (const evt of timelineDB) {
    const ex = eventExtrasDB[evt.id] ?? {};
    await db.query(
      `INSERT INTO timeline_events
         (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id,
          pov_character_id, thread_ids, scene_order, scene_goal, scene_conflict, scene_outcome, volume_id,
          is_flashback, story_chapter_ref)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        evt.id, projectId,
        evt.chapter, evt.chapterTitle ?? '',
        evt.title,   evt.description ?? null,
        evt.locationId      ?? null,
        ex.beatId           ?? null,
        ex.povCharacterId   ?? null,
        JSON.stringify(ex.threadIds ?? []),
        ex.sceneOrder       ?? 0,
        ex.sceneGoal        ?? null,
        ex.sceneConflict    ?? null,
        ex.sceneOutcome     ?? null,
        evt.volumeId        ?? null,
        evt.isFlashback     ?? false,
        evt.storyChapterRef ?? null,
      ],
    );
    for (const entity of (evt.entities ?? [])) {
      await db.query(
        `INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [evt.id, projectId, entity.id, entity.entityType],
      );
    }
    done++;
    report(`Événement ${done} / ${timelineDB.length}…`);
  }

  // ── Incohérences ────────────────────────────────────────────────────────────
  report('Incohérences…');
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
    done++;
  }

  // ── Save the Cat ────────────────────────────────────────────────────────────
  report('Chapitres STC…');
  for (const ch of chaptersDB) {
    await db.query(
      `INSERT INTO stc_chapters (id, project_id, number, title, summary, volume_id)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [ch.id, projectId, ch.number, ch.title, ch.summary ?? null, ch.volumeId ?? null],
    );
    for (const beatId of (ch.beats ?? [])) {
      await db.query(
        `INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
         VALUES ($1,$2,$3)`,
        [ch.id, projectId, beatId],
      );
    }
    done++;
  }

  // ── Trajets personnages ──────────────────────────────────────────────────────
  report('Trajets…');
  for (const { key, data } of journeys) {
    for (let i = 0; i < data.length; i++) {
      await db.query(
        `INSERT INTO character_journeys (project_id, char_key, step_index, data)
         VALUES ($1,$2,$3,$4)`,
        [projectId, key, i, JSON.stringify(data[i])],
      );
      done++;
    }
  }

  // ── Groupes d'appartenance ───────────────────────────────────────────────────
  report('Groupes…');
  for (const g of groupsDB) {
    await db.query(
      `INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      [g.id, projectId, g.name, g.type ?? 'autre', g.color ?? '#64748B', g.description ?? null, g.homelandId ?? null],
    );
    for (const m of (g.members ?? [])) {
      await db.query(
        `INSERT INTO character_groups (character_id, group_id, project_id, role_in_group)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [m.characterId, g.id, projectId, m.roleInGroup ?? null],
      );
    }
    done++;
  }

  // ── Amorces narratives ───────────────────────────────────────────────────────
  const PLANT_TYPE_NORM = { objet: 'object', personnage: 'character', indice: 'information', comportement: 'character', 'thème': 'theme' };
  const PLANT_STATUS_NORM = { closed: 'resolved', résolu: 'resolved', abandonné: 'dropped' };
  report('Amorces narratives…');
  for (const p of plantsDB) {
    const rawType   = (p.type ?? 'information').toLowerCase();
    const rawStatus = (p.status ?? 'open').toLowerCase();
    await db.query(
      `INSERT INTO plant_payoffs
         (id, project_id, label, type, plant_chapter_num, plant_event_id, payoff_chapter_num, payoff_event_id, entity_id, entity_type, status, notes, plant_volume_id, payoff_volume_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT DO NOTHING`,
      [
        p.id, projectId, p.label, PLANT_TYPE_NORM[rawType] ?? rawType,
        p.plant_chapter_num ?? null, p.plant_event_id ?? null,
        p.payoff_chapter_num ?? null, p.payoff_event_id ?? null,
        p.entity_id ?? null, p.entity_type ?? null,
        PLANT_STATUS_NORM[rawStatus] ?? rawStatus, p.notes ?? null,
        p.plantVolumeId ?? null, p.payoffVolumeId ?? null,
      ],
    );
    done++;
  }

  // ── Arc émotionnel ───────────────────────────────────────────────────────────
  report('Arc émotionnel…');
  for (const pt of arcPointsDB) {
    await db.query(
      `INSERT INTO arc_points (project_id, chapter_number, intensity, note)
       VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
      [projectId, pt.chapter_number, pt.intensity, pt.note ?? null],
    );
    done++;
  }

  // ── Fils narratifs ────────────────────────────────────────────────────────────
  report('Fils narratifs…');
  for (const t of threadsDB) {
    await db.query(
      `INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
      [t.id, projectId, t.name, t.color ?? '#3F51B5', t.role ?? 'subplot', t.description ?? null, t.sort_order ?? 0],
    );
    done++;
  }

  // ── Arcs des personnages ──────────────────────────────────────────────────────
  report('Arcs des personnages…');
  for (const axis of characterArcsDB) {
    await db.query(
      `INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
       VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
      [axis.id, projectId, axis.characterId, axis.label, axis.color ?? '#64748b'],
    );
    for (const pt of (axis.points ?? [])) {
      await db.query(
        `INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [projectId, axis.id, pt.chapter_num, pt.value, pt.note ?? null],
      );
      done++;
    }
  }

  // ── Voyage du Héros ───────────────────────────────────────────────────────────
  report('Voyage du Héros…');
  for (const e of heroJourneyDB) {
    const id = `hj_${e.characterId}_${e.stageKey}`;
    await db.query(
      `INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary)
       VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT DO NOTHING`,
      [id, projectId, e.stageKey, e.characterId ?? null, e.chapterNum ?? null, e.summary ?? null],
    );
    done++;
  }
  report('Finalisation…');
}
