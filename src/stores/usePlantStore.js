import { create } from 'zustand';
import { getPlants, insertPlant, updatePlant, deletePlant } from '../api/client';

export const usePlantStore = create((set, get) => ({
  plants:     null,
  _projectId: null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const plants = await getPlants(projectId);
    set({ plants });
  },

  addPlant: async (data) => {
    const { _projectId, plants } = get();
    if (!_projectId) return null;
    const id = await insertPlant(data, _projectId);
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
    await updatePlant(plantId, data, _projectId);
    set({ plants: (plants ?? []).map(p => p.id === plantId ? { ...p, ...data } : p) });
  },

  removePlant: async (plantId) => {
    const { _projectId, plants } = get();
    if (!_projectId) return;
    await deletePlant(plantId, _projectId);
    set({ plants: (plants ?? []).filter(p => p.id !== plantId) });
  },

  reset: () => set({ plants: null, _projectId: null }),
}));
