/**
 * Couche d'accès aux données — serveur Atlas Narratif
 *
 * Équivalent serveur de src/db/queries.js (frontend PGlite).
 * Utilise postgres.js tagged templates. Pas de paramètre `db` — toutes les
 * fonctions utilisent l'import global `sql`.
 */

import { randomUUID } from 'crypto';
import sql from './db.js';
import { encrypt, decrypt, getProjectDek } from './crypto.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Clause SQL statique — marque les entités importées comme "modified" après édition.
 * SÉCURITÉ : cette chaîne ne doit JAMAIS contenir de variable ou d'entrée utilisateur.
 */
const SOURCE_CASE = `source = CASE WHEN source='import' THEN 'modified' ELSE source END`;

function makeId(prefix, projectId) {
  // Suffixe aléatoire court en plus du timestamp : évite les collisions de clé
  // primaire quand deux insertions tombent dans la même milliseconde.
  const rand = randomUUID().slice(0, 8);
  return `${prefix}_${projectId}_${Date.now()}_${rand}`;
}

/**
 * postgres.js retourne le JSONB déjà parsé, mais on protège contre les cas
 * où la valeur serait encore une chaîne (migration, colonnes TEXT, etc.).
 */
function parseJ(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return fallback; }
  }
  return value;
}

// ── Volumes ───────────────────────────────────────────────────────────────────

export async function getVolumes(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM volumes WHERE project_id = ${projectId} ORDER BY number
  `;
  return rows.map(r => ({
    id:          r.id,
    number:      r.number,
    title:       decrypt(r.title, dek),
    description: decrypt(r.description, dek) ?? null,
  }));
}

export async function insertVolume(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('vol', projectId);
  await sql`
    INSERT INTO volumes (id, project_id, number, title, description)
    VALUES (${id}, ${projectId}, ${data.number}, ${encrypt(data.title, dek)}, ${encrypt(data.description ?? null, dek)})
  `;
  return id;
}

export async function updateVolume(volumeId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE volumes
    SET number = ${data.number}, title = ${encrypt(data.title, dek)}, description = ${encrypt(data.description ?? null, dek)}
    WHERE id = ${volumeId} AND project_id = ${projectId}
  `;
}

export async function deleteVolume(volumeId, projectId) {
  const [entity] = await sql`SELECT * FROM volumes WHERE id = ${volumeId} AND project_id = ${projectId}`;
  if (!entity) return null;
  // Capture IDs of entities referencing this volume (SET NULL, not DELETE)
  const events = (await sql`SELECT id FROM timeline_events WHERE volume_id = ${volumeId} AND project_id = ${projectId}`).map(r => r.id);
  const chapters = (await sql`SELECT id FROM stc_chapters WHERE volume_id = ${volumeId} AND project_id = ${projectId}`).map(r => r.id);
  const heroEntries = (await sql`SELECT id FROM hero_journey_entries WHERE volume_id = ${volumeId} AND project_id = ${projectId}`).map(r => r.id);
  const plantsByPlant = (await sql`SELECT id FROM plant_payoffs WHERE plant_volume_id = ${volumeId} AND project_id = ${projectId}`).map(r => r.id);
  const plantsByPayoff = (await sql`SELECT id FROM plant_payoffs WHERE payoff_volume_id = ${volumeId} AND project_id = ${projectId}`).map(r => r.id);

  // SET NULL on all references
  if (events.length) await sql`UPDATE timeline_events SET volume_id = NULL WHERE id = ANY(${events}) AND project_id = ${projectId}`;
  if (chapters.length) await sql`UPDATE stc_chapters SET volume_id = NULL WHERE id = ANY(${chapters}) AND project_id = ${projectId}`;
  if (heroEntries.length) await sql`UPDATE hero_journey_entries SET volume_id = NULL WHERE id = ANY(${heroEntries}) AND project_id = ${projectId}`;
  if (plantsByPlant.length) await sql`UPDATE plant_payoffs SET plant_volume_id = NULL WHERE id = ANY(${plantsByPlant}) AND project_id = ${projectId}`;
  if (plantsByPayoff.length) await sql`UPDATE plant_payoffs SET payoff_volume_id = NULL WHERE id = ANY(${plantsByPayoff}) AND project_id = ${projectId}`;

  await sql`DELETE FROM volumes WHERE id = ${volumeId} AND project_id = ${projectId}`;

  return { entity, refs: { events, chapters, heroEntries, plantsByPlant, plantsByPayoff } };
}

export async function restoreVolume(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO volumes (id, project_id, number, title, description)
    VALUES (${e.id}, ${projectId}, ${e.number}, ${e.title}, ${e.description ?? null})
    ON CONFLICT DO NOTHING
  `;
  const refs = snapshot.refs ?? {};
  if (refs.events?.length) await sql`UPDATE timeline_events SET volume_id = ${e.id} WHERE id = ANY(${refs.events}) AND project_id = ${projectId}`;
  if (refs.chapters?.length) await sql`UPDATE stc_chapters SET volume_id = ${e.id} WHERE id = ANY(${refs.chapters}) AND project_id = ${projectId}`;
  if (refs.heroEntries?.length) await sql`UPDATE hero_journey_entries SET volume_id = ${e.id} WHERE id = ANY(${refs.heroEntries}) AND project_id = ${projectId}`;
  if (refs.plantsByPlant?.length) await sql`UPDATE plant_payoffs SET plant_volume_id = ${e.id} WHERE id = ANY(${refs.plantsByPlant}) AND project_id = ${projectId}`;
  if (refs.plantsByPayoff?.length) await sql`UPDATE plant_payoffs SET payoff_volume_id = ${e.id} WHERE id = ANY(${refs.plantsByPayoff}) AND project_id = ${projectId}`;
}

// ── Personnages ───────────────────────────────────────────────────────────────

export async function getCharacters(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM characters WHERE project_id = ${projectId} ORDER BY id
  `;
  return rows.map(r => ({
    id:           r.id,
    name:         decrypt(r.name, dek),
    aliases:      parseJ(decrypt(r.aliases, dek), []),
    origin:       decrypt(r.origin, dek),
    description:  decrypt(r.description, dek),
    color:        r.color,
    journeyKey:   r.journey_key,
    race:         decrypt(r.race, dek)         ?? null,
    role:         decrypt(r.role, dek)         ?? null,
    affiliations: parseJ(decrypt(r.affiliations, dek), []),
    traits:       parseJ(decrypt(r.traits, dek), []),
    deathEventId: r.death_event_id ?? null,
    customFields: parseJ(decrypt(r.custom_fields, dek), {}),
    source:       r.source ?? 'import',
  })).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export async function findCharacterByName(search, projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM characters WHERE project_id = ${projectId}
  `;
  const lower = search.toLowerCase();
  const r = rows.find(row => {
    const name = (decrypt(row.name, dek) ?? '').toLowerCase();
    const aliases = parseJ(decrypt(row.aliases, dek), []);
    return name.includes(lower) || aliases.some(a => String(a).toLowerCase().includes(lower));
  });
  if (!r) return null;
  return {
    id:      r.id,
    name:    decrypt(r.name, dek),
    aliases: parseJ(decrypt(r.aliases, dek), []),
  };
}

export async function insertCharacter(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('char', projectId);
  await sql`
    INSERT INTO characters
      (id, project_id, name, aliases, race, role, affiliations, traits,
       origin, description, color, death_event_id, custom_fields, source)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.name, dek)},
      ${encrypt(data.aliases ?? [], dek)},
      ${encrypt(data.race        ?? null, dek)},
      ${encrypt(data.role        ?? null, dek)},
      ${encrypt(data.affiliations ?? [], dek)},
      ${encrypt(data.traits       ?? [], dek)},
      ${encrypt(data.origin      ?? null, dek)},
      ${encrypt(data.description ?? null, dek)},
      ${data.color       ?? '#64748b'},
      ${data.deathEventId ?? null},
      ${encrypt(data.customFields ?? {}, dek)},
      'manual'
    )
  `;
  return id;
}

export async function updateCharacter(charId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE characters SET
      name         = ${encrypt(data.name, dek)},
      aliases      = ${encrypt(data.aliases ?? [], dek)},
      race         = ${encrypt(data.race        ?? null, dek)},
      role         = ${encrypt(data.role        ?? null, dek)},
      affiliations = ${encrypt(data.affiliations ?? [], dek)},
      traits       = ${encrypt(data.traits       ?? [], dek)},
      origin       = ${encrypt(data.origin      ?? null, dek)},
      description  = ${encrypt(data.description ?? null, dek)},
      color        = ${data.color       ?? '#64748b'},
      death_event_id = ${data.deathEventId ?? null},
      custom_fields = ${encrypt(data.customFields ?? {}, dek)},
      ${sql.unsafe(SOURCE_CASE)}
    WHERE id = ${charId} AND project_id = ${projectId}
  `;
}

