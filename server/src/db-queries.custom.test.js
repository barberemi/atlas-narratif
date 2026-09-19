/**
 * Tests round-trip des champs custom (couche 2) sur les entités natives.
 *
 * Vérifie que `customFields` traverse le chemin réel insert → JSONB chiffré →
 * decrypt → parseJ sans perte, pour characters / locations / objects.
 *
 * Nécessite une base PostgreSQL accessible via DATABASE_URL (fournie dans le
 * container `api` par `make server-test`).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';

const {
  createProject, deleteProject,
  insertCharacter, updateCharacter, getCharacters,
  insertLocation, updateLocation, getLocations,
  insertObject, updateObject, getObjects,
} = await import('./db-queries.js');
const sql = (await import('./db.js')).default;

const DEVICE = 'test-device-custom-fields';

// Test d'intégration : nécessite un PostgreSQL joignable (make server-test).
// En CI sans base (node --test seul), on skippe proprement au lieu d'échouer.
let DB_SKIP = false;
try { await sql`select 1`; } catch { DB_SKIP = 'PostgreSQL indisponible (CI sans DB)'; await sql.end(); }

describe('champs custom (round-trip chiffré)', { skip: DB_SKIP }, () => {
  let projectId;

  before(async () => {
    projectId = await createProject(
      { name: 'Test Custom Fields', description: 'jetable' },
      { deviceId: DEVICE },
    );
  });

  after(async () => {
    if (projectId) await deleteProject(projectId, { deviceId: DEVICE });
    await sql.end();
  });

  it('character : customFields insérés puis relus à l’identique', async () => {
    const customFields = { age: '87', signe: 'Balance', langues: ['Ouestron', 'Sindarin'] };
    const id = await insertCharacter({ name: 'Bilbo', customFields }, projectId);

    let rows = await getCharacters(projectId);
    let row = rows.find(r => r.id === id);
    assert.ok(row, 'personnage inséré retrouvé');
    assert.deepEqual(row.customFields, customFields);

    // Mise à jour → nouvelles valeurs
    const updated = { age: '111', signe: 'Balance' };
    await updateCharacter(id, { name: 'Bilbo', customFields: updated }, projectId);
    rows = await getCharacters(projectId);
    row = rows.find(r => r.id === id);
    assert.deepEqual(row.customFields, updated);
  });

  it('character : customFields absents → objet vide', async () => {
    const id = await insertCharacter({ name: 'Sansnom' }, projectId);
    const row = (await getCharacters(projectId)).find(r => r.id === id);
    assert.deepEqual(row.customFields, {});
  });

  it('location : customFields insérés puis relus à l’identique', async () => {
    const customFields = { population: '50000', climat: 'tempéré' };
    const id = await insertLocation({ name: 'Minas Tirith', customFields }, projectId);
    let row = (await getLocations(projectId)).find(r => r.id === id);
    assert.deepEqual(row.customFields, customFields);

    await updateLocation(id, { name: 'Minas Tirith', customFields: { population: '60000' } }, projectId);
    row = (await getLocations(projectId)).find(r => r.id === id);
    assert.deepEqual(row.customFields, { population: '60000' });
  });

  it('object : customFields insérés puis relus à l’identique', async () => {
    const customFields = { matiere: 'mithril', valeur: '999' };
    const id = await insertObject({ name: 'Cotte de mailles', customFields }, projectId);
    let row = (await getObjects(projectId)).find(r => r.id === id);
    assert.deepEqual(row.customFields, customFields);

    await updateObject(id, { name: 'Cotte de mailles', customFields: {} }, projectId);
    row = (await getObjects(projectId)).find(r => r.id === id);
    assert.deepEqual(row.customFields, {});
  });
});
