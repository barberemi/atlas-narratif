/**
 * Données narratives — Le Seigneur des Anneaux : Le Retour du Roi (Tome 3)
 *
 * Complément de lotr_seed_data.js et lotr_t2_seed_data.js pour le troisième tome.
 * Fusionné dans seed.lotr.js avec les données des Tomes 1 et 2.
 */

// ── Volume ───────────────────────────────────────────────────────────────────

export const t3VolumeDB = {
  id: 'vol_retour_roi',
  number: 3,
  title: 'Le Retour du Roi',
  description:
    "Troisième et dernier tome de la trilogie. La guerre de l'Anneau atteint son paroxysme : siège du Gondor, bataille du Pelennor, sacrifice de Théoden, épreuve d'Arachne, destruction de l'Anneau à la Montagne du Destin et couronnement d'Aragorn. Se clôt aux Havres Gris — le départ de Frodo pour Valinor.",
};

// ── Personnages nouveaux (T3) ────────────────────────────────────────────────

export const t3Characters = [
  {
    id: 'char_denethor',
    name: 'Denethor II',
    aliases: ['L\'Intendant', 'Le Seigneur de Minas Tirith'],
    race: 'Homme (Gondorien)',
    role: 'Intendant régnant du Gondor',
    origin: 'Minas Tirith — Tour Blanche',
    affiliation: ['Gondor'],
    description:
      'Vingt-sixième Intendant du Gondor, père de Boromir et Faramir. Autrefois homme de grande volonté et d\'intelligence pénétrante. Mais l\'usage secret du Palantír de Minas Tirith l\'a exposé à l\'influence de Sauron, qui lui a montré des visions de défaite inéluctable. Consumé par le deuil de Boromir et un désespoir croissant, il refuse de reconnaître Aragorn comme roi et choisit de brûler vif avec son fils Faramir blessé plutôt que de voir le Gondor tomber.',
    traits: ['Orgueilleux', 'Brillant mais brisé', 'Père endeuillé', 'Paranoïaque (Palantír)', 'Volonté corrompue par le désespoir'],
    color: '#71717A',
    journeyKey: null,
  },
  {
    id: 'char_witch_king',
    name: 'Le Roi-Sorcier d\'Angmar',
    aliases: ['Le Seigneur des Nazgûl', 'Le Capitaine Noir', 'Seigneur de Minas Morgul'],
    race: 'Spectre de l\'Anneau (ancien Homme)',
    role: 'Chef des Nazgûl, lieutenant de Sauron',
    origin: 'Inconnu (Second Âge)',
    affiliation: ['Mordor', 'Sauron'],
    description:
      'Le plus puissant des Neuf Nazgûl — anciens rois humains corrompus par les Anneaux de Pouvoir de Sauron. Il commande les armées de Mordor au siège de Minas Tirith. La prophétie d\'Eärnur annonce qu\'aucun homme ne peut le tuer. Éowyn et Merry déjouent cette prophétie au Pelennor.',
    traits: ['Terreur incarnée', 'Immortel (lié à Sauron)', 'Stratège implacable', 'Voix qui brise la volonté'],
    color: '#1F2937',
    journeyKey: null,
    deathEventId: 'evt_t3_07',
  },
  {
    id: 'char_shelob',
    name: 'Arachne',
    aliases: ['Shelob', 'Elle', 'La Gardienne de Cirith Ungol'],
    race: 'Araignée géante (descendante d\'Ungoliant)',
    role: 'Prédatrice de Cirith Ungol',
    origin: 'Ephel Dúath — Cirith Ungol',
    affiliation: ['Aucune (prédatrice solitaire)'],
    description:
      'Araignée colossale et ancienne, dernière descendante d\'Ungoliant qui dévora les Arbres de Valinor. Elle vit dans les tunnels de Cirith Ungol depuis des millénaires, dévorant tout ce qui passe — Orques, Elfes, Hommes. Gollum la connaît et guide Frodo vers elle comme offrande, espérant récupérer l\'Anneau sur le cadavre.',
    traits: ['Faim insatiable', 'Vénéneuse', 'Ancienne', 'Craint la lumière (Phiale)'],
    color: '#374151',
    journeyKey: null,
  },
  {
    id: 'char_grima',
    name: 'Grima Langue-de-Serpent',
    aliases: ['Langue-de-Serpent', 'Wormtongue', 'L\'agent de Saroumane'],
    race: 'Homme (Rohirrim — traître)',
    role: 'Conseiller corrompu de Théoden, agent de Saroumane',
    origin: 'Rohan — Edoras',
    affiliation: ['Saroumane (vassal)', 'Rohan (traître)'],
    description:
      'Ancien conseiller du roi Théoden, retourné par Saroumane. Il distillait le poison et le doute dans l\'esprit du roi, l\'affaiblissant pour que Rohan ne puisse pas résister à l\'Isengard. Banni par Gandalf à Edoras, il rejoint Saroumane à Orthanc. C\'est lui qui jette le Palantír par la fenêtre. Au Nettoyage de la Comté, il tue Saroumane avant d\'être abattu lui-même.',
    traits: ['Fourbe', 'Veule', 'Jaloux d\'Éowyn', 'Rongé par la servitude'],
    color: '#6B7280',
    journeyKey: null,
  },
  {
    id: 'char_mouth_sauron',
    name: 'La Bouche de Sauron',
    aliases: ['Le Héraut de Sauron', 'Le Lieutenant de Barad-dûr'],
    race: 'Homme (Númenórien Noir)',
    role: 'Ambassadeur de Sauron à la Porte Noire',
    origin: 'Inconnue (a oublié son propre nom)',
    affiliation: ['Mordor', 'Sauron'],
    description:
      'Homme ancien, corrompu par le service de Sauron depuis la fin du Second Âge. Il a oublié son propre nom. Il est envoyé pour parlementer avec Aragorn et Gandalf devant la Porte Noire, brandissant la cotte de mithril de Frodo et Dard — laissant croire que le Porteur a été capturé. Une tentative de briser le moral des armées de l\'Ouest.',
    traits: ['Cruauté froide', 'Éloquent', 'Manipulateur', 'Serviteur fanatique'],
    color: '#44403C',
    journeyKey: null,
  },
];

// ── Lieux nouveaux (T3) ─────────────────────────────────────────────────────

