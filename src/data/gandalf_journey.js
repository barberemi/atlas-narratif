// Arc narratif de Gandalf (Mithrandir) dans La Communauté de l'Anneau (Tome 1)
// Chronologie : de la Comté à l'abîme de Khazad-dûm
// Couleur associée : #F59E0B (or / ambre — l'Istari au bâton de feu)

export const gandalfJourney = [
  {
    id: 0,
    etape: 1,
    scene: "comte",
    lieu: "La Comté",
    sous_lieu: "Hobbitebourg — Cul-de-Sac",
    chapitre: "La Communauté de l'Anneau, I-1/2",
    action:
      "Gandalf révèle à Frodo la véritable nature de l'Anneau Unique. Il lui remet la lettre de Bilbo et lui ordonne de quitter la Comté sans délai, en direction de Fondcombe. Il part lui-même chercher des certitudes dans les archives du Gondor.",
    allies: ["Frodo Sacquet", "Bilbo Sacquet (déjà parti)"],
    x: 17,
    y: 25,
  },
  {
    id: 1,
    etape: 2,
    scene: "isengard",
    lieu: "Isengard — Tour d'Orthanc",
    sous_lieu: "Demeure de Saroumane le Blanc",
    chapitre: "La Communauté de l'Anneau, II-2 (récit rétrospectif)",
    action:
      "Gandalf se rend à Isengard pour informer Saroumane. Mais le chef de l'Ordre des Istari a trahi : il s'est allié à Sauron. Gandalf est fait prisonnier et retenu captif au sommet de la tour d'Orthanc, isolé du reste du monde.",
    allies: [],
    x: 47,
    y: 56,
  },
  {
    id: 2,
    etape: 3,
    scene: "gwaihir",
    lieu: "Fuite sur Gwaihir",
    sous_lieu: "Cimes des Montagnes Brumeuses",
    chapitre: "La Communauté de l'Anneau, II-2 (récit rétrospectif)",
    action:
      "Gwaihir le Seigneur des Vents, le Grand Aigle, répond à l'appel de Gandalf. Il l'emporte des hauteurs d'Orthanc à travers les cimes des Montagnes Brumeuses. Gandalf échappe à la captivité et file vers Fondcombe.",
    allies: ["Gwaihir (Grand Aigle)"],
    x: 52,
    y: 32,
  },
  {
    id: 3,
    etape: 4,
    scene: "fondcombe",
    lieu: "Fondcombe",
    sous_lieu: "Demeure d'Elrond, Imladris",
    chapitre: "La Communauté de l'Anneau, II-1/3",
    action:
      "Gandalf arrive à Fondcombe en avance sur les hobbits. Au Conseil d'Elrond, il expose l'histoire complète de l'Anneau Unique, la trahison de Saroumane et le danger imminent. Il est désigné guide de la Communauté des Neuf.",
    allies: ["Elrond", "Frodo", "Aragorn", "Legolas", "Gimli", "Boromir", "Sam", "Merry", "Pippin"],
    x: 51,
    y: 22,
  },
  {
    id: 4,
    etape: 5,
    scene: "caradhras",
    lieu: "Col de Caradhras",
    sous_lieu: "La Porte Rouge des Montagnes Brumeuses",
    chapitre: "La Communauté de l'Anneau, II-3",
    action:
      "La Communauté tente de franchir les Montagnes par le Col de Caradhras. Saroumane déchaîne un blizzard magique pour les bloquer. Gandalf lutte contre la tempête avec des flammes, mais la montagne est infranchissable. Demi-tour forcé.",
    allies: ["Frodo", "Aragorn", "Legolas", "Gimli", "Boromir", "Sam", "Merry", "Pippin"],
    x: 55,
    y: 30,
  },
  {
    id: 5,
    etape: 6,
    scene: "moria",
    lieu: "Mines de la Moria",
    sous_lieu: "Porte de Durin, Entrée Ouest",
    chapitre: "La Communauté de l'Anneau, II-4",
    action:
      "Contrainte de contourner les montagnes, la Communauté entre dans les mines de Moria. Gandalf ouvre la Porte de Durin : « Dis 'ami' et entre ». Il guide le groupe dans les ténèbres du royaume nain abandonné, affrontant ombres et présences maléfiques.",
    allies: ["Frodo", "Aragorn", "Legolas", "Gimli", "Boromir", "Sam", "Merry", "Pippin"],
    x: 57,
    y: 40,
  },
  {
    id: 6,
    etape: 7,
    scene: "khazad_dum",
    lieu: "Pont de Khazad-dûm",
    sous_lieu: "Abîme de Moria",
    chapitre: "La Communauté de l'Anneau, II-5",
    action:
      "Le Balrog — Fléau de Durin — surgit des profondeurs. Gandalf se plante sur le pont étroit : « Je suis le serviteur du Feu Secret... Vous ne passerez pas ! » Le pont s'effondre. Le Balrog l'entraîne dans l'abîme. Gandalf le Gris disparaît dans les ténèbres.",
    allies: ["Le Balrog (adversaire)"],
    x: 58,
    y: 43,
  },
];
