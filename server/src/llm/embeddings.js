/**
 * Abstraction fournisseur d'EMBEDDINGS pour le retrieval sémantique du chat
 * (niveau 2 — RAG). Optionnel et enfichable, comme `provider.js` pour le LLM.
 *
 * Interface : provider.embed(texts: string[]) → Promise<number[][]> (un vecteur
 * par entrée, même ordre). `provider.enabled` indique si le retrieval sémantique
 * doit être tenté ; sinon `routes/ask.js` reste sur le score par mots-clés.
 *
 * Sélection via env `EMBEDDINGS_PROVIDER` :
 *   - 'none' (défaut) : NullEmbeddingsProvider (désactivé → repli mots-clés).
 *   - 'ollama'        : Ollama en local (CPU), aucun tiers, aligné privacy.
 *                       `OLLAMA_BASE_URL` (défaut http://localhost:11434),
 *                       `OLLAMA_EMBED_MODEL` (défaut paraphrase-multilingual —
 *                       multilingue, adapté au contenu FR ; nomic-embed-text est
 *                       surtout anglophone et donne de moins bons résultats en FR).
 *
 * Aucune dépendance npm (fetch natif). Toute erreur/timeout fait échouer embed()
 * → l'appelant retombe sur le retrieval lexical (jamais de crash utilisateur).
 * Les vecteurs ne sont jamais persistés (cache mémoire dans ask.js) : rien n'est
 * écrit au repos, la garantie de chiffrement du projet est préservée.
 */

/** Similarité cosinus entre deux vecteurs de même dimension. */
export function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/** Provider désactivé : le retrieval sémantique n'est pas tenté. */
class NullEmbeddingsProvider {
  get name() { return 'none'; }
  get model() { return 'none'; }
  get enabled() { return false; }
  async embed() { throw new Error('embeddings disabled'); }
}

// nomic-embed-text (et modèles compatibles) exigent des préfixes de tâche, sinon
// les similarités sont incohérentes. On les applique par défaut, surchargeables.
function defaultPrefixes(model) {
  const isNomic = /nomic/i.test(model);
  return {
    query: process.env.OLLAMA_QUERY_PREFIX ?? (isNomic ? 'search_query: ' : ''),
    document: process.env.OLLAMA_DOC_PREFIX ?? (isNomic ? 'search_document: ' : ''),
  };
}

/** Embeddings via un serveur Ollama local (endpoint `/api/embed`). */
class OllamaEmbeddingsProvider {
  constructor() {
    this.baseUrl = (process.env.OLLAMA_BASE_URL || 'http://localhost:11434').replace(/\/+$/, '');
    this.model   = process.env.OLLAMA_EMBED_MODEL || 'paraphrase-multilingual';
    this.timeout = Number(process.env.EMBEDDINGS_TIMEOUT_MS) || 30_000;
    this.prefixes = defaultPrefixes(this.model);
  }
  get name() { return 'ollama'; }
  get enabled() { return true; }

  /**
   * @param {string[]} texts
   * @param {'query'|'document'} [kind='document'] rôle → préfixe de tâche
   * @returns {Promise<number[][]>}
   */
  async embed(texts, kind = 'document') {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    const prefix = this.prefixes[kind] ?? '';
    const input = texts.map(t => `${prefix}${t}`);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);
    try {
      const res = await fetch(`${this.baseUrl}/api/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: this.model, input }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => '');
        throw new Error(`Ollama ${res.status}: ${detail.slice(0, 200)}`);
      }
      const j = await res.json();
      const vectors = j.embeddings;
      if (!Array.isArray(vectors) || vectors.length !== texts.length) {
        throw new Error('Ollama: réponse embeddings inattendue');
      }
      return vectors;
    } finally {
      clearTimeout(timer);
    }
  }
}

let _cached = null;

/** Retourne le provider d'embeddings sélectionné par `EMBEDDINGS_PROVIDER`. */
export function getEmbeddingsProvider() {
  if (_cached) return _cached;
  const kind = (process.env.EMBEDDINGS_PROVIDER || 'none').toLowerCase();
  _cached = kind === 'ollama' ? new OllamaEmbeddingsProvider() : new NullEmbeddingsProvider();
  return _cached;
}

/** Réinitialise le cache (tests). */
export function _resetEmbeddingsProvider() { _cached = null; }

export { NullEmbeddingsProvider, OllamaEmbeddingsProvider };
