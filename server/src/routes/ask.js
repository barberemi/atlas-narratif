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

/**
 * Portées (« scope ») exposées au chat → types de passages correspondants.
 * 'all' (ou inconnu) = pas de filtre. Doit rester aligné avec les chips de
 * ChatPanel et l'enum du validateur `ask`.
 */
export const SCOPE_TYPES = {
  characters:   ['character'],
  locations:    ['location'],
  objects:      ['object'],
  events:       ['event'],
  plot:         ['beat', 'plant', 'thread', 'hero'],
  notes:        ['note'],
  incoherences: ['incoherence'],
  custom:       ['custom'],
};

// Libellés lisibles des étapes du Voyage du héros (les clés brutes comme
// « inmost_cave » sont illisibles dans une réponse). Aligné sur HERO_STAGES
// (src/data/hero_journey_config.js), dupliqué ici car le serveur n'importe pas src/.
const HERO_STAGE_LABELS = {
  ordinary_world: 'Monde Ordinaire', call_to_adventure: "Appel à l'Aventure",
  refusal: "Refus de l'Appel", mentor: 'Rencontre du Mentor', threshold: 'Franchissement du Seuil',
  tests: 'Épreuves & Alliés', inmost_cave: 'Approche de la Caverne', ordeal: 'Épreuve Suprême',
  reward: 'Récompense', road_back: 'Chemin du Retour', resurrection: 'Résurrection',
  return_with_elixir: "Retour avec l'Élixir",
};

/**
 * Construit les passages candidats à partir de TOUTES les sources du projet
 * (« chat sur tout ») : entités natives + custom, timeline, structure (STC,
 * plants, fils, Voyage du héros), notes, incohérences. Chaque passage porte un
 * `type` (→ filtrage par portée). Le warm-up embedde l'ensemble une fois.
 */
async function buildContext(projectId) {
  const [characters, locations, objects, customEntities, events, stc, plants, threads, hero, incoherences, notes] = await Promise.all([
    q.getCharacters(projectId),
    q.getLocations(projectId),
    q.getObjects(projectId),
    q.getCustomEntities(projectId),
    q.getTimelineEvents(projectId),
    q.getStcChapters(projectId),
    q.getPlants(projectId),
    q.getThreads(projectId),
    q.getHeroJourneyEntries(projectId),
    q.getIncoherences(projectId),
    q.getChapterNotes(projectId),
  ]);
  const passages = [];
  const push = (id, type, name, parts) => {
    const text = parts.filter(Boolean).join(' — ');
    if (name || text) passages.push({ id, type, name: name ?? '', text });
  };
  for (const c of characters)     push(c.id, 'character', c.name, [c.description, (c.aliases ?? []).join(', '), c.role]);
  for (const l of locations)      push(l.id, 'location', l.name, [l.description, l.type]);
  for (const o of objects)        push(o.id, 'object', o.name, [o.description, o.currentHolder ? `détenu par ${o.currentHolder}` : null]);
  for (const e of customEntities) push(e.id, 'custom', e.name, [e.description, (e.aliases ?? []).join(', ')]);
  for (const ev of events)        push(ev.id, 'event', ev.title, [ev.chapter != null ? `Chapitre ${ev.chapter}` : null, ev.description, ev.sceneGoal, ev.sceneConflict, ev.sceneOutcome]);
  for (const ch of stc)           push(ch.id, 'beat', ch.title ? `Chapitre ${ch.number} — ${ch.title}` : `Chapitre ${ch.number}`, [ch.summary]);
  for (const p of plants)         push(p.id, 'plant', p.label, [`amorce/payoff (${p.type ?? ''}, ${p.status ?? ''})`, p.plantChapterNum != null ? `plant ch.${p.plantChapterNum}` : null, p.payoffChapterNum != null ? `payoff ch.${p.payoffChapterNum}` : null, p.notes]);
  for (const t of threads)        push(t.id, 'thread', t.name, [`fil narratif (${t.role ?? ''})`, t.description]);
  for (const h of hero)           push(h.id, 'hero', `Voyage du héros — ${HERO_STAGE_LABELS[h.stageKey] ?? h.stageKey}`, [h.chapterNum != null ? `chapitre ${h.chapterNum}` : null, h.summary]);
  for (const inc of incoherences) push(inc.id, 'incoherence', inc.title, [`incohérence (${inc.severity ?? ''}${inc.resolved ? ', résolue' : ''})`, inc.explanation, inc.resolutionNote]);
  for (const [chapterNum, content] of Object.entries(notes ?? {})) push(`note_ch${chapterNum}`, 'note', `Note chapitre ${chapterNum}`, [content]);
  return passages;
}

