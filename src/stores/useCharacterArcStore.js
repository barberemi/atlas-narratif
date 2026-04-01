import { create } from 'zustand';
import {
  getCharacterAxes,
  getAllCharacterAxes,
  getAllProjectAxisLabels,
  insertCharacterAxis,
  deleteCharacterAxis,
  upsertCharacterArcPoint,
  getCharacterArcPoints,
  getAllCharacterArcPoints,
} from '../db/queries';
import { useVolumeStore } from './useVolumeStore';

export const useCharacterArcStore = create((set, get) => ({
  /** axes[characterId] = [{ id, characterId, label, color }] */
  axes:        {},
  /** points[axisId] = [{ chapterNum, value, note }] */
  points:      {},
  /** labels déjà utilisés dans le projet (pour autocomplétion) */
  axisLabels:  [],
  _db:         null,
  _projectId:  null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const [allAxes, allPoints, axisLabels] = await Promise.all([
      getAllCharacterAxes(db, projectId),
      getAllCharacterArcPoints(db, projectId),
      getAllProjectAxisLabels(db, projectId),
    ]);

    // Index par characterId
    const axes = {};
    for (const ax of allAxes) {
      if (!axes[ax.characterId]) axes[ax.characterId] = [];
      axes[ax.characterId].push(ax);
    }

    // Index par axisId
    const points = {};
    for (const pt of allPoints) {
      if (!points[pt.axisId]) points[pt.axisId] = [];
      points[pt.axisId].push({ chapterNum: pt.chapterNum, value: pt.value, note: pt.note, volumeId: pt.volumeId });
    }

    set({ axes, points, axisLabels });
  },

  addAxis: async (characterId, label, color) => {
    const { _db, _projectId, axes, axisLabels } = get();
    if (!_db || !_projectId) return null;
    const id = await insertCharacterAxis(_db, { characterId, label, color }, _projectId);
    const newAxis = { id, characterId, label, color: color ?? '#64748b' };
    const charAxes = [...(axes[characterId] ?? []), newAxis];
    const newLabels = axisLabels.includes(label) ? axisLabels : [...axisLabels, label].sort();
    set({
      axes:       { ...axes, [characterId]: charAxes },
      axisLabels: newLabels,
    });
    return id;
  },

  removeAxis: async (axisId, characterId) => {
    const { _db, _projectId, axes, points } = get();
    if (!_db || !_projectId) return;
    await deleteCharacterAxis(_db, axisId, _projectId);
    const charAxes = (axes[characterId] ?? []).filter(a => a.id !== axisId);
    const newPoints = { ...points };
    delete newPoints[axisId];
    set({
      axes:   { ...axes, [characterId]: charAxes },
      points: newPoints,
    });
  },

  setPoint: async (axisId, chapterNum, value, note) => {
    const { _db, _projectId, points } = get();
    if (!_db || !_projectId) return;
    const volumeId = useVolumeStore.getState().activeVolumeId ?? null;
    await upsertCharacterArcPoint(_db, _projectId, axisId, chapterNum, value, note, volumeId);
    const axisPoints = (points[axisId] ?? []).filter(p => p.chapterNum !== chapterNum);
    axisPoints.push({ chapterNum, value, note: note ?? null, volumeId });
    axisPoints.sort((a, b) => a.chapterNum - b.chapterNum);
    set({ points: { ...points, [axisId]: axisPoints } });
  },

  reset: () => set({ axes: {}, points: {}, axisLabels: [], _db: null, _projectId: null }),
}));