export const t3Locations = [
  {
    id: 'loc_minas_tirith',
    name: 'Minas Tirith — la Cité Blanche',
    type: 'Cité-forteresse',
    regime: 'Intendance du Gondor (Denethor II)',
    description:
      'Capitale du Gondor, bâtie en sept cercles de pierre blanche contre le flanc du Mindolluin. La Tour Blanche d\'Ecthelion domine le septième cercle. Dernier rempart contre Mordor. Le siège de Minas Tirith est l\'un des moments les plus critiques de la Guerre de l\'Anneau — la cité résiste grâce à Gandalf et aux cavaliers du Rohan.',
    coordinates: { x: 65, y: 75 },
    inhabitants: ['Gondoriens', 'Denethor', 'Faramir', 'Gandalf (temporaire)', 'Pippin (temporaire)'],
    visitedBy: [
      { id: 'char_gandalf', name: 'Gandalf', color: '#F5F5DC' },
      { id: 'char_pippin', name: 'Pippin', color: '#A3A3A3' },
      { id: 'char_aragorn', name: 'Aragorn', color: '#3F51B5' },
    ],
    keyPlaces: ['Tour Blanche d\'Ecthelion', 'Maisons de Guérison', 'Rath Dínen (Tombes)', 'Le Pelennor devant les murs'],
  },
  {
    id: 'loc_pelennor',
    name: 'Champs du Pelennor',
    type: 'Plaine / Champ de bataille',
    regime: 'Gondor (défenses extérieures)',
    description:
      'Vaste plaine herbeuse entre Minas Tirith et l\'Anduin. C\'est ici que se joue la plus grande bataille de la Guerre de l\'Anneau. La charge des Rohirrim à l\'aube, la mort de Théoden, le combat d\'Éowyn contre le Roi-Sorcier, et l\'arrivée d\'Aragorn avec les navires noirs retournent le sort de la guerre.',
    coordinates: { x: 64, y: 77 },
    inhabitants: [],
    visitedBy: [
      { id: 'char_theoden', name: 'Théoden', color: '#B45309' },
      { id: 'char_eowyn', name: 'Éowyn', color: '#F0ABFC' },
      { id: 'char_aragorn', name: 'Aragorn', color: '#3F51B5' },
      { id: 'char_merry', name: 'Merry', color: '#78716C' },
    ],
    keyPlaces: ['Rempart du Rammas Echor', 'Le Harlond (port)'],
  },
  {
    id: 'loc_cirith_ungol',
    name: 'Cirith Ungol',
    type: 'Col fortifié / Antre',
    regime: 'Mordor (tenu par les Orques)',
    description:
      'Col dans les Ephel Dúath (Monts de l\'Ombre), passage secret vers le Mordor. L\'antre d\'Arachne surplombe l\'escalier. Une tour orque garde le col. C\'est le chemin que Gollum propose à Frodo — sachant qu\'Arachne l\'attend. Sam devra infiltrer la tour seul pour sauver Frodo capturé.',
    coordinates: { x: 78, y: 75 },
    inhabitants: ['Arachne', 'Orques de la tour'],
    visitedBy: [
      { id: 'char_frodo', name: 'Frodo', color: '#10B981' },
      { id: 'char_sam', name: 'Sam', color: '#F59E0B' },
      { id: 'char_gollum', name: 'Gollum', color: '#9CA3AF' },
    ],
    keyPlaces: ['Escalier en colimaçon', 'Antre d\'Arachne', 'Tour de Cirith Ungol'],
  },
  {
    id: 'loc_mount_doom',
    name: 'Orodruin — la Montagne du Destin',
    type: 'Volcan',
    regime: 'Mordor (domaine de Sauron)',
    description:
      'Volcan actif au cœur du Mordor, lieu où Sauron forgea l\'Anneau Unique au Second Âge. Les Crevasses du Destin (Sammath Naur), à flanc de montagne, sont le seul endroit où l\'Anneau peut être détruit. Destination finale de toute la Quête.',
    coordinates: { x: 85, y: 80 },
    inhabitants: [],
    visitedBy: [
      { id: 'char_frodo', name: 'Frodo', color: '#10B981' },
      { id: 'char_sam', name: 'Sam', color: '#F59E0B' },
      { id: 'char_gollum', name: 'Gollum', color: '#9CA3AF' },
    ],
    keyPlaces: ['Sammath Naur (Crevasses du Destin)', 'Chemin de Sauron'],
  },
  {
    id: 'loc_paths_dead',
    name: 'Les Chemins des Morts',
    type: 'Souterrain maudit',
    regime: 'Aucun (terre maudite)',
    description:
      'Passage souterrain sous les Montagnes Blanches, hanté par les spectres des Hommes des Montagnes qui avaient juré allégeance à Isildur puis l\'avaient trahi. Maudits à ne pas trouver le repos tant que leur serment ne serait pas honoré. Aragorn, héritier d\'Isildur, les convoque et leur offre de racheter leur parjure.',
    coordinates: { x: 52, y: 72 },
    inhabitants: ['Armée des Morts (spectres)'],
    visitedBy: [
      { id: 'char_aragorn', name: 'Aragorn', color: '#3F51B5' },
      { id: 'char_legolas', name: 'Legolas', color: '#34D399' },
      { id: 'char_gimli', name: 'Gimli', color: '#D97706' },
    ],
    keyPlaces: ['La Pierre d\'Erech', 'Le Dwimorberg'],
  },
  {
    id: 'loc_minas_morgul',
    name: 'Minas Morgul',
    type: 'Cité-forteresse corrompue',
    regime: 'Mordor (quartier général du Roi-Sorcier)',
    description:
      'Autrefois Minas Ithil, Tour de la Lune, avant-poste du Gondor. Capturée par les Nazgûl, elle est devenue un lieu de terreur — lumière verdâtre, air empoisonné, pont mort. C\'est d\'ici que part l\'armée du Roi-Sorcier pour assiéger Minas Tirith. Frodo et Sam la contournent pour atteindre les escaliers de Cirith Ungol.',
    coordinates: { x: 76, y: 73 },
    inhabitants: ['Roi-Sorcier', 'Nazgûl', 'Armées de Morgul'],
    visitedBy: [
      { id: 'char_frodo', name: 'Frodo', color: '#10B981' },
      { id: 'char_sam', name: 'Sam', color: '#F59E0B' },
      { id: 'char_gollum', name: 'Gollum', color: '#9CA3AF' },
    ],
    keyPlaces: ['Le Pont de Morgul', 'Les Escaliers (Straight Stair, Winding Stair)'],
  },
  {
    id: 'loc_grey_havens',
    name: 'Les Havres Gris',
    type: 'Port elfique',
    regime: 'Domaine de Círdan le Charpentier',
    description:
      'Derniers ports elfiques de la Terre du Milieu, dans le Golfe de Lhûn à l\'ouest de l\'Ériador. C\'est d\'ici que les Elfes — et les Porteurs de l\'Anneau invités par les Valar — prennent le bateau vers Valinor, les Terres Immortelles. Frodo, Gandalf, Bilbo, Galadriel et Elrond y embarquent. Le dernier adieu.',
    coordinates: { x: 5, y: 20 },
    inhabitants: ['Elfes de Círdan'],
    visitedBy: [
      { id: 'char_frodo', name: 'Frodo', color: '#10B981' },
      { id: 'char_gandalf', name: 'Gandalf', color: '#F5F5DC' },
      { id: 'char_bilbo', name: 'Bilbo', color: '#A78BFA' },
      { id: 'char_sam', name: 'Sam', color: '#F59E0B' },
    ],
    keyPlaces: ['Le Quai Blanc', 'Le Navire Blanc'],
  },
];

// ── Objets nouveaux (T3) ─────────────────────────────────────────────────────

export const t3Objects = [
  {
    id: 'obj_palantir_mt',
    name: 'Palantír de Minas Tirith',
    type: 'Artefact magique',
    description:
      'L\'une des sept Pierres de Vision, conservée secrètement par les Intendants du Gondor dans la Tour Blanche. Denethor II l\'a utilisée pour surveiller l\'ennemi, mais Sauron a exploité la connexion pour lui montrer des visions de défaite inéluctable, le poussant au désespoir et à la folie.',
    creator: 'Fëanor (Elfes de Valinor)',
    createdIn: 'Valinor (Aman)',
    powers: ['Communication à distance', 'Vision du passé et du présent', 'Domination mentale (si Sauron regarde)'],
    currentHolder: 'Aragorn (après la chute de Denethor)',
    holders: [
      { id: 'char_denethor', name: 'Denethor II', color: '#71717A' },
      { id: 'char_aragorn',  name: 'Aragorn',     color: '#3F51B5' },
    ],
    status: 'active',
  },
  {
    id: 'obj_horn_gondor',
    name: 'Cor de Gondor',
    type: 'Artefact dynastique',
    description:
      'Grand cor de guerre des Intendants du Gondor, porté par Boromir. Fendu en deux lors de sa mort à Parth Galen. Les morceaux sont retrouvés et ramenés à Denethor — preuve de la mort de son fils aîné, ce qui accélère sa descente dans le désespoir.',
    creator: 'Gondor (ancestral)',
    createdIn: 'Minas Tirith',
    powers: [],
    currentHolder: 'Denethor (brisé)',
    holders: [
      { id: 'char_boromir',  name: 'Boromir',     color: '#6366F1' },
      { id: 'char_denethor', name: 'Denethor II',  color: '#71717A' },
    ],
    status: 'destroyed',
    statusChangedAtChapter: 9,
  },
];

// ── Événements timeline (T3) ────────────────────────────────────────────────

