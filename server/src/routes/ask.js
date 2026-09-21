/**
 * Chat de requête — Niveau 2 (RAG) côté serveur.
 *
 * `answerAsk({ projectId, question })` :
 *   1. Récupère les entités du projet (db-queries → déchiffrées via la DEK).
 *   2. Construit des passages de contexte et sélectionne les plus pertinents :
 *      retrieval SÉMANTIQUE (embeddings, si `EMBEDDINGS_PROVIDER` activé — voir
 *      llm/embeddings.js) avec repli LEXICAL (recouvrement de mots) automatique.
 *   3. Délègue au provider LLM sélectionné (mock par défaut) → réponse citée.
 *
 * Le contexte est déchiffré EN MÉMOIRE juste avant l'appel provider ; rien n'est
 * renvoyé au client hormis la réponse + les ids cités. Les vecteurs d'embedding
 * sont mis en cache EN MÉMOIRE uniquement (jamais persistés → rien au repos).
 */

import * as q from '../db-queries.js';
import { getProvider } from '../llm/provider.js';
import { getEmbeddingsProvider, cosineSimilarity } from '../llm/embeddings.js';

// ── Rate-limit + cache en mémoire (par process) ──────────────────────────────
// TODO(multi-instance) : déplacer vers Redis si plusieurs répliques serveur.
const RL_MAX = Number(process.env.LLM_RATE_LIMIT_PER_MIN) || 20;
const RL_WINDOW_MS = 60_000;
const _hits = new Map();   // projectId → number[] (timestamps ms)
const _cache = new Map();  // `${projectId}::${question}` → { at, result }
const CACHE_TTL_MS = 10 * 60_000;

/** true si la requête est autorisée (sous le quota) ; enregistre le hit. */
export function checkRateLimit(projectId, now = Date.now()) {
  const arr = (_hits.get(projectId) ?? []).filter(t => now - t < RL_WINDOW_MS);
  if (arr.length >= RL_MAX) { _hits.set(projectId, arr); return false; }
  arr.push(now);
  _hits.set(projectId, arr);
  return true;
}

function cacheGet(key, now = Date.now()) {
  const hit = _cache.get(key);
  if (hit && now - hit.at < CACHE_TTL_MS) return hit.result;
  if (hit) _cache.delete(key);
  return null;
}
function cacheSet(key, result, now = Date.now()) { _cache.set(key, { at: now, result }); }

