# Le seed LOTR comme contrat de données

> Maîtriser le seed LOTR comme contrat de données partagé

- **Niveau** : non précisé
- **Prérequis** : Aucun
- **Références** : —

<!-- Cours généré par le Mode Mentor (posture onboarding). Régénéré à chaque (re)génération du parcours. -->

## 1. Rappel — le pipeline d'import IA d'un manuscrit

À la fin de ce chapitre, tu sauras retracer le chemin exact que suit le JSON généré par une IA, depuis le prompt jusqu'à la base de données, et nommer la fonction pivot qui insère les données.

Pourquoi ce rappel avant de parler du seed LOTR ? Parce que le seed LOTR emprunte plus loin dans ce cours EXACTEMENT le même chemin final que l'import d'un manuscrit réel. Comprendre ce chemin est le prérequis pour comprendre pourquoi le seed LOTR compte autant.

Le flux, tel qu'il existe dans le code :
1. `src/data/analysis_prompt.js` décrit le format JSON attendu (characters, locations, objects, timelineDB, plantsDB…) — c'est le contrat que l'utilisateur colle dans ChatGPT, Gemini ou Claude.
2. L'utilisateur récupère un fichier `.json` (ou un texte brut avec un bloc ```json```) et le donne à Atlas Narratif.
3. `src/db/importFromAiOutput.js` lit ce fichier, le parse, puis garantit que toutes les clés existent même si l'IA en a oublié :

```js
data.groupsDB   ??= [];
data.plantsDB   ??= [];
data.threadsDB  ??= [];
```

4. Il extrait ensuite les champs additionnels de chaque événement (`beatId`, `povCharacterId`…) vers un objet `eventExtrasDB`, puis appelle une fonction unique pour tout insérer en base : `seedProject(db, meta, data)`.

Cette fonction `seedProject` (définie dans `src/db/seed.generic.js`) est le point de passage obligé — retiens bien son nom, elle revient au chapitre suivant.

**Checkpoint — Exercice**

Que se passe-t-il si le JSON généré par l'IA ne contient pas la clé `groupsDB` (par exemple parce que l'IA a oublié cette partie du prompt) ?

<details>
<summary>Voir le corrigé</summary>

Le programme ne plante pas : `importFromAiOutput.js` applique `data.groupsDB ??= []` (et la même chose pour `loreDB`, `plantsDB`, `threadsDB`, `heroJourneyDB`…) avant d'appeler `seedProject()`. L'absence d'une clé optionnelle est donc comblée par un tableau ou objet vide. Le programme ne plante que si le JSON lui-même est invalide (échec de `JSON.parse`) ou si la racine n'est pas un objet.

</details>

## 2. Le seed LOTR : une démo, ou bien plus que ça ?

À la fin de ce chapitre, tu sauras expliquer pourquoi `seed.lotr.js` et `importFromAiOutput.js` convergent vers la même fonction, et ce que cette convergence implique pour la fiabilité de l'application.

On pourrait croire que le seed LOTR est juste un joli jeu de données de démonstration, séparé du reste. C'est faux, et c'est l'idée la plus importante de ce cours : regarde le code de `src/db/seed.lotr.js`.

```js
import { seedProject } from './seed.generic';

export async function seedLotr(db, { onProgress, lang = 'fr' } = {}) {
  const mapImage = await fetchMapImageBase64();
  const { meta, data } = translateSeedData({ ...META, mapImage }, DATA, lang);
  await seedProject(db, meta, data, { onProgress });
}
```

C'est LA MÊME fonction `seedProject()` que celle utilisée par `importFromAiOutput.js` au chapitre précédent. Autrement dit : les données LOTR (écrites à la main par l'équipe, pour la démo) et les données d'un vrai manuscrit (générées par une IA à partir du texte d'un auteur) empruntent rigoureusement la même porte d'entrée en base de données.

Conséquence concrète : si un champ ou une table n'est pas géré dans `seed.generic.js`, ce n'est pas seulement le seed LOTR qui aura un problème — c'est TOUT projet réel importé qui perdra silencieusement cette donnée. Le seed LOTR fonctionne donc comme un test d'intégration vivant du contrat de données partagé, pas comme une simple vitrine.

**Checkpoint — Quiz**

