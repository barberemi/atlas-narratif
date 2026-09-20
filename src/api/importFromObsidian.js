/**
 * Import d'un vault Obsidian → projet Atlas.
 *
 * Chaîne : parseVault(Zip) → mapToCanonical → (staging /review) → seedProjectViaApi.
 * Réutilise le pivot canonique (analysis_prompt.js) et le seeder serveur existant.
 * Les entités importées sont marquées `source='obsidian'` (badge /review).
 */

import { seedProjectViaApi } from './client';
import { parseVault, parseVaultZip } from '../import/obsidian/parseVault';
import { mapToCanonical, collectFields } from '../import/obsidian/mapToCanonical';

export { mapToCanonical, collectFields };

/** Parse des fichiers .md déjà lus ([{path, content}]) → notes structurées. */
export function parseObsidianFiles(files) {
  return parseVault(files);
}

/** Parse un ArrayBuffer de .zip → notes structurées. */
export async function parseObsidianZip(zipArrayBuffer) {
  return parseVaultZip(zipArrayBuffer);
}

/** Marque toutes les entités du payload avec une source (pour le badge /review). */
function stampSource(data, source) {
  for (const c of data.loreDB?.characters ?? []) c.source = source;
  for (const l of data.loreDB?.locations ?? []) l.source = source;
  for (const o of data.loreDB?.objects ?? []) o.source = source;
  for (const t of data.customTypesDB ?? []) t.source = source;
  for (const e of data.customEntitiesDB ?? []) e.source = source;
  for (const r of data.relationsDB ?? []) r.source = source;
  for (const ev of data.timelineDB ?? []) ev.source = source;
  for (const ch of data.chaptersDB ?? []) ch.source = source;
  for (const v of data.volumesDB ?? []) v.source = source;
}

/** Aperçu (dry-run) depuis des fichiers .md déjà lus : { data, report }. */
export function previewObsidianImport(files) {
  return mapToCanonical(parseVault(files));
}

/** Aperçu (dry-run) depuis un ArrayBuffer de .zip : { data, report }. */
export async function previewObsidianZip(zipArrayBuffer) {
  const notes = await parseVaultZip(zipArrayBuffer);
  return mapToCanonical(notes);
}

/**
 * Écrit un payload canonique déjà prévisualisé (après confirmation /review).
 * @returns {Promise<string>} id du projet créé
 */
export async function seedObsidianData(data, meta) {
  stampSource(data, 'obsidian');
  // Id de base UNIQUE par import : sans lui, `meta.id` serait undefined et le serveur
  // résoudrait tous les imports Obsidian d'un même appareil vers le même projet
  // (`undefined_d_<device>`) → chaque import écraserait le précédent. Le serveur
  // suffixe encore cet id par `_d_<device>` / `_u_<user>` (copie par appareil/compte).
  const projectMeta = {
    id: meta?.id ?? `obsidian_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    name: meta?.name ?? 'Vault Obsidian',
  };
  if (meta?.description) projectMeta.description = meta.description; // le schéma n'accepte pas null
  return seedProjectViaApi(projectMeta, data);
}

/** Raccourci : parse .md → map → seed (sans étape de staging). */
export async function importFromObsidian(files, meta) {
  const { data, report } = previewObsidianImport(files);
  const id = await seedObsidianData(data, meta);
  return { id, report };
}
