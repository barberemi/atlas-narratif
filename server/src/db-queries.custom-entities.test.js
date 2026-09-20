/**
 * Tests round-trip des types & entités custom (couche 3).
 * Vérifie CRUD + chiffrement + cascade de suppression d'un type.
 * Nécessite DATABASE_URL (fourni par `make server-test`).
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';

const q = await import('./db-queries.js');
const sql = (await import('./db.js')).default;

const DEVICE = 'test-device-custom-entities';

// Test d'intégration : nécessite un PostgreSQL joignable (make server-test).
// En CI sans base (node --test seul), on skippe proprement au lieu d'échouer.
let DB_SKIP = false;
try { await sql`select 1`; } catch { DB_SKIP = 'PostgreSQL indisponible (CI sans DB)'; await sql.end(); }

describe('types & entités custom (round-trip chiffré)', { skip: DB_SKIP }, () => {
  let projectId;

  before(async () => {
    projectId = await q.createProject(
      { name: 'Test Custom Entities', description: 'jetable' },
      { deviceId: DEVICE },
    );
  });

  after(async () => {
    if (projectId) await q.deleteProject(projectId, { deviceId: DEVICE });
    await sql.end();
  });

  it('type custom : CRUD + field_schema', async () => {
    const typeId = await q.insertCustomType(
      { label: 'Langue', icon: '🗣️', color: '#a78bfa', fieldSchema: [{ key: 'famille', label: 'Famille', type: 'text' }], baseBehavior: 'entity' },
      projectId,
    );
    let types = await q.getCustomTypes(projectId);
    let t = types.find(x => x.id === typeId);
    assert.ok(t, 'type inséré retrouvé');
    assert.equal(t.label, 'Langue');
    assert.equal(t.color, '#a78bfa');
    assert.deepEqual(t.fieldSchema, [{ key: 'famille', label: 'Famille', type: 'text' }]);

    await q.updateCustomType(typeId, { label: 'Idiome', icon: '🗣️', color: '#a78bfa', fieldSchema: [] }, projectId);
    types = await q.getCustomTypes(projectId);
    t = types.find(x => x.id === typeId);
    assert.equal(t.label, 'Idiome');
    assert.deepEqual(t.fieldSchema, []);
  });

  it('entité custom : CRUD + customFields chiffrés', async () => {
    const typeId = await q.insertCustomType({ label: 'Véhicule', fieldSchema: [] }, projectId);
    const entId = await q.insertCustomEntity(
      { typeId, name: 'Nazgûl-fell-beast', aliases: ['monture ailée'], description: 'créature volante', customFields: { vitesse: 'rapide' } },
      projectId,
    );
    let ents = await q.getCustomEntities(projectId);
    let e = ents.find(x => x.id === entId);
    assert.ok(e, 'entité insérée retrouvée');
    assert.equal(e.name, 'Nazgûl-fell-beast');
    assert.equal(e.typeId, typeId);
    assert.deepEqual(e.aliases, ['monture ailée']);
    assert.deepEqual(e.customFields, { vitesse: 'rapide' });

    await q.updateCustomEntity(entId, { typeId, name: 'Fell Beast', aliases: [], description: null, customFields: {} }, projectId);
    ents = await q.getCustomEntities(projectId);
    e = ents.find(x => x.id === entId);
    assert.equal(e.name, 'Fell Beast');
    assert.deepEqual(e.customFields, {});
  });

  it('exportProject inclut les champs custom déchiffrés + types/entités custom', async () => {
    await q.insertCharacter({ name: 'Perso Export', customFields: { signe: 'Balance' } }, projectId);
    const typeId = await q.insertCustomType({ label: 'Sortilège', fieldSchema: [{ key: 'école', label: 'École', type: 'text' }] }, projectId);
    await q.insertCustomEntity({ typeId, name: 'Boule de feu', customFields: { école: 'évocation' } }, projectId);

    const dump = await q.exportProject(projectId);

    const perso = dump.characters.find(c => c.name === 'Perso Export');
    assert.deepEqual(perso.custom_fields, { signe: 'Balance' }, 'custom_fields déchiffré dans l\'export');

    const type = dump.customEntityTypes.find(t => t.label === 'Sortilège');
    assert.ok(type, 'type custom exporté');
    assert.deepEqual(type.field_schema, [{ key: 'école', label: 'École', type: 'text' }]);

    const ent = dump.customEntities.find(e => e.name === 'Boule de feu');
    assert.ok(ent, 'entité custom exportée');
    assert.deepEqual(ent.custom_fields, { école: 'évocation' });
  });

  it('exportProject inclut les relations (libellé déchiffré)', async () => {
    const relId = await q.insertRelation(
      { sourceId: 'char_x', sourceType: 'character', targetId: 'obj_y', targetType: 'object', label: 'porte', directed: true },
      projectId,
    );
    const dump = await q.exportProject(projectId);
    const rel = dump.entityRelations.find(r => r.id === relId);
    assert.ok(rel, 'relation exportée');
    assert.equal(rel.label, 'porte', 'libellé déchiffré dans l\'export');
    assert.equal(rel.source_id, 'char_x');
    assert.equal(rel.directed, true);
  });

  it('supprimer un type supprime ses entités (cascade applicative)', async () => {
    const typeId = await q.insertCustomType({ label: 'Éphémère', fieldSchema: [] }, projectId);
    const e1 = await q.insertCustomEntity({ typeId, name: 'A' }, projectId);
    const e2 = await q.insertCustomEntity({ typeId, name: 'B' }, projectId);

    const snapshot = await q.deleteCustomType(typeId, projectId);
    assert.ok(snapshot, 'snapshot renvoyé');
    assert.equal(snapshot.entities.length, 2);

    const ents = await q.getCustomEntities(projectId);
    assert.ok(!ents.some(x => x.id === e1 || x.id === e2), 'entités du type supprimées');
    const types = await q.getCustomTypes(projectId);
    assert.ok(!types.some(x => x.id === typeId), 'type supprimé');

    // Restauration
    await q.restoreCustomType(snapshot, projectId);
    const restored = await q.getCustomEntities(projectId);
    assert.equal(restored.filter(x => x.id === e1 || x.id === e2).length, 2);
  });
});