export async function deleteCharacter(charId, projectId) {
  const [entity] = await sql`SELECT * FROM characters WHERE id = ${charId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const eventEntities = await sql`SELECT * FROM event_entities WHERE entity_id = ${charId} AND project_id = ${projectId}`;
  const charGroups = await sql`SELECT * FROM character_groups WHERE character_id = ${charId} AND project_id = ${projectId}`;
  const axes = await sql`SELECT * FROM character_arc_axes WHERE character_id = ${charId} AND project_id = ${projectId}`;
  const axisIds = axes.map(a => a.id);
  const arcPoints = axisIds.length
    ? await sql`SELECT * FROM character_arc_points WHERE axis_id = ANY(${axisIds}) AND project_id = ${projectId}`
    : [];
  const heroEntries = await sql`SELECT * FROM hero_journey_entries WHERE character_id = ${charId} AND project_id = ${projectId}`;

  await sql`DELETE FROM event_entities WHERE entity_id = ${charId} AND project_id = ${projectId}`;
  await sql`DELETE FROM character_groups WHERE character_id = ${charId} AND project_id = ${projectId}`;
  if (axisIds.length) {
    await sql`DELETE FROM character_arc_points WHERE axis_id = ANY(${axisIds}) AND project_id = ${projectId}`;
  }
  await sql`DELETE FROM character_arc_axes WHERE character_id = ${charId} AND project_id = ${projectId}`;
  await sql`DELETE FROM hero_journey_entries WHERE character_id = ${charId} AND project_id = ${projectId}`;
  await sql`DELETE FROM characters WHERE id = ${charId} AND project_id = ${projectId}`;

  return { entity, eventEntities, charGroups, axes, arcPoints, heroEntries };
}

export async function restoreCharacter(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO characters (id, project_id, name, aliases, race, role, affiliations, traits, origin, description, color, journey_key, death_event_id, custom_fields, source)
    VALUES (${e.id}, ${projectId}, ${e.name}, ${e.aliases ?? []}, ${e.race ?? null}, ${e.role ?? null},
            ${e.affiliations ?? []}, ${e.traits ?? []}, ${e.origin ?? null}, ${e.description ?? null},
            ${e.color ?? '#64748b'}, ${e.journey_key ?? null}, ${e.death_event_id ?? null}, ${e.custom_fields ?? null}, ${e.source ?? 'import'})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.eventEntities ?? [])) {
    await sql`INSERT INTO event_entities (event_id, project_id, entity_id, entity_type) VALUES (${r.event_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
  for (const r of (snapshot.charGroups ?? [])) {
    await sql`INSERT INTO character_groups (character_id, group_id, project_id, role_in_group) VALUES (${r.character_id}, ${r.group_id}, ${projectId}, ${r.role_in_group ?? null}) ON CONFLICT DO NOTHING`;
  }
  for (const r of (snapshot.axes ?? [])) {
    await sql`INSERT INTO character_arc_axes (id, project_id, character_id, label, color) VALUES (${r.id}, ${projectId}, ${r.character_id}, ${r.label}, ${r.color}) ON CONFLICT DO NOTHING`;
  }
  for (const r of (snapshot.arcPoints ?? [])) {
    await sql`INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note, volume_id) VALUES (${projectId}, ${r.axis_id}, ${r.chapter_num}, ${r.value}, ${r.note ?? null}, ${r.volume_id ?? null}) ON CONFLICT DO NOTHING`;
  }
  for (const r of (snapshot.heroEntries ?? [])) {
    await sql`INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id) VALUES (${r.id}, ${projectId}, ${r.stage_key}, ${r.character_id ?? null}, ${r.chapter_num ?? null}, ${r.summary ?? null}, ${r.volume_id ?? null}) ON CONFLICT DO NOTHING`;
  }
}

// ── Lieux ─────────────────────────────────────────────────────────────────────

export async function getLocations(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM locations WHERE project_id = ${projectId} ORDER BY id
  `;
  return rows.map(r => ({
    id:          r.id,
    name:        decrypt(r.name, dek),
    type:        decrypt(r.type, dek),
    regime:      decrypt(r.regime, dek),
    description: decrypt(r.description, dek),
    coordinates: parseJ(r.coordinates, null),
    inhabitants: parseJ(decrypt(r.inhabitants, dek), []),
    visitedBy:   parseJ(decrypt(r.visited_by, dek), []),
    keyPlaces:   parseJ(decrypt(r.key_places, dek), []),
    customFields: parseJ(decrypt(r.custom_fields, dek), {}),
    source:      r.source ?? 'import',
  })).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export async function insertLocation(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('loc', projectId);
  await sql`
    INSERT INTO locations
      (id, project_id, name, type, regime, description, inhabitants, visited_by, key_places, custom_fields, source)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.name, dek)},
      ${encrypt(data.type        ?? null, dek)},
      ${encrypt(data.regime      ?? null, dek)},
      ${encrypt(data.description ?? null, dek)},
      ${encrypt(data.inhabitants ?? [], dek)},
      ${encrypt(data.visitedBy   ?? [], dek)},
      ${encrypt(data.keyPlaces   ?? [], dek)},
      ${encrypt(data.customFields ?? {}, dek)},
      'manual'
    )
  `;
  return id;
}

export async function updateLocation(locId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE locations SET
      name        = ${encrypt(data.name, dek)},
      type        = ${encrypt(data.type        ?? null, dek)},
      regime      = ${encrypt(data.regime      ?? null, dek)},
      description = ${encrypt(data.description ?? null, dek)},
      inhabitants = ${encrypt(data.inhabitants ?? [], dek)},
      visited_by  = ${encrypt(data.visitedBy   ?? [], dek)},
      key_places  = ${encrypt(data.keyPlaces   ?? [], dek)},
      custom_fields = ${encrypt(data.customFields ?? {}, dek)},
      ${sql.unsafe(SOURCE_CASE)}
    WHERE id = ${locId} AND project_id = ${projectId}
  `;
}

export async function deleteLocation(locId, projectId) {
  const [entity] = await sql`SELECT * FROM locations WHERE id = ${locId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const eventEntities = await sql`SELECT * FROM event_entities WHERE entity_id = ${locId} AND project_id = ${projectId}`;

  await sql`DELETE FROM event_entities WHERE entity_id = ${locId} AND project_id = ${projectId}`;
  await sql`DELETE FROM locations WHERE id = ${locId} AND project_id = ${projectId}`;

  return { entity, eventEntities };
}

export async function restoreLocation(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO locations (id, project_id, name, type, regime, description, coordinates, inhabitants, visited_by, key_places, custom_fields, source)
    VALUES (${e.id}, ${projectId}, ${e.name}, ${e.type ?? null}, ${e.regime ?? null}, ${e.description ?? null},
            ${e.coordinates ?? null}, ${e.inhabitants ?? []}, ${e.visited_by ?? []}, ${e.key_places ?? []}, ${e.custom_fields ?? null}, ${e.source ?? 'import'})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.eventEntities ?? [])) {
    await sql`INSERT INTO event_entities (event_id, project_id, entity_id, entity_type) VALUES (${r.event_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
}

// ── Objets ────────────────────────────────────────────────────────────────────

export async function getObjects(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM objects WHERE project_id = ${projectId} ORDER BY id
  `;
  return rows.map(r => ({
    id:                     r.id,
    name:                   decrypt(r.name, dek),
    type:                   decrypt(r.type, dek),
    description:            decrypt(r.description, dek),
    creator:                decrypt(r.creator, dek),
    currentHolder:          decrypt(r.current_holder, dek),
    powers:                 parseJ(decrypt(r.powers, dek), []),
    holders:                parseJ(r.holders, []),
    createdIn:              r.created_in ?? null,
    inscription:            decrypt(r.inscription, dek) ?? null,
    status:                 r.status ?? 'active',
    statusChangedAtChapter: r.status_changed_at_chapter ?? null,
    customFields:           parseJ(decrypt(r.custom_fields, dek), {}),
    source:                 r.source ?? 'import',
  })).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export async function insertObject(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('obj', projectId);
  await sql`
    INSERT INTO objects
      (id, project_id, name, type, description, creator, current_holder,
       powers, holders, created_in, inscription, status, status_changed_at_chapter, custom_fields, source)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.name, dek)},
      ${encrypt(data.type           ?? null, dek)},
      ${encrypt(data.description    ?? null, dek)},
      ${encrypt(data.creator        ?? null, dek)},
      ${encrypt(data.currentHolder  ?? null, dek)},
      ${encrypt(data.powers   ?? [], dek)},
      ${data.holders  ?? []},
      ${data.createdIn      ?? null},
      ${encrypt(data.inscription    ?? null, dek)},
      ${data.status         ?? 'active'},
      ${data.statusChangedAtChapter ?? null},
      ${encrypt(data.customFields ?? {}, dek)},
      'manual'
    )
  `;
  return id;
}

export async function updateObject(objId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE objects SET
      name                    = ${encrypt(data.name, dek)},
      type                    = ${encrypt(data.type          ?? null, dek)},
      description             = ${encrypt(data.description   ?? null, dek)},
      creator                 = ${encrypt(data.creator        ?? null, dek)},
      current_holder          = ${encrypt(data.currentHolder ?? null, dek)},
      powers                  = ${encrypt(data.powers   ?? [], dek)},
      holders                 = ${data.holders  ?? []},
      created_in              = ${data.createdIn     ?? null},
      inscription             = ${encrypt(data.inscription   ?? null, dek)},
      status                  = ${data.status        ?? 'active'},
      status_changed_at_chapter = ${data.statusChangedAtChapter ?? null},
      custom_fields           = ${encrypt(data.customFields ?? {}, dek)},
      ${sql.unsafe(SOURCE_CASE)}
    WHERE id = ${objId} AND project_id = ${projectId}
  `;
}