Une nouvelle recrue affirme : « le seed LOTR est un cas spécial, il a forcément son propre code d'insertion en base, différent de celui utilisé pour importer un manuscrit réel. » Qu'est-ce qui cloche dans cette affirmation, d'après le code de `seed.lotr.js` ?

A. Rien ne cloche : `seed.lotr.js` réimplémente ses propres requêtes SQL, indépendamment de l'import IA
B. L'affirmation est fausse : `seed.lotr.js` appelle `seedProject()` importé de `seed.generic.js`, exactement la fonction utilisée par `importFromAiOutput.js`
C. L'affirmation est fausse : c'est `applySchema()` qui gère l'insertion, pas `seedProject()`
D. L'affirmation est vraie seulement pour le Tome 1 ; les Tomes 2 et 3 utilisent un code d'insertion séparé

<details>
<summary>Voir le corrigé</summary>

**Réponse : B**

- **A.** Faux — en réalité `seed.lotr.js` ne contient aucune requête SQL propre : il se contente d'appeler `seedProject()`, la même fonction générique partagée avec l'import IA. Croire que le seed LOTR a son propre pipeline d'insertion est la méprise centrale à éviter.
- **B.** Exact : `import { seedProject } from './seed.generic'` puis `await seedProject(db, meta, data, { onProgress })` — c'est la fonction unique qui insère aussi bien les données LOTR que celles d'un manuscrit importé par IA.
- **C.** `applySchema()` gère les migrations de structure de tables (colonnes, index), pas l'insertion des lignes de données — ce rôle est celui de `seedProject()`. Confondre les deux mène à chercher au mauvais endroit quand une donnée n'apparaît pas.
- **D.** Aucun découpage par tome n'existe dans le code d'insertion : `seedProject()` reçoit un seul objet `data` fusionné (T1+T2+T3) et l'insère en une seule passe, quel que soit le nombre de tomes.

</details>

## 3. Anatomie des fichiers : T1, T2, T3 et la fusion

À la fin de ce chapitre, tu sauras localiser où ajouter une donnée pour un tome donné, et comprendre qui, dans le code, a la responsabilité d'assembler les trois tomes en un seul projet.

