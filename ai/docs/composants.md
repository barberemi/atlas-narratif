# Composants React — AtlasNarratif

> Généré le 2026-03-19

---

## Conventions générales

- Tous les composants sont des **function components** React.
- Le fond global de l'application est `bg-[#0B1621]` (bleu-nuit très sombre).
- Les styles sont essentiellement inline (`style={{...}}`) pour les couleurs dynamiques ; TailwindCSS est utilisé pour la structure et l'espacement.
- Aucun store global (pas de Redux/Zustand/Context pour les données). Les données viennent directement des imports `src/data/`.

---

## `src/App.jsx`

### `TopNav`

Navigation principale de l'application.

| Prop | Type | Req | Description |
|------|------|-----|-------------|
| *(aucune)* | — | — | Utilise `useLocation` et `useNavigate` en interne |

**État interne** : aucun.

**Comportement** : affiche 7 liens de navigation. Le lien `/incoherences` reçoit un style rouge (couleur d'alerte) au lieu du violet standard. Le logo "AtlasNarratif" est cliquable et navigue vers `/`.

---

### `HomePage`

Page d'accueil affichée sur la route `/`.

**État interne** :
- `file` — fichier sélectionné via `FilePicker`
- `isAnalyzing` — booléen, déclenche la barre de progression
- `data` — données "extraites" (hardcodées dans `lotrTestData`)
- `progress` — progression 0–100 (simulée par `setInterval`)

**Comportement** : simule une analyse de fichier avec une barre de progression. Au terme de la progression, affiche des `LoreCard` depuis `lotrTestData` (données de démonstration LOTR). Pas de vrai parsing de fichier.

**Dépendances** : `FilePicker`, `LoreCard`.

---

### `MapRoute`

Wrapper de route pour `/map`. Passe deux callbacks à `AtlasMapView` :
- `onCharacterClick` → navigue vers `/lore?tab=characters&search=<nom>` en résolvant via `findCharacterByAllyName`
- `onLocationClick` → navigue vers `/lore?tab=locations&search=<nom>`

---

### `LoreRoute`

Wrapper de route pour `/lore`. Lit `?tab=` et `?search=` depuis l'URL et les passe en props à `LoreBrowser`.

---

### `GraphRoute`

Wrapper de route pour `/graph`. Lit `?entity=` depuis l'URL. Si présent : mode `'centered'` centré sur cette entité. Sinon : centré sur `char_frodo` par défaut.

---

### `DashboardRoute`

| Prop          | Type       | Req | Description |
|---------------|------------|-----|-------------|
| `resolvedIds` | `Set<string>` | oui | IDs des incohérences résolues |

Passe `resolvedIds` à `NarrativeDashboard` et gère la navigation vers `/incoherences` et vers les entités (graphe ou lore).

---

### `IncoherencesRoute`

| Prop             | Type          | Req | Description |
|------------------|---------------|-----|-------------|
| `resolvedIds`    | `Set<string>` | oui | IDs des incohérences résolues |
| `toggleResolved` | `(id: string) => void` | oui | Bascule l'état résolu/non résolu d'une incohérence |

Lit `?filter=` depuis l'URL et le passe à `IncoherencesBrowser`.

---

### `App` (composant racine)

**État interne** :
- `resolvedIds` : `Set<string>` — ensemble des IDs d'incohérences marquées comme résolues. Persistant le temps de la session (réinitialisé au rechargement de page).

Fournit le layout global (TopNav + zone de contenu scrollable) et les routes React Router.

---

## `src/components/ui/`

### `LoreCard`

Carte d'affichage rapide (utilisée uniquement sur la HomePage pour le résultat fictif d'analyse).

| Prop   | Type                    | Req | Description |
|--------|-------------------------|-----|-------------|
| `item` | `Character \| Location` | oui | Objet à afficher |
| `type` | `'character' \| 'location'` | oui | Type d'entité |

---

### `Button`

Composant bouton générique. Consulter directement le fichier pour les props exactes (non utilisé dans les vues principales à ce jour).

