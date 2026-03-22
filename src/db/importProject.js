/**
 * Analyse un manuscrit ou des notes avec Claude et insère le projet en DB.
 * Étape C du pipeline d'import.
 *
 * @param {object} db
 * @param {object} opts
 *   content     : texte brut du manuscrit ou des notes
 *   mode        : 'manuscript' | 'notes'
 *   projectName : nom du projet (affiché)
 *   projectDesc : description optionnelle
 *   mapImage    : data URL base64 de la carte (optionnel)
 *   onProgress  : callback(message) pour afficher l'avancement
 * @returns {string} projectId inséré en DB
 */

import Anthropic from '@anthropic-ai/sdk';
import { seedProject } from './seed.generic';

// ── IDs des 15 beats Save the Cat (référence) ─────────────────────────────────
const BEAT_IDS = [
  'opening_image', 'theme_stated', 'setup', 'catalyst', 'debate',
  'break_into_two', 'b_story', 'fun_and_games', 'midpoint', 'bad_guys',
  'all_is_lost', 'dark_night', 'break_into_three', 'finale', 'final_image',
];

// ── Prompt système (texte seul) ───────────────────────────────────────────────
const SYSTEM_PROMPT = `
Tu es un assistant spécialisé en analyse narrative. À partir d'un texte (manuscrit ou notes d'auteur), tu extrais les données structurées d'un roman et tu les retournes en JSON strict.

## Format de sortie

Réponds UNIQUEMENT avec un bloc \`\`\`json ... \`\`\` contenant l'objet suivant. Aucun texte avant ou après.

\`\`\`json
{
  "loreDB": {
    "characters": [...],
    "locations": [...],
    "objects": [...]
  },
  "timelineDB": [...],
  "incoherencesDB": [...],
  "chaptersDB": [...],
  "journeys": []
}
\`\`\`

---

## Règles de génération des IDs

- Personnages : préfixe \`char_\` + prénom en snake_case (ex: \`char_alice\`)
- Lieux       : préfixe \`loc_\` + nom court en snake_case (ex: \`loc_paris\`)
- Objets      : préfixe \`obj_\` + nom en snake_case (ex: \`obj_epee_magique\`)
- Événements  : préfixe \`evt_\` + court résumé en snake_case (ex: \`evt_depart_alice\`)
- Incohérences: préfixe \`inc_\` + index numérique (ex: \`inc_001\`)
- Chapitres   : préfixe \`ch_\` + index numérique (ex: \`ch_01\`)

---

## Structure détaillée

### characters[]
\`\`\`
{
  id: string,
  name: string,                  // nom complet
  aliases: string[],             // surnoms, pseudonymes
  race: string | null,           // espèce/race si fantastique, sinon null
  role: string | null,           // rôle narratif (ex: "Protagoniste", "Antagoniste")
  origin: string | null,         // lieu ou milieu d'origine
  affiliation: string[],         // groupes, factions, familles
  description: string,           // portrait complet en 2-4 phrases
  traits: string[],              // 3-5 traits de caractère
  color: string                  // couleur hex distincte par personnage
}
\`\`\`

### locations[]
\`\`\`
{
  id: string,
  name: string,
  type: string | null,           // ex: "ville", "forêt", "bâtiment"
  regime: string | null,         // régime politique/social si pertinent
  description: string | null,
  coordinates: null,             // toujours null (carte non gérée ici)
  inhabitants: string[],         // IDs des personnages qui y vivent
  visitedBy: string[],           // IDs des personnages qui y passent
  keyPlaces: string[]            // sous-lieux notables (noms courts)
}
\`\`\`

### objects[]
\`\`\`
{
  id: string,
  name: string,
  type: string | null,           // ex: "arme", "artefact", "document"
  description: string | null,
  creator: string | null,        // nom ou ID du créateur
  currentHolder: string | null,  // ID du détenteur actuel
  powers: string[],              // pouvoirs ou propriétés notables
  holders: string[],             // historique des détenteurs (IDs ou noms)
  createdIn: string | null,      // lieu de création
  inscription: string | null     // inscription si objet symbolique
}
\`\`\`

### timelineDB[]
\`\`\`
{
  id: string,
  chapter: number,               // numéro du chapitre
  chapterTitle: string | null,
  title: string,                 // titre court de l'événement
  description: string | null,   // résumé en 1-3 phrases
  locationId: string | null,    // ID du lieu principal
  entities: [                   // personnages/objets impliqués
    { id: string, entityType: "character" | "location" | "object" }
  ]
}
\`\`\`

### incoherencesDB[]
Détecte les vraies incohérences narratives : contradictions chronologiques, comportements incompatibles avec le profil d'un personnage, informations contradictoires entre deux scènes, objets au mauvais endroit, etc.
\`\`\`
{
  id: string,
  type: "timeline" | "character" | "location" | "object" | "logic",
  severity: "critical" | "high" | "medium" | "low",
  title: string,                 // titre court (< 60 chars)
  explanation: string,           // explication précise de la contradiction
  links: [
    { entityId: string, entityType: "character" | "location" | "object", label: string | null }
  ]
}
\`\`\`

### chaptersDB[]
Analyse la STRUCTURE NARRATIVE (arc dramatique) indépendamment de la chronologie des événements.
Crée UN chapitre par beat Save the Cat identifié dans le texte.
Les beats disponibles sont : ${BEAT_IDS.join(', ')}.

Un chapitre Save the Cat peut regrouper plusieurs chapitres réels. Ne force pas un beat par chapitre réel.

\`\`\`
{
  id: string,
  number: number,                // ordre dans la structure narrative (1, 2, 3…)
  title: string,                 // ex: "La lettre mystérieuse (Chap. 1)"
  summary: string | null,        // résumé de la fonction narrative de ce moment
  beats: string[]                // IDs des beats Save the Cat que ce moment incarne
                                 // ex: ["opening_image"] ou ["all_is_lost", "dark_night"]
}
\`\`\`

---

## Règles importantes

1. Si l'information n'est pas disponible dans le texte, utilise \`null\` ou tableau vide — NE INVENTE PAS.
2. Les IDs doivent être cohérents : un même personnage a toujours le même ID partout (dans entities, links, holders, etc.).
3. Limite les incohérences aux vraies contradictions — pas aux imprécisions stylistiques.
4. Pour les beats STC : ne pas créer de chapitre pour un beat si aucun moment du texte ne lui correspond clairement.
5. \`journeys\` est toujours un tableau vide \`[]\` — sauf si une carte est fournie (voir instructions séparées).
6. Les couleurs des personnages doivent être distinctes et lisibles sur fond sombre.
`.trim();

