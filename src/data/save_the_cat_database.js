// ── Les 15 beats de la méthode Save the Cat ───────────────────────────────────
// idealPercent : position idéale dans le livre (0-100%)
// tolerance    : marge d'erreur acceptée (en points de %)
export const BEATS = [
  {
    id: 'opening_image',
    number: 1,
    label: "Scène d'ouverture",
    description: "Première image qui plonge le lecteur dans l'univers. Ton de l'histoire, monde du héros.",
    idealPercent: 1,
    tolerance: 3,
    color: '#818cf8',
    alertMessages: {
      too_early: null,
      too_late: "Ta scène d'ouverture arrive trop tard. Le lecteur n'est pas immédiatement immergé dans l'univers et le ton de l'histoire.",
      missing: "Aucune scène d'ouverture. Ton début risque de sembler abrupt — pose l'ambiance dès la première page.",
    },
  },
  {
    id: 'theme_stated',
    number: 2,
    label: 'Thème exposé',
    description: "Le thème central ou la leçon de l'histoire est énoncé, souvent implicitement par un personnage secondaire.",
    idealPercent: 5,
    tolerance: 4,
    color: '#a78bfa',
    alertMessages: {
      too_early: "Ton thème est exposé trop tôt. Le lecteur n'est pas encore ancré dans l'histoire pour en percevoir la portée.",
      too_late: "Ton thème arrive trop tard. Le lecteur avance sans boussole narrative.",
      missing: "Le thème n'est pas exposé. Assure-toi qu'il transparaît tôt dans une réplique ou une situation clé.",
    },
  },
  {
    id: 'setup',
    number: 3,
    label: 'Mise en place',
    description: "Le héros et son monde ordinaire sont introduits. Tout ce qui sera transformé est établi.",
    idealPercent: 7,
    tolerance: 6,
    color: '#c4b5fd',
    alertMessages: {
      too_early: null,
      too_late: "Ta mise en place s'étire trop longtemps. Le lecteur attend que quelque chose démarre.",
      missing: "La mise en place est absente ou trop courte. Le lecteur ne connaît pas le monde ordinaire du héros.",
    },
  },
  {
    id: 'catalyst',
    number: 4,
    label: 'Élément déclencheur',
    description: "L'événement qui bouscule le monde ordinaire du héros et lance véritablement l'histoire.",
    idealPercent: 10,
    tolerance: 3,
    color: '#60a5fa',
    alertMessages: {
      too_early: "Ton élément déclencheur arrive trop tôt. Le lecteur n'a pas eu le temps de s'attacher au héros et à son monde.",
      too_late: "Ton élément déclencheur arrive trop tard. Le lecteur risque de s'ennuyer avant que l'histoire ne démarre vraiment.",
      missing: "Aucun élément déclencheur identifié. Sans lui, l'histoire n'a pas de vrai point de départ.",
    },
  },
  {
    id: 'debate',
    number: 5,
    label: 'Moment de réflexion',
    description: "Le héros hésite, résiste ou délibère. Il se pose la question du changement avant de s'y engager.",
    idealPercent: 18,
    tolerance: 8,
    color: '#38bdf8',
    alertMessages: {
      too_early: "Le héros se décide trop vite. Le lecteur ne ressent pas le poids du dilemme ni le coût de l'aventure.",
      too_late: "La phase de réflexion s'éternise. L'histoire tarde trop à s'engager vers l'acte 2.",
      missing: "Ton héros ne semble pas hésiter. Un moment de doute le rendrait plus humain et le choix plus significatif.",
    },
  },
  {
    id: 'break_into_two',
    number: 6,
    label: 'Basculement',
    description: "Le héros choisit activement d'agir. Il entre dans le monde de l'aventure. Point de non-retour.",
    idealPercent: 25,
    tolerance: 4,
    color: '#10b981',
    alertMessages: {
      too_early: "Ton basculement arrive trop tôt. Le monde de l'aventure contraste insuffisamment avec le monde ordinaire.",
      too_late: "Le basculement est trop tardif. La transition vers l'acte 2 tarde à s'opérer et le rythme s'en ressent.",
      missing: "Pas de basculement clairement identifié. Le passage à l'aventure doit être un moment fort et actif du héros.",
    },
  },
  {
    id: 'b_story',
    number: 7,
    label: 'Sous-intrigue',
    description: "Une histoire secondaire (souvent une relation) qui aide le héros dans sa transformation intérieure.",
    idealPercent: 30,
    tolerance: 8,
    color: '#4ade80',
    alertMessages: {
      too_early: "Ta sous-intrigue démarre trop tôt, avant même que l'aventure principale soit vraiment lancée.",
      too_late: "Ta sous-intrigue démarre trop tard pour avoir un impact suffisant sur la transformation du héros.",
      missing: "Aucune sous-intrigue définie. Une histoire secondaire enrichit la profondeur émotionnelle du récit.",
    },
  },
  {
    id: 'fun_and_games',
    number: 8,
    label: 'Moments palpitants',
    description: "Le cœur du livre et la promesse de ton concept. Le héros explore son nouveau monde, souvent avec éclat.",
    idealPercent: 37,
    tolerance: 13,
    color: '#a3e635',
    alertMessages: {
      too_early: "Les moments palpitants arrivent trop tôt, avant que les enjeux et le monde de l'aventure soient bien établis.",
      too_late: "Les moments palpitants tardent. Le lecteur attend l'action centrale promise par le concept.",
      missing: "La section 'fun and games' est absente. C'est pourtant le cœur et la vitrine de ton concept narratif.",
    },
  },
  {
    id: 'midpoint',
    number: 9,
    label: "Milieu de l'histoire",
    description: "Les enjeux sont intensifiés. Fausse victoire ou fausse défaite qui relance l'histoire sur une nouvelle dynamique.",
    idealPercent: 50,
    tolerance: 5,
    color: '#facc15',
    alertMessages: {
      too_early: "Ton milieu arrive trop tôt. La première moitié du récit sera trop courte et les enjeux insuffisamment développés.",
      too_late: "Ton milieu arrive trop tard. Le rythme de la seconde moitié sera écrasé et la résolution précipitée.",
      missing: "Pas de milieu identifié. Ce pivot central est essentiel pour relancer les enjeux à mi-parcours.",
    },
  },
  {
    id: 'bad_guys',
    number: 10,
    label: 'Pression des antagonistes',
    description: "Les forces antagonistes contre-attaquent. La situation se complique sérieusement pour le héros.",
    idealPercent: 63,
    tolerance: 12,
    color: '#fb923c',
    alertMessages: {
      too_early: "La pression antagoniste monte trop vite, avant que le héros ait atteint son apogée au milieu.",
      too_late: "Les antagonistes n'exercent pas assez rapidement leur pression après le milieu de l'histoire.",
      missing: "La montée en pression des antagonistes n'est pas clairement marquée dans le récit.",
    },
  },
  {
    id: 'all_is_lost',
    number: 11,
    label: 'Tout est perdu',
    description: "Le pire moment pour le héros. Une perte réelle ou symbolique. Tout semble avoir échoué.",
    idealPercent: 75,
    tolerance: 5,
    color: '#f87171',
    alertMessages: {
      too_early: "Ton 'Tout est perdu' arrive trop tôt. Les enjeux n'auront pas eu le temps d'être suffisamment intenses.",
      too_late: "Ton 'Tout est perdu' arrive trop tard. La résolution finale sera précipitée et moins satisfaisante.",
      missing: "Pas de moment 'Tout est perdu'. Sans ce nadir, la résolution manquera d'impact émotionnel.",
    },
  },
  {
    id: 'dark_night',
    number: 12,
    label: "Nuit noire de l'âme",
    description: "Le héros face à sa défaite. Moment d'introspection, de deuil, avant la révélation qui change tout.",
    idealPercent: 78,
    tolerance: 4,
    color: '#ef4444',
    alertMessages: {
      too_early: "La nuit noire arrive trop tôt. Le héros n'a pas assez sombré pour que sa remontée soit significative.",
      too_late: "La nuit noire est trop tardive. Il ne restera pas assez de place pour la transformation et la résolution.",
      missing: "La 'Nuit noire de l'âme' est absente. Sans ce creux, la transformation du héros manquera de crédibilité.",
    },
  },
  {
    id: 'break_into_three',
    number: 13,
    label: 'Twist / Révélation',
    description: "Le héros réalise une vérité qui lui échappait. Il trouve la nouvelle approche pour triompher.",
    idealPercent: 80,
    tolerance: 5,
    color: '#dc2626',
    alertMessages: {
      too_early: "Le twist arrive trop tôt, avant que le héros ait réellement touché le fond.",
      too_late: "La révélation du héros arrive trop tard pour laisser assez de place à une résolution satisfaisante.",
      missing: "Pas de twist ou révélation identifié. C'est le moteur indispensable de la résolution finale.",
    },
  },
  {
    id: 'finale',
    number: 14,
    label: 'Finale',
    description: "Le héros met en action sa nouvelle prise de conscience. Il triomphe des antagonistes grâce à ce qu'il a appris.",
    idealPercent: 90,
    tolerance: 8,
    color: '#9333ea',
    alertMessages: {
      too_early: "Ta finale arrive trop tôt. Le triomphe du héros manquera d'ampleur et de développement.",
      too_late: "Ta finale est très tardive. Elle sera précipitée ou l'histoire aura semblé traîner en longueur.",
      missing: "Pas de finale identifiée.",
    },
  },
  {
    id: 'final_image',
    number: 15,
    label: 'Scène finale',
    description: "Dernière image qui reflète ou contraste avec la scène d'ouverture. La boucle narrative se ferme.",
    idealPercent: 99,
    tolerance: 3,
    color: '#ec4899',
    alertMessages: {
      too_early: "Ta scène finale arrive trop tôt. L'histoire ne se termine pas vraiment là où elle devrait.",
      too_late: null,
      missing: "Pas de scène finale. La boucle avec la scène d'ouverture n'est pas fermée.",
    },
  },
];

