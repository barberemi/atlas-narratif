import { create } from 'zustand';
import { getThreads, insertThread, updateThread, deleteThread } from '../db/queries';

export const useThreadStore = create((set, get) => ({
  threads:    null,
  _db:        null,
  _projectId: null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const threads = await getThreads(db, projectId);
    set({ threads });
  },

  addThread: async (data) => {
    const { _db, _projectId, threads } = get();
    if (!_db || !_projectId) return null;
    const id = await insertThread(_db, data, _projectId);
    const newThread = { id, color: '#3F51B5', role: 'subplot', description: null, sortOrder: 0, ...data };
    set({ threads: [...(threads ?? []), newThread] });
    return id;
  },

  editThread: async (threadId, data) => {
    const { _db, _projectId, threads } = get();
    if (!_db || !_projectId) return;
    await updateThread(_db, threadId, data, _projectId);
    set({ threads: (threads ?? []).map(t => t.id === threadId ? { ...t, ...data } : t) });
  },

  removeThread: async (threadId) => {
    const { _db, _projectId, threads } = get();
    if (!_db || !_projectId) return;
    await deleteThread(_db, threadId, _projectId);
    set({ threads: (threads ?? []).filter(t => t.id !== threadId) });
  },

  reset: () => set({ threads: null, _db: null, _projectId: null }),
}));
