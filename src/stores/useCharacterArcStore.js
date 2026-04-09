import { create } from 'zustand';
import {
  getAllCharacterAxes,
  getAllProjectAxisLabels,
  getAllCharacterArcPoints,
  insertCharacterAxis,
  deleteCharacterAxis,
  upsertCharacterArcPoint,
} from '../api/client';
import { useVolumeStore } from './useVolumeStore';

export const useCharacterArcStore = create((set, get) => ({
  axes:        {},
  points:      {},
  axisLabels:  [],
  _projectId:  null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const [allAxes, allPoints, axisLabels] = await Promise.all([
      getAllCharacterAxes(projectId),
      getAllCharacterArcPoints(projectId),
      getAllProjectAxisLabels(projectId),
    ]);

    const axes = {};
    for (const ax of allAxes) {
      if (!axes[ax.characterId]) axes[ax.characterId] = [];
      axes[ax.characterId].push(ax);
    }

    const points = {};
    for (const pt of allPoints) {
      if (!points[pt.axisId]) points[pt.axisId] = [];
      points[pt.axisId].push({ chapterNum: pt.chapterNum, value: pt.value, note: pt.note, volumeId: pt.volumeId });
    }

    set({ axes, points, axisLabels });
  },

  addAxis: async (characterId, label, color) => {
    const { _projectId, axes, axisLabels } = get();
    if (!_projectId) return null;
    const id = await insertCharacterAxis({ characterId, label, color }, _projectId);
    const newAxis = { id, characterId, label, color: color ?? '#64748b' };
    const charAxes = [...(axes[characterId] ?? []), newAxis];
    const newLabels = axisLabels.includes(label) ? axisLabels : [...axisLabels, label].sort();
    set({ axes: { ...axes, [characterId]: charAxes }, axisLabels: newLabels });
    return id;
  },

  removeAxis: async (axisId, characterId) => {
    const { _projectId, axes, points } = get();
    if (!_projectId) return;
    await deleteCharacterAxis(axisId, _projectId);
    const charAxes = (axes[characterId] ?? []).filter(a => a.id !== axisId);
    const newPoints = { ...points };
    delete newPoints[axisId];
    set({ axes: { ...axes, [characterId]: charAxes }, points: newPoints });
  },

  setPoint: async (axisId, chapterNum, value, note) => {
    const { _projectId, points } = get();
    if (!_projectId) return;
    const volumeId = useVolumeStore.getState().activeVolumeId ?? null;
    await upsertCharacterArcPoint(_projectId, axisId, chapterNum, value, note, volumeId);
    const axisPoints = (points[axisId] ?? []).filter(p => p.chapterNum !== chapterNum);
    axisPoints.push({ chapterNum, value, note: note ?? null, volumeId });
    axisPoints.sort((a, b) => a.chapterNum - b.chapterNum);
    set({ points: { ...points, [axisId]: axisPoints } });
  },

  reset: () => set({ axes: {}, points: {}, axisLabels: [], _projectId: null }),
}));