---

## `src/components/upload/`

### `FilePicker`

Zone de dépôt de fichier (drag & drop) affichée sur la HomePage.

| Prop           | Type                     | Req | Description |
|----------------|--------------------------|-----|-------------|
| `onFileSelect` | `(file: File) => void`   | oui | Callback appelé quand un fichier est sélectionné |

**Comportement** : accepte le drag & drop et le clic pour ouvrir le sélecteur de fichiers natif. Ne parse pas réellement le fichier — transmet juste l'objet `File` au parent.

---

## `src/components/map/`

### `AtlasMapView`

Vue principale de la carte interactive. Orchestre MapCanvas, JourneySidebar et JourneyTimeline.

| Prop              | Type                        | Req | Description |
|-------------------|-----------------------------|-----|-------------|
| `onCharacterClick`| `(allyName: string) => void`| non | Callback clic sur un personnage dans la sidebar |
| `onLocationClick` | `(locationName: string) => void` | non | Callback clic sur un lieu dans la carte |

**État interne** :
- `steps` : `{ frodo: number, aragorn: number, gandalf: number }` — indice de l'étape courante pour chaque personnage
- `focused` : `string` — clé du personnage affiché en mode solo dans la sidebar
- `visible` : `{ frodo: boolean, aragorn: boolean, gandalf: boolean }` — visibilité sur la carte
- `linked` : `boolean` — synchronisation des timelines entre personnages
- `compare` : `boolean` — affichage côte à côte des sidebars

**Comportement** : en mode `linked`, un changement de step chez un personnage tente de synchroniser les autres sur la même scène narrative (correspondance par `scene`). En mode `compare`, la sidebar se divise en colonnes (une par personnage). Au moins un personnage parmi Aragorn et Gandalf doit rester visible (garde-fou dans `toggleVisible`).

**Dépendances** : `MapCanvas`, `JourneySidebar`, `JourneyTimeline`.

---

### `MapCanvas`

Dessine la carte (image de fond + tracés SVG des voyages).

| Prop              | Type | Req | Description |
|-------------------|------|-----|-------------|
| `characters`      | `{ journey: Step[], currentStep: number, color: string, name: string }[]` | oui | Personnages à afficher |
| `onLocationClick` | `(locationName: string) => void` | non | Callback clic sur un lieu |

---

### `JourneySidebar`

Panneau latéral décrivant l'étape courante d'un personnage.

| Prop              | Type         | Req | Description |
|-------------------|--------------|-----|-------------|
| `step`            | `object`     | oui | Étape courante du voyage |
| `color`           | `string`     | oui | Couleur hexadécimale du personnage |
| `totalSteps`      | `number`     | oui | Nombre total d'étapes |
| `compact`         | `boolean`    | non | Mode compact pour le mode compare |
| `onCharacterClick`| `(allyName: string) => void` | non | Callback clic sur un allié mentionné |

---

### `JourneyTimeline`

Slider de progression sur les étapes du voyage d'un personnage.

| Prop           | Type                     | Req | Description |
|----------------|--------------------------|-----|-------------|
| `journey`      | `Step[]`                 | oui | Tableau d'étapes |
| `currentStep`  | `number`                 | oui | Indice de l'étape courante |
| `onStepChange` | `(step: number) => void` | oui | Callback changement d'étape |
| `color`        | `string`                 | oui | Couleur du personnage |
| `showLabels`   | `boolean`                | non | Affiche ou masque les labels d'étape |

---

## `src/components/lore/`

### `LoreBrowser`

Encyclopédie — onglets Personnages / Lieux / Objets avec recherche textuelle.

| Prop             | Type                       | Req | Description |
|------------------|----------------------------|-----|-------------|
| `initialTab`     | `'characters' \| 'locations' \| 'objects'` | non | Onglet actif au montage (défaut : `'characters'`) |
| `initialSearch`  | `string`                   | non | Texte de recherche pré-rempli (défaut : `''`) |
| `onEntityClick`  | `(id: string) => void`     | non | Callback clic sur une entité — ouvre le graphe |
| `onCharacterClick`| `(allyName: string) => void` | non | Callback clic sur un personnage depuis une carte lieu/objet |

