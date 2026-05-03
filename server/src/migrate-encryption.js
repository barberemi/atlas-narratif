#!/usr/bin/env node
/**
 * Migration chiffrement — Atlas Narratif
 *
 * Pour chaque projet sans DEK, génère une DEK et chiffre tous les champs
 * sensibles en base. Idempotent : skip les valeurs déjà préfixées "enc:v1:".
 *
 * Usage : node server/src/migrate-encryption.js
 * Requiert : ATLAS_ENCRYPTION_KEY et DATABASE_URL en variables d'env.
 */

import sql from './db.js';
import { isEncryptionEnabled, encrypt, createProjectDek, getProjectDek } from './crypto.js';

const PREFIX = 'enc:v1:';

// ── Tables et champs sensibles ──────────────────────────────────────────────

const TABLES = [
  { table: 'projects',             pk: ['id'],                             text: ['name', 'description', 'map_image'], json: [] },
  { table: 'volumes',              pk: ['id', 'project_id'],               text: ['title', 'description'], json: [] },
  { table: 'characters',           pk: ['id', 'project_id'],               text: ['name', 'race', 'role', 'origin', 'description'], json: ['aliases', 'affiliations', 'traits'] },
  { table: 'locations',            pk: ['id', 'project_id'],               text: ['name', 'type', 'regime', 'description'], json: ['inhabitants', 'visited_by', 'key_places'] },
  { table: 'objects',              pk: ['id', 'project_id'],               text: ['name', 'type', 'description', 'creator', 'current_holder', 'inscription'], json: ['powers'] },
  { table: 'timeline_events',      pk: ['id', 'project_id'],               text: ['title', 'description', 'chapter_title', 'scene_goal', 'scene_conflict', 'scene_outcome'], json: [] },
  { table: 'incoherences',         pk: ['id', 'project_id'],               text: ['title', 'explanation', 'resolution_note'], json: [] },
  { table: 'incoherence_links',    pk: ['incoherence_id', 'project_id', 'entity_id'], text: ['label'], json: [] },
  { table: 'stc_chapters',         pk: ['id', 'project_id'],               text: ['title', 'summary'], json: [] },
  { table: 'arc_points',           pk: ['project_id', 'chapter_number'],    text: ['note'], json: [] },
  { table: 'chapter_notes',        pk: ['project_id', 'chapter_num'],       text: ['content'], json: [] },
  { table: 'plant_payoffs',        pk: ['id', 'project_id'],               text: ['label', 'notes'], json: [] },
  { table: 'narrative_threads',    pk: ['id', 'project_id'],               text: ['name', 'description'], json: [] },
  { table: 'character_arc_axes',   pk: ['id', 'project_id'],               text: ['label'], json: [] },
  { table: 'character_arc_points', pk: ['project_id', 'axis_id', 'chapter_num'], text: ['note'], json: [] },
  { table: 'hero_journey_entries', pk: ['id'],                             text: ['summary'], json: [] },
  { table: 'character_journeys',   pk: ['project_id', 'char_key', 'step_index'], text: [], json: ['data'] },
  { table: 'groups',               pk: ['id', 'project_id'],               text: ['name', 'description'], json: [] },
];

function isEncrypted(val) {
  return typeof val === 'string' && val.startsWith(PREFIX);
}

async function migrateProject(projectId) {
  // Assure qu'une DEK existe
  let dek = await getProjectDek(projectId);
  if (!dek) {
    dek = await createProjectDek(projectId);
  }

  for (const { table, pk, text, json } of TABLES) {
    // Skip tables without project_id column (only projects itself)
    const hasProjectId = pk.includes('project_id') || table === 'projects';
    if (!hasProjectId && table !== 'hero_journey_entries') continue;

    let rows;
    if (table === 'projects') {
      rows = await sql`SELECT * FROM projects WHERE id = ${projectId}`;
    } else if (table === 'hero_journey_entries') {
      rows = await sql`SELECT * FROM hero_journey_entries WHERE project_id = ${projectId}`;
    } else {
      rows = await sql`SELECT * FROM ${sql(table)} WHERE project_id = ${projectId}`;
    }

    let updated = 0;
    for (const row of rows) {
      const sets = {};
      let needsUpdate = false;

      // TEXT fields
      for (const col of text) {
        const val = row[col];
        if (val !== null && val !== undefined && !isEncrypted(val)) {
          sets[col] = encrypt(val, dek);
          needsUpdate = true;
        }
      }

      // JSONB fields — only encrypt if not already a string starting with prefix
      for (const col of json) {
        const val = row[col];
        if (val !== null && val !== undefined && !isEncrypted(val)) {
          sets[col] = encrypt(val, dek);
          needsUpdate = true;
        }
      }

      if (!needsUpdate) continue;

      // Build WHERE clause from PK
      const where = pk.map(k => sql`${sql(k)} = ${row[k]}`);
      const whereCombined = where.reduce((a, b) => sql`${a} AND ${b}`);
      const setCols = Object.entries(sets);

      // postgres.js doesn't have a nice dynamic SET, so build it manually
      for (const [col, val] of setCols) {
        await sql`UPDATE ${sql(table)} SET ${sql(col)} = ${val} WHERE ${whereCombined}`;
      }
      updated++;
    }

    if (updated > 0) {
      console.log(`  [${table}] ${updated} rows encrypted`);
    }
  }
}

async function main() {
  if (!isEncryptionEnabled()) {
    console.log('ATLAS_ENCRYPTION_KEY non défini — rien à migrer.');
    process.exit(0);
  }

  const projects = await sql`SELECT id FROM projects WHERE encryption_key_enc IS NULL`;
  if (projects.length === 0) {
    console.log('Tous les projets ont déjà une DEK — rien à migrer.');
    await sql.end();
    process.exit(0);
  }

  console.log(`${projects.length} projet(s) à migrer…`);
  for (const { id } of projects) {
    console.log(`\nMigration du projet : ${id}`);
    await migrateProject(id);
  }

  console.log('\nMigration terminée.');
  await sql.end();
}

main().catch(err => {
  console.error('ERREUR :', err);
  process.exit(1);
});
