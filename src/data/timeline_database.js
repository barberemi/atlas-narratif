// Base de données de la timeline narrative — La Communauté de l'Anneau
// Chaque événement est ancré dans un chapitre et lie des entités

export const timelineDB = [

  // ── Chapitre 1 : Une Longue Fête Attendue ───────────────────────────────────
  {
    id: 'evt_001',
    chapter: 1,
    chapterTitle: "Une Longue Fête Attendue",
    title: "La fête d'anniversaire de Bilbo",
    description: "Bilbo Sacquet fête ses cent onze ans au Comté. Gandalf prépare les feux d'artifice.",
    locationId: 'loc_shire',
    entities: [
      { id: 'char_bilbo',   entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'loc_shire',    entityType: 'location'  },
    ],
  },
  {
    id: 'evt_002',
    chapter: 1,
    chapterTitle: "Une Longue Fête Attendue",
    title: "Bilbo disparaît et lègue l'Anneau",
    description: "Bilbo utilise l'Anneau pour disparaître, puis le laisse à Frodo sur les conseils de Gandalf.",
    locationId: 'loc_shire',
    entities: [
      { id: 'char_bilbo',   entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object'    },
    ],
  },
  {
    id: 'evt_003',
    chapter: 1,
    chapterTitle: "Une Longue Fête Attendue",
    title: "Bilbo part vers Fondcombe",
    description: "Bilbo quitte le Comté pour rejoindre Fondcombe, où il passera ses dernières années.",
    locationId: 'loc_shire',
    entities: [
      { id: 'char_bilbo',    entityType: 'character' },
      { id: 'loc_shire',     entityType: 'location'  },
      { id: 'loc_rivendell', entityType: 'location'  },
    ],
  },

  // ── Chapitre 2 : L'Ombre du Passé ───────────────────────────────────────────
  {
    id: 'evt_004',
    chapter: 2,
    chapterTitle: "L'Ombre du Passé",
    title: "Gandalf révèle la vérité sur l'Anneau",
    description: "Gandalf revient au Comté et explique à Frodo la véritable nature de l'Anneau Unique.",
    locationId: 'loc_shire',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object'    },
    ],
  },
  {
    id: 'evt_005',
    chapter: 2,
    chapterTitle: "L'Ombre du Passé",
    title: "Gandalf part chercher des informations",
    description: "Gandalf quitte le Comté pour enquêter sur l'histoire de l'Anneau — il se dirige vers Isengard pour consulter Saroumane.",
    locationId: 'loc_isengard',
    entities: [
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'char_saruman',  entityType: 'character' },
      { id: 'loc_isengard',  entityType: 'location'  },
    ],
    incoherenceIds: ['inc_001'],
  },
  {
    id: 'evt_006',
    chapter: 2,
    chapterTitle: "L'Ombre du Passé",
    title: "Frodo et Sam quittent le Comté",
    description: "Frodo vend Cul-de-Sac et part sur les routes avec Sam, attendant Gandalf qui ne vient pas.",
    locationId: 'loc_shire',
    entities: [
      { id: 'char_frodo', entityType: 'character' },
      { id: 'char_sam',   entityType: 'character' },
      { id: 'loc_shire',  entityType: 'location'  },
    ],
  },

  // ── Chapitre 3 : Hauts-des-Galgals et Bree ──────────────────────────────────
  {
    id: 'evt_007',
    chapter: 3,
    chapterTitle: "Hauts-des-Galgals et Bree",
    title: "Gandalf emprisonné à Orthanc",
    description: "Saroumane révèle sa trahison et emprisonne Gandalf au sommet de la tour d'Orthanc à Isengard.",
    locationId: 'loc_isengard',
    entities: [
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_saruman', entityType: 'character' },
      { id: 'loc_isengard', entityType: 'location'  },
      { id: 'obj_staves',   entityType: 'object'    },
    ],
    incoherenceIds: ['inc_001'],
  },
  {
    id: 'evt_008',
    chapter: 3,
    chapterTitle: "Hauts-des-Galgals et Bree",
    title: "Tom Bombadil sauve les Hobbits",
    description: "Tom Bombadil libère les Hobbits prisonniers des Hauts-des-Galgals et leur offre des épées.",
    locationId: 'loc_barrowdowns',
    entities: [
      { id: 'char_frodo',        entityType: 'character' },
      { id: 'char_sam',          entityType: 'character' },
      { id: 'char_merry',        entityType: 'character' },
      { id: 'char_pippin',       entityType: 'character' },
      { id: 'char_tom_bombadil', entityType: 'character' },
      { id: 'loc_barrowdowns',   entityType: 'location'  },
    ],
  },
  {
    id: 'evt_009',
    chapter: 3,
    chapterTitle: "Hauts-des-Galgals et Bree",
    title: "Rencontre avec Grands-Pas à Bree",
    description: "Au Poney Fringant, les Hobbits rencontrent Aragorn, alias Grands-Pas, qui propose de les guider vers Fondcombe.",
    locationId: 'loc_bree',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_sam',     entityType: 'character' },
      { id: 'char_merry',   entityType: 'character' },
      { id: 'char_pippin',  entityType: 'character' },
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'loc_bree',     entityType: 'location'  },
    ],
  },

  // ── Chapitre 4 : Le Gué de Bruinen ──────────────────────────────────────────
  {
    id: 'evt_010',
    chapter: 4,
    chapterTitle: "Le Gué de Bruinen",
    title: "Frodo blessé à Amon Sûl",
    description: "Le Roi-Sorcier blesse Frodo d'un couteau de Morgul sur les ruines d'Amon Sûl (Fengard).",
    locationId: 'loc_weathertop',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'loc_weathertop', entityType: 'location' },
    ],
  },
  {
    id: 'evt_011',
    chapter: 4,
    chapterTitle: "Le Gué de Bruinen",
    title: "Glorfindel escorte Frodo au Gué",
    description: "Glorfindel, seigneur de Fondcombe, surgit et escorte Frodo blessé jusqu'au Gué de Bruinen.",
    locationId: 'loc_ford',
    entities: [
      { id: 'char_frodo',      entityType: 'character' },
      { id: 'char_glorfindel', entityType: 'character' },
      { id: 'loc_ford',        entityType: 'location'  },
    ],
    incoherenceIds: ['inc_004'],
  },
  {
    id: 'evt_012',
    chapter: 4,
    chapterTitle: "Le Gué de Bruinen",
    title: "La crue du Bruinen repousse les Cavaliers",
    description: "Elrond déclenche la crue du Bruinen, emportant les Cavaliers Noirs qui poursuivaient Frodo.",
    locationId: 'loc_ford',
    entities: [
      { id: 'char_frodo',  entityType: 'character' },
      { id: 'char_elrond', entityType: 'character' },
      { id: 'loc_ford',    entityType: 'location'  },
    ],
  },

  // ── Chapitre 5 : Le Conseil d'Elrond ────────────────────────────────────────
  {
    id: 'evt_013',
    chapter: 5,
    chapterTitle: "Le Conseil d'Elrond",
    title: "Gandalf s'échappe d'Isengard",
    description: "Gwahir l'Aiglon secourt Gandalf du sommet d'Orthanc et le conduit vers Fondcombe.",
    locationId: 'loc_rivendell',
    entities: [
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'loc_isengard',  entityType: 'location'  },
      { id: 'loc_rivendell', entityType: 'location'  },
    ],
    incoherenceIds: ['inc_001'],
  },
  {
    id: 'evt_014',
    chapter: 5,
    chapterTitle: "Le Conseil d'Elrond",
    title: "Frodo guéri par Elrond à Fondcombe",
    description: "Elrond soigne la blessure de Frodo. Frodo retrouve Bilbo, vieux et fatigué.",
    locationId: 'loc_rivendell',
    entities: [
      { id: 'char_frodo',    entityType: 'character' },
      { id: 'char_bilbo',    entityType: 'character' },
      { id: 'char_elrond',   entityType: 'character' },
      { id: 'loc_rivendell', entityType: 'location'  },
    ],
  },
  {
    id: 'evt_015',
    chapter: 5,
    chapterTitle: "Le Conseil d'Elrond",
    title: "Le Grand Conseil — Frodo porte-anneau volontaire",
    description: "Représentants des peuples libres débattent du sort de l'Anneau. Frodo se porte volontaire pour le détruire.",
    locationId: 'loc_rivendell',
    entities: [
      { id: 'char_frodo',    entityType: 'character' },
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'char_aragorn',  entityType: 'character' },
      { id: 'char_legolas',  entityType: 'character' },
      { id: 'char_gimli',    entityType: 'character' },
      { id: 'char_boromir',  entityType: 'character' },
      { id: 'char_elrond',   entityType: 'character' },
      { id: 'loc_rivendell', entityType: 'location'  },
      { id: 'obj_one_ring',  entityType: 'object'    },
    ],
  },
  {
    id: 'evt_016',
    chapter: 5,
    chapterTitle: "Le Conseil d'Elrond",
    title: "Formation de la Communauté de l'Anneau",
    description: "Elrond constitue la Communauté de neuf membres pour accompagner Frodo jusqu'en Mordor.",
    locationId: 'loc_rivendell',
    entities: [
      { id: 'char_frodo',    entityType: 'character' },
      { id: 'char_sam',      entityType: 'character' },
      { id: 'char_merry',    entityType: 'character' },
      { id: 'char_pippin',   entityType: 'character' },
      { id: 'char_gandalf',  entityType: 'character' },
      { id: 'char_aragorn',  entityType: 'character' },
      { id: 'char_legolas',  entityType: 'character' },
      { id: 'char_gimli',    entityType: 'character' },
      { id: 'char_boromir',  entityType: 'character' },
      { id: 'loc_rivendell', entityType: 'location'  },
    ],
  },

  // ── Chapitre 6 : La Route dans les Ténèbres ─────────────────────────────────
  {
    id: 'evt_017',
    chapter: 6,
    chapterTitle: "La Route dans les Ténèbres",
    title: "Échec du Col de Caradhras",
    description: "La Communauté tente de franchir les Monts Brumeux par Caradhras mais est repoussée par la neige et le froid.",
    locationId: 'loc_caradhras',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_sam',     entityType: 'character' },
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_boromir', entityType: 'character' },
      { id: 'char_legolas', entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
      { id: 'char_merry',   entityType: 'character' },
      { id: 'char_pippin',  entityType: 'character' },
    ],
  },
  {
    id: 'evt_018',
    chapter: 6,
    chapterTitle: "La Route dans les Ténèbres",
    title: "Décision d'entrer dans la Moria",
    description: "Gandalf convainc la Communauté de traverser les Mines de la Moria pour passer sous les montagnes.",
    locationId: 'loc_moria',
    entities: [
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
      { id: 'loc_moria',    entityType: 'location'  },
    ],
  },

  // ── Chapitre 7 : Un Voyage dans les Ténèbres ────────────────────────────────
  {
    id: 'evt_019',
    chapter: 7,
    chapterTitle: "Un Voyage dans les Ténèbres",
    title: "La Communauté entre dans la Moria",
    description: "La Communauté pénètre dans les Mines par la Porte de l'Ouest, après que Gandalf a résolu l'énigme.",
    locationId: 'loc_moria',
    entities: [
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
      { id: 'loc_moria',    entityType: 'location'  },
    ],
  },
  {
    id: 'evt_020',
    chapter: 7,
    chapterTitle: "Un Voyage dans les Ténèbres",
    title: "Découverte du tombeau de Balin",
    description: "La Communauté trouve la chambre funéraire de Balin. Pippin fait tomber un squelette dans un puits — les Orques attaquent.",
    locationId: 'loc_moria',
    entities: [
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_pippin',  entityType: 'character' },
      { id: 'char_gimli',   entityType: 'character' },
      { id: 'loc_moria',    entityType: 'location'  },
    ],
  },
  {
    id: 'evt_021',
    chapter: 7,
    chapterTitle: "Un Voyage dans les Ténèbres",
    title: "Gandalf chute au Pont de Khazad-dûm",
    description: "Gandalf affronte le Balrog sur le Pont de Khazad-dûm. Il brise le pont mais est entraîné dans l'abîme.",
    locationId: 'loc_moria',
    entities: [
      { id: 'char_gandalf', entityType: 'character' },
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'loc_moria',    entityType: 'location'  },
    ],
    incoherenceIds: ['inc_003'],
  },

  // ── Chapitre 8 : Lothlórien ──────────────────────────────────────────────────
  {
    id: 'evt_022',
    chapter: 8,
    chapterTitle: "Lothlórien",
    title: "Accueil par Galadriel et Celeborn",
    description: "La Communauté (sans Gandalf) arrive à Caras Galadhon. Galadriel lit dans leurs cœurs.",
    locationId: 'loc_lothlorien',
    entities: [
      { id: 'char_frodo',     entityType: 'character' },
      { id: 'char_sam',       entityType: 'character' },
      { id: 'char_aragorn',   entityType: 'character' },
      { id: 'char_legolas',   entityType: 'character' },
      { id: 'char_gimli',     entityType: 'character' },
      { id: 'char_boromir',   entityType: 'character' },
      { id: 'char_merry',     entityType: 'character' },
      { id: 'char_pippin',    entityType: 'character' },
      { id: 'char_galadriel', entityType: 'character' },
      { id: 'loc_lothlorien', entityType: 'location'  },
    ],
  },
  {
    id: 'evt_023',
    chapter: 8,
    chapterTitle: "Lothlórien",
    title: "Galadriel remet le Lembas et les dons",
    description: "Galadriel offre des présents à chaque membre : manteaux elfiques, Lembas, fioles, et la Phiale pour Frodo.",
    locationId: 'loc_lothlorien',
    entities: [
      { id: 'char_frodo',     entityType: 'character' },
      { id: 'char_sam',       entityType: 'character' },
      { id: 'char_galadriel', entityType: 'character' },
      { id: 'obj_lembas',     entityType: 'object'    },
      { id: 'loc_lothlorien', entityType: 'location'  },
    ],
    incoherenceIds: ['inc_003'],
  },

  // ── Chapitre 9 : La Rupture de la Communauté ─────────────────────────────────
  {
    id: 'evt_024',
    chapter: 9,
    chapterTitle: "La Rupture de la Communauté",
    title: "Boromir tente de prendre l'Anneau",
    description: "Boromir, corrompu par l'Anneau, tente de s'en emparer auprès de Frodo sur Amon Hen.",
    locationId: 'loc_parthgalen',
    entities: [
      { id: 'char_frodo',   entityType: 'character' },
      { id: 'char_boromir', entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object'    },
      { id: 'obj_anduril',  entityType: 'object'    },
    ],
  },
  {
    id: 'evt_025',
    chapter: 9,
    chapterTitle: "La Rupture de la Communauté",
    title: "Frodo et Sam traversent le Fleuve seuls",
    description: "Frodo décide de poursuivre seul vers la Mordor. Sam le rejoint à la nage — la Communauté est brisée.",
    locationId: 'loc_parthgalen',
    entities: [
      { id: 'char_frodo', entityType: 'character' },
      { id: 'char_sam',   entityType: 'character' },
      { id: 'obj_one_ring', entityType: 'object'  },
    ],
  },
  {
    id: 'evt_026',
    chapter: 9,
    chapterTitle: "La Rupture de la Communauté",
    title: "Mort de Boromir",
    description: "Boromir est mortellement blessé en défendant Merry et Pippin contre les Uruk-hai. Aragorn lui rend hommage.",
    locationId: 'loc_parthgalen',
    entities: [
      { id: 'char_boromir', entityType: 'character' },
      { id: 'char_aragorn', entityType: 'character' },
      { id: 'char_merry',   entityType: 'character' },
      { id: 'char_pippin',  entityType: 'character' },
      { id: 'obj_anduril',  entityType: 'object'    },
    ],
  },
];