// ── Tes chapitres ─────────────────────────────────────────────────────────────
// Pour chaque chapitre, renseigne :
//   number  : numéro du chapitre (1, 2, 3…)
//   title   : titre du chapitre
//   summary : ce qu'il se passe (résumé court)
//   beats   : liste des beats Save the Cat couverts par ce chapitre
//             (ids disponibles ci-dessus)
export const chaptersDB = [
  {
    id: 'ch1',
    number: 1,
    title: "Une réunion longtemps attendue",
    summary: "La Comté est présentée dans toute sa quiétude hobbit. Bilbon fête ses 111 ans, transmet l'Anneau à Frodo. Gandalf observe, inquiet. L'univers paisible et la menace sous-jacente sont établis.",
    beats: ['opening_image', 'theme_stated', 'setup'],
  },
  {
    id: 'ch2',
    number: 2,
    title: "L'Ombre du passé",
    summary: "Gandalf révèle la véritable nature de l'Anneau à Frodo. Sauron le cherche. Frodo doit quitter la Comté. Le destin du monde repose sur un simple hobbit.",
    beats: ['catalyst'],
  },
  {
    id: 'ch3',
    number: 3,
    title: "La Route de Fondcombe",
    summary: "Frodo hésite, tergiverser. Le voyage vers Fondcombe est semé d'embûches. À Fondcombe, le Conseil d'Elrond débat de l'avenir de l'Anneau. Frodo se porte volontaire.",
    beats: ['debate', 'break_into_two'],
  },
  {
    id: 'ch4',
    number: 4,
    title: "La Communauté de l'Anneau",
    summary: "La Communauté est formée. Aragorn, confident de Frodo, représente la sous-intrigue de la royauté cachée. Le groupe part vers le sud puis tente le col de Caradhras.",
    beats: ['b_story', 'fun_and_games'],
  },
  {
    id: 'ch5',
    number: 5,
    title: "La Moria",
    summary: "La Communauté s'engage dans les mines de la Moria. Combat contre le Balrog. Gandalf tombe dans l'abîme en se sacrifiant pour sauver le groupe.",
    beats: ['midpoint'],
  },
  {
    id: 'ch6',
    number: 6,
    title: "La Lórien",
    summary: "Refuge à Lothlórien. Galadriel teste Frodo et lui offre un miroir de visions. Boromir est de plus en plus corrompu par l'Anneau. La Communauté repart sur l'Anduin.",
    beats: ['bad_guys'],
  },
  {
    id: 'ch7',
    number: 7,
    title: "La Trahison de Boromir",
    summary: "Boromir cède à l'Anneau et attaque Frodo. Frodo s'enfuit. La Communauté est attaquée par les Uruk-haï. Tout semble perdu : la mission et le groupe sont en péril.",
    beats: ['all_is_lost', 'dark_night'],
  },
  {
    id: 'ch8',
    number: 8,
    title: "La Chute de Boromir",
    summary: "Boromir se rachète en mourant pour défendre Merry et Pippin. Frodo comprend qu'il doit continuer seul pour protéger ses amis. Il repart avec Sam.",
    beats: ['break_into_three', 'finale'],
  },
  {
    id: 'ch9',
    number: 9,
    title: "Le Départ vers Mordor",
    summary: "Frodo et Sam partent seuls vers Mordor. L'image finale contraste avec la quiétude initiale de la Comté : deux hobbits marchent vers les terres sombres, déterminés.",
    beats: ['final_image'],
  },
];

