/**
 * Client API — Atlas Narratif
 *
 * Couche fetch qui remplace les appels PGlite de src/db/queries.js.
 * Même signatures que queries.js mais sans le paramètre `db`.
 *
 * Toutes les requêtes sont envoyées à VITE_API_URL (défaut : http://localhost:3001).
 */

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ── Device ID signé ──────────────────────────────────────────────────────────

export function getDeviceId() {
  let id = localStorage.getItem('atlas_device_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('atlas_device_id', id);
  }
  return id;
}

function getDeviceToken() {
  return localStorage.getItem('atlas_device_token');
}

/** Enregistre le deviceId auprès du serveur et stocke le token HMAC. */
let _registerPromise = null;
export function ensureDeviceRegistered() {
  if (getDeviceToken()) return Promise.resolve();
  if (_registerPromise) return _registerPromise;
  _registerPromise = fetch(`${BASE}/api/device/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ deviceId: getDeviceId() }),
  })
    .then(r => r.json())
    .then(({ token }) => {
      if (token) localStorage.setItem('atlas_device_token', token);
    })
    .finally(() => { _registerPromise = null; });
  return _registerPromise;
}

// ── Fetch helper ──────────────────────────────────────────────────────────────

async function api(method, path, body) {
  if (path.includes('[object Object]')) {
    const err = new Error(`[API] path contains invalid projectId: ${path}`);
    console.error(err.message, err.stack);
    throw err;
  }
  // S'assurer que le device est enregistré avant toute requête
  await ensureDeviceRegistered();

  const opts = {
    method,
    credentials: 'include',
    headers: {
      'Content-Type':   'application/json',
      'X-Device-Id':    getDeviceId(),
      'X-Device-Token': getDeviceToken() ?? '',
    },
  };
  if (body !== undefined) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    const message = payload.error ?? `HTTP ${res.status}`;
    if (res.status === 401) {
      // Token expiré ou invalide → forcer re-registration au prochain appel
      localStorage.removeItem('atlas_device_token');
      _registerPromise = null;
    } else {
      import('./toast-bridge.js').then(m => m.showError(message));
    }
    throw new Error(message);
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
  const res = await del(`/api/projects/${projectId}/volumes/${volumeId}`);
  return res?.snapshot ?? null;
}

export async function restoreVolume(snapshot, projectId) {
  return post(`/api/projects/${projectId}/volumes/restore`, snapshot);
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
  const res = await del(`/api/projects/${projectId}/characters/${charId}`);
  return res?.snapshot ?? null;
}

export async function restoreCharacter(snapshot, projectId) {
  return post(`/api/projects/${projectId}/characters/restore`, snapshot);
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
  const res = await del(`/api/projects/${projectId}/locations/${locId}`);
  return res?.snapshot ?? null;
}

export async function restoreLocation(snapshot, projectId) {
  return post(`/api/projects/${projectId}/locations/restore`, snapshot);
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
  const res = await del(`/api/projects/${projectId}/objects/${objId}`);
  return res?.snapshot ?? null;
}

export async function restoreObject(snapshot, projectId) {
  return post(`/api/projects/${projectId}/objects/restore`, snapshot);
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

export async function setGroupMemberRole(groupId, characterId, roleInGroup, projectId) {
  return put(`/api/projects/${projectId}/groups/${groupId}/members/${characterId}/role`, { roleInGroup });
}

export async function deleteGroup(groupId, projectId) {
  const res = await del(`/api/projects/${projectId}/groups/${groupId}`);
  return res?.snapshot ?? null;
}

export async function restoreGroup(snapshot, projectId) {
  return post(`/api/projects/${projectId}/groups/restore`, snapshot);
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
  const res = await del(`/api/projects/${projectId}/events/${eventId}`);
  return res?.snapshot ?? null;
}

export async function restoreTimelineEvent(snapshot, projectId) {
  return post(`/api/projects/${projectId}/events/restore`, snapshot);
}

export async function reorderEvents(projectId, updates) {
  return put(`/api/projects/${projectId}/events/reorder`, { updates });
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
  const res = await del(`/api/projects/${projectId}/stc/${chapterId}`);
  return res?.snapshot ?? null;
}

export async function restoreStcChapter(snapshot, projectId) {
  return post(`/api/projects/${projectId}/stc/restore`, snapshot);
}

export async function reorderStcChapters(projectId, updates) {
  return put(`/api/projects/${projectId}/stc/reorder`, { updates });
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
  const res = await del(`/api/projects/${projectId}/plants/${plantId}`);
  return res?.snapshot ?? null;
}

export async function restorePlant(snapshot, projectId) {
  return post(`/api/projects/${projectId}/plants/restore`, snapshot);
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
  const res = await del(`/api/projects/${projectId}/threads/${threadId}`);
  return res?.snapshot ?? null;
}

export async function restoreThread(snapshot, projectId) {
  return post(`/api/projects/${projectId}/threads/restore`, snapshot);
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

export async function getAllCharacterArcs(projectId) {
  return get(`/api/projects/${projectId}/character-arcs`);
}

export async function getCharacterAxes(characterId, projectId) {
  return get(`/api/projects/${projectId}/characters/${characterId}/arcs`);
}

export async function insertCharacterAxis(data, projectId) {
  const { id } = await post(`/api/projects/${projectId}/character-arcs`, data);
  return id;
}

export async function deleteCharacterAxis(axisId, projectId) {
  const res = await del(`/api/projects/${projectId}/character-arcs/${axisId}`);
  return res?.snapshot ?? null;
}

export async function restoreCharacterAxis(snapshot, projectId) {
  return post(`/api/projects/${projectId}/character-arcs/restore`, snapshot);
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
  const res = await del(`/api/projects/${projectId}/hero-journey/${entryId}`);
  return res?.snapshot ?? null;
}

export async function restoreHeroJourneyEntry(snapshot, projectId) {
  return post(`/api/projects/${projectId}/hero-journey/restore`, snapshot);
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

// ── Compte utilisateur (RGPD) ─────────────────────────────────────────────────

export async function exportAccountData() {
  return get('/api/account/export');
}

export async function deleteAccount() {
  return del('/api/account');
}

// ── Utilitaires synchrones (re-exportés depuis queries.js) ────────────────────
// Ces fonctions n'ont pas besoin du serveur — elles calculent sur les données
// déjà chargées dans les stores.
export { computeAlerts, computeAlertsFromEvents } from '../db/queries';