// ── Supplément prompt si une carte est fournie ────────────────────────────────
const MAP_PROMPT_SUPPLEMENT = `
Une image de carte est jointe. En plus de l'analyse narrative, génère également les trajets (\`journeys\`) des personnages principaux.

### journeys[]
\`\`\`
[
  {
    "key": "char_key_du_personnage",  // doit correspondre au journeyKey du personnage dans loreDB
    "data": [
      {
        "id": "step_unique_id",
        "x": 42.5,          // position horizontale en % (0 = bord gauche, 100 = bord droit)
        "y": 31.2,          // position verticale en % (0 = haut, 100 = bas)
        "label": "Nom du lieu",
        "scene": 3,         // numéro du chapitre
        "description": "Ce qui se passe ici en 1-2 phrases"
      }
    ]
  }
]
\`\`\`

Règles pour les trajets :
- Observe attentivement la carte et place les points aux positions géographiques réelles des lieux.
- Les coordonnées (x, y) sont des pourcentages 0-100 sur l'image fournie.
- Crée uniquement les trajets des personnages dont le déplacement est clairement décrit dans le texte.
- Assigne le même \`journeyKey\` dans \`loreDB.characters[].journeyKey\` que dans \`journeys[].key\`.
- Minimum 3 étapes par trajet, maximum 20.
`.trim();

// ── Config modèles ────────────────────────────────────────────────────────────
export const MODELS = {
  sonnet: {
    id:         'claude-sonnet-4-6',
    label:      'Sonnet 4.6',
    maxTokens:  16000,
    desc:       'Rapide · Notes & petits textes',
    hint:       null,
  },
  opus: {
    id:         'claude-opus-4-6',
    label:      'Opus 4.6',
    maxTokens:  32000,
    desc:       'Meilleure qualité · Manuscrits complets',
    hint:       'Recommandé pour les livres > 100 pages',
  },
};

// ── Fonction principale ───────────────────────────────────────────────────────
export async function analyzeAndImport(db, { content, mode, projectName, projectDesc, mapImage, model = 'sonnet', onProgress }) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('Clé API Anthropic manquante — définis VITE_ANTHROPIC_API_KEY dans .env');
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true });

  const modeLabel   = mode === 'manuscript' ? 'manuscrit complet' : 'notes d\'auteur';
  const textContent = `Voici les ${modeLabel} à analyser :\n\n${content}`;
  const systemPrompt = mapImage
    ? `${SYSTEM_PROMPT}\n\n${MAP_PROMPT_SUPPLEMENT}`
    : SYSTEM_PROMPT;

  onProgress?.(mapImage ? 'Analyse du texte et de la carte par Claude…' : 'Analyse du texte par Claude…');

  // Construction du message utilisateur : texte seul, ou texte + image de carte
  const userContent = mapImage
    ? [
        {
          type: 'image',
          source: {
            type:       'base64',
            media_type: mapImage.split(';')[0].split(':')[1], // 'image/jpeg' | 'image/png'
            data:       mapImage.split(',')[1],
          },
        },
        { type: 'text', text: textContent },
      ]
    : textContent;

  const { id: modelId, maxTokens } = MODELS[model] ?? MODELS.sonnet;

  const message = await client.messages.create({
    model:      modelId,
    max_tokens: maxTokens,
    system:     systemPrompt,
    messages:   [{ role: 'user', content: userContent }],
  });

  onProgress?.('Traitement de la réponse…');

  const raw  = message.content[0]?.text ?? '';
  const match = raw.match(/```json\s*([\s\S]*?)```/);
  if (!match) throw new Error('La réponse de Claude ne contient pas de JSON valide.');

  let data;
  try {
    data = JSON.parse(match[1]);
  } catch {
    throw new Error('Erreur de parsing JSON dans la réponse de Claude.');
  }

  // Garantir les tableaux requis
  data.loreDB         ??= { characters: [], locations: [], objects: [] };
  data.timelineDB     ??= [];
  data.incoherencesDB ??= [];
  data.chaptersDB     ??= [];
  // Si pas de carte, journeys = [] ; si carte, Claude les a générés
  if (!mapImage) data.journeys = [];

  onProgress?.('Insertion en base de données…');

  const projectId = slugify(projectName);
  await seedProject(
    db,
    { id: projectId, name: projectName, description: projectDesc || null, mapImage: mapImage || null },
    data,
  );

  return projectId;
}

// ── Utilitaire ────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // accents
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 40);
}