// ── Fonctions utilitaires ─────────────────────────────────────────────────────

/** Retourne la position réelle d'un beat en % (milieu du chapitre qui le contient) */
export function getBeatActualPercent(beatId) {
  const total = chaptersDB.length;
  const ch = chaptersDB.find(c => c.beats.includes(beatId));
  if (!ch) return null;
  return ((ch.number - 1 + 0.5) / total) * 100;
}

/** Retourne la position en % d'un chapitre (milieu du chapitre) */
export function getChapterPercent(chapterNumber) {
  return ((chapterNumber - 1 + 0.5) / chaptersDB.length) * 100;
}

/** Génère les alertes en comparant positions réelles et idéales */
export function generateAlerts() {
  const alerts = [];

  for (const beat of BEATS) {
    const ch = chaptersDB.find(c => c.beats.includes(beat.id));

    if (!ch) {
      if (beat.alertMessages.missing) {
        alerts.push({ type: 'missing', severity: 'warning', beat, message: beat.alertMessages.missing });
      }
      continue;
    }

    const actualPct = getBeatActualPercent(beat.id);
    const diff = actualPct - beat.idealPercent;

    if (Math.abs(diff) > beat.tolerance) {
      const direction = diff > 0 ? 'tard' : 'tôt';
      const severity = Math.abs(diff) > beat.tolerance * 2 ? 'critical' : 'warning';
      const rawMsg = diff > 0 ? beat.alertMessages.too_late : beat.alertMessages.too_early;
      const message = rawMsg
        || `"${beat.label}" arrive trop ${direction} (${Math.round(actualPct)}% au lieu de ${beat.idealPercent}%).`;

      alerts.push({
        type: 'position',
        severity,
        beat,
        actualPct: Math.round(actualPct * 10) / 10,
        idealPct: beat.idealPercent,
        diff: Math.round(diff * 10) / 10,
        direction,
        chapterTitle: ch.title,
        message,
      });
    }
  }

  return alerts;
}
