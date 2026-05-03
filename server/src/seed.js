/**
 * Seeder générique — insère un projet narratif dans PostgreSQL via postgres.js.
 *
 * Même interface que le seed.generic.js frontend, sans le paramètre `db`.
 * meta : { id, name, description, mapImage? }
 * data : { loreDB, timelineDB, incoherencesDB, chaptersDB, journeys,
 *           groupsDB, plantsDB, arcPointsDB, threadsDB, eventExtrasDB,
 *           characterArcsDB, heroJourneyDB, volumesDB }
 */

import sql from './db.js';
import { encrypt, createProjectDek, getProjectDek } from './crypto.js';

export async function seedProject(meta, data, { onProgress, userId, deviceId } = {}) {
  // Pour les projets de démo (id fixe comme 'lotr'), créer une copie par user/device
  // pour éviter les conflits entre utilisateurs différents.
  const baseId    = meta.id;
  const projectId = _resolveProjectId(baseId, { userId, deviceId });

  // Vérifie si le projet existe déjà pour ce contexte
  const [existing] = await sql`SELECT id FROM projects WHERE id = ${projectId}`;
  if (existing) {
    const [cnt] = await sql`SELECT COUNT(*) AS n FROM incoherences WHERE project_id = ${projectId}`;
    if (Number(cnt.n) > 0) {
      // Projet complet → trajets manquants seulement
      await _seedJourneysIfMissing(projectId, data.journeys ?? []);
      return projectId;
    }
    // Seed partiel → supprimer en cascade et recommencer
    await sql`DELETE FROM projects WHERE id = ${projectId}`;
  }

  await sql.begin(async (tx) => {
    await _doSeed(tx, projectId, meta, data, onProgress, { userId, deviceId });
  });

  return projectId;
}

/** Génère un ID de projet unique par user/device pour les démos à ID fixe. */
function _resolveProjectId(baseId, { userId, deviceId }) {
  if (userId)   return `${baseId}_u_${userId.replace(/-/g, '').slice(0, 12)}`;
  if (deviceId) return `${baseId}_d_${deviceId.replace(/-/g, '').slice(0, 12)}`;
  return baseId;
}

// ── Helpers privés ────────────────────────────────────────────────────────────

async function _seedJourneysIfMissing(projectId, journeys) {
  if (!journeys.length) return;
  const [cnt] = await sql`SELECT COUNT(*) AS n FROM character_journeys WHERE project_id = ${projectId}`;
  if (Number(cnt.n) > 0) return;
  const dek = await getProjectDek(projectId);
  for (const { key, data } of journeys) {
    for (let i = 0; i < data.length; i++) {
      await sql`
        INSERT INTO character_journeys (project_id, char_key, step_index, data)
        VALUES (${projectId}, ${key}, ${i}, ${encrypt(data[i], dek) ?? data[i]})
        ON CONFLICT DO NOTHING
      `;
    }
  }
}

