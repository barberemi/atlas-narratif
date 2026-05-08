/**
 * Données narratives — Le Seigneur des Anneaux : Les Deux Tours (Tome 2)
 *
 * Complément de lotr_seed_data.js pour le second tome.
 * Fusionné dans seed.lotr.js avec les données du Tome 1.
 */

// ── Personnages nouveaux (T2) ─────────────────────────────────────────────────

export const t2Characters = [
  {
    id: 'char_gollum',
    name: 'Gollum',
    aliases: ['Sméagol', 'Mon Précieux', 'Le Guide'],
    race: 'Hobbit dégénéré (Stoor)',
    role: 'Guide ambigu, ancien Porteur de l\'Anneau',
    origin: 'Les Champs Gladden (terres de la rivière Anduin)',
    affiliation: ['L\'Anneau Unique (obsession)'],
    description:
      'Autrefois Sméagol, hobbit-stoor des Champs Gladden. L\'Anneau le corrompit sur cinq cents ans, le transformant en une créature torturée, divisée entre sa part restante d\'humanité (Sméagol) et la voix de l\'obsession (Gollum). Il connaît le chemin vers le Mordor mieux que quiconque.',
    traits: ['Furtif', 'Dépendant de l\'Anneau', 'Divisé intérieurement', 'Connaisseur des chemins secrets'],
    color: '#9CA3AF',
    journeyKey: null,
  },
  {
    id: 'char_theoden',
    name: 'Théoden',
    aliases: ['Roi Théoden', 'Théoden Ednew (le Renouvelé)'],
    race: 'Homme (Rohirrim)',
    role: 'Roi du Rohan',
    origin: 'Edoras — Méduseld',
    affiliation: ['Rohan', 'Alliance de l\'Ouest'],
    description:
      'Roi du Rohan, paralysé par la sorcellerie de Grima Langue-de-Serpent — agent de Saroumane. Libéré par Gandalf le Blanc, il renaît comme chef de guerre et conduit son peuple à la bataille du Gouffre de Helm. Sa mort au Champ du Pelennor sera l\'un des actes héroïques les plus célébrés de la Guerre.',
    traits: ['Vieilli avant l\'âge (sous emprise)', 'Vaillant une fois libéré', 'Fier de son peuple', 'Père endeuillé'],
    color: '#B45309',
    journeyKey: null,
  },
  {
    id: 'char_eomer',
    name: 'Éomer',
    aliases: ['Maréchal de la Marche', 'Troisième Maréchal'],
    race: 'Homme (Rohirrim)',
    role: 'Troisième Maréchal du Riddermark',
    origin: 'Rohan — Edoras',
    affiliation: ['Rohan', 'Alliance de l\'Ouest'],
    description:
      'Neveu de Théoden et futur roi du Rohan. Guerrier impétueux et loyal, il prend des décisions indépendantes lorsque l\'honneur l\'exige — ce qui lui vaut d\'être temporairement banni par Théoden sous l\'influence de Grima. Sa cavalerie légère sera décisive dans plusieurs batailles.',
    traits: ['Impétueux', 'Loyal', 'Guerrier redoutable', 'Sens aigu de l\'honneur'],
    color: '#D97706',
    journeyKey: null,
  },
  {
    id: 'char_eowyn',
    name: 'Éowyn',
    aliases: ['La Dame de Rohan', 'Dernhelm (déguisement)'],
    race: 'Femme (Rohirrim)',
    role: 'Nièce du roi Théoden, guerrière dissimulée',
    origin: 'Rohan — Edoras',
    affiliation: ['Rohan'],
    description:
      'Nièce de Théoden et sœur d\'Éomer. Prisonnière du rôle qu\'on lui assigne, elle aspire à se battre pour son peuple. Sa réponse au Roi-Sorcier — "Je ne suis pas un homme" — est l\'un des moments les plus célèbres de l\'histoire de la Terre du Milieu.',
    traits: ['Courageuse', 'Refusant les contraintes', 'Mélancolique', 'Déterminée'],
    color: '#F0ABFC',
    journeyKey: null,
  },
  {
    id: 'char_faramir',
    name: 'Faramir',
    aliases: ['Capitaine de Gondor', 'Fils du Sénéchal'],
    race: 'Homme (Gondorien)',
    role: 'Capitaine des Rangers d\'Ithilien',
    origin: 'Minas Tirith — Gondor',
    affiliation: ['Gondor', 'Les Rangers d\'Ithilien'],
    description:
      'Fils cadet de Denethor II et frère de Boromir. Là où Boromir cherchait la puissance pour sauver Gondor, Faramir cherche la sagesse. Sa rencontre avec Frodo en Ithilien est un test de sa vertu : l\'Anneau est à sa portée, et il choisit de ne pas le prendre.',
    traits: ['Sage', 'Juste', 'Discret', 'Amour des lettres et de la nature'],
    color: '#6366F1',
    journeyKey: null,
  },
  {
    id: 'char_treebeard',
    name: 'Sylvebarbe',
    aliases: ['Fangorn', 'Treebeard', 'Le plus vieux des Vivants'],
    race: 'Ent',
    role: 'Berger des arbres, Ent le plus ancien',
    origin: 'Forêt de Fangorn',
    affiliation: ['Les Ents', 'Forêt de Fangorn'],
    description:
      'Le plus vieil Ent de la Terre du Milieu, berger des arbres de Fangorn depuis les Premiers Âges. Les Ents sont des êtres d\'une lenteur délibérée — ils ne parlent jamais de rien à la hâte. Mais quand Sylvebarbe comprend l\'ampleur du massacre d\'Isengard, il convoque l\'Ent-moot et conduit les Ents à la guerre.',
    traits: ['Lent et délibéré', 'Immense mémoire', 'Colère terrible une fois éveillée', 'Gardien de la nature'],
    color: '#16A34A',
    journeyKey: null,
  },
];

// ── Lieux nouveaux (T2) ───────────────────────────────────────────────────────