export const t3TimelineDB = [
  // ── Fil Gondor / Rohan ──────────────────────────────────────────────────────
  {
    id: 'evt_t3_01',
    chapter: 20,
    chapterTitle: "Minas Tirith — la cité blanche",
    title: "Gandalf et Pippin arrivent à Minas Tirith",
    description: "Gandalf chevauche Gripoil à travers le Gondor avec Pippin. Ils arrivent à Minas Tirith — sept cercles de pierre blanche sous l'ombre de Mordor. Pippin découvre une cité magnifique mais rongée par la peur. Gandalf se prépare au siège.",
    locationId: 'loc_minas_tirith',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_pippin', entityType: 'character' },
      { id: 'loc_minas_tirith', entityType: 'location' },
    ],
  },
  {
    id: 'evt_t3_02',
    chapter: 20,
    chapterTitle: "Minas Tirith — la cité blanche",
    title: "Denethor interroge Pippin sur la mort de Boromir",
    description: "Denethor reçoit Gandalf et Pippin dans la salle du Trône. Il interroge Pippin sur les circonstances exactes de la mort de Boromir. Le hobbit, submergé de gratitude et de culpabilité, jure service au Gondor — devenant garde de la Citadelle.",
    locationId: 'loc_minas_tirith',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_denethor', entityType: 'character' },
      { id: 'char_pippin',   entityType: 'character' },
      { id: 'char_gandalf',  entityType: 'character' },
    ],
  },
  {
    id: 'evt_t3_03',
    chapter: 22,
    chapterTitle: "Les Chemins des Morts",
    title: "Aragorn prend les Chemins des Morts",
    description: "Aragorn décide de prendre le chemin le plus dangereux et le plus rapide : traverser les Chemins des Morts sous les Montagnes Blanches. Invoquant son droit d'héritier d'Isildur, il convoque l'Armée des Morts à honorer leur serment trahi — ou errer pour l'éternité.",
    locationId: 'loc_paths_dead',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_legolas', entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
      { id: 'loc_paths_dead', entityType: 'location' },
    ],
  },
  {
    id: 'evt_t3_04',
    chapter: 23,
    chapterTitle: "Le Siège de Gondor",
    title: "Siège de Minas Tirith — Faramir blessé",
    description: "Les armées de Mordor assiègent Minas Tirith. Faramir mène une sortie désespérée pour défendre Osgiliath mais est blessé par un trait empoisonné de Nazgûl. Il est ramené inconscient. Le bélier Grond enfonce les portes. Gandalf seul fait face au Roi-Sorcier.",
    locationId: 'loc_minas_tirith',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_faramir',    entityType: 'character' },
      { id: 'char_gandalf',    entityType: 'character' },
      { id: 'char_witch_king', entityType: 'character' },
      { id: 'loc_minas_tirith', entityType: 'location' },
    ],
  },
  {
    id: 'evt_t3_05',
    chapter: 23,
    chapterTitle: "Le Siège de Gondor",
    title: "Folie de Denethor — le bûcher",
    description: "Convaincu que tout est perdu, Denethor tente d'immoler son fils Faramir blessé et lui-même sur un bûcher dans les Tombes des Rois. Pippin alerte Gandalf. Beregond et Gandalf sauvent Faramir in extremis. Denethor se jette dans les flammes en serrant le Palantír.",
    locationId: 'loc_minas_tirith',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_denethor',    entityType: 'character' },
      { id: 'char_faramir',     entityType: 'character' },
      { id: 'char_pippin',      entityType: 'character' },
      { id: 'char_gandalf',     entityType: 'character' },
      { id: 'obj_palantir_mt',  entityType: 'object'    },
    ],
  },
  {
    id: 'evt_t3_06',
    chapter: 24,
    chapterTitle: "Le Champ du Pelennor",
    title: "Charge de Théoden à l'aube du Pelennor",
    description: "Six mille cavaliers de Rohan arrivent à l'aube sur le Pelennor. Théoden sonne le cor et charge l'armée de Mordor. Un moment d'héroïsme pur — la plus grande charge de cavalerie de l'histoire de la Terre du Milieu. Mais Théoden est désarçonné par le Roi-Sorcier et mortellement écrasé par son cheval.",
    locationId: 'loc_pelennor',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_theoden', entityType: 'character' },
      { id: 'char_eomer',   entityType: 'character' },
      { id: 'char_eowyn',   entityType: 'character' },
      { id: 'char_merry',   entityType: 'character' },
      { id: 'loc_pelennor',  entityType: 'location' },
    ],
  },
  {
    id: 'evt_t3_07',
    chapter: 24,
    chapterTitle: "Le Champ du Pelennor",
    title: "Éowyn et Merry tuent le Roi-Sorcier",
    description: "Le Roi-Sorcier se dresse au-dessus de Théoden mourant. Éowyn, déguisée en Dernhelm, lui fait face. 'Aucun homme ne peut me tuer.' — 'Je ne suis pas un homme.' Merry le frappe par derrière avec sa lame des Galgals (enchantée contre les esprits du Mal). Éowyn achève le Nazgûl. La prophétie est accomplie.",
    locationId: 'loc_pelennor',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_eowyn',      entityType: 'character' },
      { id: 'char_merry',      entityType: 'character' },
      { id: 'char_witch_king', entityType: 'character' },
      { id: 'char_theoden',    entityType: 'character' },
    ],
  },
  {
    id: 'evt_t3_08',
    chapter: 24,
    chapterTitle: "Le Champ du Pelennor",
    title: "Aragorn arrive avec l'Armée des Morts — victoire au Pelennor",
    description: "Alors que la bataille semble tourner à nouveau en défaveur des défenseurs — des Mûmakil du Harad, l'Armée des Corsaires — les navires noirs remontent l'Anduin. Mais c'est Aragorn qui en débarque, avec l'Armée des Morts et les Rangers du Sud. Le Pelennor est gagné. L'Armée des Morts est libérée de sa malédiction.",
    locationId: 'loc_pelennor',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_legolas', entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
    ],
  },
  {
    id: 'evt_t3_09',
    chapter: 26,
    chapterTitle: "La Porte Noire",
    title: "Marche vers la Porte Noire — diversion pour Frodo",
    description: "Aragorn mène l'armée restante du Gondor et du Rohan devant la Porte Noire du Mordor — non pour vaincre, mais pour détourner l'attention de Sauron de Frodo. Un sacrifice délibéré. Sept mille hommes face à des dizaines de milliers. Gandalf sait que tout repose sur le Porteur.",
    locationId: 'loc_mordor',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_pippin',  entityType: 'character' },
      { id: 'char_merry',   entityType: 'character' },
      { id: 'char_legolas', entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
    ],
  },
  {
    id: 'evt_t3_10',
    chapter: 26,
    chapterTitle: "La Porte Noire",
    title: "La Bouche de Sauron — pourparler",
    description: "Le héraut de Sauron sort de la Porte Noire. Il brandit la cotte de mithril de Frodo et Dard — preuves que le Porteur a été capturé. Le désespoir menace. Mais Gandalf refuse de négocier et arrache les reliques. La bataille commence.",
    locationId: 'loc_mordor',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_mouth_sauron', entityType: 'character' },
      { id: 'char_gandalf',      entityType: 'character' },
      { id: 'char_aragorn',      entityType: 'character' },
      { id: 'obj_mithril',       entityType: 'object'    },
      { id: 'obj_sting',         entityType: 'object'    },
    ],
  },

  // ── Fil Frodo / Sam / Gollum ────────────────────────────────────────────────
  {
    id: 'evt_t3_11',
    chapter: 21,
    chapterTitle: "L'escalier de Cirith Ungol",
    title: "L'escalier de Cirith Ungol — la montée vers le piège",
    description: "Frodo, Sam et Gollum contournent Minas Morgul dont la lumière verdâtre irradie de malveillance. Ils gravissent les escaliers interminables — Straight Stair puis Winding Stair. Frodo s'affaiblit. Gollum prépare sa trahison en silence. Sam sait que quelque chose ne va pas, mais ne peut pas le prouver.",
    locationId: 'loc_minas_morgul',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_frodo',  entityType: 'character' },
      { id: 'char_sam',    entityType: 'character' },
      { id: 'char_gollum', entityType: 'character' },
      { id: 'loc_minas_morgul', entityType: 'location' },
    ],
  },
  {
    id: 'evt_t3_12',
    chapter: 25,
    chapterTitle: "L'Antre d'Arachne",
    title: "Arachne attaque Frodo — Sam contre-attaque avec la Phiale et Dard",
    description: "Gollum mène Frodo dans le tunnel d'Arachne. L'araignée attaque et empoisonne Frodo avec son dard. Sam, désespéré, brandit la Phiale de Galadriel — la lumière repousse Arachne — puis frappe la créature avec Dard. Arachne se retire, blessée. Mais Frodo gît immobile.",
    locationId: 'loc_cirith_ungol',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_frodo',  entityType: 'character' },
      { id: 'char_sam',    entityType: 'character' },
      { id: 'char_shelob', entityType: 'character' },
      { id: 'char_gollum', entityType: 'character' },
      { id: 'obj_phial',   entityType: 'object'    },
      { id: 'obj_sting',   entityType: 'object'    },
    ],
  },
  {
    id: 'evt_t3_13',
    chapter: 25,
    chapterTitle: "L'Antre d'Arachne",
    title: "Sam prend l'Anneau — croit Frodo mort",
    description: "Croyant Frodo mort, Sam prend l'Anneau et Dard. Il doit continuer la Quête seul. Mais les Orques arrivent et emportent Frodo — Sam comprend qu'il n'est qu'endormi par le venin. Frodo est vivant, mais prisonnier dans la tour de Cirith Ungol.",
    locationId: 'loc_cirith_ungol',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_sam',   entityType: 'character' },
      { id: 'char_frodo', entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object' },
    ],
  },
  {
    id: 'evt_t3_14',
    chapter: 26,
    chapterTitle: "La Porte Noire",
    title: "Sam infiltre la tour de Cirith Ungol et sauve Frodo",
    description: "Sam, portant l'Anneau, infiltre seul la tour de Cirith Ungol. Les Orques se sont entre-tués pour la cotte de mithril de Frodo. Sam trouve Frodo nu et torturé dans les étages. Il lui rend l'Anneau. Ils se déguisent en Orques et s'enfuient vers le Mordor.",
    locationId: 'loc_cirith_ungol',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_sam',   entityType: 'character' },
      { id: 'char_frodo', entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object' },
    ],
  },
  {
    id: 'evt_t3_15',
    chapter: 27,
    chapterTitle: "La Montagne du Destin",
    title: "Traversée du plateau de Gorgoroth",
    description: "Frodo et Sam traversent les plaines désolées du Mordor en direction de la Montagne du Destin. L'eau manque. La nourriture manque. L'Anneau pèse de plus en plus lourd. Sam porte littéralement Frodo sur la dernière pente. 'Je ne peux pas porter l'Anneau pour vous, mais je peux vous porter.'",
    locationId: 'loc_mount_doom',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_frodo', entityType: 'character' },
      { id: 'char_sam',   entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object' },
    ],
  },
  {
    id: 'evt_t3_16',
    chapter: 27,
    chapterTitle: "La Montagne du Destin",
    title: "Frodo réclame l'Anneau — Gollum tombe dans le feu",
    description: "Au bord des Crevasses du Destin, Frodo cède enfin à l'Anneau : 'L'Anneau est à moi.' Il le met à son doigt. Mais Gollum, qui les a suivis, se jette sur lui, lui arrache le doigt et l'Anneau, et tombe dans la lave — détruisant l'Anneau Unique. La pitié de Frodo pour Gollum a sauvé le monde.",
    locationId: 'loc_mount_doom',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_frodo',    entityType: 'character' },
      { id: 'char_sam',      entityType: 'character' },
      { id: 'char_gollum',   entityType: 'character' },
      { id: 'obj_one_ring',  entityType: 'object'    },
      { id: 'loc_mount_doom', entityType: 'location' },
    ],
  },

  // ── Résolution ──────────────────────────────────────────────────────────────
  {
    id: 'evt_t3_17',
    chapter: 27,
    chapterTitle: "La Montagne du Destin",
    title: "L'Anneau détruit — Sauron s'effondre — les Aigles",
    description: "L'Anneau est détruit. Barad-dûr s'effondre. L'armée de Sauron à la Porte Noire se désintègre. Le Mordor s'écroule sur lui-même. Gandalf envoie les Aigles de Gwaihir sauver Frodo et Sam sur les pentes de la Montagne en éruption.",
    locationId: 'loc_mount_doom',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_sam',     entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
    ],
  },
  {
    id: 'evt_t3_18',
    chapter: 28,
    chapterTitle: "Les Havres Gris",
    title: "Couronnement d'Aragorn — le Roi est revenu",
    description: "Aragorn est couronné Roi Elessar Telcontar du Gondor et de l'Arnor réunifié. Gandalf pose la Couronne Ailée sur sa tête. Arwen Undomiel arrive — ils se marient. Les hobbits sont honorés devant le peuple assemblé. Le Quatrième Âge commence.",
    locationId: 'loc_minas_tirith',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_sam',     entityType: 'character' },
      { id: 'char_merry',   entityType: 'character' },
      { id: 'char_pippin',  entityType: 'character' },
      { id: 'obj_anduril',  entityType: 'object'    },
    ],
  },
  {
    id: 'evt_t3_19',
    chapter: 28,
    chapterTitle: "Les Havres Gris",
    title: "Les Havres Gris — Frodo part pour Valinor",
    description: "Frodo, blessé trop profondément par le fardeau de l'Anneau, obtient le droit de naviguer vers les Terres Immortelles avec Gandalf, Bilbo, Galadriel et Elrond. Au port des Havres Gris, Sam dit adieu à son maître. Le Navire Blanc disparaît à l'horizon. Sam rentre chez lui : 'Eh bien, j'y suis.'",
    locationId: 'loc_grey_havens',
    volumeId: 'vol_retour_roi',
    entities: [
      { id: 'char_frodo',     entityType: 'character' },
      { id: 'char_sam',       entityType: 'character' },
      { id: 'char_gandalf',   entityType: 'character' },
      { id: 'char_bilbo',     entityType: 'character' },
      { id: 'char_galadriel', entityType: 'character' },
      { id: 'char_elrond',    entityType: 'character' },
      { id: 'loc_grey_havens', entityType: 'location' },
    ],
  },
];

