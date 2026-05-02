import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getAllCharacterArcs:     vi.fn(),
  insertCharacterAxis:    vi.fn(),
  deleteCharacterAxis:    vi.fn(),
  upsertCharacterArcPoint: vi.fn(),
}));

vi.mock('./useVolumeStore', () => ({
  useVolumeStore: { getState: vi.fn(() => ({ activeVolumeId: null })) },
}));

import { useCharacterArcStore } from './useCharacterArcStore';
import {
  getAllCharacterArcs,
  insertCharacterAxis,
  deleteCharacterAxis,
  upsertCharacterArcPoint,
} from '../api/client';

const PROJECT_ID = 'proj_test';

const RAW_AXES = [
  { id: 'axis_1', characterId: 'char_1', label: 'Courage', color: '#ff0000' },
  { id: 'axis_2', characterId: 'char_1', label: 'Sagesse', color: '#00ff00' },
  { id: 'axis_3', characterId: 'char_2', label: 'Force',   color: '#0000ff' },
];

const RAW_POINTS = [
  { axisId: 'axis_1', chapterNum: 1, value: 5, note: null,    volumeId: null },
  { axisId: 'axis_1', chapterNum: 2, value: 8, note: 'Bravo', volumeId: null },
  { axisId: 'axis_2', chapterNum: 1, value: 3, note: null,    volumeId: null },
];

const AXIS_LABELS = ['Courage', 'Force', 'Sagesse'];

beforeEach(() => {
  vi.clearAllMocks();
  useCharacterArcStore.getState().reset();
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  beforeEach(async () => {
    vi.mocked(getAllCharacterArcs).mockResolvedValue({ axes: RAW_AXES, points: RAW_POINTS, labels: AXIS_LABELS });
    await useCharacterArcStore.getState().load(PROJECT_ID);
  });

  it('stocke _projectId', () => {
    expect(useCharacterArcStore.getState()._projectId).toBe(PROJECT_ID);
  });

  it('groupe les axes par characterId', () => {
    const { axes } = useCharacterArcStore.getState();
    expect(axes['char_1']).toHaveLength(2);
    expect(axes['char_2']).toHaveLength(1);
    expect(axes['char_1'].map(a => a.id)).toEqual(['axis_1', 'axis_2']);
  });

  it('groupe les points par axisId', () => {
    const { points } = useCharacterArcStore.getState();
    expect(points['axis_1']).toHaveLength(2);
    expect(points['axis_2']).toHaveLength(1);
    expect(points['axis_1'][0]).toMatchObject({ chapterNum: 1, value: 5 });
  });

  it('charge les axisLabels', () => {
    expect(useCharacterArcStore.getState().axisLabels).toEqual(AXIS_LABELS);
  });

  it('appelle getAllCharacterArcs une seule fois', () => {
    expect(getAllCharacterArcs).toHaveBeenCalledWith(PROJECT_ID);
    expect(getAllCharacterArcs).toHaveBeenCalledTimes(1);
  });
});

// ── addAxis() ────────────────────────────────────────────────────────────────

describe('addAxis()', () => {
  beforeEach(async () => {
    vi.mocked(getAllCharacterArcs).mockResolvedValue({ axes: [], points: [], labels: ['Courage'] });
    await useCharacterArcStore.getState().load(PROJECT_ID);
  });

  it('insère et retourne le nouvel id', async () => {
    vi.mocked(insertCharacterAxis).mockResolvedValue('axis_new');
    const id = await useCharacterArcStore.getState().addAxis('char_1', 'Endurance', '#aabbcc');
    expect(id).toBe('axis_new');
    expect(insertCharacterAxis).toHaveBeenCalledWith(
      { characterId: 'char_1', label: 'Endurance', color: '#aabbcc' },
      PROJECT_ID,
    );
  });

  it('ajoute le nouvel axe dans axes[characterId]', async () => {
    vi.mocked(insertCharacterAxis).mockResolvedValue('axis_new');
    await useCharacterArcStore.getState().addAxis('char_1', 'Endurance', '#aabbcc');
    expect(useCharacterArcStore.getState().axes['char_1']).toHaveLength(1);
    expect(useCharacterArcStore.getState().axes['char_1'][0].label).toBe('Endurance');
  });

  it("ajoute le label aux axisLabels s'il est nouveau", async () => {
    vi.mocked(insertCharacterAxis).mockResolvedValue('axis_new');
    await useCharacterArcStore.getState().addAxis('char_1', 'Nouveau', '#fff');
    expect(useCharacterArcStore.getState().axisLabels).toContain('Nouveau');
  });

  it("ne duplique pas un label déjà existant dans axisLabels", async () => {
    vi.mocked(insertCharacterAxis).mockResolvedValue('axis_new');
    await useCharacterArcStore.getState().addAxis('char_1', 'Courage', '#fff');
    const count = useCharacterArcStore.getState().axisLabels.filter(l => l === 'Courage').length;
    expect(count).toBe(1);
  });

  it('retourne null si _projectId est null', async () => {
    useCharacterArcStore.getState().reset();
    const id = await useCharacterArcStore.getState().addAxis('char_1', 'X', '#000');
    expect(id).toBeNull();
    expect(insertCharacterAxis).not.toHaveBeenCalled();
  });
});

