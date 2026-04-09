/**
 * Routes API — Atlas Narratif
 *
 * Monté sous /api dans src/index.js.
 * Toutes les routes supposent que l'authentification a déjà été vérifiée
 * par le middleware requireAuth si nécessaire.
 */

import { Hono } from 'hono';
import * as q from '../db-queries.js';
import { seedProject } from '../seed.js';
import sql from '../db.js';
import { auth } from '../auth.js';

const api = new Hono();

// ── Helpers ───────────────────────────────────────────────────────────────────

function wrap(handler) {
  return async (c) => {
    try {
      return await handler(c);
    } catch (err) {
      console.error(err);
      return c.json({ error: err.message }, 500);
    }
  };
}

/** Retourne { userId, deviceId } depuis la session (optionnelle) et le header X-Device-Id. */
async function getContext(c) {
  const session = await auth.api.getSession({ headers: c.req.raw.headers }).catch(() => null);
  const userId   = session?.user?.id ?? null;
  const deviceId = c.req.header('x-device-id') ?? null;
  return { userId, deviceId };
}

// ── Projects ──────────────────────────────────────────────────────────────────

api.get('/projects', wrap(async (c) => {
  const ctx  = await getContext(c);
  const list = await q.getProjects(ctx);
  return c.json(list);
}));

api.post('/projects', wrap(async (c) => {
  const ctx  = await getContext(c);
  const body = await c.req.json();
  const id   = await q.createProject(body, ctx);
  return c.json({ id }, 201);
}));

// ── Claim : transfère les projets anonymes vers le compte connecté ─────────────

api.post('/auth/claim-projects', wrap(async (c) => {
  const session  = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: 'Non authentifié' }, 401);
  const deviceId = c.req.header('x-device-id');
  if (deviceId) await q.claimProjectsForUser(session.user.id, deviceId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId', wrap(async (c) => {
  const { projectId } = c.req.param();
  await q.deleteProject(projectId);
  return c.json({ ok: true });
}));

api.get('/projects/:projectId/export', wrap(async (c) => {
  const { projectId } = c.req.param();
  const payload = await q.exportProject(projectId);
  return c.json(payload);
}));

api.get('/projects/:projectId/map-image', wrap(async (c) => {
  const { projectId } = c.req.param();
  const image = await q.getProjectMapImage(projectId);
  return c.json({ image });
}));

api.put('/projects/:projectId/map-image', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { image } = await c.req.json();
  await q.setProjectMapImage(projectId, image);
  return c.json({ ok: true });
}));

// ── Volumes ───────────────────────────────────────────────────────────────────

api.get('/projects/:projectId/volumes', wrap(async (c) => {
  const { projectId } = c.req.param();
  const volumes = await q.getVolumes(projectId);
  return c.json(volumes);
}));

api.post('/projects/:projectId/volumes', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertVolume(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/volumes/:volumeId', wrap(async (c) => {
  const { projectId, volumeId } = c.req.param();
  const body = await c.req.json();
  await q.updateVolume(volumeId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/volumes/:volumeId', wrap(async (c) => {
  const { projectId, volumeId } = c.req.param();
  await q.deleteVolume(volumeId, projectId);
  return c.json({ ok: true });
}));

// ── Lore ──────────────────────────────────────────────────────────────────────

api.get('/projects/:projectId/lore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const lore = await q.getLoreData(projectId);
  return c.json(lore);
}));

// Characters
api.get('/projects/:projectId/characters/search', wrap(async (c) => {
  const { projectId } = c.req.param();
  const search = c.req.query('q') ?? '';
  const result = await q.findCharacterByName(search, projectId);
  return c.json(result);
}));

api.post('/projects/:projectId/characters', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertCharacter(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/characters/:charId', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  const body = await c.req.json();
  await q.updateCharacter(charId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/characters/:charId', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  await q.deleteCharacter(charId, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/characters/:charId/groups', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  const { groupIds } = await c.req.json();
  await q.setCharacterGroups(charId, groupIds ?? [], projectId);
  return c.json({ ok: true });
}));

