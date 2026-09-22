/**
 * Routes API — Atlas Narratif
 *
 * Monté sous /api dans src/index.js.
 * Middlewares : requireIdentity (auth/deviceId) + requireProjectOwner (IDOR).
 * Validation : Zod sur tous les body POST/PUT.
 */

import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
import * as q from '../db-queries.js';
import { seedProject } from '../seed.js';
import sql from '../db.js';
import { encrypt, createProjectDek } from '../crypto.js';
import { requireIdentity, signDeviceId } from '../middleware/requireIdentity.js';
import { requireProjectOwner } from '../middleware/requireProjectOwner.js';
import * as v from '../validators.js';
import { answerAsk, warmupProject, invalidateContext, checkRateLimit } from './ask.js';

const api = new Hono();

// ── Rate limiter simple pour /device/register (10 req/min par IP) ───────────
const deviceRL = new Map();
const DEVICE_RL_WINDOW = 60_000;
const DEVICE_RL_MAX    = 10;

function deviceRateLimit(c) {
  const ip = c.req.header('x-real-ip') || c.req.header('x-forwarded-for')?.split(',')[0] || 'unknown';
  const now = Date.now();
  const entry = deviceRL.get(ip);
  if (entry && now - entry.start < DEVICE_RL_WINDOW) {
    if (entry.count >= DEVICE_RL_MAX) return c.json({ error: 'Trop de requêtes' }, 429);
    entry.count++;
  } else {
    deviceRL.set(ip, { start: now, count: 1 });
  }
  return null;
}
// Nettoyage périodique (toutes les 5 min)
setInterval(() => {
  const cutoff = Date.now() - DEVICE_RL_WINDOW;
  for (const [ip, entry] of deviceRL) if (entry.start < cutoff) deviceRL.delete(ip);
}, 300_000).unref();

// ── Enregistrement device (avant requireIdentity) ───────────────────────────
// Retourne un token HMAC pour signer un deviceId. Pas besoin d'être authentifié.
api.post('/device/register', async (c) => {
  const blocked = deviceRateLimit(c);
  if (blocked) return blocked;
  try {
    const { deviceId } = await c.req.json();
    if (!deviceId || typeof deviceId !== 'string' || deviceId.length > 200) {
      return c.json({ error: 'deviceId invalide' }, 400);
    }
    const token = signDeviceId(deviceId);
    return c.json({ deviceId, token });
  } catch {
    return c.json({ error: 'Requête invalide' }, 400);
  }
});

// ── Health check (avant requireIdentity pour accès sans auth) ───────────────
api.get('/health', async (c) => {
  try {
    await sql`SELECT 1`;
    return c.json({ status: 'ok', db: 'connected' });
  } catch {
    return c.json({ status: 'error', db: 'unavailable' }, 500);
  }
});


// ── Middlewares globaux ──────────────────────────────────────────────────────
api.use('*', requireIdentity);
api.use('/projects/:projectId/*', requireProjectOwner);

// Invalide le cache de contexte du chat après toute MUTATION des données d'un
// projet (POST/PUT/PATCH/DELETE), pour que la prochaine question reparte de données
// fraîches. On exclut /ask et /ask/warm (POST mais sans mutation de données) afin de
// ne pas casser le cache à chaque requête de chat.
api.use('/projects/:projectId/*', async (c, next) => {
  await next();
  const method = c.req.method;
  if (method === 'GET' || method === 'HEAD') return;
  const path = c.req.path;
  if (path.endsWith('/ask') || path.endsWith('/ask/warm')) return;
  const { projectId } = c.req.param();
  if (projectId) invalidateContext(projectId);
});
api.use('/projects/:projectId', requireProjectOwner);

// ── Limite de taille par défaut (10 Mo) ──────────────────────────────────────
api.use('*', bodyLimit({ maxSize: 10 * 1024 * 1024 }));

// ── Helpers ───────────────────────────────────────────────────────────────────

function wrap(handler) {
  return async (c) => {
    try {
      return await handler(c);
    } catch (err) {
      console.error(err);
      return c.json({ error: 'Erreur interne' }, 500);
    }
  };
}

function getContext(c) {
  return { userId: c.get('userId'), deviceId: c.get('deviceId') };
}

