import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportProject } from './exportProject';

vi.mock('../api/client', () => ({
  getDeviceId: vi.fn().mockReturnValue('device-test-id'),
}));

// ── Mock APIs browser ──────────────────────────────────────────────────────────

beforeEach(() => {
  vi.restoreAllMocks();
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url');
  global.URL.revokeObjectURL = vi.fn();
});

// ── Payload de base retourné par l'API ────────────────────────────────────────

function makePayload(projectName = 'Mon Roman') {
  return {
    version:  '1.0',
    project:  { id: 'proj_1', name: projectName, description: 'Desc', mapImage: null, created_at: '2024-01-01' },
    volumes:  [{ id: 'v1', project_id: 'proj_1', number: 1, title: 'Tome 1', description: null }],
    characters:        [],
    locations:         [],
    objects:           [],
    timelineEvents:    [],
    eventEntities:     [],
    incoherences:      [],
    incoherenceLinks:  [],
    stcChapters:       [],
    stcChapterBeats:   [],
    stcChapterEntities:[],
    characterJourneys: [],
    groups:            [],
    characterGroups:   [],
    plantPayoffs:      [],
    arcPoints:         [],
    heroJourneyEntries:[],
  };
}

function mockFetch(payload, status = 200) {
  global.fetch = vi.fn().mockResolvedValue({
    ok:   status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(payload),
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('exportProject', () => {
  it('lance le téléchargement et retourne le nom de fichier', async () => {
    mockFetch(makePayload());
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    const filename = await exportProject(null, 'proj_1');

    expect(fakeA.click).toHaveBeenCalledOnce();
    expect(typeof filename).toBe('string');
    expect(filename).toMatch(/^atlas_.*\.json$/);
  });

  it("libère l'URL blob après le clic", async () => {
    mockFetch(makePayload());
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(null, 'proj_1');

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('lève une erreur si le serveur répond en erreur', async () => {
    mockFetch({}, 404);
    await expect(exportProject(null, 'proj_inexistant')).rejects.toThrow('Export échoué');
  });

  it('génère un slug en minuscules sans accents', async () => {
    mockFetch(makePayload('Héros & Légendes'));
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    const filename = await exportProject(null, 'proj_1');
    expect(filename).toMatch(/^atlas_heros_legendes/);
  });

  it('remplace les caractères spéciaux par des underscores', async () => {
    mockFetch(makePayload('Mon Roman: Tome 1'));
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    const filename = await exportProject(null, 'proj_1');
    expect(filename).not.toMatch(/[:]/);
    expect(filename).toMatch(/^atlas_/);
  });

  it('tronque le slug à 30 caractères', async () => {
    mockFetch(makePayload('Un Roman Extraordinairement Long Avec Plein De Mots'));
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    const filename = await exportProject(null, 'proj_1');
    const slug = filename.replace(/^atlas_/, '').replace(/_\d{4}-\d{2}-\d{2}\.json$/, '');
    expect(slug.length).toBeLessThanOrEqual(30);
  });

  it('inclut la date au format YYYY-MM-DD dans le nom de fichier', async () => {
    mockFetch(makePayload());
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    const filename = await exportProject(null, 'proj_1');
    expect(filename).toMatch(/_\d{4}-\d{2}-\d{2}\.json$/);
  });

  it('le payload contient version, project et toutes les tables', async () => {
    mockFetch(makePayload());
    let capturedBlob;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts) { capturedBlob = JSON.parse(parts[0]); } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(null, 'proj_1');
    global.Blob = OrigBlob;

    expect(capturedBlob.version).toBe('1.0');
    expect(capturedBlob.project.name).toBe('Mon Roman');
    expect(capturedBlob.volumes).toBeDefined();
    expect(capturedBlob.characters).toBeDefined();
    expect(capturedBlob.locations).toBeDefined();
    expect(capturedBlob.timelineEvents).toBeDefined();
    expect(capturedBlob.stcChapters).toBeDefined();
    expect(capturedBlob.characterJourneys).toBeDefined();
  });

  it('le payload inclut les volumes avec leur contenu', async () => {
    mockFetch(makePayload());
    let capturedBlob;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts) { capturedBlob = JSON.parse(parts[0]); } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(null, 'proj_1');
    global.Blob = OrigBlob;

    expect(Array.isArray(capturedBlob.volumes)).toBe(true);
    expect(capturedBlob.volumes[0].id).toBe('v1');
    expect(capturedBlob.volumes[0].number).toBe(1);
  });

  it('mappe map_image → mapImage dans project', async () => {
    mockFetch(makePayload());
    let capturedBlob;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts) { capturedBlob = JSON.parse(parts[0]); } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(null, 'proj_1');
    global.Blob = OrigBlob;

    expect('mapImage' in capturedBlob.project).toBe(true);
  });
});
