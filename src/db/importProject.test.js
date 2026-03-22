import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @anthropic-ai/sdk ────────────────────────────────────────────────────

const mockCreate = vi.fn();

vi.mock('@anthropic-ai/sdk', () => ({
  default: class Anthropic {
    constructor() {
      this.messages = { create: mockCreate };
    }
  },
}));

// ── Mock seed.generic ─────────────────────────────────────────────────────────

vi.mock('./seed.generic', () => ({
  seedProject: vi.fn().mockResolvedValue(undefined),
}));

import { analyzeAndImport, MODELS } from './importProject';
import { seedProject } from './seed.generic';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DB = { __mock: 'db' };

const VALID_DATA = {
  loreDB:         { characters: [{ id: 'char_alice', name: 'Alice' }], locations: [], objects: [] },
  timelineDB:     [{ id: 'evt_1', chapter: 1, title: 'Début' }],
  incoherencesDB: [],
  chaptersDB:     [],
  journeys:       [],
};

function makeApiResponse(jsonPayload) {
  return {
    content: [{ text: '```json\n' + JSON.stringify(jsonPayload) + '\n```' }],
  };
}

function baseOpts(overrides = {}) {
  return {
    content:     'Texte du roman.',
    mode:        'manuscript',
    projectName: 'Mon Roman',
    projectDesc: 'Une belle histoire',
    mapImage:    null,
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  // Clé API présente par défaut
  vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'test-api-key');
  mockCreate.mockResolvedValue(makeApiResponse(VALID_DATA));
});

// ── Clé API ───────────────────────────────────────────────────────────────────

describe('clé API', () => {
  it('lève une erreur si la clé est absente', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', '');
    await expect(analyzeAndImport(DB, baseOpts())).rejects.toThrow('Clé API');
  });

  it('lève une erreur si la clé est le placeholder', async () => {
    vi.stubEnv('VITE_ANTHROPIC_API_KEY', 'your_api_key_here');
    await expect(analyzeAndImport(DB, baseOpts())).rejects.toThrow('Clé API');
  });

  it('passe avec une vraie clé', async () => {
    await expect(analyzeAndImport(DB, baseOpts())).resolves.toBeDefined();
  });
});

// ── Appel API ─────────────────────────────────────────────────────────────────

describe('appel API Claude', () => {
  it('appelle client.messages.create une fois', async () => {
    await analyzeAndImport(DB, baseOpts());
    expect(mockCreate).toHaveBeenCalledOnce();
  });

  it('utilise le modèle sonnet par défaut', async () => {
    await analyzeAndImport(DB, baseOpts());
    expect(mockCreate.mock.calls[0][0].model).toBe(MODELS.sonnet.id);
  });

  it('utilise le modèle opus si spécifié', async () => {
    await analyzeAndImport(DB, baseOpts({ model: 'opus' }));
    expect(mockCreate.mock.calls[0][0].model).toBe(MODELS.opus.id);
  });

  it('envoie le contenu texte dans le message utilisateur', async () => {
    await analyzeAndImport(DB, baseOpts({ content: 'Mon texte unique' }));
    const { messages } = mockCreate.mock.calls[0][0];
    expect(JSON.stringify(messages)).toContain('Mon texte unique');
  });

  it('mode manuscript → label correct dans le contenu', async () => {
    await analyzeAndImport(DB, baseOpts({ mode: 'manuscript' }));
    const { messages } = mockCreate.mock.calls[0][0];
    expect(JSON.stringify(messages)).toContain('manuscrit complet');
  });

  it('mode notes → label correct dans le contenu', async () => {
    await analyzeAndImport(DB, baseOpts({ mode: 'notes' }));
    const { messages } = mockCreate.mock.calls[0][0];
    expect(JSON.stringify(messages)).toContain("notes d'auteur");
  });
});

// ── Parsing de la réponse ─────────────────────────────────────────────────────

describe('parsing de la réponse Claude', () => {
  it('lève une erreur si la réponse ne contient pas de bloc json', async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ text: 'Désolé je ne peux pas.' }] });
    await expect(analyzeAndImport(DB, baseOpts())).rejects.toThrow('JSON');
  });

  it('lève une erreur si le JSON est invalide', async () => {
    mockCreate.mockResolvedValueOnce({ content: [{ text: '```json\n{ invalide\n```' }] });
    await expect(analyzeAndImport(DB, baseOpts())).rejects.toThrow('parsing JSON');
  });

  it('lève une erreur si content[0] est absent', async () => {
    mockCreate.mockResolvedValueOnce({ content: [] });
    await expect(analyzeAndImport(DB, baseOpts())).rejects.toThrow();
  });

  it('parse correctement un bloc json valide', async () => {
    await expect(analyzeAndImport(DB, baseOpts())).resolves.toBeDefined();
  });
});

// ── Valeurs par défaut (tableaux manquants) ───────────────────────────────────