/** Parse + valide le body JSON avec un schéma Zod. Retourne le body parsé ou une réponse 400. */
async function parseBody(c, schema) {
  const raw = await c.req.json();
  const result = schema.safeParse(raw);
  if (!result.success) {
    console.warn('[parseBody] Validation échouée :', JSON.stringify(result.error.issues, null, 2));
    return { error: c.json({ error: 'Validation échouée', details: result.error.issues }, 400) };
  }
  return { data: result.data };
}

// ── Projects ──────────────────────────────────────────────────────────────────

api.get('/projects', wrap(async (c) => {
  const ctx  = getContext(c);
  const list = await q.getProjects(ctx);
  return c.json(list);
}));

api.post('/projects', wrap(async (c) => {
  const ctx = getContext(c);
  const { data: body, error } = await parseBody(c, v.createProject);
  if (error) return error;
  const id = await q.createProject(body, ctx);
  return c.json({ id }, 201);
}));

// ── Claim : transfère les projets anonymes vers le compte connecté ─────────────

api.post('/auth/claim-projects', wrap(async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Authentification requise pour claim' }, 401);
  const deviceId = c.get('deviceId');
  if (deviceId) await q.claimProjectsForUser(userId, deviceId);
  return c.json({ ok: true });
}));

// ── Compte utilisateur (RGPD) ────────────────────────────────────────────────

api.get('/account/export', wrap(async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Authentification requise' }, 401);
  const data = await q.exportUserData(userId);
  return c.json(data);
}));

api.delete('/account', wrap(async (c) => {
  const userId = c.get('userId');
  if (!userId) return c.json({ error: 'Authentification requise' }, 401);
  await q.deleteUser(userId);
  return c.json({ ok: true });
}));

// ── Projects (suite) ─────────────────────────────────────────────────────────

api.put('/projects/:projectId', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.updateProject);
  if (error) return error;
  await q.updateProject(projectId, body);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId', wrap(async (c) => {
  const { projectId } = c.req.param();
  const ctx = getContext(c);
  await q.deleteProject(projectId, ctx);
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

api.put('/projects/:projectId/map-image', bodyLimit({ maxSize: 10 * 1024 * 1024 }), wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.mapImage);
  if (error) return error;
  await q.setProjectMapImage(projectId, body.image);
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
  const { data: body, error } = await parseBody(c, v.volume);
  if (error) return error;
  const id = await q.insertVolume(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/volumes/:volumeId', wrap(async (c) => {
  const { projectId, volumeId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.volume);
  if (error) return error;
  await q.updateVolume(volumeId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/volumes/:volumeId', wrap(async (c) => {
  const { projectId, volumeId } = c.req.param();
  const snapshot = await q.deleteVolume(volumeId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/volumes/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreVolume);
  if (error) return error;
  await q.restoreVolume(snapshot, projectId);
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
  const search = (c.req.query('q') ?? '').slice(0, 200);
  const result = await q.findCharacterByName(search, projectId);
  return c.json(result);
}));

api.post('/projects/:projectId/characters', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.character);
  if (error) return error;
  const id = await q.insertCharacter(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/characters/:charId', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.character);
  if (error) return error;
  await q.updateCharacter(charId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/characters/:charId', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  const snapshot = await q.deleteCharacter(charId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/characters/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreCharacter);
  if (error) return error;
  await q.restoreCharacter(snapshot, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/characters/:charId/groups', wrap(async (c) => {
  const { projectId, charId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.characterGroups);
  if (error) return error;
  await q.setCharacterGroups(charId, body.groupIds ?? [], projectId);
  return c.json({ ok: true });
}));

// Locations
api.post('/projects/:projectId/locations', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.location);
  if (error) return error;
  const id = await q.insertLocation(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/locations/:locId', wrap(async (c) => {
  const { projectId, locId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.location);
  if (error) return error;
  await q.updateLocation(locId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/locations/:locId', wrap(async (c) => {
  const { projectId, locId } = c.req.param();
  const snapshot = await q.deleteLocation(locId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/locations/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreLocation);
  if (error) return error;
  await q.restoreLocation(snapshot, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/locations/:locId/coordinates', wrap(async (c) => {
  const { projectId, locId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.locationCoordinates);
  if (error) return error;
  await q.setLocationCoordinates(locId, projectId, body.coordinates);
  return c.json({ ok: true });
}));