Le seed LOTR est réparti sur quatre fichiers, chacun avec un rôle précis :
- `src/data/lotr_seed_data.js` — Tome 1 (La Communauté de l'Anneau) : personnages, lieux, timeline, chapitres STC, trajets carte. Exemple réel, le personnage Frodo :

```js
export const loreDB = {
  characters: [
    {
      id: 'char_frodo',
      name: 'Frodo Sacquet',
      aliases: ['Le Porteur', 'Monsieur Frodo'],
      race: 'Hobbit',
      role: "Porteur de l'Anneau",
      affiliation: ["La Communauté de l'Anneau"],
      journeyKey: 'frodo',
    },
    // ...
  ],
};
```

- `src/data/lotr_t2_seed_data.js` — Tome 2 (Les Deux Tours), exporté sous des noms préfixés `t2*` (`t2Characters`, `t2TimelineDB`, `t2GroupsDB`…).
- `src/data/lotr_t3_seed_data.js` — Tome 3 (Le Retour du Roi), même logique avec le préfixe `t3*`.
- `src/db/seed.lotr.js` — le SEUL fichier qui importe les trois et les fusionne.

Point important : les événements et chapitres du Tome 1 n'ont, à l'origine, aucun `volumeId` (ce concept de tome a été ajouté après coup). C'est `seed.lotr.js` qui le leur attribue au moment de la fusion :

```js
timelineDB: [
  ...timelineDB.map(e => ({ ...e, volumeId: 'vol_communaute' })),
  ...t2TimelineDB,
  ...t3TimelineDB,
],
```

Les événements T2 et T3, eux, portent déjà leur `volumeId` nativement dans leur fichier source. Cette asymétrie est un détail d'histoire du code, pas une règle à reproduire : pour un Tome 4, il faudrait dupliquer le patron `t2*`/`t3*` (avec `volumeId` déjà présent dans les données) plutôt que celui de T1.

**Checkpoint — Quiz**

Dans `seed.lotr.js`, comment les événements du Tome 1 reçoivent-ils leur `volumeId` alors que `lotr_seed_data.js` n'en définit aucun ?

A. `seed.lotr.js` les mappe explicitement avec `timelineDB.map(e => ({ ...e, volumeId: 'vol_communaute' }))` au moment de la fusion
B. Chaque événement T1 a en réalité un champ `volumeId` codé en dur dans `lotr_seed_data.js`, simplement non documenté
C. La base de données assigne un `volumeId` par défaut automatiquement à l'insertion si la colonne est vide
D. `seedProject()` déduit le `volumeId` à partir du numéro de chapitre grâce à une règle de calcul

<details>
<summary>Voir le corrigé</summary>

**Réponse : A**

- **A.** Exact — c'est une transformation explicite faite en JavaScript au moment de la fusion, pas une propriété portée par la donnée source ni par la base.
- **B.** Non : `lotr_seed_data.js` ne contient aucun champ `volumeId` sur ses événements — c'est justement ce vide que `seed.lotr.js` comble via `.map()`. Croire que la donnée source « sait » déjà tout mène à chercher au mauvais fichier en cas de bug.
- **C.** La base de données (`INSERT INTO timeline_events`) ne fait aucune inférence : la colonne `volume_id` reçoit exactement ce qui lui est passé en paramètre, ici `evt.volumeId ?? null` dans `seed.generic.js`. Sans le `.map()` de `seed.lotr.js`, elle recevrait `null`.
- **D.** Il n'existe aucune heuristique de ce type dans le code : `seedProject()` insère tel quel le `volumeId` fourni dans l'objet événement, sans aucun calcul basé sur le chapitre.

</details>

## 4. Les données cross-tomes : quand une amorce traverse les livres

À la fin de ce chapitre, tu sauras lire un plant/payoff cross-tome et comprendre pourquoi le seed LOTR illustre volontairement des cas limites plutôt que des cas simples.

Un plant (amorce) posé au Tome 1 peut n'être payé (résolu) qu'au Tome 2, voire jamais dans les tomes déjà écrits. C'est exactement ce que `t2PlantsDB`, dans `lotr_t2_seed_data.js`, illustre avec de vraies données :

```js
{
  id: 'plant_t2_01',
  label: "Gollum annoncé par Gandalf en T1, guide en T2",
  type: 'character',
  plant_chapter_num: 2,
  plant_event_id: 'evt_004',
  payoff_chapter_num: 10,
  payoff_event_id: 'evt_t2_01',
  entity_id: 'char_gollum',
  status: 'resolved',
  plantVolumeId: 'vol_communaute',
  payoffVolumeId: 'vol_deux_tours',
}
```

Ce seul objet teste : un plant posé dans un tome et payé dans un autre, deux tables de chapitres différentes (`plant_chapter_num` en T1 vs T2 utilisent la même numérotation locale au tome), et deux `volumeId` distincts sur une même ligne. Un autre plant du même fichier, la Phiale de Galadriel, a un `payoffVolumeId: null` — parce que sa résolution n'arrivera qu'au Tome 3, pas encore seedé à ce stade du Tome 2.

Autre subtilité visible dans `seed.generic.js` : les données sources peuvent utiliser des mots français libres (`type: 'objet'`, `status: 'résolu'`) que le seeder normalise vers les valeurs attendues en base :

```js
const PLANT_TYPE_NORM = { objet: 'object', personnage: 'character', /* … */ };
const PLANT_STATUS_NORM = { closed: 'resolved', résolu: 'resolved', abandonné: 'dropped' };
```

Idée maîtresse : le seed LOTR ne cherche pas à être « propre » — il cherche à être représentatif des cas tordus (cross-tome, payoff absent, vocabulaire libre) car ce sont ces cas-là qui font apparaître les bugs dans les stores et les requêtes, pas les cas simples.

**Checkpoint — Quiz**

À quoi sert concrètement le fait qu'un plant ait un `plantVolumeId` et un `payoffVolumeId` différents, comme illustré par `plant_t2_01` (Gollum) ?

A. À marquer qu'une amorce posée dans un tome peut n'être payée (ou jamais payée) que dans un tome ultérieur — un cas que seul un jeu de données multi-tomes peut révéler
B. À indiquer dans quel tome le plant doit être supprimé automatiquement si le projet change de tome actif
C. Rien de narratif : c'est un champ purement technique qui ne sert qu'à filtrer l'affichage sans lien avec l'histoire
D. À remplacer le champ `status` ('open'/'resolved') — les deux champs feraient doublon

<details>
<summary>Voir le corrigé</summary>

**Réponse : A**

- **A.** Exact — `plant_t2_01` a `plantVolumeId: 'vol_communaute'` (posé au Tome 1) et `payoffVolumeId: 'vol_deux_tours'` (payé au Tome 2) : c'est précisément ce décalage entre tomes que ces deux champs distincts permettent de représenter.
- **B.** Aucune logique de suppression automatique n'existe dans `seed.generic.js` ni dans les stores : les deux champs sont de simples colonnes conservées telles quelles, jamais utilisées pour déclencher une suppression.
- **C.** C'est l'inverse : ces deux champs portent un sens narratif fort (où l'amorce est posée, où elle est payée) — les dévaluer en détail technique ferait perdre l'intérêt même de suivre les plants inter-tomes.
- **D.** Les deux champs coexistent et jouent des rôles différents : `status` dit si le plant est résolu ou non ; `plantVolumeId`/`payoffVolumeId` disent DANS QUEL TOME chaque étape a lieu. On peut avoir `status: 'open'` avec `payoffVolumeId: null` (Phiale de Galadriel), ce que `status` seul ne pourrait pas exprimer.

</details>

## 5. La règle : toute nouvelle fonctionnalité s'illustre dans LOTR

À la fin de ce chapitre, tu sauras appliquer la règle du projet qui impose d'illustrer toute nouvelle fonctionnalité dans le seed LOTR, et surtout pourquoi elle existe.

Le fichier `CLAUDE.md` du projet pose une règle explicite : « toute nouvelle fonctionnalité doit être illustrée dans le seed LOTR ». Concrètement :

| Si tu ajoutes… | Mets à jour… |
|---|---|
| Une nouvelle table SQL | `seed.generic.js` (nouveau bloc d'INSERT) + données dans le seed LOTR (T1, T2 ou T3) |
| Un nouveau champ dans une table existante | `seed.generic.js` (ajouter le champ dans l'INSERT concerné) + données exemple dans le seed LOTR |
| Un nouveau store Zustand | Des données représentatives dans le fichier seed du tome approprié |

Cette règle n'est pas arbitraire — elle découle directement de ce que tu as vu aux chapitres 1 et 2 : `seedProject()` (dans `seed.generic.js`) est la SEULE porte d'entrée en base, partagée par le seed LOTR ET par l'import d'un manuscrit réel via IA. Si tu ajoutes un champ au modèle de données mais que tu oublies de l'ajouter dans l'INSERT de `seed.generic.js`, ce champ sera silencieusement perdu — pas seulement pour la démo LOTR, mais pour CHAQUE utilisateur qui importera un vrai manuscrit contenant ce champ.

En forçant à illustrer la nouveauté avec de vraies données dans le seed LOTR, la règle agit comme un garde-fou de non-régression : si tu oublies de brancher le champ dans `seed.generic.js`, le seed LOTR ne l'affichera pas non plus, et ce manque devient visible immédiatement en testant l'appli — au lieu de rester un bug latent découvert plus tard par un vrai utilisateur.

**Checkpoint — Quiz**

Tu ajoutes un champ `weather` (JSONB) à la table `timeline_events`. D'après la règle du projet et ce que tu as appris aux chapitres précédents, que dois-tu impérativement faire avant de considérer la tâche terminée ?

A. Ajouter `weather` dans l'INSERT de `seed.generic.js` (table `timeline_events`) ET des données d'exemple dans le seed LOTR
B. Modifier uniquement le composant qui affiche l'événement — la donnée suivra automatiquement puisqu'elle existe déjà dans le JSON de l'IA
C. Ajouter le champ uniquement dans `lotr_seed_data.js` ; `seed.generic.js` n'a pas besoin de changer puisque la colonne existe déjà en base
D. Rien de spécial si le champ est optionnel avec une valeur par défaut — les champs optionnels n'ont pas besoin d'être illustrés

<details>
<summary>Voir le corrigé</summary>

**Réponse : A**

- **A.** Exact — sans cette double mise à jour, `seedProject()` ignorera silencieusement `weather` aussi bien pour le seed LOTR que pour tout manuscrit réel importé, exactement comme vu aux chapitres 1 et 2.
- **B.** Faux : l'INSERT SQL dans `seed.generic.js` ne lit que les champs qu'on lui indique explicitement (ex. `ex.beatId ?? null`) — un champ absent de cette liste n'est jamais inséré, même s'il existe dans l'objet JS source ou dans le JSON de l'IA.
- **C.** Faux : la colonne SQL peut exister sans que l'INSERT de `seed.generic.js` la référence — dans ce cas la valeur ne part jamais en base, quelle que soit la donnée source.
- **D.** C'est justement la méprise que la règle vise à éviter : un champ optionnel non illustré reste invisible en test et peut cacher un bug d'INSERT pendant longtemps avant qu'un vrai utilisateur ne le découvre.

</details>

## 6. Révision — le seed LOTR de bout en bout

À la fin de ce chapitre, tu sauras relier entre elles les cinq idées vues jusqu'ici sans relire le cours — c'est le but de ce chapitre de révision : te re-tester plutôt que relire.

Avant de répondre au quiz ci-dessous, essaie de répondre mentalement, dans le désordre, à ces rappels express :
- Quelle fonction unique insère en base aussi bien les données LOTR que celles d'un manuscrit importé par IA ? (chapitre 2)
- Quel fichier attribue le `volumeId` aux événements du Tome 1, puisque leur fichier source n'en a pas ? (chapitre 3)
- Que garantit `data.groupsDB ??= []` dans `importFromAiOutput.js` ? (chapitre 1)
- À quoi sert un `payoffVolumeId` différent du `plantVolumeId` sur un même plant ? (chapitre 4)
- Que risques-tu si tu ajoutes un champ à une table sans l'ajouter à l'INSERT de `seed.generic.js` ni au seed LOTR ? (chapitre 5)

Le fil conducteur de tout le cours : `seedProject()` est le contrat unique entre données fictives (LOTR) et données réelles (import IA). Le seed LOTR n'est donc pas une simple vitrine — c'est le test vivant de ce contrat, et c'est pour ça que toute nouvelle fonctionnalité doit s'y illustrer.

**Checkpoint — Quiz**

Parmi ces quatre affirmations sur le seed LOTR, laquelle est correcte ?

A. `importFromAiOutput.js` et `seed.lotr.js` appellent tous deux `seedProject()` de `seed.generic.js` pour insérer les données — un champ non géré dans cet INSERT est donc perdu aussi bien en démo qu'en import réel
B. `lotr_seed_data.js` (Tome 1) contient déjà le `volumeId` de chaque événement, simplement copié tel quel en base par `seedProject()`
C. `plantVolumeId` et `payoffVolumeId` ne servent qu'à l'affichage visuel et n'ont aucun rôle narratif propre
D. Une nouvelle colonne optionnelle ajoutée à une table existante n'a pas besoin d'être illustrée dans le seed LOTR puisqu'elle a une valeur par défaut

<details>
<summary>Voir le corrigé</summary>

**Réponse : A**

- **A.** Exact — c'est le fil conducteur de tout le cours : une seule fonction partagée (`seedProject`), donc un seul contrat de données à respecter pour la démo comme pour les vrais imports (chapitres 1, 2 et 5).
- **B.** Faux — vu au chapitre 3 : `lotr_seed_data.js` ne porte aucun `volumeId` ; c'est `seed.lotr.js` qui l'attribue explicitement via `.map(e => ({ ...e, volumeId: 'vol_communaute' }))` au moment de la fusion des tomes.
- **C.** Faux — vu au chapitre 4 : l'exemple `plant_t2_01` montre que ces deux champs encodent un fait narratif réel (une amorce posée dans un tome, payée dans un autre), pas un simple détail d'affichage.
- **D.** Faux — vu au chapitre 5 : la règle du projet impose justement d'illustrer tout nouveau champ, optionnel ou non, car un champ non branché dans l'INSERT de `seed.generic.js` reste invisible et silencieusement perdu pour tous les utilisateurs.

</details>
