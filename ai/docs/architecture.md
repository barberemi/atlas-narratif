# Architecture — AtlasNarratif

> Généré le 2026-03-19

---

## Vue d'ensemble

**AtlasNarratif** est une application d'aide à l'écriture narrative. Elle permet aux auteurs de :

- Visualiser les parcours de personnages sur une carte interactive
- Consulter et rechercher leur base de lore (personnages, lieux, objets)
- Explorer les relations entre entités sous forme de graphe de forces
- Suivre leur timeline narrative chapitre par chapitre et détecter les conflits de présence simultanée
- Gérer un tableau de bord de santé narrative (score de cohérence, incohérences résolues/non résolues)
- Analyser leur structure narrative selon la méthode **Save the Cat** (15 beats)

**Public cible** : auteurs de fiction (romans, scénarios) qui gèrent un univers avec de nombreuses entités et souhaitent repérer les incohérences de lore.

**Données** : entièrement statiques, définies dans `src/data/`. Aucun backend, aucune base de données persistante. Le projet est actuellement câblé sur un jeu de données de démonstration tiré de *La Communauté de l'Anneau* (Tolkien).

**Stack** : React 18 + Vite + TailwindCSS v4 + React Router v6.

---

## Arborescence commentée

```
src/
├── main.jsx                   Point d'entrée : monte BrowserRouter + App
├── App.jsx                    Layout global, navigation TopNav, routage, état partagé resolvedIds
├── index.css                  Styles globaux Tailwind + utilitaires (no-scrollbar, etc.)
│
├── data/                      Données statiques — toute la "base de données" du projet
│   ├── lore_database.js       Personnages, lieux, objets + fonction findCharacterByAllyName()
│   ├── timeline_database.js   Événements narratifs + utilitaires (getChapters, detectConflicts…)
│   ├── incoherences_database.js  Incohérences détectées + SEVERITY_CONFIG + utilitaires
│   ├── save_the_cat_database.js  15 beats + chapitres + generateAlerts()
│   ├── frodo_journey.js       Étapes de voyage de Frodo pour la carte
│   ├── aragorn_journey.js     Étapes de voyage d'Aragorn pour la carte
│   └── gandalf_journey.js     Étapes de voyage de Gandalf pour la carte
│
├── utils/
│   └── buildGraph.js          Construit les graphes de relations (centré ou global) depuis loreDB
│
├── hooks/
│   └── useDragScroll.js       Hook : scroll horizontal à la souris (drag-to-scroll)
│
├── assets/
│   ├── react.svg
│   └── ouest_terre_du_milieu.jpg  Image de fond de la carte interactive
│
└── components/
    ├── ui/
    │   ├── Button.jsx          Composant bouton générique
    │   └── LoreCard.jsx        Carte d'affichage rapide (utilisée sur la page d'accueil)
    ├── upload/
    │   └── FilePicker.jsx      Zone de dépôt de fichier (drag & drop, UI d'accueil)
    ├── map/
    │   ├── AtlasMapView.jsx    Vue carte principale — orchestre MapCanvas + sidebar + timeline
    │   ├── MapCanvas.jsx       Dessin SVG de la carte et des tracés de voyages
    │   ├── JourneySidebar.jsx  Panneau latéral détaillant l'étape courante d'un personnage
    │   └── JourneyTimeline.jsx Slider de progression sur le voyage d'un personnage
    ├── lore/
    │   └── LoreBrowser.jsx     Encyclopédie — onglets Personnages / Lieux / Objets + recherche
    ├── graph/
    │   └── EntityGraph.jsx     Graphe de forces SVG (mode centré et mode global)
    ├── timeline/
    │   └── TimelineBrowser.jsx Timeline horizontale par chapitre avec détection de conflits
    ├── dashboard/
    │   └── NarrativeDashboard.jsx  Tableau de bord de santé narrative (score, entités, types)
    ├── incoherences/
    │   └── IncoherencesBrowser.jsx  Liste filtrée des incohérences avec résolution interactive
    └── savethecat/
        └── SaveTheCat.jsx      Analyse Save the Cat : frise, alertes, checklist 15 beats
```