// ── Utilitaires ────────────────────────────────────────────────────────────────

/** Retourne tous les chapitres distincts triés */
export function getChapters() {
  const seen = new Set();
  const chapters = [];
  for (const evt of timelineDB) {
    if (!seen.has(evt.chapter)) {
      seen.add(evt.chapter);
      chapters.push({ number: evt.chapter, title: evt.chapterTitle });
    }
  }
  return chapters.sort((a, b) => a.number - b.number);
}

/** Retourne les événements d'un chapitre */
export function getChapterEvents(chapterNumber) {
  return timelineDB.filter(e => e.chapter === chapterNumber);
}

/**
 * Pour un événement en conflit, retourne les détails :
 * quels personnages apparaissent aussi dans un autre lieu du même chapitre, et où.
 */
export function getConflictDetails(eventId) {
  const event = timelineDB.find(e => e.id === eventId);
  if (!event?.locationId) return [];

  const sameChapter = timelineDB.filter(e =>
    e.chapter === event.chapter && e.id !== eventId && e.locationId && e.locationId !== event.locationId
  );

  const eventCharIds = event.entities.filter(e => e.entityType === 'character').map(e => e.id);
  const result = [];

  for (const other of sameChapter) {
    const otherCharIds = other.entities.filter(e => e.entityType === 'character').map(e => e.id);
    const shared = eventCharIds.filter(id => otherCharIds.includes(id));
    if (shared.length > 0) {
      result.push({ charIds: shared, otherEventTitle: other.title, otherLocationId: other.locationId });
    }
  }
  return result;
}

/**
 * Détecte les conflits de présence simultanée par chapitre.
 * Un conflit = même personnage dans 2 événements du même chapitre avec des locationId différents.
 * Retourne un Set d'eventIds en conflit.
 */
export function detectConflicts() {
  const conflictEventIds = new Set();
  const chapters = getChapters();

  for (const { number } of chapters) {
    const events = getChapterEvents(number);
    // Pour chaque personnage, collecte les (locationId, eventId) de sa présence
    const charLocations = new Map(); // charId → [{ locationId, eventId }]

    for (const evt of events) {
      if (!evt.locationId) continue;
      const chars = evt.entities.filter(e => e.entityType === 'character');
      for (const { id: charId } of chars) {
        if (!charLocations.has(charId)) charLocations.set(charId, []);
        charLocations.get(charId).push({ locationId: evt.locationId, eventId: evt.id });
      }
    }

    // Détecte les personnages avec plusieurs lieux différents dans le même chapitre
    for (const [, presences] of charLocations) {
      const locs = new Set(presences.map(p => p.locationId));
      if (locs.size > 1) {
        presences.forEach(p => conflictEventIds.add(p.eventId));
      }
    }
  }

  return conflictEventIds;
}