// Locations
api.post('/projects/:projectId/locations', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertLocation(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/locations/:locId', wrap(async (c) => {
  const { projectId, locId } = c.req.param();
  const body = await c.req.json();
  await q.updateLocation(locId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/locations/:locId', wrap(async (c) => {
  const { projectId, locId } = c.req.param();
  await q.deleteLocation(locId, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/locations/:locId/coordinates', wrap(async (c) => {
  const { projectId, locId } = c.req.param();
  const { coordinates } = await c.req.json();
  await q.setLocationCoordinates(locId, projectId, coordinates);
  return c.json({ ok: true });
}));

// Objects
api.post('/projects/:projectId/objects', wrap(async (c) => {
  const { projectId } = c.req.param();
  if (!projectId || projectId === '[object Object]') {
    console.error('[insertObject] invalid projectId received:', projectId, new Error().stack);
    return c.json({ error: `Invalid projectId: "${projectId}"` }, 400);
  }
  const body = await c.req.json();
  const id = await q.insertObject(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/objects/:objId', wrap(async (c) => {
  const { projectId, objId } = c.req.param();
  const body = await c.req.json();
  await q.updateObject(objId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/objects/:objId', wrap(async (c) => {
  const { projectId, objId } = c.req.param();
  await q.deleteObject(objId, projectId);
  return c.json({ ok: true });
}));

// Groups
api.post('/projects/:projectId/groups', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertGroup(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/groups/:groupId', wrap(async (c) => {
  const { projectId, groupId } = c.req.param();
  const body = await c.req.json();
  await q.updateGroup(groupId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/groups/:groupId', wrap(async (c) => {
  const { projectId, groupId } = c.req.param();
  await q.deleteGroup(groupId, projectId);
  return c.json({ ok: true });
}));

// ── Timeline ──────────────────────────────────────────────────────────────────

api.get('/projects/:projectId/events', wrap(async (c) => {
  const { projectId } = c.req.param();
  const events = await q.getTimelineEvents(projectId);
  return c.json(events);
}));

api.get('/projects/:projectId/chapters', wrap(async (c) => {
  const { projectId } = c.req.param();
  const chapters = await q.getChapters(projectId);
  return c.json(chapters);
}));

api.post('/projects/:projectId/events', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertTimelineEvent(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/events/:eventId', wrap(async (c) => {
  const { projectId, eventId } = c.req.param();
  const body = await c.req.json();
  await q.updateTimelineEvent(eventId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/events/:eventId', wrap(async (c) => {
  const { projectId, eventId } = c.req.param();
  await q.deleteTimelineEvent(eventId, projectId);
  return c.json({ ok: true });
}));

// ── Save the Cat ──────────────────────────────────────────────────────────────

api.get('/projects/:projectId/stc', wrap(async (c) => {
  const { projectId } = c.req.param();
  const chapters = await q.getStcChapters(projectId);
  return c.json(chapters);
}));

api.post('/projects/:projectId/stc', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertStcChapter(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/stc/:chapterId', wrap(async (c) => {
  const { projectId, chapterId } = c.req.param();
  const body = await c.req.json();
  await q.updateStcChapter(chapterId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/stc/:chapterId', wrap(async (c) => {
  const { projectId, chapterId } = c.req.param();
  await q.deleteStcChapter(chapterId, projectId);
  return c.json({ ok: true });
}));

// ── Incoherences ──────────────────────────────────────────────────────────────

api.get('/projects/:projectId/incoherences', wrap(async (c) => {
  const { projectId } = c.req.param();
  const list = await q.getIncoherences(projectId);
  return c.json(list);
}));

// DELETE scan results first, then POST new ones — kept as two separate routes
api.delete('/projects/:projectId/incoherences/scan', wrap(async (c) => {
  const { projectId } = c.req.param();
  await q.deleteScanIncoherences(projectId);
  return c.json({ ok: true });
}));

api.post('/projects/:projectId/incoherences/scan', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { incoherences } = await c.req.json();
  for (const inc of (incoherences ?? [])) {
    await q.insertScannedIncoherence(inc, projectId);
  }
  return c.json({ ok: true }, 201);
}));

api.put('/projects/:projectId/incoherences/:incId/resolved', wrap(async (c) => {
  const { projectId, incId } = c.req.param();
  const { resolved } = await c.req.json();
  await q.setIncoherenceResolved(incId, resolved, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/incoherences/:incId/note', wrap(async (c) => {
  const { projectId, incId } = c.req.param();
  const { note } = await c.req.json();
  await q.setResolutionNote(incId, note, projectId);
  return c.json({ ok: true });
}));

// ── Arc émotionnel ────────────────────────────────────────────────────────────

api.get('/projects/:projectId/arc', wrap(async (c) => {
  const { projectId } = c.req.param();
  const points = await q.getArcPoints(projectId);
  return c.json(points);
}));

api.put('/projects/:projectId/arc/:chapter', wrap(async (c) => {
  const { projectId, chapter } = c.req.param();
  const { intensity } = await c.req.json();
  await q.upsertArcPoint(projectId, +chapter, intensity);
  return c.json({ ok: true });
}));

// ── Notes par chapitre ────────────────────────────────────────────────────────

api.get('/projects/:projectId/notes', wrap(async (c) => {
  const { projectId } = c.req.param();
  const notes = await q.getChapterNotes(projectId);
  return c.json(notes);
}));

api.put('/projects/:projectId/notes/:chapter', wrap(async (c) => {
  const { projectId, chapter } = c.req.param();
  const { content } = await c.req.json();
  await q.setChapterNote(projectId, +chapter, content);
  return c.json({ ok: true });
}));

// ── Plants ────────────────────────────────────────────────────────────────────

api.get('/projects/:projectId/plants', wrap(async (c) => {
  const { projectId } = c.req.param();
  const plants = await q.getPlants(projectId);
  return c.json(plants);
}));

api.post('/projects/:projectId/plants', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertPlant(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/plants/:plantId', wrap(async (c) => {
  const { projectId, plantId } = c.req.param();
  const body = await c.req.json();
  await q.updatePlant(plantId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/plants/:plantId', wrap(async (c) => {
  const { projectId, plantId } = c.req.param();
  await q.deletePlant(plantId, projectId);
  return c.json({ ok: true });
}));

// ── Fils narratifs (threads) ──────────────────────────────────────────────────

api.get('/projects/:projectId/threads', wrap(async (c) => {
  const { projectId } = c.req.param();
  const threads = await q.getThreads(projectId);
  return c.json(threads);
}));

api.post('/projects/:projectId/threads', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertThread(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/threads/:threadId', wrap(async (c) => {
  const { projectId, threadId } = c.req.param();
  const body = await c.req.json();
  await q.updateThread(threadId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/threads/:threadId', wrap(async (c) => {
  const { projectId, threadId } = c.req.param();
  await q.deleteThread(threadId, projectId);
  return c.json({ ok: true });
}));

// ── Trajets personnages ────────────────────────────────────────────────────────

api.get('/projects/:projectId/journeys', wrap(async (c) => {
  const { projectId } = c.req.param();
  const journeys = await q.getAllJourneys(projectId);
  return c.json(journeys);
}));

api.get('/projects/:projectId/journeys/:charKey', wrap(async (c) => {
  const { projectId, charKey } = c.req.param();
  const steps = await q.getJourney(charKey, projectId);
  return c.json(steps);
}));

api.put('/projects/:projectId/journeys/:charKey', wrap(async (c) => {
  const { projectId, charKey } = c.req.param();
  const { steps } = await c.req.json();
  await q.saveJourney(projectId, charKey, steps ?? []);
  return c.json({ ok: true });
}));

// ── Arcs de personnages ────────────────────────────────────────────────────────

api.get('/projects/:projectId/character-arcs', wrap(async (c) => {
  const { projectId } = c.req.param();
  const [axes, points, labels] = await Promise.all([
    q.getAllCharacterAxes(projectId),
    q.getAllCharacterArcPoints(projectId),
    q.getAllProjectAxisLabels(projectId),
  ]);
  return c.json({ axes, points, labels });
}));

api.get('/projects/:projectId/character-arcs/labels', wrap(async (c) => {
  const { projectId } = c.req.param();
  const labels = await q.getAllProjectAxisLabels(projectId);
  return c.json(labels);
}));

api.get('/projects/:projectId/characters/:charId/arcs', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  const axes = await q.getCharacterAxes(charId, projectId);
  return c.json(axes);
}));