// Cache des passages construits, PAR PROJET (TTL court). buildContext refait 11
// requêtes SQL + déchiffre tout le projet → coûteux à répéter à chaque question.
// Invalidé explicitement à chaque mutation (cf. invalidateContext, appelé par un
// middleware sur les écritures) ; le TTL borne la péremption en filet de sécurité.
const _ctxCache = new Map(); // projectId → { at, passages }
const CTX_TTL_MS = 60_000;

async function buildContextCached(projectId) {
  const hit = _ctxCache.get(projectId);
  if (hit && Date.now() - hit.at < CTX_TTL_MS) return hit.passages;
  const passages = await buildContext(projectId);
  _ctxCache.set(projectId, { at: Date.now(), passages });
  return passages;
}

/** Vide le cache de contexte d'un projet (à appeler après toute mutation de données). */
export function invalidateContext(projectId) { _ctxCache.delete(projectId); }

/** Restreint les passages à une portée (type). 'all'/inconnu → tout. */
function filterByScope(passages, scope) {
  const types = SCOPE_TYPES[scope];
  return types ? passages.filter(p => types.includes(p.type)) : passages;
}

// Portée « dominante » d'un ensemble de passages classés → sert d'INDICE à l'UI
// (« recherche surtout dans : X »), ne restreint JAMAIS rien. Basé sur les
// RÉSULTATS réels du retrieval → indépendant de la langue de la question
// (FR/EN/ZH) et plus fidèle qu'une devinette par mots-clés.
const TYPE_TO_SCOPE = Object.fromEntries(
  Object.entries(SCOPE_TYPES).flatMap(([scope, types]) => types.map(t => [t, scope])),
);