export async function deleteObject(objId, projectId) {
  const [entity] = await sql`SELECT * FROM objects WHERE id = ${objId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const eventEntities = await sql`SELECT * FROM event_entities WHERE entity_id = ${objId} AND project_id = ${projectId}`;

  await sql`DELETE FROM event_entities WHERE entity_id = ${objId} AND project_id = ${projectId}`;
  await sql`DELETE FROM objects WHERE id = ${objId} AND project_id = ${projectId}`;

  return { entity, eventEntities };
}

export async function restoreObject(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO objects (id, project_id, name, type, description, creator, current_holder, powers, holders, created_in, inscription, status, status_changed_at_chapter, custom_fields, source)
    VALUES (${e.id}, ${projectId}, ${e.name}, ${e.type ?? null}, ${e.description ?? null}, ${e.creator ?? null},
            ${e.current_holder ?? null}, ${e.powers ?? []}, ${e.holders ?? []}, ${e.created_in ?? null},
            ${e.inscription ?? null}, ${e.status ?? 'active'}, ${e.status_changed_at_chapter ?? null}, ${e.custom_fields ?? null}, ${e.source ?? 'import'})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.eventEntities ?? [])) {
    await sql`INSERT INTO event_entities (event_id, project_id, entity_id, entity_type) VALUES (${r.event_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
}

// ── Types d'entités custom (couche 3) ─────────────────────────────────────────
// `label` est chiffré (contenu utilisateur) ; `field_schema` reste en JSONB clair
// (métadonnée structurelle, introspectable). icon/color/base_behavior en clair.

export async function getCustomTypes(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM custom_entity_types WHERE project_id = ${projectId} ORDER BY id
  `;
  return rows.map(r => ({
    id:           r.id,
    label:        decrypt(r.label, dek),
    icon:         r.icon ?? null,
    color:        r.color ?? '#64748b',
    fieldSchema:  parseJ(r.field_schema, []),
    baseBehavior: r.base_behavior ?? 'entity',
    source:       r.source ?? 'import',
  })).sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));
}

export async function insertCustomType(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('ctype', projectId);
  await sql`
    INSERT INTO custom_entity_types
      (id, project_id, label, icon, color, field_schema, base_behavior, source)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.label, dek)},
      ${data.icon ?? null}, ${data.color ?? '#64748b'},
      ${JSON.stringify(data.fieldSchema ?? [])},
      ${data.baseBehavior ?? 'entity'},
      'manual'
    )
  `;
  return id;
}

export async function updateCustomType(typeId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE custom_entity_types SET
      label         = ${encrypt(data.label, dek)},
      icon          = ${data.icon ?? null},
      color         = ${data.color ?? '#64748b'},
      field_schema  = ${JSON.stringify(data.fieldSchema ?? [])},
      base_behavior = ${data.baseBehavior ?? 'entity'},
      ${sql.unsafe(SOURCE_CASE)}
    WHERE id = ${typeId} AND project_id = ${projectId}
  `;
}

export async function deleteCustomType(typeId, projectId) {
  const [entity] = await sql`SELECT * FROM custom_entity_types WHERE id = ${typeId} AND project_id = ${projectId}`;
  if (!entity) return null;
  // Entités rattachées à ce type + leurs liens events (supprimés en cascade applicative).
  const entities = await sql`SELECT * FROM custom_entities WHERE type_id = ${typeId} AND project_id = ${projectId}`;
  const entityIds = entities.map(e => e.id);
  const eventEntities = entityIds.length
    ? await sql`SELECT * FROM event_entities WHERE entity_type = 'custom' AND entity_id = ANY(${entityIds}) AND project_id = ${projectId}`
    : [];

  if (entityIds.length) {
    await sql`DELETE FROM event_entities WHERE entity_type = 'custom' AND entity_id = ANY(${entityIds}) AND project_id = ${projectId}`;
  }
  await sql`DELETE FROM custom_entities WHERE type_id = ${typeId} AND project_id = ${projectId}`;
  await sql`DELETE FROM custom_entity_types WHERE id = ${typeId} AND project_id = ${projectId}`;

  return { entity, entities, eventEntities };
}