api.post('/projects/:projectId/character-arcs', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.insertCharacterAxis(body, projectId);
  return c.json({ id }, 201);
}));

api.delete('/projects/:projectId/character-arcs/:axisId', wrap(async (c) => {
  const { projectId, axisId } = c.req.param();
  await q.deleteCharacterAxis(axisId, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/character-arcs/:axisId/points/:chapter', wrap(async (c) => {
  const { projectId, axisId, chapter } = c.req.param();
  const { value, note, volumeId } = await c.req.json();
  await q.upsertCharacterArcPoint(projectId, axisId, +chapter, value, note, volumeId);
  return c.json({ ok: true });
}));

api.get('/projects/:projectId/character-arcs/:axisId/points', wrap(async (c) => {
  const { projectId, axisId } = c.req.param();
  const points = await q.getCharacterArcPoints(axisId, projectId);
  return c.json(points);
}));

// ── Voyage du Héros ───────────────────────────────────────────────────────────

api.get('/projects/:projectId/hero-journey', wrap(async (c) => {
  const { projectId } = c.req.param();
  const entries = await q.getHeroJourneyEntries(projectId);
  return c.json(entries);
}));

api.post('/projects/:projectId/hero-journey', wrap(async (c) => {
  const { projectId } = c.req.param();
  const body = await c.req.json();
  const id = await q.saveHeroJourneyEntry(body, projectId);
  return c.json({ id }, 201);
}));

api.delete('/projects/:projectId/hero-journey/:entryId', wrap(async (c) => {
  const { projectId, entryId } = c.req.param();
  await q.removeHeroJourneyEntry(entryId, projectId);
  return c.json({ ok: true });
}));

// ── Seed générique ─────────────────────────────────────────────────────────────
// POST /api/seed  body: { meta, data }
api.post('/seed', wrap(async (c) => {
  const { meta, data } = await c.req.json();
  const ctx = await getContext(c);
  const id = await seedProject(meta, data, ctx);
  return c.json({ id: id ?? meta.id }, 201);
}));

// ── Import backup ─────────────────────────────────────────────────────────────
// POST /api/import/backup  body: AtlasNarratif backup JSON (version "1.0")

api.post('/import/backup', wrap(async (c) => {
  const body = await c.req.json();
  const { userId, deviceId } = await getContext(c);

  // Validate
  if (body.version !== '1.0') {
    return c.json({ error: 'Unsupported backup version. Expected "1.0".' }, 400);
  }
  if (!body.project?.name) {
    return c.json({ error: 'Missing required field: project.name' }, 400);
  }

  // Generate new project ID
  const slug = body.project.name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')  // strip accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 20);
  const newId = `${slug}_${Date.now()}`;

  // Helper: read a field from direct column or legacy extra JSONB
  function fromExtra(r, directKey, extraKey, fallback) {
    if (r[directKey] !== undefined && r[directKey] !== null) return r[directKey];
    const ex = typeof r.extra === 'string' ? JSON.parse(r.extra || '{}') : (r.extra ?? {});
    return ex[extraKey] ?? fallback;
  }

  const {
    project,
    volumes = [],
    characters = [],
    locations = [],
    objects = [],
    timelineEvents = [],
    eventEntities = [],
    incoherences = [],
    incoherenceLinks = [],
    stcChapters = [],
    stcChapterBeats = [],
    stcChapterEntities = [],
    characterJourneys = [],
    groups = [],
    characterGroups = [],
    plantPayoffs = [],
    arcPoints = [],
    narrativeThreads = [],
    characterArcAxes = [],
    characterArcPoints = [],
    heroJourneyEntries = [],
  } = body;

  await sql.begin(async (tx) => {
    // 1. projects
    await tx`
      INSERT INTO projects (id, name, description, map_image, user_id, device_id)
      VALUES (${newId}, ${project.name}, ${project.description ?? null}, ${project.mapImage ?? null}, ${userId ?? null}, ${deviceId ?? null})
    `;

    // 2. volumes
    for (const r of volumes) {
      await tx`
        INSERT INTO volumes (id, project_id, number, title, description)
        VALUES (${r.id}, ${newId}, ${r.number}, ${r.title ?? null}, ${r.description ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 3. characters
    for (const r of characters) {
      await tx`
        INSERT INTO characters (id, project_id, name, aliases, race, role, affiliations, traits, origin, description, color, journey_key, death_event_id)
        VALUES (
          ${r.id}, ${newId}, ${r.name},
          ${r.aliases ?? []},
          ${fromExtra(r, 'race', 'race', null)},
          ${r.role ?? null},
          ${r.affiliations ?? []},
          ${r.traits ?? []},
          ${fromExtra(r, 'origin', 'origin', null)},
          ${r.description ?? null},
          ${r.color ?? null},
          ${r.journey_key ?? null},
          ${r.death_event_id ?? null}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 4. locations
    for (const r of locations) {
      await tx`
        INSERT INTO locations (id, project_id, name, type, regime, description, coordinates, inhabitants, visited_by, key_places)
        VALUES (
          ${r.id}, ${newId}, ${r.name},
          ${r.type ?? null},
          ${fromExtra(r, 'regime', 'regime', null)},
          ${r.description ?? null},
          ${r.coordinates ?? null},
          ${fromExtra(r, 'inhabitants', 'inhabitants', [])},
          ${fromExtra(r, 'visited_by', 'visitedBy', [])},
          ${fromExtra(r, 'key_places', 'keyPlaces', [])}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 5. objects
    for (const r of objects) {
      await tx`
        INSERT INTO objects (id, project_id, name, type, description, creator, current_holder, powers, holders, created_in, inscription, status, status_changed_at_chapter)
        VALUES (
          ${r.id}, ${newId}, ${r.name},
          ${r.type ?? null},
          ${r.description ?? null},
          ${r.creator ?? null},
          ${r.current_holder ?? null},
          ${r.powers ?? []},
          ${r.holders ?? []},
          ${r.created_in ?? null},
          ${r.inscription ?? null},
          ${r.status ?? null},
          ${r.status_changed_at_chapter ?? null}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 6. timeline_events
    for (const r of timelineEvents) {
      await tx`
        INSERT INTO timeline_events (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id, pov_character_id, thread_ids, scene_order, scene_goal, scene_conflict, scene_outcome, volume_id, is_flashback, story_chapter_ref)
        VALUES (
          ${r.id}, ${newId},
          ${r.chapter_num ?? null},
          ${r.chapter_title ?? null},
          ${r.title ?? null},
          ${r.description ?? null},
          ${r.location_id ?? null},
          ${fromExtra(r, 'beat_id', 'beatId', null)},
          ${r.pov_character_id ?? null},
          ${fromExtra(r, 'thread_ids', 'threadIds', [])},
          ${r.scene_order ?? null},
          ${fromExtra(r, 'scene_goal', 'goal', null)},
          ${fromExtra(r, 'scene_conflict', 'conflict', null)},
          ${fromExtra(r, 'scene_outcome', 'outcome', null)},
          ${r.volume_id ?? null},
          ${r.is_flashback ?? false},
          ${r.story_chapter_ref ?? null}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 7. event_entities
    for (const r of eventEntities) {
      await tx`
        INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
        VALUES (${r.event_id}, ${newId}, ${r.entity_id}, ${r.entity_type})
        ON CONFLICT DO NOTHING
      `;
    }

    // 8. incoherences
    for (const r of incoherences) {
      await tx`
        INSERT INTO incoherences (id, project_id, type, severity, title, explanation, resolved, resolution_note)
        VALUES (
          ${r.id}, ${newId},
          ${r.type ?? null},
          ${r.severity ?? null},
          ${r.title ?? null},
          ${r.explanation ?? null},
          ${r.resolved ?? false},
          ${r.resolution_note ?? null}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 9. incoherence_links
    for (const r of incoherenceLinks) {
      await tx`
        INSERT INTO incoherence_links (incoherence_id, project_id, entity_id, entity_type, label)
        VALUES (${r.incoherence_id}, ${newId}, ${r.entity_id}, ${r.entity_type}, ${r.label ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 10. stc_chapters
    for (const r of stcChapters) {
      await tx`
        INSERT INTO stc_chapters (id, project_id, number, title, summary, volume_id)
        VALUES (${r.id}, ${newId}, ${r.number}, ${r.title ?? null}, ${r.summary ?? null}, ${r.volume_id ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 11. stc_chapter_beats
    for (const r of stcChapterBeats) {
      await tx`
        INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
        VALUES (${r.chapter_id}, ${newId}, ${r.beat_id})
        ON CONFLICT DO NOTHING
      `;
    }

    // 12. stc_chapter_entities
    for (const r of stcChapterEntities) {
      await tx`
        INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type)
        VALUES (${r.chapter_id}, ${newId}, ${r.entity_id}, ${r.entity_type})
        ON CONFLICT DO NOTHING
      `;
    }

    // 13. character_journeys
    for (const r of characterJourneys) {
      await tx`
        INSERT INTO character_journeys (project_id, char_key, step_index, data)
        VALUES (${newId}, ${r.char_key}, ${r.step_index}, ${r.data ?? {}})
        ON CONFLICT DO NOTHING
      `;
    }

    // 14. groups
    for (const r of groups) {
      await tx`
        INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
        VALUES (${r.id}, ${newId}, ${r.name}, ${r.type ?? null}, ${r.color ?? null}, ${r.description ?? null}, ${r.homeland_id ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 15. character_groups
    for (const r of characterGroups) {
      await tx`
        INSERT INTO character_groups (character_id, group_id, project_id)
        VALUES (${r.character_id}, ${r.group_id}, ${newId})
        ON CONFLICT DO NOTHING
      `;
    }

    // 16. plant_payoffs
    for (const r of plantPayoffs) {
      await tx`
        INSERT INTO plant_payoffs (id, project_id, label, type, plant_chapter_num, plant_event_id, payoff_chapter_num, payoff_event_id, entity_id, entity_type, status, notes, plant_volume_id, payoff_volume_id)
        VALUES (
          ${r.id}, ${newId},
          ${r.label ?? null},
          ${r.type ?? null},
          ${r.plant_chapter_num ?? null},
          ${r.plant_event_id ?? null},
          ${r.payoff_chapter_num ?? null},
          ${r.payoff_event_id ?? null},
          ${r.entity_id ?? null},
          ${r.entity_type ?? null},
          ${r.status ?? null},
          ${r.notes ?? null},
          ${r.plant_volume_id ?? null},
          ${r.payoff_volume_id ?? null}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 17. arc_points
    for (const r of arcPoints) {
      await tx`
        INSERT INTO arc_points (project_id, chapter_number, intensity, note)
        VALUES (${newId}, ${r.chapter_number}, ${r.intensity ?? null}, ${r.note ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 18. narrative_threads
    for (const r of narrativeThreads) {
      await tx`
        INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
        VALUES (${r.id}, ${newId}, ${r.name}, ${r.color ?? null}, ${r.role ?? null}, ${r.description ?? null}, ${r.sort_order ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 19. character_arc_axes
    for (const r of characterArcAxes) {
      await tx`
        INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
        VALUES (${r.id}, ${newId}, ${r.character_id}, ${r.label ?? null}, ${r.color ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 20. character_arc_points
    for (const r of characterArcPoints) {
      await tx`
        INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note)
        VALUES (${newId}, ${r.axis_id}, ${r.chapter_num}, ${r.value ?? null}, ${r.note ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 21. hero_journey_entries
    for (const r of heroJourneyEntries) {
      await tx`
        INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
        VALUES (${r.id}, ${newId}, ${r.stage_key}, ${r.character_id ?? null}, ${r.chapter_num ?? null}, ${r.summary ?? null}, ${r.volume_id ?? null})
        ON CONFLICT DO NOTHING
      `;
    }
  });

  return c.json({ id: newId }, 201);
}));

export default api;
