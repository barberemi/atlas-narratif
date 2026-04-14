import { create } from 'zustand';
import { getThreads, insertThread, updateThread, deleteThread } from '../api/client';
import { useSaveIndicator } from './useSaveIndicator';

export const useThreadStore = create((set, get) => ({
  threads:    null,
  _projectId: null,
  _loading:   false,

  load: async (projectId) => {
    const { _projectId, _loading, threads } = get();
    if (_loading || (_projectId === projectId && threads !== null)) return;
    set({ _projectId: projectId, _loading: true });
    try {
      const result = await getThreads(projectId);
      set({ threads: result, _loading: false });
    } catch (e) { set({ _loading: false }); throw e; }
  },

  addThread: async (data) => {
    const { _projectId, threads } = get();
    if (!_projectId) return null;
    useSaveIndicator.getState().markSaving();
    const id = await insertThread(data, _projectId);
    useSaveIndicator.getState().markSaved();
    const newThread = { id, color: '#3F51B5', role: 'subplot', description: null, sortOrder: 0, ...data };
    set({ threads: [...(threads ?? []), newThread] });
    return id;
  },

  editThread: async (threadId, data) => {
    const { _projectId, threads } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    await updateThread(threadId, data, _projectId);
    useSaveIndicator.getState().markSaved();
    set({ threads: (threads ?? []).map(t => t.id === threadId ? { ...t, ...data } : t) });
  },

  removeThread: async (threadId) => {
    const { _projectId, threads } = get();
    if (!_projectId) return;
    useSaveIndicator.getState().markSaving();
    const snapshot = await deleteThread(threadId, _projectId);
    useSaveIndicator.getState().markSaved();
    set({ threads: (threads ?? []).filter(t => t.id !== threadId) });
    return snapshot;
  },

  reset: () => set({ threads: null, _projectId: null, _loading: false }),
}));
