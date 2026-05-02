import { create } from 'zustand';
import { getPlants, insertPlant, updatePlant, deletePlant } from '../api/client';
import { useSaveIndicator } from './useSaveIndicator';

export const usePlantStore = create((set, get) => ({
  plants:     null,
  _projectId: null,
  _loading:   false,

  load: async (projectId) => {
    const { _projectId, _loading, plants } = get();
    if (_loading || (_projectId === projectId && plants !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const result = await getPlants(projectId);
      set({ plants: result, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  addPlant: async (data) => {
    const { _projectId, plants } = get();
    if (!_projectId) return null;
    useSaveIndicator.getState().markSaving();
    const id = await insertPlant(data, _projectId);
    useSaveIndicator.getState().markSaved();
    const newPlant = {
      id,
      label:            data.label,
      type:             data.type             ?? 'information',
      plantChapterNum:  data.plantChapterNum  ?? null,
      plantEventId:     data.plantEventId     ?? null,
      plantVolumeId:    data.plantVolumeId    ?? null,
      payoffChapterNum: data.payoffChapterNum ?? null,
      payoffEventId:    data.payoffEventId    ?? null,
      payoffVolumeId:   data.payoffVolumeId   ?? null,
      entityId:         data.entityId         ?? null,
      entityType:       data.entityType       ?? null,
      status:           data.status           ?? 'open',
      notes:            data.notes            ?? null,
    };
    set({ plants: [...(plants ?? []), newPlant] });
    return id;
  },

  editPlant: async (plantId, data) => {
    const { _projectId, plants } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    await updatePlant(plantId, data, _projectId);
    useSaveIndicator.getState().markSaved();
    set({ plants: (plants ?? []).map(p => p.id === plantId ? { ...p, ...data } : p) });
  },

  removePlant: async (plantId) => {
    const { _projectId, plants } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    const snapshot = await deletePlant(plantId, _projectId);
    useSaveIndicator.getState().markSaved();
    set({ plants: (plants ?? []).filter(p => p.id !== plantId) });
    return snapshot;
  },

  reset: () => set({ plants: null, _projectId: null, _loading: false }),
}));