async function _doSeed(tx, projectId, meta, data, onProgress, { userId, deviceId } = {}) {
  const {
    loreDB = {}, timelineDB = [], incoherencesDB = [], chaptersDB = [],
    journeys = [], groupsDB = [], plantsDB = [], arcPointsDB = [],
    threadsDB = [], eventExtrasDB = {}, characterArcsDB = [],
    heroJourneyDB = [], volumesDB = [],
  } = data;

  const characters  = loreDB.characters ?? [];
  const locations   = loreDB.locations  ?? [];
  const objects     = loreDB.objects    ?? [];
  const journeySteps = journeys.reduce((s, j) => s + j.data.length, 0);
  const arcPoints   = characterArcsDB.reduce((s, a) => s + (a.points ?? []).length, 0);
  const total = (
    volumesDB.length + characters.length + locations.length + objects.length +
    timelineDB.length + incoherencesDB.length + chaptersDB.length +
    journeySteps + groupsDB.length + plantsDB.length +
    arcPointsDB.length + threadsDB.length + arcPoints + heroJourneyDB.length
  ) || 1;
  let done = 0;

  function report(message) {
    if (onProgress) onProgress({ message, percent: Math.round((done / total) * 100) });
  }

  // ── Projet ──────────────────────────────────────────────────────────────────
  await tx`INSERT INTO projects (id, name, description, user_id, device_id) VALUES (${projectId}, ${meta.name}, ${meta.description ?? null}, ${userId ?? null}, ${deviceId ?? null})`;

  // Créer une DEK pour le chiffrement du projet (dans la même transaction)
  const dek = await createProjectDek(projectId, tx);
  const e = (v) => encrypt(v, dek);

  // ── Volumes ─────────────────────────────────────────────────────────────────
  report('Volumes…');
  for (const v of volumesDB) {
    await tx`
      INSERT INTO volumes (id, project_id, number, title, description)
      VALUES (${v.id}, ${projectId}, ${v.number}, ${e(v.title)}, ${e(v.description ?? null)})
      ON CONFLICT DO NOTHING
    `;
    done++;
  }

  // ── Personnages ─────────────────────────────────────────────────────────────
  report('Personnages…');
  for (const c of characters) {
    await tx`
      INSERT INTO characters
        (id, project_id, name, aliases, race, role, affiliations, traits, origin, description, color, journey_key, death_event_id)
      VALUES (
        ${c.id}, ${projectId}, ${e(c.name)},
        ${e(c.aliases ?? [])}, ${e(c.race ?? null)}, ${e(c.role ?? null)},
        ${e(c.affiliation ?? c.affiliations ?? [])}, ${e(c.traits ?? [])},
        ${e(c.origin ?? null)}, ${e(c.description ?? null)},
        ${c.color ?? '#64748b'}, ${c.journeyKey ?? null}, ${c.deathEventId ?? null}
      )
    `;
    done++;
  }

  // ── Lieux ───────────────────────────────────────────────────────────────────
  report('Lieux…');
  for (const l of locations) {
    await tx`
      INSERT INTO locations
        (id, project_id, name, type, regime, description, coordinates, inhabitants, visited_by, key_places)
      VALUES (
        ${l.id}, ${projectId}, ${e(l.name)},
        ${e(l.type ?? null)}, ${e(l.regime ?? null)}, ${e(l.description ?? null)},
        ${l.coordinates ?? null},
        ${e(l.inhabitants ?? [])}, ${e(l.visitedBy ?? [])}, ${e(l.keyPlaces ?? [])}
      )
    `;
    done++;
  }

  // ── Objets ──────────────────────────────────────────────────────────────────
  report('Objets…');
  for (const o of objects) {
    await tx`
      INSERT INTO objects
        (id, project_id, name, type, description, creator, current_holder,
         powers, holders, created_in, inscription, status, status_changed_at_chapter)
      VALUES (
        ${o.id}, ${projectId}, ${e(o.name)},
        ${e(o.type ?? null)}, ${e(o.description ?? null)}, ${e(o.creator ?? null)}, ${e(o.currentHolder ?? null)},
        ${e(o.powers ?? [])}, ${o.holders ?? []},
        ${o.createdIn ?? null}, ${e(o.inscription ?? null)},
        ${o.status ?? 'active'}, ${o.statusChangedAtChapter ?? null}
      )
    `;
    done++;
  }

  // ── Événements timeline ─────────────────────────────────────────────────────
  report('Événements…');
  for (const evt of timelineDB) {
    const ex = eventExtrasDB[evt.id] ?? {};
    await tx`
      INSERT INTO timeline_events
        (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id,
         pov_character_id, thread_ids, scene_order, scene_goal, scene_conflict, scene_outcome,
         volume_id, is_flashback, story_chapter_ref)
      VALUES (
        ${evt.id}, ${projectId},
        ${evt.chapter}, ${e(evt.chapterTitle ?? '')},
        ${e(evt.title)}, ${e(evt.description ?? null)},
        ${evt.locationId ?? null}, ${ex.beatId ?? null},
        ${ex.povCharacterId ?? null},
        ${ex.threadIds ?? []},
        ${ex.sceneOrder ?? 0},
        ${e(ex.sceneGoal ?? null)}, ${e(ex.sceneConflict ?? null)}, ${e(ex.sceneOutcome ?? null)},
        ${evt.volumeId ?? null},
        ${evt.isFlashback ?? false}, ${evt.storyChapterRef ?? null}
      )
    `;
    for (const entity of (evt.entities ?? [])) {
      await tx`
        INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
        VALUES (${evt.id}, ${projectId}, ${entity.id}, ${entity.entityType})
        ON CONFLICT DO NOTHING
      `;
    }
    done++;
    report(`Événements ${done}…`);
  }

  // ── Incohérences ────────────────────────────────────────────────────────────
  report('Incohérences…');
  for (const inc of incoherencesDB) {
    await tx`
      INSERT INTO incoherences (id, project_id, type, severity, title, explanation)
      VALUES (${inc.id}, ${projectId}, ${inc.type}, ${inc.severity}, ${e(inc.title)}, ${e(inc.explanation ?? null)})
    `;
    for (const link of (inc.links ?? [])) {
      await tx`
        INSERT INTO incoherence_links (incoherence_id, project_id, entity_id, entity_type, label)
        VALUES (${inc.id}, ${projectId}, ${link.entityId}, ${link.entityType}, ${e(link.label ?? null)})
        ON CONFLICT DO NOTHING
      `;
    }
    done++;
  }

  // ── Save the Cat ────────────────────────────────────────────────────────────
  report('Chapitres STC…');
  for (const ch of chaptersDB) {
    await tx`
      INSERT INTO stc_chapters (id, project_id, number, title, summary, volume_id)
      VALUES (${ch.id}, ${projectId}, ${ch.number}, ${e(ch.title)}, ${e(ch.summary ?? null)}, ${ch.volumeId ?? null})
    `;
    for (const beatId of (ch.beats ?? [])) {
      await tx`
        INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
        VALUES (${ch.id}, ${projectId}, ${beatId})
        ON CONFLICT DO NOTHING
      `;
    }
    done++;
  }

  // ── Trajets ──────────────────────────────────────────────────────────────────
  report('Trajets…');
  for (const { key, data: steps } of journeys) {
    for (let i = 0; i < steps.length; i++) {
      await tx`
        INSERT INTO character_journeys (project_id, char_key, step_index, data)
        VALUES (${projectId}, ${key}, ${i}, ${e(steps[i]) ?? steps[i]})
      `;
      done++;
    }
  }

  // ── Groupes ──────────────────────────────────────────────────────────────────
  report('Groupes…');
  for (const g of groupsDB) {
    await tx`
      INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
      VALUES (${g.id}, ${projectId}, ${e(g.name)}, ${g.type ?? 'autre'}, ${g.color ?? '#64748B'}, ${e(g.description ?? null)}, ${g.homelandId ?? null})
      ON CONFLICT DO NOTHING
    `;
    for (const m of (g.members ?? [])) {
      await tx`
        INSERT INTO character_groups (character_id, group_id, project_id)
        VALUES (${m.characterId}, ${g.id}, ${projectId})
        ON CONFLICT DO NOTHING
      `;
    }
    done++;
  }

  // ── Plants ───────────────────────────────────────────────────────────────────
  report('Amorces narratives…');
  for (const p of plantsDB) {
    await tx`
      INSERT INTO plant_payoffs
        (id, project_id, label, type, plant_chapter_num, plant_event_id, payoff_chapter_num, payoff_event_id,
         entity_id, entity_type, status, notes, plant_volume_id, payoff_volume_id)
      VALUES (
        ${p.id}, ${projectId}, ${e(p.label)}, ${p.type ?? 'information'},
        ${p.plant_chapter_num ?? null}, ${p.plant_event_id ?? null},
        ${p.payoff_chapter_num ?? null}, ${p.payoff_event_id ?? null},
        ${p.entity_id ?? null}, ${p.entity_type ?? null},
        ${p.status ?? 'open'}, ${e(p.notes ?? null)},
        ${p.plantVolumeId ?? null}, ${p.payoffVolumeId ?? null}
      )
      ON CONFLICT DO NOTHING
    `;
    done++;
  }

  // ── Arc émotionnel ────────────────────────────────────────────────────────────
  report('Arc émotionnel…');
  for (const pt of arcPointsDB) {
    await tx`
      INSERT INTO arc_points (project_id, chapter_number, intensity, note)
      VALUES (${projectId}, ${pt.chapter_number}, ${pt.intensity}, ${e(pt.note ?? null)})
      ON CONFLICT DO NOTHING
    `;
    done++;
  }

  // ── Fils narratifs ────────────────────────────────────────────────────────────
  report('Fils narratifs…');
  for (const t of threadsDB) {
    await tx`
      INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
      VALUES (${t.id}, ${projectId}, ${e(t.name)}, ${t.color ?? '#3F51B5'}, ${t.role ?? 'subplot'}, ${e(t.description ?? null)}, ${t.sort_order ?? 0})
      ON CONFLICT DO NOTHING
    `;
    done++;
  }

  // ── Arcs des personnages ──────────────────────────────────────────────────────
  report('Arcs personnages…');
  for (const axis of characterArcsDB) {
    await tx`
      INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
      VALUES (${axis.id}, ${projectId}, ${axis.characterId}, ${e(axis.label)}, ${axis.color ?? '#64748b'})
      ON CONFLICT DO NOTHING
    `;
    for (const pt of (axis.points ?? [])) {
      await tx`
        INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note)
        VALUES (${projectId}, ${axis.id}, ${pt.chapter_num}, ${pt.value}, ${e(pt.note ?? null)})
        ON CONFLICT DO NOTHING
      `;
      done++;
    }
  }

  // ── Voyage du Héros ───────────────────────────────────────────────────────────
  report('Voyage du Héros…');
  for (const hj of heroJourneyDB) {
    const id = `hj_${hj.characterId}_${hj.stageKey}`;
    await tx`
      INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
      VALUES (${id}, ${projectId}, ${hj.stageKey}, ${hj.characterId ?? null}, ${hj.chapterNum ?? null}, ${e(hj.summary ?? null)}, ${hj.volumeId ?? null})
      ON CONFLICT DO NOTHING
    `;
    done++;
  }

  // ── Image de carte ────────────────────────────────────────────────────────────
  if (meta.mapImage) {
    await tx`UPDATE projects SET map_image = ${e(meta.mapImage)} WHERE id = ${projectId}`;
  }

  report('Finalisation…');
}
