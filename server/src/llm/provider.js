/**
 * Abstraction fournisseur LLM pour le chat de requête (niveau 2 — RAG).
 *
 * Interface : provider.ask({ question, context }) → { answer, citations, provider }.
 *   - context : passages { id, type, name, text } déjà déchiffrés (voir routes/ask.js).
 *   - citations : ids de context effectivement cités dans la réponse.
 *
 * Sélection via env `LLM_PROVIDER` :
 *   - 'mock' (défaut) : réponses simulées, aucune clé requise.
 *   - 'hosted' | 'groq' | 'openrouter' | 'openai' | 'gemini' : endpoint
 *     OpenAI-compatible (`${LLM_BASE_URL}/v1/chat/completions`), clé `LLM_API_KEY`.
 *
 * Un seul provider hébergé couvre Groq / OpenRouter / Gemini / Mistral / vLLM…
 * Repli automatique sur le mock si pas de base_url/clé ou en cas d'erreur/timeout
 * → l'UI ne casse jamais. Aucune dépendance npm (fetch natif).
 */

const HOSTED_KINDS = new Set(['hosted', 'groq', 'openrouter', 'openai', 'gemini', 'mistral', 'local']);

/** Réponse structurée déterministe à partir du contexte (aucun réseau). */
class MockProvider {
  get name() { return 'mock'; }

  async ask({ question, context = [] }) {
    if (context.length === 0) {
      return { provider: this.name, answer: "Je n'ai trouvé aucun élément pertinent dans le projet pour répondre à cette question.", citations: [] };
    }
    const top = context.slice(0, 3);
    const names = top.map(c => c.name).filter(Boolean);
    const answer =
      `D'après le projet, voici ce qui concerne « ${question.trim()} » : ` +
      top.map(c => `${c.name ? `${c.name} — ` : ''}${(c.text ?? '').slice(0, 160)}`).join(' | ') +
      (names.length ? ` (sources : ${names.join(', ')}).` : '.') +
      ' [réponse simulée — provider=mock]';
    return { provider: this.name, answer, citations: top.map(c => c.id) };
  }
}

/** Provider OpenAI-compatible (Groq et cie). */
class OpenAICompatibleProvider {
  constructor() {
    this.baseUrl = (process.env.LLM_BASE_URL || '').replace(/\/+$/, '');
    this.apiKey  = process.env.LLM_API_KEY || '';
    this.model   = process.env.LLM_MODEL || 'qwen/qwen3.8-27b';
    this.timeout = Number(process.env.LLM_TIMEOUT_MS) || 60_000;
    this.maxTokens = Number(process.env.LLM_MAX_TOKENS) || 512;
    // Modèles « à raisonnement » (Qwen3, DeepSeek-R1…) : le thinking est activé par
    // défaut → une longue chaîne <think> avant la réponse, très coûteuse en tokens
    // et en temps. Envoyé UNIQUEMENT si LLM_REASONING_EFFORT est défini, pour ne pas
    // faire échouer (400) les endpoints qui ignorent ce champ. 'none' coupe le
    // thinking sur Groq/Qwen3 ; autres valeurs possibles : 'low' | 'medium' | 'high'.
    this.reasoningEffort = process.env.LLM_REASONING_EFFORT || '';
    this._mock = new MockProvider();
  }
  get name() { return 'hosted'; }

  async ask({ question, context = [], history = [] }) {
    // Repli gracieux si mal configuré : jamais de crash pour l'utilisateur.
    if (!this.baseUrl || !this.apiKey) return this._mock.ask({ question, context });

    const ctx = context.map(c => `[${c.id}] ${c.name ? `${c.name}: ` : ''}${c.text ?? ''}`).join('\n');
    // Historique de conversation → le modèle résout les références (« le », « il »,
    // « et qui le possède ? »). Borné et tronqué pour garder le prompt raisonnable.
    const priorMessages = (history ?? []).slice(-8).map(m => ({
      role: m.role === 'bot' ? 'assistant' : 'user',
      content: String(m.text ?? '').slice(0, 2000),
    })).filter(m => m.content);
    const messages = [
      { role: 'system', content: "Tu réponds à des questions sur un projet narratif, UNIQUEMENT à partir du CONTEXTE fourni. Appuie-toi sur l'historique de la conversation pour résoudre les références (pronoms, « le/la », sujet implicite). Cite entre crochets les identifiants [id] des passages utilisés. Si le contexte ne contient pas la réponse, dis-le clairement. Sois concis." },
      ...priorMessages,
      { role: 'user', content: `CONTEXTE :\n${ctx || '(vide)'}\n\nQUESTION : ${question}` },
    ];

    const body = { model: this.model, messages, temperature: 0.2, max_tokens: this.maxTokens };
    if (this.reasoningEffort) body.reasoning_effort = this.reasoningEffort;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(`${this.baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.apiKey}` },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`LLM ${res.status}: ${detail.slice(0, 200)}`);
      }
      const j = await res.json();
      const answer = j.choices?.[0]?.message?.content?.trim() || '';
      if (!answer) return this._mock.ask({ question, context });
      const citations = context.filter(c => answer.includes(c.id)).map(c => c.id);
      return { provider: this.name, model: this.model, answer, citations };
    } catch (err) {
      // Timeout / réseau / erreur API → repli mock + drapeau pour le debug serveur.
      const fallback = await this._mock.ask({ question, context });
      return { ...fallback, degraded: true, error: String(err.message ?? err) };
    } finally {
      clearTimeout(timer);
    }
  }
}

let _cached = null;

/** Retourne le provider sélectionné par `LLM_PROVIDER` (défaut mock). */
export function getProvider() {
  if (_cached) return _cached;
  const kind = (process.env.LLM_PROVIDER || 'mock').toLowerCase();
  const hostedReady = HOSTED_KINDS.has(kind) && process.env.LLM_BASE_URL && process.env.LLM_API_KEY;
  _cached = hostedReady ? new OpenAICompatibleProvider() : new MockProvider();
  return _cached;
}

/** Réinitialise le cache (tests). */
export function _resetProvider() { _cached = null; }

export { MockProvider, OpenAICompatibleProvider };
