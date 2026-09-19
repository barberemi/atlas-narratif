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
  it('qui est X → description + alias', () => {
    const r = answerQuery('qui est Aragorn', DATA);
    expect(r.intent).toBe('who');
    expect(r.answer).toContain('Rôdeur du Nord');
    expect(r.answer).toContain('Grands-Pas');
  });

  it('où est X → dernier lieu localisé', () => {
    const r = answerQuery('où est Frodo', DATA);
    expect(r.intent).toBe('where');
    expect(r.answer).toContain('La Moria');
    expect(r.answer).toContain('chapitre 7');
  });

  it('quels objets porte X → objets détenus', () => {
    const r = answerQuery('quels objets porte Frodo', DATA);
    expect(r.intent).toBe('objects');
    expect(r.answer).toContain('Anneau Unique');
    expect(r.answer).toContain('Dard');
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
