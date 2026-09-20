import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';
process.env.LLM_RATE_LIMIT_PER_MIN = process.env.LLM_RATE_LIMIT_PER_MIN || '20';

const { checkRateLimit, rankByVectors } = await import('./ask.js');

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
