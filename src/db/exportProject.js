/**
 * Export d'un projet Atlas Narratif vers un fichier Markdown (bible narrative).
 * Délègue la collecte des données au serveur via l'API,
 * puis transforme en Markdown lisible.
 */

import { getDeviceId, ensureDeviceRegistered } from '../api/client';
import { buildMarkdown } from '../utils/exportMarkdown';
import { downloadBlob } from '../utils/download';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// Récupère le payload d'export complet d'un projet (JSON déchiffré côté serveur).
// Réutilisé par l'export Markdown et par les livrables auteur (bible perso,
// synopsis, checklist des amorces).
export async function fetchProjectExport(projectId) {
  await ensureDeviceRegistered();
  const res = await fetch(`${BASE}/api/projects/${projectId}/export`, {
    credentials: 'include',
    headers: {
      'X-Device-Id':    getDeviceId(),
      'X-Device-Token': localStorage.getItem('atlas_device_token') ?? '',
    },
  });
  if (!res.ok) throw new Error(`Export échoué : HTTP ${res.status}`);
  return res.json();
}

// Nom de fichier normalisé `atlas_<slug>_<date>` (sans extension).
export function exportBasename(projectName) {
  const slug = projectName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  const date = new Date().toISOString().slice(0, 10);
  return `atlas_${slug}_${date}`;
}

export async function exportProject(_db, projectId) {
  const payload  = await fetchProjectExport(projectId);
  const markdown = buildMarkdown(payload);
  const filename = `${exportBasename(payload.project.name)}.md`;
  downloadBlob(markdown, filename, 'text/markdown;charset=utf-8');
  return filename;
}