export const t2Locations = [
  {
    id: 'loc_emyn_muil',
    name: 'Emyn Muil',
    type: 'Collines rocheuses',
    regime: 'Terres sauvages',
    description:
      'Labyrinthe de collines rocheuses et de falaises sur la rive est de l\'Anduin, au sud des Chutes de Rauros. Un terrain d\'une hostilité extrême — rochers glissants, précipices dissimulés, orientations impossibles. C\'est ici que Frodo et Sam capturent Gollum qui les suit depuis la Lothlórien.',
    coordinates: { x: 62, y: 50 },
    inhabitants: [],
    keyPlaces: ['Les Parois d\'Emyn Muil', 'La Rive de l\'Anduin'],
    visitedBy: [
      { id: 'char_frodo',  name: 'Frodo Sacquet',    color: '#10B981' },
      { id: 'char_sam',    name: 'Samsagace Gamegie', color: '#78716C' },
      { id: 'char_gollum', name: 'Gollum',            color: '#9CA3AF' },
    ],
  },
  {
    id: 'loc_dead_marshes',
    name: 'Marais des Morts',
    type: 'Marais maudits',
    regime: 'Terres de Sauron (influence)',
    description:
      'Vaste zone marécageuse à l\'est de l\'Emyn Muil, anciennement le champ de bataille de Dagorlad où les armées des peuples libres affrontèrent Sauron. Les visages des morts des deux camps y flottent encore sous les eaux noires — des illusions ou de vraies âmes, nul ne le sait. Y regarder est mortellement dangereux.',
    coordinates: { x: 65, y: 57 },
    inhabitants: ['Esprits des morts de Dagorlad'],
    keyPlaces: ['Les Feux des Morts', 'Les Roseaux noirs'],
    visitedBy: [
      { id: 'char_frodo',  name: 'Frodo Sacquet',    color: '#10B981' },
      { id: 'char_sam',    name: 'Samsagace Gamegie', color: '#78716C' },
      { id: 'char_gollum', name: 'Gollum',            color: '#9CA3AF' },
    ],
  },
  {
    id: 'loc_fangorn',
    name: 'Forêt de Fangorn',
    type: 'Forêt ancienne',
    regime: 'Domaine des Ents',
    description:
      'La plus ancienne forêt de la Terre du Milieu, vestige de l\'ère où les arbres couvraient le monde entier. Peuplée d\'arbres qui voient et parfois agissent. C\'est ici que Merry et Pippin, fuyant les Uruk-haï, rencontrent Sylvebarbe. C\'est aussi ici qu\'Aragorn, Legolas et Gimli retrouvent Gandalf, revenu en Blanc.',
    coordinates: { x: 52, y: 48 },
    inhabitants: ['Ents', 'Arbres-fantômes (Huorns)'],
    keyPlaces: ['L\'Antre de Sylvebarbe', 'Le Lieu de l\'Ent-moot'],
    visitedBy: [
      { id: 'char_merry',     name: 'Meriadoc Brandebouc', color: '#78716C' },
      { id: 'char_pippin',    name: 'Peregrin Touque',     color: '#78716C' },
      { id: 'char_treebeard', name: 'Sylvebarbe',           color: '#16A34A' },
      { id: 'char_aragorn',   name: 'Aragorn',              color: '#3F51B5' },
      { id: 'char_legolas',   name: 'Legolas',              color: '#06B6D4' },
      { id: 'char_gimli',     name: 'Gimli',                color: '#D97706' },
      { id: 'char_gandalf',   name: 'Gandalf le Blanc',     color: '#F59E0B' },
    ],
  },
  {
    id: 'loc_edoras',
    name: 'Edoras',
    type: 'Capitale royale',
    regime: 'Royaume de Rohan',
    description:
      'Capitale du Rohan, bâtie sur une colline isolée au cœur des plaines. La grande salle de Méduseld (l\'Or-Maison) en est le cœur. Quand Gandalf, Aragorn, Legolas et Gimli y arrivent, Théoden est un vieillard brisé sous l\'emprise de Grima Langue-de-Serpent. La libération de Théoden marque le réveil de tout Rohan.',
    coordinates: { x: 58, y: 59 },
    inhabitants: ['Rohirrim', 'Théoden', 'Éowyn', 'Grima Langue-de-Serpent'],
    keyPlaces: ['Méduseld (La Grande Salle)', 'Les Écuries royales', 'Le Tumulus de Théodred'],
    visitedBy: [
      { id: 'char_gandalf',  name: 'Gandalf le Blanc', color: '#F59E0B' },
      { id: 'char_aragorn',  name: 'Aragorn',           color: '#3F51B5' },
      { id: 'char_legolas',  name: 'Legolas',           color: '#06B6D4' },
      { id: 'char_gimli',    name: 'Gimli',             color: '#D97706' },
      { id: 'char_theoden',  name: 'Théoden',           color: '#B45309' },
      { id: 'char_eowyn',    name: 'Éowyn',             color: '#F0ABFC' },
      { id: 'char_eomer',    name: 'Éomer',             color: '#D97706' },
    ],
  },
  {
    id: 'loc_helms_deep',
    name: 'Gouffre de Helm',
    type: 'Forteresse militaire',
    regime: 'Défense de Rohan',
    description:
      'Forteresse de Rohan encastrée dans une gorge rocheuse — réputée imprenable depuis des siècles. La nuit de la Bataille du Gouffre de Helm, dix mille Uruk-haï de Saroumane l\'assiègent. Gandalf arrive à l\'aube avec Éomer et ses cavaliers pour renverser le sort de la bataille.',
    coordinates: { x: 55, y: 58 },
    inhabitants: ['Rohirrim', 'Réfugiés de Rohan'],
    keyPlaces: ['La Décharge (le mur-barrage)', 'La Caverne du Glissingol', 'La Porte Principale'],
    visitedBy: [
      { id: 'char_theoden',  name: 'Théoden',           color: '#B45309' },
      { id: 'char_aragorn',  name: 'Aragorn',           color: '#3F51B5' },
      { id: 'char_legolas',  name: 'Legolas',           color: '#06B6D4' },
      { id: 'char_gimli',    name: 'Gimli',             color: '#D97706' },
      { id: 'char_eomer',    name: 'Éomer',             color: '#D97706' },
      { id: 'char_gandalf',  name: 'Gandalf le Blanc',  color: '#F59E0B' },
    ],
  },
  {
    id: 'loc_ithilien',
    name: 'Ithilien',
    type: 'Région de Gondor',
    regime: 'Territoire disputé (Gondor vs Mordor)',
    description:
      'Région orientale du Gondor, longtemps abandonnée face à la pression de Mordor mais patrouillée par les Rangers de Faramir. Malgré la guerre, c\'est un pays d\'une beauté sauvage — fontaines claires, herbes parfumées, ruines d\'une civilisation millénaire. C\'est ici que Faramir capture Frodo et Sam.',
    coordinates: { x: 69, y: 63 },
    inhabitants: ['Rangers d\'Ithilien (Faramir)', 'Nazgûl (passages)'],
    keyPlaces: ['La Fenêtre sur l\'Occident (Henneth Annûn)', 'Les Bois d\'Ithilien'],
    visitedBy: [
      { id: 'char_frodo',   name: 'Frodo Sacquet',    color: '#10B981' },
      { id: 'char_sam',     name: 'Samsagace Gamegie', color: '#78716C' },
      { id: 'char_gollum',  name: 'Gollum',            color: '#9CA3AF' },
      { id: 'char_faramir', name: 'Faramir',           color: '#6366F1' },
    ],
  },
];

// ── Timeline T2 ───────────────────────────────────────────────────────────────
// Chapitres 10–18 — trois fils narratifs entrelacés