export async function restoreCustomType(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO custom_entity_types (id, project_id, label, icon, color, field_schema, base_behavior, source)
    VALUES (${e.id}, ${projectId}, ${e.label}, ${e.icon ?? null}, ${e.color ?? '#64748b'},
            ${JSON.stringify(e.field_schema ?? [])}, ${e.base_behavior ?? 'entity'}, ${e.source ?? 'import'})
    ON CONFLICT DO NOTHING
  `;
  for (const en of (snapshot.entities ?? [])) {
    await sql`
      INSERT INTO custom_entities (id, project_id, type_id, name, aliases, custom_fields, description, source)
      VALUES (${en.id}, ${projectId}, ${en.type_id}, ${en.name}, ${en.aliases ?? []},
              ${en.custom_fields ?? null}, ${en.description ?? null}, ${en.source ?? 'import'})
      ON CONFLICT DO NOTHING
    `;
  }
  for (const r of (snapshot.eventEntities ?? [])) {
    await sql`INSERT INTO event_entities (event_id, project_id, entity_id, entity_type) VALUES (${r.event_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
}

// ── Entités custom (couche 3) ─────────────────────────────────────────────────

export async function getCustomEntities(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM custom_entities WHERE project_id = ${projectId} ORDER BY id
  `;
  return rows.map(r => ({
    id:           r.id,
    typeId:       r.type_id,
    name:         decrypt(r.name, dek),
    aliases:      parseJ(decrypt(r.aliases, dek), []),
    description:  decrypt(r.description, dek),
    customFields: parseJ(decrypt(r.custom_fields, dek), {}),
    source:       r.source ?? 'import',
  })).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export async function insertCustomEntity(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('cent', projectId);
  await sql`
    INSERT INTO custom_entities
      (id, project_id, type_id, name, aliases, custom_fields, description, source)
    VALUES (
      ${id}, ${projectId}, ${data.typeId},
      ${encrypt(data.name, dek)},
      ${encrypt(data.aliases ?? [], dek)},
      ${encrypt(data.customFields ?? {}, dek)},
      ${encrypt(data.description ?? null, dek)},
      'manual'
    )
  `;
  return id;
}

export async function updateCustomEntity(entId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE custom_entities SET
      type_id       = ${data.typeId},
      name          = ${encrypt(data.name, dek)},
      aliases       = ${encrypt(data.aliases ?? [], dek)},
      custom_fields = ${encrypt(data.customFields ?? {}, dek)},
      description   = ${encrypt(data.description ?? null, dek)},
      ${sql.unsafe(SOURCE_CASE)}
    WHERE id = ${entId} AND project_id = ${projectId}
  `;
}

export async function deleteCustomEntity(entId, projectId) {
  const [entity] = await sql`SELECT * FROM custom_entities WHERE id = ${entId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const eventEntities = await sql`SELECT * FROM event_entities WHERE entity_type = 'custom' AND entity_id = ${entId} AND project_id = ${projectId}`;

  await sql`DELETE FROM event_entities WHERE entity_type = 'custom' AND entity_id = ${entId} AND project_id = ${projectId}`;
  await sql`DELETE FROM custom_entities WHERE id = ${entId} AND project_id = ${projectId}`;

  return { entity, eventEntities };
}

export async function restoreCustomEntity(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO custom_entities (id, project_id, type_id, name, aliases, custom_fields, description, source)
    VALUES (${e.id}, ${projectId}, ${e.type_id}, ${e.name}, ${e.aliases ?? []},
            ${e.custom_fields ?? null}, ${e.description ?? null}, ${e.source ?? 'import'})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.eventEntities ?? [])) {
    await sql`INSERT INTO event_entities (event_id, project_id, entity_id, entity_type) VALUES (${r.event_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
}

// ── Timeline ──────────────────────────────────────────────────────────────────

export async function getTimelineEvents(projectId) {
  const dek = await getProjectDek(projectId);
  const evtRows = await sql`
    SELECT * FROM timeline_events WHERE project_id = ${projectId}
    ORDER BY chapter_num, scene_order, id
  `;
  const entRows = await sql`
    SELECT * FROM event_entities WHERE project_id = ${projectId}
  `;

  const entitiesByEvent = {};
  for (const e of entRows) {
    if (!entitiesByEvent[e.event_id]) entitiesByEvent[e.event_id] = [];
    entitiesByEvent[e.event_id].push({ id: e.entity_id, entityType: e.entity_type });
  }

  return evtRows.map(r => ({
    id:             r.id,
    chapter:        r.chapter_num,
    chapterTitle:   decrypt(r.chapter_title, dek),
    title:          decrypt(r.title, dek),
    description:    decrypt(r.description, dek),
    locationId:     r.location_id,
    beatId:         r.beat_id         ?? null,
    povCharacterId: r.pov_character_id ?? null,
    sceneOrder:     r.scene_order     ?? 0,
    sceneGoal:      decrypt(r.scene_goal, dek)      ?? null,
    sceneConflict:  decrypt(r.scene_conflict, dek)  ?? null,
    sceneOutcome:   decrypt(r.scene_outcome, dek)   ?? null,
    entities:       entitiesByEvent[r.id] ?? [],
    threadIds:      parseJ(r.thread_ids, []),
    source:         r.source ?? 'import',
    volumeId:       r.volume_id ?? null,
    isFlashback:    r.is_flashback ?? false,
    storyChapterRef: r.story_chapter_ref ?? null,
  }));
}

export async function getChapters(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT chapter_num AS number, chapter_title AS title
    FROM timeline_events WHERE project_id = ${projectId}
    ORDER BY chapter_num
  `;
  const seen = new Map();
  for (const r of rows) {
    if (!seen.has(r.number)) seen.set(r.number, { number: r.number, title: decrypt(r.title, dek) });
  }
  return [...seen.values()];
}

export async function insertTimelineEvent(data, projectId) {
  const id = makeId('evt', projectId);
  const [{ max_order }] = await sql`
    SELECT COALESCE(MAX(scene_order), 0) AS max_order
    FROM timeline_events WHERE project_id = ${projectId} AND chapter_num = ${data.chapter}
  `;
  const sceneOrder = data.sceneOrder ?? (Number(max_order) + 1);

  const dek = await getProjectDek(projectId);
  await sql`
    INSERT INTO timeline_events
      (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id,
       pov_character_id, scene_order, scene_goal, scene_conflict, scene_outcome,
       thread_ids, volume_id, is_flashback, story_chapter_ref, source)
    VALUES (
      ${id}, ${projectId}, ${data.chapter}, ${encrypt(data.chapterTitle, dek)}, ${encrypt(data.title, dek)},
      ${encrypt(data.description    ?? null, dek)},
      ${data.locationId     ?? null},
      ${data.beatId         ?? null},
      ${data.povCharacterId ?? null},
      ${sceneOrder},
      ${encrypt(data.sceneGoal      ?? null, dek)},
      ${encrypt(data.sceneConflict  ?? null, dek)},
      ${encrypt(data.sceneOutcome   ?? null, dek)},
      ${data.threadIds      ?? []},
      ${data.volumeId       ?? null},
      ${data.isFlashback    ?? false},
      ${data.storyChapterRef ?? null},
      'manual'
    )
  `;

  for (const e of (data.entities ?? [])) {
    await sql`
      INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
      VALUES (${id}, ${projectId}, ${e.id}, ${e.entityType})
      ON CONFLICT DO NOTHING
    `;
  }

  return id;
}

export async function updateTimelineEvent(eventId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE timeline_events SET
      chapter_num      = ${data.chapter},
      chapter_title    = ${encrypt(data.chapterTitle, dek)},
      title            = ${encrypt(data.title, dek)},
      description      = ${encrypt(data.description    ?? null, dek)},
      location_id      = ${data.locationId     ?? null},
      beat_id          = ${data.beatId         ?? null},
      pov_character_id = ${data.povCharacterId ?? null},
      scene_order      = ${data.sceneOrder     ?? 0},
      scene_goal       = ${encrypt(data.sceneGoal      ?? null, dek)},
      scene_conflict   = ${encrypt(data.sceneConflict  ?? null, dek)},
      scene_outcome    = ${encrypt(data.sceneOutcome   ?? null, dek)},
      thread_ids       = ${data.threadIds      ?? []},
      volume_id        = ${data.volumeId       ?? null},
      is_flashback     = ${data.isFlashback    ?? false},
      story_chapter_ref = ${data.storyChapterRef ?? null},
      ${sql.unsafe(SOURCE_CASE)}
    WHERE id = ${eventId} AND project_id = ${projectId}
  `;

  await sql`DELETE FROM event_entities WHERE event_id = ${eventId} AND project_id = ${projectId}`;
  for (const e of (data.entities ?? [])) {
    await sql`
      INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
      VALUES (${eventId}, ${projectId}, ${e.id}, ${e.entityType})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function reorderEvents(projectId, updates) {
  await sql.begin(async (tx) => {
    for (const u of updates) {
      await tx`
        UPDATE timeline_events
        SET chapter_num = ${u.chapter}, scene_order = ${u.sceneOrder}
        WHERE id = ${u.id} AND project_id = ${projectId}
      `;
    }
  });
}

export async function deleteTimelineEvent(eventId, projectId) {
  const [entity] = await sql`SELECT * FROM timeline_events WHERE id = ${eventId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const eventEntities = await sql`SELECT * FROM event_entities WHERE event_id = ${eventId} AND project_id = ${projectId}`;

  await sql`DELETE FROM event_entities WHERE event_id = ${eventId} AND project_id = ${projectId}`;
  await sql`DELETE FROM timeline_events WHERE id = ${eventId} AND project_id = ${projectId}`;

  return { entity, eventEntities };
}

export async function restoreTimelineEvent(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO timeline_events (id, project_id, chapter_num, chapter_title, title, description, location_id, beat_id,
      pov_character_id, scene_order, scene_goal, scene_conflict, scene_outcome, thread_ids, volume_id, is_flashback, story_chapter_ref, source)
    VALUES (${e.id}, ${projectId}, ${e.chapter_num}, ${e.chapter_title}, ${e.title}, ${e.description ?? null},
            ${e.location_id ?? null}, ${e.beat_id ?? null}, ${e.pov_character_id ?? null}, ${e.scene_order ?? 0},
            ${e.scene_goal ?? null}, ${e.scene_conflict ?? null}, ${e.scene_outcome ?? null},
            ${e.thread_ids ?? []}, ${e.volume_id ?? null}, ${e.is_flashback ?? false}, ${e.story_chapter_ref ?? null}, ${e.source ?? 'import'})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.eventEntities ?? [])) {
    await sql`INSERT INTO event_entities (event_id, project_id, entity_id, entity_type) VALUES (${r.event_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
}

// ── Incohérences ──────────────────────────────────────────────────────────────

export async function getIncoherences(projectId) {
  const incRows = await sql`
    SELECT * FROM incoherences WHERE project_id = ${projectId}
    ORDER BY
      CASE severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END
  `;
  const linkRows = await sql`
    SELECT * FROM incoherence_links WHERE project_id = ${projectId}
  `;

  const linksByInc = {};
  for (const l of linkRows) {
    if (!linksByInc[l.incoherence_id]) linksByInc[l.incoherence_id] = [];
    linksByInc[l.incoherence_id].push({
      label:      l.label,
      entityId:   l.entity_id,
      entityType: l.entity_type,
    });
  }

  const dek = await getProjectDek(projectId);
  return incRows.map(r => ({
    id:             r.id,
    type:           r.type,
    severity:       r.severity,
    title:          decrypt(r.title, dek),
    explanation:    decrypt(r.explanation, dek),
    resolved:       r.resolved,
    resolutionNote: decrypt(r.resolution_note, dek) ?? null,
    links:          (linksByInc[r.id] ?? []).map(l => ({ ...l, label: decrypt(l.label, dek) })),
  }));
}

export async function getEntityIncoherences(entityId, projectId) {
  const rows = await sql`
    SELECT i.* FROM incoherences i
    JOIN incoherence_links l
      ON l.incoherence_id = i.id AND l.project_id = i.project_id
    WHERE i.project_id = ${projectId} AND l.entity_id = ${entityId}
  `;
  return rows;
}

export async function deleteScanIncoherences(projectId) {
  const rows = await sql`
    SELECT id FROM incoherences WHERE project_id = ${projectId} AND id LIKE 'scan_%'
  `;
  for (const r of rows) {
    await sql`
      DELETE FROM incoherence_links WHERE incoherence_id = ${r.id} AND project_id = ${projectId}
    `;
  }
  await sql`DELETE FROM incoherences WHERE project_id = ${projectId} AND id LIKE 'scan_%'`;
}

export async function insertScannedIncoherence(inc, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    INSERT INTO incoherences (id, project_id, type, severity, title, explanation, resolved)
    VALUES (${inc.id}, ${projectId}, ${inc.type}, ${inc.severity}, ${encrypt(inc.title, dek)}, ${encrypt(inc.explanation, dek)}, false)
    ON CONFLICT (id, project_id) DO NOTHING
  `;
  for (const link of (inc.links ?? [])) {
    await sql`
      INSERT INTO incoherence_links (incoherence_id, project_id, entity_id, entity_type, label)
      VALUES (${inc.id}, ${projectId}, ${link.entityId}, ${link.entityType}, ${encrypt(link.label, dek)})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function setIncoherenceResolved(incId, resolved, projectId) {
  await sql`
    UPDATE incoherences SET resolved = ${resolved} WHERE id = ${incId} AND project_id = ${projectId}
  `;
}

export async function setResolutionNote(incId, note, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE incoherences SET resolution_note = ${encrypt(note || null, dek)} WHERE id = ${incId} AND project_id = ${projectId}
  `;
}

// ── Save the Cat ──────────────────────────────────────────────────────────────

export async function getStcChapters(projectId) {
  const chRows = await sql`
    SELECT * FROM stc_chapters WHERE project_id = ${projectId} ORDER BY number
  `;
  const beatRows = await sql`
    SELECT * FROM stc_chapter_beats WHERE project_id = ${projectId}
  `;
  const entityRows = await sql`
    SELECT * FROM stc_chapter_entities WHERE project_id = ${projectId}
  `;

  const beatsByChapter = {};
  for (const b of beatRows) {
    if (!beatsByChapter[b.chapter_id]) beatsByChapter[b.chapter_id] = [];
    beatsByChapter[b.chapter_id].push(b.beat_id);
  }

  const entitiesByChapter = {};
  for (const e of entityRows) {
    if (!entitiesByChapter[e.chapter_id]) entitiesByChapter[e.chapter_id] = [];
    entitiesByChapter[e.chapter_id].push({ id: e.entity_id, entityType: e.entity_type });
  }

  const dek = await getProjectDek(projectId);
  return chRows.map(r => ({
    id:       r.id,
    number:   r.number,
    title:    decrypt(r.title, dek),
    summary:  decrypt(r.summary, dek),
    beats:    beatsByChapter[r.id]    ?? [],
    entities: entitiesByChapter[r.id] ?? [],
    volumeId: r.volume_id ?? null,
  }));
}

export async function insertStcChapter({ number, title, summary, beats, entities, volumeId }, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('ch', projectId);
  await sql`
    INSERT INTO stc_chapters (id, project_id, number, title, summary, volume_id)
    VALUES (${id}, ${projectId}, ${number}, ${encrypt(title, dek)}, ${encrypt(summary ?? null, dek)}, ${volumeId ?? null})
  `;
  for (const beatId of (beats ?? [])) {
    await sql`
      INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
      VALUES (${id}, ${projectId}, ${beatId})
      ON CONFLICT DO NOTHING
    `;
  }
  for (const e of (entities ?? [])) {
    await sql`
      INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type)
      VALUES (${id}, ${projectId}, ${e.id}, ${e.entityType})
      ON CONFLICT DO NOTHING
    `;
  }
  return id;
}

export async function updateStcChapter(chapterId, { number, title, summary, beats, entities }, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE stc_chapters SET number = ${number}, title = ${encrypt(title, dek)}, summary = ${encrypt(summary ?? null, dek)}
    WHERE id = ${chapterId} AND project_id = ${projectId}
  `;
  await sql`DELETE FROM stc_chapter_beats WHERE chapter_id = ${chapterId} AND project_id = ${projectId}`;
  for (const beatId of (beats ?? [])) {
    await sql`
      INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
      VALUES (${chapterId}, ${projectId}, ${beatId})
      ON CONFLICT DO NOTHING
    `;
  }
  await sql`DELETE FROM stc_chapter_entities WHERE chapter_id = ${chapterId} AND project_id = ${projectId}`;
  for (const e of (entities ?? [])) {
    await sql`
      INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type)
      VALUES (${chapterId}, ${projectId}, ${e.id}, ${e.entityType})
      ON CONFLICT DO NOTHING
    `;
  }
}

export async function reorderStcChapters(projectId, updates) {
  await sql.begin(async (tx) => {
    for (const u of updates) {
      await tx`
        UPDATE stc_chapters SET number = ${u.number}
        WHERE id = ${u.id} AND project_id = ${projectId}
      `;
    }
  });
}

export async function deleteStcChapter(chapterId, projectId) {
  const [entity] = await sql`SELECT * FROM stc_chapters WHERE id = ${chapterId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const beats = await sql`SELECT * FROM stc_chapter_beats WHERE chapter_id = ${chapterId} AND project_id = ${projectId}`;
  const entities = await sql`SELECT * FROM stc_chapter_entities WHERE chapter_id = ${chapterId} AND project_id = ${projectId}`;

  await sql`DELETE FROM stc_chapter_entities WHERE chapter_id = ${chapterId} AND project_id = ${projectId}`;
  await sql`DELETE FROM stc_chapter_beats WHERE chapter_id = ${chapterId} AND project_id = ${projectId}`;
  await sql`DELETE FROM stc_chapters WHERE id = ${chapterId} AND project_id = ${projectId}`;

  return { entity, beats, entities };
}

export async function restoreStcChapter(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO stc_chapters (id, project_id, number, title, summary, volume_id)
    VALUES (${e.id}, ${projectId}, ${e.number}, ${e.title}, ${e.summary ?? null}, ${e.volume_id ?? null})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.beats ?? [])) {
    await sql`INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id) VALUES (${r.chapter_id}, ${projectId}, ${r.beat_id}) ON CONFLICT DO NOTHING`;
  }
  for (const r of (snapshot.entities ?? [])) {
    await sql`INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type) VALUES (${r.chapter_id}, ${projectId}, ${r.entity_id}, ${r.entity_type}) ON CONFLICT DO NOTHING`;
  }
}

// ── Arc émotionnel ────────────────────────────────────────────────────────────

export async function getArcPoints(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT chapter_number, intensity, note, volume_id
    FROM arc_points WHERE project_id = ${projectId}
    ORDER BY chapter_number
  `;
  return rows.map(r => ({
    chapterNumber: r.chapter_number,
    intensity:     r.intensity,
    note:          decrypt(r.note, dek),
    volumeId:      r.volume_id ?? null,
  }));
}

export async function upsertArcPoint(projectId, chapterNumber, intensity) {
  await sql`
    INSERT INTO arc_points (project_id, chapter_number, intensity)
    VALUES (${projectId}, ${chapterNumber}, ${intensity})
    ON CONFLICT (project_id, chapter_number) DO UPDATE SET intensity = ${intensity}
  `;
}

// ── Notes libres par chapitre ─────────────────────────────────────────────────

export async function getChapterNotes(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT chapter_num, content FROM chapter_notes WHERE project_id = ${projectId}
  `;
  return Object.fromEntries(rows.map(r => [r.chapter_num, decrypt(r.content, dek)]));
}

export async function setChapterNote(projectId, chapterNum, content) {
  const dek = await getProjectDek(projectId);
  await sql`
    INSERT INTO chapter_notes (project_id, chapter_num, content)
    VALUES (${projectId}, ${chapterNum}, ${encrypt(content, dek)})
    ON CONFLICT (project_id, chapter_num) DO UPDATE SET content = ${encrypt(content, dek)}
  `;
}

// ── Projets ───────────────────────────────────────────────────────────────────

export async function getProjects({ userId, deviceId } = {}) {
  let rows;
  if (userId) {
    rows = await sql`
      SELECT id, name, description, created_at FROM projects
      WHERE user_id = ${userId} ORDER BY created_at
    `;
  } else if (deviceId) {
    rows = await sql`
      SELECT id, name, description, created_at FROM projects
      WHERE device_id = ${deviceId} AND user_id IS NULL ORDER BY created_at
    `;
  } else {
    return [];
  }
  const results = [];
  for (const r of rows) {
    const dek = await getProjectDek(r.id);
    results.push({
      id:          r.id,
      name:        decrypt(r.name, dek),
      description: decrypt(r.description, dek),
      createdAt:   r.created_at,
    });
  }
  return results;
}

export async function createProject({ name, description }, { userId, deviceId } = {}) {
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .slice(0, 20);
  const id = `${slug}_${Date.now()}`;
  await sql`
    INSERT INTO projects (id, name, description, user_id, device_id)
    VALUES (${id}, ${name.trim()}, ${description?.trim() ?? null}, ${userId ?? null}, ${deviceId ?? null})
  `;
  // Génère et stocke une DEK pour le nouveau projet
  const { createProjectDek } = await import('./crypto.js');
  await createProjectDek(id);
  return id;
}

export async function updateProject(projectId, { name, description }) {
  // On ne met à jour que les champs fournis (logline = description).
  if (name !== undefined && description !== undefined) {
    await sql`UPDATE projects SET name = ${name.trim()}, description = ${description?.trim() ?? null} WHERE id = ${projectId}`;
  } else if (name !== undefined) {
    await sql`UPDATE projects SET name = ${name.trim()} WHERE id = ${projectId}`;
  } else if (description !== undefined) {
    await sql`UPDATE projects SET description = ${description?.trim() ?? null} WHERE id = ${projectId}`;
  }
}

export async function deleteProject(projectId, { userId, deviceId } = {}) {
  if (!userId && !deviceId) throw new Error('deleteProject: userId ou deviceId requis');
  if (userId) {
    const res = await sql`DELETE FROM projects WHERE id = ${projectId} AND user_id = ${userId}`;
    if (res.count === 0) throw new Error('Projet introuvable ou non autorisé');
  } else {
    const res = await sql`DELETE FROM projects WHERE id = ${projectId} AND device_id = ${deviceId} AND user_id IS NULL`;
    if (res.count === 0) throw new Error('Projet introuvable ou non autorisé');
  }
  const { evictProjectDek } = await import('./crypto.js');
  evictProjectDek(projectId);
}

export async function claimProjectsForUser(userId, deviceId) {
  await sql`
    UPDATE projects SET user_id = ${userId}, device_id = NULL
    WHERE device_id = ${deviceId} AND user_id IS NULL
  `;
}

export async function getProjectMapImage(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`SELECT map_image FROM projects WHERE id = ${projectId}`;
  return decrypt(rows[0]?.map_image, dek) ?? null;
}

export async function setProjectMapImage(projectId, base64) {
  const dek = await getProjectDek(projectId);
  await sql`UPDATE projects SET map_image = ${encrypt(base64, dek)} WHERE id = ${projectId}`;
}

// ── Coordonnées de lieux ───────────────────────────────────────────────────────

export async function setLocationCoordinates(locId, projectId, coords) {
  await sql`
    UPDATE locations SET coordinates = ${coords ?? null}
    WHERE id = ${locId} AND project_id = ${projectId}
  `;
}

// ── Trajets personnages ────────────────────────────────────────────────────────

export async function saveJourney(projectId, charKey, steps) {
  const dek = await getProjectDek(projectId);
  await sql`
    DELETE FROM character_journeys WHERE project_id = ${projectId} AND char_key = ${charKey}
  `;
  for (let i = 0; i < steps.length; i++) {
    await sql`
      INSERT INTO character_journeys (project_id, char_key, step_index, data)
      VALUES (${projectId}, ${charKey}, ${i}, ${encrypt(steps[i], dek) ?? steps[i]})
    `;
  }
}

export async function getJourney(charKey, projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT data FROM character_journeys
    WHERE project_id = ${projectId} AND char_key = ${charKey}
    ORDER BY step_index
  `;
  return rows.map(r => parseJ(decrypt(r.data, dek), r.data));
}

export async function getAllJourneys(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT char_key, data FROM character_journeys
    WHERE project_id = ${projectId}
    ORDER BY char_key, step_index
  `;
  const result = {};
  for (const r of rows) {
    if (!result[r.char_key]) result[r.char_key] = [];
    result[r.char_key].push(parseJ(decrypt(r.data, dek), r.data));
  }
  return result;
}

// ── Lore agrégé ───────────────────────────────────────────────────────────────

export async function getLoreData(projectId) {
  const [characters, locations, objects, groups] = await Promise.all([
    getCharacters(projectId),
    getLocations(projectId),
    getObjects(projectId),
    getGroups(projectId),
  ]);
  return { characters, locations, objects, groups };
}

// ── Plant / Payoff ────────────────────────────────────────────────────────────

export async function getPlants(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM plant_payoffs WHERE project_id = ${projectId}
    ORDER BY plant_chapter_num NULLS LAST, id
  `;
  return rows.map(r => ({
    id:               r.id,
    label:            decrypt(r.label, dek),
    type:             r.type             ?? 'information',
    plantChapterNum:  r.plant_chapter_num  ?? null,
    plantEventId:     r.plant_event_id     ?? null,
    plantVolumeId:    r.plant_volume_id    ?? null,
    payoffChapterNum: r.payoff_chapter_num ?? null,
    payoffEventId:    r.payoff_event_id    ?? null,
    payoffVolumeId:   r.payoff_volume_id   ?? null,
    entityId:         r.entity_id          ?? null,
    entityType:       r.entity_type        ?? null,
    status:           r.status             ?? 'open',
    notes:            decrypt(r.notes, dek)              ?? null,
  }));
}

export async function insertPlant(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('plant', projectId);
  await sql`
    INSERT INTO plant_payoffs
      (id, project_id, label, type, plant_chapter_num, plant_event_id,
       plant_volume_id, payoff_chapter_num, payoff_event_id, payoff_volume_id,
       entity_id, entity_type, status, notes)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.label, dek)}, ${data.type ?? 'information'},
      ${data.plantChapterNum  ?? null}, ${data.plantEventId    ?? null},
      ${data.plantVolumeId    ?? null},
      ${data.payoffChapterNum ?? null}, ${data.payoffEventId   ?? null},
      ${data.payoffVolumeId   ?? null},
      ${data.entityId         ?? null}, ${data.entityType      ?? null},
      ${data.status           ?? 'open'}, ${encrypt(data.notes ?? null, dek)}
    )
  `;
  return id;
}

export async function updatePlant(plantId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE plant_payoffs SET
      label             = ${encrypt(data.label, dek)},
      type              = ${data.type             ?? 'information'},
      plant_chapter_num = ${data.plantChapterNum  ?? null},
      plant_event_id    = ${data.plantEventId     ?? null},
      plant_volume_id   = ${data.plantVolumeId    ?? null},
      payoff_chapter_num = ${data.payoffChapterNum ?? null},
      payoff_event_id   = ${data.payoffEventId    ?? null},
      payoff_volume_id  = ${data.payoffVolumeId   ?? null},
      entity_id         = ${data.entityId         ?? null},
      entity_type       = ${data.entityType       ?? null},
      status            = ${data.status           ?? 'open'},
      notes             = ${encrypt(data.notes            ?? null, dek)}
    WHERE id = ${plantId} AND project_id = ${projectId}
  `;
}

export async function deletePlant(plantId, projectId) {
  const [entity] = await sql`SELECT * FROM plant_payoffs WHERE id = ${plantId} AND project_id = ${projectId}`;
  if (!entity) return null;
  await sql`DELETE FROM plant_payoffs WHERE id = ${plantId} AND project_id = ${projectId}`;
  return { entity };
}

export async function restorePlant(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO plant_payoffs (id, project_id, label, type, plant_chapter_num, plant_event_id, plant_volume_id,
      payoff_chapter_num, payoff_event_id, payoff_volume_id, entity_id, entity_type, status, notes)
    VALUES (${e.id}, ${projectId}, ${e.label}, ${e.type ?? 'information'},
            ${e.plant_chapter_num ?? null}, ${e.plant_event_id ?? null}, ${e.plant_volume_id ?? null},
            ${e.payoff_chapter_num ?? null}, ${e.payoff_event_id ?? null}, ${e.payoff_volume_id ?? null},
            ${e.entity_id ?? null}, ${e.entity_type ?? null}, ${e.status ?? 'open'}, ${e.notes ?? null})
    ON CONFLICT DO NOTHING
  `;
}

// ── Groupes d'appartenance ─────────────────────────────────────────────────────

export async function getGroups(projectId) {
  const dek = await getProjectDek(projectId);
  const groupRows = await sql`
    SELECT * FROM groups WHERE project_id = ${projectId} ORDER BY id
  `;
  const memberRows = await sql`
    SELECT * FROM character_groups WHERE project_id = ${projectId}
  `;

  const membersByGroup = {};
  for (const m of memberRows) {
    if (!membersByGroup[m.group_id]) membersByGroup[m.group_id] = [];
    membersByGroup[m.group_id].push({ characterId: m.character_id, roleInGroup: m.role_in_group ?? null });
  }

  return groupRows.map(r => ({
    id:          r.id,
    name:        decrypt(r.name, dek),
    type:        r.type        ?? 'autre',
    color:       r.color       ?? '#64748B',
    description: decrypt(r.description, dek) ?? null,
    homelandId:  r.homeland_id ?? null,
    members:     membersByGroup[r.id] ?? [],
  })).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export async function insertGroup(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('grp', projectId);
  await sql`
    INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.name, dek)},
      ${data.type        ?? 'autre'},
      ${data.color       ?? '#64748B'},
      ${encrypt(data.description ?? null, dek)},
      ${data.homelandId  ?? null}
    )
  `;
  return id;
}

export async function updateGroup(groupId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE groups SET
      name        = ${encrypt(data.name, dek)},
      type        = ${data.type        ?? 'autre'},
      color       = ${data.color       ?? '#64748B'},
      description = ${encrypt(data.description ?? null, dek)},
      homeland_id = ${data.homelandId  ?? null}
    WHERE id = ${groupId} AND project_id = ${projectId}
  `;
}

