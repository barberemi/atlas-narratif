import { create } from 'zustand';
import { getVolumes, insertVolume, updateVolume, deleteVolume } from '../api/client';
import { toast } from '../lib/toast';
import i18n from '../i18n';
import { useSaveIndicator } from './useSaveIndicator';

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
  _loading:       false,

  load: async (projectId) => {
    const { _projectId, _loading, volumes } = get();
    if (_loading || (_projectId === projectId && volumes !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const result = await getVolumes(projectId);
      set({ volumes: result, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  setActiveVolume: (id) => set({ activeVolumeId: id }),

  addVolume: async (data) => {
    const { _projectId, volumes } = get();
    if (!_projectId) return null;
    useSaveIndicator.getState().markSaving();
    const id = await insertVolume(data, _projectId);
    useSaveIndicator.getState().markSaved();
    const newVolume = {
      id,
      number:      data.number,
      title:       data.title,
      description: data.description ?? null,
    };
    set({ volumes: [...(volumes ?? []), newVolume].sort((a, b) => a.number - b.number) });
    toast.success(i18n.t('toast.volumeAdded'));
    return id;
  },

  editVolume: async (volumeId, data) => {
    const { _projectId, volumes } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    await updateVolume(volumeId, data, _projectId);
    useSaveIndicator.getState().markSaved();
    set({
      volumes: (volumes ?? [])
        .map(v => v.id === volumeId ? { ...v, ...data } : v)
        .sort((a, b) => a.number - b.number),
    });
  },

  removeVolume: async (volumeId) => {
    const { _projectId, volumes, activeVolumeId } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    const snapshot = await deleteVolume(volumeId, _projectId);
    useSaveIndicator.getState().markSaved();
    const next = (volumes ?? []).filter(v => v.id !== volumeId);
    set({
      volumes: next,
      activeVolumeId: activeVolumeId === volumeId ? null : activeVolumeId,
    });
    return snapshot;
  },

  reset: () => set({ volumes: null, activeVolumeId: null, _projectId: null, _loading: false }),
}));