export const t2TimelineDB = [

  // ── Fil 1 : Frodo / Sam / Gollum ─────────────────────────────────────────────
  {
    id: 'evt_t2_01',
    chapter: 10,
    chapterTitle: "L'Emyn Muil",
    title: "Frodo et Sam capturent Gollum",
    description: "Dans les rochers de l'Emyn Muil, Frodo et Sam piègent Gollum qui les suit depuis Parth Galen. Frodo lui fait jurer sur l'Anneau de les guider vers Mordor.",
    locationId: 'loc_emyn_muil',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_frodo',  entityType: 'character' },
      { id: 'char_sam',    entityType: 'character' },
      { id: 'char_gollum', entityType: 'character' },
      { id: 'loc_emyn_muil', entityType: 'location' },
    ],
  },
  {
    id: 'evt_t2_02',
    chapter: 11,
    chapterTitle: "Les Marais des Morts",
    title: "Traversée des Marais des Morts",
    description: "Gollum guide Frodo et Sam à travers les Marais des Morts. Frodo faillit se noyer après avoir regardé les visages des morts sous l'eau noire. Des Nazgûl patrouillent les cieux.",
    locationId: 'loc_dead_marshes',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_frodo',       entityType: 'character' },
      { id: 'char_sam',         entityType: 'character' },
      { id: 'char_gollum',      entityType: 'character' },
      { id: 'loc_dead_marshes', entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_03',
    chapter: 15,
    chapterTitle: "La Porte Noire est fermée",
    title: "L'impasse de la Porte Noire",
    description: "Frodo et Sam, guidés par Gollum, atteignent la Porte Noire du Mordor (Morannon). Elle est imprenable. Gollum propose un chemin secret — Cirith Ungol — que Frodo accepte à contrecœur.",
    locationId: 'loc_dead_marshes',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_frodo',  entityType: 'character' },
      { id: 'char_sam',    entityType: 'character' },
      { id: 'char_gollum', entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object'   },
    ],
  },
  {
    id: 'evt_t2_04',
    chapter: 16,
    chapterTitle: "La Fenêtre sur l'Ouest",
    title: "Faramir capture Frodo en Ithilien",
    description: "En Ithilien, les Rangers de Faramir tendent une embuscade à une colonne d'Haradrims. Faramir repère Frodo et Sam et les conduit à Henneth Annûn — la Fenêtre sur l'Occident.",
    locationId: 'loc_ithilien',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_sam',     entityType: 'character' },
      { id: 'char_faramir', entityType: 'character' },
      { id: 'loc_ithilien', entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_05',
    chapter: 16,
    chapterTitle: "La Fenêtre sur l'Ouest",
    title: "Faramir refuse l'Anneau — Gollum révélé",
    description: "Faramir interroge Frodo sur sa mission. Il apprend l'existence de l'Anneau et choisit de ne pas le prendre — contrairement à Boromir. Gollum est capturé puis relâché à la demande de Frodo.",
    locationId: 'loc_ithilien',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_sam',     entityType: 'character' },
      { id: 'char_faramir', entityType: 'character' },
      { id: 'char_gollum',  entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object'    },
      { id: 'loc_ithilien', entityType: 'location'  },
    ],
  },

  // ── Fil 2 : Merry / Pippin / Ents ────────────────────────────────────────────
  {
    id: 'evt_t2_06',
    chapter: 12,
    chapterTitle: "Les Cavaliers de Rohan",
    title: "Merry et Pippin s'échappent dans Fangorn",
    description: "Lors d'une attaque des Rohirrim sur le campement Uruk-haï, Merry et Pippin profitent du chaos pour s'enfuir dans la Forêt de Fangorn, réputée maléfique.",
    locationId: 'loc_fangorn',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_merry',  entityType: 'character' },
      { id: 'char_pippin', entityType: 'character' },
      { id: 'loc_fangorn', entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_07',
    chapter: 12,
    chapterTitle: "Les Cavaliers de Rohan",
    title: "Rencontre avec Sylvebarbe",
    description: "Dans la forêt, Merry et Pippin rencontrent Sylvebarbe (Fangorn), le plus vieux des Ents. Il les accueille et les écoute raconter les ravages de Saroumane sur les arbres — sa colère commence à s'éveiller.",
    locationId: 'loc_fangorn',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_merry',     entityType: 'character' },
      { id: 'char_pippin',    entityType: 'character' },
      { id: 'char_treebeard', entityType: 'character' },
      { id: 'loc_fangorn',    entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_08',
    chapter: 18,
    chapterTitle: "La Voix de Sarumane",
    title: "Les Ents détruisent Isengard",
    description: "Après l'Ent-moot — délibération de plusieurs jours — Sylvebarbe conduit les Ents sur Isengard. La forteresse de Saroumane est détruite en une nuit : murs brisés, forges noyées. Les Ents et les Huorns dévastent l'armée d'Isengard.",
    locationId: 'loc_isengard',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_treebeard', entityType: 'character' },
      { id: 'char_merry',     entityType: 'character' },
      { id: 'char_pippin',    entityType: 'character' },
      { id: 'loc_isengard',   entityType: 'location'  },
      { id: 'loc_fangorn',    entityType: 'location'  },
    ],
  },

  // ── Fil 3 : Aragorn / Legolas / Gimli / Rohirrim ─────────────────────────────
  {
    id: 'evt_t2_09',
    chapter: 13,
    chapterTitle: "La Forêt de Fangorn",
    title: "Aragorn retrouve Gandalf le Blanc",
    description: "Aragorn, Legolas et Gimli, qui traquaient les ravisseurs de Merry et Pippin, retrouvent dans Fangorn un vieillard en blanc. Ils pensent d'abord à Saroumane — c'est Gandalf, revenu de la mort, transformé en Blanc.",
    locationId: 'loc_fangorn',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_legolas', entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'loc_fangorn',  entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_10',
    chapter: 14,
    chapterTitle: "Roi du Pays d'Or",
    title: "Théoden sous l'emprise de Grima",
    description: "Gandalf, Aragorn, Legolas et Gimli arrivent à Edoras. Théoden, vieilli et brisé par des années d'emprise de Grima Langue-de-Serpent, rejette leurs avertissements.",
    locationId: 'loc_edoras',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'char_aragorn',  entityType: 'character' },
      { id: 'char_theoden',  entityType: 'character' },
      { id: 'char_eowyn',    entityType: 'character' },
      { id: 'loc_edoras',    entityType: 'location'  },
      { id: 'obj_palantir',  entityType: 'object'    },
    ],
  },
  {
    id: 'evt_t2_11',
    chapter: 14,
    chapterTitle: "Roi du Pays d'Or",
    title: "Gandalf libère Théoden — bannissement de Grima",
    description: "Gandalf brise l'emprise de Saroumane sur Théoden. Le roi retrouve sa vigueur et son jugement. Il exile Grima Langue-de-Serpent d'Edoras. Théoden prépare Rohan à la guerre.",
    locationId: 'loc_edoras',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'char_theoden',  entityType: 'character' },
      { id: 'char_aragorn',  entityType: 'character' },
      { id: 'char_eowyn',    entityType: 'character' },
      { id: 'loc_edoras',    entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_12',
    chapter: 17,
    chapterTitle: "Le Gouffre de Helm",
    title: "Nuit de la Bataille du Gouffre de Helm",
    description: "Dix mille Uruk-haï de Saroumane assiègent le Gouffre de Helm. Aragorn mène la défense aux côtés de Théoden. La muraille est soufflée par une charge de poudre des Uruk-haï. La situation devient désespérée.",
    locationId: 'loc_helms_deep',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_theoden',    entityType: 'character' },
      { id: 'char_aragorn',    entityType: 'character' },
      { id: 'char_legolas',    entityType: 'character' },
      { id: 'char_gimli',      entityType: 'character' },
      { id: 'loc_helms_deep',  entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_13',
    chapter: 17,
    chapterTitle: "Le Gouffre de Helm",
    title: "Gandalf et Éomer à l'aube — victoire",
    description: "À l'aube, Gandalf le Blanc arrive avec Éomer et une armée de cavaliers rohirrim. Les Huorns de Fangorn encerclent les Uruk-haï survivants. La bataille tourne. Rohan est sauvé.",
    locationId: 'loc_helms_deep',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_gandalf',   entityType: 'character' },
      { id: 'char_eomer',     entityType: 'character' },
      { id: 'char_theoden',   entityType: 'character' },
      { id: 'char_aragorn',   entityType: 'character' },
      { id: 'loc_helms_deep', entityType: 'location'  },
    ],
  },
  {
    id: 'evt_t2_14',
    chapter: 19,
    chapterTitle: "La Voix de Sarumane",
    title: "Confrontation avec Saroumane à Orthanc",
    description: "Gandalf, Théoden et Aragorn se rendent à Orthanc pour parlementer avec Saroumane, réfugié dans sa tour. Gandalf le prive de son rang et brise son bâton. Grima jette le Palantír depuis la tour.",
    locationId: 'loc_isengard',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'char_theoden',  entityType: 'character' },
      { id: 'char_aragorn',  entityType: 'character' },
      { id: 'char_saruman',  entityType: 'character' },
      { id: 'char_pippin',   entityType: 'character' },
      { id: 'loc_isengard',  entityType: 'location'  },
      { id: 'obj_palantir',  entityType: 'object'    },
    ],
  },
  {
    id: 'evt_t2_15',
    chapter: 19,
    chapterTitle: "La Voix de Sarumane",
    title: "Pippin regarde dans le Palantír",
    description: "Pippin, irrésistiblement attiré, s'empare du Palantír et regarde dedans. Sauron le voit et croit tenir le Porteur de l'Anneau. Gandalf réalise que Sauron va lancer son offensive en croyant que l'Anneau est à Minas Tirith.",
    locationId: 'loc_isengard',
    volumeId: 'vol_deux_tours',
    entities: [
      { id: 'char_pippin',   entityType: 'character' },
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'obj_palantir',  entityType: 'object'    },
      { id: 'loc_isengard',  entityType: 'location'  },
    ],
  },
];

