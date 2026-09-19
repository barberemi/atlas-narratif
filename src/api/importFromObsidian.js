/**
 * Import d'un vault Obsidian → projet Atlas.
 *
 * Chaîne : parseVault(Zip) → mapToCanonical → (staging /review) → seedProjectViaApi.
 * Réutilise le pivot canonique (analysis_prompt.js) et le seeder serveur existant.
 * Les entités importées sont marquées `source='obsidian'` (badge /review).
 */

import { seedProjectViaApi } from './client';
import { parseVault, parseVaultZip } from '../import/obsidian/parseVault';
import { mapToCanonical } from '../import/obsidian/mapToCanonical';

/** Marque toutes les entités du payload avec une source (pour le badge /review). */
function stampSource(data, source) {
  for (const c of data.loreDB?.characters ?? []) c.source = source;
  for (const l of data.loreDB?.locations ?? []) l.source = source;
  for (const o of data.loreDB?.objects ?? []) o.source = source;
  for (const t of data.customTypesDB ?? []) t.source = source;
  for (const e of data.customEntitiesDB ?? []) e.source = source;
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
  const projectMeta = { name: meta?.name ?? 'Vault Obsidian' };
  if (meta?.description) projectMeta.description = meta.description; // le schéma n'accepte pas null
  return seedProjectViaApi(projectMeta, data);
}

/** Raccourci : parse .md → map → seed (sans étape de staging). */
export async function importFromObsidian(files, meta) {
  const { data, report } = previewObsidianImport(files);
  const id = await seedObsidianData(data, meta);
  return { id, report };
}
