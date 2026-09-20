/**
 * Génère samples/harry-potter-tome1.json (format d'import « JSON IA » de la
 * HomePage → importFromAiOutputViaApi) à partir du module source
 * src/data/hp_seed_data.js.
 *
 * Lancer : docker compose -f docker-compose.dev-full.yml exec frontend node samples/gen-hp-json.mjs
 * Les extras de scène (pov, beat, threads, goal…) sont fusionnés INLINE dans
 * timelineDB, car l'import JSON dérive eventExtrasDB depuis ces champs inline.
 */
import { writeFileSync } from 'node:fs';
import * as hp from '../src/data/hp_seed_data.js';

const timelineDB = hp.timelineDB.map(e => ({ ...e, ...(hp.eventExtrasDB[e.id] ?? {}) }));

const out = {
  volumes: hp.volumesDB,
  loreDB: hp.loreDB,
  groupsDB: [],
  timelineDB,
  incoherencesDB: [],
  chaptersDB: hp.chaptersDB,
  plantsDB: [],
  threadsDB: hp.threadsDB,
  heroJourneyDB: [],
  customTypesDB: hp.customTypesDB,
  customEntitiesDB: hp.customEntitiesDB,
  relationsDB: hp.relationsDB,
};

const path = new URL('./harry-potter-tome1.json', import.meta.url).pathname;
writeFileSync(path, JSON.stringify(out, null, 2) + '\n');
console.log(
  `OK → ${path}\n` +
  `  ${out.loreDB.characters.length} persos · ${out.loreDB.locations.length} lieux · ${out.loreDB.objects.length} objets\n` +
  `  ${out.timelineDB.length} scènes · ${out.chaptersDB.length} chapitres · ${out.customEntitiesDB.length} entités custom · ${out.relationsDB.length} relations`,
);
