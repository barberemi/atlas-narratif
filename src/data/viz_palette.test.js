import { describe, it, expect } from 'vitest';
import {
  VIZ_CATEGORICAL,
  VIZ_SEQUENTIAL,
  VIZ_STATUS,
  ENTITY_VIZ,
  STC_ACTS,
  actColorForBeatNumber,
  seqColor,
} from './viz_palette';
import { ENTITY_COLORS } from '../utils/entityUtils';
import { BEATS } from './beats_config';
import { HERO_PHASES } from './hero_journey_config';

describe('viz_palette — catégoriel', () => {
  it('expose 3 teintes distinctes en ordre fixe', () => {
    expect(VIZ_CATEGORICAL).toHaveLength(3);
    expect(new Set(VIZ_CATEGORICAL).size).toBe(3);
  });

  it('n’utilise pas de rouge/orange en catégoriel (réservé au sémantique)', () => {
    // les teintes de marque sont vert / or / ardoise, pas des rouges purs
    expect(VIZ_CATEGORICAL).toEqual(['#3aa981', '#b5871f', '#5a8fc9']);
  });
});

describe('viz_palette — actColorForBeatNumber', () => {
  it('mappe les beats sur les 3 actes (5 / 7 / 3)', () => {
    expect(actColorForBeatNumber(1)).toBe(VIZ_CATEGORICAL[0]);  // Acte I
    expect(actColorForBeatNumber(5)).toBe(VIZ_CATEGORICAL[0]);
    expect(actColorForBeatNumber(6)).toBe(VIZ_CATEGORICAL[1]);  // Acte II
    expect(actColorForBeatNumber(12)).toBe(VIZ_CATEGORICAL[1]);
    expect(actColorForBeatNumber(13)).toBe(VIZ_CATEGORICAL[2]); // Acte III
    expect(actColorForBeatNumber(15)).toBe(VIZ_CATEGORICAL[2]);
  });

  it('couvre exactement les 15 beats via STC_ACTS', () => {
    const total = STC_ACTS.reduce((s, a) => s + (a.to - a.from + 1), 0);
    expect(total).toBe(15);
  });
});

describe('viz_palette — seqColor (rampe or, magnitude)', () => {
  it('suit les paliers d’intensité, mono-teinte', () => {
    expect(seqColor(null)).toBe(VIZ_SEQUENTIAL[0]);
    expect(seqColor(2)).toBe(VIZ_SEQUENTIAL[0]);
    expect(seqColor(4)).toBe(VIZ_SEQUENTIAL[1]);
    expect(seqColor(6)).toBe(VIZ_SEQUENTIAL[2]);
    expect(seqColor(9)).toBe(VIZ_SEQUENTIAL[3]);
  });

  it('est monotone (clair → foncé)', () => {
    expect(VIZ_SEQUENTIAL).toHaveLength(4);
    expect(new Set(VIZ_SEQUENTIAL).size).toBe(4);
  });
});

describe('viz_palette — intégration', () => {
  it('les 15 beats STC portent une couleur d’acte (plus d’arc-en-ciel)', () => {
    const used = new Set(BEATS.map(b => b.color));
    expect([...used].every(c => VIZ_CATEGORICAL.includes(c))).toBe(true);
    expect(used.size).toBeLessThanOrEqual(3);
  });

  it('les 3 phases du Voyage du Héros réutilisent la triade catégorielle', () => {
    expect(HERO_PHASES.map(p => p.color)).toEqual(VIZ_CATEGORICAL);
  });
});

describe('viz_palette — couleurs par type d’entité', () => {
  it('mappe les 4 types sur des teintes de marque (fini le bleu/ambre génériques)', () => {
    expect(ENTITY_VIZ.character).toBe(VIZ_CATEGORICAL[0]);
    expect(ENTITY_VIZ.object).toBe(VIZ_CATEGORICAL[1]);
    expect(ENTITY_VIZ.location).toBe(VIZ_CATEGORICAL[2]);
    expect(ENTITY_VIZ.group).toBe('#b56e9e');
  });

  it('4 teintes distinctes, sans rouge/orange (réservé au statut)', () => {
    const cols = Object.values(ENTITY_VIZ);
    expect(new Set(cols).size).toBe(4);
    expect(cols).not.toContain(VIZ_STATUS.crit);
  });

  it('entityUtils.ENTITY_COLORS = la source palette (plus de hex en dur)', () => {
    expect(ENTITY_COLORS).toBe(ENTITY_VIZ);
  });
});
