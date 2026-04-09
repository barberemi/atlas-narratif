import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getArcPoints:   vi.fn(),
  upsertArcPoint: vi.fn(),
}));

import { useArcStore } from './useArcStore';
import { getArcPoints, upsertArcPoint } from '../api/client';

const PROJECT_ID = 'proj_test';

beforeEach(() => {
  vi.clearAllMocks();
  useArcStore.getState().reset();
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  it('charge les points depuis la DB', async () => {
    const pts = [{ chapterNumber: 1, intensity: 7, note: null }];
    vi.mocked(getArcPoints).mockResolvedValue(pts);

    await useArcStore.getState().load(PROJECT_ID);

    expect(getArcPoints).toHaveBeenCalledWith(PROJECT_ID);
    expect(useArcStore.getState().points).toEqual(pts);
  });

  it('stocke _projectId', async () => {
    vi.mocked(getArcPoints).mockResolvedValue([]);
    await useArcStore.getState().load(PROJECT_ID);
    expect(useArcStore.getState()._projectId).toBe(PROJECT_ID);
  });
});

// ── setIntensity() ────────────────────────────────────────────────────────────

describe('setIntensity()', () => {
  beforeEach(async () => {
    vi.mocked(getArcPoints).mockResolvedValue([
      { chapterNumber: 1, intensity: 3, note: null },
      { chapterNumber: 2, intensity: 5, note: null },
    ]);
    vi.mocked(upsertArcPoint).mockResolvedValue();
    await useArcStore.getState().load(PROJECT_ID);
  });

  it('met à jour un point existant (optimiste)', async () => {
    await useArcStore.getState().setIntensity(1, 8);
    const pts = useArcStore.getState().points;
    expect(pts.find(p => p.chapterNumber === 1)?.intensity).toBe(8);
    expect(pts.find(p => p.chapterNumber === 2)?.intensity).toBe(5);
  });

  it("ajoute un nouveau point si le chapitre n'existe pas encore", async () => {
    await useArcStore.getState().setIntensity(5, 6);
    const pts = useArcStore.getState().points;
    expect(pts).toHaveLength(3);
    expect(pts.find(p => p.chapterNumber === 5)).toMatchObject({ chapterNumber: 5, intensity: 6 });
  });

  it('persiste en DB via upsertArcPoint', async () => {
    await useArcStore.getState().setIntensity(1, 9);
    expect(upsertArcPoint).toHaveBeenCalledWith(PROJECT_ID, 1, 9);
  });

  it('ne fait rien si _projectId est null', async () => {
    useArcStore.getState().reset();
    await useArcStore.getState().setIntensity(1, 7);
    expect(upsertArcPoint).not.toHaveBeenCalled();
  });

  it("ne modifie pas les autres points lors d'un update", async () => {
    const before = useArcStore.getState().points.find(p => p.chapterNumber === 2);
    await useArcStore.getState().setIntensity(1, 10);
    const after = useArcStore.getState().points.find(p => p.chapterNumber === 2);
    expect(after).toEqual(before);
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('remet points et _projectId à null', async () => {
    vi.mocked(getArcPoints).mockResolvedValue([{ chapterNumber: 1, intensity: 5 }]);
    await useArcStore.getState().load(PROJECT_ID);
    useArcStore.getState().reset();
    const s = useArcStore.getState();
    expect(s.points).toBeNull();
    expect(s._projectId).toBeNull();
  });
});
