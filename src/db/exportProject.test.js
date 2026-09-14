import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportProject, exportBasename } from './exportProject';

vi.mock('../api/client', () => ({
  getDeviceId: vi.fn().mockReturnValue('device-test-id'),
  ensureDeviceRegistered: vi.fn().mockResolvedValue(),
}));

vi.mock('../utils/exportMarkdown', () => ({
  buildMarkdown: vi.fn().mockReturnValue('# Mon Roman\n\nContenu markdown'),
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
  it('lance le téléchargement et retourne le nom de fichier .md', async () => {
    mockFetch(makePayload());
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    const filename = await exportProject(null, 'proj_1');

    expect(fakeA.click).toHaveBeenCalledOnce();
    expect(typeof filename).toBe('string');
    expect(filename).toMatch(/^atlas_.*\.md$/);
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
    const slug = filename.replace(/^atlas_/, '').replace(/_\d{4}-\d{2}-\d{2}\.md$/, '');
    expect(slug.length).toBeLessThanOrEqual(30);
  });

  it('inclut la date au format YYYY-MM-DD dans le nom de fichier', async () => {
    mockFetch(makePayload());
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    const filename = await exportProject(null, 'proj_1');
    expect(filename).toMatch(/_\d{4}-\d{2}-\d{2}\.md$/);
  });

  it('le Blob contient du Markdown (pas du JSON)', async () => {
    mockFetch(makePayload());
    let capturedContent;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts) { capturedContent = parts[0]; } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(null, 'proj_1');
    global.Blob = OrigBlob;

    expect(capturedContent).toContain('# Mon Roman');
  });

  it('appelle buildMarkdown avec le payload API', async () => {
    const { buildMarkdown } = await import('../utils/exportMarkdown');
    mockFetch(makePayload());
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(null, 'proj_1');

    expect(buildMarkdown).toHaveBeenCalledWith(expect.objectContaining({
      project: expect.objectContaining({ name: 'Mon Roman' }),
    }));
  });
});

// ── exportBasename (fonction pure réutilisée par les livrables auteur) ──────────

describe('exportBasename', () => {
  it('préfixe atlas_ et suffixe la date YYYY-MM-DD (sans extension)', () => {
    expect(exportBasename('Mon Roman')).toMatch(/^atlas_mon_roman_\d{4}-\d{2}-\d{2}$/);
  });

  it('normalise les accents et met en minuscules', () => {
    expect(exportBasename('Héros & Légendes')).toMatch(/^atlas_heros_legendes_/);
  });

  it('remplace les caractères spéciaux par des underscores', () => {
    const base = exportBasename('Mon Roman: Tome 1');
    expect(base).not.toMatch(/[:]/);
    expect(base).toMatch(/^atlas_mon_roman_tome_1_/);
  });

  it('tronque le slug à 30 caractères', () => {
    const base = exportBasename('Un Roman Extraordinairement Long Avec Plein De Mots');
    const slug = base.replace(/^atlas_/, '').replace(/_\d{4}-\d{2}-\d{2}$/, '');
    expect(slug.length).toBeLessThanOrEqual(30);
  });

  it('ne comporte pas d\'extension de fichier', () => {
    expect(exportBasename('Mon Roman')).not.toMatch(/\.\w+$/);
  });
});