describe('valeurs par défaut si tableaux absents', () => {
  it('loreDB vide si absent', async () => {
    mockCreate.mockResolvedValueOnce(makeApiResponse({}));
    await analyzeAndImport(DB, baseOpts());
    const [, , data] = seedProject.mock.calls[0];
    expect(data.loreDB.characters).toEqual([]);
  });

  it('timelineDB vide si absent', async () => {
    mockCreate.mockResolvedValueOnce(makeApiResponse({}));
    await analyzeAndImport(DB, baseOpts());
    const [, , data] = seedProject.mock.calls[0];
    expect(data.timelineDB).toEqual([]);
  });

  it('chaptersDB vide si absent', async () => {
    mockCreate.mockResolvedValueOnce(makeApiResponse({}));
    await analyzeAndImport(DB, baseOpts());
    const [, , data] = seedProject.mock.calls[0];
    expect(data.chaptersDB).toEqual([]);
  });

  it('journeys = [] si pas de carte', async () => {
    await analyzeAndImport(DB, baseOpts({ mapImage: null }));
    const [, , data] = seedProject.mock.calls[0];
    expect(data.journeys).toEqual([]);
  });
});

// ── Carte (mapImage) ──────────────────────────────────────────────────────────

describe('avec mapImage', () => {
  const MAP = 'data:image/png;base64,AAAA';

  it('envoie un message multipart (image + texte)', async () => {
    await analyzeAndImport(DB, baseOpts({ mapImage: MAP }));
    const { messages } = mockCreate.mock.calls[0][0];
    expect(Array.isArray(messages[0].content)).toBe(true);
    expect(messages[0].content[0].type).toBe('image');
    expect(messages[0].content[1].type).toBe('text');
  });

  it('extrait media_type et data de la data URL', async () => {
    await analyzeAndImport(DB, baseOpts({ mapImage: MAP }));
    const imageBlock = mockCreate.mock.calls[0][0].messages[0].content[0];
    expect(imageBlock.source.media_type).toBe('image/png');
    expect(imageBlock.source.data).toBe('AAAA');
  });

  it('conserve les journeys de la réponse Claude si carte présente', async () => {
    const dataWithJourney = { ...VALID_DATA, journeys: [{ key: 'char_alice', data: [] }] };
    mockCreate.mockResolvedValueOnce(makeApiResponse(dataWithJourney));
    await analyzeAndImport(DB, baseOpts({ mapImage: MAP }));
    const [, , data] = seedProject.mock.calls[0];
    expect(data.journeys).toHaveLength(1);
  });
});

// ── seedProject + projectId ───────────────────────────────────────────────────

describe('seedProject', () => {
  it('appelle seedProject une fois', async () => {
    await analyzeAndImport(DB, baseOpts());
    expect(seedProject).toHaveBeenCalledOnce();
  });

  it('retourne le slug du nom de projet', async () => {
    const id = await analyzeAndImport(DB, baseOpts({ projectName: 'Mon Roman' }));
    expect(id).toBe('mon_roman');
  });

  it('normalise les accents dans le slug', async () => {
    const id = await analyzeAndImport(DB, baseOpts({ projectName: 'Héros Légendaire' }));
    expect(id).not.toMatch(/[éèàùî]/);
    expect(id).toContain('heros');
  });

  it('tronque le slug à 40 caractères', async () => {
    const id = await analyzeAndImport(DB, baseOpts({ projectName: 'Un Roman Extraordinairement Long Avec Beaucoup De Mots' }));
    expect(id.length).toBeLessThanOrEqual(40);
  });

  it('passe le bon nom et la description à seedProject', async () => {
    await analyzeAndImport(DB, baseOpts({ projectName: 'Mon Roman', projectDesc: 'Belle histoire' }));
    const [dbArg, projectArg] = seedProject.mock.calls[0];
    expect(dbArg).toBe(DB);
    expect(projectArg.name).toBe('Mon Roman');
    expect(projectArg.description).toBe('Belle histoire');
  });

  it('passe null si projectDesc absent', async () => {
    await analyzeAndImport(DB, baseOpts({ projectDesc: undefined }));
    const [, projectArg] = seedProject.mock.calls[0];
    expect(projectArg.description).toBeNull();
  });
});

// ── onProgress ────────────────────────────────────────────────────────────────

describe('onProgress', () => {
  it('appelle onProgress pour l\'analyse', async () => {
    const onProgress = vi.fn();
    await analyzeAndImport(DB, baseOpts({ onProgress }));
    expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Claude'));
  });

  it('appelle onProgress pour le traitement de la réponse', async () => {
    const onProgress = vi.fn();
    await analyzeAndImport(DB, baseOpts({ onProgress }));
    expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Traitement'));
  });

  it('appelle onProgress pour l\'insertion en DB', async () => {
    const onProgress = vi.fn();
    await analyzeAndImport(DB, baseOpts({ onProgress }));
    expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('Insertion'));
  });

  it('fonctionne sans onProgress (optionnel)', async () => {
    await expect(analyzeAndImport(DB, baseOpts())).resolves.toBeDefined();
  });

  it('appelle onProgress avec le message carte si mapImage présent', async () => {
    const onProgress = vi.fn();
    await analyzeAndImport(DB, baseOpts({ mapImage: 'data:image/png;base64,AAAA', onProgress }));
    expect(onProgress).toHaveBeenCalledWith(expect.stringContaining('carte'));
  });
});

// ── MODELS export ─────────────────────────────────────────────────────────────

describe('MODELS', () => {
  it('contient les clés sonnet et opus', () => {
    expect(MODELS.sonnet).toBeDefined();
    expect(MODELS.opus).toBeDefined();
  });

  it('chaque modèle a id, label, maxTokens, desc', () => {
    for (const m of Object.values(MODELS)) {
      expect(typeof m.id).toBe('string');
      expect(typeof m.label).toBe('string');
      expect(typeof m.maxTokens).toBe('number');
      expect(typeof m.desc).toBe('string');
    }
  });
});
