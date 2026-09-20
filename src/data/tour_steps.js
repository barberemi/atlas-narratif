/**
 * Étapes du tour guidé Atlas Narratif.
 * Chaque étape navigue vers une route et spotlight un élément via data-tour="dataKey".
 * Plusieurs étapes peuvent partager la même route (navigation uniquement si route change).
 */
export const TOUR_STEPS = [

  // ── Dashboard ──────────────────────────────────────────────────────────────
  {
    route:       '/dashboard',
    dataKey:     'dashboard-stats',
    title:       'Score de cohérence',
    description: 'La jauge résume la santé narrative globale de votre projet : incohérences, structure Save the Cat, arc émotionnel… Un score vert signifie que tout s\'enchaîne.',
  },
  {
    route:       '/dashboard',
    dataKey:     'dashboard-inventory',
    title:       'Inventaire narratif',
    description: 'Vos compteurs en un coup d\'œil : personnages, lieux, objets, chapitres, événements et beats STC. Un bon roman a généralement entre 8 et 30 personnages nommés.',
  },
  {
    route:       '/dashboard',
    dataKey:     'dashboard-series',
    title:       'Vue Série',
    description: 'Si votre œuvre s\'étend sur plusieurs tomes, ce tableau compare la densité narrative, le score structurel et les incohérences tome par tome.',
  },

  // ── Timeline ───────────────────────────────────────────────────────────────
  {
    route:       '/timeline',
    dataKey:     'timeline-events',
    title:       'Timeline narrative',
    description: 'Tous les événements de votre histoire dans l\'ordre chronologique. Chaque colonne est un chapitre ; chaque carte, un événement avec son intensité dramatique.',
  },
  {
    route:       '/timeline',
    dataKey:     'timeline-filters',
    title:       'Filtres & suivi',
    description: 'Filtrez par personnage (Présence ou POV), par fil narratif ou par issue dramatique. Idéal pour tracer l\'arc d\'un protagoniste chapitre par chapitre.',
  },

  // ── Lore ───────────────────────────────────────────────────────────────────
  {
    route:       '/lore',
    dataKey:     'lore-tabs',
    title:       'Univers & Lore',
    description: 'La base de connaissance de votre univers : personnages, lieux, objets et groupes (factions, races, familles…). Tout est consultable et éditable depuis ici.',
  },
  {
    route:       '/lore',
    dataKey:     'lore-grid',
    title:       'Cartes d\'entités',
    description: 'Cliquez sur une carte pour éditer l\'entité. Depuis une carte personnage, vous pouvez ouvrir le graphe de relations ou naviguer vers les incohérences liées.',
  },

  // ── Entités custom ───────────────────────────────────────────────────────────
  {
    route:       '/custom',
    dataKey:     'custom-actions',
    title:       'Catégories sur mesure',
    description: 'Au-delà des personnages, lieux et objets, créez vos propres catégories (langues, maisons, sortilèges, vaisseaux…) : d\'abord un type, puis ses entités.',
  },
  {
    route:       '/custom',
    dataKey:     'custom-tabs',
    title:       'Un onglet par type',
    description: 'Chaque type custom devient un onglet. Le compteur indique le nombre d\'entités ; l\'icône ⚙ permet d\'éditer les champs du type sélectionné.',
  },
  {
    route:       '/custom',
    dataKey:     'custom-grid',
    maxH:        280,
    title:       'Vos entités custom',
    description: 'Les fiches du type actif. Cliquez pour éditer ; les champs personnalisés apparaissent en chips. Ces entités sont citables dans le chat et le graphe de relations.',
  },

  // ── Carte ──────────────────────────────────────────────────────────────────
  {
    route:       '/map',
    dataKey:     'map-canvas',
    title:       'Carte interactive',
    description: 'Importez une image de fond (carte de votre monde), puis placez vos lieux dessus. Les trajets des personnages se tracent automatiquement depuis la timeline.',
  },
  {
    route:       '/map',
    dataKey:     'map-journeys',
    title:       'Curseur de chapitres',
    description: 'Glissez le curseur pour avancer dans le récit : tous les personnages affichés se déplacent au chapitre choisi. Les bandes d\'acte (I, II, III) situent le moment dans la structure.',
  },

  // ── Save the Cat ───────────────────────────────────────────────────────────
  {
    route:       '/savethecat',
    dataKey:     'stc-beats',
    title:       'Save the Cat',
    description: 'La méthode Save the Cat décompose votre histoire en 15 beats narratifs obligatoires. Chaque chapitre est assigné à un beat pour structurer l\'arc dramatique.',
  },
  {
    route:       '/savethecat',
    dataKey:     'stc-frise',
    title:       'Frise dramatique',
    description: 'Représentation visuelle de vos beats dans le temps. Les losanges indiquent la position idéale du beat ; les cercles, votre position réelle. Un écart trop grand génère une alerte.',
  },
  {
    route:       '/savethecat',
    dataKey:     'stc-panels',
    title:       'Alertes & détail',
    description: 'À gauche : les alertes de structure (beat manquant, déviation critique). À droite : le détail de chaque beat avec le chapitre associé et les entités impliquées.',
  },

  // ── Voyage du Héros ────────────────────────────────────────────────────────
  {
    route:       '/heros',
    dataKey:     'heros-stages',
    title:       'Voyage du Héros',
    description: 'Les 12 étapes archétypales de Joseph Campbell, organisées en 3 phases : Monde Ordinaire, Épreuves, Retour. Sélectionnez votre protagoniste en haut.',
  },
  {
    route:       '/heros',
    dataKey:     'heros-grid',
    maxH:        280,
    title:       'Les 12 étapes',
    description: 'Renseignez le chapitre et la description de chaque étape pour votre personnage. Les étapes remplies s\'illuminent ; les vides signalent un arc incomplet.',
  },

  // ── Arc émotionnel ─────────────────────────────────────────────────────────
  {
    route:       '/arc',
    dataKey:     'arc-chart',
    title:       'Arc émotionnel',
    description: 'Courbe d\'intensité dramatique chapitre par chapitre. Basculez entre la vue Globale (tous personnages confondus) et Personnages (évolution individuelle par axe).',
  },
  {
    route:       '/arc',
    dataKey:     'arc-graph',
    title:       'Courbe de tension',
    description: 'Lisez les pics et les creux : un bon rythme narratif alterne tension et décompression. Un plateau plat sur plusieurs chapitres est souvent signe de stagnation.',
  },

  // ── Amorces narratives ─────────────────────────────────────────────────────
  {
    route:       '/plants',
    dataKey:     'plants-list',
    title:       'Amorces narratives',
    description: 'Le tracker plant & payoff : chaque indice, objet ou promesse posé dans un chapitre doit trouver sa résolution. Ici vous suivez leur état (ouvert, résolu, abandonné).',
  },
  {
    route:       '/plants',
    dataKey:     'plants-content',
    maxH:        200,
    title:       'Vue Arc & Liste',
    description: 'Basculez entre la vue Liste (cartes) et la vue Arc (SVG plant→payoff). La vue Arc montre visuellement quand chaque amorce est posée et résolue dans la chronologie.',
  },

  // ── Fils narratifs ─────────────────────────────────────────────────────────
  {
    route:       '/threads',
    dataKey:     'threads-list',
    title:       'Fils narratifs',
    description: 'Les sous-intrigues et subplots de votre récit. Créez un fil par intrigue (romance, backstory, complot…) puis taggez vos événements depuis la Timeline.',
  },
  {
    route:       '/threads',
    dataKey:     'threads-cards',
    maxH:        200,
    title:       'Détail des fils',
    description: 'Chaque fil affiche sa plage de chapitres et les événements rattachés. Un fil sans événements taggés est un subplot invisible — pensez à l\'alimenter.',
  },

  // ── Incohérences ───────────────────────────────────────────────────────────
  {
    route:       '/incoherences',
    dataKey:     'inc-list',
    title:       'Détecteur d\'incohérences',
    description: 'Atlas scanne automatiquement votre manuscrit : chronologie impossible, personnage au mauvais endroit, objet détenu par quelqu\'un qui n\'existe pas… Cliquez ⚡ pour relancer.',
  },
  {
    route:       '/incoherences',
    dataKey:     'inc-severity',
    title:       'Filtres par sévérité',
    description: 'Traitez les Critiques en priorité (blocantes pour la cohérence), puis les Élevées. Les Moyennes et Faibles peuvent attendre une passe de relecture.',
  },

  // ── Chat de requête ──────────────────────────────────────────────────────────
  {
    route:       '/chat',
    dataKey:     'chat-threads',
    title:       'Interroger votre projet',
    description: 'Posez des questions sur votre univers en langage naturel. Chaque conversation est sauvegardée ici : créez-en autant que de sujets à explorer.',
  },
  {
    route:       '/chat',
    dataKey:     'chat-deep',
    title:       'Deux niveaux de réponse',
    description: 'Par défaut, Atlas répond instantanément à partir de vos données locales. Activez « Recherche approfondie » pour une réponse générée par IA sur l\'ensemble du manuscrit (plus lente, plus fine).',
  },
  {
    route:       '/chat',
    dataKey:     'chat-input',
    title:       'Posez votre question',
    description: 'Tapez ici : « Où se trouve Frodon au chapitre 12 ? », « Quels personnages apparaissent à Fondcombe ? »… Les entités citées dans la réponse sont cliquables.',
  },

  // ── Fin ────────────────────────────────────────────────────────────────────
  {
    route:       '/',
    dataKey:     'home-cards',
    title:       'À vous de jouer !',
    description: 'Trois façons de démarrer : construire votre projet à la main, importer un manuscrit analysé par votre IA favorite, ou importer directement votre vault Obsidian (personnages, lieux, objets et catégories custom).',
  },
];
