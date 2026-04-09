import { create } from 'zustand';
import { getThreads, insertThread, updateThread, deleteThread } from '../api/client';

export const useThreadStore = create((set, get) => ({
  threads:    null,
  _projectId: null,

  load: async (projectId) => {
    set({ _projectId: projectId });
    const threads = await getThreads(projectId);
    set({ threads });
  },

  addThread: async (data) => {
    const { _projectId, threads } = get();
    if (!_projectId) return null;
    const id = await insertThread(data, _projectId);
    const newThread = { id, color: '#3F51B5', role: 'subplot', description: null, sortOrder: 0, ...data };
    set({ threads: [...(threads ?? []), newThread] });
    return id;
  },

  editThread: async (threadId, data) => {
    const { _projectId, threads } = get();
    if (!_projectId) return;
    await updateThread(threadId, data, _projectId);
    set({ threads: (threads ?? []).map(t => t.id === threadId ? { ...t, ...data } : t) });
  },

  removeThread: async (threadId) => {
    const { _projectId, threads } = get();
    if (!_projectId) return;
    await deleteThread(threadId, _projectId);
    set({ threads: (threads ?? []).filter(t => t.id !== threadId) });
  },

  reset: () => set({ threads: null, _projectId: null }),
}));
