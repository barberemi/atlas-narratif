/**
 * Client API — Atlas Narratif
 *
 * Couche fetch qui remplace les appels PGlite de src/db/queries.js.
 * Même signatures que queries.js mais sans le paramètre `db`.
 *
 * Toutes les requêtes sont envoyées à VITE_API_URL (défaut : http://localhost:3001).
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ── Device ID (tracking anonyme) ─────────────────────────────────────────────

export function getDeviceId() {
  let id = localStorage.getItem('atlas_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('atlas_device_id', id);
  }
  return id;
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function api(method, path, body) {
  if (path.includes('[object Object]')) {
    const err = new Error(`[API] path contains invalid projectId: ${path}`);
    console.error(err.message, err.stack);
    throw err;
  }
  const opts = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Id':  getDeviceId(),
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  // 204 No Content
  if (res.status === 204) return null;
  return res.json();
}

const get  = (path)        => api('GET',    path);
const post = (path, body)  => api('POST',   path, body);
const put  = (path, body)  => api('PUT',    path, body);
const del  = (path)        => api('DELETE', path);

// ── Projects ──────────────────────────────────────────────────────────────────

export async function getProjects() {
  return get('/api/projects');
}

export async function createProject({ name, description }) {
  const { id } = await post('/api/projects', { name, description });
  return id;
}

export async function deleteProject(projectId) {
  return del(`/api/projects/${projectId}`);
}

/** Transfère les projets anonymes du device vers le compte connecté. */
export async function claimProjects() {
  return post('/api/auth/claim-projects');
}

export async function getProjectMapImage(projectId) {
  const { image } = await get(`/api/projects/${projectId}/map-image`);
  return image;
}

export async function setProjectMapImage(projectId, base64) {
  return put(`/api/projects/${projectId}/map-image`, { image: base64 });
}

// ── Volumes ───────────────────────────────────────────────────────────────────

export async function getVolumes(projectId) {
  return get(`/api/projects/${projectId}/volumes`);
}

export async function insertVolume(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/volumes`, data);
  return id;
}

export async function updateVolume(volumeId, data, projectId) {
  return put(`/api/projects/${projectId}/volumes/${volumeId}`, data);
}

export async function deleteVolume(volumeId, projectId) {
  return del(`/api/projects/${projectId}/volumes/${volumeId}`);
}

// ── Lore agrégé ───────────────────────────────────────────────────────────────

export async function getLoreData(projectId) {
  return get(`/api/projects/${projectId}/lore`);
}

// ── Personnages ───────────────────────────────────────────────────────────────

export async function getCharacters(projectId) {
  const { characters } = await get(`/api/projects/${projectId}/lore`);
  return characters;
}

export async function findCharacterByName(search, projectId) {
  return get(`/api/projects/${projectId}/characters/search?q=${encodeURIComponent(search)}`);
}

export async function insertCharacter(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/characters`, data);
  return id;
}

export async function updateCharacter(charId, data, projectId) {
  return put(`/api/projects/${projectId}/characters/${charId}`, data);
}

export async function deleteCharacter(charId, projectId) {
  return del(`/api/projects/${projectId}/characters/${charId}`);
}

export async function setCharacterGroups(characterId, groupIds, projectId) {
  return put(`/api/projects/${projectId}/characters/${characterId}/groups`, { groupIds });
}

// ── Lieux ─────────────────────────────────────────────────────────────────────

export async function getLocations(projectId) {
  const { locations } = await get(`/api/projects/${projectId}/lore`);
  return locations;
}

export async function insertLocation(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/locations`, data);
  return id;
}

export async function updateLocation(locId, data, projectId) {
  return put(`/api/projects/${projectId}/locations/${locId}`, data);
}

export async function deleteLocation(locId, projectId) {
  return del(`/api/projects/${projectId}/locations/${locId}`);
}

export async function setLocationCoordinates(locId, projectId, coords) {
  return put(`/api/projects/${projectId}/locations/${locId}/coordinates`, { coordinates: coords });
}

// ── Objets ────────────────────────────────────────────────────────────────────

export async function getObjects(projectId) {
  const { objects } = await get(`/api/projects/${projectId}/lore`);
  return objects;
}

export async function insertObject(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/objects`, data);
  return id;
}

export async function updateObject(objId, data, projectId) {
  return put(`/api/projects/${projectId}/objects/${objId}`, data);
}

export async function deleteObject(objId, projectId) {
  return del(`/api/projects/${projectId}/objects/${objId}`);
}

// ── Groupes ───────────────────────────────────────────────────────────────────

export async function getGroups(projectId) {
  const { groups } = await get(`/api/projects/${projectId}/lore`);
  return groups;
}

export async function insertGroup(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/groups`, data);
  return id;
}

export async function updateGroup(groupId, data, projectId) {
  return put(`/api/projects/${projectId}/groups/${groupId}`, data);
}

export async function deleteGroup(groupId, projectId) {
  return del(`/api/projects/${projectId}/groups/${groupId}`);
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export async function getTimelineEvents(projectId) {
  return get(`/api/projects/${projectId}/events`);
}

export async function getChapters(projectId) {
  return get(`/api/projects/${projectId}/chapters`);
}

export async function insertTimelineEvent(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/events`, data);
  return id;
}

export async function updateTimelineEvent(eventId, data, projectId) {
  return put(`/api/projects/${projectId}/events/${eventId}`, data);
}

export async function deleteTimelineEvent(eventId, projectId) {
  return del(`/api/projects/${projectId}/events/${eventId}`);
}

// ── Save the Cat ──────────────────────────────────────────────────────────────

export async function getStcChapters(projectId) {
  return get(`/api/projects/${projectId}/stc`);
}

