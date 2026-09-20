import { describe, it, expect } from 'vitest';
import { parseVault } from './parseVault';
import { mapToCanonical } from './mapToCanonical';
import { classifyNarrative, mapSceneField } from './fieldMap';

// ── Vault synthétique : entités + notes narratives (scènes/chapitres) ───────────
const VAULT = [
  {
    path: 'Personnages/Frodon.md',
    content: `---\ntype: personnage\nrace: Hobbit\n---\nPorteur de l'Anneau.`,
  },
  {
    path: 'Personnages/Gandalf.md',
    content: `---\ntype: personnage\nrace: Maia\n---\nUn magicien.`,
  },
  {
    path: 'Lieux/Comte.md',
    content: `---\ntype: lieu\n---\nLe pays des Hobbits.`,
  },
  {
    path: 'Objets/Anneau Unique.md',
    content: `---\ntype: objet\n---\nL'Anneau de pouvoir.`,
  },
  {
    path: 'Chapitres/Une fete attendue.md',
    content: `---\ntype: chapitre\nnumero: 1\ntome: 1\nresume: L'anniversaire de Bilbon.\nbeat: opening_image\n---\nLe premier chapitre.`,
  },
  {
    path: 'Scenes/Le depart du Comte.md',
    content: `---
type: scène
chapitre: 1
ordre: 2
pov: Frodon
lieu: Comte
personnages: ["[[Frodon]]"]
objets: ["[[Anneau Unique]]"]
tome: 1
resume: Frodon quitte la Comté avec l'Anneau.
beat: catalyst
threads: ["Quete de l'Anneau"]
objectif: Sauver la Comté
conflit: Les Nazgul le traquent
resultat: Il s'echappe de justesse
---
Frodon écoute [[Gandalf]] puis part. Un lien cassé vers [[Sauron]].`,
  },
  {
    path: 'Scenes/Conseil.md',
    content: `---\ntype: scene\nchapitre: 1\nordre: 1\ntome: 2\npov: Gandalf\n---\nRéunion à Fondcombe.`,
  },
];

const notes = parseVault(VAULT);
const { data, report } = mapToCanonical(notes);

describe('classifyNarrative', () => {
  it('reconnaît scène et chapitre (fr/en, type ou dossier)', () => {
    expect(classifyNarrative({ frontmatter: { type: 'scène' } })).toBe('scene');
    expect(classifyNarrative({ frontmatter: { type: 'chapter' } })).toBe('chapter');
    expect(classifyNarrative({ folder: 'Scenes' })).toBe('scene');
    expect(classifyNarrative({ frontmatter: { type: 'personnage' } })).toBeNull();
  });
});

describe('mapSceneField', () => {
  it('mappe les synonymes de champs scène', () => {
    expect(mapSceneField('chapitre')).toBe('chapter');
    expect(mapSceneField('ordre')).toBe('sceneOrder');
    expect(mapSceneField('point de vue')).toBe('pov');
    expect(mapSceneField('tome')).toBe('volume');
    expect(mapSceneField('fils')).toBe('threads');
    expect(mapSceneField('inconnu_zzz')).toBeNull();
  });
});

describe('mapToCanonical — notes narratives', () => {
  it('ne classe PAS les scènes/chapitres comme entités lore', () => {
    expect(data.loreDB.characters.map(c => c.name).sort()).toEqual(['Frodon', 'Gandalf']);
    expect(data.loreDB.locations.map(l => l.name)).toEqual(['Comte']);
    expect(data.customEntitiesDB).toHaveLength(0);
  });

  it('produit un événement timeline par note scène', () => {
    expect(data.timelineDB).toHaveLength(2);
    const depart = data.timelineDB.find(e => e.title === 'Le depart du Comte');
    expect(depart.chapter).toBe(1);
    expect(depart.description).toContain('quitte la Comté');
  });

  it('produit un chapitre STC par note chapitre', () => {
    expect(data.chaptersDB).toHaveLength(1);
    expect(data.chaptersDB[0]).toMatchObject({ number: 1, title: 'Une fete attendue', beats: ['opening_image'] });
  });

  it('renseigne le titre de chapitre de la scène depuis la note chapitre', () => {
    const depart = data.timelineDB.find(e => e.title === 'Le depart du Comte');
    expect(depart.chapterTitle).toBe('Une fete attendue');
  });

  it('event_entities = union frontmatter + wikilinks du corps', () => {
    const depart = data.timelineDB.find(e => e.title === 'Le depart du Comte');
    const ids = depart.entities.map(e => e.id).sort();
    // Frodon (perso), Anneau (objet) via frontmatter ; Gandalf (perso) via wikilink corps ; Comte (lieu) via pov/lieu.
    expect(ids).toContain('char_frodon');
    expect(ids).toContain('obj_anneau_unique');
    expect(ids).toContain('char_gandalf');
    expect(ids).toContain('loc_comte');
  });

  it('résout pov → povCharacterId et lieu → locationId', () => {
    const depart = data.timelineDB.find(e => e.title === 'Le depart du Comte');
    expect(depart.locationId).toBe('loc_comte');
    expect(data.eventExtrasDB[depart.id].povCharacterId).toBe('char_frodon');
  });

  it('remplit eventExtrasDB (beat/threads/goal/conflict/outcome/sceneOrder)', () => {
    const depart = data.timelineDB.find(e => e.title === 'Le depart du Comte');
    const ex = data.eventExtrasDB[depart.id];
    expect(ex).toMatchObject({
      beatId: 'catalyst',
      threadIds: ["Quete de l'Anneau"],
      sceneGoal: 'Sauver la Comté',
      sceneConflict: 'Les Nazgul le traquent',
      sceneOutcome: "Il s'echappe de justesse",
      sceneOrder: 2,
    });
  });

  it('crée les tomes rencontrés et les référence', () => {
    expect(data.volumesDB.map(v => v.id).sort()).toEqual(['vol_1', 'vol_2']);
    expect(data.volumesDB.find(v => v.id === 'vol_1')).toMatchObject({ number: 1, title: 'Tome 1' });
    const conseil = data.timelineDB.find(e => e.title === 'Conseil');
    expect(conseil.volumeId).toBe('vol_2');
  });

  it('trie la timeline par tome puis chapitre puis ordre de scène', () => {
    // vol_1 (ordre 2) avant vol_2 (ordre 1) car tri par numéro de tome d'abord.
    expect(data.timelineDB.map(e => e.title)).toEqual(['Le depart du Comte', 'Conseil']);
  });

  it('signale les wikilinks cassés des scènes', () => {
    expect(report.brokenLinks.map(l => l.target)).toContain('Sauron');
  });

  it('compte scènes/chapitres/tomes dans le rapport', () => {
    expect(report.counts).toMatchObject({ scenes: 2, chapters: 1, volumes: 2 });
  });
});
