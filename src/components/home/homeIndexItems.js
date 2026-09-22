/**
 * Entrées du sommaire « Ce que fait l'outil ».
 *
 * Partagé entre la home interactive (App.jsx) et sa version prerendue
 * (HomePageSEO.jsx) : les deux doivent rendre exactement le même contenu pour
 * le SEO, donc la liste vit ici plutôt qu'en double.
 *
 * `shot` pointe vers une capture de l'app avec la démo LOTR chargée (servie
 * depuis public/home/). Les captures sont prises sans annotation incrustée :
 * le texte explicatif passe par les légendes i18n, sinon la home EN et ZH
 * afficherait des annotations en français.
 */
export const INDEX_ITEMS = [
  {
    no: '01',
    titleKey: 'home.idx1Title',
    catKey: 'home.idx1Cat',
    descKey: 'home.idx1Desc',
    shot: '/home/savethecat.webp',
    shotW: 1600,
    shotH: 775,
    altKey: 'home.idx1Alt',
  },
  {
    no: '02',
    titleKey: 'home.idx2Title',
    catKey: 'home.idx2Cat',
    descKey: 'home.idx2Desc',
    shot: '/home/carte.webp',
    shotW: 1600,
    shotH: 828,
    altKey: 'home.idx2Alt',
  },
  {
    no: '03',
    titleKey: 'home.idx3Title',
    catKey: 'home.idx3Cat',
    descKey: 'home.idx3Desc',
    shot: '/home/incoherences.webp',
    shotW: 1600,
    shotH: 775,
    altKey: 'home.idx3Alt',
  },
];

/** Capture mise en avant sous le hero. */
export const HERO_SHOT = {
  src: '/home/timeline.webp',
  width: 1600,
  height: 775,
  altKey: 'home.heroShotAlt',
  captionKey: 'home.heroShotCaption',
};
