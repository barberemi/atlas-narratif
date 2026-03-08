# Guide d'ajout de contenu — AtlasNarratif

> Généré le 2026-03-19

Ce guide explique comment modifier les données statiques du projet. Toutes les données sont dans `src/data/`. Aucun backend n'est impliqué.

---

## 1. Ajouter un nouveau chapitre dans la timeline

**Fichier à modifier** : `/home/rbarbe/Sites/atlas-narratif/src/data/timeline_database.js`

Ajouter un ou plusieurs objets dans le tableau `timelineDB`. Chaque objet est un événement.

```js
// Exemple : ajouter deux événements dans un nouveau chapitre 10
{
  id: 'evt_027',               // Identifiant unique, incrémentiel
  chapter: 10,                 // Numéro du chapitre
  chapterTitle: "Titre du chapitre 10",
  title: "Titre court de l'événement",
  description: "Ce qui se passe dans cet événement.",
  locationId: 'loc_rivendell', // ID d'un lieu existant dans loreDB.locations (optionnel)
  entities: [
    { id: 'char_frodo',   entityType: 'character' },
    { id: 'loc_rivendell', entityType: 'location' },
    { id: 'obj_one_ring', entityType: 'object' },
  ],
  // incoherenceIds: ['inc_001'], // optionnel, si cet événement est lié à une incohérence
},
```

**Règles** :
- Les chapitres sont construits dynamiquement par `getChapters()` — il suffit d'utiliser un `chapter` non encore utilisé pour qu'une nouvelle colonne apparaisse dans la timeline.
- `locationId` doit pointer vers un `id` existant dans `loreDB.locations`. S'il est absent de `loreDB`, la détection de conflits de présence simultanée sera incomplète pour cet événement.
- Les `id` dans `entities` doivent exister dans `loreDB` (personnages, lieux, ou objets) pour que les chips et les liens de navigation fonctionnent.

---

## 2. Ajouter un personnage dans le lore

**Fichier à modifier** : `/home/rbarbe/Sites/atlas-narratif/src/data/lore_database.js`

Ajouter un objet dans `loreDB.characters[]`.

```js
{
  id: 'char_tauriel',                   // Unique, préfixe char_
  name: 'Tauriel',
  aliases: ['Capitaine des Gardes'],
  race: 'Elfe (Sylvestre)',
  role: 'Capitaine de la garde de Thranduil',
  origin: 'Forêt Noire — Royaume de Thranduil',  // Texte libre, mis en correspondance avec loreDB.locations[].name
  affiliation: ['Forêt Noire'],
  description: 'Description narrative du personnage.',
  traits: ['Courageuse', 'Rebelle', 'Experte en archerie'],
  color: '#06B6D4',       // Couleur hexadécimale unique — apparaît partout dans l'UI
  journeyKey: null,       // null si pas de fichier de voyage associé
},
```

**Pour que le personnage apparaisse dans les lieux** : ajouter l'entrée dans `visitedBy` des lieux qu'il a visités :

```js
// Dans loreDB.locations, dans le lieu concerné :
visitedBy: [
  // ... entrées existantes ...
  { id: 'char_tauriel', name: 'Tauriel', color: '#06B6D4' },
],
```

**Pour que le graphe le relie à d'autres personnages** : les liens `fellowship`/`ally` sont calculés automatiquement depuis `affiliation`. Si le personnage partage une affiliation avec d'autres, un lien apparaîtra dans le graphe.

---

## 3. Ajouter un lieu dans le lore

**Fichier à modifier** : `/home/rbarbe/Sites/atlas-narratif/src/data/lore_database.js`

Ajouter un objet dans `loreDB.locations[]`.

```js
{
  id: 'loc_erebor',                   // Unique, préfixe loc_
  name: 'Erebor',
  type: 'Montagne',                   // Catégorie libre
  regime: 'Royaume des Nains (Thorin Écu-de-Chêne)',
  description: 'La Montagne Solitaire, ancien grand royaume nain repris aux dragons.',
  coordinates: { x: 78, y: 18 },     // Position en % sur l'image ouest_terre_du_milieu.jpg (0–100)
  inhabitants: ['Nains de Durin'],
  keyPlaces: ['La Grande Salle', 'Le Lac de Feu'],
  visitedBy: [
    { id: 'char_gimli', name: 'Gimli', color: '#D97706' },
  ],
},
```

**Coordonnées** : les valeurs `x` et `y` sont des pourcentages sur l'image de fond de la carte (`src/assets/ouest_terre_du_milieu.jpg`). Ajuster visuellement en démarrant le projet (`npm run dev`) et en testant.

**Conséquences automatiques** : une fois le lieu ajouté, les personnages dont `origin` contient le nom du lieu seront automatiquement liés à lui dans le graphe (via `buildGraph`).

---

## 4. Ajouter un objet dans le lore

**Fichier à modifier** : `/home/rbarbe/Sites/atlas-narratif/src/data/lore_database.js`

Ajouter un objet dans `loreDB.objects[]`.

```js
{
  id: 'obj_glamdring',            // Unique, préfixe obj_
  name: 'Glamdring',
  type: 'Épée elfique',
  creator: 'Elfes de Gondolin',
  createdIn: 'Gondolin',          // Texte libre, mis en correspondance avec loreDB.locations[].name
  description: "L'Épée ennemie, lame du roi Turgon de Gondolin.",
  powers: ['Brille en présence d\'Orques', 'Résistance surnaturelle'],
  currentHolder: 'Gandalf le Gris',  // Texte libre, mis en correspondance avec loreDB.characters[].name
  holders: [
    { id: 'char_gandalf', name: 'Gandalf le Gris', color: '#F59E0B' },
  ],
},
```