// ── Incohérences T3 ─────────────────────────────────────────────────────────

export const t3IncoherencesDB = [
  {
    id: 'inc_t3_01',
    type: 'Contradiction logique',
    severity: 'medium',
    title: "Denethor « voit » via le Palantír mais pas la vérité",
    explanation:
      "Les Palantíri montrent la vérité — mais Sauron contrôlait ce que Denethor pouvait voir, ne lui montrant que des visions de défaite et de puissance écrasante. Le Palantír ne ment pas, mais son utilisateur peut être manipulé par un esprit plus fort. La « toute-puissance » de la Pierre est donc conditionnelle, ce que le récit ne rend pas toujours explicite.",
    links: [
      { label: 'Denethor',   entityId: 'char_denethor',   entityType: 'character' },
      { label: 'Palantír MT', entityId: 'obj_palantir_mt', entityType: 'object'    },
    ],
  },
  {
    id: 'inc_t3_02',
    type: 'Incohérence stratégique',
    severity: 'high',
    title: "L'Armée des Morts disparaît après le Pelennor — pourquoi ne pas les utiliser contre Mordor ?",
    explanation:
      "Aragorn libère l'Armée des Morts de leur serment dès la victoire au Pelennor, alors qu'ils auraient pu marcher sur Mordor et écraser Sauron. Explication : le serment était lié à un acte précis (défendre le Gondor), et maintenir les morts au-delà aurait été un acte de domination — contraire à la nature d'Aragorn. Néanmoins, le récit ne détaille pas explicitement cette limite.",
    links: [
      { label: 'Aragorn',  entityId: 'char_aragorn',  entityType: 'character' },
      { label: 'Pelennor', entityId: 'loc_pelennor',   entityType: 'location'  },
    ],
  },
  {
    id: 'inc_t3_03',
    type: 'Incohérence de Porteur',
    severity: 'medium',
    title: "La cotte de mithril confisquée à Cirith Ungol puis montrée à la Porte Noire",
    explanation:
      "Les Orques prennent la cotte de mithril à Frodo dans la tour de Cirith Ungol. La Bouche de Sauron la brandit à la Porte Noire — il l'a donc récupérée. Mais comment un objet pris par un Orque d'une garnison isolée est-il parvenu si vite à Barad-dûr puis à la Porte ? Le suivi de l'objet dans la base est discontinu.",
    links: [
      { label: 'Cotte mithril',    entityId: 'obj_mithril',       entityType: 'object'    },
      { label: 'Bouche de Sauron',  entityId: 'char_mouth_sauron', entityType: 'character' },
      { label: 'Frodo',             entityId: 'char_frodo',        entityType: 'character' },
    ],
  },
  {
    id: 'inc_t3_04',
    type: 'Incohérence stratégique',
    severity: 'low',
    title: "Les Aigles au Mont Destin — pourquoi pas plus tôt ?",
    explanation:
      "Les Aigles de Gwaihir sauvent Frodo et Sam après la destruction de l'Anneau. La question classique : pourquoi ne pas avoir volé directement au Mordor dès le début ? Les Aigles sont des êtres souverains, pas des montures. Le Nazgûl ailé contrôle le ciel. L'Anneau aurait corrompu un Aigle. Mais le texte ne fournit pas ces explications explicitement — c'est un point de débat récurrent parmi les lecteurs.",
    links: [
      { label: 'Frodo',         entityId: 'char_frodo',     entityType: 'character' },
      { label: 'Mont Destin',   entityId: 'loc_mount_doom', entityType: 'location'  },
    ],
  },
];

// ── Chapitres Save the Cat — T3 ────────────────────────────────────────────

