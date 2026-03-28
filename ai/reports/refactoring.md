# Rapport refactoring — Atlas Narratif
*Audit technique React — 2026-03-26*

---

## Taille des fichiers (triés par lignes)

| Fichier | Lignes |
|---------|--------|
| `src/App.jsx` | 1 104 |
| `src/components/dashboard/NarrativeDashboard.jsx` | 763 |
| `src/db/queries.js` | 689 |
| `src/components/map/AtlasMapView.jsx` | 584 |
| `src/components/lore/LoreBrowser.jsx` | 549 |
| `src/components/lore/EntityEditor.jsx` | 529 |
| `src/components/timeline/TimelineBrowser.jsx` | 535 |
| `src/components/timeline/EventEditor.jsx` | 477 |
| `src/components/incoherences/IncoherencesBrowser.jsx` | 418 |
| `src/components/graph/EntityGraph.jsx` | 410 |
| `src/components/savethecat/SaveTheCat.jsx` | 382 |

---

## Problème 1 — Duplication critique : Field / Input / Textarea

**Impact : ~60 lignes dupliquées à l'identique**

`Field`, `Input`, `Textarea` sont définis deux fois de façon identique :
- `src/components/lore/EntityEditor.jsx` lignes 60–90
- `src/components/timeline/EventEditor.jsx` lignes 10–40

La seule différence : `EntityEditor` passe `accent` en prop, `EventEditor` utilise une constante locale `ACCENT`.

**Action :** Créer `src/components/ui/FormFields.jsx` et importer dans les deux fichiers.

```
src/components/ui/FormFields.jsx
  export function Field({ label, children })
  export function Input({ accent, ...props })
  export function Textarea({ accent, ...props })
```

---

## Problème 2 — Sous-composants inline à extraire

Chaque composant ci-dessous est défini à l'intérieur d'un autre fichier, ce qui les rend non-réutilisables et gonfle les fichiers parents.

### `src/App.jsx` (1 104 lignes → ~400 lignes après extraction)

| Composant | Lignes approx. | Destination |
|-----------|---------------|-------------|
| `ProjectPicker` | 58–196 | `src/components/nav/ProjectPicker.jsx` |
| `NavDropdown` | 199–267 | `src/components/nav/NavDropdown.jsx` |
| `TopNav` | 270–fin | `src/components/nav/TopNav.jsx` |

### `src/components/dashboard/NarrativeDashboard.jsx` (763 lignes → ~300 lignes)

| Composant | Destination |
|-----------|-------------|
| `CircularGauge` | `src/components/dashboard/CircularGauge.jsx` |
| `StatCard` | `src/components/dashboard/StatCard.jsx` |
| `RecommendationRow` | `src/components/dashboard/RecommendationRow.jsx` |
| `SectionTitle` | `src/components/ui/SectionTitle.jsx` |

Les calculs (métriques incohérences, inventaire, couverture, rythme, recommandations) devraient aller dans des hooks dédiés :
- `src/hooks/useIncoherenceMetrics.js`
- `src/hooks/useCoverage.js`
- `src/hooks/useRecommendations.js`

### `src/components/lore/LoreBrowser.jsx` (549 lignes → ~150 lignes)

| Composant | Destination |
|-----------|-------------|
| `SourceBadge` | `src/components/ui/SourceBadge.jsx` |
| `CharacterCard` | `src/components/lore/CharacterCard.jsx` |
| `LocationCard` | `src/components/lore/LocationCard.jsx` |
| `ObjectCard` | `src/components/lore/ObjectCard.jsx` |

### `src/components/timeline/TimelineBrowser.jsx` (535 lignes → ~200 lignes)

| Composant | Destination |
|-----------|-------------|
| `EntityChip` | `src/components/timeline/EntityChip.jsx` |
| `EventCard` | `src/components/timeline/EventCard.jsx` |
| `ArcStrip` | `src/components/timeline/ArcStrip.jsx` |

### `src/components/incoherences/IncoherencesBrowser.jsx` (418 lignes → ~150 lignes)

| Composant | Destination |
|-----------|-------------|
| `EntityChip` | `src/components/incoherences/EntityChip.jsx` |
| `FixButton` | `src/components/incoherences/FixButton.jsx` |
| `IncoherenceCard` | `src/components/incoherences/IncoherenceCard.jsx` |

Note : `EntityChip` existe dans `TimelineBrowser` ET dans `IncoherencesBrowser` avec des variantes différentes. À évaluer si une version commune suffit.

---

## Problème 3 — Pattern SidePanel dupliqué

`EntityEditor.jsx` et `EventEditor.jsx` ont exactement la même structure :

