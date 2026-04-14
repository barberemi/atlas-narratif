import { describe, it, expect } from 'vitest';
import { buildMarkdown } from './exportMarkdown';

const BASE_PAYLOAD = {
  project: { name: 'Mon Roman', description: 'Un roman de test' },
  volumes: [],
  characters: [],
  locations: [],
  objects: [],
  timelineEvents: [],
  eventEntities: [],
  incoherences: [],
  incoherenceLinks: [],
  stcChapters: [],
  stcChapterBeats: [],
  stcChapterEntities: [],
  groups: [],
  characterGroups: [],
  plantPayoffs: [],
  narrativeThreads: [],
  characterArcAxes: [],
  characterArcPoints: [],
  heroJourneyEntries: [],
};

function payload(overrides) {
  return { ...BASE_PAYLOAD, ...overrides };
}

describe('buildMarkdown', () => {
  it('contient le titre et la description du projet', () => {
    const md = buildMarkdown(BASE_PAYLOAD);
    expect(md).toContain('# Mon Roman');
    expect(md).toContain('> Un roman de test');
  });

  it('inclut les personnages avec leurs détails', () => {
    const md = buildMarkdown(payload({
      characters: [{
        id: 'c1', name: 'Alice', role: 'Héroïne', race: 'Humaine',
        origin: 'Paris', aliases: ['Ali'], traits: ['Courageuse'],
        affiliations: ['Guilde'], description: 'La protagoniste.',
      }],
    }));
    expect(md).toContain('### Alice — Héroïne');
    expect(md).toContain('**Aliases** : Ali');
    expect(md).toContain('**Race** : Humaine');
    expect(md).toContain('**Origine** : Paris');
    expect(md).toContain('**Traits** : Courageuse');
    expect(md).toContain('**Affiliations** : Guilde');
    expect(md).toContain('> La protagoniste.');
  });

  it('inclut les groupes des personnages', () => {
    const md = buildMarkdown(payload({
      characters: [{ id: 'c1', name: 'Alice' }],
      groups: [{ id: 'g1', name: 'La Guilde' }],
      characterGroups: [{ character_id: 'c1', group_id: 'g1' }],
    }));
    expect(md).toContain('**Groupes** : La Guilde');
  });

  it('inclut les lieux', () => {
    const md = buildMarkdown(payload({
      locations: [{ id: 'l1', name: 'Forêt Noire', type: 'Forêt', regime: 'Sauvage', inhabitants: ['Elfes'], description: 'Sombre et ancienne.' }],
    }));
    expect(md).toContain('### Forêt Noire (Forêt)');
    expect(md).toContain('**Régime** : Sauvage');
    expect(md).toContain('**Habitants** : Elfes');
  });

  it('inclut les objets avec inscription', () => {
    const md = buildMarkdown(payload({
      objects: [{ id: 'o1', name: 'Anneau', type: 'Artefact', creator: 'Sauron', inscription: 'Un Anneau pour les gouverner tous', description: 'L\'objet de pouvoir.' }],
    }));
    expect(md).toContain('### Anneau (Artefact)');
    expect(md).toContain('**Créateur** : Sauron');
    expect(md).toContain('*« Un Anneau pour les gouverner tous »*');
  });

  it('inclut la timeline avec résolution des IDs', () => {
    const md = buildMarkdown(payload({
      characters: [{ id: 'c1', name: 'Frodo' }],
      locations: [{ id: 'l1', name: 'Comté' }],
      timelineEvents: [{
        id: 'e1', chapter_num: 1, chapter_title: 'Départ', title: 'La fête',
        description: 'Bilbo disparaît.', location_id: 'l1', pov_character_id: 'c1',
        scene_order: 1,
      }],
      eventEntities: [{ event_id: 'e1', entity_id: 'c1', entity_type: 'character' }],
    }));
    expect(md).toContain('### Chapitre 1 — Départ');
    expect(md).toContain('#### La fête');
    expect(md).toContain('**POV** : Frodo');
    expect(md).toContain('**Lieu** : Comté');
    expect(md).toContain('**Personnages/Entités** : Frodo');
  });

  it('affiche les volumes dans la timeline si multi-tomes', () => {
    const md = buildMarkdown(payload({
      volumes: [
        { id: 'v1', number: 1, title: 'Tome 1' },
        { id: 'v2', number: 2, title: 'Tome 2' },
      ],
      timelineEvents: [{
        id: 'e1', chapter_num: 1, chapter_title: 'Début', title: 'Evt', volume_id: 'v1', scene_order: 1,
      }],
    }));
    expect(md).toContain('## Volumes');
    expect(md).toContain('### Tome 1 — Tome 1');
    expect(md).toContain('[Tome 1]');
  });

  it('inclut les plants en tableau', () => {
    const md = buildMarkdown(payload({
      plantPayoffs: [{
        id: 'p1', label: 'La prophétie', type: 'information',
        plant_chapter_num: 3, payoff_chapter_num: 15, status: 'resolved', notes: 'Important',
      }],
    }));
    expect(md).toContain('## Amorces narratives');
    expect(md).toContain('| La prophétie | information | 3 | 15 | resolved | Important |');
  });

  it('inclut le voyage du héros avec labels', () => {
    const md = buildMarkdown(payload({
      characters: [{ id: 'c1', name: 'Frodo' }],
      heroJourneyEntries: [{
        id: 'h1', stage_key: 'ordinary_world', character_id: 'c1', chapter_num: 1, summary: 'La Comté paisible',
      }],
    }));
    expect(md).toContain('## Voyage du Héros');
    expect(md).toContain('### Frodo');
    expect(md).toContain('| Monde Ordinaire | 1 | La Comté paisible |');
  });

  it('inclut les incohérences non résolues seulement', () => {
    const md = buildMarkdown(payload({
      incoherences: [
        { id: 'i1', severity: 'high', title: 'Contradiction', explanation: 'Bug narratif', resolved: false },
        { id: 'i2', severity: 'low', title: 'Résolu', resolved: true },
      ],
    }));
    expect(md).toContain('[HIGH] Contradiction');
    expect(md).not.toContain('Résolu');
  });

  it('ignore les sections vides', () => {
    const md = buildMarkdown(BASE_PAYLOAD);
    expect(md).not.toContain('## Personnages');
    expect(md).not.toContain('## Lieux');
    expect(md).not.toContain('## Timeline');
  });

  it('inclut les fils narratifs dans la timeline', () => {
    const md = buildMarkdown(payload({
      narrativeThreads: [{ id: 't1', name: 'Quête principale', role: 'mainplot' }],
      timelineEvents: [{
        id: 'e1', chapter_num: 1, title: 'Evt', thread_ids: ['t1'], scene_order: 1,
      }],
    }));
    expect(md).toContain('**Fils narratifs** : Quête principale');
  });

  it('inclut la structure Save the Cat avec beats', () => {
    const md = buildMarkdown(payload({
      stcChapters: [{ id: 'ch1', number: 1, title: 'Ouverture', summary: 'Le début' }],
      stcChapterBeats: [{ chapter_id: 'ch1', beat_id: 'opening_image' }],
    }));
    expect(md).toContain('## Structure Save the Cat');
    expect(md).toContain("**Beats** : Scène d'ouverture");
    expect(md).toContain('> Le début');
  });
});
