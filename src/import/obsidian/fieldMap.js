/**
 * Dictionnaire de correspondance champ Obsidian → champ canonique + classification
 * du type d'entité. Multilingue (fr/en), extensible.
 *
 * SCAFFOLD (étape 4). Correspondance exacte + fuzzy simple (distance de Levenshtein
 * bornée). TODO : enrichir le dictionnaire, gérer d'autres langues, pondérer le fuzzy.
 */

/** Normalise une clé : minuscules, sans accents, séparateurs unifiés. */
export function normalizeKey(key) {
  return String(key ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[_\s-]+/g, ' ')
    .trim();
}

/** Synonymes de champs → clé canonique du modèle (characters/locations/objects). */
export const FIELD_SYNONYMS = {
  name:          ['name', 'nom', 'title', 'titre'],
  aliases:       ['alias', 'aliases', 'surnom', 'surnoms', 'autres noms', 'aka'],
  race:          ['race', 'espece', 'species', 'peuple'],
  role:          ['role', 'fonction', 'classe', 'class', 'metier'],
  origin:        ['origin', 'origine', 'provenance', 'birthplace', 'lieu de naissance'],
  affiliations:  ['affiliation', 'affiliations', 'faction', 'factions', 'groupe', 'groupes', 'appartenance'],
  traits:        ['traits', 'trait', 'caracteristiques', 'personnalite', 'personality'],
  description:   ['description', 'desc', 'resume', 'summary', 'bio', 'biographie', 'notes'],
  type:          ['type', 'categorie', 'category', 'kind'],
  regime:        ['regime', 'gouvernement', 'government'],
  inhabitants:   ['inhabitants', 'habitants', 'population', 'residents'],
  creator:       ['creator', 'createur', 'forgeron', 'maker', 'auteur'],
  currentHolder: ['holder', 'detenteur', 'porteur', 'owner', 'possesseur', 'current holder'],
  powers:        ['powers', 'pouvoirs', 'capacites', 'abilities', 'effets'],
};

/** Indices de type d'entité par tag / dossier / frontmatter "type". */
export const TYPE_HINTS = {
  character: ['character', 'characters', 'personnage', 'personnages', 'perso', 'npc', 'pnj', 'people', 'cast'],
  location:  ['location', 'locations', 'lieu', 'lieux', 'place', 'places', 'region', 'regions', 'ville', 'cities'],
  object:    ['object', 'objects', 'objet', 'objets', 'item', 'items', 'artifact', 'artefact', 'artefacts'],
};

/** Map une clé de note vers une clé canonique du noyau typé, ou null si inconnue. */
export function mapField(key) {
  const nk = normalizeKey(key);
  for (const [canonical, syns] of Object.entries(FIELD_SYNONYMS)) {
    if (syns.some(s => normalizeKey(s) === nk)) return canonical;
  }
  // Fuzzy : tolère une petite faute de frappe.
  for (const [canonical, syns] of Object.entries(FIELD_SYNONYMS)) {
    if (syns.some(s => fuzzyMatch(normalizeKey(s), nk))) return canonical;
  }
  return null;
}

/**
 * Classifie une note en type de noyau ('character'|'location'|'object') via son
 * `type` de frontmatter, ses tags ou son dossier. Retourne null si indéterminé
 * (→ candidat couche 3 : type custom).
 */
export function classifyType({ frontmatter = {}, tags = [], folder = '' } = {}) {
  const candidates = [
    normalizeKey(frontmatter.type),
    ...tags.map(normalizeKey),
    normalizeKey(folder),
  ].filter(Boolean);

  for (const [type, hints] of Object.entries(TYPE_HINTS)) {
    const hintSet = hints.map(normalizeKey);
    if (candidates.some(c => hintSet.includes(c))) return type;
  }
  return null;
}

/**
 * Distance de Levenshtein bornée : renvoie true si a et b sont à distance ≤ max
 * (défaut 1). Suffisant pour tolérer une faute de frappe sur un nom de champ.
 */
export function fuzzyMatch(a, b, max = 1) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > max) return false;
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  return dp[a.length][b.length] <= max;
}
