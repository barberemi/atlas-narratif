import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('requireProjectOwner', () => {
  it('exports requireProjectOwner as an async function', async () => {
    const mod = await import('./requireProjectOwner.js');
    assert.equal(typeof mod.requireProjectOwner, 'function');
    assert.equal(mod.requireProjectOwner.length, 2);
  });
});
