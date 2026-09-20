import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './useChatStore';

const reset = () => useChatStore.setState({ projectId: null, threads: [], activeId: null });

beforeEach(() => { localStorage.clear(); reset(); });

describe('useChatStore', () => {
  it('addMessage crée un thread auto-titré depuis le 1er message utilisateur', () => {
    const s = useChatStore.getState();
    s.load('p1');
    s.addMessage({ role: 'user', text: 'Qui est Aragorn ?' });
    const { threads, activeId } = useChatStore.getState();
    expect(threads).toHaveLength(1);
    expect(threads[0].id).toBe(activeId);
    expect(threads[0].title).toBe('Qui est Aragorn ?');
    expect(threads[0].messages).toHaveLength(1);
  });

  it('persiste en localStorage et se recharge', () => {
    const s = useChatStore.getState();
    s.load('p1');
    s.addMessage({ role: 'user', text: 'Bonjour' });
    // Simule un nouveau chargement (autre instance de projet puis retour).
    reset();
    useChatStore.getState().load('p1');
    expect(useChatStore.getState().threads).toHaveLength(1);
    expect(useChatStore.getState().threads[0].title).toBe('Bonjour');
  });

  it('newThread / rename / delete', () => {
    const s = useChatStore.getState();
    s.load('p1');
    const a = s.newThread();
    s.addMessage({ role: 'user', text: 'A' });
    const b = s.newThread();
    expect(useChatStore.getState().threads).toHaveLength(2);

    s.renameThread(a, 'Renommé');
    expect(useChatStore.getState().threads.find(t => t.id === a).title).toBe('Renommé');

    s.deleteThread(b);
    const st = useChatStore.getState();
    expect(st.threads).toHaveLength(1);
    expect(st.threads[0].id).toBe(a);
  });

  it('togglePin bascule et persiste', () => {
    const s = useChatStore.getState();
    s.load('p1');
    const a = s.newThread();
    s.togglePin(a);
    expect(useChatStore.getState().threads.find(t => t.id === a).pinned).toBe(true);
    s.togglePin(a);
    expect(useChatStore.getState().threads.find(t => t.id === a).pinned).toBe(false);
  });

  it('cloisonne les threads par projet', () => {
    const s = useChatStore.getState();
    s.load('p1');
    s.addMessage({ role: 'user', text: 'projet 1' });
    reset();
    useChatStore.getState().load('p2');
    expect(useChatStore.getState().threads).toHaveLength(0);
  });
});
