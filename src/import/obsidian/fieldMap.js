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

/**
 * Indices de note NARRATIVE (scène → événement timeline, chapitre → chapitre STC).
 * Prioritaire sur TYPE_HINTS : une note « scène » n'est pas une entité lore.
 */
export const NARRATIVE_HINTS = {
  scene:   ['scene', 'scenes', 'sequence', 'sequences'],
  chapter: ['chapter', 'chapters', 'chapitre', 'chapitres'],
};

/** Synonymes des champs propres aux notes scène/chapitre → clé canonique. */
export const SCENE_FIELD_SYNONYMS = {
  chapter:     ['chapitre', 'chapter', 'chap', 'ch', 'chapitre narratif'],
  sceneOrder:  ['ordre', 'scene', 'order', 'sceneorder', 'position', 'ordre de scene', 'numero de scene'],
  pov:         ['pov', 'point de vue', 'point of view', 'narrateur', 'narrator', 'focalisation'],
  location:    ['lieu', 'location', 'endroit', 'place', 'setting', 'decor'],
  characters:  ['personnages', 'personnage', 'characters', 'character', 'perso', 'persos', 'cast', 'protagonistes'],
  locations:   ['lieux', 'locations', 'places'],
  objects:     ['objets', 'objet', 'objects', 'items', 'item'],
  volume:      ['tome', 'volume', 'livre', 'book', 'part', 'partie'],
  description: ['resume', 'summary', 'description', 'desc', 'synopsis', 'sommaire'],
  beat:        ['beat', 'beats', 'stc', 'save the cat'],
  threads:     ['threads', 'thread', 'fils', 'fil', 'subplots', 'subplot', 'intrigues', 'intrigue'],
  sceneGoal:   ['objectif', 'goal', 'but', 'scenegoal'],
  sceneConflict: ['conflit', 'conflict', 'obstacle', 'tension', 'sceneconflict'],
  sceneOutcome:  ['resultat', 'outcome', 'issue', 'denouement', 'sceneoutcome'],
  title:       ['titre', 'title', 'nom', 'name'],
  number:      ['numero', 'number', 'num', 'no', 'n'],
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
 * Classifie une note comme NARRATIVE ('scene'|'chapter') via son `type` de
 * frontmatter, ses tags ou son dossier. Retourne null si la note n'est pas une
 * scène/chapitre. À appeler AVANT classifyType (une scène n'est pas une entité).
 */
export function classifyNarrative({ frontmatter = {}, tags = [], folder = '' } = {}) {
  const candidates = [
    normalizeKey(frontmatter.type),
    ...tags.map(normalizeKey),
    normalizeKey(folder),
  ].filter(Boolean);

  for (const [kind, hints] of Object.entries(NARRATIVE_HINTS)) {
    const hintSet = hints.map(normalizeKey);
    if (candidates.some(c => hintSet.includes(c))) return kind;
  }
  return null;
}

/** Map une clé de note scène/chapitre vers une clé canonique, ou null si inconnue. */
export function mapSceneField(key) {
  const nk = normalizeKey(key);
  for (const [canonical, syns] of Object.entries(SCENE_FIELD_SYNONYMS)) {
    if (syns.some(s => normalizeKey(s) === nk)) return canonical;
  }
  for (const [canonical, syns] of Object.entries(SCENE_FIELD_SYNONYMS)) {
    if (syns.some(s => fuzzyMatch(normalizeKey(s), nk))) return canonical;
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
