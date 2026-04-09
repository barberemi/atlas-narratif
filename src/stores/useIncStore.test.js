import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getIncoherences:           vi.fn(),
  setIncoherenceResolved:    vi.fn(),
  setResolutionNote:         vi.fn(),
  deleteScanIncoherences:    vi.fn(),
  insertScannedIncoherence:  vi.fn(),
}));

vi.mock('../db/detectIncoherences', () => ({
  runDetection: vi.fn(),
}));

import { useIncStore } from './useIncStore';
import {
  getIncoherences,
  setIncoherenceResolved,
  setResolutionNote,
  deleteScanIncoherences,
  insertScannedIncoherence,
} from '../api/client';
import { runDetection } from '../db/detectIncoherences';

const PROJECT_ID = 'proj_test';

const SAMPLE_INC = [
  { id: 'inc_1', resolved: false, resolutionNote: null, severity: 'high' },
  { id: 'inc_2', resolved: true,  resolutionNote: 'Fixed', severity: 'low' },
];

beforeEach(() => {
  vi.clearAllMocks();
  useIncStore.getState().reset();
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  it('charge les incohérences depuis la DB', async () => {
    vi.mocked(getIncoherences).mockResolvedValue(SAMPLE_INC);
    await useIncStore.getState().load(PROJECT_ID);
    expect(useIncStore.getState().data).toEqual(SAMPLE_INC);
  });

  it('stocke _projectId', async () => {
    vi.mocked(getIncoherences).mockResolvedValue([]);
    await useIncStore.getState().load(PROJECT_ID);
    expect(useIncStore.getState()._projectId).toBe(PROJECT_ID);
  });
});

// ── toggle() ─────────────────────────────────────────────────────────────────

describe('toggle()', () => {
  beforeEach(async () => {
    vi.mocked(getIncoherences).mockResolvedValue(SAMPLE_INC);
    vi.mocked(setIncoherenceResolved).mockResolvedValue();
    await useIncStore.getState().load(PROJECT_ID);
  });

  it('inverse resolved immédiatement (optimiste)', async () => {
    await useIncStore.getState().toggle('inc_1');
    expect(useIncStore.getState().data.find(i => i.id === 'inc_1')?.resolved).toBe(true);
  });

  it('fonctionne dans l\'autre sens (true → false)', async () => {
    await useIncStore.getState().toggle('inc_2');
    expect(useIncStore.getState().data.find(i => i.id === 'inc_2')?.resolved).toBe(false);
  });

  it('persiste via setIncoherenceResolved', async () => {
    await useIncStore.getState().toggle('inc_1');
    expect(setIncoherenceResolved).toHaveBeenCalledWith('inc_1', true, PROJECT_ID);
  });

  it('ne modifie pas les autres incohérences', async () => {
    await useIncStore.getState().toggle('inc_1');
    expect(useIncStore.getState().data.find(i => i.id === 'inc_2')?.resolved).toBe(true);
  });

  it('ne fait rien pour un id inconnu', async () => {
    await useIncStore.getState().toggle('inc_unknown');
    expect(setIncoherenceResolved).not.toHaveBeenCalled();
  });
});

// ── setNote() ────────────────────────────────────────────────────────────────

describe('setNote()', () => {
  beforeEach(async () => {
    vi.mocked(getIncoherences).mockResolvedValue(SAMPLE_INC);
    vi.mocked(setResolutionNote).mockResolvedValue();
    await useIncStore.getState().load(PROJECT_ID);
  });

  it('met à jour resolutionNote immédiatement (optimiste)', async () => {
    await useIncStore.getState().setNote('inc_1', 'Corrigé manuellement');
    expect(useIncStore.getState().data.find(i => i.id === 'inc_1')?.resolutionNote)
      .toBe('Corrigé manuellement');
  });

  it('persiste via setResolutionNote', async () => {
    await useIncStore.getState().setNote('inc_1', 'Note');
    expect(setResolutionNote).toHaveBeenCalledWith('inc_1', 'Note', PROJECT_ID);
  });

  it('ne modifie pas les autres incohérences', async () => {
    await useIncStore.getState().setNote('inc_1', 'Nouvelle note');
    expect(useIncStore.getState().data.find(i => i.id === 'inc_2')?.resolutionNote).toBe('Fixed');
  });
});

// ── rescan() ─────────────────────────────────────────────────────────────────

describe('rescan()', () => {
  const LORE = { characters: [], locations: [], objects: [], events: [] };
  const DETECTED = [
    { id: 'scan_orphan_char_1', type: 'Entité Non Référencée', severity: 'low' },
    { id: 'scan_holder_obj_2',  type: 'Incohérence de Porteur', severity: 'medium' },
  ];
  const REFRESHED = [...SAMPLE_INC, ...DETECTED];

  beforeEach(async () => {
    vi.mocked(getIncoherences)
      .mockResolvedValueOnce(SAMPLE_INC)
      .mockResolvedValueOnce(REFRESHED);
    vi.mocked(runDetection).mockReturnValue(DETECTED);
    vi.mocked(deleteScanIncoherences).mockResolvedValue();
    vi.mocked(insertScannedIncoherence).mockResolvedValue();
    await useIncStore.getState().load(PROJECT_ID);
  });

  it('appelle runDetection avec les données lore', async () => {
    await useIncStore.getState().rescan(LORE);
    expect(runDetection).toHaveBeenCalledWith(LORE);
  });

  it('supprime les anciennes incohérences scannées', async () => {
    await useIncStore.getState().rescan(LORE);
    expect(deleteScanIncoherences).toHaveBeenCalledWith(PROJECT_ID);
  });

  it('insère chaque nouvelle incohérence détectée', async () => {
    await useIncStore.getState().rescan(LORE);
    expect(insertScannedIncoherence).toHaveBeenCalledTimes(DETECTED.length);
    expect(insertScannedIncoherence).toHaveBeenCalledWith(DETECTED[0], PROJECT_ID);
    expect(insertScannedIncoherence).toHaveBeenCalledWith(DETECTED[1], PROJECT_ID);
  });

  it('recharge les données après insertion', async () => {
    await useIncStore.getState().rescan(LORE);
    expect(useIncStore.getState().data).toEqual(REFRESHED);
  });

  it('met à jour lastScanCount avec le nombre détecté', async () => {
    await useIncStore.getState().rescan(LORE);
    expect(useIncStore.getState().lastScanCount).toBe(DETECTED.length);
  });

  it('remet scanning à false après l\'opération', async () => {
    await useIncStore.getState().rescan(LORE);
    expect(useIncStore.getState().scanning).toBe(false);
  });

  it('remet scanning à false même en cas d\'erreur', async () => {
    vi.mocked(deleteScanIncoherences).mockRejectedValue(new Error('API error'));
    await expect(useIncStore.getState().rescan(LORE)).rejects.toThrow();
    expect(useIncStore.getState().scanning).toBe(false);
  });

  it('ne fait rien si _projectId est null', async () => {
    useIncStore.getState().reset();
    await useIncStore.getState().rescan(LORE);
    expect(runDetection).not.toHaveBeenCalled();
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('restaure l\'état initial complet', async () => {
    vi.mocked(getIncoherences).mockResolvedValue(SAMPLE_INC);
    await useIncStore.getState().load(PROJECT_ID);
    useIncStore.getState().reset();
    const s = useIncStore.getState();
    expect(s.data).toBeNull();
    expect(s.scanning).toBe(false);
    expect(s.lastScanCount).toBeNull();
    expect(s._projectId).toBeNull();
  });
});
