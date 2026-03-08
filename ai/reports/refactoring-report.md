# Rapport Refactoring — AtlasNarratif

> Généré le 2026-03-19 par l'Agent Refactoring

## Résumé exécutif

Analyse complète des 8 composants principaux (3 484 lignes au total). Le codebase présente des duplications significatives qui ralentissent la maintenance et fragilisent la cohérence visuelle. Six composants UI sont à extraire et trois composants sont à découper.

---

## 1. Duplications de code

### 1.1 Fonctions utilitaires dupliquées

| Fonction | Occurrences | Fichiers |
|----------|-------------|---------|
| `hexToRgb()` | 4+ | TimelineBrowser, EntityGraph, AtlasMapView, IncoherencesBrowser + inline 3× dans LoreBrowser |
| `getEntityMeta` / `getEntityInfo` | 4 versions différentes | TimelineBrowser, NarrativeDashboard, EntityGraph, IncoherencesBrowser |
| Logique `onEntityClick` (navigate vers graph ou lore selon le type) | 3× | App.jsx, TimelineBrowser |

**Action recommandée :** Créer `src/utils/entityUtils.js` avec `hexToRgb()`, `getEntityMeta()` et `getEntityClickHandler()`.

### 1.2 Pattern scroll-to-highlight dupliqué

Le pattern `useRef + useEffect` pour le scroll vers l'élément actif est copié-collé **3 fois identiques** dans `LoreBrowser.jsx`.

**Action recommandée :** Extraire un hook `useScrollToActive(ref, activeId, deps)`.

---

## 2. Composants UI à extraire

### 2.1 `EntityChip`
- **Où :** Timeline et Incoherences (2 versions divergentes)
- **Usage estimé :** 10+ fois dans l'app
- **Props :** `{ entity, onClick?, size? }`

### 2.2 `PageHeader`
- **Où :** Pattern identique dans **7 composants**
- **Structure :** titre + icône + compteur badge
- **Props :** `{ title, icon, count?, children? }`

### 2.3 `FilterPill`
- **Où :** TimelineBrowser, EntityGraph, AtlasMapView
- **Usage :** boutons de filtre avec état actif/inactif
- **Props :** `{ label, active, onClick, color? }`

### 2.4 `SectionLabel`
- **Où :** ~8 occurrences
- **Pattern :** `text-xs font-bold text-slate-500 uppercase tracking-widest`
- **Props :** `{ children }`

### 2.5 `SeverityBadge`
- **Où :** 4 fichiers (Incoherences principalement)
- **Props :** `{ level: 'high' | 'medium' | 'low' }`

### 2.6 `Card` avec bandeau couleur expansible
- **Où :** 5 fichiers
- **Props :** `{ color, title, expandable?, children }`

---

## 3. Composants à découper

### 3.1 `EntityGraph.jsx` (822 lignes) — priorité haute

Actuellement mélange :
- Le moteur physique de simulation (force-directed)
- 2 modes de rendu SVG
- Le panel overlay de détails

**Découpage proposé :**
```
EntityGraph/
  index.jsx           ← orchestrateur
  GraphCanvas.jsx     ← rendu SVG + moteur physique
  GraphOverlay.jsx    ← panel de détails
  useGraphSimulation.js ← hook moteur physique
```

### 3.2 `SaveTheCat.jsx` (644 lignes) — priorité moyenne

Contient 4 sous-composants à isoler :
- `Frise.jsx` — visualisation horizontale des beats
- `ChapterCard.jsx` — carte chapitre avec assignation beats
- `AlertCard.jsx` — alerte d'incohérence narrative
- `BeatRow.jsx` — ligne de beat dans le tableau

### 3.3 `LoreBrowser.jsx` (491 lignes) — priorité basse

3 cards internes identiques à extraire en un composant générique `LoreCard.jsx`.

---

## 4. Plan de migration recommandé

### Phase 1 — Utilitaires (1 session)
1. Créer `src/utils/entityUtils.js`
2. Créer `src/hooks/useScrollToActive.js`
3. Remplacer toutes les occurrences

### Phase 2 — Composants UI atomiques (1-2 sessions)
4. Créer `src/components/ui/EntityChip.jsx`
5. Créer `src/components/ui/PageHeader.jsx`
6. Créer `src/components/ui/FilterPill.jsx`
7. Créer `src/components/ui/SectionLabel.jsx`
8. Créer `src/components/ui/SeverityBadge.jsx`
9. Créer `src/components/ui/Card.jsx`

### Phase 3 — Découpage des gros composants (2-3 sessions)
10. Refactorer `EntityGraph.jsx`
11. Refactorer `SaveTheCat.jsx`
12. Refactorer `LoreBrowser.jsx`

---

## Métriques estimées

| Métrique | Avant | Après |
|----------|-------|-------|
| Lignes de code total | ~3 484 | ~2 800 (−20%) |
| Composants | 8 | 20 (plus petits et réutilisables) |
| Fonctions utilitaires dupliquées | 4 | 0 |
| Fichiers > 400 lignes | 4 | 0 |
