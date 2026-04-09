import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getChapterNotes: vi.fn(),
  setChapterNote:  vi.fn(),
}));

import { useNotesStore } from './useNotesStore';
import { getChapterNotes, setChapterNote } from '../api/client';

const PROJECT_ID = 'proj_test';

beforeEach(() => {
  vi.clearAllMocks();
  useNotesStore.getState().reset();
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  it('charge les notes depuis la DB', async () => {
    const notes = { 1: 'Note ch1', 3: 'Note ch3' };
    vi.mocked(getChapterNotes).mockResolvedValue(notes);

    await useNotesStore.getState().load(PROJECT_ID);

    expect(getChapterNotes).toHaveBeenCalledWith(PROJECT_ID);
    expect(useNotesStore.getState().notes).toEqual(notes);
  });

  it('stocke _projectId', async () => {
    vi.mocked(getChapterNotes).mockResolvedValue({});
    await useNotesStore.getState().load(PROJECT_ID);
    expect(useNotesStore.getState()._projectId).toBe(PROJECT_ID);
  });
});

// ── setNote() ─────────────────────────────────────────────────────────────────

describe('setNote()', () => {
  beforeEach(async () => {
    vi.mocked(getChapterNotes).mockResolvedValue({ 1: 'Ancien texte' });
    vi.mocked(setChapterNote).mockResolvedValue();
    await useNotesStore.getState().load(PROJECT_ID);
  });

  it('met à jour la note immédiatement (optimiste)', async () => {
    await useNotesStore.getState().setNote(1, 'Nouveau texte');
    expect(useNotesStore.getState().notes[1]).toBe('Nouveau texte');
  });

  it('ajoute une note pour un nouveau chapitre', async () => {
    await useNotesStore.getState().setNote(5, 'Note ch5');
    expect(useNotesStore.getState().notes[5]).toBe('Note ch5');
  });

  it('ne supprime pas les notes des autres chapitres', async () => {
    await useNotesStore.getState().setNote(2, 'Note ch2');
    expect(useNotesStore.getState().notes[1]).toBe('Ancien texte');
  });

  it('persiste en DB via setChapterNote', async () => {
    await useNotesStore.getState().setNote(1, 'Texte persisté');
    expect(setChapterNote).toHaveBeenCalledWith(PROJECT_ID, 1, 'Texte persisté');
  });

  it('ne fait rien si _projectId est null', async () => {
    useNotesStore.getState().reset();
    await useNotesStore.getState().setNote(1, 'Orphan');
    expect(setChapterNote).not.toHaveBeenCalled();
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('remet notes et _projectId à null', async () => {
    vi.mocked(getChapterNotes).mockResolvedValue({ 1: 'texte' });
    await useNotesStore.getState().load(PROJECT_ID);
    useNotesStore.getState().reset();
    const s = useNotesStore.getState();
    expect(s.notes).toBeNull();
    expect(s._projectId).toBeNull();
  });
});