// ── Incohérences T2 ───────────────────────────────────────────────────────────

export const t2IncoherencesDB = [
  {
    id: 'inc_t2_01',
    type: 'Contradiction Temporelle',
    severity: 'high',
    title: "Éomer banni puis au Gouffre — chronologie floue",
    explanation:
      "Éomer est banni d'Edoras par Théoden sous l'influence de Grima pour désobéissance. Pourtant, quelques événements plus tard, il arrive à l'aube au Gouffre de Helm avec son armée de cavaliers. La durée et les conditions exactes de son bannissement — était-il libre de se battre quand même ? — ne sont pas précisées, créant une incohérence de statut.",
    links: [
      { label: 'Éomer',           entityId: 'char_eomer',     entityType: 'character' },
      { label: 'Théoden',         entityId: 'char_theoden',   entityType: 'character' },
      { label: 'Edoras',          entityId: 'loc_edoras',     entityType: 'location'  },
      { label: 'Gouffre de Helm', entityId: 'loc_helms_deep', entityType: 'location'  },
    ],
  },
  {
    id: 'inc_t2_02',
    type: 'Entité Non Référencée',
    severity: 'medium',
    title: "Grima Langue-de-Serpent absent de la base comme entité",
    explanation:
      "Grima Langue-de-Serpent est le pivot de la séquence de Rohan — sa sorcellerie sur Théoden est le point de départ de tout le fil narratif d'Edoras. Il est mentionné dans plusieurs événements mais n'existe pas comme entité personnage dans la base. Sa chaîne d'actions (emprise → bannissement → jet du Palantír) ne peut donc pas être tracée.",
    links: [
      { label: 'Théoden',        entityId: 'char_theoden',  entityType: 'character' },
      { label: 'Saroumane',      entityId: 'char_saruman',  entityType: 'character' },
      { label: 'Edoras',         entityId: 'loc_edoras',    entityType: 'location'  },
      { label: 'Le Palantír',    entityId: 'obj_palantir',  entityType: 'object'    },
    ],
  },
  {
    id: 'inc_t2_03',
    type: 'Incohérence de Porteur',
    severity: 'medium',
    title: "Le Palantír — qui l'a lancé, qui en est le porteur ?",
    explanation:
      "Le Palantír est listé comme appartenant à Saroumane, porteur actuel. Or c'est Grima (non référencé) qui le lance depuis la tour d'Orthanc. Pippin le ramasse. La chaîne de possession réelle (Saroumane → Grima → Pippin → Gandalf) n'est pas reflétée dans la base.",
    links: [
      { label: 'Le Palantír',  entityId: 'obj_palantir',  entityType: 'object'    },
      { label: 'Pippin',       entityId: 'char_pippin',   entityType: 'character' },
      { label: 'Saroumane',    entityId: 'char_saruman',  entityType: 'character' },
      { label: 'Gandalf',      entityId: 'char_gandalf',  entityType: 'character' },
    ],
  },
  {
    id: 'inc_t2_04',
    type: 'Affiliation Fantôme',
    severity: 'low',
    title: "Faramir affilié à 'Gondor' — lieu absent de la base",
    explanation:
      "Comme son frère Boromir, Faramir porte l'affiliation 'Gondor', mais Gondor n'existe pas comme entité lieu dans la base. Minas Tirith n'est pas non plus référencée. L'appartenance au Gondor des deux fils de Denethor reste donc une affiliation orpheline sans entité cible.",
    links: [
      { label: 'Faramir',  entityId: 'char_faramir', entityType: 'character' },
      { label: 'Boromir',  entityId: 'char_boromir', entityType: 'character' },
    ],
  },
];

// ── Chapitres Save the Cat — T2 ───────────────────────────────────────────────