export async function insertStcChapter(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/stc`, data);
  return id;
}

export async function updateStcChapter(chapterId, data, projectId) {
  return put(`/api/projects/${projectId}/stc/${chapterId}`, data);
}

export async function deleteStcChapter(chapterId, projectId) {
  return del(`/api/projects/${projectId}/stc/${chapterId}`);
}

// ── Incohérences ──────────────────────────────────────────────────────────────

export async function getIncoherences(projectId) {
  return get(`/api/projects/${projectId}/incoherences`);
}

export async function getEntityIncoherences(entityId, projectId) {
  return get(`/api/projects/${projectId}/incoherences?entityId=${encodeURIComponent(entityId)}`);
}

export async function deleteScanIncoherences(projectId) {
  return del(`/api/projects/${projectId}/incoherences/scan`);
}

export async function insertScannedIncoherence(inc, projectId) {
  return post(`/api/projects/${projectId}/incoherences/scan`, { incoherences: [inc] });
}

export async function setIncoherenceResolved(incId, resolved, projectId) {
  return put(`/api/projects/${projectId}/incoherences/${incId}/resolved`, { resolved });
}

export async function setResolutionNote(incId, note, projectId) {
  return put(`/api/projects/${projectId}/incoherences/${incId}/note`, { note });
}

// ── Arc émotionnel ────────────────────────────────────────────────────────────

export async function getArcPoints(projectId) {
  return get(`/api/projects/${projectId}/arc`);
}

export async function upsertArcPoint(projectId, chapterNumber, intensity) {
  return put(`/api/projects/${projectId}/arc/${chapterNumber}`, { intensity });
}

// ── Notes ─────────────────────────────────────────────────────────────────────

export async function getChapterNotes(projectId) {
  return get(`/api/projects/${projectId}/notes`);
}

export async function setChapterNote(projectId, chapterNum, content) {
  return put(`/api/projects/${projectId}/notes/${chapterNum}`, { content });
}

// ── Plants ────────────────────────────────────────────────────────────────────

export async function getPlants(projectId) {
  return get(`/api/projects/${projectId}/plants`);
}

export async function insertPlant(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/plants`, data);
  return id;
}

export async function updatePlant(plantId, data, projectId) {
  return put(`/api/projects/${projectId}/plants/${plantId}`, data);
}

export async function deletePlant(plantId, projectId) {
  return del(`/api/projects/${projectId}/plants/${plantId}`);
}

// ── Fils narratifs ────────────────────────────────────────────────────────────

export async function getThreads(projectId) {
  return get(`/api/projects/${projectId}/threads`);
}

export async function insertThread(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/threads`, data);
  return id;
}

export async function updateThread(threadId, data, projectId) {
  return put(`/api/projects/${projectId}/threads/${threadId}`, data);
}

export async function deleteThread(threadId, projectId) {
  return del(`/api/projects/${projectId}/threads/${threadId}`);
}

// ── Trajets / Carte ───────────────────────────────────────────────────────────

export async function getAllJourneys(projectId) {
  return get(`/api/projects/${projectId}/journeys`);
}

export async function getJourney(charKey, projectId) {
  return get(`/api/projects/${projectId}/journeys/${encodeURIComponent(charKey)}`);
}

export async function saveJourney(projectId, charKey, steps) {
  return put(`/api/projects/${projectId}/journeys/${encodeURIComponent(charKey)}`, { steps });
}

// ── Arc des personnages ────────────────────────────────────────────────────────

export async function getAllCharacterAxes(projectId) {
  const { axes } = await get(`/api/projects/${projectId}/character-arcs`);
  return axes;
}

export async function getAllCharacterArcPoints(projectId) {
  const { points } = await get(`/api/projects/${projectId}/character-arcs`);
  return points;
}

export async function getAllProjectAxisLabels(projectId) {
  const { labels } = await get(`/api/projects/${projectId}/character-arcs`);
  return labels;
}

export async function getCharacterAxes(characterId, projectId) {
  return get(`/api/projects/${projectId}/characters/${characterId}/arcs`);
}

export async function insertCharacterAxis(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/character-arcs`, data);
  return id;
}

export async function deleteCharacterAxis(axisId, projectId) {
  return del(`/api/projects/${projectId}/character-arcs/${axisId}`);
}

export async function upsertCharacterArcPoint(projectId, axisId, chapterNum, value, note, volumeId) {
  return put(`/api/projects/${projectId}/character-arcs/${axisId}/points/${chapterNum}`, {
    value, note: note ?? null, volumeId: volumeId ?? null,
  });
}

export async function getCharacterArcPoints(axisId, projectId) {
  return get(`/api/projects/${projectId}/character-arcs/${axisId}/points`);
}

// ── Voyage du Héros ────────────────────────────────────────────────────────────

export async function getHeroJourneyEntries(projectId) {
  return get(`/api/projects/${projectId}/hero-journey`);
}

export async function saveHeroJourneyEntry(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/hero-journey`, data);
  return id;
}

export async function removeHeroJourneyEntry(entryId, projectId) {
  return del(`/api/projects/${projectId}/hero-journey/${entryId}`);
}

// ── Seed / Import ─────────────────────────────────────────────────────────────

export async function seedProjectViaApi(meta, data) {
  const { id } = await post('/api/seed', { meta, data });
  return id;
}

export async function importBackupViaApi(payload) {
  const { id } = await post('/api/import/backup', payload);
  return id;
}

// ── Utilitaires synchrones (re-exportés depuis queries.js) ────────────────────
// Ces fonctions n'ont pas besoin du serveur — elles calculent sur les données
// déjà chargées dans les stores.
export { computeAlerts, computeAlertsFromEvents } from '../db/queries';