/** Portée majoritaire parmi les passages classés (≥ 2 du même type), sinon null. */
export function dominantScope(ranked) {
  const counts = {};
  for (const p of ranked ?? []) {
    const s = TYPE_TO_SCOPE[p.type];
    if (s) counts[s] = (counts[s] ?? 0) + 1;
  }
  let best = null, bestN = 0;
  for (const [s, n] of Object.entries(counts)) if (n > bestN) { best = s; bestN = n; }
  return bestN >= 2 ? best : null;
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
/**
 * Garantit que TOUS les passages ont leur vecteur en cache : n'embedde (rôle
 * 'document') que les passages absents du cache. Idempotent → un 2e appel avec le
 * même contenu ne déclenche aucun appel réseau. Partagé par semanticRank (requête
 * utilisateur) et warmupProject (pré-chauffe). Retourne de quoi relire le cache.
 */
async function ensurePassageVectors(projectId, passages, provider) {
  const model = provider.model ?? provider.name;
  const keyOf = (h) => `${projectId}::${model}::${h}`;
  const hashById = new Map();
  const missing = [];
  for (const p of passages) {
    const h = hashText(passageText(p));
    hashById.set(p.id, h);
    if (!_embCache.has(keyOf(h))) missing.push(p);
  }
  if (missing.length) {
    const docVecs = await provider.embed(missing.map(passageText), 'document');
    missing.forEach((p, i) => embCacheSet(keyOf(hashById.get(p.id)), docVecs[i]));
  }
  return { keyOf, hashById, warmed: missing.length };
}

async function semanticRank(projectId, question, passages, topK) {
  const provider = getEmbeddingsProvider();
  if (!provider.enabled || passages.length === 0) return null;

  // Passages (rôle 'document') et question (rôle 'query') embeddés EN PARALLÈLE :
  // indépendants, préfixes de tâche différents (cf. embeddings.js) → on économise
  // un aller-retour réseau (≈ la latence du plus lent au lieu de la somme).
  const [{ keyOf, hashById }, [queryVec]] = await Promise.all([
    ensurePassageVectors(projectId, passages, provider),
    provider.embed([question], 'query'),
  ]);

  const vecById = new Map();
  for (const p of passages) vecById.set(p.id, _embCache.get(keyOf(hashById.get(p.id))));
  return rankByVectors(passages, queryVec, vecById, topK);
}

/**
 * Pré-chauffe le cache d'embeddings d'un projet SANS appel LLM ni question :
 * embedde tous ses passages une fois, pour que la 1re vraie question ne paie pas
 * le cold-start Ollama (chargement modèle + embedding de tous les passages, qui
 * peut prendre ~30 s sur CPU contraint). Déclenché à l'ouverture du chat.
 * No-op si les embeddings sont désactivés. Idempotent (cache par hash de contenu).
 */
export async function warmupProject(projectId) {
  const provider = getEmbeddingsProvider();
  if (!provider.enabled) return { enabled: false, warmed: 0, total: 0 };
  const passages = await buildContextCached(projectId);
  const { warmed } = await ensurePassageVectors(projectId, passages, provider);
  return { enabled: true, warmed, total: passages.length };
}

/** Fusionne deux listes de passages en préservant l'ordre et sans doublon (cap). */
export function mergeUnique(lists, cap) {
  const seen = new Set();
  const out = [];
  for (const p of lists.flat()) {
    if (p && !seen.has(p.id)) { seen.add(p.id); out.push(p); if (out.length >= cap) break; }
  }
  return out;
}

/**
 * @param {{ projectId, question, scope?, history?, topK? }} params
 *   history: tours récents du fil [{role:'user'|'bot', text}] (mémoire conversationnelle)
 * @returns {Promise<{ answer, citations, provider, retrieval, scope, guessedScope, context }>}
 */
export async function answerAsk({ projectId, question, scope = 'all', history = [], topK = 8 }) {
  // Requête de RETRIEVAL enrichie du contexte récent : « et qui le possède ? »
  // seul ne retrouve rien ; préfixé des derniers tours utilisateur, il retrouve
  // « Cor de Gondor ». (Le LLM, lui, reçoit l'historique complet ci-dessous.)
  const recent = (history ?? []).slice(-6);
  const recentUser = recent.filter(m => m.role === 'user').map(m => m.text).slice(-2);
  const retrievalQuery = [...recentUser, question].join('\n');

  // Cache : la clé inclut l'historique récent (une même question dans deux fils
  // distincts n'a pas la même réponse).
  const cacheKey = `${projectId}::${scope}::${hashText(retrievalQuery)}::${hashText(question)}`;
  const cached = cacheGet(cacheKey);
  if (cached) return { ...cached, cached: true };

  const t0 = Date.now();
  const allPassages = await buildContextCached(projectId);
  const passages = filterByScope(allPassages, scope);
  const tCtx = Date.now();

  // Retrieval HYBRIDE : sémantique (embeddings) pour la pertinence + lexical pour
  // garantir les correspondances EXACTES de nom (« Cor de Gondor »), que le
  // sémantique peut noyer parmi 250 passages. Le lexical est placé en tête (slots
  // réservés) puis complété par le sémantique jusqu'à topK.
  let ranked = null;
  let retrieval = 'keyword';
  try {
    const semantic = await semanticRank(projectId, retrievalQuery, passages, topK);
    if (semantic) {
      retrieval = 'hybrid';
      const lexical = keywordRank(passages, retrievalQuery, 3);
      ranked = mergeUnique([lexical, semantic], topK);
    }
  } catch {
    ranked = null; // embeddings indisponibles → repli lexical, jamais de crash
  }
  if (!ranked) ranked = keywordRank(passages, retrievalQuery, topK);
  const tRetrieval = Date.now();

  const provider = getProvider();
  const { answer, citations, degraded } = await provider.ask({ question, context: ranked, history: recent });
  const tLlm = Date.now();

  // En portée « all », on remonte le type dominant des passages classés → simple
  // INDICE pour l'UI (indépendant de la langue, basé sur les résultats réels).
  const guessedScope = scope === 'all' ? dominantScope(ranked) : null;

  // Répartition du temps → indispensable pour savoir quel poste optimiser
  // (contexte DB / retrieval embeddings / appel LLM). Une ligne par requête.
  console.log(`[ask] ${retrieval} · scope=${scope} · ${passages.length}/${allPassages.length} passages · ctx=${tCtx - t0}ms retrieval=${tRetrieval - tCtx}ms llm=${tLlm - tRetrieval}ms total=${tLlm - t0}ms · provider=${provider.name}${degraded ? ' (degraded)' : ''}`);

  const result = { answer, citations, provider: provider.name, retrieval, scope, guessedScope, degraded: degraded ?? false, context: ranked.map(p => ({ id: p.id, name: p.name, type: p.type })) };
  cacheSet(cacheKey, result);
  return result;
}