export const t3ChaptersDB = [
  {
    id: 'ch_t3_01',
    number: 20,
    title: "Minas Tirith — la cité blanche",
    summary: "Gandalf et Pippin arrivent à Minas Tirith. Denethor, l'Intendant, reçoit la nouvelle de la mort de Boromir. Pippin jure service au Gondor. La cité se prépare au siège. Image d'ouverture du dernier tome : une cité blanche sous une ombre noire grandissante.",
    beats: ['opening_image', 'setup'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_02',
    number: 21,
    title: "L'escalier de Cirith Ungol",
    summary: "Frodo, Sam et Gollum contournent Minas Morgul et gravissent les escaliers interminables vers le col de Cirith Ungol. Le poids de l'Anneau s'alourdit. Le thème du tome se cristallise : peut-on accomplir l'impossible quand le prix est la perte de soi-même ?",
    beats: ['theme_stated', 'catalyst'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_03',
    number: 22,
    title: "Les Chemins des Morts",
    summary: "Aragorn quitte Edoras pour le chemin le plus court et le plus terrible. Avec Legolas et Gimli, il traverse le Dwimorberg et invoque l'Armée des Morts. En parallèle, Merry jure fidélité à Théoden et chevauche secrètement vers le Gondor avec Éowyn déguisée.",
    beats: ['b_story', 'break_into_two'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_04',
    number: 23,
    title: "Le Siège de Gondor",
    summary: "Le siège commence. Faramir est blessé. Grond enfonce les portes. Gandalf seul tient tête au Roi-Sorcier. Denethor, brisé par le Palantír, tente de brûler Faramir et lui-même. Le point médian du tome — la situation est au plus noir.",
    beats: ['fun_and_games', 'midpoint'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_05',
    number: 24,
    title: "Le Champ du Pelennor",
    summary: "L'aube amène les Rohirrim. Théoden charge — et meurt héroïquement. Éowyn et Merry tuent le Roi-Sorcier. Aragorn arrive par le fleuve. La bataille est gagnée, mais le prix est immense. Le climax guerrier du tome.",
    beats: ['bad_guys'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_06',
    number: 25,
    title: "L'Antre d'Arachne",
    summary: "Gollum mène Frodo dans le tunnel d'Arachne. L'araignée empoisonne Frodo. Sam, seul, utilise la Phiale et Dard pour repousser la créature. Croyant Frodo mort, il prend l'Anneau. Les Orques emportent Frodo — il est vivant. Tout est perdu pour Sam.",
    beats: ['all_is_lost', 'dark_night'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_07',
    number: 26,
    title: "La Porte Noire",
    summary: "Double front : Aragorn mène l'armée restante devant la Porte Noire comme diversion. La Bouche de Sauron brandit les reliques de Frodo. En parallèle, Sam infiltre la tour de Cirith Ungol et sauve Frodo. Le troisième acte commence.",
    beats: ['break_into_three'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_08',
    number: 27,
    title: "La Montagne du Destin",
    summary: "Frodo et Sam traversent le Mordor. Sam porte Frodo sur les dernières pentes. Au bord des Crevasses du Destin, Frodo cède à l'Anneau. Gollum le lui arrache et tombe dans la lave. L'Anneau est détruit. Sauron s'effondre. Les Aigles sauvent les hobbits. Le finale absolu.",
    beats: ['finale'],
    volumeId: 'vol_retour_roi',
  },
  {
    id: 'ch_t3_09',
    number: 28,
    title: "Les Havres Gris",
    summary: "Aragorn est couronné Roi Elessar. Les hobbits rentrent à la Comté. Frodo, trop blessé par le fardeau, obtient le passage vers les Terres Immortelles. Au port des Havres Gris, il fait ses adieux à Sam, Merry et Pippin. Le Navire Blanc disparaît. Sam rentre chez lui : 'Eh bien, j'y suis.' Image finale de toute la trilogie.",
    beats: ['final_image'],
    volumeId: 'vol_retour_roi',
  },
];

// ── Plants cross-tomes (T1/T2→T3) et plants T3 ─────────────────────────────

export const t3PlantsDB = [
  // Résolutions de plants ouverts
  {
    id: 'plant_t3_01',
    label: "La Phiale de Galadriel — lumière contre Arachne",
    type: 'object',
    plant_chapter_num: 8,
    plant_event_id: 'evt_023',
    payoff_chapter_num: 25,
    payoff_event_id: 'evt_t3_12',
    entity_id: 'obj_phial',
    entity_type: 'object',
    status: 'resolved',
    notes: "Galadriel donne la Phiale à Frodo 'pour les lieux sombres quand toutes les autres lumières s'éteignent'. C'est exactement ce qui arrive dans l'antre d'Arachne : Sam brandit la Phiale, et la lumière d'Eärendil repousse l'araignée. Plant posé au T1, résolu au T3.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: 'vol_retour_roi',
  },
  {
    id: 'plant_t3_02',
    label: "La pitié de Frodo pour Gollum — salut au Mont Destin",
    type: 'theme',
    plant_chapter_num: 10,
    plant_event_id: 'evt_t2_01',
    payoff_chapter_num: 27,
    payoff_event_id: 'evt_t3_16',
    entity_id: 'char_gollum',
    entity_type: 'character',
    status: 'resolved',
    notes: "Frodo choisit d'épargner Gollum et de lui faire confiance, contre l'avis de Sam. Cette pitié, incompréhensible au T2, sauve le monde au T3 : c'est Gollum qui, en arrachant l'Anneau à Frodo, le détruit involontairement en tombant dans la lave. Sans la pitié, pas de destruction de l'Anneau.",
    plantVolumeId: 'vol_deux_tours',
    payoffVolumeId: 'vol_retour_roi',
  },
  {
    id: 'plant_t3_03',
    label: "La lame des Galgals de Merry — mort du Roi-Sorcier",
    type: 'object',
    plant_chapter_num: 3,
    plant_event_id: 'evt_008',
    payoff_chapter_num: 24,
    payoff_event_id: 'evt_t3_07',
    entity_id: 'char_merry',
    entity_type: 'character',
    status: 'resolved',
    notes: "Tom Bombadil sauve les hobbits des Hauts-des-Galgals et leur donne des épées forgées contre le Roi-Sorcier d'Angmar il y a longtemps. Celle de Merry est précisément enchantée pour briser le lien entre le Nazgûl et le monde physique — sans elle, le coup d'Éowyn n'aurait pas suffi. Un plant du chapitre 3 du T1 résolu au chapitre 24 du T3.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: 'vol_retour_roi',
  },
  {
    id: 'plant_t3_04',
    label: "Le destin d'Aragorn — le Roi est couronné",
    type: 'theme',
    plant_chapter_num: 4,
    plant_event_id: 'evt_013',
    payoff_chapter_num: 28,
    payoff_event_id: 'evt_t3_18',
    entity_id: 'char_aragorn',
    entity_type: 'character',
    status: 'resolved',
    notes: "Depuis le Conseil d'Elrond (T1 ch4), le destin d'Aragorn comme héritier d'Isildur et futur roi du Gondor est posé. L'épée reforée (Andúril), les Chemins des Morts, la bataille du Pelennor — tout converge vers le couronnement en T3 ch28. L'arc le plus long de la trilogie.",
    plantVolumeId: 'vol_communaute',
    payoffVolumeId: 'vol_retour_roi',
  },
  // Nouveaux plants T3
  {
    id: 'plant_t3_05',
    label: "Le Palantír de Denethor — la folie de l'Intendant",
    type: 'object',
    plant_chapter_num: 20,
    plant_event_id: 'evt_t3_02',
    payoff_chapter_num: 23,
    payoff_event_id: 'evt_t3_05',
    entity_id: 'obj_palantir_mt',
    entity_type: 'object',
    status: 'resolved',
    notes: "Dès l'arrivée de Gandalf, le comportement de Denethor trahit un savoir qu'il ne devrait pas avoir — fruit de son usage secret du Palantír. Ce plant se résout quand Denethor se jette dans les flammes en serrant la Pierre, révélant enfin la source de son désespoir.",
    plantVolumeId: 'vol_retour_roi',
    payoffVolumeId: 'vol_retour_roi',
  },
  {
    id: 'plant_t3_06',
    label: "Éowyn déguisée en Dernhelm — la prophétie accomplie",
    type: 'character',
    plant_chapter_num: 22,
    plant_event_id: null,
    payoff_chapter_num: 24,
    payoff_event_id: 'evt_t3_07',
    entity_id: 'char_eowyn',
    entity_type: 'character',
    status: 'resolved',
    notes: "Éowyn chevauche secrètement avec les Rohirrim, déguisée en cavalier nommé Dernhelm, emmenant Merry avec elle. Au Pelennor, elle révèle son identité face au Roi-Sorcier qui affirme qu'aucun homme ne peut le tuer : 'Je ne suis pas un homme.' La prophétie de Glorfindel est accomplie.",
    plantVolumeId: 'vol_retour_roi',
    payoffVolumeId: 'vol_retour_roi',
  },
];

// ── Arc émotionnel — T3 (chapitres 20–28) ───────────────────────────────────

export const t3ArcPointsDB = [
  { chapter_number: 20, intensity: 6,  note: "Minas Tirith — tension sourde, ombre grandissante sur la cité blanche" },
  { chapter_number: 21, intensity: 5,  note: "Escaliers de Cirith Ungol — claustrophobie, trahison latente de Gollum" },
  { chapter_number: 22, intensity: 7,  note: "Chemins des Morts — terreur surnaturelle, pari désespéré d'Aragorn" },
  { chapter_number: 23, intensity: 8,  note: "Siège de Gondor — portes enfoncées, Denethor en flammes, désespoir maximal" },
  { chapter_number: 24, intensity: 10, note: "Pelennor — charge de Théoden, Éowyn vs Roi-Sorcier, Aragorn par le fleuve. Climax guerrier" },
  { chapter_number: 25, intensity: 9,  note: "Arachne — Frodo empoisonné, Sam seul avec l'Anneau. « Tout est perdu »" },
  { chapter_number: 26, intensity: 7,  note: "Porte Noire + tour de Cirith Ungol — sacrifice délibéré et sauvetage in extremis" },
  { chapter_number: 27, intensity: 10, note: "Montagne du Destin — destruction de l'Anneau. Le climax absolu de toute la trilogie" },
  { chapter_number: 28, intensity: 4,  note: "Havres Gris — résolution douce-amère, adieux, fin d'un âge" },
];

// ── Fils narratifs — T3 ─────────────────────────────────────────────────────

export const t3ThreadsDB = [
  {
    id: 'thr_gondor',
    name: "La Défense du Gondor",
    color: '#71717A',
    role: 'subplot',
    description:
      "Le siège de Minas Tirith, la folie de Denethor, la blessure de Faramir. Gandalf et Pippin au cœur de la cité assiégée. Culmination : la Porte brisée par Grond et Gandalf seul face au Roi-Sorcier.",
    sort_order: 6,
  },
  {
    id: 'thr_shelob',
    name: "L'Antre d'Arachne",
    color: '#374151',
    role: 'subplot',
    description:
      "La trahison de Gollum prend forme : il mène Frodo dans le piège d'Arachne. Sam seul doit sauver son maître. Le fil qui cristallise la transformation de Sam de simple jardinier en héros.",
    sort_order: 7,
  },
  {
    id: 'thr_return',
    name: "Le Retour du Roi",
    color: '#3F51B5',
    role: 'subplot',
    description:
      "L'arc d'Aragorn atteint sa résolution : les Chemins des Morts, le Pelennor, le couronnement. En parallèle, le retour des hobbits à la Comté et le départ de Frodo aux Havres Gris. La fin d'un âge, le début d'un autre.",
    sort_order: 8,
  },
];

// ── Event Extras — T3 ───────────────────────────────────────────────────────

export const t3EventExtrasDB = {
  evt_t3_01: {
    sceneOrder: 1, beatId: 'opening_image',
    threadIds: ['thr_gondor', 'thr_quest'], povCharacterId: 'char_pippin',
    sceneGoal:     "Atteindre Minas Tirith et avertir le Gondor",
    sceneConflict: "La cité est déjà sous l'ombre de Mordor, le peuple est terrorisé",
    sceneOutcome:  'mixed',
  },
  evt_t3_02: {
    sceneOrder: 2, beatId: 'setup',
    threadIds: ['thr_gondor'], povCharacterId: 'char_pippin',
    sceneGoal:     "Denethor veut des réponses sur Boromir",
    sceneConflict: "Le deuil de Denethor se mue en hostilité envers Gandalf et en désespoir croissant",
    sceneOutcome:  'mixed',
  },
  evt_t3_03: {
    sceneOrder: 1, beatId: 'break_into_two',
    threadIds: ['thr_return', 'thr_quest'], povCharacterId: 'char_aragorn',
    sceneGoal:     "Trouver un renfort décisif pour sauver le Gondor",
    sceneConflict: "Les Chemins des Morts — terreur et spectres, même Gimli tremble",
    sceneOutcome:  'success',
  },
  evt_t3_04: {
    sceneOrder: 1, beatId: 'midpoint',
    threadIds: ['thr_gondor'], povCharacterId: 'char_gandalf',
    sceneGoal:     "Défendre Minas Tirith contre le siège",
    sceneConflict: "Faramir blessé, le bélier Grond enfonce les portes, le Roi-Sorcier entre",
    sceneOutcome:  'disaster',
  },
  evt_t3_05: {
    sceneOrder: 2, beatId: 'midpoint',
    threadIds: ['thr_gondor'], povCharacterId: 'char_pippin',
    sceneGoal:     "Sauver Faramir du bûcher de Denethor",
    sceneConflict: "Denethor a perdu la raison — il tient Faramir prisonnier dans les flammes",
    sceneOutcome:  'mixed',
  },
  evt_t3_06: {
    sceneOrder: 1, beatId: 'bad_guys',
    threadIds: ['thr_return', 'thr_quest'], povCharacterId: 'char_merry',
    sceneGoal:     "Briser le siège de Minas Tirith",
    sceneConflict: "Six mille Rohirrim face à des dizaines de milliers d'Orques, Mûmakil, Nazgûl",
    sceneOutcome:  'mixed',
  },
  evt_t3_07: {
    sceneOrder: 2, beatId: 'bad_guys',
    threadIds: ['thr_return', 'thr_quest'], povCharacterId: 'char_eowyn',
    sceneGoal:     "Protéger Théoden mourant",
    sceneConflict: "Le Roi-Sorcier — aucun homme ne peut le tuer",
    sceneOutcome:  'success',
  },
  evt_t3_08: {
    sceneOrder: 3, beatId: 'bad_guys',
    threadIds: ['thr_return'], povCharacterId: 'char_aragorn',
    sceneGoal:     "Arriver à temps pour retourner la bataille",
    sceneConflict: "Les Corsaires du Harad dominaient le fleuve — Aragorn a dû les vaincre d'abord",
    sceneOutcome:  'success',
  },
  evt_t3_09: {
    sceneOrder: 1, beatId: 'break_into_three',
    threadIds: ['thr_quest', 'thr_return'], povCharacterId: 'char_aragorn',
    sceneGoal:     "Détourner l'attention de Sauron pour que Frodo puisse atteindre le Mont Destin",
    sceneConflict: "Sept mille hommes face à l'armée entière du Mordor — un sacrifice",
    sceneOutcome:  'mixed',
  },
  evt_t3_10: {
    sceneOrder: 2, beatId: 'break_into_three',
    threadIds: ['thr_quest'], povCharacterId: 'char_gandalf',
    sceneGoal:     "Ne pas céder aux provocations de la Bouche de Sauron",
    sceneConflict: "La Bouche brandit la cotte de mithril — le Porteur est-il capturé ?",
    sceneOutcome:  'mixed',
  },
  evt_t3_11: {
    sceneOrder: 1, beatId: 'catalyst',
    threadIds: ['thr_quest', 'thr_shelob'], povCharacterId: 'char_sam',
    sceneGoal:     "Atteindre le col de Cirith Ungol et entrer en Mordor",
    sceneConflict: "Escaliers interminables, Frodo s'affaiblit, Gollum prépare sa trahison",
    sceneOutcome:  'mixed',
  },
  evt_t3_12: {
    sceneOrder: 1, beatId: 'all_is_lost',
    threadIds: ['thr_quest', 'thr_shelob'], povCharacterId: 'char_sam',
    sceneGoal:     "Survivre au tunnel d'Arachne",
    sceneConflict: "Arachne attaque Frodo — Sam doit affronter seul une créature primordiale",
    sceneOutcome:  'mixed',
  },
  evt_t3_13: {
    sceneOrder: 2, beatId: 'dark_night',
    threadIds: ['thr_quest'], povCharacterId: 'char_sam',
    sceneGoal:     "Continuer la Quête après la « mort » de Frodo",
    sceneConflict: "Sam prend l'Anneau — mais les Orques emportent Frodo, qui est vivant",
    sceneOutcome:  'disaster',
  },
  evt_t3_14: {
    sceneOrder: 1, beatId: 'break_into_three',
    threadIds: ['thr_quest'], povCharacterId: 'char_sam',
    sceneGoal:     "Sauver Frodo de la tour de Cirith Ungol",
    sceneConflict: "Tour pleine d'Orques — Sam est seul avec l'Anneau et Dard",
    sceneOutcome:  'success',
  },
  evt_t3_15: {
    sceneOrder: 1, beatId: 'finale',
    threadIds: ['thr_quest'], povCharacterId: 'char_sam',
    sceneGoal:     "Atteindre la Montagne du Destin",
    sceneConflict: "Frodo à bout de forces, plus d'eau, plus de nourriture, l'Anneau pèse des tonnes",
    sceneOutcome:  'mixed',
  },
  evt_t3_16: {
    sceneOrder: 2, beatId: 'finale',
    threadIds: ['thr_quest'], povCharacterId: 'char_frodo',
    sceneGoal:     "Détruire l'Anneau dans les Crevasses du Destin",
    sceneConflict: "Frodo cède et réclame l'Anneau — mais Gollum intervient",
    sceneOutcome:  'success',
  },
  evt_t3_17: {
    sceneOrder: 3, beatId: 'finale',
    threadIds: ['thr_quest'], povCharacterId: 'char_gandalf',
    sceneGoal:     "La victoire finale",
    sceneConflict: "L'Anneau détruit, mais Frodo et Sam sont piégés sur un volcan en éruption",
    sceneOutcome:  'success',
  },
  evt_t3_18: {
    sceneOrder: 1, beatId: 'final_image',
    threadIds: ['thr_return'], povCharacterId: 'char_aragorn',
    sceneGoal:     "Fonder le nouveau règne",
    sceneConflict: "Le monde a changé — il faut guérir, pas seulement vaincre",
    sceneOutcome:  'success',
  },
  evt_t3_19: {
    sceneOrder: 2, beatId: 'final_image',
    threadIds: ['thr_quest', 'thr_return'], povCharacterId: 'char_sam',
    sceneGoal:     "Dire adieu",
    sceneConflict: "Frodo est trop blessé pour rester — Sam doit le laisser partir",
    sceneOutcome:  'mixed',
  },
};

// ── Arcs de personnages — T3 ────────────────────────────────────────────────

export const t3CharacterArcsDB = [
  // Frodo — courage T3
  {
    id: 'cax_frodo_courage_t3',
    characterId: 'char_frodo',
    label: 'Courage (T3)',
    color: '#10B981',
    points: [
      { chapter_num: 20, value: 7,  note: 'Déterminé mais épuisé — le fardeau grandit' },
      { chapter_num: 21, value: 6,  note: 'Les escaliers — continue malgré la terreur et la trahison pressentie' },
      { chapter_num: 25, value: 4,  note: 'Empoisonné par Arachne — incapable de se défendre' },
      { chapter_num: 27, value: 3,  note: 'Au bout du rouleau — ne peut plus avancer seul, Sam le porte' },
      { chapter_num: 27, value: 10, note: 'Atteint les Crevasses du Destin — mais l\'Anneau gagne (pas un échec, la limite humaine)' },
    ],
  },
  // Frodo — résistance à l'Anneau T3
  {
    id: 'cax_frodo_resistance_t3',
    characterId: 'char_frodo',
    label: 'Résistance à l\'Anneau (T3)',
    color: '#EF4444',
    points: [
      { chapter_num: 20, value: 3,  note: 'L\'Anneau murmure constamment — la résistance s\'effrite' },
      { chapter_num: 21, value: 2,  note: 'Envoie Sam en arrière sur les mensonges de Gollum — jugement altéré' },
      { chapter_num: 25, value: 1,  note: 'Après Arachne — trop faible pour résister, mais l\'Anneau est avec Sam' },
      { chapter_num: 27, value: 0,  note: 'Les Crevasses du Destin : « L\'Anneau est à moi. » Frodo cède complètement' },
    ],
  },
  // Sam — dévouement et héroïsme
  {
    id: 'cax_sam_devotion_t3',
    characterId: 'char_sam',
    label: 'Dévouement et héroïsme',
    color: '#F59E0B',
    points: [
      { chapter_num: 21, value: 8,  note: 'Fidèle malgré les escaliers — méfiance instinctive envers Gollum' },
      { chapter_num: 25, value: 10, note: 'Affronte Arachne seul — prend l\'Anneau — moment le plus héroïque' },
      { chapter_num: 26, value: 9,  note: 'Infiltre la tour de Cirith Ungol seul pour sauver Frodo' },
      { chapter_num: 27, value: 10, note: '« Je ne peux pas le porter pour vous, mais je peux vous porter. »' },
      { chapter_num: 28, value: 7,  note: 'De retour à la Comté — jardinier, père, Maire. Le héros discret.' },
    ],
  },
  // Aragorn — leadership révélé T3
  {
    id: 'cax_aragorn_leadership_t3',
    characterId: 'char_aragorn',
    label: 'Leadership révélé (T3)',
    color: '#3F51B5',
    points: [
      { chapter_num: 22, value: 9,  note: 'Prend les Chemins des Morts — décision que seul un roi peut prendre' },
      { chapter_num: 24, value: 10, note: 'Arrive au Pelennor — retourne la bataille — le Roi est revenu' },
      { chapter_num: 26, value: 10, note: 'Mène la marche vers la Porte Noire — sacrifice délibéré par stratégie' },
      { chapter_num: 28, value: 10, note: 'Couronné Roi Elessar — le cercle est complet' },
    ],
  },
  // Éowyn — libération
  {
    id: 'cax_eowyn_liberation_t3',
    characterId: 'char_eowyn',
    label: 'Libération',
    color: '#F0ABFC',
    points: [
      { chapter_num: 22, value: 7,  note: 'Se déguise en Dernhelm — refuse le rôle qu\'on lui a assigné' },
      { chapter_num: 24, value: 10, note: '« Je ne suis pas un homme. » — tue le Roi-Sorcier, blessée grièvement' },
      { chapter_num: 28, value: 8,  note: 'Guérie aux Maisons de Guérison — trouve l\'amour avec Faramir, choisit la vie' },
    ],
  },
  // Théoden — gloire finale
  {
    id: 'cax_theoden_glory_t3',
    characterId: 'char_theoden',
    label: 'Gloire finale',
    color: '#B45309',
    points: [
      { chapter_num: 22, value: 9,  note: 'Mène la chevauchée de Rohan vers le Gondor — roi accompli' },
      { chapter_num: 24, value: 10, note: 'Charge héroïque à l\'aube — meurt écrasé mais victorieux. Derniers mots à Merry.' },
    ],
  },
  // Denethor — désespoir
  {
    id: 'cax_denethor_despair_t3',
    characterId: 'char_denethor',
    label: 'Désespoir',
    color: '#71717A',
    points: [
      { chapter_num: 20, value: 4,  note: 'Orgueilleux mais encore lucide — refuse l\'aide d\'Aragorn' },
      { chapter_num: 23, value: 2,  note: 'Faramir blessé — le fils restant va mourir comme Boromir' },
      { chapter_num: 23, value: 0,  note: 'Se jette dans les flammes — le Palantír a tout corrompu' },
    ],
  },
];

// ── Voyage du Héros — Sam (T3) ──────────────────────────────────────────────

export const t3HeroJourneyDB = [
  { stageKey: 'ordinary_world',     characterId: 'char_sam', chapterNum: 20, summary: "Sam suit Frodo vers le Mordor — jardinier fidèle, sans prétention héroïque. Sa force vient de sa loyauté simple et de son amour pour la Comté.", volumeId: 'vol_retour_roi' },
  { stageKey: 'call_to_adventure',  characterId: 'char_sam', chapterNum: 21, summary: "Les escaliers de Cirith Ungol — la route devient mortelle. Sam comprend que cette quête pourrait ne pas avoir de retour.", volumeId: 'vol_retour_roi' },
  { stageKey: 'refusal',            characterId: 'char_sam', chapterNum: 21, summary: "Sam veut convaincre Frodo de ne pas suivre Gollum dans le tunnel. Son instinct crie au piège, mais Frodo ne l'écoute pas.", volumeId: 'vol_retour_roi' },
  { stageKey: 'mentor',             characterId: 'char_sam', chapterNum: 25, summary: "Le souvenir de Gandalf et la lumière de la Phiale : 'Il y a du bon dans ce monde, monsieur Frodo, et ça vaut la peine de se battre pour ça.'", volumeId: 'vol_retour_roi' },
  { stageKey: 'threshold',          characterId: 'char_sam', chapterNum: 25, summary: "Sam prend l'Anneau croyant Frodo mort — il devient Porteur. Le franchissement du seuil : d'aide de camp à héros.", volumeId: 'vol_retour_roi' },
  { stageKey: 'tests',              characterId: 'char_sam', chapterNum: 26, summary: "Sam infiltre seul la tour de Cirith Ungol — combat des Orques, retrouve Frodo nu et torturé. L'épreuve la plus solitaire.", volumeId: 'vol_retour_roi' },
  { stageKey: 'inmost_cave',        characterId: 'char_sam', chapterNum: 27, summary: "La plaine de Gorgoroth — marche vers la Montagne du Destin. Plus d'eau, plus de nourriture. Sam porte Frodo sur les dernières pentes.", volumeId: 'vol_retour_roi' },
  { stageKey: 'ordeal',             characterId: 'char_sam', chapterNum: 27, summary: "Frodo réclame l'Anneau au bord des Crevasses du Destin. Le cauchemar ultime pour Sam — son maître a cédé.", volumeId: 'vol_retour_roi' },
  { stageKey: 'reward',             characterId: 'char_sam', chapterNum: 27, summary: "Gollum tombe avec l'Anneau — l'Anneau est détruit. La Quête est accomplie. Sam et Frodo sont sauvés par les Aigles.", volumeId: 'vol_retour_roi' },
  { stageKey: 'road_back',          characterId: 'char_sam', chapterNum: 28, summary: "Retour à la Comté — mais le monde a changé. Sam doit apprendre à vivre après l'aventure.", volumeId: 'vol_retour_roi' },
  { stageKey: 'resurrection',       characterId: 'char_sam', chapterNum: 28, summary: "Sam fait face au Nettoyage de la Comté — il prouve qu'il est devenu un leader, pas seulement un suiveur.", volumeId: 'vol_retour_roi' },
  { stageKey: 'return_with_elixir', characterId: 'char_sam', chapterNum: 28, summary: "Sam plante le mallorn de Galadriel à Hobbitebourg, épouse Rosie, fonde sa famille et devient Maire de la Comté. Le héros discret qui a sauvé le monde rentre chez lui : 'Eh bien, j'y suis.'", volumeId: 'vol_retour_roi' },
];

// ── Groupes T3 ──────────────────────────────────────────────────────────────

export const t3GroupsDB = [
  {
    id: 'grp_gondor',
    name: 'Le Gondor',
    type: 'Faction',
    color: '#71717A',
    description:
      'Dernier grand royaume des Hommes de l\'Ouest, fondé par les exilés de Númenor. Gouverné par des Intendants en l\'absence des Rois depuis près de mille ans. Minas Tirith en est la capitale. Le Gondor porte le poids principal de la guerre contre le Mordor.',
    homelandId: 'loc_minas_tirith',
    members: [
      { characterId: 'char_denethor', roleInGroup: 'Intendant régnant' },
      { characterId: 'char_faramir',  roleInGroup: 'Capitaine des Rangers' },
      { characterId: 'char_boromir',  roleInGroup: 'Capitaine de la Tour Blanche (†)' },
    ],
  },
  {
    id: 'grp_army_dead',
    name: 'L\'Armée des Morts',
    type: 'Faction',
    color: '#6EE7B7',
    description:
      'Spectres des Hommes des Montagnes qui avaient juré allégeance à Isildur et l\'avaient trahi. Maudits à ne pas trouver le repos tant que leur serment ne serait pas honoré. Aragorn, héritier d\'Isildur, les convoque et leur offre de racheter leur parjure en combattant au Pelennor.',
    homelandId: 'loc_paths_dead',
    members: [],
  },
];

// ── Trajets carte T3 ────────────────────────────────────────────────────────

export const t3FrodoJourney = [
  {
    id: 0, etape: 1, scene: 'minas_morgul',
    lieu: 'Minas Morgul', sous_lieu: 'Contournement de la cité maudite',
    chapitre: 'Le Retour du Roi, VI-1',
    action: 'Frodo, Sam et Gollum contournent Minas Morgul dans la terreur. La cité irradie une lumière verdâtre. L\'armée du Roi-Sorcier en sort pour marcher sur le Gondor.',
    allies: ['char_sam', 'char_gollum'],
    x: 76, y: 73,
  },
  {
    id: 1, etape: 2, scene: 'escaliers',
    lieu: 'Escaliers de Cirith Ungol', sous_lieu: 'Straight Stair puis Winding Stair',
    chapitre: 'Le Retour du Roi, VI-1',
    action: 'Montée interminable dans l\'obscurité. Frodo s\'affaiblit. Gollum prépare sa trahison. Sam sent le piège mais ne peut rien prouver.',
    allies: ['char_sam', 'char_gollum'],
    x: 77, y: 74,
  },
  {
    id: 2, etape: 3, scene: 'antre_arachne',
    lieu: 'Cirith Ungol — Antre d\'Arachne', sous_lieu: 'Tunnel de l\'araignée',
    chapitre: 'Le Retour du Roi, VI-2',
    action: 'Gollum mène Frodo dans le tunnel d\'Arachne. L\'araignée attaque. Frodo est empoisonné. Sam utilise la Phiale et Dard pour la repousser.',
    allies: ['char_sam'],
    x: 78, y: 75,
  },
  {
    id: 3, etape: 4, scene: 'tour_ungol',
    lieu: 'Tour de Cirith Ungol', sous_lieu: 'Prison orque',
    chapitre: 'Le Retour du Roi, VI-3',
    action: 'Frodo est capturé par les Orques. Sam infiltre la tour seul et le sauve. Ils se déguisent en Orques et s\'enfuient.',
    allies: ['char_sam'],
    x: 79, y: 76,
  },
  {
    id: 4, etape: 5, scene: 'gorgoroth',
    lieu: 'Plaine de Gorgoroth', sous_lieu: 'Mordor intérieur',
    chapitre: 'Le Retour du Roi, VI-4',
    action: 'Traversée du plateau désolé du Mordor. Plus d\'eau, plus de nourriture. Sam porte Frodo sur les dernières pentes de la Montagne du Destin.',
    allies: ['char_sam'],
    x: 82, y: 78,
  },
  {
    id: 5, etape: 6, scene: 'mont_destin',
    lieu: 'Orodruin — Crevasses du Destin', sous_lieu: 'Sammath Naur',
    chapitre: 'Le Retour du Roi, VI-4',
    action: 'Frodo cède à l\'Anneau : « L\'Anneau est à moi. » Gollum le lui arrache et tombe dans la lave. L\'Anneau est détruit. Les Aigles sauvent les hobbits.',
    allies: ['char_sam'],
    x: 85, y: 80,
  },
];

export const t3AragornJourney = [
  {
    id: 0, etape: 1, scene: 'chemins_morts',
    lieu: 'Les Chemins des Morts', sous_lieu: 'Sous les Montagnes Blanches',
    chapitre: 'Le Retour du Roi, V-2',
    action: 'Aragorn invoque l\'Armée des Morts sous la montagne. Legolas et Gimli l\'accompagnent. Même le nain tremble devant les spectres.',
    allies: ['char_legolas', 'char_gimli'],
    x: 52, y: 72,
  },
  {
    id: 1, etape: 2, scene: 'pelargir',
    lieu: 'Pelargir', sous_lieu: 'Port fluvial du Gondor',
    chapitre: 'Le Retour du Roi, V-2',
    action: 'Aragorn et l\'Armée des Morts prennent les navires des Corsaires d\'Umbar à Pelargir. Les morts terrifient les pirates qui fuient.',
    allies: ['char_legolas', 'char_gimli'],
    x: 58, y: 82,
  },
  {
    id: 2, etape: 3, scene: 'pelennor',
    lieu: 'Champs du Pelennor', sous_lieu: 'Arrivée par le Harlond',
    chapitre: 'Le Retour du Roi, V-6',
    action: 'Aragorn débarque des navires noirs avec les Rangers et l\'Armée des Morts. La bannière d\'Elendil se déploie. La bataille tourne. L\'Armée des Morts est libérée de sa malédiction.',
    allies: ['char_legolas', 'char_gimli'],
    x: 64, y: 77,
  },
  {
    id: 3, etape: 4, scene: 'minas_tirith',
    lieu: 'Minas Tirith', sous_lieu: 'La Cité Blanche',
    chapitre: 'Le Retour du Roi, V-8',
    action: 'Aragorn entre à Minas Tirith — non par la grande porte, mais par les Maisons de Guérison, pour soigner Éowyn, Faramir et Merry. « Les mains du roi sont des mains de guérisseur. »',
    allies: ['char_gandalf'],
    x: 65, y: 75,
  },
  {
    id: 4, etape: 5, scene: 'porte_noire',
    lieu: 'Morannon — La Porte Noire', sous_lieu: 'Devant les portes du Mordor',
    chapitre: 'Le Retour du Roi, V-10',
    action: 'Aragorn mène l\'armée devant la Porte Noire — diversion pour Frodo. Pourparler avec la Bouche de Sauron. La bataille éclate. Sauron s\'effondre quand l\'Anneau est détruit.',
    allies: ['char_gandalf', 'char_legolas', 'char_gimli', 'char_pippin', 'char_merry'],
    x: 78, y: 58,
  },
  {
    id: 5, etape: 6, scene: 'couronnement',
    lieu: 'Minas Tirith — Couronnement', sous_lieu: 'Devant la Tour Blanche',
    chapitre: 'Le Retour du Roi, VI-5',
    action: 'Aragorn est couronné Roi Elessar Telcontar. Gandalf pose la Couronne Ailée. Arwen arrive. Le Quatrième Âge commence.',
    allies: ['char_gandalf', 'char_frodo', 'char_sam', 'char_merry', 'char_pippin'],
    x: 65, y: 75,
  },
];

export const t3SamJourney = [
  {
    id: 0, etape: 1, scene: 'escaliers_sam',
    lieu: 'Escaliers de Cirith Ungol', sous_lieu: 'Avec Frodo et Gollum',
    chapitre: 'Le Retour du Roi, VI-1',
    action: 'Sam suit Frodo dans les escaliers. Il sait que Gollum les trahira mais Frodo refuse de l\'écouter. Sam veille.',
    allies: ['char_frodo', 'char_gollum'],
    x: 77, y: 74,
  },
  {
    id: 1, etape: 2, scene: 'arachne_sam',
    lieu: 'Cirith Ungol — Antre d\'Arachne', sous_lieu: 'Sam seul contre Arachne',
    chapitre: 'Le Retour du Roi, VI-2',
    action: 'Frodo empoisonné. Sam brandit la Phiale de Galadriel et Dard. Il repousse Arachne. Croyant Frodo mort, il prend l\'Anneau et décide de continuer la Quête seul.',
    allies: [],
    x: 78, y: 75,
  },
  {
    id: 2, etape: 3, scene: 'tour_sam',
    lieu: 'Tour de Cirith Ungol', sous_lieu: 'Infiltration solo',
    chapitre: 'Le Retour du Roi, VI-3',
    action: 'Sam, portant l\'Anneau, infiltre la tour seul. Les Orques se sont entre-tués. Il trouve Frodo et le libère. Il lui rend l\'Anneau — le seul à l\'avoir jamais fait volontairement.',
    allies: ['char_frodo'],
    x: 79, y: 76,
  },
  {
    id: 3, etape: 4, scene: 'gorgoroth_sam',
    lieu: 'Plaine de Gorgoroth', sous_lieu: 'Sam porte Frodo',
    chapitre: 'Le Retour du Roi, VI-4',
    action: '« Je ne peux pas le porter pour vous, mais je peux vous porter. » Sam soulève Frodo sur son dos et gravit la Montagne du Destin.',
    allies: ['char_frodo'],
    x: 82, y: 78,
  },
  {
    id: 4, etape: 5, scene: 'mont_destin_sam',
    lieu: 'Orodruin — Crevasses du Destin', sous_lieu: 'Sammath Naur',
    chapitre: 'Le Retour du Roi, VI-4',
    action: 'Sam assiste impuissant quand Frodo cède à l\'Anneau. Gollum intervient et tombe dans la lave. L\'Anneau est détruit. Les Aigles les sauvent.',
    allies: ['char_frodo'],
    x: 85, y: 80,
  },
  {
    id: 5, etape: 6, scene: 'havres_gris_sam',
    lieu: 'Les Havres Gris', sous_lieu: 'Le dernier adieu',
    chapitre: 'Le Retour du Roi, VI-9',
    action: 'Sam accompagne Frodo aux Havres Gris. Il dit adieu à son maître. Le Navire Blanc disparaît. Sam rentre chez lui : « Eh bien, j\'y suis. »',
    allies: ['char_merry', 'char_pippin'],
    x: 5, y: 20,
  },
];
