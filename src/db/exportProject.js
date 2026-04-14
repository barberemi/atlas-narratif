/**
 * Export d'un projet AtlasNarratif vers un fichier Markdown (bible narrative).
 * Délègue la collecte des données au serveur via l'API,
 * puis transforme en Markdown lisible.
 */

import { getDeviceId, ensureDeviceRegistered } from '../api/client';
import { buildMarkdown } from '../utils/exportMarkdown';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export async function exportProject(_db, projectId) {
  await ensureDeviceRegistered();
  const res = await fetch(`${BASE}/api/projects/${projectId}/export`, {
    credentials: 'include',
    headers: {
      'X-Device-Id':    getDeviceId(),
      'X-Device-Token': localStorage.getItem('atlas_device_token') ?? '',
    },
  });
  if (!res.ok) throw new Error(`Export échoué : HTTP ${res.status}`);
  const payload = await res.json();

  const markdown = buildMarkdown(payload);

  const slug     = payload.project.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  const date     = new Date().toISOString().slice(0, 10);
  const filename = `atlas_${slug}_${date}.md`;

  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
}