// Objects
api.post('/projects/:projectId/objects', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.object);
  if (error) return error;
  const id = await q.insertObject(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/objects/:objId', wrap(async (c) => {
  const { projectId, objId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.object);
  if (error) return error;
  await q.updateObject(objId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/objects/:objId', wrap(async (c) => {
  const { projectId, objId } = c.req.param();
  const snapshot = await q.deleteObject(objId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/objects/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreObject);
  if (error) return error;
  await q.restoreObject(snapshot, projectId);
  return c.json({ ok: true });
}));

// Custom entity types (couche 3)
api.get('/projects/:projectId/custom-types', wrap(async (c) => {
  const { projectId } = c.req.param();
  const types = await q.getCustomTypes(projectId);
  return c.json({ types });
}));

api.post('/projects/:projectId/custom-types', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.customEntityType);
  if (error) return error;
  const id = await q.insertCustomType(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/custom-types/:typeId', wrap(async (c) => {
  const { projectId, typeId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.customEntityType);
  if (error) return error;
  await q.updateCustomType(typeId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/custom-types/:typeId', wrap(async (c) => {
  const { projectId, typeId } = c.req.param();
  const snapshot = await q.deleteCustomType(typeId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/custom-types/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreCustomType);
  if (error) return error;
  await q.restoreCustomType(snapshot, projectId);
  return c.json({ ok: true });
}));

// Custom entities (couche 3)
api.get('/projects/:projectId/custom-entities', wrap(async (c) => {
  const { projectId } = c.req.param();
  const entities = await q.getCustomEntities(projectId);
  return c.json({ entities });
}));

api.post('/projects/:projectId/custom-entities', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.customEntity);
  if (error) return error;
  const id = await q.insertCustomEntity(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/custom-entities/:entId', wrap(async (c) => {
  const { projectId, entId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.customEntity);
  if (error) return error;
  await q.updateCustomEntity(entId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/custom-entities/:entId', wrap(async (c) => {
  const { projectId, entId } = c.req.param();
  const snapshot = await q.deleteCustomEntity(entId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/custom-entities/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreCustomEntity);
  if (error) return error;
  await q.restoreCustomEntity(snapshot, projectId);
  return c.json({ ok: true });
}));

// ── Relations explicites entre entités (Niveau 3) ────────────────────────────
api.get('/projects/:projectId/relations', wrap(async (c) => {
  const { projectId } = c.req.param();
  const relations = await q.getRelations(projectId);
  return c.json({ relations });
}));

api.post('/projects/:projectId/relations', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.entityRelation);
  if (error) return error;
  const id = await q.insertRelation(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/relations/:relId', wrap(async (c) => {
  const { projectId, relId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.entityRelation);
  if (error) return error;
  await q.updateRelation(relId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/relations/:relId', wrap(async (c) => {
  const { projectId, relId } = c.req.param();
  const snapshot = await q.deleteRelation(relId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/relations/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreRelation);
  if (error) return error;
  await q.restoreRelation(snapshot, projectId);
  return c.json({ ok: true });
}));

// Chat de requête — niveau 2 (RAG, provider mock par défaut)
api.post('/projects/:projectId/ask', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.ask);
  if (error) return error;
  if (!checkRateLimit(projectId)) {
    return c.json({ error: 'Trop de requêtes — réessayez dans une minute.' }, 429);
  }
  const result = await answerAsk({ projectId, question: body.question, scope: body.scope, history: body.history });
  return c.json(result);
}));

// Pré-chauffe le cache d'embeddings du projet (déclenché à l'ouverture du chat en
// mode approfondi) → la 1re vraie question ne paie pas le cold-start Ollama.
// Aucun appel LLM, idempotent, non bloquant côté client (fire-and-forget).
api.post('/projects/:projectId/ask/warm', wrap(async (c) => {
  const { projectId } = c.req.param();
  const result = await warmupProject(projectId).catch(() => ({ enabled: false, warmed: 0 }));
  return c.json(result);
}));

