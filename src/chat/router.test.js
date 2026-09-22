import { describe, it, expect } from 'vitest';
import { answerQuery, resolveEntity } from './router';

const DATA = {
  characters: [
    { id: 'char_frodo', name: 'Frodo', aliases: ['Le Porteur'], description: 'Hobbit porteur de l\'Anneau.' },
    { id: 'char_aragorn', name: 'Aragorn', aliases: ['Grands-Pas'], description: 'Rôdeur du Nord.' },
  ],
  locations: [
    { id: 'loc_moria', name: 'La Moria' },
    { id: 'loc_rivendell', name: 'Fondcombe' },
  ],
  objects: [
    { id: 'obj_anneau', name: 'Anneau Unique', currentHolder: 'Frodo' },
    { id: 'obj_sting', name: 'Dard', currentHolder: 'Frodo' },
  ],
  customEntities: [{ id: 'cent_quenya', name: 'Quenya', aliases: ['haut-elfique'], description: 'Langue elfique.' }],
  events: [
    { id: 'e1', title: 'Départ de Fondcombe', chapter: 5, locationId: 'loc_rivendell', entities: [{ id: 'char_frodo' }] },
    { id: 'e2', title: 'La chute dans la Moria', chapter: 7, locationId: 'loc_moria', entities: [{ id: 'char_frodo' }, { id: 'char_aragorn' }] },
  ],
};

describe('resolveEntity', () => {
  it('résout par nom exact', () => {
    expect(resolveEntity('Aragorn', DATA).entity.id).toBe('char_aragorn');
  });
  it('résout par alias', () => {
    expect(resolveEntity('Grands-Pas', DATA).entity.id).toBe('char_aragorn');
    expect(resolveEntity('le porteur', DATA).entity.id).toBe('char_frodo');
  });
  it('résout une entité custom', () => {
    expect(resolveEntity('haut-elfique', DATA).type).toBe('custom');
  });
  it('retourne null si introuvable', () => {
    expect(resolveEntity('Sauron', DATA)).toBeNull();
  });
});

describe('answerQuery — intents', () => {
  it('qui est X → description + alias, nom en wikilink cliquable', () => {
    const r = answerQuery('qui est Aragorn', DATA);
    expect(r.intent).toBe('who');
    expect(r.answer).toContain('Rôdeur du Nord');
    expect(r.answer).toContain('Grands-Pas');
    expect(r.answer).toContain('[[Aragorn]]'); // rendu cliquable par AnswerText
  });

  it('où est X → dernier lieu localisé, entités en wikilinks', () => {
    const r = answerQuery('où est Frodo', DATA);
    expect(r.intent).toBe('where');
    expect(r.answer).toContain('[[La Moria]]');
    expect(r.answer).toContain('[[Frodo]]');
    expect(r.answer).toContain('chapitre 7');
  });

  it('quels objets porte X → objets détenus en wikilinks', () => {
    const r = answerQuery('quels objets porte Frodo', DATA);
    expect(r.intent).toBe('objects');
    expect(r.answer).toContain('[[Anneau Unique]]');
    expect(r.answer).toContain('[[Dard]]');
  });

  it('chapitre N → événements du chapitre', () => {
    const r = answerQuery('que se passe-t-il au chapitre 7', DATA);
    expect(r.intent).toBe('chapter');
    expect(r.answer).toContain('La chute dans la Moria');
    expect(r.matches).toHaveLength(1);
  });

  it('résout via alias dans une question', () => {
    const r = answerQuery('où est Le Porteur', DATA);
    expect(r.intent).toBe('where');
    expect(r.answer).toContain('Frodo');
  });

  it('entité inconnue → message clair', () => {
    const r = answerQuery('qui est Sauron', DATA);
    expect(r.intent).toBe('who');
    expect(r.answer).toContain('trouve pas');
  });

  it('question vide → invite', () => {
    expect(answerQuery('', DATA).intent).toBe('empty');
  });

  it('question hors périmètre → fallback explicite', () => {
    const r = answerQuery('quelle est la météo demain', DATA);
    expect(['unknown', 'lookup']).toContain(r.intent);
  });
});

describe('answerQuery — portées (scope)', () => {
  it('resolveEntity restreint aux types de la portée', () => {
    expect(resolveEntity('Aragorn', DATA, 'locations')).toBeNull();   // perso hors portée lieux
    expect(resolveEntity('La Moria', DATA, 'characters')).toBeNull(); // lieu hors portée persos
    expect(resolveEntity('Aragorn', DATA, 'characters').entity.id).toBe('char_aragorn');
  });

  it('portée non résolvable en local (plot/notes/incoherences) → deepOnly', () => {
    expect(answerQuery('les amorces', DATA, 'plot').intent).toBe('deepOnly');
    expect(answerQuery('mes notes', DATA, 'notes').intent).toBe('deepOnly');
    expect(answerQuery('des contradictions ?', DATA, 'incoherences').intent).toBe('deepOnly');
  });

  it('intent chapitre gaté par la portée', () => {
    expect(answerQuery('chapitre 7', DATA, 'events').intent).toBe('chapter'); // compatible
    expect(answerQuery('chapitre 7', DATA, 'objects').intent).not.toBe('chapter'); // hors portée
  });

  it('« qui est X » restreint à la portée personnages', () => {
    expect(answerQuery('qui est Aragorn', DATA, 'characters').intent).toBe('who');
    // même question mais portée lieux → l'entité perso n'est pas résolue
    expect(answerQuery('qui est Aragorn', DATA, 'locations').answer).toContain('trouve pas');
  });
});
