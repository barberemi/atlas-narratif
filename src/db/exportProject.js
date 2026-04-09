/**
 * Export d'un projet AtlasNarratif vers un fichier JSON téléchargeable.
 * Délègue la collecte des données au serveur via l'API.
 */

import { getDeviceId } from '../api/client';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function exportProject(_db, projectId) {
  const res = await fetch(`${BASE}/api/projects/${projectId}/export`, {
    credentials: 'include',
    headers: { 'X-Device-Id': getDeviceId() },
  });
  if (!res.ok) throw new Error(`Export échoué : HTTP ${res.status}`);
  const payload = await res.json();

  const slug     = payload.project.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  const date     = new Date().toISOString().slice(0, 10);
  const filename = `atlas_${slug}_${date}.json`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
}
