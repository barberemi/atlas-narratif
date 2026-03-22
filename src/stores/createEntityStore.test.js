import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createEntityStore } from './createEntityStore';

// Crée un store frais par test — pas de mock module, tout est injecté via les callbacks
function makeStore(fetchResult = {}) {
  const fetchFn  = vi.fn().mockResolvedValue(fetchResult);
  const insertFn = vi.fn().mockResolvedValue('new_id');
  const updateFn = vi.fn().mockResolvedValue();
  const deleteFn = vi.fn().mockResolvedValue();

  const useStore = createEntityStore({
    initialState: { items: null },
    fetchFn,
    insertFn,
    updateFn,
    deleteFn,
  });

  return { useStore, fetchFn, insertFn, updateFn, deleteFn };
}

const DB         = { __mock: 'db' };
const PROJECT_ID = 'proj_test';

// ── État initial ──────────────────────────────────────────────────────────────

describe('état initial', () => {
  it('expose les champs par défaut', () => {
    const { useStore } = makeStore();
    const s = useStore.getState();
    expect(s.items).toBeNull();
    expect(s.saving).toBe(false);
    expect(s._db).toBeNull();
    expect(s._projectId).toBeNull();
  });
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  it('stocke _db et _projectId', async () => {
    const { useStore } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    expect(useStore.getState()._db).toBe(DB);
    expect(useStore.getState()._projectId).toBe(PROJECT_ID);
  });

  it('appelle fetchFn avec db et projectId', async () => {
    const { useStore, fetchFn } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    expect(fetchFn).toHaveBeenCalledWith(DB, PROJECT_ID);
  });

  it('merge le résultat de fetchFn dans le state', async () => {
    const { useStore } = makeStore({ items: ['a', 'b'] });
    await useStore.getState().load(DB, PROJECT_ID);
    expect(useStore.getState().items).toEqual(['a', 'b']);
  });
});

// ── save() — insert ───────────────────────────────────────────────────────────

describe('save() sans id → insert', () => {
  it('appelle insertFn', async () => {
    const { useStore, insertFn } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().save(null, { name: 'Alice' });
    expect(insertFn).toHaveBeenCalledWith(DB, { name: 'Alice' }, PROJECT_ID);
  });

  it('recharge les données après insertion', async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce({ items: [] })          // load initial
      .mockResolvedValueOnce({ items: ['Alice'] });   // reload après insert
    const useStore = createEntityStore({
      initialState: { items: null },
      fetchFn,
      insertFn: vi.fn(),
      updateFn: vi.fn(),
      deleteFn: vi.fn(),
    });
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().save(null, { name: 'Alice' });
    expect(useStore.getState().items).toEqual(['Alice']);
  });

  it('ne fait rien si _db est null', async () => {
    const { useStore, insertFn } = makeStore();
    await useStore.getState().save(null, { name: 'Alice' });
    expect(insertFn).not.toHaveBeenCalled();
  });
});

// ── save() — update ───────────────────────────────────────────────────────────

describe('save() avec id → update', () => {
  it('appelle updateFn', async () => {
    const { useStore, updateFn } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().save('char_1', { name: 'Alice' });
    expect(updateFn).toHaveBeenCalledWith(DB, 'char_1', { name: 'Alice' }, PROJECT_ID);
  });

  it("n'appelle pas insertFn lors d'un update", async () => {
    const { useStore, insertFn } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().save('char_1', { name: 'Alice' });
    expect(insertFn).not.toHaveBeenCalled();
  });
});

// ── save() — flag saving ──────────────────────────────────────────────────────

describe('save() — flag saving', () => {
  it('passe saving à true pendant l\'opération, false après', async () => {
    const savingValues = [];
    const insertFn = vi.fn().mockImplementation(async () => {
      savingValues.push(true); // capturé pendant l'exécution async
    });
    const fetchFn = vi.fn().mockResolvedValue({});
    const useStore = createEntityStore({
      initialState: { items: null },
      fetchFn,
      insertFn,
      updateFn: vi.fn(),
      deleteFn: vi.fn(),
    });
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().save(null, {});
    expect(useStore.getState().saving).toBe(false);
    expect(savingValues).toEqual([true]);
  });
});

// ── remove() ─────────────────────────────────────────────────────────────────

describe('remove()', () => {
  it('appelle deleteFn avec id et projectId', async () => {
    const { useStore, deleteFn } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().remove('char_1');
    expect(deleteFn).toHaveBeenCalledWith(DB, 'char_1', PROJECT_ID);
  });

  it('recharge les données après suppression', async () => {
    const fetchFn = vi.fn()
      .mockResolvedValueOnce({ items: ['Alice'] })
      .mockResolvedValueOnce({ items: [] });
    const useStore = createEntityStore({
      initialState: { items: null },
      fetchFn,
      insertFn: vi.fn(),
      updateFn: vi.fn(),
      deleteFn: vi.fn(),
    });
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().remove('char_1');
    expect(useStore.getState().items).toEqual([]);
  });

  it('ne fait rien si _db est null', async () => {
    const { useStore, deleteFn } = makeStore();
    await useStore.getState().remove('char_1');
    expect(deleteFn).not.toHaveBeenCalled();
  });

  it('passe saving à false après suppression', async () => {
    const { useStore } = makeStore();
    await useStore.getState().load(DB, PROJECT_ID);
    await useStore.getState().remove('char_1');
    expect(useStore.getState().saving).toBe(false);
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('restaure l\'état initial complet', async () => {
    const { useStore } = makeStore({ items: ['Alice'] });
    await useStore.getState().load(DB, PROJECT_ID);
    useStore.getState().reset();
    const s = useStore.getState();
    expect(s.items).toBeNull();
    expect(s.saving).toBe(false);
    expect(s._db).toBeNull();
    expect(s._projectId).toBeNull();
  });
});
