import { getLoreCache } from './entityUtils';

// ── Couleurs par type de relation ───────────────────────────────────────────
export const RELATION_COLORS = {
  fellowship:  '#3F51B5',  // Communauté de l'Anneau
  ally:        '#06B6D4',  // Allié / affilié
  holds:       '#F59E0B',  // Possède un objet
  held_by:     '#F59E0B',  // Porté par un personnage
  origin:      '#10B981',  // Lieu d'origine / originaire
  created_in:  '#8B5CF6',  // Forgé dans ce lieu
  created_by:  '#EF4444',  // Créé par ce personnage
  visited_by:  '#64748B',  // Lieu visité par un personnage
  visited:     '#64748B',  // Personnage ayant visité un lieu
};

export const RELATION_LABELS = {
  fellowship:  'Communauté',
  ally:        'Allié',
  holds:       'Possède',
  held_by:     'Porté par',
  origin:      'Origine',
  created_in:  'Forgé à',
  created_by:  'Créé par',
  visited_by:  'Visité par',
  visited:     'A visité',
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
export function buildGraph(entityId) {
  const { characters, locations, objects } = getLoreCache();

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
    // Personnages avec affiliation commune
    for (const aff of (central.affiliation ?? [])) {
      for (const char of characters) {
        if (char.id === entityId) continue;
        if ((char.affiliation ?? []).includes(aff)) {
          addNode(char, 'character');
          const rel = aff === "La Communauté de l'Anneau" ? 'fellowship' : 'ally';
          addEdge(entityId, char.id, rel);
        }
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
    // Personnages affiliés à ce lieu
    for (const char of characters) {
      if (!nodes.has(char.id) && char.id !== entityId) {
        if ((char.affiliation ?? []).some(a => nameIncludes(a, central.name))) {
          addNode(char, 'character');
          addEdge(entityId, char.id, 'ally');
        }
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

  // Tri des satellites : personnages → lieux → objets
  const typeOrder = { character: 0, location: 1, object: 2 };
  const satellites = Array.from(nodes.values())
    .sort((a, b) => typeOrder[a.entityType] - typeOrder[b.entityType]);

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

// ── buildFullGraph ────────────────────────────────────────────────────────────
/**
 * Construit le graphe complet de TOUTES les entités et TOUTES les relations.
 * Retourne : { nodes, edges, degree, maxDegree }
 */
export function buildFullGraph() {
  const { characters, locations, objects } = getLoreCache();

  const nodes   = new Map();
  const edgeSet = new Set();
  const edges   = [];

  characters.forEach(c => nodes.set(c.id, { ...c, entityType: 'character' }));
  locations.forEach(l  => nodes.set(l.id, { ...l, entityType: 'location'  }));
  objects.forEach(o   => nodes.set(o.id, { ...o, entityType: 'object'    }));

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
    // Communauté / alliés via affiliations communes
    for (const aff of (char.affiliation ?? [])) {
      for (const other of characters) {
        if (other.id === char.id) continue;
        if ((other.affiliation ?? []).includes(aff)) {
          addEdge(char.id, other.id, aff === "La Communauté de l'Anneau" ? 'fellowship' : 'ally');
        }
      }
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

  // Personnages affiliés à un lieu
  for (const loc of locations) {
    for (const char of characters) {
      if ((char.affiliation ?? []).some(a => nameIncludes(a, loc.name))) {
        addEdge(loc.id, char.id, 'ally');
      }
    }
  }

  // Relations visitedBy depuis les lieux
  for (const loc of locations) {
    for (const visitor of (loc.visitedBy ?? [])) {
      addEdge(loc.id, visitor.id, 'visited_by');
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
