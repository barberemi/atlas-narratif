// Base de données lore complète — La Communauté de l'Anneau
// Référencée depuis les timelines des personnages et le Lore Browser

export const loreDB = {

  // ── Personnages ───────────────────────────────────────────────────────────
  characters: [
    {
      id: 'char_frodo',
      name: 'Frodo Sacquet',
      aliases: ['Le Porteur', 'Monsieur Frodo'],
      race: 'Hobbit',
      role: 'Porteur de l\'Anneau',
      origin: 'La Comté — Cul-de-Sac',
      affiliation: ['La Communauté de l\'Anneau'],
      description:
        'Neveu adoptif de Bilbo Sacquet et héritier de Cul-de-Sac. Frodo hérite de l\'Anneau Unique sans en connaître la nature. Sa résistance à la corruption de l\'Anneau — partielle mais réelle — le distingue de toute autre créature de la Terre du Milieu.',
      traits: ['Courageux', 'Humble', 'Déterminé', 'Résistant (partiellement) à l\'Anneau'],
      color: '#10B981',
      journeyKey: 'frodo',
    },
    {
      id: 'char_aragorn',
      name: 'Aragorn',
      aliases: ['Grands-Pas', 'Aragorn II Elessar', 'Dunadan', 'Thorongil'],
      race: 'Homme (Dúnedain)',
      role: 'Rôdeur du Nord, Héritier d\'Isildur',
      origin: 'Fondcombe (élevé par Elrond)',
      affiliation: ['Les Rôdeurs du Nord', 'La Communauté de l\'Anneau'],
      description:
        'Héritier en ligne directe d\'Isildur et donc prétendant légitime aux trônes du Gondor et d\'Arnor. Il vit sous l\'identité secrète de "Grands-Pas", rôdeur des terres sauvages, jusqu\'à ce que la Quête de l\'Anneau révèle son destin.',
      traits: ['Guerrier accompli', 'Guide des terres sauvages', 'Noble discret', 'Guérisseur'],
      color: '#3F51B5',
      journeyKey: 'aragorn',
    },
    {
      id: 'char_gandalf',
      name: 'Gandalf le Gris',
      aliases: ['Mithrandir', 'Olórin', 'Incánus', 'Gandalf Grisharbe'],
      race: 'Maia (Istari)',
      role: 'Magicien de l\'Ordre, Guide de la Communauté',
      origin: 'Valinor (envoyé en Terre du Milieu)',
      affiliation: ['L\'Ordre des Istari', 'La Communauté de l\'Anneau'],
      description:
        'L\'un des cinq Istari envoyés par les Valar pour aider les peuples libres contre Sauron. Contrairement à Saroumane, il refuse la quête du pouvoir. Porteur de Narya, l\'Anneau du Feu. Sa chute à Khazad-dûm marque la fin de Gandalf le Gris — et le début de Gandalf le Blanc.',
      traits: ['Sage', 'Rusé', 'Puissant', 'Porteur de Narya'],
      color: '#F59E0B',
      journeyKey: 'gandalf',
    },
    {
      id: 'char_sam',
      name: 'Samsagace Gamegie',
      aliases: ['Sam', 'Sam le Brave'],
      race: 'Hobbit',
      role: 'Jardinier de Bilbo, Compagnon de Frodo',
      origin: 'La Comté — Lézardeau',
      affiliation: ['La Communauté de l\'Anneau'],
      description:
        'Jardinier dévoué de Bilbo, puis compagnon indéfectible de Frodo. Sa loyauté sans faille et son amour profond pour Frodo lui permettront d\'accomplir des actes de bravoure qui surprendront jusqu\'à lui-même. Il est la véritable ancre de la Quête.',
      traits: ['Loyal', 'Courageux', 'Pratique', 'Jardinier hors pair'],
      color: '#78716C',
      journeyKey: null,
    },
    {
      id: 'char_merry',
      name: 'Meriadoc Brandebouc',
      aliases: ['Merry', 'Seigneur Merry'],
      race: 'Hobbit',
      role: 'Hobbit de la Comté, Compagnon',
      origin: 'La Comté — Pays de Bouc',
      affiliation: ['La Communauté de l\'Anneau'],
      description:
        'Le plus intellectuel et organisé des jeunes hobbits. Merry connaît la Comté comme sa poche et sait s\'orienter dans les terres sauvages. Sa curiosité et son sens pratique le rendent précieux à la Communauté.',
      traits: ['Organisé', 'Curieux', 'Courageux', 'Intelligent'],
      color: '#78716C',
      journeyKey: null,
    },
    {
      id: 'char_pippin',
      name: 'Peregrin Touque',
      aliases: ['Pippin', 'Fool of a Took'],
      race: 'Hobbit',
      role: 'Hobbit de la Comté, Compagnon',
      origin: 'La Comté — Grand Smials',
      affiliation: ['La Communauté de l\'Anneau'],
      description:
        'Le plus jeune et le plus impulsif des hobbits. Son imprudence lui vaudra des ennuis (notamment avec le Palantír), mais son cœur pur et sa loyauté font de lui un compagnon précieux. Il représente l\'innocence confrontée au monde.',
      traits: ['Impulsif', 'Loyal', 'Joyeux', 'Curieux'],
      color: '#78716C',
      journeyKey: null,
    },
    {
      id: 'char_legolas',
      name: 'Legolas',
      aliases: ['Légolas Vertefeuille', 'Prince des Elfes'],
      race: 'Elfe (Sylvestre)',
      role: 'Archer, Prince de la Forêt Noire',
      origin: 'Forêt Noire — Royaume de Thranduil',
      affiliation: ['La Communauté de l\'Anneau'],
      description:
        'Fils du roi Thranduil, représentant des Elfes au Conseil d\'Elrond. Archer d\'une précision surhumaine, il voit et entend des choses invisibles aux mortels. Sa complicité naissante avec Gimli brisera un tabou millénaire entre Elfes et Nains.',
      traits: ['Précision extrême', 'Vision perçante', 'Agilité', 'Connexion à la nature'],
      color: '#06B6D4',
      journeyKey: null,
    },
    {
      id: 'char_gimli',
      name: 'Gimli',
      aliases: ['Fils de Glóin', 'Ami des Elfes'],
      race: 'Nain',
      role: 'Guerrier de la Montagne',
      origin: 'Erebor — La Montagne Solitaire',
      affiliation: ['La Communauté de l\'Anneau'],
      description:
        'Fils de Glóin (compagnon de Bilbo lors du voyage vers Erebor). Représentant des Nains au Conseil d\'Elrond. Sa résistance légendaire et son courage au corps à corps en font un pilier de la Communauté. Son amitié avec Legolas deviendra légendaire.',
      traits: ['Téméraire', 'Endurant', 'Loyal', 'Fier de son peuple'],
      color: '#D97706',
      journeyKey: null,
    },
    {
      id: 'char_boromir',
      name: 'Boromir',
      aliases: ['Fils du Sénéchal', 'Capitaine de Gondor'],
      race: 'Homme (Gondorien)',
      role: 'Capitaine, représentant du Gondor',
      origin: 'Minas Tirith — Gondor',
      affiliation: ['La Communauté de l\'Anneau', 'Gondor'],
      description:
        'Fils aîné de Denethor II, Sénéchal du Gondor. Il vient à Fondcombe pour interpréter un rêve prophétique. Guerrier noble et patriote, il succombe progressivement à l\'attrait de l\'Anneau qu\'il perçoit comme l\'arme qui sauverait son peuple. Sa rédemption finale reste l\'un des moments les plus forts du récit.',
      traits: ['Valeureux', 'Patriote', 'Corruptible (par l\'Anneau)', 'Noble en fin de compte'],
      color: '#EF4444',
      journeyKey: null,
    },
    {
      id: 'char_galadriel',
      name: 'Galadriel',
      aliases: ['Dame du Lothlórien', 'Alatáriel', 'La Dame d\'Or'],
      race: 'Elfe (Noldor)',
      role: 'Seigneure du Lothlórien, Porteuse de Nenya',
      origin: 'Valinor (exilée en Terre du Milieu)',
      affiliation: ['Lothlórien', 'Les Gardiens des Anneaux'],
      description:
        'L\'une des Elfes les plus anciennes et puissantes de la Terre du Milieu. Porteuse de Nenya, l\'Anneau d\'Adamant. Elle protège le Lothlórien depuis des siècles. Son refus de l\'Anneau Unique, proposé par Frodo, est un acte de renoncement d\'une immense grandeur morale.',
      traits: ['Sagesse millénaire', 'Pouvoir télépathique', 'Vision prophétique', 'Maîtrise de soi absolue'],
      color: '#F0ABFC',
      journeyKey: null,
    },
    {
      id: 'char_elrond',
      name: 'Elrond',
      aliases: ['Maître Elrond', 'Demi-Elfe'],
      race: 'Demi-Elfe',
      role: 'Seigneur de Fondcombe, Porteur de Vilya',
      origin: 'Fondcombe — Imladris',
      affiliation: ['Fondcombe', 'Les Gardiens des Anneaux'],
      description:
        'Fils de Eärendil et Elwing, l\'un des êtres les plus anciens de la Terre du Milieu. Il fonda Fondcombe après la guerre de l\'Ère de Gloire. Porteur de Vilya, l\'Anneau de l\'Air. Il préside le Conseil qui décide du sort de l\'Anneau Unique.',
      traits: ['Sagesse', 'Guérison', 'Prudence', 'Impartialité'],
      color: '#818CF8',
      journeyKey: null,
    },
    {
      id: 'char_saruman',
      name: 'Saroumane le Blanc',
      aliases: ['Saruman', 'Curunír', 'Saroumane de Plusieurs Couleurs'],
      race: 'Maia (Istari)',
      role: 'Chef de l\'Ordre des Istari, Traître',
      origin: 'Valinor (envoyé en Terre du Milieu)',
      affiliation: ['Isengard (Orthanc)', 'Sauron (trahi)'],
      description:
        'Le chef de l\'Ordre des Istari, autrefois le plus sage et puissant des cinq magiciens. Sa quête du savoir sur l\'Anneau Unique l\'a corrompu. Il cherche désormais à s\'emparer de l\'Anneau pour son propre compte, trahissant l\'Ordre et les peuples libres.',
      traits: ['Brillant', 'Manipulateur', 'Ambitieux', 'Corrompu par la quête du pouvoir'],
      color: '#94A3B8',
      journeyKey: null,
    },
    {
      id: 'char_bilbo',
      name: 'Bilbo Sacquet',
      aliases: ['Le vieux Bilbo', 'Le Voleur (surnom des Nains)'],
      race: 'Hobbit',
      role: 'Ancien porteur de l\'Anneau, Auteur',
      origin: 'La Comté — Cul-de-Sac',
      affiliation: ['Fondcombe (retraite)'],
      description:
        'Oncle de Frodo et premier porteur "accidentel" de l\'Anneau Unique depuis la disparition de Gollum. Il vécut extraordinairement longtemps grâce à l\'Anneau. À Fondcombe, il travaille à son livre "Là et Retour" et finit par transmettre ses souvenirs à Frodo.',
      traits: ['Curieux', 'Aventurier', 'Lettré', 'Obsédé (passivement) par l\'Anneau'],
      color: '#A78BFA',
      journeyKey: null,
    },
    {
      id: 'char_glorfindel',
      name: 'Glorfindel',
      aliases: ['Seigneur Glorfindel', 'Maîtres des Elfes'],
      race: 'Elfe (Noldor)',
      role: 'Seigneur Elfe de Fondcombe',
      origin: 'Fondcombe — Imladris',
      affiliation: ['Fondcombe'],
      description:
        'L\'un des Seigneurs Elfes de Fondcombe. Envoyé par Elrond à la rencontre de la Communauté, il sauve Frodo en lui offrant sa propre monture elfique, Asfaloth, pour fuir les Nazgûl. Sa lumière intérieure est si puissante qu\'elle peut repousser les Neuf.',
      traits: ['Puissant', 'Lumineux', 'Généreux', 'Expérimenté au combat'],
      color: '#FCD34D',
      journeyKey: null,
    },
    {
      id: 'char_celeborn',
      name: 'Celeborn',
      aliases: ['Seigneur du Lothlórien'],
      race: 'Elfe (Sindarin)',
      role: 'Co-seigneur du Lothlórien',
      origin: 'Doriath (anciennement)',
      affiliation: ['Lothlórien'],
      description:
        'Époux de Galadriel et co-seigneur du Lothlórien. Guerrier et stratège consommé, moins versé dans les arts mystiques que son épouse mais d\'une sagesse égale dans les affaires du monde. Il accueille la Communauté avec une méfiance justifiée, tempérée par l\'amour qu\'il porte à sa femme.',
      traits: ['Stratège', 'Prudent', 'Digne', 'Sage'],
      color: '#C4B5FD',
      journeyKey: null,
    },
    {
      id: 'char_tom_bombadil',
      name: 'Tom Bombadil',
      aliases: ['Iarwain Ben-adar', 'Le Vieux', 'Seigneur de l\'Eau'],
      race: 'Inconnue (être primordial)',
      role: 'Maître de la Forêt Ancienne',
      origin: 'Forêt Ancienne',
      affiliation: ['Forêt Ancienne (indépendant)'],
      description:
        'Être mystérieux dont la nature réelle n\'est pas élucidée, pas même par Tolkien. Il est le "Maître" de la Forêt Ancienne et des Hauts-des-Galgals. L\'Anneau Unique n\'a aucun pouvoir sur lui — il peut le faire disparaître et réapparaître comme s\'il s\'agissait d\'un vulgaire caillou.',
      traits: ['Joyeux', 'Puissant (mystérieusement)', 'Immune à l\'Anneau', 'Hors du monde'],
      color: '#4ADE80',
      journeyKey: null,
    },
    {
      id: 'char_gwaihir',
      name: 'Gwaihir',
      aliases: ['Seigneur des Vents', 'Le Grand Aigle'],
      race: 'Grand Aigle',
      role: 'Seigneur des Aigles, Allié de Gandalf',
      origin: 'Cimes des Montagnes Brumeuses',
      affiliation: ['Les Aigles des Montagnes'],
      description:
        'Le plus grand et le plus sage des Aigles, descendant de Thorondor. Il répond à l\'appel de Gandalf et le sauve d\'Isengard. Son aide se révèlera décisive à plusieurs moments critiques de la Guerre de l\'Anneau. Rapide comme le vent, il peut couvrir des distances énormes.',
      traits: ['Rapide', 'Puissant', 'Fidèle à Gandalf', 'Majestueux'],
      color: '#6B7280',
      journeyKey: null,
    },
  ],

  // ── Lieux ─────────────────────────────────────────────────────────────────
  locations: [
    {
      id: 'loc_shire',
      name: 'La Comté',
      type: 'Région',
      regime: 'Société hobbit semi-autonome',
      description:
        'Territoire agricole verdoyant de l\'Eriador, habité exclusivement par des Hobbits. La Comté ignore délibérément le reste du monde — c\'est à la fois sa force (préservation de l\'innocence) et sa faiblesse. Le départ de Frodo marque la fin de cet âge d\'or.',
      coordinates: { x: 17, y: 25 },
      inhabitants: ['Hobbits (Sacquet, Gamegie, Brandebouc, Touque)'],
      keyPlaces: ['Cul-de-Sac', 'Grand Smials', 'Pays de Bouc', 'Michel Delbing'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',    color: '#10B981' },
        { id: 'char_gandalf', name: 'Gandalf le Gris',  color: '#F59E0B' },
        { id: 'char_aragorn', name: 'Aragorn',           color: '#3F51B5' },
        { id: 'char_sam',     name: 'Samsagace Gamegie', color: '#78716C' },
        { id: 'char_bilbo',   name: 'Bilbo Sacquet',     color: '#A78BFA' },
      ],
    },
    {
      id: 'loc_bree',
      name: 'Bree',
      type: 'Bourg',
      regime: 'Ville indépendante',
      description:
        'L\'un des derniers bourgs habités de l\'Ériador, à la croisée de deux routes importantes. Bree est rare : elle accueille à la fois des Hommes et des Hobbits. L\'Auberge du Poney Fringant en est le cœur social — et un relais d\'information pour les Rôdeurs.',
      coordinates: { x: 28, y: 28 },
      inhabitants: ['Hommes', 'Hobbits'],
      keyPlaces: ['L\'Auberge du Poney Fringant', 'La Porte de l\'Ouest'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',        color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',               color: '#3F51B5' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',     color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc',   color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',       color: '#78716C' },
      ],
    },
    {
      id: 'loc_barrowdowns',
      name: 'Hauts-des-Galgals',
      type: 'Landes',
      regime: 'Terres maudites',
      description:
        'Collines parsemées de tumulus anciens, anciens lieux de sépulture des rois d\'Arnor. Des esprits maléfiques — les Galagals (Barrow-wights) — y ont été envoyés par le Roi-Sorcier pour hanter les tombes. Lieu de danger extrême pour les voyageurs égarés.',
      coordinates: { x: 22, y: 32 },
      inhabitants: ['Galagals (Barrow-wights)'],
      keyPlaces: ['Les Tumulus', 'La Colline du Roi'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',        color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',               color: '#3F51B5' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',     color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc',   color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',       color: '#78716C' },
      ],
    },
    {
      id: 'loc_weathertop',
      name: 'Amon Sûl',
      type: 'Ruine fortifiée',
      regime: 'Ruine abandonnée',
      description:
        'Sommet isolé portant les ruines d\'une ancienne tour de garde du Royaume d\'Arnor. Elle abritait autrefois l\'un des Palantíri. Lieu stratégique dominant les plaines alentour — et donc point de rendez-vous des Nazgûl qui surveillent les routes.',
      coordinates: { x: 37, y: 30 },
      inhabitants: [],
      keyPlaces: ['La Tour en ruines', 'Le Sommet dégagé'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',        color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',               color: '#3F51B5' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',     color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc',   color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',       color: '#78716C' },
      ],
    },
    {
      id: 'loc_ford',
      name: 'Gué de Bruinen',
      type: 'Passage géographique',
      regime: 'Frontière de Fondcombe',
      description:
        'Le gué sur la rivière Bruinen (Loudwater) qui marque la frontière des terres protégées de Fondcombe. Elrond peut commander aux eaux du Bruinen. Ce pouvoir fut utilisé pour créer le déluge qui emporta les Nazgûl lors de la fuite de Frodo.',
      coordinates: { x: 47, y: 25 },
      inhabitants: [],
      keyPlaces: ['Le Gué', 'La Rive Est (Fondcombe)'],
      visitedBy: [
        { id: 'char_frodo',      name: 'Frodo Sacquet',     color: '#10B981' },
        { id: 'char_aragorn',    name: 'Aragorn',            color: '#3F51B5' },
        { id: 'char_glorfindel', name: 'Glorfindel',         color: '#FCD34D' },
        { id: 'char_sam',        name: 'Samsagace Gamegie',  color: '#78716C' },
        { id: 'char_merry',      name: 'Meriadoc Brandebouc',color: '#78716C' },
        { id: 'char_pippin',     name: 'Peregrin Touque',    color: '#78716C' },
      ],
    },
    {
      id: 'loc_rivendell',
      name: 'Fondcombe',
      type: 'Cité elfique',
      regime: 'Seigneurie Elfe (Elrond)',
      description:
        'Fondée par Elrond à la fin du Second Âge. Nichée dans une vallée secrète de l\'Ériador, protégée par les eaux du Bruinen et la puissance de Vilya. Fondcombe est un havre de paix, de savoir et de soin. C\'est ici que se tient le Conseil qui décide du destin de l\'Anneau.',
      coordinates: { x: 51, y: 22 },
      inhabitants: ['Elfes Noldor', 'Demi-Elfes', 'Rôdeurs (parfois)'],
      keyPlaces: ['La Grande Salle', 'Les Salles de Guérison', 'La Bibliothèque d\'Elrond'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',      color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',             color: '#3F51B5' },
        { id: 'char_gandalf', name: 'Gandalf le Gris',    color: '#F59E0B' },
        { id: 'char_legolas', name: 'Legolas',             color: '#06B6D4' },
        { id: 'char_gimli',   name: 'Gimli',               color: '#D97706' },
        { id: 'char_boromir', name: 'Boromir',             color: '#EF4444' },
        { id: 'char_elrond',  name: 'Elrond',              color: '#818CF8' },
        { id: 'char_bilbo',   name: 'Bilbo Sacquet',       color: '#A78BFA' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',   color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc', color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',     color: '#78716C' },
      ],
    },
    {
      id: 'loc_isengard',
      name: 'Isengard',
      type: 'Forteresse',
      regime: 'Domination de Saroumane',
      description:
        'Ancienne forteresse des rois du Gondor, cédée aux soins de Saroumane. Il en a fait un centre industriel et militaire, rasant les forêts pour alimenter ses forges. La tour d\'Orthanc en est le cœur — un monolithe noir indestructible où Gandalf fut emprisonné.',
      coordinates: { x: 47, y: 56 },
      inhabitants: ['Saroumane', 'Orques d\'Isengard', 'Uruk-Haï'],
      keyPlaces: ['La Tour d\'Orthanc', 'Les Forges', 'L\'Anneau d\'Isengard'],
      visitedBy: [
        { id: 'char_gandalf', name: 'Gandalf le Gris',       color: '#F59E0B' },
        { id: 'char_saruman', name: 'Saroumane le Blanc',     color: '#94A3B8' },
      ],
    },
    {
      id: 'loc_caradhras',
      name: 'Col de Caradhras',
      type: 'Passage montagneux',
      regime: 'Nature hostile (influence de Saroumane)',
      description:
        'L\'un des trois cols des Montagnes Brumeuses permettant de passer à l\'Est. Caradhras — la Montagne Rouge — est réputée pour son caractère malveillant. Lors de la tentative de passage de la Communauté, une tempête de neige extraordinaire bloqua le chemin.',
      coordinates: { x: 55, y: 30 },
      inhabitants: [],
      keyPlaces: ['Le Sommet glacé', 'Les Flancs rocheux'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',      color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',             color: '#3F51B5' },
        { id: 'char_gandalf', name: 'Gandalf le Gris',    color: '#F59E0B' },
        { id: 'char_legolas', name: 'Legolas',             color: '#06B6D4' },
        { id: 'char_gimli',   name: 'Gimli',               color: '#D97706' },
        { id: 'char_boromir', name: 'Boromir',             color: '#EF4444' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',   color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc', color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',     color: '#78716C' },
      ],
    },
    {
      id: 'loc_moria',
      name: 'Mines de la Moria',
      type: 'Cité souterraine en ruines',
      regime: 'Domination des Orques et du Balrog',
      description:
        'Khazad-dûm — la plus grande et la plus ancienne des cités naines, creusée dans les Montagnes Brumeuses. Abandonnée après que les Nains libérèrent accidentellement le Balrog (Fléau de Durin) en creusant trop profond. Les mines restent d\'une grandeur écrasante, même envahies par l\'obscurité.',
      coordinates: { x: 57, y: 40 },
      inhabitants: ['Orques', 'Trolls des Cavernes', 'Le Balrog (Fléau de Durin)'],
      keyPlaces: ['La Porte de Durin', 'La Salle de Mazarbul', 'Le Pont de Khazad-dûm'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',      color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',             color: '#3F51B5' },
        { id: 'char_gandalf', name: 'Gandalf le Gris',    color: '#F59E0B' },
        { id: 'char_legolas', name: 'Legolas',             color: '#06B6D4' },
        { id: 'char_gimli',   name: 'Gimli',               color: '#D97706' },
        { id: 'char_boromir', name: 'Boromir',             color: '#EF4444' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',   color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc', color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',     color: '#78716C' },
      ],
    },
    {
      id: 'loc_lothlorien',
      name: 'Lothlórien',
      type: 'Forêt elfique sacrée',
      regime: 'Seigneurie de Galadriel et Celeborn',
      description:
        'La Forêt d\'Or, dernier grand domaine elfe de la Terre du Milieu. Ses arbres Mallorn aux feuilles dorées et ses flets (plateformes) dans les hauteurs créent un monde hors du temps. La puissance de Nenya la protège de Sauron. Frodo y verra dans le Miroir de Galadriel les possibles du futur.',
      coordinates: { x: 63, y: 48 },
      inhabitants: ['Elfes du Lothlórien (Galadhrim)', 'Galadriel', 'Celeborn'],
      keyPlaces: ['Caras Galadhon', 'Le Miroir de Galadriel', 'Les Prés de Cerin Amroth'],
      visitedBy: [
        { id: 'char_frodo',    name: 'Frodo Sacquet',      color: '#10B981' },
        { id: 'char_aragorn',  name: 'Aragorn',             color: '#3F51B5' },
        { id: 'char_legolas',  name: 'Legolas',             color: '#06B6D4' },
        { id: 'char_gimli',    name: 'Gimli',               color: '#D97706' },
        { id: 'char_boromir',  name: 'Boromir',             color: '#EF4444' },
        { id: 'char_galadriel',name: 'Galadriel',           color: '#F0ABFC' },
        { id: 'char_celeborn', name: 'Celeborn',            color: '#C4B5FD' },
        { id: 'char_sam',      name: 'Samsagace Gamegie',   color: '#78716C' },
        { id: 'char_merry',    name: 'Meriadoc Brandebouc', color: '#78716C' },
        { id: 'char_pippin',   name: 'Peregrin Touque',     color: '#78716C' },
      ],
    },
    {
      id: 'loc_parthgalen',
      name: 'Parth Galen — Amon Hen',
      type: 'Prairie / Colline de guet',
      regime: 'Terres sauvages (rive du Grand Fleuve)',
      description:
        'Prairie sur la rive ouest du Grand Fleuve (Anduin), au pied des Chutes de Rauros. Amon Hen (Colline du Regard) domine le site. C\'est ici que la Communauté éclate : Boromir succombe à l\'Anneau, Frodo fuit seul, Merry et Pippin sont capturés par les Uruk-Haï.',
      coordinates: { x: 62, y: 58 },
      inhabitants: [],
      keyPlaces: ['Les Chutes de Rauros', 'Le Siège du Regard', 'La Rive de départ'],
      visitedBy: [
        { id: 'char_frodo',   name: 'Frodo Sacquet',      color: '#10B981' },
        { id: 'char_aragorn', name: 'Aragorn',             color: '#3F51B5' },
        { id: 'char_legolas', name: 'Legolas',             color: '#06B6D4' },
        { id: 'char_gimli',   name: 'Gimli',               color: '#D97706' },
        { id: 'char_boromir', name: 'Boromir',             color: '#EF4444' },
        { id: 'char_sam',     name: 'Samsagace Gamegie',   color: '#78716C' },
        { id: 'char_merry',   name: 'Meriadoc Brandebouc', color: '#78716C' },
        { id: 'char_pippin',  name: 'Peregrin Touque',     color: '#78716C' },
      ],
    },
  ],

  // ── Objets ────────────────────────────────────────────────────────────────
  objects: [
    {
      id: 'obj_one_ring',
      name: 'L\'Anneau Unique',
      type: 'Artefact maléfique',
      creator: 'Sauron',
      createdIn: 'Montagne du Destin — Mordor',
      description:
        'Forgé par Sauron au Second Âge pour dominer les porteurs des autres Anneaux de Pouvoir. Il concentre la majeure partie de la force vitale de Sauron. L\'Anneau corrompt tout porteur en éveillant ses désirs les plus profonds et en amplifiant sa volonté de domination.',
      powers: ['Invisibilité', 'Prolongation de vie (non éternelle)', 'Corruption progressive', 'Signal à l\'Œil de Sauron'],
      currentHolder: 'Frodo Sacquet',
      inscription: '"Un Anneau pour les gouverner tous, Un Anneau pour les trouver, Un Anneau pour les amener tous et dans les Ténèbres les lier."',
      holders: [
        { id: 'char_bilbo', name: 'Bilbo Sacquet', color: '#A78BFA' },
        { id: 'char_frodo', name: 'Frodo Sacquet', color: '#10B981' },
      ],
    },
    {
      id: 'obj_anduril',
      name: 'Andúril',
      type: 'Épée légendaire',
      creator: 'Elfes de Fondcombe (reforge de Narsil)',
      createdIn: 'Fondcombe — lors du Conseil d\'Elrond',
      description:
        'Forgée à nouveau des fragments de Narsil, l\'épée qui trancha l\'Anneau de la main de Sauron à la fin du Second Âge. Andúril — "Flamme de l\'Ouest" — est le symbole de la légitimité royale d\'Aragorn. Elle ne peut être brisée.',
      powers: ['Symbole de royauté', 'Résistance surnaturelle', 'Flamme intérieure visible'],
      currentHolder: 'Aragorn',
      inscription: '"Je suis Andúril qui fut Narsil, l\'épée d\'Elendil. Que les serviteurs de Sauron craignent mon tranchant."',
      holders: [
        { id: 'char_aragorn', name: 'Aragorn', color: '#3F51B5' },
      ],
    },
    {
      id: 'obj_sting',
      name: 'Dard',
      type: 'Épée elfique courte',
      creator: 'Elfes de Gondolin (Première Ère)',
      createdIn: 'Gondolin',
      description:
        'Courte épée elfique de la Première Ère, trouvée par Bilbo dans le repaire des Trolls. Sa lame brille d\'un bleu électrique en présence d\'Orques. Bilbo l\'offre à Frodo avant son départ. Elle deviendra le symbole de la résistance de Frodo.',
      powers: ['Détection des Orques (lueur bleue)', 'Lame extrêmement affûtée', 'Légèreté'],
      currentHolder: 'Frodo Sacquet (héritée de Bilbo)',
      holders: [
        { id: 'char_bilbo', name: 'Bilbo Sacquet', color: '#A78BFA' },
        { id: 'char_frodo', name: 'Frodo Sacquet', color: '#10B981' },
      ],
    },
    {
      id: 'obj_mithril',
      name: 'Cotte de mailles en Mithril',
      type: 'Armure',
      creator: 'Nains de Durin',
      createdIn: 'Erebor (vraisemblablement)',
      description:
        'Offerte à Bilbo par Thorin Écu-de-Chêne, puis transmise à Frodo. La cotte est faite de mithril — métal plus résistant que l\'acier, plus léger que le cuir. Elle sauve la vie de Frodo dans Moria lorsqu\'une lance de Troll des Cavernes l\'aurait transpercé.',
      powers: ['Résistance aux armes ordinaires', 'Légèreté extraordinaire', 'Inestimable'],
      currentHolder: 'Frodo Sacquet',
      holders: [
        { id: 'char_bilbo', name: 'Bilbo Sacquet', color: '#A78BFA' },
        { id: 'char_frodo', name: 'Frodo Sacquet', color: '#10B981' },
      ],
    },
    {
      id: 'obj_narya',
      name: 'Narya — l\'Anneau du Feu',
      type: 'Anneau de Pouvoir',
      creator: 'Celebrimbor (forgé à Eregion)',
      createdIn: 'Eregion — Deuxième Âge',
      description:
        'L\'un des trois Anneaux Elfiques, portant un rubis rouge. Confié secrètement à Gandalf par Círdan le Charpentier à son arrivée en Terre du Milieu. Narya insuffle courage et résistance à ceux qui en ont besoin — un pouvoir en accord parfait avec la mission de Gandalf.',
      powers: ['Inspiration du courage', 'Résistance à la lassitude', 'Feu symbolique'],
      currentHolder: 'Gandalf le Gris (Mithrandir)',
      holders: [
        { id: 'char_gandalf', name: 'Gandalf le Gris', color: '#F59E0B' },
      ],
    },
    {
      id: 'obj_phial',
      name: 'Phiale de Galadriel',
      type: 'Artefact elfique',
      creator: 'Galadriel',
      createdIn: 'Lothlórien',
      description:
        'Fiole de verre contenant la lumière de l\'Étoile d\'Eärendil, réfléchie dans le Miroir de Galadriel. Offerte à Frodo avant le départ de Lothlórien. Sa lumière est "une lumière pour vous dans les lieux sombres, quand toutes les autres lumières s\'éteignent."',
      powers: ['Lumière dans les ténèbres absolues', 'Pouvoir contre les créatures de l\'obscurité'],
      currentHolder: 'Frodo Sacquet (don de Galadriel)',
      holders: [
        { id: 'char_galadriel', name: 'Galadriel',     color: '#F0ABFC' },
        { id: 'char_frodo',     name: 'Frodo Sacquet', color: '#10B981' },
      ],
    },
    {
      id: 'obj_palantir',
      name: 'Le Palantír',
      type: 'Pierre de Vision',
      creator: 'Noldor de Valinor',
      createdIn: 'Valinor (Première Ère)',
      description:
        'Pierres de vision capables de communiquer à travers de grandes distances. Plusieurs exemplaires existaient en Terre du Milieu. Saroumane en possédait un à Orthanc — c\'est via lui que Sauron le corrompit. La contemplation d\'un Palantír sans force mentale suffisante est extrêmement dangereuse.',
      powers: ['Vision à distance', 'Communication entre pierres', 'Manipulation mentale possible'],
      currentHolder: 'Saroumane (celui d\'Orthanc)',
      holders: [
        { id: 'char_saruman', name: 'Saroumane le Blanc', color: '#94A3B8' },
      ],
    },
    {
      id: 'obj_lembas',
      name: 'Lembas',
      type: 'Nourriture elfique',
      creator: 'Elfes du Lothlórien (recette des Vanyar)',
      createdIn: 'Lothlórien',
      description:
        'Pain de route elfique d\'une nutritivité extraordinaire. Une bouchée suffit à rassasier un Homme adulte pour une journée entière de marche. Léger, compact, il se conserve longtemps. Offert à chaque membre de la Communauté avant le départ du Lothlórien. Pour Frodo et Sam, il sera le seul aliment du voyage en Mordor.',
      powers: ['Sustentation longue durée', 'Légèreté', 'Soutien moral symbolique'],
      currentHolder: 'La Communauté de l\'Anneau (don de Galadriel)',
      holders: [
        { id: 'char_galadriel', name: 'Galadriel',           color: '#F0ABFC' },
        { id: 'char_frodo',     name: 'Frodo Sacquet',       color: '#10B981' },
        { id: 'char_aragorn',   name: 'Aragorn',             color: '#3F51B5' },
        { id: 'char_gandalf',   name: 'Gandalf le Gris',     color: '#F59E0B' },
        { id: 'char_legolas',   name: 'Legolas',             color: '#06B6D4' },
        { id: 'char_gimli',     name: 'Gimli',               color: '#D97706' },
        { id: 'char_boromir',   name: 'Boromir',             color: '#EF4444' },
        { id: 'char_sam',       name: 'Samsagace Gamegie',   color: '#78716C' },
        { id: 'char_merry',     name: 'Meriadoc Brandebouc', color: '#78716C' },
        { id: 'char_pippin',    name: 'Peregrin Touque',     color: '#78716C' },
      ],
    },
    {
      id: 'obj_staves',
      name: 'Bâton de Gandalf',
      type: 'Bâton de magicien',
      creator: 'Inconnu (apporté de Valinor ?)',
      createdIn: 'Inconnu',
      description:
        'Instrument et symbole de la puissance istari de Gandalf. Il peut projeter une lumière aveuglante, allumer un feu à distance ou libérer une décharge de force magique. Sa destruction par Saroumane lors de l\'emprisonnement à Orthanc est un acte de domination symbolique fort.',
      powers: ['Lumière', 'Feu', 'Décharge de force', 'Soutien (bâton de marche)'],
      currentHolder: 'Gandalf le Gris',
      holders: [
        { id: 'char_gandalf', name: 'Gandalf le Gris', color: '#F59E0B' },
      ],
    },
  ],
};

/**
 * Trouve un personnage par son nom (partiel, insensible à la casse).
 * Utilisé depuis les tags "alliés" de la carte interactive.
 */
export function findCharacterByAllyName(allyName) {
  // Nettoyage : supprimer les annotations entre parenthèses, "Le ", etc.
  const base = allyName
    .split('(')[0]
    .replace(/^(le |la |les |l')/i, '')
    .trim()
    .toLowerCase();

  return loreDB.characters.find((c) => {
    const cName = c.name.toLowerCase();
    const cAliases = c.aliases.map((a) => a.toLowerCase());
    return (
      cName.includes(base) ||
      base.includes(cName.split(' ')[0]) ||
      cAliases.some((a) => a.includes(base) || base.includes(a.split(' ')[0]))
    );
  });
}