function norm(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Découpe une question en mots significatifs (≥ 3 caractères). */
function keywords(question) {
  return [...new Set(norm(question).split(/[^a-z0-9]+/).filter(w => w.length >= 3))];
}

/** Construit les passages candidats à partir des entités du projet. */
async function buildContext(projectId) {
  const [characters, locations, objects, customEntities] = await Promise.all([
    q.getCharacters(projectId),
    q.getLocations(projectId),
    q.getObjects(projectId),
    q.getCustomEntities(projectId),
  ]);
  const passages = [];
  for (const c of characters) passages.push({ id: c.id, type: 'character', name: c.name, text: [c.description, (c.aliases ?? []).join(', '), c.role].filter(Boolean).join(' — ') });
  for (const l of locations) passages.push({ id: l.id, type: 'location', name: l.name, text: [l.description, l.type].filter(Boolean).join(' — ') });
  for (const o of objects) passages.push({ id: o.id, type: 'object', name: o.name, text: [o.description, o.currentHolder ? `détenu par ${o.currentHolder}` : null].filter(Boolean).join(' — ') });
  for (const e of customEntities) passages.push({ id: e.id, type: 'custom', name: e.name, text: [e.description, (e.aliases ?? []).join(', ')].filter(Boolean).join(' — ') });
  return passages;
}

/** Score un passage par recouvrement de mots-clés avec la question. */
function scorePassage(passage, kws) {
  const hay = norm(`${passage.name} ${passage.text}`);
  return kws.reduce((s, kw) => s + (hay.includes(kw) ? 1 : 0), 0);
}

/** Retrieval lexical (déterministe, aucun réseau). */
function keywordRank(passages, question, topK) {
  const kws = keywords(question);
  return passages
    .map(p => ({ p, score: scorePassage(p, kws) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(x => x.p);
}

// ── Retrieval sémantique (embeddings) ────────────────────────────────────────
// Cache mémoire des vecteurs (jamais persisté → rien au repos). Invalidé
// automatiquement à l'édition : la clé inclut un hash du texte du passage.
const _embCache = new Map(); // `${projectId}::${model}::${hash}` → number[]
const EMB_CACHE_CAP = 5000;

function hashText(s) {
  const str = String(s ?? '');
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) >>> 0;
  return h.toString(36);
}
const passageText = (p) => `${p.name ?? ''}\n${p.text ?? ''}`;

function embCacheSet(key, vec) {
  _embCache.set(key, vec);
  while (_embCache.size > EMB_CACHE_CAP) _embCache.delete(_embCache.keys().next().value);
}

/** Classe les passages par similarité cosinus décroissante (pur, testable). */
export function rankByVectors(passages, queryVec, vecById, topK) {
  return passages
    .filter(p => vecById.get(p.id))
    .map(p => ({ p, score: cosineSimilarity(queryVec, vecById.get(p.id)) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(x => x.p);
}

/**
 * Retrieval sémantique via embeddings. Retourne null si le provider est
 * désactivé (→ repli lexical). Toute erreur réseau/timeout se propage (l'appelant
 * retombe sur le lexical). Un seul appel embed() par requête (question + passages
 * en cache-miss), l'ordre des vecteurs étant préservé.
 */
async function semanticRank(projectId, question, passages, topK) {
  const provider = getEmbeddingsProvider();
  if (!provider.enabled || passages.length === 0) return null;
  const model = provider.model ?? provider.name;
  const keyOf = (h) => `${projectId}::${model}::${h}`;

  const hashById = new Map();
  const missing = [];
  for (const p of passages) {
    const h = hashText(passageText(p));
    hashById.set(p.id, h);
    if (!_embCache.has(keyOf(h))) missing.push(p);
  }

  // Deux appels : la question (rôle 'query') et les passages en cache-miss
  // (rôle 'document') — les préfixes de tâche diffèrent (cf. embeddings.js).
  // Lancés EN PARALLÈLE : indépendants, on économise un aller-retour réseau
  // (≈ la latence du plus lent au lieu de la somme des deux).
  const [[queryVec], docVecs] = await Promise.all([
    provider.embed([question], 'query'),
    missing.length ? provider.embed(missing.map(passageText), 'document') : Promise.resolve([]),
  ]);
  missing.forEach((p, i) => embCacheSet(keyOf(hashById.get(p.id)), docVecs[i]));

  const vecById = new Map();
  for (const p of passages) vecById.set(p.id, _embCache.get(keyOf(hashById.get(p.id))));
  return rankByVectors(passages, queryVec, vecById, topK);
}

/**
 * @param {{ projectId: string, question: string, topK?: number }} params
 * @returns {Promise<{ answer, citations, provider, context }>}
 */
export async function answerAsk({ projectId, question, topK = 5 }) {
  // Cache : mêmes (projet, question) → réponse instantanée, aucun appel LLM.
  const cacheKey = `${projectId}::${question.trim().toLowerCase()}`;
  const cached = cacheGet(cacheKey);
  if (cached) return { ...cached, cached: true };

  const t0 = Date.now();
  const passages = await buildContext(projectId);
  const tCtx = Date.now();

  // Retrieval sémantique (embeddings) si activé, sinon/en cas d'échec → lexical.
  let ranked = null;
  let retrieval = 'keyword';
  try {
    ranked = await semanticRank(projectId, question, passages, topK);
    if (ranked) retrieval = 'semantic';
  } catch {
    ranked = null; // embeddings indisponibles → repli lexical, jamais de crash
  }
  if (!ranked) ranked = keywordRank(passages, question, topK);
  const tRetrieval = Date.now();

  const provider = getProvider();
  const { answer, citations, degraded } = await provider.ask({ question, context: ranked });
  const tLlm = Date.now();

  // Répartition du temps → indispensable pour savoir quel poste optimiser
  // (contexte DB / retrieval embeddings / appel LLM). Une ligne par requête.
  console.log(`[ask] ${retrieval} · ${passages.length} passages · ctx=${tCtx - t0}ms retrieval=${tRetrieval - tCtx}ms llm=${tLlm - tRetrieval}ms total=${tLlm - t0}ms · provider=${provider.name}${degraded ? ' (degraded)' : ''}`);

  const result = { answer, citations, provider: provider.name, retrieval, degraded: degraded ?? false, context: ranked.map(p => ({ id: p.id, name: p.name, type: p.type })) };
  cacheSet(cacheKey, result);
  return result;
}