// Groups
api.post('/projects/:projectId/groups', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.group);
  if (error) return error;
  const id = await q.insertGroup(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/groups/:groupId', wrap(async (c) => {
  const { projectId, groupId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.group);
  if (error) return error;
  await q.updateGroup(groupId, body, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/groups/:groupId/members/:charId/role', wrap(async (c) => {
  const { projectId, groupId, charId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.groupMemberRole);
  if (error) return error;
  await q.setGroupMemberRole(groupId, charId, body.roleInGroup ?? null, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/groups/:groupId', wrap(async (c) => {
  const { projectId, groupId } = c.req.param();
  const snapshot = await q.deleteGroup(groupId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/groups/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreGroup);
  if (error) return error;
  await q.restoreGroup(snapshot, projectId);
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
  const { data: body, error } = await parseBody(c, v.timelineEvent);
  if (error) return error;
  const id = await q.insertTimelineEvent(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/events/reorder', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.reorderEvents);
  if (error) return error;
  await q.reorderEvents(projectId, body.updates);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/events/:eventId', wrap(async (c) => {
  const { projectId, eventId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.timelineEvent);
  if (error) return error;
  await q.updateTimelineEvent(eventId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/events/:eventId', wrap(async (c) => {
  const { projectId, eventId } = c.req.param();
  const snapshot = await q.deleteTimelineEvent(eventId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/events/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreTimelineEvent);
  if (error) return error;
  await q.restoreTimelineEvent(snapshot, projectId);
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
  const { data: body, error } = await parseBody(c, v.stcChapter);
  if (error) return error;
  const id = await q.insertStcChapter(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/stc/reorder', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.reorderStcChapters);
  if (error) return error;
  await q.reorderStcChapters(projectId, body.updates);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/stc/:chapterId', wrap(async (c) => {
  const { projectId, chapterId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.stcChapter);
  if (error) return error;
  await q.updateStcChapter(chapterId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/stc/:chapterId', wrap(async (c) => {
  const { projectId, chapterId } = c.req.param();
  const snapshot = await q.deleteStcChapter(chapterId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/stc/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreStcChapter);
  if (error) return error;
  await q.restoreStcChapter(snapshot, projectId);
  return c.json({ ok: true });
}));


// ── Incoherences ──────────────────────────────────────────────────────────────

api.get('/projects/:projectId/incoherences', wrap(async (c) => {
  const { projectId } = c.req.param();
  const list = await q.getIncoherences(projectId);
  return c.json(list);
}));

api.delete('/projects/:projectId/incoherences/scan', wrap(async (c) => {
  const { projectId } = c.req.param();
  await q.deleteScanIncoherences(projectId);
  return c.json({ ok: true });
}));

api.post('/projects/:projectId/incoherences/scan', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.scanIncoherences);
  if (error) return error;
  for (const inc of body.incoherences) {
    await q.insertScannedIncoherence(inc, projectId);
  }
  return c.json({ ok: true }, 201);
}));

api.put('/projects/:projectId/incoherences/:incId/resolved', wrap(async (c) => {
  const { projectId, incId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.resolved);
  if (error) return error;
  await q.setIncoherenceResolved(incId, body.resolved, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/incoherences/:incId/note', wrap(async (c) => {
  const { projectId, incId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.resolutionNote);
  if (error) return error;
  await q.setResolutionNote(incId, body.note, projectId);
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
  const { data: body, error } = await parseBody(c, v.arcPoint);
  if (error) return error;
  await q.upsertArcPoint(projectId, +chapter, body.intensity);
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
  const { data: body, error } = await parseBody(c, v.chapterNote);
  if (error) return error;
  await q.setChapterNote(projectId, +chapter, body.content);
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
  const { data: body, error } = await parseBody(c, v.plant);
  if (error) return error;
  const id = await q.insertPlant(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/plants/:plantId', wrap(async (c) => {
  const { projectId, plantId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.plant);
  if (error) return error;
  await q.updatePlant(plantId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/plants/:plantId', wrap(async (c) => {
  const { projectId, plantId } = c.req.param();
  const snapshot = await q.deletePlant(plantId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/plants/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restorePlant);
  if (error) return error;
  await q.restorePlant(snapshot, projectId);
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
  const { data: body, error } = await parseBody(c, v.thread);
  if (error) return error;
  const id = await q.insertThread(body, projectId);
  return c.json({ id }, 201);
}));

api.put('/projects/:projectId/threads/:threadId', wrap(async (c) => {
  const { projectId, threadId } = c.req.param();
  const { data: body, error } = await parseBody(c, v.thread);
  if (error) return error;
  await q.updateThread(threadId, body, projectId);
  return c.json({ ok: true });
}));

api.delete('/projects/:projectId/threads/:threadId', wrap(async (c) => {
  const { projectId, threadId } = c.req.param();
  const snapshot = await q.deleteThread(threadId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/threads/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreThread);
  if (error) return error;
  await q.restoreThread(snapshot, projectId);
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
  const { data: body, error } = await parseBody(c, v.journey);
  if (error) return error;
  await q.saveJourney(projectId, charKey, body.steps ?? []);
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
  const { data: body, error } = await parseBody(c, v.characterAxis);
  if (error) return error;
  const id = await q.insertCharacterAxis(body, projectId);
  return c.json({ id }, 201);
}));

api.delete('/projects/:projectId/character-arcs/:axisId', wrap(async (c) => {
  const { projectId, axisId } = c.req.param();
  const snapshot = await q.deleteCharacterAxis(axisId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/character-arcs/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreCharacterAxis);
  if (error) return error;
  await q.restoreCharacterAxis(snapshot, projectId);
  return c.json({ ok: true });
}));

api.put('/projects/:projectId/character-arcs/:axisId/points/:chapter', wrap(async (c) => {
  const { projectId, axisId, chapter } = c.req.param();
  const { data: body, error } = await parseBody(c, v.characterArcPoint);
  if (error) return error;
  await q.upsertCharacterArcPoint(projectId, axisId, +chapter, body.value, body.note, body.volumeId);
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
  const { data: body, error } = await parseBody(c, v.heroJourneyEntry);
  if (error) return error;
  const id = await q.saveHeroJourneyEntry(body, projectId);
  return c.json({ id }, 201);
}));

api.delete('/projects/:projectId/hero-journey/:entryId', wrap(async (c) => {
  const { projectId, entryId } = c.req.param();
  const snapshot = await q.removeHeroJourneyEntry(entryId, projectId);
  return c.json({ ok: true, snapshot });
}));

api.post('/projects/:projectId/hero-journey/restore', wrap(async (c) => {
  const { projectId } = c.req.param();
  const { data: snapshot, error } = await parseBody(c, v.restoreHeroJourneyEntry);
  if (error) return error;
  await q.restoreHeroJourneyEntry(snapshot, projectId);
  return c.json({ ok: true });
}));

// ── Seed générique ─────────────────────────────────────────────────────────────
// POST /api/seed  body: { meta, data }
api.post('/seed', bodyLimit({ maxSize: 20 * 1024 * 1024 }), wrap(async (c) => {
  const { data: body, error } = await parseBody(c, v.seed);
  if (error) return error;
  const ctx = getContext(c);
  const id = await seedProject(body.meta, body.data, ctx);
  return c.json({ id: id ?? body.meta.id }, 201);
}));

// ── Import backup ─────────────────────────────────────────────────────────────
// POST /api/import/backup  body: AtlasNarratif backup JSON (version "1.0")

api.post('/import/backup', bodyLimit({ maxSize: 20 * 1024 * 1024 }), wrap(async (c) => {
  const { data: body, error } = await parseBody(c, v.importBackup);
  if (error) return error;
  const { userId, deviceId } = getContext(c);

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
    customEntityTypes = [],
    customEntities = [],
    entityRelations = [],
  } = body;

  await sql.begin(async (tx) => {
    // 1. projects
    await tx`
      INSERT INTO projects (id, name, description, map_image, user_id, device_id)
      VALUES (${newId}, ${project.name}, ${project.description ?? null}, ${project.mapImage ?? null}, ${userId ?? null}, ${deviceId ?? null})
    `;

    // Créer une DEK pour chiffrer les données importées (dans la même transaction)
    const dek = await createProjectDek(newId, tx);
    const enc = (v) => encrypt(v, dek);

    // 2. volumes
    for (const r of volumes) {
      await tx`
        INSERT INTO volumes (id, project_id, number, title, description)
        VALUES (${r.id}, ${newId}, ${r.number}, ${enc(r.title ?? null)}, ${enc(r.description ?? null)})
        ON CONFLICT DO NOTHING
      `;
    }

    // 3. characters
    for (const r of characters) {
      await tx`
        INSERT INTO characters (id, project_id, name, aliases, race, role, affiliations, traits, origin, description, color, journey_key, death_event_id, custom_fields)
        VALUES (
          ${r.id}, ${newId}, ${enc(r.name)},
          ${enc(r.aliases ?? [])},
          ${enc(fromExtra(r, 'race', 'race', null))},
          ${enc(r.role ?? null)},
          ${enc(r.affiliations ?? [])},
          ${enc(r.traits ?? [])},
          ${enc(fromExtra(r, 'origin', 'origin', null))},
          ${enc(r.description ?? null)},
          ${r.color ?? null},
          ${r.journey_key ?? null},
          ${r.death_event_id ?? null},
          ${enc(r.custom_fields ?? {})}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 4. locations
    for (const r of locations) {
      await tx`
        INSERT INTO locations (id, project_id, name, type, regime, description, coordinates, inhabitants, visited_by, key_places, custom_fields)
        VALUES (
          ${r.id}, ${newId}, ${enc(r.name)},
          ${enc(r.type ?? null)},
          ${enc(fromExtra(r, 'regime', 'regime', null))},
          ${enc(r.description ?? null)},
          ${r.coordinates ?? null},
          ${enc(fromExtra(r, 'inhabitants', 'inhabitants', []))},
          ${enc(fromExtra(r, 'visited_by', 'visitedBy', []))},
          ${enc(fromExtra(r, 'key_places', 'keyPlaces', []))},
          ${enc(r.custom_fields ?? {})}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 5. objects
    for (const r of objects) {
      await tx`
        INSERT INTO objects (id, project_id, name, type, description, creator, current_holder, powers, holders, created_in, inscription, status, status_changed_at_chapter, custom_fields)
        VALUES (
          ${r.id}, ${newId}, ${enc(r.name)},
          ${enc(r.type ?? null)},
          ${enc(r.description ?? null)},
          ${enc(r.creator ?? null)},
          ${enc(r.current_holder ?? null)},
          ${enc(r.powers ?? [])},
          ${r.holders ?? []},
          ${r.created_in ?? null},
          ${enc(r.inscription ?? null)},
          ${r.status ?? null},
          ${r.status_changed_at_chapter ?? null},
          ${enc(r.custom_fields ?? {})}
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
          ${enc(r.chapter_title ?? null)},
          ${enc(r.title ?? null)},
          ${enc(r.description ?? null)},
          ${r.location_id ?? null},
          ${fromExtra(r, 'beat_id', 'beatId', null)},
          ${r.pov_character_id ?? null},
          ${fromExtra(r, 'thread_ids', 'threadIds', [])},
          ${r.scene_order ?? null},
          ${enc(fromExtra(r, 'scene_goal', 'goal', null))},
          ${enc(fromExtra(r, 'scene_conflict', 'conflict', null))},
          ${enc(fromExtra(r, 'scene_outcome', 'outcome', null))},
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
          ${enc(r.title ?? null)},
          ${enc(r.explanation ?? null)},
          ${r.resolved ?? false},
          ${enc(r.resolution_note ?? null)}
        )
        ON CONFLICT DO NOTHING
      `;
    }

    // 9. incoherence_links
    for (const r of incoherenceLinks) {
      await tx`
        INSERT INTO incoherence_links (incoherence_id, project_id, entity_id, entity_type, label)
        VALUES (${r.incoherence_id}, ${newId}, ${r.entity_id}, ${r.entity_type}, ${enc(r.label ?? null)})
        ON CONFLICT DO NOTHING
      `;
    }

    // 10. stc_chapters
    for (const r of stcChapters) {
      await tx`
        INSERT INTO stc_chapters (id, project_id, number, title, summary, volume_id)
        VALUES (${r.id}, ${newId}, ${r.number}, ${enc(r.title ?? null)}, ${enc(r.summary ?? null)}, ${r.volume_id ?? null})
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
        VALUES (${newId}, ${r.char_key}, ${r.step_index}, ${enc(r.data ?? {}) ?? r.data ?? {}})
        ON CONFLICT DO NOTHING
      `;
    }

    // 14. groups
    for (const r of groups) {
      await tx`
        INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
        VALUES (${r.id}, ${newId}, ${enc(r.name)}, ${r.type ?? null}, ${r.color ?? null}, ${enc(r.description ?? null)}, ${r.homeland_id ?? null})
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
          ${enc(r.label ?? null)},
          ${r.type ?? null},
          ${r.plant_chapter_num ?? null},
          ${r.plant_event_id ?? null},
          ${r.payoff_chapter_num ?? null},
          ${r.payoff_event_id ?? null},
          ${r.entity_id ?? null},
          ${r.entity_type ?? null},
          ${r.status ?? null},
          ${enc(r.notes ?? null)},
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
        Values (${newId}, ${r.chapter_number}, ${r.intensity ?? null}, ${enc(r.note ?? null)})
        ON CONFLICT DO NOTHING
      `;
    }

    // 18. narrative_threads
    for (const r of narrativeThreads) {
      await tx`
        INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
        VALUES (${r.id}, ${newId}, ${enc(r.name)}, ${r.color ?? null}, ${r.role ?? null}, ${enc(r.description ?? null)}, ${r.sort_order ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 19. character_arc_axes
    for (const r of characterArcAxes) {
      await tx`
        INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
        Values (${r.id}, ${newId}, ${r.character_id}, ${enc(r.label ?? null)}, ${r.color ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 20. character_arc_points
    for (const r of characterArcPoints) {
      await tx`
        INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note)
        VALUES (${newId}, ${r.axis_id}, ${r.chapter_num}, ${r.value ?? null}, ${enc(r.note ?? null)})
        ON CONFLICT DO NOTHING
      `;
    }

    // 21. hero_journey_entries
    for (const r of heroJourneyEntries) {
      await tx`
        INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
        VALUES (${r.id}, ${newId}, ${r.stage_key}, ${r.character_id ?? null}, ${r.chapter_num ?? null}, ${enc(r.summary ?? null)}, ${r.volume_id ?? null})
        ON CONFLICT DO NOTHING
      `;
    }

    // 21. custom_entity_types (couche 3)
    for (const r of customEntityTypes) {
      await tx`
        INSERT INTO custom_entity_types (id, project_id, label, icon, color, field_schema, base_behavior, source)
        VALUES (${r.id}, ${newId}, ${enc(r.label)}, ${r.icon ?? null}, ${r.color ?? '#64748b'},
                ${JSON.stringify(r.field_schema ?? [])}, ${r.base_behavior ?? 'entity'}, ${r.source ?? 'import'})
        ON CONFLICT DO NOTHING
      `;
    }

    // 22. custom_entities (couche 3)
    for (const r of customEntities) {
      await tx`
        INSERT INTO custom_entities (id, project_id, type_id, name, aliases, custom_fields, description, source)
        VALUES (${r.id}, ${newId}, ${r.type_id}, ${enc(r.name)}, ${enc(r.aliases ?? [])},
                ${enc(r.custom_fields ?? {})}, ${enc(r.description ?? null)}, ${r.source ?? 'import'})
        ON CONFLICT DO NOTHING
      `;
    }

    // 23. entity_relations (Niveau 3) — libellé chiffré
    for (const r of entityRelations) {
      await tx`
        INSERT INTO entity_relations (id, project_id, source_id, source_type, target_id, target_type, label, directed, source)
        VALUES (${r.id}, ${newId}, ${r.source_id}, ${r.source_type}, ${r.target_id}, ${r.target_type},
                ${enc(r.label ?? null)}, ${r.directed ?? true}, ${r.source ?? 'import'})
        ON CONFLICT DO NOTHING
      `;
    }
  });

  return c.json({ id: newId }, 201);
}));

export default api;
