# Rapport Produit — AtlasNarratif

> Généré le 2026-03-19 par l'Agent Produit | Version analysée : commit `edf8302`

## Résumé exécutif

AtlasNarratif est un **prototype de démonstration très soigné**, entièrement basé sur des données statiques LOTR. L'application ne permet aucune saisie utilisateur réelle : tout le contenu (lore, timeline, incohérences, beats Save the Cat) est codé en dur dans des fichiers JS. La valeur produit actuelle est celle d'un démonstrateur, pas d'un outil utilisable au quotidien par un auteur. **Le saut critique est le passage des données statiques à des données gérées par l'utilisateur.**

---

## Analyse des fonctionnalités

### Lore Browser
Riche (recherche multi-champs, badges incohérences, navigation croisée), mais entièrement statique. Aucune création/édition d'entité possible.

### Graphe Relations
Techniquement remarquable (simulation physique, deux modes, fil d'Ariane, filtres par type de relation, intégration incohérences). **Manque critique :** pas de zoom/pan sur la SVG, illisible en mode global dense.

### Timeline
Organisation par chapitres lisible, détection de conflits de présence simultanée fonctionnelle, drag-scroll opérationnel. **Manque :** pas d'ajout d'événements, pas d'axe temporel réel, pas de lien avec Save the Cat.

### Carte Interactive
Spectaculaire mais entièrement LOTR-spécifique (image fixe, 3 personnages prédéfinis, routes codées en dur). Impossible d'utiliser pour un autre univers.

### Dashboard
Score de santé pertinent visuellement mais calculé sur des incohérences manuelles statiques, non persisté entre sessions.

### Incohérences
Interface excellente (filtres, chips cliquables, marquage résolu), mais les incohérences sont toutes pré-rédigées manuellement dans `incoherences_database.js`. La seule détection algorithmique réelle est le conflit de présence simultanée dans la timeline.

### Save the Cat
Frise position réelle vs idéale très bien exécutée, alertes automatiques utiles. Mais les assignations beats/chapitres sont statiques, et pas de lien avec la timeline narrative.

### Page d'accueil
Le FilePicker accepte des fichiers mais n'en lit aucun — l'analyse affichée est simulée avec `lotrTestData` hardcodé dans `App.jsx`. **Crée une fausse promesse.**

---

## Fonctionnalités manquantes critiques

| Priorité | Fonctionnalité | Impact |
|----------|----------------|--------|
| 🔴 Critique | **CRUD + persistance** — aucune entité, événement ou beat n'est créable/éditable depuis l'UI. Pas de localStorage. | Bloque toute utilisation réelle |
| 🔴 Critique | **Workflow nouveau projet** — pas d'onboarding pour un auteur avec son propre univers | Bloque tout utilisateur hors LOTR |
| 🟡 Haute | **Détection algorithmique d'incohérences** — les incohérences sont pré-écrites, pas détectées | Valeur produit centrale non réalisée |
| 🟡 Haute | **Zoom/pan sur le graphe** — la SVG à viewBox fixe devient illisible au-delà de ~15 entités | UX bloquante sur de vrais projets |
| 🟠 Moyenne | **Carte générique** — non utilisable hors de l'univers LOTR | Fonctionnalité décorative en l'état |
| 🟠 Moyenne | **Lien Save the Cat ↔ Timeline** — deux vues qui ignorent mutuellement les chapitres | Cohérence narrative fragmentée |

---

## Fonctionnalités à reconsidérer

- L'**upload simulé** sur la page d'accueil crée une fausse promesse. À remplacer par un vrai formulaire ou une vraie analyse IA.
- Les **nœuds relation intermédiaires** (rectangles) dans le graphe alourdissent sans clarifier pour un novice.
- La **jauge de santé narrative** n'a de sens que sur des incohérences détectées automatiquement.

---

## Roadmap priorisée

### Phase 1 — Utilisabilité de base (Critique)
1. Persistance `localStorage`
2. CRUD Entités (personnages, lieux, objets)
3. CRUD Événements timeline
4. Création d'un projet vide (hors LOTR)

### Phase 2 — Valeur produit core (Haute)
5. Détection algorithmique d'incohérences depuis les données existantes
6. Placement manuel des beats Save the Cat
7. Zoom/pan sur le graphe de relations
8. Export JSON du projet

### Phase 3 — Enrichissement (Moyenne)
9. Carte configurable (image uploadable + lieux positionnables)
10. Lien Save the Cat ↔ Timeline (visualisation croisée)
11. Onboarding guidé pour nouveaux auteurs
12. Analyse IA réelle (remplacement du FilePicker simulé)
13. Multi-projet (dépend de la migration SQLite)
