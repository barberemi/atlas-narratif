# Modèle de données — AtlasNarratif

> Généré le 2026-03-19

Toutes les données sont statiques, déclarées dans `src/data/`. Aucune persistance côté serveur.

---

## 1. `lore_database.js` — Base de lore

Exporte l'objet `loreDB` avec trois collections : `characters`, `locations`, `objects`.

### 1.1 Personnage (`loreDB.characters[]`)

| Champ         | Type              | Obligatoire | Description |
|---------------|-------------------|-------------|-------------|
| `id`          | `string`          | oui         | Identifiant unique, préfixe `char_` (ex : `char_frodo`) |
| `name`        | `string`          | oui         | Nom complet |
| `aliases`     | `string[]`        | oui         | Liste de surnoms/alias |
| `race`        | `string`          | oui         | Race du personnage (ex : `'Hobbit'`, `'Maia (Istari)'`) |
| `role`        | `string`          | oui         | Rôle narratif |
| `origin`      | `string`          | oui         | Description textuelle du lieu d'origine (ex : `'La Comté — Cul-de-Sac'`) |
| `affiliation` | `string[]`        | oui         | Groupes d'appartenance (ex : `["La Communauté de l'Anneau"]`) |
| `description` | `string`          | oui         | Paragraphe de description |
| `traits`      | `string[]`        | oui         | Liste de traits de caractère |
| `color`       | `string`          | oui         | Couleur hexadécimale associée (ex : `'#10B981'`) — utilisée partout dans l'UI |
| `journeyKey`  | `string \| null`  | oui         | Clé du fichier de voyage correspondant (`'frodo'`, `'aragorn'`, `'gandalf'`) ou `null` |

**Relations** : le champ `origin` est mis en correspondance textuellement avec `loreDB.locations[].name` par `buildGraph.js` (fonction `nameIncludes`). Le champ `affiliation` permet de déduire les liens de type `fellowship` ou `ally`.

### 1.2 Lieu (`loreDB.locations[]`)

| Champ         | Type       | Obligatoire | Description |
|---------------|------------|-------------|-------------|
| `id`          | `string`   | oui         | Identifiant unique, préfixe `loc_` (ex : `loc_rivendell`) |
| `name`        | `string`   | oui         | Nom du lieu |
| `type`        | `string`   | oui         | Catégorie (ex : `'Cité elfique'`, `'Forteresse'`, `'Passage géographique'`) |
| `regime`      | `string`   | oui         | Régime politique ou statut (ex : `'Seigneurie Elfe (Elrond)'`) |
| `description` | `string`   | oui         | Description narrative |
| `coordinates` | `{ x: number, y: number }` | oui | Coordonnées en % sur l'image de carte (0–100) |
| `inhabitants` | `string[]` | oui         | Liste des peuples/entités habitant le lieu |
| `keyPlaces`   | `string[]` | oui         | Sous-lieux importants |
| `visitedBy`   | `{ id: string, name: string, color: string }[]` | oui | Personnages ayant visité le lieu — tableau d'objets avec `id`, `name`, `color` |

**Relations** : `visitedBy` lie un lieu à des personnages via leurs `id`. Utilisé par `buildGraph.js` pour créer des arêtes `visited_by`.

### 1.3 Objet (`loreDB.objects[]`)

| Champ            | Type       | Obligatoire | Description |
|------------------|------------|-------------|-------------|
| `id`             | `string`   | oui         | Identifiant unique, préfixe `obj_` (ex : `obj_one_ring`) |
| `name`           | `string`   | oui         | Nom de l'objet |
| `type`           | `string`   | oui         | Catégorie (ex : `'Artefact maléfique'`, `'Épée légendaire'`) |
| `creator`        | `string`   | oui         | Créateur en texte libre (ex : `'Sauron'`) |
| `createdIn`      | `string`   | oui         | Lieu de création en texte libre (ex : `'Fondcombe — lors du Conseil d\'Elrond'`) |
| `description`    | `string`   | oui         | Description narrative |
| `powers`         | `string[]` | oui         | Liste des pouvoirs/propriétés |
| `currentHolder`  | `string`   | oui         | Porteur actuel en texte libre |
| `inscription`    | `string`   | non         | Inscription gravée sur l'objet (optionnel) |
| `holders`        | `{ id: string, name: string, color: string }[]` | oui | Tous les porteurs connus (historique) |

**Relations** : `creator` et `currentHolder` sont mis en correspondance avec `loreDB.characters[].name` par `buildGraph.js`. `createdIn` est mis en correspondance avec `loreDB.locations[].name`.

### 1.4 Fonctions exportées

#### `findCharacterByAllyName(allyName: string): Character | undefined`

