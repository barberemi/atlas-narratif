import { describe, it, expect } from 'vitest';
import { loreDB, timelineDB, plantsDB, incoherencesDB } from './lotr_seed_data';
import { t2Characters, t2Locations, t2Objects, t2TimelineDB, t2PlantsDB, t2IncoherencesDB } from './lotr_t2_seed_data';
import { t3Characters, t3Locations, t3Objects, t3TimelineDB, t3PlantsDB, t3IncoherencesDB } from './lotr_t3_seed_data';

// Intégrité croisée du seed LOTR (T1 + T2 + T3), tel que fusionné par src/db/seed.lotr.js.
const events = [...timelineDB, ...t2TimelineDB, ...t3TimelineDB];
const plants = [...plantsDB, ...t2PlantsDB, ...t3PlantsDB];
const incoherences = [...incoherencesDB, ...t2IncoherencesDB, ...t3IncoherencesDB];
const entityIds = new Set([
  ...loreDB.characters, ...loreDB.locations, ...loreDB.objects,
  ...t2Characters, ...t2Locations, ...t2Objects,
  ...t3Characters, ...t3Locations, ...t3Objects,
].map((e) => e.id));
const eventIds = new Set(events.map((e) => e.id));

describe('seed LOTR — amorces (plant / payoff)', () => {
  it('les ids d\'amorces sont uniques', () => {
    const ids = plants.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('les événements de pose et de paiement existent dans la timeline', () => {
    for (const p of plants) {
      if (p.plant_event_id) expect(eventIds.has(p.plant_event_id), `${p.id} → ${p.plant_event_id}`).toBe(true);
      if (p.payoff_event_id) expect(eventIds.has(p.payoff_event_id), `${p.id} → ${p.payoff_event_id}`).toBe(true);
    }
  });

  it('aucune amorce en suspens n\'est doublée par une version résolue (même événement de pose)', () => {
    const resolvedPlantEvents = new Set(plants.filter((p) => p.status === 'resolved' && p.plant_event_id).map((p) => p.plant_event_id));
    const duplicates = plants.filter((p) => p.status === 'open' && resolvedPlantEvents.has(p.plant_event_id));
    expect(duplicates.map((p) => p.id)).toEqual([]);
  });

  it('garde au moins une amorce en suspens pour illustrer le filtre', () => {
    expect(plants.some((p) => p.status === 'open')).toBe(true);
  });
});

describe('seed LOTR — références d\'entités', () => {
  it('les liens des incohérences pointent vers des entités existantes', () => {
    for (const inc of incoherences) {
      for (const link of inc.links ?? []) {
        if (link.entityId) expect(entityIds.has(link.entityId), `${inc.id} → ${link.entityId}`).toBe(true);
      }
    }
  });
});
