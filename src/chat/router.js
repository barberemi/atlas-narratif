/**
 * Chat de requête — Niveau 1 : routeur déterministe, SANS IA.
 *
 * `answerQuery(question, data)` interprète des intentions simples (qui / où /
 * quoi / chapitre) et répond en parcourant les données du projet déjà chargées
 * dans les stores. Pur (aucun effet de bord) → entièrement testable.
 *
 * data = { characters, locations, objects, events, customEntities, customTypes }
 * Retour : { intent, answer, matches } (matches = entités/événements cités).
 */

function norm(s) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

/**
 * Enrobe un nom d'entité en wikilink `[[Nom]]` → rendu cliquable par AnswerText
 * (même traitement que les citations du niveau 2). Le nom brut reste présent en
 * sous-chaîne, donc la réponse reste lisible même sans rendu enrichi.
 */
const wiki = (name) => `[[${name}]]`;

/** Résout une entité (perso/lieu/objet/custom) par nom ou alias. */
export function resolveEntity(name, data) {
  const q = norm(name);
  if (!q) return null;
  const pools = [
    ['character', data.characters ?? []],
    ['location', data.locations ?? []],
    ['object', data.objects ?? []],
    ['custom', data.customEntities ?? []],
  ];
  // Passe 1 : égalité exacte nom/alias.
  for (const [type, pool] of pools) {
    const hit = pool.find(e => norm(e.name) === q || (e.aliases ?? []).some(a => norm(a) === q));
    if (hit) return { type, entity: hit };
  }
  // Passe 2 : inclusion.
  for (const [type, pool] of pools) {
    const hit = pool.find(e => norm(e.name).includes(q) || (e.aliases ?? []).some(a => norm(a).includes(q)));
    if (hit) return { type, entity: hit };
  }
  return null;
}

/** Événements impliquant un personnage, triés par chapitre. */
function eventsForCharacter(charId, events) {
  return (events ?? [])
    .filter(e => (e.entities ?? []).some(en => en.id === charId))
    .sort((a, b) => (a.chapter ?? 0) - (b.chapter ?? 0));
}

export function answerQuery(question, data = {}) {
  const q = norm(question);
  if (!q) return { intent: 'empty', answer: 'Posez une question sur votre projet.', matches: [] };

  // ── Intent : événements d'un chapitre ────────────────────────────────────────
  const chapMatch = /(?:chapitre|chapter|chap\.?|ch\.?)\s*(\d+)/.exec(q);
  if (chapMatch) {
    const n = Number(chapMatch[1]);
    const evts = (data.events ?? []).filter(e => Number(e.chapter) === n);
    if (evts.length === 0) return { intent: 'chapter', answer: `Aucun événement trouvé au chapitre ${n}.`, matches: [] };
    return {
      intent: 'chapter',
      answer: `Au chapitre ${n} : ${evts.map(e => e.title).join(' ; ')}.`,
      matches: evts,
    };
  }

  // Extrait un nom d'entité candidat depuis la question (dernier segment après un mot-clé).
  const nameMatch = /(?:qui est|who is|c'est qui|où est|ou est|où se trouve|where is|objets? (?:de|of|porté[es]? par|held by)|que porte|porte)\s+(.+?)\??$/.exec(q);
  const candidateName = nameMatch ? nameMatch[1] : null;

  // ── Intent : où est X ────────────────────────────────────────────────────────
  if (/\b(où est|ou est|où se trouve|where is)\b/.test(q) && candidateName) {
    const res = resolveEntity(candidateName, data);
    if (!res) return { intent: 'where', answer: `Je ne trouve pas « ${candidateName} » dans le projet.`, matches: [] };
    if (res.type === 'character') {
      const evts = eventsForCharacter(res.entity.id, data.events).filter(e => e.locationId);
      const last = evts[evts.length - 1];
      if (last) {
        const loc = (data.locations ?? []).find(l => l.id === last.locationId);
        return { intent: 'where', answer: `${wiki(res.entity.name)} est vu·e pour la dernière fois à ${loc ? wiki(loc.name) : 'un lieu inconnu'} (chapitre ${last.chapter}).`, matches: [res.entity, ...(loc ? [loc] : [])] };
      }
      return { intent: 'where', answer: `Aucun lieu connu pour ${wiki(res.entity.name)} (aucun événement localisé).`, matches: [res.entity] };
    }
    return { intent: 'where', answer: `${wiki(res.entity.name)} est un·e ${res.type}, pas un personnage localisable par trajet.`, matches: [res.entity] };
  }

  // ── Intent : objets portés par X ─────────────────────────────────────────────
  if (/\bobjets?\b|\bporte\b|\bcarries\b|\bheld by\b/.test(q) && candidateName) {
    const res = resolveEntity(candidateName, data);
    if (!res) return { intent: 'objects', answer: `Je ne trouve pas « ${candidateName} » dans le projet.`, matches: [] };
    const held = (data.objects ?? []).filter(o => norm(o.currentHolder) === norm(res.entity.name));
    if (held.length === 0) return { intent: 'objects', answer: `${wiki(res.entity.name)} ne détient aucun objet référencé.`, matches: [res.entity] };
    return { intent: 'objects', answer: `${wiki(res.entity.name)} détient : ${held.map(o => wiki(o.name)).join(', ')}.`, matches: held };
  }

  // ── Intent : qui est X ───────────────────────────────────────────────────────
  if (/\b(qui est|who is|c'est qui)\b/.test(q) && candidateName) {
    const res = resolveEntity(candidateName, data);
    if (!res) return { intent: 'who', answer: `Je ne trouve pas « ${candidateName} » dans le projet.`, matches: [] };
    const e = res.entity;
    const bits = [e.description, (e.aliases ?? []).length ? `Alias : ${e.aliases.join(', ')}.` : null].filter(Boolean);
    return { intent: 'who', answer: `${wiki(e.name)} — ${bits.join(' ') || 'aucune description.'}`, matches: [e] };
  }

  // ── Fallback : recherche libre par nom ───────────────────────────────────────
  const res = resolveEntity(question, data);
  if (res) {
    const e = res.entity;
    return { intent: 'lookup', answer: `${wiki(e.name)} (${res.type}) — ${e.description ?? 'aucune description.'}`, matches: [e] };
  }

  return { intent: 'unknown', answer: "Je ne sais pas répondre à cette question avec les données du projet. Essayez « qui est … », « où est … », « quels objets porte … » ou « chapitre N ».", matches: [] };
}