**État interne** :
- `activeTab` : onglet actif (synchronisé avec `initialTab` via `useEffect`)
- `search` : texte de recherche (synchronisé avec `initialSearch` via `useEffect`)

**Effets de bord** : deux `useEffect` synchronisent `activeTab` et `search` quand `initialTab`/`initialSearch` changent (navigation depuis la carte).

**Sous-composants internes** :
- `IncBadge` : badge rouge/orange indiquant le nombre d'incohérences d'une entité. Utilise `getEntityIncoherences` et `getMaxSeverity`.
- `CharacterCard` : carte personnage avec auto-scroll vers le personnage mis en surbrillance (`highlighted`).
- `LocationCard` : carte lieu avec boutons "personnages passés par ici".
- `ObjectCard` : carte objet avec liste de porteurs cliquables.

La recherche textuelle couvre : `name`, `description`, `aliases`, `race`, `role`, `type`, `creator`, `traits`, `inhabitants`, `powers`.

---

## `src/components/graph/`

### `EntityGraph`

Graphe de forces SVG avec deux modes : **centré** (1 entité + ses satellites) et **global** (toutes les entités).

| Prop          | Type                       | Req | Description |
|---------------|----------------------------|-----|-------------|
| `entityId`    | `string`                   | oui | ID de l'entité centrale (mode centré) |
| `initialMode` | `'centered' \| 'full'`     | non | Mode initial (défaut : `'centered'`) |
| `onNodeClick` | `(id: string) => void`     | oui | Callback clic sur un nœud — met à jour l'URL |

**État interne** :
- `mode` : `'centered' \| 'full'`
- `currentId` : ID de l'entité centrale courante
- `history` / `historyIndex` : fil d'Ariane de navigation dans le graphe
- `focusedId` : nœud focalisé en mode global
- `hovered` : nœud survolé
- `hoveredBadge` : badge d'incohérence survolé
- `positions` : `{ [id]: { x, y, vx, vy } }` — positions calculées par la simulation physique
- `hiddenRelTypes` : `Set<string>` — types de relations masqués en mode global (par défaut : `visited_by`, `visited`)
- `incPanelId` : ID de l'entité dont le panneau d'incohérences est ouvert

**Simulation physique** : calcule les positions par un algorithme force-directed (répulsion quadratique + ressorts entre nœuds liés + attraction vers le centre). Tourne jusqu'à convergence (`KE < KE_THRESHOLD`) ou `MAX_STEPS` itérations. Implémenté dans `simStep` et `runSimulation`.

**Mode centré** : l'entité centrale est fixée au centre. Les satellites et les nœuds relation sont disposés sur des anneaux concentriques.

**Mode global** : tous les nœuds de `buildFullGraph()` sont affichés. La taille des nœuds est proportionnelle à leur degré (nombre de relations).

**Fonctionnalités** :
- Fil d'Ariane de navigation (historique)
- Panneau d'incohérences au clic sur un badge numéroté
- Filtres par type de relation (mode global)
- Tooltip au survol avec nom, race/type, description courte

**Dépendances** : `buildGraph`, `buildFullGraph` (depuis `src/utils/buildGraph.js`), `getEntityIncoherences`, `getMaxSeverity`, `SEVERITY_CONFIG`.

---

## `src/components/timeline/`

### `TimelineBrowser`

Timeline narrative horizontale, organisée en colonnes par chapitre.

**Props** : aucune (les données viennent directement de `timelineDB` et `loreDB`).

**État interne** :
- `focusedCharId` : `string | null` — filtre les événements par personnage (les autres sont atténués)

**Effets de bord** : utilise `useDragScroll` pour le scroll horizontal à la souris.

