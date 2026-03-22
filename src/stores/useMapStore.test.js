import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../db/queries', () => ({
  getAllJourneys:      vi.fn(),
  getProjectMapImage: vi.fn(),
  setProjectMapImage: vi.fn(),
  saveJourney:        vi.fn(),
}));

vi.mock('../utils/journeyUtils', () => ({
  computeAutoJourneys: vi.fn(),
}));

import { useMapStore } from './useMapStore';
import { getAllJourneys, getProjectMapImage, setProjectMapImage, saveJourney } from '../db/queries';
import { computeAutoJourneys } from '../utils/journeyUtils';

const DB         = { __mock: 'db' };
const PROJECT_ID = 'proj_test';

const JOURNEYS   = { frodo: [{ etape: 1, lieu: 'La Comté' }] };
const MAP_IMAGE  = 'data:image/png;base64,abc123';

beforeEach(() => {
  vi.clearAllMocks();
  useMapStore.getState().reset();
});

// ── load() ───────────────────────────────────────────────────────────────────

describe('load()', () => {
  it('charge journeys et mapImage en parallèle', async () => {
    vi.mocked(getAllJourneys).mockResolvedValue(JOURNEYS);
    vi.mocked(getProjectMapImage).mockResolvedValue(MAP_IMAGE);

    await useMapStore.getState().load(DB, PROJECT_ID);

    expect(getAllJourneys).toHaveBeenCalledWith(DB, PROJECT_ID);
    expect(getProjectMapImage).toHaveBeenCalledWith(DB, PROJECT_ID);
    expect(useMapStore.getState().journeys).toEqual(JOURNEYS);
    expect(useMapStore.getState().mapImage).toBe(MAP_IMAGE);
  });

  it('gère une mapImage null (pas de carte)', async () => {
    vi.mocked(getAllJourneys).mockResolvedValue({});
    vi.mocked(getProjectMapImage).mockResolvedValue(null);
    await useMapStore.getState().load(DB, PROJECT_ID);
    expect(useMapStore.getState().mapImage).toBeNull();
  });
});

// ── loadAuto() ────────────────────────────────────────────────────────────────

describe('loadAuto()', () => {
  const AUTO_JOURNEYS  = { sam: [{ etape: 1 }] };
  const UNLOCALIZED    = [{ id: 'loc_x', name: 'Lieu inconnu' }];

  it('appelle computeAutoJourneys avec events, locations, characters', () => {
    vi.mocked(computeAutoJourneys).mockReturnValue({ autoJourneys: AUTO_JOURNEYS, unlocalized: UNLOCALIZED });
    const events     = [{ id: 'e1' }];
    const locations  = [{ id: 'l1' }];
    const characters = [{ id: 'c1' }];

    useMapStore.getState().loadAuto(events, locations, characters);

    expect(computeAutoJourneys).toHaveBeenCalledWith(events, locations, characters);
  });

  it('met à jour autoJourneys et unlocalized', () => {
    vi.mocked(computeAutoJourneys).mockReturnValue({ autoJourneys: AUTO_JOURNEYS, unlocalized: UNLOCALIZED });
    useMapStore.getState().loadAuto([], [], []);
    expect(useMapStore.getState().autoJourneys).toEqual(AUTO_JOURNEYS);
    expect(useMapStore.getState().unlocalized).toEqual(UNLOCALIZED);
  });
});

// ── setMode() ─────────────────────────────────────────────────────────────────

describe('setMode()', () => {
  it('mode initial est "auto"', () => {
    expect(useMapStore.getState().mode).toBe('auto');
  });

  it('bascule vers "manual"', () => {
    useMapStore.getState().setMode('manual');
    expect(useMapStore.getState().mode).toBe('manual');
  });

  it('bascule vers "auto"', () => {
    useMapStore.getState().setMode('manual');
    useMapStore.getState().setMode('auto');
    expect(useMapStore.getState().mode).toBe('auto');
  });
});

// ── persistJourney() ──────────────────────────────────────────────────────────

describe('persistJourney()', () => {
  const STEPS = [{ etape: 1, lieu: 'La Comté' }];

  it('persiste le trajet via saveJourney', async () => {
    vi.mocked(saveJourney).mockResolvedValue();
    vi.mocked(getAllJourneys).mockResolvedValue(JOURNEYS);

    await useMapStore.getState().persistJourney(DB, PROJECT_ID, 'frodo', STEPS);

    expect(saveJourney).toHaveBeenCalledWith(DB, PROJECT_ID, 'frodo', STEPS);
  });

  it('recharge les journeys après persistance', async () => {
    const updatedJourneys = { frodo: STEPS, sam: [] };
    vi.mocked(saveJourney).mockResolvedValue();
    vi.mocked(getAllJourneys).mockResolvedValue(updatedJourneys);

    await useMapStore.getState().persistJourney(DB, PROJECT_ID, 'frodo', STEPS);

    expect(useMapStore.getState().journeys).toEqual(updatedJourneys);
  });
});

// ── saveMapImage() ────────────────────────────────────────────────────────────

describe('saveMapImage()', () => {
  it('persiste l\'image via setProjectMapImage', async () => {
    vi.mocked(setProjectMapImage).mockResolvedValue();
    await useMapStore.getState().saveMapImage(DB, PROJECT_ID, MAP_IMAGE);
    expect(setProjectMapImage).toHaveBeenCalledWith(DB, PROJECT_ID, MAP_IMAGE);
  });

  it('met à jour mapImage dans le state', async () => {
    vi.mocked(setProjectMapImage).mockResolvedValue();
    await useMapStore.getState().saveMapImage(DB, PROJECT_ID, MAP_IMAGE);
    expect(useMapStore.getState().mapImage).toBe(MAP_IMAGE);
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it('restaure l\'état initial', async () => {
    vi.mocked(getAllJourneys).mockResolvedValue(JOURNEYS);
    vi.mocked(getProjectMapImage).mockResolvedValue(MAP_IMAGE);
    await useMapStore.getState().load(DB, PROJECT_ID);
    useMapStore.getState().setMode('manual');

    useMapStore.getState().reset();

    const s = useMapStore.getState();
    expect(s.journeys).toBeNull();
    expect(s.autoJourneys).toBeNull();
    expect(s.unlocalized).toEqual([]);
    expect(s.mode).toBe('auto');
    expect(s.mapImage).toBeNull();
  });
});
