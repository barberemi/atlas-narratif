/**
 * Seed Harry Potter — Tome 1 « À l'école des sorciers ».
 *
 * Jeu de données de démonstration riche illustrant toutes les vues :
 * lore (personnages/lieux/objets) + champs custom (couche 2), types & entités
 * custom (couche 3 : Maisons, Sortilèges, Créatures), timeline (scènes),
 * Save the Cat (chapitres + beats), fils narratifs, relations explicites.
 *
 * Chargé via src/db/seed.hp.js → buildHpSeedPayload() (route /demo-hp).
 */

// ── Tome ──────────────────────────────────────────────────────────────────────
export const volumesDB = [
  { id: 'vol_hp1', number: 1, title: "Tome 1 — À l'école des sorciers", description: "Première année de Harry à Poudlard : la découverte du monde magique et la quête de la Pierre philosophale." },
];

// ── Lore : personnages / lieux / objets ───────────────────────────────────────
export const loreDB = {
  characters: [
    {
      id: 'char_harry', name: 'Harry Potter',
      aliases: ['Le Survivant', "L'Élu", 'Harry'],
      race: 'Sorcier', role: 'Élève de Gryffondor',
      origin: "Godric's Hollow", affiliations: ['Gryffondor', "L'Ordre du Phénix (plus tard)"],
      description: "Orphelin élevé par les Dursley, Harry découvre à onze ans qu'il est un sorcier célèbre : seul survivant du sortilège de mort de Voldemort. Sa cicatrice en forme d'éclair est la marque de ce passé.",
      traits: ['Courageux', 'Loyal', 'Impulsif', 'Modeste'],
      color: '#B91C1C', journeyKey: 'harry',
      customFields: { Baguette: 'Houx et plume de phénix, 27,5 cm', Patronus: 'Cerf', Balai: 'Nimbus 2000', 'Date de naissance': '31 juillet 1980' },
    },
    {
      id: 'char_ron', name: 'Ron Weasley',
      aliases: ['Ron'], race: 'Sorcier', role: 'Élève de Gryffondor',
      origin: 'Le Terrier, Loutry Ste Chaspoule', affiliations: ['Gryffondor', 'Famille Weasley'],
      description: "Sixième fils d'une famille de sorciers modeste et chaleureuse. Premier ami de Harry, fidèle et drôle, il compense un manque de confiance par une loyauté à toute épreuve et un vrai génie stratégique aux échecs.",
      traits: ['Loyal', 'Drôle', 'Complexé', 'Stratège'],
      color: '#EA580C', journeyKey: 'ron',
      customFields: { Baguette: "Frêne (d'occasion, celle de Charlie)", Animal: 'Croûtard le rat' },
    },
    {
      id: 'char_hermione', name: 'Hermione Granger',
      aliases: ['Hermione'], race: 'Sorcière', role: 'Élève de Gryffondor',
      origin: 'Londres (parents moldus dentistes)', affiliations: ['Gryffondor'],
      description: "Née de parents moldus, Hermione est la meilleure élève de sa promotion. Rationnelle, travailleuse et parfois cassante, elle devient le cerveau du trio — sans elle, la Pierre philosophale n'aurait jamais été sauvée.",
      traits: ['Brillante', 'Rigoureuse', 'Courageuse', 'Loyale'],
      color: '#CA8A04', journeyKey: 'hermione',
      customFields: { Baguette: 'Vigne et ventricule de dragon, 27 cm', Matière: 'Métamorphose (favorite)' },
    },
    {
      id: 'char_dumbledore', name: 'Albus Dumbledore',
      aliases: ['Le directeur', 'Albus'], race: 'Sorcier', role: 'Directeur de Poudlard',
      origin: "Godric's Hollow", affiliations: ['Poudlard', 'Ordre de Merlin'],
      description: "Le plus grand sorcier de son temps, directeur de Poudlard. Bienveillant, énigmatique et redoutablement intelligent, il veille sur Harry de loin et orchestre discrètement la protection de la Pierre philosophale.",
      traits: ['Sage', 'Énigmatique', 'Puissant', 'Bienveillant'],
      color: '#7C3AED', journeyKey: 'dumbledore',
      customFields: { Titre: 'Manitou suprême du Magenmagot', Faible: 'Les bonbons au citron' },
    },
    {
      id: 'char_mcgonagall', name: 'Minerva McGonagall',
      aliases: ['Professeur McGonagall'], race: 'Sorcière', role: 'Directrice adjointe',
      origin: 'Écosse', affiliations: ['Poudlard', 'Gryffondor'],
      description: "Directrice de la maison Gryffondor et professeure de métamorphose. Stricte, juste et animagus (elle se change en chat), elle repère très tôt le talent de Harry pour le Quidditch.",
      traits: ['Stricte', 'Juste', 'Loyale', 'Animagus'],
      color: '#166534',
    },
    {
      id: 'char_snape', name: 'Severus Rogue',
      aliases: ['Professeur Rogue', 'Snape'], race: 'Sorcier', role: 'Maître des potions',
      origin: 'Impasse du Tisseur', affiliations: ['Poudlard', 'Serpentard'],
      description: "Maître des potions au caractère glacial, directeur de Serpentard. Il semble détester Harry dès le premier jour. Tous le soupçonnent de vouloir voler la Pierre — mais ses agissements cachent une vérité plus complexe.",
      traits: ['Sarcastique', 'Rancunier', 'Ambigu', 'Brillant'],
      color: '#1F2937',
    },
    {
      id: 'char_hagrid', name: 'Rubeus Hagrid',
      aliases: ['Hagrid'], race: 'Demi-géant', role: 'Garde-chasse de Poudlard',
      origin: 'Poudlard', affiliations: ['Poudlard'],
      description: "Garde-chasse au grand cœur, à moitié géant. C'est lui qui vient chercher Harry pour lui annoncer qu'il est sorcier. Passionné (et imprudent) de créatures dangereuses, il couve un œuf de dragon en cachette.",
      traits: ['Chaleureux', 'Loyal', 'Imprudent', 'Sentimental'],
      color: '#78350F',
      customFields: { Faible: 'Les créatures dangereuses', Parapluie: 'Cache les morceaux de sa baguette brisée' },
    },
    {
      id: 'char_quirrell', name: 'Professeur Quirrell',
      aliases: ['Quirrell'], race: 'Sorcier', role: 'Professeur de Défense contre les forces du Mal',
      origin: 'Inconnu', affiliations: ['Poudlard'],
      description: "Professeur bègue et craintif de Défense contre les forces du Mal, coiffé d'un turban. Sous ses airs pusillanimes se cache le véritable agent de Voldemort — qui vit littéralement à l'arrière de sa tête.",
      traits: ['Craintif (façade)', 'Traître', 'Manipulé'],
      color: '#4B5563',
    },
    {
      id: 'char_voldemort', name: 'Lord Voldemort',
      aliases: ['Tu-Sais-Qui', 'Celui-dont-on-ne-doit-pas-prononcer-le-nom', 'Jedusor'],
      race: 'Sorcier', role: 'Mage noir',
      origin: 'Orphelinat moldu', affiliations: ['Mangemorts'],
      description: "Le plus terrible mage noir de l'histoire. Réduit à une existence spectrale depuis qu'il a échoué à tuer Harry bébé, il survit accroché à Quirrell et convoite la Pierre philosophale pour retrouver un corps.",
      traits: ['Cruel', 'Assoiffé de pouvoir', 'Immortaliste', 'Charismatique'],
      color: '#052e16',
    },
    {
      id: 'char_draco', name: 'Drago Malefoy',
      aliases: ['Malefoy', 'Drago'], race: 'Sorcier', role: 'Élève de Serpentard',
      origin: 'Manoir Malefoy', affiliations: ['Serpentard', 'Famille Malefoy'],
      description: "Héritier arrogant d'une riche famille de sang-pur. Rival déclaré de Harry dès le Poudlard Express, méprisant envers les nés-moldus, il incarne les préjugés du monde sorcier.",
      traits: ['Arrogant', 'Méprisant', 'Lâche', 'Rusé'],
      color: '#334155',
    },
    {
      id: 'char_neville', name: 'Neville Londubat',
      aliases: ['Neville'], race: 'Sorcier', role: 'Élève de Gryffondor',
      origin: 'Angleterre', affiliations: ['Gryffondor'],
      description: "Élève maladroit et timide, souvent oublieux, mais d'un courage discret. Sa maladresse cache une force morale que Dumbledore récompensera : c'est lui qui gagne les derniers points décisifs de l'année.",
      traits: ['Maladroit', 'Timide', 'Courageux (en secret)', 'Fidèle'],
      color: '#B45309',
    },
    {
      id: 'char_ollivander', name: 'Garrick Ollivander',
      aliases: ['Ollivander'], race: 'Sorcier', role: 'Fabricant de baguettes',
      origin: 'Chemin de Traverse', affiliations: [],
      description: "Célèbre fabricant de baguettes du Chemin de Traverse. Il se souvient de chaque baguette vendue et révèle à Harry le lien troublant entre sa baguette et celle de Voldemort — deux plumes du même phénix.",
      traits: ['Érudit', 'Mystérieux', 'Précis'],
      color: '#0F766E',
    },
    {
      id: 'char_molly', name: 'Molly Weasley',
      aliases: ['Mrs Weasley', 'Molly'], race: 'Sorcière', role: 'Matriarche Weasley',
      origin: 'Le Terrier', affiliations: ['Famille Weasley'],
      description: "Mère de Ron et matriarche chaleureuse de la famille Weasley. C'est elle qui, sur le quai de la voie 9¾, indique à Harry comment franchir la barrière magique vers le Poudlard Express.",
      traits: ['Maternelle', 'Généreuse', 'Protectrice'],
      color: '#DC2626',
    },
    {
      id: 'char_flamel', name: 'Nicolas Flamel',
      aliases: ['Flamel'], race: 'Sorcier (alchimiste)', role: 'Alchimiste',
      origin: 'France', affiliations: [],
      description: "Alchimiste légendaire de six cent soixante-cinq ans, seul détenteur connu de la Pierre philosophale et vieil ami de Dumbledore. Le trio met des mois à retrouver son nom — la clé du mystère de l'année.",
      traits: ['Immortel', 'Discret', 'Savant'],
      color: '#9333EA',
    },
  ],

  locations: [
    {
      id: 'loc_poudlard', name: 'Poudlard',
      type: 'École de sorcellerie', regime: 'Dirigée par un directeur et un conseil',
      description: "L'école de sorcellerie la plus prestigieuse de Grande-Bretagne, un château médiéval truffé d'escaliers mouvants, de portraits vivants et de passages secrets. Le foyer que Harry n'a jamais eu.",
      coordinates: { x: 52, y: 30 },
      inhabitants: ['Élèves', 'Professeurs', 'Fantômes', 'Elfes de maison'],
      keyPlaces: ['Grande Salle', 'Salles communes', 'Forêt Interdite', 'Terrain de Quidditch', 'Couloir interdit du 2e étage'],
    },
    {
      id: 'loc_chemin_traverse', name: 'Le Chemin de Traverse',
      type: 'Rue commerçante magique', regime: 'Communauté sorcière',
      description: "Artère commerçante secrète du Londres sorcier, accessible depuis le Chaudron Baveur. On y achète baguettes, grimoires, chaudrons et hiboux. Harry y découvre pour la première fois l'ampleur du monde magique.",
      coordinates: { x: 30, y: 55 },
      inhabitants: ['Commerçants sorciers', 'Gobelins'],
      keyPlaces: ['Ollivander', 'Gringotts', 'Fleury et Bott'],
    },
    {
      id: 'loc_gringotts', name: 'Gringotts',
      type: 'Banque sorcière', regime: 'Gérée par les gobelins',
      description: "La banque des sorciers, tenue par les gobelins, creusée profondément sous Londres. Ses chambres fortes sont réputées inviolables. Hagrid y récupère un mystérieux paquet dans la chambre 713 : la Pierre philosophale.",
      coordinates: { x: 28, y: 58 },
      inhabitants: ['Gobelins'],
      keyPlaces: ['Chambre 713', 'Wagonnets souterrains'],
    },
    {
      id: 'loc_foret_interdite', name: 'La Forêt Interdite',
      type: 'Forêt', regime: 'Interdite aux élèves',
      description: "Forêt dense et dangereuse bordant le parc de Poudlard, peuplée de centaures, d'araignées géantes et de licornes. C'est là que Harry aperçoit pour la première fois la silhouette spectrale de Voldemort buvant le sang d'une licorne.",
      coordinates: { x: 60, y: 38 },
      inhabitants: ['Centaures', 'Licornes', 'Araignées', 'Créatures diverses'],
      keyPlaces: ['Clairière de la licorne'],
    },
    {
      id: 'loc_grande_salle', name: 'La Grande Salle',
      type: 'Salle de Poudlard', regime: 'Poudlard',
      description: "Le cœur social de Poudlard : quatre longues tables (une par maison), un plafond enchanté reflétant le ciel, et l'estrade des professeurs. Lieu de la Répartition, des banquets et de la remise finale de la Coupe des Quatre Maisons.",
      coordinates: { x: 51, y: 31 },
      inhabitants: ['Élèves', 'Professeurs'],
      keyPlaces: ['Estrade des professeurs', 'Tables des maisons'],
    },
    {
      id: 'loc_voie_934', name: 'La voie 9¾',
      type: 'Quai magique', regime: 'Dissimulé aux Moldus',
      description: "Le quai secret de la gare de King's Cross d'où part le Poudlard Express, chaque 1er septembre. On y accède en traversant la barrière entre les quais 9 et 10. C'est là que Harry rencontre les Weasley.",
      coordinates: { x: 22, y: 62 },
      inhabitants: ['Élèves et familles sorcières'],
      keyPlaces: ['Barrière magique', 'Poudlard Express'],
    },
    {
      id: 'loc_privet_drive', name: 'Privet Drive',
      type: 'Banlieue moldue', regime: 'Monde moldu',
      description: "Le 4, Privet Drive, à Little Whinging : la maison des Dursley, banlieue moldue impeccablement ordinaire où Harry grandit dans le placard sous l'escalier, ignorant tout de sa véritable nature.",
      coordinates: { x: 15, y: 70 },
      inhabitants: ['Les Dursley'],
      keyPlaces: ['Le placard sous l\'escalier'],
    },
    {
      id: 'loc_couloir_interdit', name: 'Le couloir interdit',
      type: 'Aile de Poudlard', regime: 'Poudlard (accès interdit)',
      description: "Le couloir du deuxième étage interdit aux élèves « sous peine de mort ». Derrière une trappe gardée par le chien à trois têtes Touffu s'ouvre la série d'épreuves protégeant la Pierre philosophale.",
      coordinates: { x: 53, y: 29 },
      inhabitants: ['Touffu'],
      keyPlaces: ['La trappe', 'Les épreuves', 'La chambre du Miroir'],
    },
  ],

  objects: [
    {
      id: 'obj_baguette_harry', name: 'La baguette de Harry',
      type: 'Baguette magique', creator: 'Ollivander',
      description: "Baguette en bois de houx et plume de phénix, 27,5 cm. Sa plume provient du même phénix (Fumseck) que celle du cœur de la baguette de Voldemort — un lien qui scelle le destin des deux sorciers.",
      powers: ['Canalise la magie de Harry', 'Frère jumeau de la baguette de Voldemort'],
      currentHolder: 'Harry Potter',
    },
    {
      id: 'obj_nimbus', name: 'Nimbus 2000',
      type: 'Balai de course', creator: 'Société Brossdur',
      description: "Balai de course dernier cri, offert anonymement à Harry (par McGonagall) après qu'il ait été admis dans l'équipe de Quidditch. Rapide et nerveux, il fait de Harry le plus jeune attrapeur depuis un siècle.",
      powers: ['Vol rapide', 'Grande maniabilité'],
      currentHolder: 'Harry Potter',
    },
    {
      id: 'obj_cape', name: "La cape d'invisibilité",
      type: 'Objet magique', creator: 'Inconnu (relique)',
      description: "Cape ayant appartenu au père de Harry, transmise anonymement par Dumbledore à Noël. Elle rend totalement invisible celui qui la porte — l'outil clé des expéditions nocturnes du trio.",
      powers: ['Invisibilité totale'],
      currentHolder: 'Harry Potter',
    },
    {
      id: 'obj_pierre', name: 'La Pierre philosophale',
      type: 'Artefact alchimique', creator: 'Nicolas Flamel',
      description: "Pierre alchimique légendaire capable de transformer tout métal en or et de produire l'Élixir de longue vie. Convoitée par Voldemort pour retrouver un corps, elle est l'enjeu central de toute l'année.",
      powers: ['Transmutation en or', 'Élixir de longue vie'],
      currentHolder: 'Nicolas Flamel',
    },
    {
      id: 'obj_choixpeau', name: 'Le Choixpeau magique',
      type: 'Artefact magique', creator: 'Les quatre fondateurs',
      description: "Vieux chapeau pointu et parlant qui répartit chaque nouvel élève dans l'une des quatre maisons en sondant son caractère. Il hésite longuement pour Harry avant de céder à son refus d'aller à Serpentard.",
      powers: ['Répartition des élèves', 'Legilimancie'],
    },
    {
      id: 'obj_miroir', name: 'Le Miroir du Riséd',
      type: 'Artefact magique', creator: 'Inconnu',
      description: "Miroir enchanté qui montre à celui qui s'y regarde le désir le plus profond de son cœur. Dumbledore s'en sert pour protéger la Pierre : seul celui qui veut la trouver sans l'utiliser peut l'en extraire.",
      powers: ['Révèle le désir le plus profond', 'Cache la Pierre philosophale'],
    },
    {
      id: 'obj_vif_or', name: "Le Vif d'or",
      type: 'Balle de Quidditch', creator: 'Fabricants de Quidditch',
      description: "Petite balle dorée ailée, très rapide, que l'attrapeur doit saisir pour clore un match de Quidditch et rapporter 150 points. Harry l'attrape presque en l'avalant lors de son tout premier match.",
      powers: ['Vol erratique et véloce', 'Vaut 150 points'],
    },
    {
      id: 'obj_rappeltout', name: 'Le Rappeltout',
      type: 'Objet magique', creator: 'Inconnu',
      description: "Boule de verre offerte à Neville par sa grand-mère : sa fumée rougit quand on a oublié quelque chose. Volé par Malefoy, il déclenche la première envolée de Harry — et sa vocation d'attrapeur.",
      powers: ['Signale un oubli'],
      currentHolder: 'Neville Londubat',
    },
  ],
};