export async function deleteGroup(groupId, projectId) {
  const [entity] = await sql`SELECT * FROM groups WHERE id = ${groupId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const charGroups = await sql`SELECT * FROM character_groups WHERE group_id = ${groupId} AND project_id = ${projectId}`;

  await sql`DELETE FROM character_groups WHERE group_id = ${groupId} AND project_id = ${projectId}`;
  await sql`DELETE FROM groups WHERE id = ${groupId} AND project_id = ${projectId}`;

  return { entity, charGroups };
}

export async function restoreGroup(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
    VALUES (${e.id}, ${projectId}, ${e.name}, ${e.type ?? 'autre'}, ${e.color ?? '#64748B'}, ${e.description ?? null}, ${e.homeland_id ?? null})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.charGroups ?? [])) {
    await sql`INSERT INTO character_groups (character_id, group_id, project_id, role_in_group) VALUES (${r.character_id}, ${r.group_id}, ${projectId}, ${r.role_in_group ?? null}) ON CONFLICT DO NOTHING`;
  }
}

export async function setGroupMemberRole(groupId, characterId, roleInGroup, projectId) {
  await sql`
    UPDATE character_groups SET role_in_group = ${roleInGroup ?? null}
    WHERE group_id = ${groupId} AND character_id = ${characterId} AND project_id = ${projectId}
  `;
}

export async function setCharacterGroups(characterId, groupIds, projectId) {
  await sql`DELETE FROM character_groups WHERE character_id = ${characterId} AND project_id = ${projectId}`;
  for (const groupId of groupIds) {
    await sql`
      INSERT INTO character_groups (character_id, group_id, project_id)
      VALUES (${characterId}, ${groupId}, ${projectId})
      ON CONFLICT DO NOTHING
    `;
  }
}

// ── Fils narratifs ─────────────────────────────────────────────────────────────

export async function getThreads(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM narrative_threads WHERE project_id = ${projectId}
    ORDER BY sort_order, id
  `;
  return rows.map(r => ({
    id:          r.id,
    name:        decrypt(r.name, dek),
    color:       r.color       ?? '#3F51B5',
    role:        r.role        ?? 'subplot',
    description: decrypt(r.description, dek) ?? null,
    sortOrder:   r.sort_order  ?? 0,
  }));
}

