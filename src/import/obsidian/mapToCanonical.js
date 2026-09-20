/**
 * Notes Obsidian parsées → JSON canonique (le modèle de analysis_prompt.js),
 * réutilisable par seedProjectViaApi → POST /api/seed.
 *
 * Pipeline : classifier chaque note (narrative scène/chapitre → typé lore → type
 * custom) → générer un ID stable → mapper les champs (fieldMap) → résoudre les
 * wikilinks / listes d'entités en IDs → produire { data, report } où report liste
 * les liens cassés et champs non mappés.
 *
 * Notes narratives :
 *   - `type: scène`    → 1 événement timelineDB (+ eventExtras : pov/beat/threads/goal…)
 *   - `type: chapitre` → 1 entrée chaptersDB (Save the Cat)
 * event_entities = union du frontmatter (personnages/lieux/objets) ET des
 * wikilinks [[...]] du corps. Multi-tome via frontmatter `tome`/`volume` → volumesDB.
 */

import { mapField, mapSceneField, classifyType, classifyNarrative, normalizeKey, FIELD_SYNONYMS } from './fieldMap';

/** Clés canoniques du noyau typé proposables dans l'écran de mapping (hors `name`). */
export const CANONICAL_FIELDS = Object.keys(FIELD_SYNONYMS).filter(k => k !== 'name');

/**
 * Recense les champs (frontmatter + inline) rencontrés sur les notes de lore/custom
 * — pas les notes narratives (scène/chapitre, vocabulaire fixe). Pour chaque clé :
 * un exemple de valeur, le nombre de notes concernées et la cible auto devinée.
 * Alimente l'écran « Ajuster le mapping ».
 * @returns {Array<{ key, normKey, sample, count, guess }>}
 */
export function collectFields(notes) {
  const acc = new Map();
  for (const note of notes) {
    if (classifyNarrative(note)) continue;
    const raw = { ...note.frontmatter, ...note.inlineFields };
    for (const [key, value] of Object.entries(raw)) {
      const normKey = normalizeKey(key);
      if (['title', 'name', 'tags', 'type'].includes(normKey)) continue;
      if (!acc.has(normKey)) {
        const sample = Array.isArray(value) ? value.join(', ') : String(value ?? '');
        acc.set(normKey, { key, normKey, sample: sample.slice(0, 60), count: 0, guess: mapField(key) });
      }
      acc.get(normKey).count += 1;
    }
  }
  return [...acc.values()].sort((a, b) => b.count - a.count || a.key.localeCompare(b.key));
}

const PREFIX = { character: 'char', location: 'loc', object: 'obj', custom: 'cent' };

function slugify(str) {
  return String(str ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 40) || 'x';
}

function asArray(v) {
  if (Array.isArray(v)) return v.filter(Boolean);
  if (v == null || v === '') return [];
  return String(v).split(',').map(s => s.trim()).filter(Boolean);
}

