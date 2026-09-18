import { getLoreCache } from './entityUtils';

// ── Couleurs par type de relation ───────────────────────────────────────────
export const RELATION_COLORS = {
  holds:       '#F59E0B',  // Possède un objet
  held_by:     '#F59E0B',  // Porté par un personnage
  origin:      '#10B981',  // Lieu d'origine / originaire
  created_in:  '#8B5CF6',  // Forgé dans ce lieu
  created_by:  '#EF4444',  // Créé par ce personnage
  visited_by:  '#64748B',  // Lieu visité par un personnage
  visited:     '#64748B',  // Personnage ayant visité un lieu
  member_of:   '#10B981',  // Appartient au groupe
  has_member:  '#10B981',  // Membre du groupe
  homeland:    '#0EA5E9',  // Territoire natal du groupe
  event:       '#A78BFA',  // Co-apparition dans un événement (entités custom)
};

export const RELATION_LABELS = {
  holds:       'Possède',
  held_by:     'Porté par',
  origin:      'Origine',
  created_in:  'Forgé à',
  created_by:  'Créé par',
  visited_by:  'Visité par',
  visited:     'A visité',
  member_of:   'Membre de',
  has_member:  'Membre',
  homeland:    'Nation',
  event:       'Événement',
};

// ── Helpers ─────────────────────────────────────────────────────────────────
function normalize(str) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Vérifie si haystack contient needle (ou son premier mot significatif).
 * Insensible à la casse et aux accents.
 */
function nameIncludes(haystack, needle) {
  if (!haystack || !needle) return false;
  const h = normalize(haystack);
  const n = normalize(needle);
  if (h.includes(n)) return true;
  // Fallback : premier mot (si > 3 chars, pour éviter "la", "le", etc.)
  const firstWord = n.split(' ')[0];
  return firstWord.length > 3 && h.includes(firstWord);
}

// ── buildGraph ───────────────────────────────────────────────────────────────
/**
 * Construit les nœuds et arêtes du graphe centré sur `entityId`.
 * Retourne : { central, satellites, edges } ou null si entité introuvable.
 */
