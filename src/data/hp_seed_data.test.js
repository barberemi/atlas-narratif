import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import * as hp from './hp_seed_data';

// Le fichier réimportable, généré depuis le module (samples/gen-hp-json.mjs).
// Lu relativement à la racine projet (cwd Vitest = racine).
const sample = JSON.parse(readFileSync('samples/harry-potter-tome1.json', 'utf8'));

const BEATS = new Set([
  'opening_image', 'theme_stated', 'setup', 'catalyst', 'debate',
  'break_into_two', 'b_story', 'fun_and_games', 'midpoint', 'bad_guys',
  'all_is_lost', 'dark_night', 'break_into_three', 'finale', 'final_image',
]);

/** Ensemble de tous les ids d'entités (noyau + custom) du sample. */
function entityIds(d) {
  return new Set([
    ...d.loreDB.characters.map(c => c.id),
    ...d.loreDB.locations.map(l => l.id),
    ...d.loreDB.objects.map(o => o.id),
    ...d.customEntitiesDB.map(e => e.id),
  ]);
}

describe('samples/harry-potter-tome1.json — intégrité (fichier réimportable)', () => {
  it('a toutes les collections attendues', () => {
    expect(Array.isArray(sample.volumes)).toBe(true);
    expect(sample.loreDB.characters.length).toBeGreaterThan(0);
    for (const key of ['timelineDB', 'chaptersDB', 'customTypesDB', 'customEntitiesDB', 'relationsDB', 'threadsDB']) {
      expect(Array.isArray(sample[key]), key).toBe(true);
    }
  });

  it('respecte les préfixes d\'id', () => {
    expect(sample.loreDB.characters.every(c => c.id.startsWith('char_'))).toBe(true);
    expect(sample.loreDB.locations.every(l => l.id.startsWith('loc_'))).toBe(true);
    expect(sample.loreDB.objects.every(o => o.id.startsWith('obj_'))).toBe(true);
    expect(sample.customEntitiesDB.every(e => e.id.startsWith('cent_'))).toBe(true);
    expect(sample.customTypesDB.every(t => t.id.startsWith('ctype_'))).toBe(true);
    expect(sample.relationsDB.every(r => r.id.startsWith('rel_'))).toBe(true);
  });

  it('intégrité référentielle des événements (entities, lieu, pov)', () => {
    const ids = entityIds(sample);
    for (const evt of sample.timelineDB) {
      for (const en of evt.entities ?? []) {
        expect(ids.has(en.id), `${evt.id} → ${en.id}`).toBe(true);
        expect(['character', 'location', 'object', 'custom']).toContain(en.entityType);
      }
      if (evt.locationId) expect(ids.has(evt.locationId), evt.locationId).toBe(true);
      if (evt.povCharacterId) expect(ids.has(evt.povCharacterId), evt.povCharacterId).toBe(true);
      if (evt.beatId) expect(BEATS.has(evt.beatId), evt.beatId).toBe(true);
    }
  });

  it('intégrité des relations (source/cible existent)', () => {
    const ids = entityIds(sample);
    for (const r of sample.relationsDB) {
      expect(ids.has(r.sourceId), r.sourceId).toBe(true);
      expect(ids.has(r.targetId), r.targetId).toBe(true);
    }
  });

  it('chaque entité custom référence un type existant', () => {
    const typeIds = new Set(sample.customTypesDB.map(t => t.id));
    for (const e of sample.customEntitiesDB) expect(typeIds.has(e.typeId), e.typeId).toBe(true);
  });

  it('beats de chapitres valides', () => {
    for (const ch of sample.chaptersDB) {
      for (const b of ch.beats ?? []) expect(BEATS.has(b), b).toBe(true);
    }
  });

  it('n\'est pas périmé vs le module source (regénérer via gen-hp-json.mjs)', () => {
    expect(sample.loreDB.characters.length).toBe(hp.loreDB.characters.length);
    expect(sample.loreDB.locations.length).toBe(hp.loreDB.locations.length);
    expect(sample.loreDB.objects.length).toBe(hp.loreDB.objects.length);
    expect(sample.timelineDB.length).toBe(hp.timelineDB.length);
    expect(sample.chaptersDB.length).toBe(hp.chaptersDB.length);
    expect(sample.customEntitiesDB.length).toBe(hp.customEntitiesDB.length);
    expect(sample.relationsDB.length).toBe(hp.relationsDB.length);
  });
});