**Comportement** :
- Affiche un filtre "Suivre" listant tous les personnages présents dans la timeline.
- Chaque colonne correspond à un chapitre ; chaque carte correspond à un événement.
- Les événements en conflit (deux lieux différents pour un même personnage dans le même chapitre) sont mis en rouge.
- Clic sur une entité dans une carte → navigation vers `/graph` (personnages/objets) ou `/lore` (lieux).

**Sous-composants internes** :
- `EntityChip` : badge cliquable représentant une entité dans un événement.
- `EventCard` : carte d'événement collapsible. Affiche titre, entités, détails du conflit (si `isConflict`) et incohérences liées (si `incoherenceIds`).

**Dépendances** : `timelineDB`, `getChapters`, `detectConflicts`, `getConflictDetails`, `loreDB`, `incoherencesDB`, `SEVERITY_CONFIG`, `useDragScroll`.

---

## `src/components/dashboard/`

### `NarrativeDashboard`

Tableau de bord de santé narrative.

| Prop                | Type                              | Req | Description |
|---------------------|-----------------------------------|-----|-------------|
| `resolvedIds`       | `Set<string>`                     | oui | IDs des incohérences résolues |
| `onOpenIncoherences`| `(filter: string) => void`        | oui | Navigue vers `/incoherences?filter=<sév>` |
| `onEntityClick`     | `(id: string, type: string) => void` | oui | Navigue vers l'entité (graphe ou lore) |

**État interne** : aucun (tout calculé via `useMemo`).

**Calculs** :
- Score de santé = `100 - (poids des incohérences non résolues / poids total) * 100`
- Poids par sévérité : `critical=4`, `high=3`, `medium=2`, `low=1`
- Top entités = 6 entités les plus impliquées dans les incohérences, triées par nombre de liens puis par sévérité max

**Affichage** :
- Jauge circulaire SVG avec score et label qualitatif (Bon/Moyen/Faible/Critique)
- Barre de progression globale de résolution
- Blocs par sévérité (cliquables → filtre `/incoherences`)
- Top 6 entités impliquées (cliquables → graphe ou lore)
- Répartition par type d'incohérence (barres horizontales)

**Sous-composants internes** :
- `CircularGauge` : SVG animé, affiche le score de 0 à 100 avec couleur adaptative.

**Dépendances** : `incoherencesDB`, `SEVERITY_CONFIG`, `SEVERITY_ORDER`, `loreDB`.

---

## `src/components/incoherences/`

### `IncoherencesBrowser`

Liste filtrée et interactive des incohérences narratives.

| Prop               | Type                              | Req | Description |
|--------------------|-----------------------------------|-----|-------------|
| `resolvedIds`      | `Set<string>`                     | oui | IDs des incohérences résolues |
| `onToggleResolved` | `(id: string) => void`            | oui | Bascule l'état résolu/non résolu |
| `initialFilter`    | `'all' \| 'critical' \| 'high' \| 'medium' \| 'low'` | non | Filtre initial (défaut : `'all'`) |
| `onEntityClick`    | `(id: string, type: string) => void` | oui | Callback clic sur une entité |

**État interne** :
- `severityFilter` : filtre actif parmi `'all' | 'critical' | 'high' | 'medium' | 'low'`

**Comportement** : les cartes d'incohérence résolues deviennent très atténuées (opacity 0.2) mais restent visibles. Une checkbox "Résolu" permet de basculer l'état (géré par `App.jsx` via `resolvedIds`).

**Sous-composants internes** :
- `EntityChip` : chip cliquable représentant une entité liée. Grisée et non cliquable si l'entité n'existe pas dans `loreDB`.
- `IncoherenceCard` : carte complète d'une incohérence avec type, sévérité, titre, explication, liens et checkbox.

**Dépendances** : `incoherencesDB`, `SEVERITY_CONFIG`, `SEVERITY_ORDER`, `loreDB`.

---

## `src/components/savethecat/`

### `SaveTheCat`

Analyse Save the Cat : frise visuelle + alertes + checklist des 15 beats.