export function buildGraph(entityId, events = []) {
  const { characters, locations, objects, groups = [], customEntities = [], customTypes = [] } = getLoreCache();
  const customColor = (ce) => customTypes.find(t => t.id === ce?.typeId)?.color || '#a78bfa';

  let central = null;
  let centralType = null;

  for (const c of characters) {
    if (c.id === entityId) { central = c; centralType = 'character'; break; }
  }
  if (!central) for (const l of locations) {
    if (l.id === entityId) { central = l; centralType = 'location'; break; }
  }
  if (!central) for (const o of objects) {
    if (o.id === entityId) { central = o; centralType = 'object'; break; }
  }
  if (!central) for (const g of groups) {
    if (g.id === entityId) { central = g; centralType = 'group'; break; }
  }
  if (!central) for (const ce of customEntities) {
    if (ce.id === entityId) { central = { ...ce, color: customColor(ce) }; centralType = 'custom'; break; }
  }

  if (!central) return null;

  const nodes = new Map(); // id → { ...entity, entityType }
  const edgeSet = new Set(); // pour dédupliquer
  const edges = [];

  const addNode = (entity, type) => {
    if (!nodes.has(entity.id) && entity.id !== entityId) {
      nodes.set(entity.id, { ...entity, entityType: type });
    }
  };

  const addEdge = (fromId, toId, relType) => {
    const key = [fromId, toId].sort().join('::');
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ fromId, toId, relType });
    }
  };

  // ── Personnage ────────────────────────────────────────────────────────────
  if (centralType === 'character') {
    // Objets possédés
    for (const obj of objects) {
      if (nameIncludes(obj.currentHolder, central.name)) {
        addNode(obj, 'object');
        addEdge(entityId, obj.id, 'holds');
      }
    }
    // Lieu d'origine
    for (const loc of locations) {
      if (nameIncludes(central.origin, loc.name)) {
        addNode(loc, 'location');
        addEdge(entityId, loc.id, 'origin');
      }
    }
    // Lieux visités par ce personnage
    for (const loc of locations) {
      if ((loc.visitedBy ?? []).some(v => v.id === entityId)) {
        addNode(loc, 'location');
        addEdge(entityId, loc.id, 'visited');
      }
    }
    // Groupes du personnage
    for (const group of groups) {
      if ((group.members ?? []).some(m => m.characterId === entityId)) {
        addNode(group, 'group');
        addEdge(entityId, group.id, 'member_of');
      }
    }
  }

  // ── Groupe ────────────────────────────────────────────────────────────────
  if (centralType === 'group') {
    // Membres du groupe
    for (const m of (central.members ?? [])) {
      const char = characters.find(c => c.id === m.characterId);
      if (char) {
        addNode(char, 'character');
        addEdge(entityId, char.id, 'has_member');
      }
    }
    // Territoire natal
    if (central.homelandId) {
      const loc = locations.find(l => l.id === central.homelandId);
      if (loc) {
        addNode(loc, 'location');
        addEdge(entityId, loc.id, 'homeland');
      }
    }
  }

  // ── Lieu ─────────────────────────────────────────────────────────────────
  if (centralType === 'location') {
    // Personnages originaires de ce lieu
    for (const char of characters) {
      if (nameIncludes(char.origin, central.name)) {
        addNode(char, 'character');
        addEdge(entityId, char.id, 'origin');
      }
    }
    // Objets créés ici
    for (const obj of objects) {
      if (nameIncludes(obj.createdIn, central.name)) {
        addNode(obj, 'object');
        addEdge(entityId, obj.id, 'created_in');
      }
    }
    // Personnages ayant visité ce lieu
    for (const visitor of (central.visitedBy ?? [])) {
      const char = characters.find(c => c.id === visitor.id);
      if (char) {
        addNode(char, 'character');
        addEdge(entityId, char.id, 'visited_by');
      }
    }
  }

  // ── Objet ─────────────────────────────────────────────────────────────────
  if (centralType === 'object') {
    // Porteur actuel
    if (central.currentHolder) {
      const holder = characters.find(c => nameIncludes(central.currentHolder, c.name));
      if (holder) {
        addNode(holder, 'character');
        addEdge(entityId, holder.id, 'held_by');
      }
    }
    // Créateur (si personnage connu)
    if (central.creator) {
      const creator = characters.find(c => nameIncludes(central.creator, c.name));
      if (creator) {
        addNode(creator, 'character');
        addEdge(entityId, creator.id, 'created_by');
      }
    }
    // Lieu de création
    for (const loc of locations) {
      if (nameIncludes(central.createdIn, loc.name)) {
        addNode(loc, 'location');
        addEdge(entityId, loc.id, 'created_in');
      }
    }
  }

  // ── Entités custom via événements partagés (couche 3) ───────────────────────
  // On n'ajoute que des arêtes impliquant une entité custom : les graphes des
  // entités natives restent identiques sauf si une entité custom co-apparaît.
  if (events.length) {
    const findById = (id) =>
      customEntities.find(e => e.id === id) ??
      characters.find(e => e.id === id) ??
      locations.find(e => e.id === id) ??
      objects.find(e => e.id === id);
    const typeOfRef = (ref) => ref.entityType ?? (customEntities.some(e => e.id === ref.id) ? 'custom' : null);

    for (const ev of events) {
      const refs = ev.entities ?? [];
      if (!refs.some(r => r.id === entityId)) continue;
      for (const ref of refs) {
        if (ref.id === entityId) continue;
        const refType = typeOfRef(ref);
        // Seulement si l'une des deux extrémités est custom.
        if (centralType !== 'custom' && refType !== 'custom') continue;
        const ent = findById(ref.id);
        if (!ent) continue;
        const enriched = refType === 'custom' ? { ...ent, color: customColor(ent) } : ent;
        addNode(enriched, refType);
        addEdge(entityId, ref.id, 'event');
      }
    }
  }

  // Tri des satellites : groupes → personnages → lieux → objets → custom
  const typeOrder = { group: 0, character: 1, location: 2, object: 3, custom: 4 };
  const satellites = Array.from(nodes.values())
    .sort((a, b) => (typeOrder[a.entityType] ?? 9) - (typeOrder[b.entityType] ?? 9));

  // ── Réification des relations : nœuds intermédiaires pour les types ≥ 2 arêtes
  const edgesByType = new Map();
  edges.forEach(e => {
    if (!edgesByType.has(e.relType)) edgesByType.set(e.relType, []);
    edgesByType.get(e.relType).push(e);
  });

  const relNodes   = [];
  const finalEdges = [];

  for (const [relType, typeEdges] of edgesByType) {
    if (typeEdges.length >= 2) {
      const relNodeId = `rel_${entityId}_${relType}`;
      relNodes.push({
        id:      relNodeId,
        isRelNode: true,
        relType,
        label:   RELATION_LABELS[relType] || relType,
        color:   RELATION_COLORS[relType] || '#64748b',
      });
      // central → nœud relation (ressort court)
      finalEdges.push({ fromId: entityId, toId: relNodeId, relType, springLen: 110 });
      // nœud relation → chaque satellite (ressort court)
      typeEdges.forEach(e => {
        finalEdges.push({ fromId: relNodeId, toId: e.toId, relType, springLen: 120 });
      });
    } else {
      finalEdges.push(...typeEdges);
    }
  }

  return { central: { ...central, entityType: centralType }, satellites, edges: finalEdges, relNodes };
}