// ── Fils narratifs (subplots) ──────────────────────────────────────────────────
export const threadsDB = [
  { id: 'thr_pierre', name: 'La quête de la Pierre philosophale', color: '#7C3AED', role: 'main', description: "Fil principal : découvrir ce que cache le couloir interdit, comprendre que la Pierre est en danger, et l'empêcher de tomber entre les mains de Voldemort.", sort_order: 0 },
  { id: 'thr_trio', name: "La naissance du trio", color: '#CA8A04', role: 'subplot', description: "L'amitié entre Harry, Ron et Hermione, scellée par l'épisode du troll, qui devient le socle émotionnel de toute la série.", sort_order: 1 },
  { id: 'thr_rogue', name: 'Les soupçons sur Rogue', color: '#1F2937', role: 'subplot', description: "Le trio est persuadé que Rogue veut voler la Pierre — un faux coupable qui masque le véritable traître, Quirrell.", sort_order: 2 },
];

// ── Timeline : scènes ──────────────────────────────────────────────────────────
export const timelineDB = [
  { id: 'evt_hp_01', chapter: 1, chapterTitle: 'Le survivant', title: 'Le garçon qui a survécu', description: "Dumbledore, McGonagall et Hagrid déposent le bébé Harry devant la porte des Dursley, à Privet Drive, au lendemain de la chute de Voldemort.", locationId: 'loc_privet_drive', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_dumbledore', entityType: 'character' }, { id: 'char_mcgonagall', entityType: 'character' }, { id: 'char_hagrid', entityType: 'character' }, { id: 'char_harry', entityType: 'character' }, { id: 'loc_privet_drive', entityType: 'location' } ] },
  { id: 'evt_hp_02', chapter: 2, chapterTitle: 'Le Chemin de Traverse', title: 'Hagrid remet la lettre', description: "Le jour de ses onze ans, Harry apprend par Hagrid qu'il est un sorcier et qu'il est attendu à Poudlard.", locationId: 'loc_privet_drive', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_hagrid', entityType: 'character' } ] },
  { id: 'evt_hp_03', chapter: 2, chapterTitle: 'Le Chemin de Traverse', title: 'Emplettes au Chemin de Traverse', description: "Hagrid emmène Harry acheter ses fournitures. Chez Ollivander, Harry choisit — ou est choisi par — sa baguette au cœur de plume de phénix.", locationId: 'loc_chemin_traverse', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_hagrid', entityType: 'character' }, { id: 'char_ollivander', entityType: 'character' }, { id: 'obj_baguette_harry', entityType: 'object' }, { id: 'loc_chemin_traverse', entityType: 'location' } ] },
  { id: 'evt_hp_04', chapter: 2, chapterTitle: 'Le Chemin de Traverse', title: 'Le paquet de la chambre 713', description: "À Gringotts, Hagrid récupère un mystérieux paquet dans la chambre forte 713 pour le compte de Dumbledore : la Pierre philosophale, mise à l'abri le jour même d'un cambriolage.", locationId: 'loc_gringotts', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_hagrid', entityType: 'character' }, { id: 'obj_pierre', entityType: 'object' }, { id: 'loc_gringotts', entityType: 'location' } ] },
  { id: 'evt_hp_05', chapter: 3, chapterTitle: 'La voie 9¾', title: 'La barrière de la voie 9¾', description: "Perdu à King's Cross, Harry est guidé par Molly Weasley pour franchir la barrière. Dans le train, il se lie d'amitié avec Ron.", locationId: 'loc_voie_934', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_molly', entityType: 'character' }, { id: 'char_ron', entityType: 'character' }, { id: 'loc_voie_934', entityType: 'location' } ] },
  { id: 'evt_hp_06', chapter: 4, chapterTitle: 'La Répartition', title: 'Le Choixpeau et la Répartition', description: "Dans la Grande Salle, le Choixpeau répartit les nouveaux élèves. Il hésite pour Harry, qui refuse Serpentard et rejoint Gryffondor avec Ron et Hermione ; Malefoy file à Serpentard.", locationId: 'loc_grande_salle', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_ron', entityType: 'character' }, { id: 'char_hermione', entityType: 'character' }, { id: 'char_mcgonagall', entityType: 'character' }, { id: 'char_draco', entityType: 'character' }, { id: 'char_neville', entityType: 'character' }, { id: 'obj_choixpeau', entityType: 'object' }, { id: 'cent_gryffondor', entityType: 'custom' }, { id: 'cent_serpentard', entityType: 'custom' }, { id: 'loc_grande_salle', entityType: 'location' } ] },
  { id: 'evt_hp_07', chapter: 5, chapterTitle: 'Cours et Quidditch', title: 'Premier cours de potions', description: "Dès le premier cours, Rogue prend Harry en grippe et l'humilie publiquement. Le trio se met à le soupçonner de tous les maux.", locationId: 'loc_poudlard', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_snape', entityType: 'character' }, { id: 'char_ron', entityType: 'character' }, { id: 'loc_poudlard', entityType: 'location' } ] },
  { id: 'evt_hp_08', chapter: 5, chapterTitle: 'Cours et Quidditch', title: 'Le Rappeltout et la première envolée', description: "Malefoy vole le Rappeltout de Neville. Harry le poursuit sur un balai — sa maîtrise instinctive lui vaut d'être repéré par McGonagall pour l'équipe de Quidditch.", locationId: 'loc_poudlard', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_draco', entityType: 'character' }, { id: 'char_mcgonagall', entityType: 'character' }, { id: 'char_neville', entityType: 'character' }, { id: 'obj_rappeltout', entityType: 'object' }, { id: 'loc_poudlard', entityType: 'location' } ] },
  { id: 'evt_hp_09', chapter: 5, chapterTitle: 'Cours et Quidditch', title: 'Premier match de Quidditch', description: "Lors de son premier match, la Nimbus 2000 de Harry est ensorcelée pour le désarçonner. Il finit par attraper le Vif d'or — en manquant de l'avaler.", locationId: 'loc_poudlard', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'obj_nimbus', entityType: 'object' }, { id: 'obj_vif_or', entityType: 'object' }, { id: 'cent_gryffondor', entityType: 'custom' }, { id: 'loc_poudlard', entityType: 'location' } ] },
  { id: 'evt_hp_10', chapter: 6, chapterTitle: 'Le troll et le trio', title: 'Le troll dans les cachots', description: "Un troll des montagnes est lâché dans l'école. Harry et Ron sauvent Hermione des toilettes en assommant le troll d'un Wingardium Leviosa — scellant leur amitié.", locationId: 'loc_poudlard', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_ron', entityType: 'character' }, { id: 'char_hermione', entityType: 'character' }, { id: 'cent_troll', entityType: 'custom' }, { id: 'cent_wingardium', entityType: 'custom' }, { id: 'loc_poudlard', entityType: 'location' } ] },
  { id: 'evt_hp_11', chapter: 7, chapterTitle: 'Miroir et soupçons', title: 'Le Miroir du Riséd', description: "Sous la cape d'invisibilité, Harry découvre le Miroir du Riséd, où il voit ses parents. Dumbledore l'y surprend et le met en garde contre le danger de vivre dans les rêves.", locationId: 'loc_couloir_interdit', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_dumbledore', entityType: 'character' }, { id: 'obj_miroir', entityType: 'object' }, { id: 'obj_cape', entityType: 'object' }, { id: 'loc_couloir_interdit', entityType: 'location' } ] },
  { id: 'evt_hp_12', chapter: 7, chapterTitle: 'Miroir et soupçons', title: 'La licorne dans la Forêt Interdite', description: "En retenue dans la Forêt Interdite, Harry tombe sur une silhouette encapuchonnée buvant le sang d'une licorne. Le centaure Firenze lui révèle qu'il s'agit de Voldemort.", locationId: 'loc_foret_interdite', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_draco', entityType: 'character' }, { id: 'char_hagrid', entityType: 'character' }, { id: 'char_voldemort', entityType: 'character' }, { id: 'cent_licorne', entityType: 'custom' }, { id: 'loc_foret_interdite', entityType: 'location' } ] },
  { id: 'evt_hp_13', chapter: 8, chapterTitle: 'Sous la trappe', title: 'La trappe et les épreuves', description: "Convaincu que la Pierre est en danger, le trio franchit la trappe. Un Alohomora, un piège de filet du diable, une partie d'échecs géante : chacun apporte sa force.", locationId: 'loc_couloir_interdit', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_ron', entityType: 'character' }, { id: 'char_hermione', entityType: 'character' }, { id: 'cent_touffu', entityType: 'custom' }, { id: 'cent_alohomora', entityType: 'custom' }, { id: 'loc_couloir_interdit', entityType: 'location' } ] },
  { id: 'evt_hp_14', chapter: 8, chapterTitle: 'Sous la trappe', title: 'Face à Quirrell et Voldemort', description: "Seul devant le Miroir, Harry découvre que le traître est Quirrell, hôte de Voldemort. La protection de Dumbledore joue : Harry obtient la Pierre et survit au contact mortel.", locationId: 'loc_couloir_interdit', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_quirrell', entityType: 'character' }, { id: 'char_voldemort', entityType: 'character' }, { id: 'obj_pierre', entityType: 'object' }, { id: 'obj_miroir', entityType: 'object' }, { id: 'loc_couloir_interdit', entityType: 'location' } ] },
  { id: 'evt_hp_15', chapter: 8, chapterTitle: 'Sous la trappe', title: 'La Coupe des Quatre Maisons', description: "Au banquet de fin d'année, les points de dernière minute — dont ceux du courage de Neville — offrent la Coupe à Gryffondor. Harry rentre chez lui, transformé.", locationId: 'loc_grande_salle', volumeId: 'vol_hp1', isFlashback: false,
    entities: [ { id: 'char_harry', entityType: 'character' }, { id: 'char_ron', entityType: 'character' }, { id: 'char_hermione', entityType: 'character' }, { id: 'char_neville', entityType: 'character' }, { id: 'char_dumbledore', entityType: 'character' }, { id: 'cent_gryffondor', entityType: 'custom' }, { id: 'loc_grande_salle', entityType: 'location' } ] },
];

// ── Extras de scène (pov, beat, threads, goal/conflict/outcome) ────────────────
export const eventExtrasDB = {
  evt_hp_01: { sceneOrder: 1, beatId: 'opening_image', povCharacterId: 'char_dumbledore', threadIds: ['thr_pierre'], sceneGoal: "Mettre le bébé Harry en sécurité chez les Dursley", sceneConflict: "Voldemort a disparu mais nul ne sait comment Harry a survécu", sceneOutcome: 'success' },
  evt_hp_02: { sceneOrder: 1, beatId: 'theme_stated', povCharacterId: 'char_harry', threadIds: ['thr_pierre'], sceneGoal: "Arracher Harry à son ignorance et à Privet Drive", sceneConflict: "Les Dursley ont tout fait pour lui cacher la vérité", sceneOutcome: 'success' },
  evt_hp_03: { sceneOrder: 2, beatId: 'setup', povCharacterId: 'char_harry', threadIds: ['thr_pierre'], sceneGoal: "Équiper Harry pour Poudlard", sceneConflict: "Tout est nouveau et vertigineux pour lui", sceneOutcome: 'success' },
  evt_hp_04: { sceneOrder: 3, beatId: 'setup', povCharacterId: 'char_harry', threadIds: ['thr_pierre'], sceneGoal: "Mettre la Pierre à l'abri", sceneConflict: "La chambre 713 est vidée le jour même d'un cambriolage", sceneOutcome: 'mixed' },
  evt_hp_05: { sceneOrder: 1, beatId: 'catalyst', povCharacterId: 'char_harry', threadIds: ['thr_trio'], sceneGoal: "Rejoindre Poudlard", sceneConflict: "Harry ignore comment franchir la barrière", sceneOutcome: 'success' },
  evt_hp_06: { sceneOrder: 1, beatId: 'break_into_two', povCharacterId: 'char_harry', threadIds: ['thr_trio'], sceneGoal: "Trouver sa place dans le monde sorcier", sceneConflict: "Le Choixpeau le pousse vers Serpentard", sceneOutcome: 'success' },
  evt_hp_07: { sceneOrder: 2, beatId: 'b_story', povCharacterId: 'char_harry', threadIds: ['thr_rogue'], sceneGoal: "Faire bonne impression en cours", sceneConflict: "Rogue l'humilie sans raison apparente", sceneOutcome: 'failure' },
  evt_hp_08: { sceneOrder: 3, beatId: 'fun_and_games', povCharacterId: 'char_harry', threadIds: ['thr_trio'], sceneGoal: "Récupérer le Rappeltout de Neville", sceneConflict: "Voler est interdit aux première année", sceneOutcome: 'success' },
  evt_hp_09: { sceneOrder: 4, beatId: 'fun_and_games', povCharacterId: 'char_harry', threadIds: ['thr_rogue'], sceneGoal: "Gagner le premier match", sceneConflict: "Son balai est ensorcelé en plein vol", sceneOutcome: 'success' },
  evt_hp_10: { sceneOrder: 1, beatId: 'midpoint', povCharacterId: 'char_harry', threadIds: ['thr_trio'], sceneGoal: "Sauver Hermione du troll", sceneConflict: "Le troll est deux fois plus grand qu'eux", sceneOutcome: 'success' },
  evt_hp_11: { sceneOrder: 1, beatId: 'bad_guys', povCharacterId: 'char_harry', threadIds: ['thr_pierre'], sceneGoal: "Comprendre ce qui hante ses nuits", sceneConflict: "Le Miroir montre un bonheur inaccessible", sceneOutcome: 'mixed' },
  evt_hp_12: { sceneOrder: 2, beatId: 'all_is_lost', povCharacterId: 'char_harry', threadIds: ['thr_pierre'], sceneGoal: "Survivre à la retenue dans la forêt", sceneConflict: "Voldemort, spectral, est à quelques mètres", sceneOutcome: 'failure' },
  evt_hp_13: { sceneOrder: 1, beatId: 'break_into_three', povCharacterId: 'char_hermione', threadIds: ['thr_pierre', 'thr_trio'], sceneGoal: "Atteindre la Pierre avant le voleur", sceneConflict: "Chaque épreuve exige une force différente", sceneOutcome: 'success' },
  evt_hp_14: { sceneOrder: 2, beatId: 'finale', povCharacterId: 'char_harry', threadIds: ['thr_pierre', 'thr_rogue'], sceneGoal: "Empêcher Voldemort d'obtenir la Pierre", sceneConflict: "Le traître n'est pas celui qu'on croyait", sceneOutcome: 'success' },
  evt_hp_15: { sceneOrder: 3, beatId: 'final_image', povCharacterId: 'char_harry', threadIds: ['thr_pierre'], sceneGoal: "Clore l'année en héros", sceneConflict: "Gryffondor part perdant au classement", sceneOutcome: 'success' },
};

// ── Save the Cat : chapitres narratifs ─────────────────────────────────────────
export const chaptersDB = [
  { id: 'ch_hp_1', number: 1, volumeId: 'vol_hp1', title: 'Le survivant', summary: "Le monde ordinaire (moldu) de Harry et le mystère de sa survie. La menace latente de Voldemort est posée.", beats: ['opening_image', 'theme_stated'] },
  { id: 'ch_hp_2', number: 2, volumeId: 'vol_hp1', title: 'Le Chemin de Traverse', summary: "Harry découvre le monde magique, s'équipe, et la Pierre est discrètement mise à l'abri : tous les éléments sont plantés.", beats: ['setup'] },
  { id: 'ch_hp_3', number: 3, volumeId: 'vol_hp1', title: 'La voie 9¾', summary: "Le départ pour Poudlard : Harry quitte définitivement le monde moldu et rencontre Ron.", beats: ['catalyst'] },
  { id: 'ch_hp_4', number: 4, volumeId: 'vol_hp1', title: 'La Répartition', summary: "L'entrée dans le nouveau monde : la Répartition fixe les alliances (Gryffondor) et les rivalités (Serpentard).", beats: ['break_into_two', 'b_story'] },
  { id: 'ch_hp_5', number: 5, volumeId: 'vol_hp1', title: 'Cours et Quidditch', summary: "La vie à Poudlard : cours, premières frictions avec Rogue, révélation du talent de Harry au Quidditch.", beats: ['fun_and_games'] },
  { id: 'ch_hp_6', number: 6, volumeId: 'vol_hp1', title: 'Le troll et le trio', summary: "Le point de bascule : l'épisode du troll soude définitivement Harry, Ron et Hermione.", beats: ['midpoint'] },
  { id: 'ch_hp_7', number: 7, volumeId: 'vol_hp1', title: 'Miroir et soupçons', summary: "La pression monte : le Miroir du Riséd, la licorne assassinée, la certitude que la Pierre — et Harry — sont menacés.", beats: ['bad_guys', 'all_is_lost', 'dark_night'] },
  { id: 'ch_hp_8', number: 8, volumeId: 'vol_hp1', title: 'Sous la trappe', summary: "Le climax : les épreuves, la confrontation avec Quirrell/Voldemort, la victoire et le retour transformé.", beats: ['break_into_three', 'finale', 'final_image'] },
];

// ── Types & entités custom (couche 3) ──────────────────────────────────────────
export const customTypesDB = [
  { id: 'ctype_maison', label: 'Maison', icon: '🏰', color: '#B91C1C', baseBehavior: 'entity',
    fieldSchema: [ { key: 'fondateur', label: 'Fondateur', type: 'text' }, { key: 'animal', label: 'Animal emblème', type: 'text' }, { key: 'couleurs', label: 'Couleurs', type: 'text' }, { key: 'qualites', label: 'Qualités', type: 'text' } ] },
  { id: 'ctype_sortilege', label: 'Sortilège', icon: '✨', color: '#7C3AED', baseBehavior: 'entity',
    fieldSchema: [ { key: 'formule', label: 'Formule', type: 'text' }, { key: 'type', label: 'Type', type: 'text' }, { key: 'effet', label: 'Effet', type: 'text' } ] },
  { id: 'ctype_creature', label: 'Créature', icon: '🐾', color: '#166534', baseBehavior: 'entity',
    fieldSchema: [ { key: 'classement', label: 'Classement M.A.C.U.S.A.', type: 'text' }, { key: 'dangerosite', label: 'Dangerosité', type: 'text' } ] },
];

export const customEntitiesDB = [
  // Maisons
  { id: 'cent_gryffondor', typeId: 'ctype_maison', name: 'Gryffondor', aliases: [], description: "La maison du courage et de la bravoure, celle de Harry, Ron et Hermione. Emblème du lion, couleurs rouge et or.", customFields: { fondateur: 'Godric Gryffondor', animal: 'Lion', couleurs: 'Rouge et or', qualites: 'Courage, bravoure, chevalerie' } },
  { id: 'cent_serpentard', typeId: 'ctype_maison', name: 'Serpentard', aliases: [], description: "La maison de l'ambition et de la ruse, celle de Malefoy et de Rogue. Emblème du serpent, couleurs vert et argent.", customFields: { fondateur: 'Salazar Serpentard', animal: 'Serpent', couleurs: 'Vert et argent', qualites: 'Ambition, ruse, détermination' } },
  { id: 'cent_poufsouffle', typeId: 'ctype_maison', name: 'Poufsouffle', aliases: [], description: "La maison du travail et de la loyauté. Emblème du blaireau, couleurs jaune et noir.", customFields: { fondateur: 'Helga Poufsouffle', animal: 'Blaireau', couleurs: 'Jaune et noir', qualites: 'Loyauté, patience, honnêteté' } },
  { id: 'cent_serdaigle', typeId: 'ctype_maison', name: 'Serdaigle', aliases: [], description: "La maison du savoir et de l'esprit. Emblème de l'aigle, couleurs bleu et bronze.", customFields: { fondateur: 'Rowena Serdaigle', animal: 'Aigle', couleurs: 'Bleu et bronze', qualites: 'Intelligence, sagesse, créativité' } },
  // Sortilèges
  { id: 'cent_wingardium', typeId: 'ctype_sortilege', name: 'Wingardium Leviosa', aliases: ['sortilège de lévitation'], description: "Le sortilège de lévitation qui fait voler les objets. C'est en l'utilisant que Ron assomme le troll.", customFields: { formule: 'Wingardium Leviosa', type: 'Charme', effet: 'Fait léviter un objet' } },
  { id: 'cent_expelliarmus', typeId: 'ctype_sortilege', name: 'Expelliarmus', aliases: ['sortilège de désarmement'], description: "Le sortilège de désarmement, qui projette la baguette de l'adversaire hors de sa main. La signature de Harry.", customFields: { formule: 'Expelliarmus', type: 'Charme', effet: "Désarme l'adversaire" } },
  { id: 'cent_alohomora', typeId: 'ctype_sortilege', name: 'Alohomora', aliases: ['sortilège d\'ouverture'], description: "Le sortilège d'ouverture des serrures, utilisé par Hermione pour franchir la porte du couloir interdit.", customFields: { formule: 'Alohomora', type: 'Charme', effet: 'Déverrouille une serrure' } },
  { id: 'cent_lumos', typeId: 'ctype_sortilege', name: 'Lumos', aliases: [], description: "Fait jaillir de la lumière au bout de la baguette.", customFields: { formule: 'Lumos', type: 'Charme', effet: 'Produit de la lumière' } },
  { id: 'cent_petrificus', typeId: 'ctype_sortilege', name: 'Petrificus Totalus', aliases: ['sortilège du saucisson'], description: "Immobilise totalement la cible. Hermione l'emploie sur Neville pour l'empêcher de les dénoncer.", customFields: { formule: 'Petrificus Totalus', type: 'Maléfice', effet: 'Paralyse totalement' } },
  // Créatures
  { id: 'cent_troll', typeId: 'ctype_creature', name: 'Troll des montagnes', aliases: ['le troll'], description: "Créature massive et stupide lâchée dans les cachots à Halloween, qui manque de tuer Hermione.", customFields: { classement: 'XXXX', dangerosite: 'Élevée' } },
  { id: 'cent_norbert', typeId: 'ctype_creature', name: 'Norbert', aliases: ['le dragon de Hagrid'], description: "Bébé dragon Norvégien à crête que Hagrid élève illégalement dans sa cabane, jusqu'à ce que le trio l'aide à l'expédier en Roumanie.", customFields: { classement: 'XXXXX', dangerosite: 'Extrême' } },
  { id: 'cent_touffu', typeId: 'ctype_creature', name: 'Touffu', aliases: ['le chien à trois têtes'], description: "Le chien à trois têtes de Hagrid qui garde la trappe menant à la Pierre. On l'endort avec de la musique.", customFields: { classement: 'XXXX', dangerosite: 'Élevée' } },
  { id: 'cent_licorne', typeId: 'ctype_creature', name: 'Licorne', aliases: [], description: "Créature pure dont le sang maintient en vie à un prix terrible. C'est en surprenant Voldemort en train d'en boire que Harry comprend la menace.", customFields: { classement: 'XXXX', dangerosite: 'Faible (mais sacrée)' } },
];

// ── Relations explicites (Niveau 3) ────────────────────────────────────────────
export const relationsDB = [
  { id: 'rel_hp_harry_ron',      sourceId: 'char_harry',    sourceType: 'character', targetId: 'char_ron',       targetType: 'character', label: 'meilleur ami de', directed: false },
  { id: 'rel_hp_harry_hermione', sourceId: 'char_harry',    sourceType: 'character', targetId: 'char_hermione',  targetType: 'character', label: 'ami de',          directed: false },
  { id: 'rel_hp_ron_hermione',   sourceId: 'char_ron',      sourceType: 'character', targetId: 'char_hermione',  targetType: 'character', label: 'ami de',          directed: false },
  { id: 'rel_hp_dumbledore_harry', sourceId: 'char_dumbledore', sourceType: 'character', targetId: 'char_harry', targetType: 'character', label: 'protège',         directed: true },
  { id: 'rel_hp_hagrid_harry',   sourceId: 'char_hagrid',   sourceType: 'character', targetId: 'char_harry',     targetType: 'character', label: 'veille sur',      directed: true },
  { id: 'rel_hp_snape_harry',    sourceId: 'char_snape',    sourceType: 'character', targetId: 'char_harry',     targetType: 'character', label: 'déteste',         directed: true },
  { id: 'rel_hp_draco_harry',    sourceId: 'char_draco',    sourceType: 'character', targetId: 'char_harry',     targetType: 'character', label: 'rival de',        directed: false },
  { id: 'rel_hp_quirrell_voldemort', sourceId: 'char_quirrell', sourceType: 'character', targetId: 'char_voldemort', targetType: 'character', label: 'héberge',      directed: true },
  { id: 'rel_hp_harry_gryffondor', sourceId: 'char_harry',  sourceType: 'character', targetId: 'cent_gryffondor', targetType: 'custom',   label: 'appartient à',    directed: true },
  { id: 'rel_hp_draco_serpentard', sourceId: 'char_draco',  sourceType: 'character', targetId: 'cent_serpentard', targetType: 'custom',   label: 'appartient à',    directed: true },
  { id: 'rel_hp_mcgo_gryffondor',  sourceId: 'char_mcgonagall', sourceType: 'character', targetId: 'cent_gryffondor', targetType: 'custom', label: 'dirige',        directed: true },
  { id: 'rel_hp_snape_serpentard', sourceId: 'char_snape',  sourceType: 'character', targetId: 'cent_serpentard', targetType: 'custom',   label: 'dirige',          directed: true },
  { id: 'rel_hp_harry_baguette',   sourceId: 'char_harry',  sourceType: 'character', targetId: 'obj_baguette_harry', targetType: 'object', label: 'manie',          directed: true },
  { id: 'rel_hp_harry_cape',       sourceId: 'char_harry',  sourceType: 'character', targetId: 'obj_cape',       targetType: 'object',    label: 'possède',         directed: true },
  { id: 'rel_hp_flamel_pierre',    sourceId: 'char_flamel', sourceType: 'character', targetId: 'obj_pierre',     targetType: 'object',    label: 'a créé',          directed: true },
  { id: 'rel_hp_hagrid_norbert',   sourceId: 'char_hagrid', sourceType: 'character', targetId: 'cent_norbert',   targetType: 'custom',    label: 'élève',           directed: true },
  { id: 'rel_hp_harry_expelliarmus', sourceId: 'char_harry', sourceType: 'character', targetId: 'cent_expelliarmus', targetType: 'custom', label: 'maîtrise',       directed: true },
];