export async function insertThread(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('thread', projectId);
  await sql`
    INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
    VALUES (
      ${id}, ${projectId}, ${encrypt(data.name, dek)},
      ${data.color       ?? '#3F51B5'},
      ${data.role        ?? 'subplot'},
      ${encrypt(data.description ?? null, dek)},
      ${data.sortOrder   ?? 0}
    )
  `;
  return id;
}

export async function updateThread(threadId, data, projectId) {
  const dek = await getProjectDek(projectId);
  await sql`
    UPDATE narrative_threads SET
      name        = ${encrypt(data.name, dek)},
      color       = ${data.color       ?? '#3F51B5'},
      role        = ${data.role        ?? 'subplot'},
      description = ${encrypt(data.description ?? null, dek)},
      sort_order  = ${data.sortOrder   ?? 0}
    WHERE id = ${threadId} AND project_id = ${projectId}
  `;
}

export async function deleteThread(threadId, projectId) {
  const [entity] = await sql`SELECT * FROM narrative_threads WHERE id = ${threadId} AND project_id = ${projectId}`;
  if (!entity) return null;
  // Capture events referencing this thread in their JSONB thread_ids
  const affectedEvents = await sql`
    SELECT id FROM timeline_events
    WHERE project_id = ${projectId} AND thread_ids @> ${JSON.stringify([threadId])}::jsonb
  `;
  const affectedEventIds = affectedEvents.map(r => r.id);
  // Remove thread ID from JSONB arrays
  if (affectedEventIds.length) {
    await sql`
      UPDATE timeline_events
      SET thread_ids = (
        SELECT COALESCE(jsonb_agg(elem), '[]'::jsonb)
        FROM jsonb_array_elements(thread_ids) AS elem
        WHERE elem::text != ${JSON.stringify(threadId)}
      )
      WHERE project_id = ${projectId} AND id = ANY(${affectedEventIds})
    `;
  }
  await sql`DELETE FROM narrative_threads WHERE id = ${threadId} AND project_id = ${projectId}`;

  return { entity, affectedEventIds };
}