**Props** : aucune (les données viennent directement de `save_the_cat_database.js`).

**État interne** :
- `hoveredBeat` : `string | null` — ID du beat survolé (synchronise la frise et la liste d'alertes)

**Effets de bord** : utilise `useDragScroll` pour le défilement horizontal de la liste de chapitres.

**Layout** :
1. Header avec compteurs (chapitres, beats placés, alertes)
2. Légende (4 items)
3. Frise SVG interactive
4. Liste de chapitres horizontale (scrollable)
5. Panneaux inférieurs : alertes narratives (gauche) + checklist 15 beats (droite)

**Sous-composants internes** :
- `Frise` : visualisation SVG-like (en `div` positionnés absolutement) avec zones Acte I/II/III, colonnes de chapitres, cercles de beats réels, diamants de positions idéales, barre de progression colorée.
- `AlertCard` : carte d'alerte (critique ou warning) avec survol synchronisé.
- `BeatRow` : ligne dans la checklist des 15 beats — affiche le beat, sa position réelle en %, et son statut (ok, alert, manquant).
- `ChapterCard` : carte de chapitre (liste horizontale) — affiche numéro, titre, résumé, beats couverts.

**Dépendances** : `BEATS`, `chaptersDB`, `getBeatActualPercent`, `getChapterPercent`, `generateAlerts`, `useDragScroll`.

---

## `src/hooks/`

### `useDragScroll()`

Hook utilitaire pour rendre un conteneur scrollable horizontalement via le glisser-déposer à la souris.

**Retourne** :
```js
{
  ref,           // useRef à attacher au conteneur scrollable
  hasDragged,    // useRef<boolean> — true si un drag réel a eu lieu (> 4px)
  onMouseDown,   // handler souris
  onMouseMove,   // handler souris
  onMouseUp,     // handler souris
  onMouseLeave,  // handler souris
}
```

`hasDragged` permet aux composants parents de distinguer un clic simple d'un drag (ex : `ChapterCard` ignore les clics si `hasDragged.current` est `true`).

---

## `src/utils/buildGraph.js`

Non un composant, mais une dépendance critique d'`EntityGraph`.

### `buildGraph(entityId: string)`

Construit le graphe centré sur une entité. Retourne `null` si l'entité est introuvable. Sinon retourne :

```js
{
  central:    { ...entity, entityType },  // entité centrale
  satellites: [...],                       // nœuds satellites triés (characters → locations → objects)
  edges:      [...],                       // arêtes finales (avec nœuds relation intermédiaires si ≥ 2 arêtes du même type)
  relNodes:   [...],                       // nœuds relation intermédiaires (rectangles dans le graphe)
}
```

**Règle de réification** : si un type de relation produit 2 arêtes ou plus, un nœud intermédiaire de type "relation" est créé (rectangle étiqueté) pour regrouper visuellement les connexions.

### `buildFullGraph()`

Construit le graphe global de toutes les entités. Retourne :

```js
{
  nodes:     [...],             // tous les nœuds
  edges:     [...],             // toutes les arêtes
  degree:    Map<id, number>,   // degré de chaque nœud
  maxDegree: number,            // degré maximum (pour la normalisation de la taille des nœuds)
}
```

### Types de relations

| Clé          | Description                          | Couleur    |
|--------------|--------------------------------------|------------|
| `fellowship` | Membres de la Communauté de l'Anneau | `#3F51B5`  |
| `ally`       | Allié / affilié commun               | `#06B6D4`  |
| `holds`      | Personnage → Objet possédé           | `#F59E0B`  |
| `held_by`    | Objet → Porteur                      | `#F59E0B`  |
| `origin`     | Personnage/Objet → Lieu d'origine    | `#10B981`  |
| `created_in` | Objet → Lieu de création             | `#8B5CF6`  |
| `created_by` | Objet → Créateur                     | `#EF4444`  |
| `visited_by` | Lieu → Personnage visiteur           | `#64748B`  |
| `visited`    | Personnage → Lieu visité             | `#64748B`  |