export function buildFullGraph() {
  const { characters, locations, objects, groups = [] } = getLoreCache();

  const nodes   = new Map();
  const edgeSet = new Set();
  const edges   = [];

  characters.forEach(c => nodes.set(c.id, { ...c, entityType: 'character' }));
  locations.forEach(l  => nodes.set(l.id, { ...l, entityType: 'location'  }));
  objects.forEach(o   => nodes.set(o.id, { ...o, entityType: 'object'    }));
  groups.forEach(g    => nodes.set(g.id, { ...g, entityType: 'group'     }));

  const addEdge = (fromId, toId, relType) => {
    if (!fromId || !toId || fromId === toId) return;
    const key = [fromId, toId].sort().join('::');
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push({ fromId, toId, relType });
    }
  };

  // Relations depuis chaque personnage
  for (const char of characters) {
    // Objets possédés
    for (const obj of objects) {
      if (nameIncludes(obj.currentHolder, char.name)) addEdge(char.id, obj.id, 'holds');
    }
    // Lieu d'origine
    for (const loc of locations) {
      if (nameIncludes(char.origin, loc.name)) addEdge(char.id, loc.id, 'origin');
    }
  }

  // Relations depuis chaque objet
  for (const obj of objects) {
    if (obj.creator) {
      const creator = characters.find(c => nameIncludes(obj.creator, c.name));
      if (creator) addEdge(obj.id, creator.id, 'created_by');
    }
    for (const loc of locations) {
      if (nameIncludes(obj.createdIn, loc.name)) addEdge(obj.id, loc.id, 'created_in');
    }
  }

  // Relations visitedBy depuis les lieux
  for (const loc of locations) {
    for (const visitor of (loc.visitedBy ?? [])) {
      addEdge(loc.id, visitor.id, 'visited_by');
    }
  }

  // Membres des groupes + homeland
  for (const group of groups) {
    for (const m of (group.members ?? [])) {
      addEdge(group.id, m.characterId, 'has_member');
    }
    if (group.homelandId) {
      addEdge(group.id, group.homelandId, 'homeland');
    }
  }

  // Calcul du degré par nœud
  const degree = new Map();
  nodes.forEach((_, id) => degree.set(id, 0));
  edges.forEach(({ fromId, toId }) => {
    degree.set(fromId, (degree.get(fromId) || 0) + 1);
    degree.set(toId,   (degree.get(toId)   || 0) + 1);
  });
  const maxDegree = Math.max(...degree.values(), 1);

  return { nodes: Array.from(nodes.values()), edges, degree, maxDegree };
}