export async function restoreThread(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
    VALUES (${e.id}, ${projectId}, ${e.name}, ${e.color ?? '#3F51B5'}, ${e.role ?? 'subplot'}, ${e.description ?? null}, ${e.sort_order ?? 0})
    ON CONFLICT DO NOTHING
  `;
  // Re-add thread ID to affected events' JSONB arrays
  for (const eventId of (snapshot.affectedEventIds ?? [])) {
    await sql`
      UPDATE timeline_events
      SET thread_ids = thread_ids || ${JSON.stringify([e.id])}::jsonb
      WHERE id = ${eventId} AND project_id = ${projectId}
        AND NOT thread_ids @> ${JSON.stringify([e.id])}::jsonb
    `;
  }
}

// ── Arc des personnages ────────────────────────────────────────────────────────

export async function getCharacterAxes(characterId, projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM character_arc_axes
    WHERE project_id = ${projectId} AND character_id = ${characterId}
    ORDER BY id
  `;
  return rows.map(r => ({ id: r.id, characterId: r.character_id, label: decrypt(r.label, dek), color: r.color }))
    .sort((a, b) => (a.label ?? '').localeCompare(b.label ?? ''));
}

export async function getAllProjectAxisLabels(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT label FROM character_arc_axes
    WHERE project_id = ${projectId}
  `;
  const labels = [...new Set(rows.map(r => decrypt(r.label, dek)))];
  return labels.sort();
}

export async function getAllCharacterAxes(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT * FROM character_arc_axes
    WHERE project_id = ${projectId}
    ORDER BY character_id, id
  `;
  return rows.map(r => ({ id: r.id, characterId: r.character_id, label: decrypt(r.label, dek), color: r.color }));
}

export async function insertCharacterAxis(data, projectId) {
  const dek = await getProjectDek(projectId);
  const id = makeId('cax', projectId);
  await sql`
    INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
    VALUES (${id}, ${projectId}, ${data.characterId}, ${encrypt(data.label, dek)}, ${data.color ?? '#64748b'})
  `;
  return id;
}

export async function deleteCharacterAxis(axisId, projectId) {
  const [entity] = await sql`SELECT * FROM character_arc_axes WHERE id = ${axisId} AND project_id = ${projectId}`;
  if (!entity) return null;
  const arcPoints = await sql`SELECT * FROM character_arc_points WHERE axis_id = ${axisId} AND project_id = ${projectId}`;

  await sql`DELETE FROM character_arc_points WHERE axis_id = ${axisId} AND project_id = ${projectId}`;
  await sql`DELETE FROM character_arc_axes WHERE id = ${axisId} AND project_id = ${projectId}`;

  return { entity, arcPoints };
}

export async function restoreCharacterAxis(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
    VALUES (${e.id}, ${projectId}, ${e.character_id}, ${e.label}, ${e.color ?? '#64748b'})
    ON CONFLICT DO NOTHING
  `;
  for (const r of (snapshot.arcPoints ?? [])) {
    await sql`INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note, volume_id) VALUES (${projectId}, ${r.axis_id}, ${r.chapter_num}, ${r.value}, ${r.note ?? null}, ${r.volume_id ?? null}) ON CONFLICT DO NOTHING`;
  }
}

export async function upsertCharacterArcPoint(projectId, axisId, chapterNum, value, note, volumeId) {
  const dek = await getProjectDek(projectId);
  await sql`
    INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note, volume_id)
    VALUES (${projectId}, ${axisId}, ${chapterNum}, ${value}, ${encrypt(note ?? null, dek)}, ${volumeId ?? null})
    ON CONFLICT (project_id, axis_id, chapter_num)
    DO UPDATE SET value = ${value}, note = ${encrypt(note ?? null, dek)}, volume_id = ${volumeId ?? null}
  `;
}

export async function getCharacterArcPoints(axisId, projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT chapter_num, value, note, volume_id FROM character_arc_points
    WHERE project_id = ${projectId} AND axis_id = ${axisId}
    ORDER BY chapter_num
  `;
  return rows.map(r => ({
    chapterNum: r.chapter_num,
    value:      r.value,
    note:       decrypt(r.note, dek),
    volumeId:   r.volume_id ?? null,
  }));
}