Recherche un personnage par un nom partiel (insensible à la casse, insensible aux accents, ignore les annotations entre parenthèses et les articles). Utilisée pour la navigation carte → lore browser.

```js
import { findCharacterByAllyName } from './data/lore_database';
const char = findCharacterByAllyName('Grands-Pas (Aragorn)');
// → retourne l'objet char_aragorn
```

---

## 2. `timeline_database.js` — Timeline narrative

Exporte le tableau `timelineDB` (liste d'événements).

### 2.1 Événement (`timelineDB[]`)

| Champ              | Type       | Obligatoire | Description |
|--------------------|------------|-------------|-------------|
| `id`               | `string`   | oui         | Identifiant unique, préfixe `evt_` (ex : `evt_001`) |
| `chapter`          | `number`   | oui         | Numéro du chapitre |
| `chapterTitle`     | `string`   | oui         | Titre du chapitre |
| `title`            | `string`   | oui         | Titre court de l'événement |
| `description`      | `string`   | oui         | Description de l'événement |
| `locationId`       | `string`   | non         | `id` du lieu où se déroule l'événement (référence `loreDB.locations`) |
| `entities`         | `{ id: string, entityType: 'character' \| 'location' \| 'object' }[]` | oui | Entités impliquées |
| `incoherenceIds`   | `string[]` | non         | Ids des incohérences liées à cet événement (référence `incoherencesDB`) |

**Attention** : certains `locationId` dans `timelineDB` pointent vers des ids inexistants dans `loreDB.locations` (ex : `loc_amon_hen`, `loc_anduin`) — cas à corriger ou à ajouter dans le lore.

### 2.2 Fonctions exportées

#### `getChapters(): { number: number, title: string }[]`

Retourne la liste des chapitres distincts triés par numéro, construite dynamiquement depuis `timelineDB`.

#### `getChapterEvents(chapterNumber: number): Event[]`

Retourne tous les événements d'un chapitre donné.

#### `getConflictDetails(eventId: string): { charIds: string[], otherEventTitle: string, otherLocationId: string }[]`

Pour un événement donné, retourne les détails des conflits de présence : quels personnages apparaissent aussi dans un autre lieu dans le même chapitre. Utilisé dans `TimelineBrowser` pour afficher le motif du conflit.

#### `detectConflicts(): Set<string>`

Détecte automatiquement les conflits de présence simultanée dans chaque chapitre. Un conflit est défini comme : un même personnage apparaissant dans deux événements du même chapitre avec des `locationId` différents. Retourne un `Set` des `eventId` en conflit.

---

## 3. `incoherences_database.js` — Incohérences narratives

Exporte le tableau `incoherencesDB` et des constantes de configuration.

### 3.1 Incohérence (`incoherencesDB[]`)

| Champ         | Type                                      | Obligatoire | Description |
|---------------|-------------------------------------------|-------------|-------------|
| `id`          | `string`                                  | oui         | Identifiant unique, préfixe `inc_` |
| `type`        | `string`                                  | oui         | Catégorie de l'incohérence. Valeurs possibles : `'Contradiction Temporelle'`, `'Entité Non Référencée'`, `'Incohérence de Porteur'`, `'Téléportation de Personnage'`, `'Créateur Non Référencé'`, `"Lieu d'Origine Inexistant"`, `'Affiliation Fantôme'`, `'Objet sans Lieu de Création'` |
| `severity`    | `'critical' \| 'high' \| 'medium' \| 'low'` | oui      | Sévérité |
| `title`       | `string`                                  | oui         | Titre court descriptif |
| `explanation` | `string`                                  | oui         | Explication détaillée de l'incohérence |
| `links`       | `{ label: string, entityId: string, entityType: 'character' \| 'location' \| 'object' }[]` | oui | Entités impliquées dans l'incohérence, avec leur label d'affichage |

### 3.2 Constantes exportées

#### `SEVERITY_CONFIG`

```js
export const SEVERITY_CONFIG = {
  critical: { label: 'Critique',  color: '#EF4444', bg: '...', border: '...' },
  high:     { label: 'Élevée',    color: '#F97316', bg: '...', border: '...' },
  medium:   { label: 'Moyenne',   color: '#F59E0B', bg: '...', border: '...' },
  low:      { label: 'Faible',    color: '#64748B', bg: '...', border: '...' },
};
```

Utilisé dans tous les composants affichant une sévérité pour uniformiser les couleurs.

#### `SEVERITY_ORDER`

```js
export const SEVERITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 };
```

Permet de trier les incohérences du plus critique au moins critique.

### 3.3 Fonctions exportées

#### `getEntityIncoherences(entityId: string): Incoherence[]`

Retourne toutes les incohérences dans lesquelles l'entité `entityId` est mentionnée dans `links`. Utilisé dans `LoreBrowser` (badges) et `EntityGraph` (halos et panneaux).

#### `getMaxSeverity(incs: Incoherence[]): 'critical' | 'high' | 'medium' | 'low' | null`

Retourne la sévérité la plus haute parmi une liste d'incohérences. Retourne `null` si la liste est vide.

---

## 4. `save_the_cat_database.js` — Structure narrative Save the Cat

Exporte `BEATS` (les 15 beats de la méthode) et `chaptersDB` (les chapitres de l'œuvre).

### 4.1 Beat (`BEATS[]`)

| Champ            | Type       | Obligatoire | Description |
|------------------|------------|-------------|-------------|
| `id`             | `string`   | oui         | Identifiant unique (ex : `'opening_image'`, `'catalyst'`, `'midpoint'`) |
| `number`         | `number`   | oui         | Numéro de 1 à 15 |
| `label`          | `string`   | oui         | Nom du beat (ex : `"Scène d'ouverture"`) |
| `description`    | `string`   | oui         | Description pédagogique du beat |
| `idealPercent`   | `number`   | oui         | Position idéale dans l'œuvre en % (0–100) |
| `tolerance`      | `number`   | oui         | Marge d'erreur acceptable en points de % |
| `color`          | `string`   | oui         | Couleur hexadécimale pour l'affichage dans la frise |
| `alertMessages`  | `{ too_early: string \| null, too_late: string \| null, missing: string \| null }` | oui | Messages d'alerte selon la situation |

Les 15 beats dans l'ordre : `opening_image` (1%), `theme_stated` (5%), `setup` (7%), `catalyst` (10%), `debate` (18%), `break_into_two` (25%), `b_story` (30%), `fun_and_games` (37%), `midpoint` (50%), `bad_guys` (63%), `all_is_lost` (75%), `dark_night` (78%), `break_into_three` (80%), `finale` (90%), `final_image` (99%).

### 4.2 Chapitre Save the Cat (`chaptersDB[]`)

| Champ     | Type       | Obligatoire | Description |
|-----------|------------|-------------|-------------|
| `id`      | `string`   | oui         | Identifiant unique (ex : `'ch1'`) |
| `number`  | `number`   | oui         | Numéro de chapitre (1, 2, 3…) |
| `title`   | `string`   | oui         | Titre du chapitre |
| `summary` | `string`   | oui         | Résumé court de ce qui se passe dans le chapitre |
| `beats`   | `string[]` | oui         | Liste des ids de beats couverts par ce chapitre (référence `BEATS[].id`) |

**Note** : chaque beat ne peut être assigné qu'à un seul chapitre. Un beat absent de tous les chapitres génère une alerte `missing`.

### 4.3 Fonctions exportées

#### `getBeatActualPercent(beatId: string): number | null`

Retourne la position réelle d'un beat en % (milieu du chapitre qui le contient : `(chapterNumber - 1 + 0.5) / total * 100`). Retourne `null` si le beat n'est assigné à aucun chapitre.

#### `getChapterPercent(chapterNumber: number): number`

Retourne la position en % du milieu d'un chapitre sur la frise.

#### `generateAlerts(): Alert[]`

Compare la position réelle de chaque beat à sa position idéale. Génère un tableau d'alertes avec les champs :

| Champ          | Type                     | Description |
|----------------|--------------------------|-------------|
| `type`         | `'missing' \| 'position'` | Type d'alerte |
| `severity`     | `'critical' \| 'warning'` | Critique si l'écart dépasse `2 × tolerance`, sinon warning |
| `beat`         | `Beat`                   | Objet beat concerné |
| `actualPct`    | `number`                 | Position réelle en % (absent si `type === 'missing'`) |
| `idealPct`     | `number`                 | Position idéale en % |
| `diff`         | `number`                 | Écart en points de % |
| `direction`    | `'tôt' \| 'tard'`        | Direction de la déviation |
| `chapterTitle` | `string`                 | Titre du chapitre contenant le beat |
| `message`      | `string`                 | Message d'alerte à afficher |

---

## 5. Fichiers de voyage (`*_journey.js`)

Chacun des trois fichiers (`frodo_journey.js`, `aragorn_journey.js`, `gandalf_journey.js`) exporte un tableau d'étapes de voyage. Structure d'une étape (d'après l'usage dans `AtlasMapView` et `JourneySidebar`) :

| Champ       | Type     | Description |
|-------------|----------|-------------|
| `scene`     | `string` | Identifiant de la scène narrative (utilisé pour la synchronisation inter-personnages) |
| *(autres)*  | divers   | Données d'affichage sidebar (lieu, description, etc.) — à consulter directement dans les fichiers |

Ces données ne sont pas connectées à `loreDB` ou `timelineDB` par des identifiants formels — le champ `scene` sert à synchroniser les timelines entre personnages en mode "Lier".