/** Retire l'enrobage wikilink d'un nom : "[[Cible|alias]]" → "Cible". */
function stripLink(name) {
  const s = String(name ?? '').trim();
  const m = /^\[\[([^\]|#]+)(?:[#|][^\]]*)?\]\]$/.exec(s);
  return (m ? m[1] : s).trim();
}

function toInt(v) {
  const n = parseInt(String(v ?? '').trim(), 10);
  return Number.isFinite(n) ? n : null;
}

/**
 * @param {Array} notes  - sortie de parseVault()
 * @param {Object} options
 * @returns {{ data, report }}
 */
export function mapToCanonical(notes, options = {}) {
  // overrideMap : clé de champ normalisée → cible imposée par l'utilisateur.
  //   valeur canonique (ex. 'race')  → forcer ce champ du noyau typé
  //   '__custom'                      → forcer en champ custom (couche 2)
  //   '__ignore'                      → ignorer le champ
  //   (absente)                       → auto (mapField)
  const overrideMap = options.overrideMap ?? {};
  const report = { brokenLinks: [], unmappedFields: [], counts: {}, customTypes: [] };

  // Garantit des ids uniques : deux notes homonymes (ou 2 chapitres même
  // numéro/tome) sinon collisionnent → INSERT en double → seed en échec.
  const usedIds = new Set();
  const uniqueId = (base) => {
    let id = base, n = 2;
    while (usedIds.has(id)) id = `${base}_${n++}`;
    usedIds.add(id);
    return id;
  };

  // 1re passe : classifier (narrative > typé > custom) + indexer les entités.
  const index = new Map(); // titre normalisé → { id, entityType, customTypeLabel }
  const enriched = notes.map(note => {
    const kind = classifyNarrative(note); // 'scene'|'chapter'|null
    if (kind) return { note, kind };

    const coreType = classifyType(note); // 'character'|'location'|'object'|null
    const entityType = coreType ?? 'custom';
    const customTypeLabel = coreType == null
      ? (note.frontmatter.type || note.folder || 'Divers')
      : null;
    const id = uniqueId(`${PREFIX[entityType]}_${slugify(note.title)}`);
    index.set(normalizeKey(note.title), { id, entityType, customTypeLabel });
    return { note, kind: null, id, entityType, coreType, customTypeLabel };
  });

  const characters = [];
  const locations = [];
  const objects = [];
  const customTypesById = new Map(); // typeId → { id, label, fieldSchema:Set }
  const customEntities = [];
  const timelineDB = [];
  const eventExtrasDB = {};
  const chaptersDB = [];

  // ── Volumes (multi-tome) ────────────────────────────────────────────────────
  // Registre partagé scènes/chapitres. Résout une valeur `tome`/`volume` (numéro
  // ou nom) en { id, number }, en créant le volume à la première rencontre.
  const volumesById = new Map(); // volumeId → { id, number, title }
  let volumeSeq = 0;
  const resolveVolume = (raw) => {
    const label = stripLink(raw);
    if (!label) return null;
    const numeric = toInt(label);
    const id = `vol_${slugify(label)}`;
    if (!volumesById.has(id)) {
      volumeSeq += 1;
      const number = numeric ?? volumeSeq;
      const title = numeric != null ? `Tome ${numeric}` : label;
      volumesById.set(id, { id, number, title });
    }
    return id;
  };

  // Relations explicites (Niveau 3) dérivées des wikilinks résolus entre entités.
  const relations = [];
  const relSeen = new Set();
  const resolveLinks = (note, fromId, fromType) => {
    for (const link of note.wikilinks) {
      const hit = index.get(normalizeKey(link.target));
      if (!hit) { report.brokenLinks.push({ from: note.title, target: link.target }); continue; }
      if (hit.id === fromId) continue;
      const key = `${fromId}::${hit.id}`;
      if (relSeen.has(key)) continue;
      relSeen.add(key);
      relations.push({
        sourceId: fromId, sourceType: fromType,
        targetId: hit.id, targetType: hit.entityType,
        label: null, directed: false, source: 'obsidian',
      });
    }
  };

  // Résout un nom (frontmatter) ou wikilink en hit d'index ; signale les cassés.
  const resolveEntity = (rawName, fromTitle) => {
    const clean = stripLink(rawName);
    if (!clean) return null;
    const hit = index.get(normalizeKey(clean));
    if (!hit) { report.brokenLinks.push({ from: fromTitle, target: clean }); return null; }
    return hit;
  };

  // ── Passe entités (lore + custom) ────────────────────────────────────────────
  for (const item of enriched) {
    if (item.kind) continue; // notes narratives traitées plus bas
    const { note, id, entityType, coreType, customTypeLabel } = item;
    const rawFields = { ...note.frontmatter, ...note.inlineFields };
    const mapped = {};
    const customFields = {};
    for (const [key, value] of Object.entries(rawFields)) {
      const nk = normalizeKey(key);
      if (['title', 'name', 'tags', 'type'].includes(nk)) continue;
      const override = overrideMap[nk];
      if (override === '__ignore') continue;
      // Cible : override utilisateur (si champ du noyau) sinon auto (mapField).
      let canonical = null;
      if (override === '__custom') canonical = null;
      else if (override && coreType) canonical = override;
      else if (coreType) canonical = mapField(key);
      if (canonical) {
        mapped[canonical] = ['aliases', 'affiliations', 'traits', 'inhabitants', 'powers'].includes(canonical)
          ? asArray(value) : value;
      } else {
        customFields[key] = value;
        report.unmappedFields.push({ note: note.title, field: key });
      }
    }

    const base = {
      id,
      name: note.title,
      description: mapped.description ?? note.body?.slice(0, 500) ?? '',
      aliases: mapped.aliases ?? [],
      customFields,
    };
    resolveLinks(note, id, entityType);

    if (coreType === 'character') {
      characters.push({ ...base, race: mapped.race ?? null, role: mapped.role ?? null, origin: mapped.origin ?? null, affiliations: mapped.affiliations ?? [], traits: mapped.traits ?? [] });
    } else if (coreType === 'location') {
      locations.push({ ...base, type: mapped.type ?? null, regime: mapped.regime ?? null, inhabitants: mapped.inhabitants ?? [] });
    } else if (coreType === 'object') {
      objects.push({ ...base, type: mapped.type ?? null, creator: mapped.creator ?? null, currentHolder: mapped.currentHolder ?? null, powers: mapped.powers ?? [] });
    } else {
      const typeId = `ctype_${slugify(customTypeLabel)}`;
      if (!customTypesById.has(typeId)) {
        customTypesById.set(typeId, { id: typeId, label: customTypeLabel, icon: null, color: null, fieldSchema: new Set() });
      }
      Object.keys(customFields).filter(k => k !== '__links').forEach(k => customTypesById.get(typeId).fieldSchema.add(k));
      customEntities.push({ id, typeId, name: note.title, aliases: base.aliases, description: base.description, customFields });
    }
  }

  // ── Passe chapitres (avant les scènes : les scènes empruntent le titre) ───────
  const chapterTitleByKey = new Map(); // `${volumeId}|${number}` → title
  for (const { note, kind } of enriched) {
    if (kind !== 'chapter') continue;
    const raw = { ...note.frontmatter, ...note.inlineFields };
    const sf = {};
    for (const [key, value] of Object.entries(raw)) {
      if (['title', 'name', 'tags', 'type'].includes(normalizeKey(key))) continue;
      const canonical = mapSceneField(key);
      if (canonical) sf[canonical] = value;
      else report.unmappedFields.push({ note: note.title, field: key });
    }
    const number = toInt(sf.number ?? sf.chapter) ?? (chaptersDB.length + 1);
    const volumeId = sf.volume != null ? resolveVolume(sf.volume) : null;
    const title = note.title;
    const beats = [...asArray(sf.beat)];
    chaptersDB.push({
      id: uniqueId(`ch_${number}${volumeId ? `_${slugify(volumeId)}` : ''}`),
      number,
      title,
      summary: sf.description != null ? String(sf.description) : (note.body?.slice(0, 500) || null),
      volumeId,
      beats,
    });
    chapterTitleByKey.set(`${volumeId ?? ''}|${number}`, title);
  }

  // ── Passe scènes → événements timeline + event_entities + extras ─────────────
  for (const { note, kind } of enriched) {
    if (kind !== 'scene') continue;
    const raw = { ...note.frontmatter, ...note.inlineFields };
    const sf = {};
    for (const [key, value] of Object.entries(raw)) {
      if (['title', 'name', 'tags', 'type'].includes(normalizeKey(key))) continue;
      const canonical = mapSceneField(key);
      if (canonical) sf[canonical] = value;
      else report.unmappedFields.push({ note: note.title, field: key });
    }

    const chapter = toInt(sf.chapter) ?? 1;
    const sceneOrder = toInt(sf.sceneOrder) ?? 0;
    const volumeId = sf.volume != null ? resolveVolume(sf.volume) : null;

    // event_entities : union frontmatter (personnages/lieux/objets) + wikilinks corps.
    const entityMap = new Map(); // id → { id, entityType }
    const addEntity = (hit) => { if (hit) entityMap.set(hit.id, { id: hit.id, entityType: hit.entityType }); };
    for (const nm of [...asArray(sf.characters), ...asArray(sf.locations), ...asArray(sf.objects)]) {
      addEntity(resolveEntity(nm, note.title));
    }
    for (const link of note.wikilinks) addEntity(resolveEntity(link.target, note.title));

    // POV → personnage ; lieu (1er) → locationId. Ajoutés aussi aux entities.
    let povCharacterId = null;
    if (sf.pov != null) {
      const hit = resolveEntity(sf.pov, note.title);
      if (hit) { addEntity(hit); if (hit.entityType === 'character') povCharacterId = hit.id; }
    }
    let locationId = null;
    if (sf.location != null) {
      const first = asArray(sf.location)[0];
      const hit = resolveEntity(first, note.title);
      if (hit) { addEntity(hit); if (hit.entityType === 'location') locationId = hit.id; }
    }

    const id = uniqueId(`evt_${slugify(note.title)}`);
    const chapterTitle = chapterTitleByKey.get(`${volumeId ?? ''}|${chapter}`) ?? '';
    timelineDB.push({
      id,
      chapter,
      chapterTitle,
      title: note.title,
      description: sf.description != null ? String(sf.description) : (note.body?.slice(0, 500) || null),
      locationId,
      volumeId,
      isFlashback: false,
      entities: [...entityMap.values()],
      _volNumber: volumeId ? (volumesById.get(volumeId)?.number ?? 0) : 0,
    });

    // Extras consommés par le seeder via eventExtrasDB[evt.id].
    const ex = { sceneOrder, threadIds: asArray(sf.threads) };
    if (sf.beat != null) ex.beatId = asArray(sf.beat)[0] ?? null;
    if (povCharacterId) ex.povCharacterId = povCharacterId;
    if (sf.sceneGoal != null) ex.sceneGoal = String(sf.sceneGoal);
    if (sf.sceneConflict != null) ex.sceneConflict = String(sf.sceneConflict);
    if (sf.sceneOutcome != null) ex.sceneOutcome = String(sf.sceneOutcome);
    eventExtrasDB[id] = ex;
  }

  // Tri stable : tome, chapitre, ordre de scène. Puis on retire le champ interne.
  timelineDB.sort((a, b) =>
    (a._volNumber - b._volNumber) ||
    (a.chapter - b.chapter) ||
    ((eventExtrasDB[a.id]?.sceneOrder ?? 0) - (eventExtrasDB[b.id]?.sceneOrder ?? 0)),
  );
  timelineDB.forEach(e => { delete e._volNumber; });
  chaptersDB.sort((a, b) => a.number - b.number);

  const volumesDB = [...volumesById.values()].sort((a, b) => a.number - b.number);

  const customTypesDB = [...customTypesById.values()].map(t => ({
    id: t.id, label: t.label, icon: t.icon, color: t.color,
    fieldSchema: [...t.fieldSchema].map(key => ({ key, label: key, type: 'text' })),
  }));

  report.counts = {
    characters: characters.length,
    locations: locations.length,
    objects: objects.length,
    customEntities: customEntities.length,
    customTypes: customTypesDB.length,
    relations: relations.length,
    scenes: timelineDB.length,
    chapters: chaptersDB.length,
    volumes: volumesDB.length,
  };
  report.customTypes = customTypesDB.map(t => t.label);

  const data = {
    loreDB: { characters, locations, objects },
    customTypesDB,
    customEntitiesDB: customEntities,
    relationsDB: relations,
    timelineDB,
    eventExtrasDB,
    chaptersDB,
    volumesDB,
  };

  return { data, report };
}
