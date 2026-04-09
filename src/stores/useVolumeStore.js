import { create } from 'zustand';
import { getVolumes, insertVolume, updateVolume, deleteVolume } from '../api/client';

/**
 * Store gérant les volumes (tomes) d'une série.
 *
 * activeVolumeId = null  → vue "toute la série" (pas de filtre par tome)
 * activeVolumeId = <id>  → filtrage par tome dans toutes les vues
 */
export const useVolumeStore = create((set, get) => ({
  volumes:        null,
  activeVolumeId: null,
  _projectId:     null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const volumes = await getVolumes(projectId);
    set({ volumes });
  },

  setActiveVolume: (id) => set({ activeVolumeId: id }),

  addVolume: async (data) => {
    const { _projectId, volumes } = get();
    if (!_projectId) return null;
    const id = await insertVolume(data, _projectId);
    const newVolume = {
      id,
      number:      data.number,
      title:       data.title,
      description: data.description ?? null,
    };
    set({ volumes: [...(volumes ?? []), newVolume].sort((a, b) => a.number - b.number) });
    return id;
  },

  editVolume: async (volumeId, data) => {
    const { _projectId, volumes } = get();
    if (!_projectId) return;
    await updateVolume(volumeId, data, _projectId);
    set({
      volumes: (volumes ?? [])
        .map(v => v.id === volumeId ? { ...v, ...data } : v)
        .sort((a, b) => a.number - b.number),
    });
  },

  removeVolume: async (volumeId) => {
    const { _projectId, volumes, activeVolumeId } = get();
    if (!_projectId) return;
    await deleteVolume(volumeId, _projectId);
    const next = (volumes ?? []).filter(v => v.id !== volumeId);
    set({
      volumes: next,
      activeVolumeId: activeVolumeId === volumeId ? null : activeVolumeId,
    });
  },

  reset: () => set({ volumes: null, activeVolumeId: null, _projectId: null }),
}));