export async function getAllCharacterArcPoints(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT axis_id, chapter_num, value, note, volume_id FROM character_arc_points
    WHERE project_id = ${projectId}
    ORDER BY axis_id, chapter_num
  `;
  return rows.map(r => ({
    axisId:     r.axis_id,
    chapterNum: r.chapter_num,
    value:      r.value,
    note:       decrypt(r.note, dek),
    volumeId:   r.volume_id ?? null,
  }));
}

// ── Voyage du Héros ───────────────────────────────────────────────────────────

export async function getHeroJourneyEntries(projectId) {
  const dek = await getProjectDek(projectId);
  const rows = await sql`
    SELECT id, stage_key, character_id, chapter_num, summary, volume_id
    FROM hero_journey_entries
    WHERE project_id = ${projectId}
    ORDER BY stage_key
  `;
  return rows.map(r => ({
    id:          r.id,
    stageKey:    r.stage_key,
    characterId: r.character_id ?? null,
    chapterNum:  r.chapter_num  ?? null,
    summary:     decrypt(r.summary, dek)      ?? null,
    volumeId:    r.volume_id    ?? null,
  }));
}

/**
 * Upsert : cherche une entrée existante par (stageKey + characterId + volumeId).
 * Si elle existe, met à jour chapterNum + summary. Sinon, insère.
 * Retourne l'id de l'entrée.
 */
export async function saveHeroJourneyEntry({ stageKey, characterId, chapterNum, summary, volumeId }, projectId) {
  const existing = await sql`
    SELECT id FROM hero_journey_entries
    WHERE project_id  = ${projectId}
      AND stage_key   = ${stageKey}
      AND character_id IS NOT DISTINCT FROM ${characterId ?? null}
      AND volume_id    IS NOT DISTINCT FROM ${volumeId    ?? null}
    LIMIT 1
  `;

  const dek = await getProjectDek(projectId);
  if (existing.length > 0) {
    const id = existing[0].id;
    await sql`
      UPDATE hero_journey_entries
      SET chapter_num = ${chapterNum ?? null}, summary = ${encrypt(summary ?? null, dek)}
      WHERE id = ${id} AND project_id = ${projectId}
    `;
    return id;
  }

  const id = randomUUID();
  await sql`
    INSERT INTO hero_journey_entries
      (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
    VALUES (
      ${id}, ${projectId}, ${stageKey},
      ${characterId ?? null}, ${chapterNum ?? null}, ${encrypt(summary ?? null, dek)}, ${volumeId ?? null}
    )
  `;
  return id;
}

export async function removeHeroJourneyEntry(entryId, projectId) {
  const [entity] = await sql`SELECT * FROM hero_journey_entries WHERE id = ${entryId} AND project_id = ${projectId}`;
  if (!entity) return null;
  await sql`DELETE FROM hero_journey_entries WHERE id = ${entryId} AND project_id = ${projectId}`;
  return { entity };
}

export async function restoreHeroJourneyEntry(snapshot, projectId) {
  const e = snapshot.entity;
  await sql`
    INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
    VALUES (${e.id}, ${projectId}, ${e.stage_key}, ${e.character_id ?? null}, ${e.chapter_num ?? null}, ${e.summary ?? null}, ${e.volume_id ?? null})
    ON CONFLICT DO NOTHING
  `;
}

export async function exportProject(projectId) {
  const dek = await getProjectDek(projectId);
  const [proj] = await sql`SELECT id, name, description, map_image, created_at FROM projects WHERE id = ${projectId}`;
  if (!proj) throw new Error(`Projet introuvable : ${projectId}`);

  const [
    volumes, characters, locations, objects,
    timelineEvents, eventEntities,
    incoherences, incoherenceLinks,
    stcChapters, stcChapterBeats, stcChapterEntities,
    characterJourneys,
    groups, characterGroups,
    plantPayoffs, arcPoints, narrativeThreads,
    characterArcAxes, characterArcPoints,
    heroJourneyEntries,
    customEntityTypes, customEntities,
  ] = await Promise.all([
    sql`SELECT * FROM volumes                WHERE project_id = ${projectId} ORDER BY number`,
    sql`SELECT * FROM characters             WHERE project_id = ${projectId} ORDER BY id`,
    sql`SELECT * FROM locations              WHERE project_id = ${projectId} ORDER BY id`,
    sql`SELECT * FROM objects                WHERE project_id = ${projectId} ORDER BY id`,
    sql`SELECT * FROM timeline_events        WHERE project_id = ${projectId} ORDER BY chapter_num, id`,
    sql`SELECT * FROM event_entities         WHERE project_id = ${projectId}`,
    sql`SELECT * FROM incoherences           WHERE project_id = ${projectId}`,
    sql`SELECT * FROM incoherence_links      WHERE project_id = ${projectId}`,
    sql`SELECT * FROM stc_chapters           WHERE project_id = ${projectId} ORDER BY number`,
    sql`SELECT * FROM stc_chapter_beats      WHERE project_id = ${projectId}`,
    sql`SELECT * FROM stc_chapter_entities   WHERE project_id = ${projectId}`,
    sql`SELECT * FROM character_journeys     WHERE project_id = ${projectId} ORDER BY char_key, step_index`,
    sql`SELECT * FROM groups                 WHERE project_id = ${projectId} ORDER BY id`,
    sql`SELECT * FROM character_groups       WHERE project_id = ${projectId}`,
    sql`SELECT * FROM plant_payoffs          WHERE project_id = ${projectId}`,
    sql`SELECT * FROM arc_points             WHERE project_id = ${projectId} ORDER BY chapter_number`,
    sql`SELECT * FROM narrative_threads      WHERE project_id = ${projectId} ORDER BY sort_order`,
    sql`SELECT * FROM character_arc_axes     WHERE project_id = ${projectId} ORDER BY character_id, id`,
    sql`SELECT * FROM character_arc_points   WHERE project_id = ${projectId} ORDER BY axis_id, chapter_num`,
    sql`SELECT * FROM hero_journey_entries   WHERE project_id = ${projectId} ORDER BY stage_key`,
    sql`SELECT * FROM custom_entity_types     WHERE project_id = ${projectId} ORDER BY id`,
    sql`SELECT * FROM custom_entities         WHERE project_id = ${projectId} ORDER BY id`,
  ]);

  // Décrypte les champs sensibles pour l'export (doit être en clair dans le JSON)
  const d  = (v) => decrypt(v, dek);
  const dj = (v) => { const r = decrypt(v, dek); if (typeof r === 'string') { try { return JSON.parse(r); } catch { /* plaintext JSONB */ } } return r; };

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project: { id: proj.id, name: d(proj.name), description: d(proj.description), mapImage: d(proj.map_image), createdAt: proj.created_at },
    volumes: volumes.map(r => ({ ...r, title: d(r.title), description: d(r.description) })),
    characters: characters.map(r => ({ ...r, name: d(r.name), aliases: dj(r.aliases), race: d(r.race), role: d(r.role), origin: d(r.origin), description: d(r.description), affiliations: dj(r.affiliations), traits: dj(r.traits), custom_fields: dj(r.custom_fields) })),
    locations: locations.map(r => ({ ...r, name: d(r.name), type: d(r.type), regime: d(r.regime), description: d(r.description), inhabitants: dj(r.inhabitants), visited_by: dj(r.visited_by), key_places: dj(r.key_places), custom_fields: dj(r.custom_fields) })),
    objects: objects.map(r => ({ ...r, name: d(r.name), type: d(r.type), description: d(r.description), creator: d(r.creator), current_holder: d(r.current_holder), powers: dj(r.powers), inscription: d(r.inscription), custom_fields: dj(r.custom_fields) })),
    timelineEvents: timelineEvents.map(r => ({ ...r, title: d(r.title), description: d(r.description), chapter_title: d(r.chapter_title), scene_goal: d(r.scene_goal), scene_conflict: d(r.scene_conflict), scene_outcome: d(r.scene_outcome) })),
    eventEntities,
    incoherences: incoherences.map(r => ({ ...r, title: d(r.title), explanation: d(r.explanation), resolution_note: d(r.resolution_note) })),
    incoherenceLinks: incoherenceLinks.map(r => ({ ...r, label: d(r.label) })),
    stcChapters: stcChapters.map(r => ({ ...r, title: d(r.title), summary: d(r.summary) })),
    stcChapterBeats, stcChapterEntities,
    characterJourneys: characterJourneys.map(r => ({ ...r, data: dj(r.data) })),
    groups: groups.map(r => ({ ...r, name: d(r.name), description: d(r.description) })),
    characterGroups,
    plantPayoffs: plantPayoffs.map(r => ({ ...r, label: d(r.label), notes: d(r.notes) })),
    arcPoints: arcPoints.map(r => ({ ...r, note: d(r.note) })),
    narrativeThreads: narrativeThreads.map(r => ({ ...r, name: d(r.name), description: d(r.description) })),
    characterArcAxes: characterArcAxes.map(r => ({ ...r, label: d(r.label) })),
    characterArcPoints: characterArcPoints.map(r => ({ ...r, note: d(r.note) })),
    heroJourneyEntries: heroJourneyEntries.map(r => ({ ...r, summary: d(r.summary) })),
    customEntityTypes: customEntityTypes.map(r => ({ ...r, label: d(r.label), field_schema: dj(r.field_schema) })),
    customEntities: customEntities.map(r => ({ ...r, name: d(r.name), aliases: dj(r.aliases), description: d(r.description), custom_fields: dj(r.custom_fields) })),
  };
}

// ── RGPD — Export & suppression de compte ─────────────────────────────────────

export async function exportUserData(userId) {
  const [user] = await sql`
    SELECT id, name, email, "emailVerified", "createdAt", "updatedAt"
    FROM "user" WHERE id = ${userId}
  `;
  if (!user) throw new Error('Utilisateur introuvable');

  const projects = await sql`SELECT id FROM projects WHERE user_id = ${userId}`;
  const projectsData = [];
  for (const p of projects) {
    projectsData.push(await exportProject(p.id));
  }

  return {
    user: { id: user.id, name: user.name, email: user.email, emailVerified: user.emailVerified, createdAt: user.createdAt },
    projects: projectsData,
    exportedAt: new Date().toISOString(),
  };
}

export async function deleteUser(userId) {
  await sql.begin(async (tx) => {
    // Récupérer l'email pour nettoyer la table verification (pas de FK vers user)
    const [user] = await tx`SELECT email FROM "user" WHERE id = ${userId}`;
    await tx`DELETE FROM projects WHERE user_id = ${userId}`;
    if (user?.email) {
      await tx`DELETE FROM verification WHERE identifier = ${user.email}`;
    }
    await tx`DELETE FROM "user" WHERE id = ${userId}`;
  });
}
