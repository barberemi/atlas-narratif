# Rapport Cohérence — AtlasNarratif

> Généré le 2026-03-19 par l'Agent Cohérence

## Résumé (14 problèmes détectés)

| Catégorie | 🔴 Bloquant | 🟡 Avertissement | 🔵 Mineur |
|-----------|-------------|------------------|-----------|
| 1. Cohérence des données | 2 | 0 | 0 |
| 2. Cohérence des composants | 0 | 2 | 4 |
| 3. Cohérence de navigation | 0 | 1 | 1 |
| 4. Cohérence visuelle | 0 | 0 | 4 |
| **Total** | **2** | **3** | **9** |

---

## 1. Cohérence des données

### 🔴 `loc_amon_hen` manquant dans `loreDB.locations`
- **Où :** `timeline_database.js` ligne 378 (evt_024)
- **Impact :** Le lieu Amon Hen existe dans le lore avec l'ID `loc_parthgalen`, pas `loc_amon_hen`. La résolution des entités échoue silencieusement dans `TimelineBrowser` et `detectConflicts()` ne peut pas traiter ces événements.
- **Fix :** Remplacer `loc_amon_hen` par `loc_parthgalen` dans `timeline_database.js`, ou ajouter `loc_amon_hen` dans `lore_database.js`.

### 🔴 `loc_anduin` manquant dans `loreDB.locations`
- **Où :** `timeline_database.js` lignes 393 et 405 (evt_025, evt_026)
- **Impact :** Même impact que ci-dessus. La navigation depuis ces événements vers le Lore Browser envoie l'ID brut comme terme de recherche, retournant zéro résultat.
- **Fix :** Créer `loc_anduin` dans `lore_database.js` ou remapper vers le lieu existant correspondant.

---

## 2. Cohérence des composants

### 🟡 `DashboardRoute` reçoit `toggleResolved` mais ne le transmet pas
- **Où :** `App.jsx` ligne 282
- **Impact :** Prop reçue et ignorée — dead prop silencieuse.

### 🟡 `JourneySidebar` sans `onCharacterClick` en mode Compare
- **Où :** `AtlasMapView.jsx` ligne 194
- **Impact :** Les tags alliés sont cliquables en mode Solo mais pas en mode Compare — incohérence fonctionnelle silencieuse pour l'utilisateur.

### 🔵 `Button` importé mais non utilisé dans `FilePicker.jsx`
- Le bouton "Parcourir les fichiers" est un `<div>` inline qui duplique exactement les styles de `Button`.

### 🔵 `Button.jsx` : composant dead code
- Jamais rendu dans l'application.

### 🔵 Prop `onBack` documentée mais inexistante
- **Où :** `LoreBrowser.jsx` ligne 313
- Le JSDoc mentionne cette prop mais elle n'est ni passée ni utilisée.

### 🔵 `lotrTestData` dans `App.jsx` avec IDs incompatibles
- Les IDs `city_rivendell`, `city_moria` divergent du schéma `loc_*` de `loreDB`.

---

## 3. Cohérence de navigation

### 🟡 Filtre de sévérité dans `/incoherences` non écrit dans l'URL
- **Où :** `IncoherencesBrowser.jsx` ligne 169
- **Impact :** Le composant lit `?filter=` à l'init mais ne rappelle jamais `setSearchParams` quand l'utilisateur change le filtre. L'état UI et l'URL divergent, le filtre n'est pas restauré à la navigation arrière.

### 🔵 Navigation dégradée silencieuse pour `loc_amon_hen` / `loc_anduin`
- Conséquence directe de §1. Le fallback envoie l'ID brut comme terme de recherche dans le Lore Browser.

---

## 4. Cohérence visuelle

### 🔵 `#0B1621` codé en dur dans 8 fichiers
- Couleur de fond principale sans constante partagée.

### 🔵 `#3F51B5` codé en dur dans au moins 12 fichiers
- Couleur accent primaire sans variable CSS ni constante JS partagée.

### 🔵 `#EF4444` dans `TopNav` alors que `SEVERITY_CONFIG.critical.color` existe
- **Où :** `App.jsx` lignes 59–62 — duplication inutile.

### 🔵 Fonction `hexToRgb` redéfinie dans 4 fichiers
- **Fichiers :** `TimelineBrowser.jsx`, `EntityGraph.jsx`, `AtlasMapView.jsx`, `LoreBrowser.jsx`
- **Fix :** Extraire dans `src/utils/color.js`.

---

## Plan de correction recommandé

### Priorité immédiate (bloquants)
1. Corriger `loc_amon_hen` → `loc_parthgalen` dans `timeline_database.js` (evt_024)
2. Créer ou remapper `loc_anduin` dans `lore_database.js` (evt_025, evt_026)

### Court terme (avertissements)
3. Supprimer la prop `toggleResolved` dans `DashboardRoute` ou la connecter
4. Passer `onCharacterClick` en mode Compare dans `AtlasMapView`
5. Synchroniser le filtre `/incoherences` avec l'URL via `setSearchParams`

### Backlog (mineurs)
6. Extraire `hexToRgb` dans `src/utils/color.js`
7. Créer des constantes de couleurs partagées (`COLOR_BG`, `COLOR_ACCENT`)
8. Nettoyer `Button.jsx` (supprimer ou utiliser)
9. Nettoyer `lotrTestData` ou aligner ses IDs sur le schéma `loc_*`
