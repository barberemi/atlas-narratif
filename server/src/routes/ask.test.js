import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';
process.env.LLM_RATE_LIMIT_PER_MIN = process.env.LLM_RATE_LIMIT_PER_MIN || '20';

const { checkRateLimit, rankByVectors, dominantScope, mergeUnique, keywords, keywordRank, chapterNumber, SCOPE_TYPES } = await import('./ask.js');

describe('rankByVectors (retrieval sémantique)', () => {
  const passages = [
    { id: 'a', name: 'A' },
    { id: 'b', name: 'B' },
    { id: 'c', name: 'C' },
  ];
  const vecById = new Map([
    ['a', [1, 0, 0]],   // orthogonal à la requête
    ['b', [0, 1, 0]],   // aligné avec la requête
    ['c', [0, 0.9, 0.1]], // proche de la requête
  ]);
  const queryVec = [0, 1, 0];

  it('classe par similarité cosinus décroissante et tronque à topK', () => {
    const ranked = rankByVectors(passages, queryVec, vecById, 2);
    assert.deepEqual(ranked.map(p => p.id), ['b', 'c']);
  });

  it('ignore les passages sans vecteur', () => {
    const partial = new Map([['b', [0, 1, 0]]]);
    const ranked = rankByVectors(passages, queryVec, partial, 5);
    assert.deepEqual(ranked.map(p => p.id), ['b']);
  });
});

describe('dominantScope (indice de portée d\'après les résultats)', () => {
  it('remonte le type majoritaire (≥ 2 passages) — indépendant de la langue', () => {
    const ranked = [
      { id: 'e1', type: 'event' }, { id: 'e2', type: 'event' }, { id: 'c1', type: 'character' },
    ];
    assert.equal(dominantScope(ranked), 'events');
  });

  it('mappe les types « intrigue » vers la portée plot', () => {
    assert.equal(dominantScope([{ type: 'plant' }, { type: 'thread' }]), 'plot');
  });

  it('retourne null sans majorité nette (< 2 d\'un même type)', () => {
    assert.equal(dominantScope([{ type: 'character' }, { type: 'location' }]), null);
    assert.equal(dominantScope([]), null);
    assert.equal(dominantScope(undefined), null);
  });

  it('SCOPE_TYPES couvre toutes les portées non-"all"', () => {
    assert.deepEqual(
      Object.keys(SCOPE_TYPES).sort(),
      ['characters', 'custom', 'events', 'incoherences', 'locations', 'notes', 'objects', 'plot'],
    );
    assert.deepEqual(SCOPE_TYPES.plot, ['beat', 'plant', 'thread', 'hero']);
  });
});

describe('keywords (mots vides)', () => {
  it('filtre les mots vides → ne garde que le terme rare', () => {
    assert.deepEqual(keywords("Qu'est-ce que le Palantir ?"), ['palantir']);
    assert.deepEqual(keywords('Qui est Boromir ?'), ['boromir']);
  });
});

describe('chapterNumber', () => {
  it('extrait le numéro de chapitre', () => {
    assert.equal(chapterNumber('que se passe-t-il au chapitre 7 ?'), 7);
    assert.equal(chapterNumber('ch 12'), 12);
    assert.equal(chapterNumber('parle-moi de Frodon'), null);
  });
});

describe('keywordRank (lexical amélioré)', () => {
  it('privilégie la correspondance de NOM (objet Palantír avant un perso qui le mentionne)', () => {
    const passages = [
      { id: 'char_x', type: 'character', name: 'Truc', text: 'il est vrai que le palantir est cité ici' },
      { id: 'obj_palantir', type: 'object', name: 'Le Palantír', text: 'pierre de vision' },
    ];
    const r = keywordRank(passages, "Qu'est-ce que le Palantir ?", 5);
    assert.equal(r[0].id, 'obj_palantir');
  });

  it('les mots vides seuls ne remontent aucun passage', () => {
    const passages = [{ id: 'a', type: 'character', name: 'A', text: 'ceci est une phrase avec que et pour' }];
    // "raconte une histoire" → keywords ['raconte','histoire'] absents du passage
    assert.equal(keywordRank(passages, 'est-ce que pour les', 5).length, 0);
  });

  it('booste le bon chapitre (7 ≠ 17)', () => {
    const passages = [
      { id: 'e17', type: 'event', name: 'Évt', text: 'Chapitre 17 : bataille' },
      { id: 'e7', type: 'event', name: 'Évt', text: 'Chapitre 7 : la Moria' },
    ];
    const r = keywordRank(passages, 'que se passe-t-il au chapitre 7', 5);
    assert.equal(r[0].id, 'e7');
  });
});

describe('mergeUnique (retrieval hybride)', () => {
  it('place le lexical en tête, complète par le sémantique, sans doublon', () => {
    const lex = [{ id: 'cor_gondor' }];
    const sem = [{ id: 'cor_helm' }, { id: 'cor_gondor' }, { id: 'anneau' }];
    const merged = mergeUnique([lex, sem], 8);
    assert.deepEqual(merged.map(p => p.id), ['cor_gondor', 'cor_helm', 'anneau']);
  });

  it('tronque au cap', () => {
    const a = [{ id: '1' }, { id: '2' }, { id: '3' }];
    assert.equal(mergeUnique([a], 2).length, 2);
  });

  it('ignore les entrées nulles', () => {
    assert.deepEqual(mergeUnique([[null, { id: 'x' }]], 5).map(p => p.id), ['x']);
  });
});

describe('checkRateLimit', () => {
  it('autorise jusqu\'au quota puis bloque, sur la même fenêtre', () => {
    const pid = 'proj_rl_a';
    const now = 1_000_000;
    for (let i = 0; i < 20; i++) assert.equal(checkRateLimit(pid, now), true, `hit ${i}`);
    assert.equal(checkRateLimit(pid, now), false, 'le 21e est bloqué');
  });

  it('réautorise après la fenêtre d\'une minute', () => {
    const pid = 'proj_rl_b';
    const now = 2_000_000;
    for (let i = 0; i < 20; i++) checkRateLimit(pid, now);
    assert.equal(checkRateLimit(pid, now), false);
    assert.equal(checkRateLimit(pid, now + 61_000), true, 'fenêtre suivante');
  });

  it('isole les projets', () => {
    const now = 3_000_000;
    for (let i = 0; i < 20; i++) checkRateLimit('proj_rl_c', now);
    assert.equal(checkRateLimit('proj_rl_c', now), false);
    assert.equal(checkRateLimit('proj_rl_d', now), true, 'autre projet non impacté');
  });
});