**Relations automatiques** :
- `currentHolder` est mis en correspondance textuelle avec `loreDB.characters[].name` pour créer l'arête `held_by` dans le graphe.
- `creator` est mis en correspondance avec `loreDB.characters[].name` pour créer l'arête `created_by`.
- `createdIn` est mis en correspondance avec `loreDB.locations[].name` pour créer l'arête `created_in`.

---

## 5. Ajouter une incohérence

**Fichier à modifier** : `/home/rbarbe/Sites/atlas-narratif/src/data/incoherences_database.js`

Ajouter un objet dans `incoherencesDB[]`.

```js
{
  id: 'inc_009',                          // Unique, incrémentiel
  type: 'Entité Non Référencée',          // Choisir parmi les types existants ou créer un nouveau
  severity: 'medium',                     // 'critical' | 'high' | 'medium' | 'low'
  title: "Titre court décrivant l'incohérence",
  explanation:
    "Explication détaillée, factuelle, décrivant pourquoi c'est une incohérence et quelles données sont en contradiction.",
  links: [
    { label: 'Nom affiché',    entityId: 'char_gimli',    entityType: 'character' },
    { label: 'Erebor',         entityId: 'loc_erebor',    entityType: 'location'  },
    { label: 'Hache de Gimli', entityId: 'obj_gimli_axe', entityType: 'object'    },
  ],
},
```

**Types existants** : `'Contradiction Temporelle'`, `'Entité Non Référencée'`, `'Incohérence de Porteur'`, `'Téléportation de Personnage'`, `'Créateur Non Référencé'`, `"Lieu d'Origine Inexistant"`, `'Affiliation Fantôme'`, `'Objet sans Lieu de Création'`.

**Conséquences** :
- L'incohérence apparaîtra dans `IncoherencesBrowser` et dans le tableau de bord.
- Les entités listées dans `links` afficheront un badge d'avertissement dans `LoreBrowser` et un halo dans `EntityGraph`.
- Si l'`entityId` d'un lien ne correspond à aucune entité dans `loreDB`, le chip sera grisé et non cliquable (comportement normal — c'est souvent le cas pour les entités "manquantes").

**Lier une incohérence à un événement de timeline** : ajouter l'`id` de l'incohérence dans `incoherenceIds` de l'événement concerné dans `timeline_database.js` :

```js
// Dans timelineDB, dans l'événement concerné :
incoherenceIds: ['inc_009'],
```

---

## 6. Modifier les chapitres Save the Cat

**Fichier à modifier** : `/home/rbarbe/Sites/atlas-narratif/src/data/save_the_cat_database.js`

### Ajouter un chapitre

Ajouter un objet dans `chaptersDB[]` :

```js
{
  id: 'ch10',
  number: 10,
  title: "Titre du chapitre 10",
  summary: "Résumé de ce qui se passe dans ce chapitre.",
  beats: ['all_is_lost', 'dark_night'],  // IDs des beats couverts
},
```

Les beats disponibles sont les 15 ids dans `BEATS[]` : `opening_image`, `theme_stated`, `setup`, `catalyst`, `debate`, `break_into_two`, `b_story`, `fun_and_games`, `midpoint`, `bad_guys`, `all_is_lost`, `dark_night`, `break_into_three`, `finale`, `final_image`.

### Modifier un chapitre existant

Localiser le chapitre par son `id` ou `number` dans `chaptersDB[]` et modifier les champs `title`, `summary` ou `beats`.

**Règle** : un beat ne doit apparaître que dans **un seul** chapitre. S'il est dans plusieurs, `getBeatActualPercent` retournera la position du premier chapitre trouvé (comportement du `.find()`).

### Modifier les paramètres d'un beat

Les beats sont définis dans `BEATS[]`. Modifier `idealPercent` ou `tolerance` pour ajuster les seuils d'alerte.

**Ne pas modifier `id` ou `number`** sans mettre à jour toutes les références dans `chaptersDB[].beats`.

---

## 7. Ajouter une nouvelle route / page

**Étapes** :

1. **Créer le composant** dans `src/components/<dossier>/MonComposant.jsx`.

2. **Déclarer la route** dans `src/App.jsx`, dans le bloc `<Routes>` :

```jsx
import MonComposant from './components/<dossier>/MonComposant';

// Dans <Routes> :
<Route path="/ma-route" element={<MonComposant />} />
```

3. **Ajouter l'entrée de navigation** dans le tableau `NAV_ITEMS` de `src/App.jsx` :

```js
const NAV_ITEMS = [
  // ... entrées existantes ...
  { path: '/ma-route', label: 'Mon Label', icon: '🔍' },
];
```

**Convention de layout** : pour être cohérent avec les autres vues, le composant doit avoir `h-full w-full flex flex-col bg-[#0B1621] text-slate-200` sur son élément racine. Le header interne suit le pattern :

```jsx
<header className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
  <div className="text-center flex-1">
    <h1 className="text-lg font-black tracking-tight">
      Titre <span style={{ color: '#3F51B5' }}>Coloré</span>
    </h1>
    <p className="text-xs text-slate-500 font-serif italic">Sous-titre</p>
  </div>
</header>
```

**Accès aux données** : importer directement depuis `src/data/` :

```js
import { loreDB } from '../../data/lore_database';
import { timelineDB } from '../../data/timeline_database';
```

**Scroll horizontal avec drag** : si la vue contient un carrousel horizontal, utiliser `useDragScroll` :

```js
import { useDragScroll } from '../../hooks/useDragScroll';

const dragScroll = useDragScroll();
// Puis sur le conteneur :
// ref={dragScroll.ref}
// onMouseDown={dragScroll.onMouseDown}
// onMouseMove={dragScroll.onMouseMove}
// onMouseUp={dragScroll.onMouseUp}
// onMouseLeave={dragScroll.onMouseLeave}
```