---

## Flux de données

Les données statiques dans `src/data/` sont importées directement dans les composants — il n'y a ni store global (pas de Redux/Zustand), ni contexte React dédié.

```
src/data/lore_database.js
  └─→ App.jsx            (findCharacterByAllyName, loreDB pour navigation)
  └─→ LoreBrowser.jsx    (loreDB.characters / locations / objects)
  └─→ EntityGraph.jsx    (via buildGraph.js)
  └─→ TimelineBrowser.jsx (getEntityMeta depuis loreDB)
  └─→ NarrativeDashboard.jsx
  └─→ IncoherencesBrowser.jsx

src/data/timeline_database.js
  └─→ TimelineBrowser.jsx (timelineDB, getChapters, detectConflicts, getConflictDetails)

src/data/incoherences_database.js
  └─→ LoreBrowser.jsx    (badges IncBadge via getEntityIncoherences)
  └─→ EntityGraph.jsx    (halos et panneaux d'incohérence)
  └─→ TimelineBrowser.jsx (alertes sur les cartes événement)
  └─→ NarrativeDashboard.jsx (calcul du score, topEntities)
  └─→ IncoherencesBrowser.jsx (liste principale)

src/data/save_the_cat_database.js
  └─→ SaveTheCat.jsx     (BEATS, chaptersDB, generateAlerts)

src/data/*_journey.js
  └─→ AtlasMapView.jsx   (frodoJourney, aragornJourney, gandalfJourney)
  └─→ MapCanvas.jsx      (tracés sur la carte)
  └─→ JourneySidebar.jsx (étape courante)
  └─→ JourneyTimeline.jsx (slider)

src/utils/buildGraph.js
  └─→ EntityGraph.jsx    (buildGraph, buildFullGraph)
```

**État partagé entre routes** : un seul état remonte dans `App.jsx` — `resolvedIds` (Set des identifiants d'incohérences marquées comme résolues) et son setter `toggleResolved`. Ces deux valeurs sont passées en props à `NarrativeDashboard` et `IncoherencesBrowser`.

---

## Schéma des routes React Router

| Chemin          | Composant rendu            | Description |
|-----------------|----------------------------|-------------|
| `/`             | `HomePage`                 | Accueil avec upload fictif et affichage de cartes de lore |
| `/map`          | `MapRoute` → `AtlasMapView` | Carte interactive + voyages de personnages |
| `/lore`         | `LoreRoute` → `LoreBrowser` | Encyclopédie, accepte `?tab=&search=` |
| `/graph`        | `GraphRoute` → `EntityGraph` | Graphe de relations, accepte `?entity=<id>` |
| `/timeline`     | `TimelineBrowser`          | Timeline narrative horizontale par chapitres |
| `/dashboard`    | `DashboardRoute` → `NarrativeDashboard` | Tableau de bord de santé narrative |
| `/incoherences` | `IncoherencesRoute` → `IncoherencesBrowser` | Liste des incohérences, accepte `?filter=<sévérité>` |
| `/savethecat`   | `SaveTheCat`               | Analyse Save the Cat avec frise et alertes |

### Navigation inter-routes (deep linking)

Plusieurs routes se naviguent mutuellement via `useNavigate` :

- La **carte** (`/map`) redirige vers `/lore?tab=characters&search=<nom>` sur clic d'un personnage.
- Le **lore browser** (`/lore`) redirige vers `/graph?entity=<id>` sur clic d'une entité.
- Le **dashboard** (`/dashboard`) redirige vers `/incoherences?filter=<sév>` ou vers `/graph`/`/lore` selon le type d'entité.
- Les **incohérences** (`/incoherences`) redirigent vers `/graph` (personnages/objets) ou `/lore` (lieux).
