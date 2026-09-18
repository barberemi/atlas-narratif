/**
 * Notes Obsidian parsées → JSON canonique (le modèle de analysis_prompt.js),
 * réutilisable par seedProjectViaApi → POST /api/seed.
 *
 * SCAFFOLD (étape 4). Fonctionnel pour les cas simples ; TODO clairs pour la suite.
 *
 * Pipeline : classifier chaque note (noyau typé vs type custom) → générer un ID
 * stable → mapper les champs (fieldMap) → résoudre les wikilinks en IDs →
 * produire { data, report } où report liste les liens cassés et champs non mappés.
 */

import { mapField, classifyType, normalizeKey } from './fieldMap';

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

/**
 * @param {Array} notes  - sortie de parseVault()
 * @param {Object} options
 * @returns {{ data, report }}
 */
export function mapToCanonical(notes, _options = {}) {
  const report = { brokenLinks: [], unmappedFields: [], counts: {}, customTypes: [] };

  // 1re passe : classifier + attribuer un ID, construire l'index titre→{id,type}.
  const index = new Map(); // titre normalisé → { id, type, entityType }
  const enriched = notes.map(note => {
    const coreType = classifyType(note); // 'character'|'location'|'object'|null
    const isCustom = coreType == null;
    const entityType = coreType ?? 'custom';
    // Le type custom dérive du frontmatter.type, sinon du dossier.
    const customTypeLabel = isCustom
      ? (note.frontmatter.type || note.folder || 'Divers')
      : null;
    const id = `${PREFIX[entityType]}_${slugify(note.title)}`;
    index.set(normalizeKey(note.title), { id, entityType, customTypeLabel });
    return { note, id, entityType, coreType, customTypeLabel };
  });

  const characters = [];
  const locations = [];
  const objects = [];
  const customTypesById = new Map(); // typeId → { id, label, fieldSchema:Set }
  const customEntities = [];

  const resolveLinks = (wikilinks, fromTitle) =>
    wikilinks.map(link => {
      const hit = index.get(normalizeKey(link.target));
      if (!hit) {
        report.brokenLinks.push({ from: fromTitle, target: link.target });
        return null;
      }
      return hit.id;
    }).filter(Boolean);

  for (const { note, id, coreType, customTypeLabel } of enriched) {
    // Fusionne frontmatter + champs inline ; mappe les clés connues.
    const rawFields = { ...note.frontmatter, ...note.inlineFields };
    const mapped = {};
    const customFields = {};
    for (const [key, value] of Object.entries(rawFields)) {
      if (['title', 'name', 'tags', 'type'].includes(normalizeKey(key))) continue;
      const canonical = coreType ? mapField(key) : null;
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
    // Les wikilinks résolus sont exposés comme référence (TODO: alimenter event_entities / relations).
    const links = resolveLinks(note.wikilinks, note.title);
    if (links.length) base.customFields.__links = links;

    if (coreType === 'character') {
      characters.push({ ...base, race: mapped.race ?? null, role: mapped.role ?? null, origin: mapped.origin ?? null, affiliations: mapped.affiliations ?? [], traits: mapped.traits ?? [] });
    } else if (coreType === 'location') {
      locations.push({ ...base, type: mapped.type ?? null, regime: mapped.regime ?? null, inhabitants: mapped.inhabitants ?? [] });
    } else if (coreType === 'object') {
      objects.push({ ...base, type: mapped.type ?? null, creator: mapped.creator ?? null, currentHolder: mapped.currentHolder ?? null, powers: mapped.powers ?? [] });
    } else {
      // Couche 3 : type custom dérivé du label.
      const typeId = `ctype_${slugify(customTypeLabel)}`;
      if (!customTypesById.has(typeId)) {
        customTypesById.set(typeId, { id: typeId, label: customTypeLabel, icon: null, color: null, fieldSchema: new Set() });
      }
      Object.keys(customFields).filter(k => k !== '__links').forEach(k => customTypesById.get(typeId).fieldSchema.add(k));
      customEntities.push({ id, typeId, name: note.title, aliases: base.aliases, description: base.description, customFields });
    }
  }

  const customTypesDB = [...customTypesById.values()].map(t => ({
    id: t.id, label: t.label, icon: t.icon, color: t.color,
    fieldSchema: [...t.fieldSchema].map(key => ({ key, label: key, type: 'text' })),
  }));

  report.counts = { characters: characters.length, locations: locations.length, objects: objects.length, customEntities: customEntities.length, customTypes: customTypesDB.length };
  report.customTypes = customTypesDB.map(t => t.label);

  const data = {
    loreDB: { characters, locations, objects },
    customTypesDB,
    customEntitiesDB: customEntities,
    // TODO: dériver timelineDB depuis des notes « scène/chapitre », et alimenter
    // event_entities à partir des wikilinks résolus (__links).
  };

  return { data, report };
}