// ── removeAxis() ─────────────────────────────────────────────────────────────

describe('removeAxis()', () => {
  beforeEach(async () => {
    vi.mocked(getAllCharacterArcs).mockResolvedValue({ axes: RAW_AXES, points: RAW_POINTS, labels: AXIS_LABELS });
    vi.mocked(deleteCharacterAxis).mockResolvedValue();
    await useCharacterArcStore.getState().load(PROJECT_ID);
  });

  it("supprime l'axe de axes[characterId]", async () => {
    await useCharacterArcStore.getState().removeAxis('axis_1', 'char_1');
    expect(useCharacterArcStore.getState().axes['char_1'].find(a => a.id === 'axis_1')).toBeUndefined();
  });

  it('supprime les points associés à cet axe', async () => {
    await useCharacterArcStore.getState().removeAxis('axis_1', 'char_1');
    expect(useCharacterArcStore.getState().points['axis_1']).toBeUndefined();
  });

  it('conserve les axes des autres personnages', async () => {
    await useCharacterArcStore.getState().removeAxis('axis_1', 'char_1');
    expect(useCharacterArcStore.getState().axes['char_2']).toHaveLength(1);
  });

  it('appelle deleteCharacterAxis avec les bons args', async () => {
    await useCharacterArcStore.getState().removeAxis('axis_1', 'char_1');
    expect(deleteCharacterAxis).toHaveBeenCalledWith('axis_1', PROJECT_ID);
  });
});

// ── setPoint() ───────────────────────────────────────────────────────────────

describe('setPoint()', () => {
  beforeEach(async () => {
    vi.mocked(getAllCharacterArcs).mockResolvedValue({ axes: RAW_AXES, points: RAW_POINTS, labels: AXIS_LABELS });
    vi.mocked(upsertCharacterArcPoint).mockResolvedValue();
    await useCharacterArcStore.getState().load(PROJECT_ID);
  });

  it('ajoute un point inexistant', async () => {
    await useCharacterArcStore.getState().setPoint('axis_1', 5, 7, null);
    const pts = useCharacterArcStore.getState().points['axis_1'];
    expect(pts.find(p => p.chapterNum === 5)).toMatchObject({ chapterNum: 5, value: 7 });
  });

  it('remplace un point existant pour le même chapitre', async () => {
    await useCharacterArcStore.getState().setPoint('axis_1', 1, 9, 'Mis à jour');
    const pts = useCharacterArcStore.getState().points['axis_1'];
    const ch1 = pts.filter(p => p.chapterNum === 1);
    expect(ch1).toHaveLength(1);
    expect(ch1[0].value).toBe(9);
  });

  it('trie les points par chapterNum', async () => {
    await useCharacterArcStore.getState().setPoint('axis_1', 0, 1, null);
    const nums = useCharacterArcStore.getState().points['axis_1'].map(p => p.chapterNum);
    expect(nums).toEqual([...nums].sort((a, b) => a - b));
  });

  it('appelle upsertCharacterArcPoint avec les bons args', async () => {
    await useCharacterArcStore.getState().setPoint('axis_1', 3, 6, 'Note');
    expect(upsertCharacterArcPoint).toHaveBeenCalledWith(PROJECT_ID, 'axis_1', 3, 6, 'Note', null);
  });

  it('ne fait rien si _projectId est null', async () => {
    useCharacterArcStore.getState().reset();
    await useCharacterArcStore.getState().setPoint('axis_1', 1, 5, null);
    expect(upsertCharacterArcPoint).not.toHaveBeenCalled();
  });
});

// ── reset() ──────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('restaure l\'état initial', async () => {
    vi.mocked(getAllCharacterArcs).mockResolvedValue({ axes: RAW_AXES, points: RAW_POINTS, labels: AXIS_LABELS });
    await useCharacterArcStore.getState().load(PROJECT_ID);
    useCharacterArcStore.getState().reset();
    const s = useCharacterArcStore.getState();
    expect(s.axes).toEqual({});
    expect(s.points).toEqual({});
    expect(s.axisLabels).toEqual([]);
    expect(s._projectId).toBeNull();
  });
});