export const t2ChaptersDB = [
  {
    id: 'ch_t2_01',
    number: 10,
    title: "Le Porteur seul — Gollum capturé",
    summary: "Frodo et Sam, seuls après la rupture, avancent dans les rocailles de l'Emyn Muil. Ils capturent Gollum qui les suivait. Frodo lui donne une chance — nouvel arc de confiance ambigu. Image d'ouverture du second tome : deux hobbits épuisés et un guide torturé.",
    beats: ['opening_image', 'theme_stated'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_02',
    number: 11,
    title: "Le guide douteux",
    summary: "Gollum guide Frodo et Sam à travers les Marais des Morts. Sa dualité Sméagol/Gollum s'affirme. Frodo ressent de la pitié pour lui — Sam se méfie. La relation à trois est établie comme la B-story du tome.",
    beats: ['b_story', 'setup'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_03',
    number: 12,
    title: "Merry, Pippin et les Ents",
    summary: "Merry et Pippin trouvent refuge dans Fangorn et rencontrent Sylvebarbe. Le fil narratif des Ents s'ouvre en parallèle. Deux récits se déroulent simultanément — Aragorn/Legolas/Gimli traquent leurs amis perdus.",
    beats: ['catalyst'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_04',
    number: 13,
    title: "Retour de Gandalf le Blanc",
    summary: "Dans Fangorn, Aragorn retrouve Gandalf — revenu de la mort, plus puissant. Le point médian du tome : tout change. Un allié perdu est retrouvé, transformé. L'espoir renaît. Gandalf révèle que la situation est pire que prévu — et que le temps presse.",
    beats: ['midpoint'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_05',
    number: 14,
    title: "Edoras — Réveil de Rohan",
    summary: "Arrivée à Edoras, guérison de Théoden, expulsion de Grima. Rohan se réveille pour la guerre. Éowyn apparaît — subplot de la guerrière dissimulée. Les forces se rassemblent pour défendre le Gouffre de Helm.",
    beats: ['fun_and_games'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_06',
    number: 15,
    title: "La Porte Noire et l'Ithilien",
    summary: "Frodo réalise que la voie directe est impossible. Gollum propose Cirith Ungol. Sam s'y oppose. Rencontre avec Faramir — l'Anneau est à portée d'un homme de Gondor, et il choisit de ne pas le prendre. Contraste avec Boromir.",
    beats: ['bad_guys'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_06b',
    number: 16,
    title: "La Fenêtre sur l'Ouest",
    summary: "Faramir capture Frodo et Sam en Ithilien. Il découvre l'existence de l'Anneau et est confronté à la même tentation que son frère Boromir. Mais là où Boromir a cédé, Faramir choisit de ne pas le prendre — prouvant qu'un homme de qualité peut résister. Gollum est capturé au bord de l'étang interdit, puis relâché par égard pour Frodo.",
    beats: ['debate'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_07',
    number: 17,
    title: "La Nuit du Gouffre de Helm",
    summary: "La bataille du Gouffre de Helm — nuit sans espoir. La muraille explose, les défenses cèdent. Aragorn et Théoden repoussent l'inévitable. Tout semble perdu. La nuit la plus noire du tome.",
    beats: ['all_is_lost', 'dark_night'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_08',
    number: 18,
    title: "La Marche des Ents — l'aube",
    summary: "Double retournement : Gandalf et Éomer arrivent au Gouffre à l'aube et sauvent Rohan. Simultanément, les Ents détruisent Isengard. Saroumane est neutralisé. Le second front de la guerre tourne en faveur des peuples libres.",
    beats: ['break_into_three', 'finale'],
    volumeId: 'vol_deux_tours',
  },
  {
    id: 'ch_t2_09',
    number: 19,
    title: "Vers les ténèbres",
    summary: "Confrontation avec Saroumane à Orthanc — il est destitué. Pippin regarde le Palantír, révélant l'Anneau à Sauron (en partie). Frodo et Sam reprennent leur route vers Cirith Ungol avec Gollum. Image finale : deux hobbits et une créature torturée marchent vers l'obscurité absolue.",
    beats: ['final_image'],
    volumeId: 'vol_deux_tours',
  },
];

// ── Plants cross-tomes (T1→T2 ou T2→T3) ─────────────────────────────────────

export const t2PlantsDB = [
  {
    id: 'plant_t2_01',
    label: "Gollum annoncé par Gandalf en T1, guide en T2",
    type: 'character',
    plant_chapter_num: 2,
    plant_event_id: 'evt_004',
    payoff_chapter_num: 10,
    payoff_event_id: 'evt_t2_01',
    entity_id: 'char_gollum',
    entity_type: 'character',
    status: 'resolved',
    notes: "Gandalf mentionne à Frodo que Gollum suivait la piste de l'Anneau depuis des siècles. Ce personnage-ombre, posé au chap. 2, devient le guide-pivot de tout le tome 2.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: 'vol_deux_tours',
  },
  {
    id: 'plant_t2_02',
    label: "La Phiale de Galadriel — lumière dans les ténèbres",
    type: 'object',
    plant_chapter_num: 8,
    plant_event_id: 'evt_023',
    payoff_chapter_num: null,
    payoff_event_id: null,
    entity_id: 'obj_phial',
    entity_type: 'object',
    status: 'open',
    notes: "Donnée à Frodo 'pour les lieux sombres quand toutes les autres lumières s'éteignent'. La résolution interviendra au Tome 3 face à Arachne dans Cirith Ungol.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: null,
  },
  {
    id: 'plant_t2_03',
    label: "L'emprise de Saroumane sur Théoden",
    type: 'information',
    plant_chapter_num: 3,
    plant_event_id: 'evt_007',
    payoff_chapter_num: 14,
    payoff_event_id: 'evt_t2_11',
    entity_id: 'char_saruman',
    entity_type: 'character',
    status: 'resolved',
    notes: "L'emprisonnement de Gandalf à Isengard (T1) révèle que Saroumane a des agents partout. Son emprise sur Théoden est la conséquence directe de cette corruption — résolue quand Gandalf libère le roi.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: 'vol_deux_tours',
  },
  {
    id: 'plant_t2_04',
    label: "Le Palantír d'Orthanc — vision de Sauron",
    type: 'object',
    plant_chapter_num: 3,
    plant_event_id: 'evt_007',
    payoff_chapter_num: 19,
    payoff_event_id: 'evt_t2_15',
    entity_id: 'obj_palantir',
    entity_type: 'object',
    status: 'resolved',
    notes: "La Pierre de Vision est posée dès l'emprisonnement de Gandalf à Orthanc. Sa révélation en T2 (Pippin le regarde, Sauron voit) accélère la guerre — et prépare l'arc de Minas Tirith en T3.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: 'vol_deux_tours',
  },
  {
    id: 'plant_t2_05',
    label: "La pitié de Frodo pour Gollum",
    type: 'theme',
    plant_chapter_num: 10,
    plant_event_id: 'evt_t2_01',
    payoff_chapter_num: null,
    payoff_event_id: null,
    entity_id: 'char_gollum',
    entity_type: 'character',
    status: 'open',
    notes: "Frodo choisit d'épargner Gollum et de lui faire confiance contre l'avis de Sam. Cette pitié, incompréhensible pour Sam, aura une importance capitale à la Montagne du Destin (T3). Amorce ouverte.",
    plantVolumeId: 'vol_deux_tours',
    payoffVolumeId: null,
  },
];

// ── Arc émotionnel — T2 (chapitres 10–19) ────────────────────────────────────

export const t2ArcPointsDB = [
  { chapter_number: 10, intensity: 5,  note: "Emyn Muil — épuisement et solitude, mais cap maintenu" },
  { chapter_number: 11, intensity: 4,  note: "Marais des Morts — atmosphère lugubre, présence pesante de la mort" },
  { chapter_number: 12, intensity: 7,  note: "Fangorn — découverte de Sylvebarbe, espoir inattendu" },
  { chapter_number: 13, intensity: 9,  note: "Retour de Gandalf le Blanc — retournement émotionnel fort" },
  { chapter_number: 14, intensity: 7,  note: "Edoras — libération de Théoden, renaissance politique de Rohan" },
  { chapter_number: 15, intensity: 5,  note: "Porte Noire fermée — impasse, réévaluation de la route" },
  { chapter_number: 16, intensity: 6,  note: "Faramir — tension puis soulagement, vertu récompensée" },
  { chapter_number: 17, intensity: 10, note: "Gouffre de Helm — nuit de désespoir absolu, climax bataille" },
  { chapter_number: 18, intensity: 8,  note: "Ents + aube à Helm — double victoire, espoir restauré" },
  { chapter_number: 19, intensity: 7,  note: "Saroumane destitué, Palantír révélé — victoire et nouvelle menace" },
];

// ── Fils narratifs — T2 ───────────────────────────────────────────────────────

export const t2ThreadsDB = [
  {
    id: 'thr_rohan',
    name: "Le Réveil de Rohan",
    color: '#B45309',
    role: 'subplot',
    description: "La libération de Théoden, le rassemblement du Rohan et la défense du Gouffre de Helm — un peuple cavalier qui se redresse face à la marée de Saroumane.",
    sort_order: 3,
  },
  {
    id: 'thr_ents',
    name: "La Marche des Ents",
    color: '#16A34A',
    role: 'subplot',
    description: "La lente colère de Sylvebarbe et des Ents face à la destruction de Fangorn par Isengard, culminant dans la destruction de la forteresse de Saroumane.",
    sort_order: 4,
  },
  {
    id: 'thr_gollum',
    name: "La Dualité de Sméagol",
    color: '#9CA3AF',
    role: 'subplot',
    description: "La guerre intérieure entre Sméagol (pitié, loyauté fragile) et Gollum (obsession, trahison) — et la question de savoir si la pitié de Frodo est sagesse ou naïveté.",
    sort_order: 5,
  },
];

// ── Extras des événements T2 ──────────────────────────────────────────────────

export const t2EventExtrasDB = {
  evt_t2_01: {
    sceneOrder: 1, beatId: 'opening_image',
    threadIds: ['thr_quest', 'thr_gollum'], povCharacterId: 'char_frodo',
    sceneGoal:     "Capturer Gollum avant qu'il n'alerte Sauron de leur présence",
    sceneConflict: "Gollum est agile et dangereux dans les rochers — et il connaît ces terres",
    sceneOutcome:  'success',
  },
  evt_t2_02: {
    sceneOrder: 1, beatId: 'b_story',
    threadIds: ['thr_quest', 'thr_gollum'], povCharacterId: 'char_frodo',
    sceneGoal:     "Traverser les Marais sans être repérés par les Nazgûl aériens",
    sceneConflict: "Frodo regarde les visages des morts et faillit se noyer",
    sceneOutcome:  'mixed',
  },
  evt_t2_03: {
    sceneOrder: 1, beatId: 'bad_guys',
    threadIds: ['thr_quest'], povCharacterId: 'char_frodo',
    sceneGoal:     "Entrer en Mordor par la voie directe",
    sceneConflict: "La Porte Noire est imprenable — armées, tours, surveillance permanente",
    sceneOutcome:  'failure',
  },
  evt_t2_04: {
    sceneOrder: 1, beatId: null,
    threadIds: ['thr_quest'], povCharacterId: 'char_faramir',
    sceneGoal:     "Faramir identifier ces voyageurs mystérieux et comprendre leur mission",
    sceneConflict: "Frodo ne peut révéler sa mission sans compromettre la Quête",
    sceneOutcome:  'mixed',
  },
  evt_t2_05: {
    sceneOrder: 2, beatId: 'finale',
    threadIds: ['thr_quest', 'thr_gollum'], povCharacterId: 'char_faramir',
    sceneGoal:     "Faramir décider du sort de l'Anneau qu'il a découvert",
    sceneConflict: "L'Anneau est là, accessible — la tentation de Boromir se représente sous une autre forme",
    sceneOutcome:  'success',
  },
  evt_t2_06: {
    sceneOrder: 1, beatId: 'catalyst',
    threadIds: ['thr_ents'], povCharacterId: 'char_pippin',
    sceneGoal:     "Merry et Pippin s'éloigner des Uruk-haï dans la confusion de la bataille",
    sceneConflict: "La forêt de Fangorn est réputée maléfique — fuir dedans est terrifier",
    sceneOutcome:  'mixed',
  },
  evt_t2_07: {
    sceneOrder: 2, beatId: 'b_story',
    threadIds: ['thr_ents'], povCharacterId: 'char_pippin',
    sceneGoal:     "Merry et Pippin convaincre Sylvebarbe d'agir contre Saroumane",
    sceneConflict: "Sylvebarbe est prudent et lent — il ne prendra aucune décision à la hâte",
    sceneOutcome:  'mixed',
  },
  evt_t2_08: {
    sceneOrder: 1, beatId: 'break_into_three',
    threadIds: ['thr_ents'], povCharacterId: null,
    sceneGoal:     "Les Ents détruire Isengard avant que Saroumane ne renvoie son armée",
    sceneConflict: "Isengard est une forteresse d'acier et de pierre — les Ents vont-ils suffir ?",
    sceneOutcome:  'success',
  },
  evt_t2_09: {
    sceneOrder: 1, beatId: 'midpoint',
    threadIds: ['thr_quest', 'thr_aragorn'], povCharacterId: 'char_aragorn',
    sceneGoal:     "Aragorn reconnaître l'être en blanc et ne pas l'attaquer",
    sceneConflict: "Tout indique que c'est Saroumane — la lumière aveuglante, la vieillesse, la blancheur",
    sceneOutcome:  'revelation',
  },
  evt_t2_10: {
    sceneOrder: 1, beatId: null,
    threadIds: ['thr_rohan', 'thr_aragorn'], povCharacterId: 'char_gandalf',
    sceneGoal:     "Gandalf libérer Théoden de l'emprise pour rallier Rohan à la guerre",
    sceneConflict: "Théoden rejette les visiteurs — son jugement est totalement corrompu",
    sceneOutcome:  'failure',
  },
  evt_t2_11: {
    sceneOrder: 2, beatId: 'fun_and_games',
    threadIds: ['thr_rohan'], povCharacterId: 'char_theoden',
    sceneGoal:     "Briser définitivement le lien entre Grima et Théoden",
    sceneConflict: "Grima tente de rester et de maintenir son emprise — et Théoden hésite encore",
    sceneOutcome:  'success',
  },
  evt_t2_12: {
    sceneOrder: 1, beatId: 'all_is_lost',
    threadIds: ['thr_rohan', 'thr_aragorn'], povCharacterId: 'char_aragorn',
    sceneGoal:     "Tenir le Gouffre jusqu'à l'aube",
    sceneConflict: "La muraille est soufflée — l'ennemi entre dans la forteresse",
    sceneOutcome:  'disaster',
  },
  evt_t2_13: {
    sceneOrder: 2, beatId: 'dark_night',
    threadIds: ['thr_rohan'], povCharacterId: 'char_theoden',
    sceneGoal:     "Aragorn et Théoden faire une dernière charge héroïque avant la fin",
    sceneConflict: "La charge est un geste désespéré — pas un plan de victoire",
    sceneOutcome:  'mixed',
  },
  evt_t2_14: {
    sceneOrder: 1, beatId: null,
    threadIds: ['thr_aragorn'], povCharacterId: 'char_gandalf',
    sceneGoal:     "Destituer officiellement Saroumane de l'Ordre des Istari",
    sceneConflict: "Saroumane tente de convaincre et de séduire même dans sa défaite — sa voix reste dangereuse",
    sceneOutcome:  'success',
  },
  evt_t2_15: {
    sceneOrder: 2, beatId: 'final_image',
    threadIds: ['thr_quest'], povCharacterId: 'char_pippin',
    sceneGoal:     "Pippin résister à la tentation de regarder dans la pierre",
    sceneConflict: "Il ne résiste pas — et Sauron voit un hobbit, déclenchant une réaction en chaîne",
    sceneOutcome:  'disaster',
  },
};

// ── Arcs de personnages — T2 ─────────────────────────────────────────────────

export const t2CharacterArcsDB = [
  // Frodo — continuation T2
  {
    id: 'cax_frodo_courage_t2',
    characterId: 'char_frodo',
    label: 'Courage (T2)',
    color: '#10B981',
    points: [
      { chapter_num: 10, value: 8,  note: 'Seul face à Gollum — décide de lui faire confiance' },
      { chapter_num: 11, value: 7,  note: 'Traverse les Marais malgré la terreur des visages' },
      { chapter_num: 15, value: 6,  note: 'La Porte Noire fermée — accepte un détour risqué' },
      { chapter_num: 16, value: 8,  note: 'Face à Faramir, défend l\'Anneau sans céder' },
      { chapter_num: 19, value: 9,  note: 'Repart vers Cirith Ungol malgré tout ce qu\'il sait' },
    ],
  },
  // Aragorn — continuation T2
  {
    id: 'cax_aragorn_leadership_t2',
    characterId: 'char_aragorn',
    label: 'Leadership révélé (T2)',
    color: '#3F51B5',
    points: [
      { chapter_num: 13, value: 9,  note: 'Reconnaît Gandalf, reprend la direction sans hésiter' },
      { chapter_num: 14, value: 9,  note: 'À Edoras, sa présence rassure Théoden et Éowyn' },
      { chapter_num: 17, value: 10, note: 'Gouffre de Helm — leadership en situation désespérée' },
    ],
  },
  // Théoden — arc nouveau
  {
    id: 'cax_theoden_hope',
    characterId: 'char_theoden',
    label: 'De la déchéance à la grandeur',
    color: '#B45309',
    points: [
      { chapter_num: 14, value: 2,  note: 'Roi brisé, manipulé, vieilli avant l\'âge' },
      { chapter_num: 14, value: 8,  note: 'Libéré par Gandalf — renaît comme chef de guerre' },
      { chapter_num: 17, value: 9,  note: 'Gouffre de Helm : charge finale, courage absolu' },
      { chapter_num: 18, value: 10, note: 'Victoire à Helm — roi pleinement restauré' },
    ],
  },
  // Gollum — arc nouveau
  {
    id: 'cax_gollum_smeagol',
    characterId: 'char_gollum',
    label: 'Sméagol contre Gollum',
    color: '#9CA3AF',
    points: [
      { chapter_num: 10, value: 6,  note: 'Capturé, jure sur l\'Anneau — Sméagol prend le dessus provisoirement' },
      { chapter_num: 11, value: 7,  note: 'Guide fidèle dans les Marais — moments de bienveillance réelle' },
      { chapter_num: 16, value: 4,  note: 'Capturé par Faramir — trahison perçue, méfiance envers Frodo' },
      { chapter_num: 19, value: 2,  note: 'Gollum reprend le dessus — le plan de trahison se précise' },
    ],
  },
  // Éowyn — rébellion silencieuse
  {
    id: 'cax_eowyn_rebellion_t2',
    characterId: 'char_eowyn',
    label: 'Rébellion silencieuse',
    color: '#F0ABFC',
    points: [
      { chapter_num: 14, value: 3, note: 'Prisonnière d\'un rôle assigné — gardienne du foyer d\'un roi mourant' },
      { chapter_num: 14, value: 5, note: 'Rencontre Aragorn — aspire à plus, à la gloire et à la mort au combat' },
      { chapter_num: 17, value: 4, note: 'Laissée à l\'arrière pendant la bataille du Gouffre' },
      { chapter_num: 19, value: 6, note: 'La guerre approche — sa résolution de combattre grandit en secret' },
    ],
  },
  // Merry — recherche d'identité
  {
    id: 'cax_merry_identity_t2',
    characterId: 'char_merry',
    label: 'Recherche d\'identité',
    color: '#78716C',
    points: [
      { chapter_num: 12, value: 5, note: 'Prisonnier des Uruk-haï, perdu, sans repère — puis libéré par la forêt' },
      { chapter_num: 12, value: 7, note: 'Alliance avec Sylvebarbe — Merry découvre qu\'il peut influencer des forces anciennes' },
      { chapter_num: 18, value: 8, note: 'Destruction d\'Isengard — a contribué à réveiller les Ents, premier acte héroïque' },
      { chapter_num: 19, value: 7, note: 'Retrouve Aragorn et Gandalf — reconnu comme acteur, pas spectateur' },
    ],
  },
  // Pippin — passage à la maturité
  {
    id: 'cax_pippin_maturity_t2',
    characterId: 'char_pippin',
    label: 'Passage à la maturité',
    color: '#A3A3A3',
    points: [
      { chapter_num: 12, value: 4, note: 'Captif des Uruk-haï — impuissant, terrifié, mais ne perd pas espoir' },
      { chapter_num: 12, value: 6, note: 'Fangorn — s\'émerveille et prend conscience d\'un monde plus vaste' },
      { chapter_num: 18, value: 7, note: 'A contribué à convaincre les Ents — sa naïveté devient un atout' },
      { chapter_num: 19, value: 3, note: 'Regarde le Palantír — impulsivité aux conséquences désastreuses, leçon brutale' },
    ],
  },
];

// ── Voyage du Héros — Aragorn (T2) ────────────────────────────────────────────

export const t2HeroJourneyDB = [
  { stageKey: 'ordinary_world',     characterId: 'char_aragorn', chapterNum: 9,  summary: "Aragorn à Parth Galen après la mort de Boromir — guide sans Communauté, sans cap clair." },
  { stageKey: 'call_to_adventure',  characterId: 'char_aragorn', chapterNum: 13, summary: "Le retour de Gandalf le Blanc redéfinit la mission : aller à Edoras, rallier Rohan." },
  { stageKey: 'refusal',            characterId: 'char_aragorn', chapterNum: 10, summary: "Aragorn doute de son héritage : l'ombre d'Isildur pèse sur lui. Peut-il revendiquer le trône sans répéter la faiblesse de son ancêtre ?" },
  { stageKey: 'mentor',             characterId: 'char_aragorn', chapterNum: 13, summary: "Gandalf le Blanc — plus sage, plus puissant — reprend son rôle de mentor et stratège." },
  { stageKey: 'threshold',          characterId: 'char_aragorn', chapterNum: 14, summary: "Edoras : Aragorn entre dans la salle d'un roi corrompu, sans certitude de succès." },
  { stageKey: 'tests',              characterId: 'char_aragorn', chapterNum: 14, summary: "Libérer Théoden, convaincre les Rohirrim, se préparer à une bataille sans espoir réel." },
  { stageKey: 'inmost_cave',        characterId: 'char_aragorn', chapterNum: 17, summary: "Le Gouffre de Helm : forteresse encerclée, nuit sans issue — l'antre du désespoir." },
  { stageKey: 'ordeal',             characterId: 'char_aragorn', chapterNum: 17, summary: "La muraille explose, l'ennemi entre — Aragorn doit choisir entre survivre ou sacrifier." },
  { stageKey: 'reward',             characterId: 'char_aragorn', chapterNum: 17, summary: "L'aube et Gandalf — la victoire inattendue à Helm. La résistance a tenu." },
  { stageKey: 'road_back',          characterId: 'char_aragorn', chapterNum: 18, summary: "Marche vers Isengard dévasté — la guerre n'est pas finie, mais un front est fermé." },
  { stageKey: 'resurrection',       characterId: 'char_aragorn', chapterNum: 19, summary: "Face à Saroumane dans sa tour : Aragorn résiste à la voix enchanteresse — identité prouvée." },
  { stageKey: 'return_with_elixir', characterId: 'char_aragorn', chapterNum: 19, summary: "Aragorn repart vers la guerre à venir — renforcé, reconnu, le roi en devenir s'affirme." },
];

// ── Objets T2 ────────────────────────────────────────────────────────────────

export const t2Objects = [
  {
    id: 'obj_horn_helm',
    name: 'Cor de Helm Poing-de-Marteau',
    type: 'Artefact militaire',
    description:
      'Grand cor de guerre du Gouffre de Helm, nommé d\'après Helm Hammerhand, roi du Rohan légendaire. Son son résonne dans tout le gouffre et terrorise les ennemis. Théoden et Aragorn sonnent le cor à l\'aube lors de la charge finale — un moment de bravoure absolue.',
    creator: 'Rohirrim (forgé pour Helm Hammerhand)',
    createdIn: 'Gouffre de Helm — Rohan',
    powers: ['Terreur des ennemis', 'Ralliement des défenseurs'],
    currentHolder: 'Théoden',
    holders: [
      { id: 'char_theoden', name: 'Théoden', color: '#B45309' },
      { id: 'char_aragorn', name: 'Aragorn', color: '#3F51B5' },
    ],
    status: 'active',
  },
  {
    id: 'obj_ent_draught',
    name: 'Breuvage des Ents',
    type: 'Substance naturelle',
    description:
      'Breuvage mystérieux que Sylvebarbe donne à Merry et Pippin dans Fangorn. Tiré de sources profondes de la forêt, il fait grandir les hobbits de plusieurs centimètres — les rendant les plus grands hobbits de l\'histoire de la Comté. Un symbole de la puissance de la nature face à l\'industrie de Saroumane.',
    creator: 'Ents de Fangorn',
    createdIn: 'Forêt de Fangorn',
    powers: ['Croissance physique', 'Vitalité accrue'],
    currentHolder: null,
    holders: [
      { id: 'char_merry',  name: 'Meriadoc Brandebouc', color: '#78716C' },
      { id: 'char_pippin', name: 'Peregrin Touque',      color: '#A3A3A3' },
    ],
    status: 'consumed',
  },
];

// ── Groupes T2 ───────────────────────────────────────────────────────────────

export const t2GroupsDB = [
  {
    id: 'grp_rohirrim',
    name: 'Les Rohirrim',
    type: 'Faction',
    color: '#B45309',
    description:
      'Cavaliers de Rohan, peuple de la Marche, descendants d\'Eorl le Jeune. Seigneurs des chevaux de la Terre du Milieu. Leur cavalerie est la plus redoutée de l\'Ouest. Fidèles alliés du Gondor par le Serment d\'Eorl.',
    homelandId: 'loc_edoras',
    members: [
      { characterId: 'char_theoden', roleInGroup: 'Roi' },
      { characterId: 'char_eomer',   roleInGroup: 'Troisième Maréchal' },
      { characterId: 'char_eowyn',   roleInGroup: 'Dame du Rohan' },
    ],
  },
  {
    id: 'grp_ents',
    name: 'Les Ents de Fangorn',
    type: 'Race',
    color: '#16A34A',
    description:
      'Bergers des arbres, créatures les plus anciennes de la Terre du Milieu. Les Ents veillent sur les forêts depuis les premiers jours. Lents à la colère mais terrifiants une fois éveillés — leur marche sur Isengard est l\'un des retournements décisifs de la guerre.',
    homelandId: 'loc_fangorn',
    members: [
      { characterId: 'char_treebeard', roleInGroup: 'Doyen' },
    ],
  },
  {
    id: 'grp_rangers_ithilien',
    name: 'Les Rangers d\'Ithilien',
    type: 'Faction',
    color: '#6366F1',
    description:
      'Compagnie secrète de guerriers du Gondor patrouillant l\'Ithilien, dernière ligne de défense avant le Mordor. Commandés par Faramir, ils mènent des embuscades contre les armées de Sauron qui traversent leurs terres.',
    homelandId: 'loc_ithilien',
    members: [
      { characterId: 'char_faramir', roleInGroup: 'Capitaine' },
    ],
  },
];

// ── Trajets carte T2 ────────────────────────────────────────────────────────

export const t2FrodoJourney = [
  {
    id: 0, etape: 1, scene: 'emyn_muil',
    lieu: 'Emyn Muil', sous_lieu: 'Collines rocheuses à l\'est de l\'Anduin',
    chapitre: 'Les Deux Tours, III-1',
    action: 'Frodo et Sam errent dans le labyrinthe de l\'Emyn Muil. Ils capturent Gollum qui les suit. Frodo le contraint par serment à les guider vers le Mordor.',
    allies: ['char_sam', 'char_gollum'],
    x: 62, y: 50,
  },
  {
    id: 1, etape: 2, scene: 'marais_morts',
    lieu: 'Marais des Morts', sous_lieu: 'Ancien champ de bataille de Dagorlad',
    chapitre: 'Les Deux Tours, III-2',
    action: 'Gollum guide les hobbits à travers les marais hantés. Les visages des morts tentent de les attirer. Un Nazgûl passe dans le ciel. L\'atmosphère de terreur s\'épaissit.',
    allies: ['char_sam', 'char_gollum'],
    x: 65, y: 57,
  },
  {
    id: 2, etape: 3, scene: 'porte_noire',
    lieu: 'Morannon — La Porte Noire', sous_lieu: 'Entrée principale du Mordor',
    chapitre: 'Les Deux Tours, IV-3',
    action: 'Frodo constate que la Porte Noire est infranchissable. Gollum propose un autre chemin : Cirith Ungol, « plus sûr » selon lui. Sam se méfie.',
    allies: ['char_sam', 'char_gollum'],
    x: 70, y: 56,
  },
  {
    id: 3, etape: 4, scene: 'ithilien',
    lieu: 'Ithilien', sous_lieu: 'Territoire des Rangers de Faramir',
    chapitre: 'Les Deux Tours, IV-5',
    action: 'Capturés par Faramir et ses Rangers. L\'Anneau est à portée d\'un homme de Gondor — et il choisit de ne pas le prendre. Gollum est capturé à l\'étang interdit.',
    allies: ['char_sam', 'char_gollum'],
    x: 69, y: 63,
  },
  {
    id: 4, etape: 5, scene: 'carrefour',
    lieu: 'Le Carrefour — route vers Cirith Ungol', sous_lieu: 'Au sud de l\'Ithilien',
    chapitre: 'Les Deux Tours, IV-7',
    action: 'Frodo, Sam et Gollum reprennent la route vers Cirith Ungol. L\'ombre de Minas Morgul plane. Le piège de Gollum se referme lentement.',
    allies: ['char_sam', 'char_gollum'],
    x: 71, y: 65,
  },
];

export const t2AragornJourney = [
  {
    id: 0, etape: 1, scene: 'poursuite',
    lieu: 'Plaines du Rohan', sous_lieu: 'Poursuite des Uruk-haï',
    chapitre: 'Les Deux Tours, III-1',
    action: 'Aragorn, Legolas et Gimli poursuivent les Uruk-haï qui ont capturé Merry et Pippin. Trois jours de course à travers les plaines de Rohan.',
    allies: ['char_legolas', 'char_gimli'],
    x: 56, y: 52,
  },
  {
    id: 1, etape: 2, scene: 'fangorn',
    lieu: 'Forêt de Fangorn', sous_lieu: 'Orée de la forêt',
    chapitre: 'Les Deux Tours, III-5',
    action: 'Entrée dans Fangorn à la recherche des hobbits. Rencontre stupéfiante : Gandalf, revenu de la mort en Gandalf le Blanc. Le cap change — direction Edoras.',
    allies: ['char_legolas', 'char_gimli', 'char_gandalf'],
    x: 52, y: 48,
  },
  {
    id: 2, etape: 3, scene: 'edoras',
    lieu: 'Edoras — Méduseld', sous_lieu: 'Salle dorée du roi Théoden',
    chapitre: 'Les Deux Tours, III-6',
    action: 'Gandalf libère Théoden de l\'emprise de Saroumane. Grima est banni. Rohan se réveille pour la guerre. Éowyn rencontre Aragorn.',
    allies: ['char_gandalf', 'char_legolas', 'char_gimli', 'char_theoden'],
    x: 58, y: 59,
  },
  {
    id: 3, etape: 4, scene: 'gouffre_helm',
    lieu: 'Gouffre de Helm', sous_lieu: 'Forteresse du Gouffre',
    chapitre: 'Les Deux Tours, III-7',
    action: 'Nuit du Gouffre de Helm. Dix mille Uruk-haï. La muraille explose. Tout semble perdu — mais Aragorn charge à l\'aube avec Théoden. Gandalf et Éomer arrivent. Victoire.',
    allies: ['char_theoden', 'char_legolas', 'char_gimli'],
    x: 55, y: 58,
  },
  {
    id: 4, etape: 5, scene: 'isengard',
    lieu: 'Isengard — Orthanc', sous_lieu: 'Tour de Saroumane, détruite par les Ents',
    chapitre: 'Les Deux Tours, III-8/9',
    action: 'Arrivée à Isengard dévasté par les Ents. Merry et Pippin retrouvés. Confrontation avec Saroumane. Le Palantír jeté. Pippin le regarde — Sauron voit.',
    allies: ['char_gandalf', 'char_theoden', 'char_legolas', 'char_gimli', 'char_merry', 'char_pippin'],
    x: 46, y: 53,
  },
];
