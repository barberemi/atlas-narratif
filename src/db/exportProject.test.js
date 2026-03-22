import { describe, it, expect, vi, beforeEach } from 'vitest';
import { exportProject } from './exportProject';

// ── Mock APIs browser (jsdom ne fournit pas createObjectURL) ──────────────────

beforeEach(() => {
  vi.restoreAllMocks();
  global.URL.createObjectURL  = vi.fn().mockReturnValue('blob:fake-url');
  global.URL.revokeObjectURL  = vi.fn();
});

// ── Mock DB ───────────────────────────────────────────────────────────────────

function makeDb(projectName = 'Mon Roman') {
  const project = { id: 'proj_1', name: projectName, description: 'Desc', map_image: null, created_at: '2024-01-01' };

  return {
    query: vi.fn().mockImplementation((sql) => {
      if (sql.includes('FROM projects'))          return { rows: [project] };
      if (sql.includes('FROM characters'))        return { rows: [{ id: 'c1', name: 'Alice' }] };
      if (sql.includes('FROM locations'))         return { rows: [] };
      if (sql.includes('FROM objects'))           return { rows: [] };
      if (sql.includes('FROM timeline_events'))   return { rows: [] };
      if (sql.includes('FROM event_entities'))    return { rows: [] };
      if (sql.includes('FROM incoherences') && !sql.includes('_links')) return { rows: [] };
      if (sql.includes('FROM incoherence_links')) return { rows: [] };
      if (sql.includes('FROM stc_chapters'))      return { rows: [] };
      if (sql.includes('FROM stc_chapter_beats')) return { rows: [] };
      if (sql.includes('FROM stc_chapter_entities')) return { rows: [] };
      if (sql.includes('FROM character_journeys')) return { rows: [] };
      if (sql.includes('FROM groups') && !sql.includes('character_groups')) return { rows: [] };
      if (sql.includes('FROM character_groups')) return { rows: [] };
      if (sql.includes('FROM plant_payoffs'))   return { rows: [] };
      if (sql.includes('FROM arc_points'))      return { rows: [] };
      return { rows: [] };
    }),
  };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('exportProject', () => {
  it('lance le téléchargement et retourne le nom de fichier', async () => {
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    const filename = await exportProject(makeDb(), 'proj_1');

    expect(fakeA.click).toHaveBeenCalledOnce();
    expect(typeof filename).toBe('string');
    expect(filename).toMatch(/^atlas_.*\.json$/);
  });

  it('libère l\'URL blob après le clic', async () => {
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });
    await exportProject(makeDb(), 'proj_1');
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('lance 19 requêtes SQL (1 projet + 18 tables)', async () => {
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });
    const db = makeDb();
    await exportProject(db, 'proj_1');
    expect(db.query).toHaveBeenCalledTimes(19);
  });

  it('lève une erreur si le projet est introuvable', async () => {
    const db = { query: vi.fn().mockResolvedValue({ rows: [] }) };
    await expect(exportProject(db, 'proj_inexistant')).rejects.toThrow('introuvable');
  });

  // ── Génération du slug / filename ────────────────────────────────────────────

  it('génère un slug en minuscules sans accents', async () => {
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);
    const filename = await exportProject(makeDb('Héros & Légendes'), 'proj_1');
    expect(filename).toMatch(/^atlas_heros_legendes/);
  });

  it('remplace les caractères spéciaux par des underscores', async () => {
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);
    const filename = await exportProject(makeDb('Mon Roman: Tome 1'), 'proj_1');
    expect(filename).not.toMatch(/[:]/); // pas de deux-points
    expect(filename).toMatch(/^atlas_/);
  });

  it('tronque le slug à 30 caractères', async () => {
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);
    const longName = 'Un Roman Extraordinairement Long Avec Plein De Mots';
    const filename = await exportProject(makeDb(longName), 'proj_1');
    // Format: atlas_<slug>_YYYY-MM-DD.json
    const slug = filename.replace(/^atlas_/, '').replace(/_\d{4}-\d{2}-\d{2}\.json$/, '');
    expect(slug.length).toBeLessThanOrEqual(30);
  });

  it('inclut la date au format YYYY-MM-DD dans le nom de fichier', async () => {
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });
    const filename = await exportProject(makeDb(), 'proj_1');
    expect(filename).toMatch(/_\d{4}-\d{2}-\d{2}\.json$/);
  });

  // ── Assemblage du payload ─────────────────────────────────────────────────────

  it('le payload contient version, project et toutes les tables', async () => {
    let capturedBlob;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts) { capturedBlob = JSON.parse(parts[0]); } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(makeDb(), 'proj_1');
    global.Blob = OrigBlob;

    expect(capturedBlob.version).toBe('1.0');
    expect(capturedBlob.project.name).toBe('Mon Roman');
    expect(capturedBlob.characters).toBeDefined();
    expect(capturedBlob.locations).toBeDefined();
    expect(capturedBlob.timelineEvents).toBeDefined();
    expect(capturedBlob.stcChapters).toBeDefined();
    expect(capturedBlob.characterJourneys).toBeDefined();
  });

  it('mappe map_image → mapImage dans project', async () => {
    let capturedBlob;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts) { capturedBlob = JSON.parse(parts[0]); } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    await exportProject(makeDb(), 'proj_1');
    global.Blob = OrigBlob;

    expect('mapImage' in capturedBlob.project).toBe(true);
  });
});
