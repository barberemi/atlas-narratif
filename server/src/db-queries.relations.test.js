/**
 * Tests round-trip des relations explicites entre entités (Niveau 3).
 *
 * Vérifie insert → get (libellé chiffré déchiffré), update, delete + restore.
 * Nécessite un PostgreSQL joignable via DATABASE_URL (make server-test).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';

const {
  createProject, deleteProject,
  insertRelation, updateRelation, deleteRelation, restoreRelation, getRelations,
  insertCharacter, deleteCharacter, restoreCharacter,
} = await import('./db-queries.js');
const sql = (await import('./db.js')).default;

const DEVICE = 'test-device-relations';

let DB_SKIP = false;
try { await sql`select 1`; } catch { DB_SKIP = 'PostgreSQL indisponible (CI sans DB)'; await sql.end(); }

describe('relations (round-trip chiffré)', { skip: DB_SKIP }, () => {
  let projectId;

  before(async () => {
    projectId = await createProject({ name: 'Test Relations', description: 'jetable' }, { deviceId: DEVICE });
  });

  after(async () => {
    if (projectId) await deleteProject(projectId, { deviceId: DEVICE });
    await sql.end();
  });

  it('insert → get : libellé chiffré relu, sens conservé', async () => {
    const id = await insertRelation({
      sourceId: 'char_a', sourceType: 'character',
      targetId: 'obj_b', targetType: 'object',
      label: 'porte', directed: true,
    }, projectId);

    const row = (await getRelations(projectId)).find(r => r.id === id);
    assert.ok(row, 'relation insérée retrouvée');
    assert.equal(row.label, 'porte');
    assert.equal(row.sourceId, 'char_a');
    assert.equal(row.targetType, 'object');
    assert.equal(row.directed, true);
  });

  it('update : libellé + sens modifiés', async () => {
    const id = await insertRelation({
      sourceId: 'char_x', sourceType: 'character',
      targetId: 'char_y', targetType: 'character',
      label: 'rival de', directed: true,
    }, projectId);

    await updateRelation(id, {
      sourceId: 'char_x', sourceType: 'character',
      targetId: 'char_y', targetType: 'character',
      label: 'ami de', directed: false,
    }, projectId);

    const row = (await getRelations(projectId)).find(r => r.id === id);
    assert.equal(row.label, 'ami de');
    assert.equal(row.directed, false);
  });

  it('label null accepté (wikilink sans libellé)', async () => {
    const id = await insertRelation({
      sourceId: 'a', sourceType: 'custom', targetId: 'b', targetType: 'location', label: null,
    }, projectId);
    const row = (await getRelations(projectId)).find(r => r.id === id);
    assert.equal(row.label, null);
  });

  it('delete → restore : la relation revient à l’identique', async () => {
    const id = await insertRelation({
      sourceId: 'char_1', sourceType: 'character', targetId: 'loc_1', targetType: 'location', label: 'réside à',
    }, projectId);

    const snapshot = await deleteRelation(id, projectId);
    assert.ok(snapshot?.entity, 'snapshot retourné');
    assert.equal((await getRelations(projectId)).some(r => r.id === id), false);

    await restoreRelation(snapshot, projectId);
    const row = (await getRelations(projectId)).find(r => r.id === id);
    assert.ok(row, 'relation restaurée');
    assert.equal(row.label, 'réside à');
  });

  it('supprimer une entité purge ses relations (et le restore les ramène)', async () => {
    const charId = await insertCharacter({ name: 'Éowyn' }, projectId);
    const relId = await insertRelation({
      sourceId: charId, sourceType: 'character',
      targetId: 'obj_sword', targetType: 'object', label: 'manie',
    }, projectId);
    assert.equal((await getRelations(projectId)).some(r => r.id === relId), true);

    const snap = await deleteCharacter(charId, projectId);
    assert.ok(snap.relations?.some(r => r.id === relId), 'relation dans le snapshot');
    assert.equal((await getRelations(projectId)).some(r => r.id === relId), false, 'relation purgée');

    await restoreCharacter(snap, projectId);
    assert.equal((await getRelations(projectId)).some(r => r.id === relId), true, 'relation restaurée avec l’entité');
  });
});
