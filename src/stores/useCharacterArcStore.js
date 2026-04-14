import { create } from 'zustand';
import {
  getAllCharacterArcs,
  insertCharacterAxis,
  deleteCharacterAxis,
  upsertCharacterArcPoint,
} from '../api/client';
import { useVolumeStore } from './useVolumeStore';
import { useSaveIndicator } from './useSaveIndicator';

export const useCharacterArcStore = create((set, get) => ({
  axes:        {},
  points:      {},
  axisLabels:  [],
  _projectId:  null,
  _loading:    false,

  load: async (projectId) => {
    const { _projectId, _loading } = get();
    if (_loading || (_projectId === projectId && Object.keys(get().axes).length > 0)) return;
    set({ _projectId: projectId, _loading: true });
    let allAxes, allPoints, axisLabels;
    try {
      ({ axes: allAxes, points: allPoints, labels: axisLabels } = await getAllCharacterArcs(projectId));
    } catch (e) { set({ _loading: false }); throw e; }

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

    set({ axes, points, axisLabels, _loading: false });
  },

  addAxis: async (characterId, label, color) => {
    const { _projectId, axes, axisLabels } = get();
    if (!_projectId) return null;
    useSaveIndicator.getState().markSaving();
    const id = await insertCharacterAxis({ characterId, label, color }, _projectId);
    useSaveIndicator.getState().markSaved();
    const newAxis = { id, characterId, label, color: color ?? '#64748b' };
    const charAxes = [...(axes[characterId] ?? []), newAxis];
    const newLabels = axisLabels.includes(label) ? axisLabels : [...axisLabels, label].sort();
    set({ axes: { ...axes, [characterId]: charAxes }, axisLabels: newLabels });
    return id;
  },

  removeAxis: async (axisId, characterId) => {
    const { _projectId, axes, points } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    const snapshot = await deleteCharacterAxis(axisId, _projectId);
    useSaveIndicator.getState().markSaved();
    const charAxes = (axes[characterId] ?? []).filter(a => a.id !== axisId);
    const newPoints = { ...points };
    delete newPoints[axisId];
    set({ axes: { ...axes, [characterId]: charAxes }, points: newPoints });
    return snapshot;
  },

  setPoint: async (axisId, chapterNum, value, note) => {
    const { _projectId, points } = get();
    if (!_projectId) return;
    const volumeId = useVolumeStore.getState().activeVolumeId ?? null;
    useSaveIndicator.getState().markSaving();
    await upsertCharacterArcPoint(_projectId, axisId, chapterNum, value, note, volumeId);
    useSaveIndicator.getState().markSaved();
    const axisPoints = (points[axisId] ?? []).filter(p => p.chapterNum !== chapterNum);
    axisPoints.push({ chapterNum, value, note: note ?? null, volumeId });
    axisPoints.sort((a, b) => a.chapterNum - b.chapterNum);
    set({ points: { ...points, [axisId]: axisPoints } });
  },

  reset: () => set({ axes: {}, points: {}, axisLabels: [], _projectId: null, _loading: false }),
}));
