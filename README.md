# Atlas Narratif

**Architecte de cohérence narrative** — Un outil interactif pour explorer et visualiser des univers fictionnels : bases de données de lore, voyages de personnages, et graphes de relations entre entités.

> Projet actuellement développé avec le Seigneur des Anneaux (*La Communauté de l'Anneau*) comme jeu de données de test.

---

## Stack technique

| Catégorie | Technologie |
|---|---|
| Framework UI | React 19 |
| Build tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| CSS processing | PostCSS + Autoprefixer |
| Linting | ESLint 9 |
| Conteneurisation | Docker + Docker Compose |
| Runtime | Node 20 (Alpine) |

---

## Fonctionnalités

### Carte interactive
- Affichage de la carte de la Terre du Milieu
- Visualisation des voyages de Frodon, Aragorn et Gandalf sous forme de trajets colorés
- Marqueurs animés sur les positions actuelles
- Slider de timeline par personnage pour naviguer dans le voyage
- Bascule d'affichage par personnage

### Base de données de lore
- Recherche textuelle dans les personnages, lieux et objets
- Fiches détaillées : race, rôle, affiliations, traits, descriptions narratives
- Lien vers le graphe d'entités depuis chaque fiche

### Graphe d'entités
- Visualisation en nœud central + satellites des relations entre entités
- Types de relations colorés : Communauté, Allié, Porteur, Origine, Création
- Navigation entre entités au clic

### Dépôt de manuscrit
- Upload par glisser-déposer de fichiers `.txt`, `.md`, `.doc`, `.docx`
- Interface d'analyse simulée (progression) — prêt pour intégration IA

---

## Lancer le projet

### Prérequis

- Node.js 20+
- npm

### Sans Docker

```bash
npm install        # Installer les dépendances
npm run dev        # Démarrer le serveur de développement (port 5173)
npm run build      # Build de production
npm run preview    # Prévisualiser le build de production
npm run lint       # Lancer le linter
```

### Avec Docker (recommandé)

```bash
make up            # Lancer les conteneurs (build auto si nécessaire)
make start         # Démarrer le serveur Vite dans le conteneur
make build         # Build de production
make lint          # Lancer le linter
make preview       # Prévisualiser le build de production
make shell         # Ouvrir un shell dans le conteneur
make logs          # Afficher les logs en temps réel
make stop          # Arrêter les conteneurs
make restart       # Redémarrer les conteneurs
make down          # Supprimer les conteneurs
```

L'application est accessible sur [http://localhost:5173](http://localhost:5173).

---

## Structure du projet

```
atlas-narratif/
├── src/
│   ├── App.jsx                        # Routage principal et état global
│   ├── main.jsx                       # Point d'entrée React
│   ├── assets/
│   │   └── ouest_terre_du_milieu.jpg  # Carte de la Terre du Milieu
│   ├── components/
│   │   ├── map/                       # Vue carte interactive
│   │   │   ├── AtlasMapView.jsx
│   │   │   ├── MapCanvas.jsx
│   │   │   ├── JourneySidebar.jsx
│   │   │   └── JourneyTimeline.jsx
│   │   ├── lore/                      # Navigateur de base de données
│   │   │   └── LoreBrowser.jsx
│   │   ├── graph/                     # Graphe d'entités
│   │   │   └── EntityGraph.jsx
│   │   ├── upload/                    # Interface de dépôt de fichiers
│   │   │   └── FilePicker.jsx
│   │   └── ui/                        # Composants UI réutilisables
│   │       ├── Button.jsx
│   │       └── LoreCard.jsx
│   ├── data/
│   │   ├── lore_database.js           # Base de données lore (personnages, lieux, objets)
│   │   ├── frodo_journey.js           # Données de voyage de Frodon
│   │   ├── aragorn_journey.js         # Données de voyage d'Aragorn
│   │   └── gandalf_journey.js         # Données de voyage de Gandalf
│   └── utils/
│       └── buildGraph.js              # Construction des graphes de relations
├── Dockerfile
├── docker-compose.yml
├── Makefile
├── vite.config.js
└── package.json
```

---

## Données

Toutes les données sont côté client, sans backend. La base de données (`lore_database.js`) contient :

- **Personnages** : Frodon, Aragorn, Gandalf, Sam, Merry, Pippin, Legolas, Boromir, Elrond, etc.
- **Lieux** : La Comté, Fondcombe, La Moria, Bree, Rivendell, etc.
- **Objets** : L'Anneau Unique, Narya, etc.

Les voyages des personnages incluent les coordonnées cartographiques, les références aux chapitres, les descriptions narratives et les alliés présents à chaque étape.


# A faire


1- Ajouter des type de narration (Le voyage du héro, Structure en 3 actes, Story Circle ?)

2- Arc emotionnel : Courbe de tension dramatique chapitre par chapitre, générée ou saisie manuellement

9- Onboarding guidé pour nouveaux auteurs