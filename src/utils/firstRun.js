/**
 * firstRun — logique pure de la checklist « premières minutes ».
 *
 * Le point 8 de la revue produit : dé-frictionner le cold-start d'un auteur qui
 * part d'un projet vide. La checklist se dérive UNIQUEMENT des données réelles
 * (pas de state persisté) : chaque étape se coche seule dès que la donnée existe,
 * et la checklist disparaît une fois le récit amorcé.
 *
 * Ce module ne dépend d'aucun store ni de React → testable en isolation.
 */

/** Nombre de personnages visé par l'étape « peupler le récit ». */
export const FIRST_RUN_CHAR_TARGET = 3;

/** Seuils au-delà desquels le projet n'est plus « quasi vide » (projet mûr / démo). */
const NASCENT_MAX_CHARACTERS = 5;
const NASCENT_MAX_EVENTS     = 5;

/**
 * Calcule l'état des 3 étapes d'amorçage à partir des données du projet.
 * @param {{ description?: string|null, charactersCount?: number, eventsCount?: number }} input
 * @returns {{ steps: Array, doneCount: number, total: number, complete: boolean }}
 */
export function computeFirstRun({ description, charactersCount = 0, eventsCount = 0 } = {}) {
  const hasLogline = !!(description && description.trim());
  const steps = [
    { id: 'logline',    done: hasLogline },
    { id: 'characters', done: charactersCount >= FIRST_RUN_CHAR_TARGET, count: charactersCount, target: FIRST_RUN_CHAR_TARGET },
    { id: 'scene',      done: eventsCount >= 1, count: eventsCount },
  ];
  const doneCount = steps.filter(s => s.done).length;
  return { steps, doneCount, total: steps.length, complete: doneCount === steps.length };
}

/**
 * Faut-il afficher la checklist ? Oui tant que le projet est « quasi vide » ET
 * que les 3 étapes ne sont pas toutes franchies. On la masque dès que le projet
 * grossit (auteur lancé, ou démo LOTR pleine de données).
 * @param {{ description?: string|null, charactersCount?: number, eventsCount?: number }} input
 * @returns {boolean}
 */
export function shouldShowFirstRun({ description, charactersCount = 0, eventsCount = 0 } = {}) {
  const { complete } = computeFirstRun({ description, charactersCount, eventsCount });
  if (complete) return false;
  return charactersCount < NASCENT_MAX_CHARACTERS && eventsCount < NASCENT_MAX_EVENTS;
}
