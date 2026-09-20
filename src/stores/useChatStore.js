import { create } from 'zustand';

/**
 * Historique de chat multi-threads, persisté en localStorage PAR PROJET.
 * (Local à l'appareil — non synchronisé serveur ; adapté au « mode local ».)
 *
 * Forme persistée : { threads: Thread[], activeId }
 *   Thread  = { id, title, createdAt, updatedAt, messages: Message[] }
 *   Message = { role: 'user'|'bot', text, meta?, sources? }
 */
const KEY = (projectId) => `atlas_chat_v1_${projectId}`;
const MAX_TITLE = 60;

function read(projectId) {
  try {
    const raw = localStorage.getItem(KEY(projectId));
    if (!raw) return { threads: [], activeId: null };
    const parsed = JSON.parse(raw);
    return { threads: parsed.threads ?? [], activeId: parsed.activeId ?? null };
  } catch { return { threads: [], activeId: null }; }
}

function write(projectId, { threads, activeId }) {
  try { localStorage.setItem(KEY(projectId), JSON.stringify({ threads, activeId })); } catch { /* quota */ }
}

const uid = () => `th_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useChatStore = create((set, get) => {
  const persist = () => {
    const { projectId, threads, activeId } = get();
    if (projectId) write(projectId, { threads, activeId });
  };

  return {
    projectId: null,
    threads: [],
    activeId: null,

    /** Charge l'historique du projet (idempotent). */
    load: (projectId) => {
      if (!projectId || get().projectId === projectId) return;
      set({ projectId, ...read(projectId) });
    },

    activeThread: () => get().threads.find(t => t.id === get().activeId) ?? null,

    /** Crée un thread vide et l'active. Retourne son id. */
    newThread: () => {
      const id = uid();
      const now = Date.now();
      const thread = { id, title: '', createdAt: now, updatedAt: now, messages: [] };
      set(s => ({ threads: [thread, ...s.threads], activeId: id }));
      persist();
      return id;
    },

    setActive: (id) => { set({ activeId: id }); persist(); },

    /** Ajoute un message au thread actif (en crée un si besoin). Auto-titre depuis
     *  le 1er message utilisateur. */
    addMessage: (msg) => {
      let { activeId, threads } = get();
      if (!activeId || !threads.some(t => t.id === activeId)) activeId = get().newThread();
      set(s => ({
        activeId,
        threads: s.threads.map(t => {
          if (t.id !== activeId) return t;
          const messages = [...t.messages, msg];
          const title = t.title || (msg.role === 'user' ? msg.text.slice(0, MAX_TITLE) : t.title);
          return { ...t, messages, title, updatedAt: Date.now() };
        }),
      }));
      persist();
    },

    renameThread: (id, title) => {
      set(s => ({ threads: s.threads.map(t => t.id === id ? { ...t, title: title.slice(0, MAX_TITLE) } : t) }));
      persist();
    },

    togglePin: (id) => {
      set(s => ({ threads: s.threads.map(t => t.id === id ? { ...t, pinned: !t.pinned } : t) }));
      persist();
    },

    deleteThread: (id) => {
      set(s => {
        const threads = s.threads.filter(t => t.id !== id);
        const activeId = s.activeId === id ? (threads[0]?.id ?? null) : s.activeId;
        return { threads, activeId };
      });
      persist();
    },
  };
});
