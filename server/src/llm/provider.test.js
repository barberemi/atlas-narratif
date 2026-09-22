import { describe, it, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://atlas:atlas_dev@localhost:5432/atlas';

const { MockProvider, OpenAICompatibleProvider, getProvider, _resetProvider } = await import('./provider.js');

describe('MockProvider', () => {
  it('cite les passages de contexte fournis', async () => {
    const r = await new MockProvider().ask({
      question: 'Qui est Frodo ?',
      context: [{ id: 'char_frodo', name: 'Frodo', text: 'Hobbit porteur.' }],
    });
    assert.equal(r.provider, 'mock');
    assert.deepEqual(r.citations, ['char_frodo']);
    assert.match(r.answer, /Frodo/);
  });

  it('répond « rien trouvé » sans contexte', async () => {
    const r = await new MockProvider().ask({ question: 'x', context: [] });
    assert.deepEqual(r.citations, []);
  });
});

describe('OpenAICompatibleProvider', () => {
  const savedFetch = globalThis.fetch;
  const savedEnv = { ...process.env };
  afterEach(() => { globalThis.fetch = savedFetch; process.env = { ...savedEnv }; });

  it('sans base_url/clé → repli mock (jamais de crash)', async () => {
    delete process.env.LLM_BASE_URL; delete process.env.LLM_API_KEY;
    const r = await new OpenAICompatibleProvider().ask({ question: 'x', context: [{ id: 'a', name: 'A', text: 't' }] });
    assert.equal(r.provider, 'mock');
  });

  it('appelle l\'endpoint OpenAI-compatible et extrait la réponse + citations', async () => {
    process.env.LLM_BASE_URL = 'https://api.example.com';
    process.env.LLM_API_KEY = 'k';
    globalThis.fetch = async () => ({
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Frodo est un hobbit [char_frodo].' } }] }),
    });
    const r = await new OpenAICompatibleProvider().ask({ question: 'qui', context: [{ id: 'char_frodo', name: 'Frodo', text: 'hobbit' }] });
    assert.equal(r.provider, 'hosted');
    assert.match(r.answer, /hobbit/);
    assert.deepEqual(r.citations, ['char_frodo']);
  });

  it('erreur API → repli mock avec drapeau degraded', async () => {
    process.env.LLM_BASE_URL = 'https://api.example.com';
    process.env.LLM_API_KEY = 'k';
    globalThis.fetch = async () => ({ ok: false, status: 500, text: async () => 'boom' });
    const r = await new OpenAICompatibleProvider().ask({ question: 'q', context: [{ id: 'a', name: 'A', text: 't' }] });
    assert.equal(r.degraded, true);
    assert.equal(r.provider, 'mock');
  });

  it('inclut reasoning_effort quand LLM_REASONING_EFFORT est défini', async () => {
    process.env.LLM_BASE_URL = 'https://api.example.com';
    process.env.LLM_API_KEY = 'k';
    process.env.LLM_REASONING_EFFORT = 'none';
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'ok [a]' } }] }) };
    };
    await new OpenAICompatibleProvider().ask({ question: 'q', context: [{ id: 'a', name: 'A', text: 't' }] });
    assert.equal(sentBody.reasoning_effort, 'none');
  });

  it('n\'envoie PAS reasoning_effort si l\'env est absente (endpoints qui rejettent le champ)', async () => {
    process.env.LLM_BASE_URL = 'https://api.example.com';
    process.env.LLM_API_KEY = 'k';
    delete process.env.LLM_REASONING_EFFORT;
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'ok [a]' } }] }) };
    };
    await new OpenAICompatibleProvider().ask({ question: 'q', context: [{ id: 'a', name: 'A', text: 't' }] });
    assert.ok(!('reasoning_effort' in sentBody));
  });

  it('injecte l\'historique comme messages (bot→assistant, user→user) avant la question', async () => {
    process.env.LLM_BASE_URL = 'https://api.example.com';
    process.env.LLM_API_KEY = 'k';
    let sentBody = null;
    globalThis.fetch = async (url, opts) => {
      sentBody = JSON.parse(opts.body);
      return { ok: true, json: async () => ({ choices: [{ message: { content: 'ok [a]' } }] }) };
    };
    await new OpenAICompatibleProvider().ask({
      question: 'et qui le possède ?',
      context: [{ id: 'a', name: 'A', text: 't' }],
      history: [{ role: 'user', text: 'le cor de gondor ?' }, { role: 'bot', text: 'Porté par Boromir.' }],
    });
    const roles = sentBody.messages.map(m => m.role);
    assert.deepEqual(roles, ['system', 'user', 'assistant', 'user']);
    assert.match(sentBody.messages[1].content, /cor de gondor/);
    assert.match(sentBody.messages[3].content, /et qui le poss/); // question courante en dernier
  });
});

describe('getProvider', () => {
  const savedEnv = { ...process.env };
  before(() => _resetProvider());
  after(() => { process.env = { ...savedEnv }; _resetProvider(); });

  it('défaut = mock', () => {
    delete process.env.LLM_PROVIDER; _resetProvider();
    assert.equal(getProvider().name, 'mock');
  });

  it('hosted sans clé → mock (reflète l\'état réel)', () => {
    process.env.LLM_PROVIDER = 'hosted'; delete process.env.LLM_API_KEY; _resetProvider();
    assert.equal(getProvider().name, 'mock');
  });

  it('hosted avec base_url + clé → hosted', () => {
    process.env.LLM_PROVIDER = 'groq';
    process.env.LLM_BASE_URL = 'https://api.groq.com/openai';
    process.env.LLM_API_KEY = 'k';
    _resetProvider();
    assert.equal(getProvider().name, 'hosted');
  });
});
