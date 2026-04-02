/**
 * Générateur du prompt d'analyse narrative pour Atlas Narratif.
 * Ce prompt est conçu pour être utilisé dans n'importe quel outil IA
 * (ChatGPT, Gemini, Claude, Mistral…) — sans clé API.
 * L'utilisateur colle son texte à la fin et importe le JSON résultant.
 */

const BEAT_IDS = [
  'opening_image', 'theme_stated', 'setup', 'catalyst', 'debate',
  'break_into_two', 'b_story', 'fun_and_games', 'midpoint', 'bad_guys',
  'all_is_lost', 'dark_night', 'break_into_three', 'finale', 'final_image',
];

/**
 * @param {{ projectName?: string, projectDesc?: string }} opts
 * @returns {string} prompt complet prêt à l'emploi
 */
export function buildAnalysisPrompt({ projectName = '', projectDesc = '' } = {}) {
  const headerLines = [
    '# Analyse narrative — Atlas Narratif',
    projectName ? `Projet : ${projectName}` : null,
    projectDesc ? `Description : ${projectDesc}` : null,
  ].filter(Boolean).join('\n');

  return `${headerLines}

Tu es un assistant spécialisé en analyse narrative. À partir du texte fourni (manuscrit, brouillon ou notes d'auteur), tu extrais les données structurées d'un roman et tu les retournes en JSON strict.

## Format de sortie

Réponds UNIQUEMENT avec un bloc \`\`\`json ... \`\`\` contenant l'objet suivant. Aucun texte avant ou après.

\`\`\`json
{
  "volumes": [],
  "loreDB": {
    "characters": [],
    "locations": [],
    "objects": []
  },
  "groupsDB": [],
  "timelineDB": [],
  "incoherencesDB": [],
  "chaptersDB": [],
  "journeys": []
}
\`\`\`

---

## Détection multi-tomes

Si le texte couvre plusieurs tomes/livres/volumes d'une même série, renseigne le tableau \`volumes\` et associe chaque événement à son tome via \`volumeId\`. Si le texte est un roman unique, laisse \`volumes\` vide et \`volumeId\` à \`null\` partout.

### volumes[]
\`\`\`
{
  id: string,         // préfixe "vol_" + slug court (ex: "vol_l_eveil")
  number: number,     // ordre chronologique (1, 2, 3…)
  title: string,      // titre du tome
  description: string | null
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
- Groupes     : préfixe \`grp_\` + nom court en snake_case (ex: \`grp_hobbits\`)
- Volumes     : préfixe \`vol_\` + titre court en snake_case (ex: \`vol_l_eveil\`)

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
  affiliation: string[],         // noms des groupes/factions/familles — doit correspondre aux entrées de groupsDB
  description: string,           // portrait complet en 2-4 phrases
  traits: string[],              // 3-5 traits de caractère
  color: string                  // couleur hex distincte par personnage, lisible sur fond sombre
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
  coordinates: null,             // toujours null
  inhabitants: string[],         // IDs des personnages résidents (characters[].id)
  visitedBy: string[],           // IDs des personnages de passage (characters[].id)
  keyPlaces: string[]            // sous-lieux notables (noms courts, pas des IDs)
}
\`\`\`

### objects[]
\`\`\`
{
  id: string,
  name: string,
  type: string | null,           // ex: "arme", "artefact", "document"
  description: string | null,
  creator: string | null,        // nom du créateur (texte libre, pas forcément un ID)
  currentHolder: string | null,  // ID du personnage détenteur actuel (characters[].id)
  powers: string[],
  holders: string[],             // historique des détenteurs (IDs ou noms)
  createdIn: string | null,
  inscription: string | null
}
\`\`\`

### groupsDB[]
Regroupe les personnages par appartenance : races, factions, ordres, familles, guildes, etc.
\`\`\`
{
  id: string,           // préfixe "grp_" + slug court (ex: "grp_hobbits")
  name: string,
  type: string,         // ex: "Race", "Faction", "Ordre", "Famille", "Guilde"
  color: string,        // couleur hex lisible sur fond sombre
  description: string | null,
  homelandId: string | null,   // ID du lieu d'origine du groupe (locations[].id)
  members: [
    { characterId: string }    // IDs des personnages membres (characters[].id)
  ]
}
\`\`\`

### timelineDB[]
\`\`\`
{
  id: string,
  chapter: number,               // numéro du chapitre NARRATIF (où la scène est racontée)
  chapterTitle: string,          // titre du chapitre réel (ne pas laisser vide)
  title: string,
  description: string | null,    // résumé en 1-3 phrases
  locationId: string | null,
  volumeId: string | null,       // ID du tome (volumes[].id), null si mono-tome
  isFlashback: boolean,          // true si la scène est un flashback (racontée hors ordre chronologique)
  storyChapterRef: number | null, // position diégétique approximative : chapitre "réel" dans l'histoire
                                 // (ex: -10 = très avant le début, 3 = entre ch.3 et ch.4 de l'histoire)
                                 // null si isFlashback est false ou si la position est indéterminée
  entities: [
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
  explanation: string,
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
  summary: string | null,
  beats: string[]                // IDs des beats STC incarnés ici
}
\`\`\`

---

## Règles importantes

1. Si l'information n'est pas disponible dans le texte, utilise \`null\` ou tableau vide — NE INVENTE PAS.
2. Les IDs doivent être cohérents : un même personnage a toujours le même ID partout (entities, links, holders…).
3. Limite les incohérences aux vraies contradictions — pas aux imprécisions stylistiques.
4. Pour les beats STC : ne pas créer de chapitre si aucun moment du texte ne correspond clairement.
5. \`journeys\` est toujours un tableau vide \`[]\`.
6. Les couleurs des personnages doivent être distinctes et lisibles sur fond sombre (#0B1621).
7. **Cohérence groupes ↔ personnages** : tout groupe mentionné dans \`characters[].affiliation\` doit être défini dans \`groupsDB\`, et tout personnage listé dans \`groupsDB[].members\` doit figurer dans \`characters[]\`. Les \`characterId\` de \`members\` doivent correspondre exactement aux \`id\` des personnages.
8. **Cohérence lieux ↔ personnages** : les IDs dans \`locations[].inhabitants\` et \`locations[].visitedBy\` doivent correspondre à des \`id\` existants dans \`characters[]\`.

---

Voici le texte à analyser :

▼ COLLEZ VOTRE TEXTE ICI ▼`;
}
