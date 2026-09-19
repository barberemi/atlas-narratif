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

const HERO_STAGE_KEYS = [
  'ordinary_world', 'call_to_adventure', 'refusal', 'mentor', 'threshold',
  'tests', 'inmost_cave', 'ordeal', 'reward',
  'road_back', 'resurrection', 'return_with_elixir',
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
  "plantsDB": [],
  "threadsDB": [],
  "heroJourneyDB": [],
  "customTypesDB": [],
  "customEntitiesDB": [],
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
- Plants      : préfixe \`plt_\` + slug court en snake_case (ex: \`plt_prophetie_epee\`)
- Fils narratifs : préfixe \`thr_\` + slug court en snake_case (ex: \`thr_quete_tresor\`)
- Volumes     : préfixe \`vol_\` + titre court en snake_case (ex: \`vol_l_eveil\`)
- Types custom : préfixe \`ctype_\` + slug du type en snake_case (ex: \`ctype_langue\`)
- Entités custom : préfixe \`cent_\` + slug du nom en snake_case (ex: \`cent_quenya\`)

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
  inscription: string | null,
  status: "active" | "destroyed" | "lost" | null,  // état actuel de l'objet
  statusChangedAtChapter: number | null             // chapitre où le statut a changé (ex: destruction)
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
  ],
  beatId: string | null,          // ID du beat Save the Cat incarné par cette scène (cf. chaptersDB[].beats)
  povCharacterId: string | null,  // ID du personnage dont on suit le point de vue
  threadIds: string[],            // IDs des fils narratifs auxquels cette scène appartient (threadsDB[].id)
  sceneGoal: string | null,       // objectif du personnage dans la scène
  sceneConflict: string | null,   // obstacle ou tension
  sceneOutcome: string | null     // résultat de la scène (réussite, échec, twist…)
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
  beats: string[],               // IDs des beats STC incarnés ici
  volumeId: string | null         // ID du tome (volumes[].id), null si mono-tome
}
\`\`\`

### plantsDB[]
Amorces narratives (plant / payoff) : un élément posé tôt dans le récit qui trouve sa résolution plus tard.
\`\`\`
{
  id: string,                      // préfixe "plt_" + slug court (ex: "plt_prophetie_epee")
  label: string,                   // description courte de l'amorce (< 80 chars)
  type: "information" | "objet" | "personnage" | "lieu" | "dialogue" | "symbole",
  plant_chapter_num: number,       // chapitre où l'amorce est posée
  plant_event_id: string | null,   // ID de l'événement source (timelineDB[].id)
  payoff_chapter_num: number | null, // chapitre du payoff (null si non résolu dans le texte)
  payoff_event_id: string | null,  // ID de l'événement de résolution (timelineDB[].id)
  entity_id: string | null,        // entité liée (personnage, lieu ou objet)
  entity_type: "character" | "location" | "object" | null,
  status: "open" | "resolved" | "abandoned", // "open" si le payoff n'apparaît pas dans le texte
  notes: string | null,
  plantVolumeId: string | null,    // tome de l'amorce
  payoffVolumeId: string | null    // tome du payoff (peut différer si plant cross-tomes)
}
\`\`\`

### threadsDB[]
Fils narratifs (intrigues principales et secondaires) qui traversent le récit.
\`\`\`
{
  id: string,                      // préfixe "thr_" + slug court (ex: "thr_quete_tresor")
  name: string,                    // nom du fil narratif
  color: string,                   // couleur hex lisible sur fond sombre
  role: "main_plot" | "subplot" | "thematic" | "relationship",
  description: string | null,      // résumé du fil narratif en 1-2 phrases
  sort_order: number               // 0 pour l'intrigue principale, puis 1, 2, 3…
}
\`\`\`

### heroJourneyDB[]
Voyage du Héros (Joseph Campbell) — 12 étapes archétypales, une entrée par étape par personnage héroïque identifié.
Les \`stageKey\` disponibles sont : ${HERO_STAGE_KEYS.join(', ')}.

Phases :
- **Départ** : ordinary_world → threshold
- **Initiation** : tests → reward
- **Retour** : road_back → return_with_elixir

Ne génère des entrées que pour les personnages qui suivent un arc héroïque clair. Ne force pas les 12 étapes si certaines ne sont pas identifiables dans le texte.
\`\`\`
{
  stageKey: string,                // une des 12 clés ci-dessus
  characterId: string,             // ID du personnage (characters[].id)
  chapterNum: number | null,       // chapitre où cette étape se manifeste
  summary: string | null,          // description en 1-2 phrases de comment l'étape se manifeste
  volumeId: string | null          // ID du tome (volumes[].id), null si mono-tome
}
\`\`\`

### customTypesDB[]
Types d'entités **custom** : catégories propres à l'univers qui ne sont NI personnage, NI lieu, NI objet (ex: Langue, Véhicule, Sortilège, Créature, Faction technologique…). Ne crée un type que si le texte contient plusieurs entités d'une même catégorie hors noyau typé.
\`\`\`
{
  id: string,                      // préfixe "ctype_" + slug du type (ex: "ctype_langue")
  label: string,                   // nom du type au singulier (ex: "Langue")
  icon: string | null,             // un emoji représentatif (ex: "🗣️"), sinon null
  color: string | null,            // couleur hex lisible sur fond sombre, sinon null
  fieldSchema: [                    // champs communs aux entités de ce type (peut être [])
    { key: string, label: string, type: "text" | "number" | "list" }
  ]
}
\`\`\`

### customEntitiesDB[]
Instances rattachées à un type custom via \`typeId\`.
\`\`\`
{
  id: string,                      // préfixe "cent_" + slug du nom (ex: "cent_quenya")
  typeId: string,                  // ID du type (customTypesDB[].id)
  name: string,                    // nom de l'entité
  aliases: string[],               // autres appellations (peut être [])
  description: string | null,      // description en 1-2 phrases
  customFields: object             // dictionnaire clé→valeur, idéalement les clés de fieldSchema du type (peut être {})
}
\`\`\`

---

## Règles importantes

1. Si l'information n'est pas disponible dans le texte, utilise \`null\` ou tableau vide — NE INVENTE PAS.
2. Les IDs doivent être cohérents : un même personnage a toujours le même ID partout (entities, links, holders…).
3. Limite les incohérences aux vraies contradictions — pas aux imprécisions stylistiques.
4. Pour les beats STC : ne pas créer de chapitre si aucun moment du texte ne correspond clairement.
5. \`journeys\` est toujours un tableau vide \`[]\`.
6. Les couleurs des personnages doivent être distinctes et lisibles sur fond sombre (#15171b).
7. **Cohérence groupes ↔ personnages** : tout groupe mentionné dans \`characters[].affiliation\` doit être défini dans \`groupsDB\`, et tout personnage listé dans \`groupsDB[].members\` doit figurer dans \`characters[]\`. Les \`characterId\` de \`members\` doivent correspondre exactement aux \`id\` des personnages.
8. **Cohérence lieux ↔ personnages** : les IDs dans \`locations[].inhabitants\` et \`locations[].visitedBy\` doivent correspondre à des \`id\` existants dans \`characters[]\`.
9. **Cohérence plants ↔ événements** : les \`plant_event_id\` et \`payoff_event_id\` dans \`plantsDB\` doivent correspondre à des \`id\` existants dans \`timelineDB\`.
10. **Cohérence threads ↔ événements** : les \`threadIds\` dans \`timelineDB\` doivent correspondre à des \`id\` existants dans \`threadsDB\`.
11. **Voyage du Héros** : ne génère des entrées \`heroJourneyDB\` que pour les personnages ayant un arc héroïque marqué. Un personnage secondaire sans transformation claire ne doit pas être forcé dans le schéma de Campbell.
12. **Entités custom** : n'utilise \`customTypesDB\` / \`customEntitiesDB\` que pour des catégories hors noyau (ni personnage, ni lieu, ni objet). Chaque \`customEntitiesDB[].typeId\` doit correspondre à un \`id\` défini dans \`customTypesDB\`. Ne crée pas de type pour une catégorie ne comptant qu'une seule entité anecdotique.

---

Voici le texte à analyser :

▼ COLLEZ VOTRE TEXTE ICI ▼`;
}
