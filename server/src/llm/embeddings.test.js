import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';

const {
  cosineSimilarity, getEmbeddingsProvider, _resetEmbeddingsProvider,
  NullEmbeddingsProvider, OllamaEmbeddingsProvider,
} = await import('./embeddings.js');

describe('cosineSimilarity', () => {
  it('vaut 1 pour des vecteurs identiques', () => {
    assert.ok(Math.abs(cosineSimilarity([1, 2, 3], [1, 2, 3]) - 1) < 1e-9);
  });
  it('vaut 0 pour des vecteurs orthogonaux', () => {
    assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
  });
  it('vaut 0 si dimensions différentes ou vecteur nul', () => {
    assert.equal(cosineSimilarity([1, 0], [1, 0, 0]), 0);
    assert.equal(cosineSimilarity([0, 0], [0, 0]), 0);
  });
});

describe('getEmbeddingsProvider', () => {
  const savedEnv = { ...process.env };
  afterEach(() => { process.env = { ...savedEnv }; _resetEmbeddingsProvider(); });

  it('défaut = provider désactivé (repli lexical)', () => {
    delete process.env.EMBEDDINGS_PROVIDER;
    _resetEmbeddingsProvider();
    const p = getEmbeddingsProvider();
    assert.ok(p instanceof NullEmbeddingsProvider);
    assert.equal(p.enabled, false);
    assert.equal(p.name, 'none');
  });

  it('EMBEDDINGS_PROVIDER=ollama → provider Ollama activé', () => {
    process.env.EMBEDDINGS_PROVIDER = 'ollama';
    _resetEmbeddingsProvider();
    const p = getEmbeddingsProvider();
    assert.ok(p instanceof OllamaEmbeddingsProvider);
    assert.equal(p.enabled, true);
    assert.equal(p.name, 'ollama');
  });
});

describe('OllamaEmbeddingsProvider.embed', () => {
  const savedFetch = globalThis.fetch;
  const savedModel = process.env.OLLAMA_EMBED_MODEL;
  const savedKeepAlive = process.env.OLLAMA_KEEP_ALIVE;
  afterEach(() => {
    globalThis.fetch = savedFetch;
    if (savedModel === undefined) delete process.env.OLLAMA_EMBED_MODEL;
    else process.env.OLLAMA_EMBED_MODEL = savedModel;
    if (savedKeepAlive === undefined) delete process.env.OLLAMA_KEEP_ALIVE;
    else process.env.OLLAMA_KEEP_ALIVE = savedKeepAlive;
  });

  it('envoie keep_alive (défaut 30m) pour garder le modèle chaud', async () => {
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ embeddings: sentBody.input.map(() => [1]) }) };
    };
    delete process.env.OLLAMA_KEEP_ALIVE;
    await new OllamaEmbeddingsProvider().embed(['x']);
    assert.equal(sentBody.keep_alive, '30m');
  });

  it('respecte OLLAMA_KEEP_ALIVE', async () => {
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ embeddings: sentBody.input.map(() => [1]) }) };
    };
    process.env.OLLAMA_KEEP_ALIVE = '-1';
    await new OllamaEmbeddingsProvider().embed(['x']);
    assert.equal(sentBody.keep_alive, '-1');
  });

  it('poste input=array et retourne un vecteur par entrée', async () => {
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ embeddings: sentBody.input.map(() => [1, 0, 0]) }) };
    };
    const p = new OllamaEmbeddingsProvider();
    const out = await p.embed(['a', 'b']);
    assert.equal(sentBody.input.length, 2);
    assert.deepEqual(out, [[1, 0, 0], [1, 0, 0]]);
  });

  it('applique les préfixes de tâche nomic selon le rôle (query vs document)', async () => {
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ embeddings: sentBody.input.map(() => [1]) }) };
    };
    process.env.OLLAMA_EMBED_MODEL = 'nomic-embed-text';
    const p = new OllamaEmbeddingsProvider();
    await p.embed(['chat'], 'query');
    assert.equal(sentBody.input[0], 'search_query: chat');
    await p.embed(['chat'], 'document');
    assert.equal(sentBody.input[0], 'search_document: chat');
    await p.embed(['chat']); // défaut = document
    assert.equal(sentBody.input[0], 'search_document: chat');
  });

  it('n\'ajoute AUCUN préfixe pour un modèle multilingue (défaut)', async () => {
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ embeddings: sentBody.input.map(() => [1]) }) };
    };
    delete process.env.OLLAMA_EMBED_MODEL; // défaut = paraphrase-multilingual
    const p = new OllamaEmbeddingsProvider();
    assert.equal(p.model, 'paraphrase-multilingual');
    await p.embed(['chat'], 'query');
    assert.equal(sentBody.input[0], 'chat');
  });

  it('lève sur réponse HTTP non-ok (→ repli lexical côté appelant)', async () => {
    globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => 'boom' });
    await assert.rejects(() => new OllamaEmbeddingsProvider().embed(['x']), /Ollama 500/);
  });

  it('lève si le nombre de vecteurs ne correspond pas aux entrées', async () => {
    globalThis.fetch = async () => ({ ok: true, json: async () => ({ embeddings: [[1]] }) });
    await assert.rejects(() => new OllamaEmbeddingsProvider().embed(['x', 'y']), /inattendue/);
  });

  it('retourne [] sans appel réseau pour une liste vide', async () => {
    globalThis.fetch = async () => { throw new Error('ne devrait pas être appelé'); };
    assert.deepEqual(await new OllamaEmbeddingsProvider().embed([]), []);
  });
});
