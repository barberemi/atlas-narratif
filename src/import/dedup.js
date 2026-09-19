/**
 * Détection de doublons candidats dans un payload canonique AVANT le seed.
 *
 * Recherche floue (Fuse.js) des noms proches au sein d'un même bucket, en tenant
 * compte des alias. Retourne des paires candidates avec un score de proximité.
 */

import Fuse from 'fuse.js';

const THRESHOLD = 0.34; // 0 = identique, 1 = tout ; en dessous = candidat doublon

function candidatesInBucket(bucket, items) {
  if (items.length < 2) return [];
  const fuse = new Fuse(items, {
    keys: ['name', 'aliases'],
    includeScore: true,
    threshold: THRESHOLD,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  const pairs = [];
  const seen = new Set();
  items.forEach((item, i) => {
    for (const res of fuse.search(item.name ?? '')) {
      const j = res.refIndex;
      if (j === i) continue;
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (seen.has(key)) continue;
      seen.add(key);
      pairs.push({ bucket, a: item.name, b: items[j].name, score: Number((res.score ?? 0).toFixed(3)) });
    }
  });
  return pairs;
}

/**
 * @param {Object} data - { loreDB:{characters,locations,objects}, customEntitiesDB }
 * @returns {Array<{ bucket, a, b, score }>} paires candidates (score croissant)
 */
export function findDuplicateCandidates(data = {}) {
  const buckets = {
    characters: data.loreDB?.characters ?? [],
    locations:  data.loreDB?.locations ?? [],
    objects:    data.loreDB?.objects ?? [],
    customEntities: data.customEntitiesDB ?? [],
  };
  return Object.entries(buckets)
    .flatMap(([bucket, items]) => candidatesInBucket(bucket, items))
    .sort((a, b) => a.score - b.score);
}
