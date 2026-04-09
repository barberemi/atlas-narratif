import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../api/client', () => ({
  getAllJourneys:      vi.fn(),
  getProjectMapImage: vi.fn(),
  setProjectMapImage: vi.fn(),
  saveJourney:        vi.fn(),
}));

vi.mock('../utils/journeyUtils', () => ({
  computeAutoJourneys: vi.fn(),
}));

import { useMapStore } from './useMapStore';
import { getAllJourneys, getProjectMapImage, setProjectMapImage, saveJourney } from '../api/client';
import { computeAutoJourneys } from '../utils/journeyUtils';

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

    await useMapStore.getState().load(PROJECT_ID);

    expect(getAllJourneys).toHaveBeenCalledWith(PROJECT_ID);
    expect(getProjectMapImage).toHaveBeenCalledWith(PROJECT_ID);
    expect(useMapStore.getState().journeys).toEqual(JOURNEYS);
    expect(useMapStore.getState().mapImage).toBe(MAP_IMAGE);
  });

  it('gère une mapImage null (pas de carte)', async () => {
    vi.mocked(getAllJourneys).mockResolvedValue({});
    vi.mocked(getProjectMapImage).mockResolvedValue(null);
    await useMapStore.getState().load(PROJECT_ID);
    expect(useMapStore.getState().mapImage).toBeNull();
  });
});

// ── loadAuto() ────────────────────────────────────────────────────────────────

describe('loadAuto()', () => {
  const AUTO_JOURNEYS = { sam: [{ etape: 1 }] };
  const UNLOCALIZED   = [{ id: 'loc_x', name: 'Lieu inconnu' }];

  it('appelle computeAutoJourneys avec events, locations, characters', () => {
    vi.mocked(computeAutoJourneys).mockReturnValue({ autoJourneys: AUTO_JOURNEYS, unlocalized: UNLOCALIZED });
    useMapStore.getState().loadAuto([{ id: 'e1' }], [{ id: 'l1' }], [{ id: 'c1' }]);
    expect(computeAutoJourneys).toHaveBeenCalledWith([{ id: 'e1' }], [{ id: 'l1' }], [{ id: 'c1' }]);
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

  beforeEach(async () => {
    vi.mocked(getAllJourneys).mockResolvedValue(JOURNEYS);
    vi.mocked(getProjectMapImage).mockResolvedValue(null);
    await useMapStore.getState().load(PROJECT_ID);
  });

  it('persiste le trajet via saveJourney', async () => {
    vi.mocked(saveJourney).mockResolvedValue();
    vi.mocked(getAllJourneys).mockResolvedValue(JOURNEYS);

    await useMapStore.getState().persistJourney('frodo', STEPS);

    expect(saveJourney).toHaveBeenCalledWith(PROJECT_ID, 'frodo', STEPS);
  });

  it('recharge les journeys après persistance', async () => {
    const updatedJourneys = { frodo: STEPS, sam: [] };
    vi.mocked(saveJourney).mockResolvedValue();
    vi.mocked(getAllJourneys).mockResolvedValue(updatedJourneys);

    await useMapStore.getState().persistJourney('frodo', STEPS);

    expect(useMapStore.getState().journeys).toEqual(updatedJourneys);
  });
});

// ── saveMapImage() ────────────────────────────────────────────────────────────

describe('saveMapImage()', () => {
  beforeEach(async () => {
    vi.mocked(getAllJourneys).mockResolvedValue({});
    vi.mocked(getProjectMapImage).mockResolvedValue(null);
    await useMapStore.getState().load(PROJECT_ID);
  });

  it("persiste l'image via setProjectMapImage", async () => {
    vi.mocked(setProjectMapImage).mockResolvedValue();
    await useMapStore.getState().saveMapImage(MAP_IMAGE);
    expect(setProjectMapImage).toHaveBeenCalledWith(PROJECT_ID, MAP_IMAGE);
  });

  it('met à jour mapImage dans le state', async () => {
    vi.mocked(setProjectMapImage).mockResolvedValue();
    await useMapStore.getState().saveMapImage(MAP_IMAGE);
    expect(useMapStore.getState().mapImage).toBe(MAP_IMAGE);
  });
});

// ── reset() ───────────────────────────────────────────────────────────────────

describe('reset()', () => {
  it("restaure l'état initial", async () => {
    vi.mocked(getAllJourneys).mockResolvedValue(JOURNEYS);
    vi.mocked(getProjectMapImage).mockResolvedValue(MAP_IMAGE);
    await useMapStore.getState().load(PROJECT_ID);
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