```jsx
// Backdrop
<div className="fixed inset-0 z-40"
  style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
  onClick={onClose}
/>
// Panneau
<div className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
  style={{ width: 420/440, backgroundColor: '#0d1b2a',
           borderLeft: '1px solid rgba(255,255,255,0.08)',
           boxShadow: '-16px 0 48px rgba(0,0,0,0.6)' }}
>
```

**Action :** Créer `src/components/ui/SidePanel.jsx` :

```jsx
export function SidePanel({ width = 420, onClose, children }) { ... }
```

---

## Problème 4 — Pattern carte sombre répété 15+ fois

Le pattern `border + backgroundColor + boxShadow` conditionnel sur `highlighted` + `color` apparaît dans :
- `LoreBrowser.jsx` × 3 (CharacterCard, LocationCard, ObjectCard)
- `TimelineBrowser.jsx` (EventCard)
- `IncoherencesBrowser.jsx` (IncoherenceCard)
- `NarrativeDashboard.jsx` × 5+

**Action :** Créer `src/components/ui/Card.jsx` avec prop `highlighted` et `color`.

---

## Problème 5 — Pattern CRUD répété 3× dans queries.js

`insertCharacter` / `updateCharacter` / `deleteCharacter`,
`insertLocation` / `updateLocation` / `deleteLocation`,
`insertObject` / `updateObject` / `deleteObject`

sont structurellement identiques (même pattern try/catch, même schéma de colonnes, même gestion de l'`extra` JSONB). ~120 lignes répétitives.

Les différences réelles : nom de table, liste de colonnes, traitement de la colonne `color`.

**Action :** Factoriser avec une fonction interne `buildEntityCrud(table, columns)` ou regrouper les 3 entités dans un module `src/db/entityQueries.js`.

---

## Problème 6 — Pattern store identique dans 3 stores

`useTimelineStore`, `useLoreStore`, `useStcStore` ont exactement :

```js
load(db, projectId) → set({ _db, _projectId }) + fetch
_reload() → refetch via _db/_projectId
save(id, data) → set({ saving: true }) + try/finally + _reload()
remove(id) → set({ saving: true }) + try/finally + _reload()
reset() → set(initialState)
```

**Action :** Créer `src/stores/createEntityStore.js` — factory qui génère un store à partir des fonctions query. Priorité basse car les 3 stores ont des particularités (lore gère 3 types d'entités).

---

## Problème 7 — Code mort / imports inutiles

### `useStcStore` — partiellement mort
Depuis la migration beats → timeline events, `useStcStore` n'est plus utilisé que dans :
- `ProjectContext.jsx` (chargement)
- Nulle part dans les composants

**Vérifier** si `useStcStore` peut être supprimé entièrement, ou si les tables STC doivent rester pour d'autres usages.

### `useMapStore.unlocalized`
Calculé dans `loadAuto()` mais jamais consommé dans l'UI. Soit l'afficher, soit le supprimer.

### `src/data/save_the_cat_database.js`
À vérifier si ce fichier est importé quelque part — l'audit suggère qu'il pourrait être redondant avec `beats_config.js`.

---

## Priorités recommandées

### Phase 1 — Gains immédiats, risque faible
1. Extraire `Field` / `Input` / `Textarea` → `src/components/ui/FormFields.jsx`
2. Extraire `SidePanel` → `src/components/ui/SidePanel.jsx`
3. Extraire `SourceBadge` → `src/components/ui/SourceBadge.jsx`
4. Supprimer `unlocalized` de `useMapStore` si non utilisé

### Phase 2 — Extraction de sous-composants
5. Extraire les 3 nav components de `App.jsx`
6. Extraire les 4 card components de `LoreBrowser.jsx`
7. Extraire les 3 components de `TimelineBrowser.jsx`
8. Extraire les 3 components de `IncoherencesBrowser.jsx`
9. Extraire les 4 components de `NarrativeDashboard.jsx`

### Phase 3 — Logique métier
10. Extraire les hooks de calcul de `NarrativeDashboard.jsx`
11. Factoriser le CRUD de `queries.js`
12. Clarifier le sort de `useStcStore`

---

## Gains estimés

| Action | Lignes supprimées |
|--------|------------------|
| FormFields.jsx mutualisé | ~60 |
| SidePanel.jsx mutualisé | ~40 |
| Extraction App.jsx | ~700 déplacées |
| Extraction NarrativeDashboard | ~460 déplacées |
| Extraction LoreBrowser | ~400 déplacées |
| Extraction TimelineBrowser | ~330 déplacées |
| Extraction IncoherencesBrowser | ~270 déplacées |
| Factorisation queries.js CRUD | ~80 |
| **Total lignes dupliquées éliminées** | **~180** |
| **Total lignes déplacées (fichiers allégés)** | **~2 200** |
