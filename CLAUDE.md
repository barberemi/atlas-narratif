# Atlas Narratif — Contexte IA

Outil d'analyse et de construction narrative pour auteurs. SPA React + API Hono + PostgreSQL.

## Stack (résumé)
- **React 19** + **React Router v7** + **Vite 7**
- **Zustand 5** — state management (un store par domaine)
- **PostgreSQL 16** — base de données serveur (Hono API + Better Auth)
- **PGlite 0.4** — (legacy) utilisé uniquement pour le seed LOTR et les calculs purs (`computeAlerts`)
- **Anthropic SDK** — analyse IA de manuscrits (claude-sonnet / opus / haiku)
- **Tailwind CSS 4** — dark theme, couleur principale `#3F51B5` (indigo)

→ Détails : `ai/docs/stack.md`

## Routes
| Path | Composant | Rôle |
|------|-----------|------|
| `/` | `HomePage` (App.jsx) | Onboarding : créer ou importer un projet |
| `/demo` | `DemoRoute` (App.jsx) | Lien public partageable : charge la démo LOTR (seed) et redirige vers `/dashboard` |
| `/review` | `ReviewPage` | Validation après import IA |
| `/dashboard` | `NarrativeDashboard` | Stats, recommandations, incohérences |
| `/map` | `AtlasMapView` | Carte interactive + trajets personnages |
| `/lore` | `LoreBrowser` | Base lore : personnages, lieux, objets |
| `/relations` | `EntityGraph` | Graphe de relations entre entités |
| `/timeline` | `TimelineBrowser` | Timeline narrative par chapitre |
| `/savethecat` | `SaveTheCat` | Structure Save the Cat (15 beats) |
| `/arc` | `EmotionalArc` | Arc émotionnel par chapitre |
| `/plants` | `PlantsBrowser` | Tracker plant / payoff (amorces narratives) |
| `/threads` | `ThreadsBrowser` | Gestion des fils narratifs (subplots) |
| `/heros` | `HeroJourney` | Voyage du Héros — 12 étapes de Joseph Campbell |
| `/incoherences` | `IncoherencesBrowser` | Détection et résolution d'incohérences |
| `/login` | `LoginPage` | Connexion email + mot de passe |
| `/register` | `RegisterPage` | Création de compte (envoie email de vérification) |
| `/verify-email` | `VerifyEmailPage` | Écran "vérifiez votre boîte mail" |
| `/forgot-password` | `ForgotPasswordPage` | Demande de réinitialisation mot de passe |
| `/reset-password` | `ResetPasswordPage` | Saisie du nouveau mot de passe (token en query param) |
| `/account` | `AccountPage` | Gestion du compte : infos, export données, suppression |
| `/privacy` | `PrivacyPage` | Politique de confidentialité (RGPD) |
| `/terms` | `TermsPage` | Conditions générales d'utilisation |

Routes protégées par `<RequireProject>` → redirige vers `/` si aucun projet chargé.

Auth client : `src/lib/authClient.js` (better-auth/react, baseURL = `VITE_API_URL`)

→ Détails : `ai/docs/routes.md`

## Couche données
**Architecture** : `API Hono (serveur)` → `PostgreSQL 16` → `src/api/client.js` (fetch) → `stores Zustand` → composants

**Stores** (src/stores/) :
- `useVolumeStore` — volumes (tomes) + `activeVolumeId` (filtre global de tome)
- `useLoreStore` — personnages, lieux, objets
- `useTimelineStore` — événements timeline
- `useStcStore` — chapitres Save the Cat
- `useMapStore` — trajets carte
- `useArcStore` — arc émotionnel
- `useIncStore` — incohérences
- `useNotesStore` — notes libres par chapitre
- `useCharacterArcStore` — axes d'évolution + points par personnage
- `usePlantStore` — amorces narratives (plant / payoff)
- `useThreadStore` — fils narratifs (subplots)
- `useHeroJourneyStore` — étapes du Voyage du Héros

**Tables SQL principales** : `projects`, `volumes`, `characters`, `locations`, `objects`, `timeline_events`, `event_entities`, `incoherences`, `stc_chapters`, `arc_points`, `character_journeys`, `chapter_notes`, `character_arc_axes`, `character_arc_points`, `plant_payoffs`, `narrative_threads`, `groups`, `character_groups`, `hero_journey_entries`

→ Détails : `ai/docs/data-layer.md`

## Structure src/
```
src/
├── App.jsx              # Routing, layout, guards
├── components/
│   ├── dashboard/       # NarrativeDashboard, StatCard, CircularGauge
│   ├── graph/           # EntityGraph (D3 ou SVG)
│   ├── incoherences/    # IncoherencesBrowser, IncoherenceCard, FixButton
│   ├── lore/            # LoreBrowser, CharacterCard, LocationCard, EntityEditor
│   ├── map/             # AtlasMapView, MapCanvas, JourneySidebar
│   ├── nav/             # TopNav, NavDropdown, ProjectPicker
│   ├── savethecat/      # SaveTheCat, BeatRow, Frise
│   ├── search/          # GlobalSearch (Ctrl+K)
│   ├── timeline/        # TimelineBrowser, EventCard, ArcStrip
│   ├── ui/              # Button, CookieConsent, DarkCard, SidePanel, SourceBadge…
│   └── upload/          # FilePicker (drag-drop)
├── pages/               # EmotionalArc, ReviewPage
├── stores/              # Zustand stores (1 fichier par domaine)
├── db/                  # Legacy PGlite + seed LOTR + utilitaires de calcul
├── hooks/               # Custom React hooks
└── utils/               # entityUtils, etc.
```

→ Détails composants : `ai/docs/components.md`

## Flux principaux
1. **Import manuscrit** : `FilePicker` → `analyzeAndImport()` (appel Anthropic) → DB → `/review`
2. **Construction** : créer projet vide (nom + logline) → `/dashboard` → checklist « premières minutes » (`FirstRunChecklist`) qui guide la saisie (logline, 3 personnages, 1re scène)
3. **Restauration** : fichier `atlas_*.json` → `importFromBackup()` → `/dashboard`
4. **Navigation cross-vue** : les routes se passent des query params (`?tab=`, `?entity=`, `?filter=`)

## Fichiers IA
- `ai/agents/` — prompts des agents d'analyse (cohérence, product, refactoring…)
- `ai/reports/` — rapports générés par ces agents
- `ai/docs/` — cette documentation (générée pour le contexte IA)

## Environnement de développement

**Règle : aucune commande ne tourne en local. Tout passe par Docker via le Makefile.**

Ne jamais utiliser `npm run ...`, `npx ...`, ou `node ...` directement. Utiliser les commandes `make` correspondantes qui exécutent tout dans les containers Docker.

```bash
make dev           # Stack dev complète (PostgreSQL + API + Frontend)
make stop          # Arrêter la stack dev
make logs          # Logs de tous les services
make logs-s s=api  # Logs d'un service précis
make dev-rebuild   # Rebuild après changement de dépendances
make lint          # Linter (dans le container frontend)
make test          # Tests (dans le container frontend)
make build         # Build de production (dans le container frontend)
make install       # npm install dans le container frontend
make server-install # npm install dans le container API
```

## Migrations de schéma

**Règle : toute modification de `src/db/schema.js` doit s'accompagner d'un incrément de `SCHEMA_VERSION`.**

`SCHEMA_VERSION` est défini à la fin de `schema.js` (ex: `'2026-04-01.1'`). Il contrôle si `applySchema()` est rejoué au démarrage. Sans incrément, les utilisateurs existants ne recevront pas les nouvelles migrations.

Format suggéré : `'YYYY-MM-DD.N'` (date + numéro de révision du jour).

## Seed de test LOTR (données de démonstration)

Le projet "Le Seigneur des Anneaux" sert de jeu de données de test complet. Il couvre la trilogie entière (Tomes 1, 2 et 3).

**Sources de données :**
| Fichier | Contenu |
|---------|---------|
| `src/data/lotr_seed_data.js` | Lore T1, timeline T1, STC T1, plants T1, arcs T1, hero journey T1 (Frodo), `volumesDB` (3 volumes) |
| `src/data/lotr_t2_seed_data.js` | Tome 2 complet : personnages, lieux, objets (`t2Objects`), groupes (`t2GroupsDB`), événements, STC (ch 10-19), plants cross-tomes, arcs, hero journey (Aragorn), trajets carte (`t2FrodoJourney`, `t2AragornJourney`) |
| `src/data/lotr_t3_seed_data.js` | Tome 3 complet : personnages (Denethor, Roi-Sorcier, Arachne, Grima, Bouche de Sauron), lieux (Minas Tirith, Pelennor, Cirith Ungol, Mont Destin, Havres Gris…), objets, événements (ch 20-28), STC, plants (résolution des ouverts T1/T2), arcs, hero journey (Sam), trajets carte |
| `src/db/seed.lotr.js` | Point d'entrée : fusionne T1 + T2 + T3, assigne les `volumeId` |
| `src/db/seed.generic.js` | Seeder générique réutilisable pour tout projet |

**Règle : toute nouvelle fonctionnalité doit être illustrée dans le seed LOTR.**

| Si tu ajoutes… | Mets à jour… |
|----------------|-------------|
| Une nouvelle table SQL | `seed.generic.js` (nouveau bloc d'INSERT) + données dans le seed LOTR (T1, T2 ou T3 selon le tome concerné) |
| Un nouveau champ dans une table existante | `seed.generic.js` (ajouter le champ dans l'INSERT concerné) + données exemple dans le seed LOTR |
| Un nouveau store Zustand | Des données représentatives dans le fichier seed du tome approprié |
| Un nouveau tome / volume | Dupliquer le pattern de `lotr_t2_seed_data.js` / `lotr_t3_seed_data.js`, fusionner dans `seed.lotr.js` |

**Structure des données par tome :**
- `t2Characters` / `t2Locations` / `t2Objects` → fusionnés dans `loreDB` via spread
- `t2GroupsDB` / `t3GroupsDB` → fusionnés dans `groupsDB`
- `t2TimelineDB` / `t3TimelineDB` → événements avec `volumeId` (vol_deux_tours / vol_retour_roi)
- `t2ChaptersDB` / `t3ChaptersDB` → chapitres STC avec `volumeId` (requis pour les stats par tome)
- `t2PlantsDB` / `t3PlantsDB` → plants avec `plantVolumeId` / `payoffVolumeId` pour les plants cross-tomes
- `t2EventExtrasDB` / `t3EventExtrasDB` → extras indexés par `event_id` (beatId, threadIds, POV, goal/conflict/outcome)
- `t2FrodoJourney` / `t3FrodoJourney` etc. → trajets carte concaténés par personnage dans `seed.lotr.js`

**Pour re-seeder** : supprimer le projet LOTR depuis la page d'accueil, puis cliquer "Charger".

## Prompt d'analyse IA (`src/data/analysis_prompt.js`)

Ce prompt est envoyé par l'utilisateur à n'importe quel outil IA (ChatGPT, Gemini, Claude…) pour analyser un manuscrit. Il décrit exactement la structure JSON que l'IA doit retourner, qui est ensuite importée via `src/api/importFromAiOutputViaApi.js` → API serveur (`seedProjectViaApi`). Le seeder de référence pour le mapping des champs reste `src/db/seed.generic.js` (utilisé par la démo LOTR et les projets vides).

**Règle : toute modification du modèle de données doit être répercutée dans le prompt.**

| Si tu modifies… | Mets à jour dans `analysis_prompt.js`… |
|-----------------|----------------------------------------|
| Ajout d'un champ dans `characters` / `locations` / `objects` | La structure de l'entité concernée + éventuellement une règle de cohérence |
| Suppression ou renommage d'un champ | Retirer ou renommer dans la structure correspondante |
| Nouvelle table importable (ex: nouvelle entité) | Ajouter la clé au format de sortie JSON + une section `### nomTable[]` |
| Nouvelle table **non** importable (gérée uniquement en app) | Ne pas l'ajouter au prompt |
| Nouveau préfixe d'ID | L'ajouter à la section "Règles de génération des IDs" |
| Contrainte `NOT NULL` sur un champ nullable dans le prompt | Corriger le type dans le prompt + ajouter un `?? ''` / `?? []` dans `seed.generic.js` |

**Cohérence à maintenir entre les fichiers :**
- `analysis_prompt.js` — déclare ce que l'IA doit générer
- `importFromAiOutputViaApi.js` — initialise les clés manquantes (`??= []`), valide le format, envoie au serveur
- `seed.generic.js` — insère les données ; les champs non colonnes SQL doivent passer par `extra` (JSONB)
- `queries.js` — relit les champs stockés dans `extra` pour les exposer aux stores

## Maintenance de la documentation IA

**Règle : toute modification de code doit être suivie d'une mise à jour de la doc concernée — sans attendre que l'utilisateur le demande.**

| Si tu modifies… | Mets à jour… |
|-----------------|-------------|
| `package.json`, `vite.config.js`, dépendances | `ai/docs/stack.md` |
| `src/db/schema.js`, `src/db/*.js`, `src/stores/*.js` | `ai/docs/data-layer.md` |
| `src/components/**`, `src/pages/**` | `ai/docs/components.md` |
| `src/App.jsx` (routes, guards, navigation) | `ai/docs/routes.md` + `CLAUDE.md` (table des routes) |
| Ajout d'une nouvelle route ou d'un nouveau store | `CLAUDE.md` (sections Routes et Couche données) |

Ne pas mettre à jour la doc si le changement est interne à un composant sans impact sur son interface (props, comportement visible) ni sur l'architecture.

## Variables d'environnement

**Règle : toute ajout ou modification de `process.env.*` ou `import.meta.env.*` dans le code doit être répercuté dans les fichiers `.env.example` correspondants.**

| Fichier `.env.example` | Couvre | Variables |
|------------------------|-------|-----------|
| `.env.example` | Client Vite (racine) | `VITE_*`, `VITE_CRISP_WEBSITE_ID` |
| `server/.env.example` | Serveur Express (dev) | `DATABASE_URL`, `PORT`, `FRONTEND_URL`, `BETTER_AUTH_*`, `GOOGLE_*`, `RESEND_*`, `EMAIL_FROM`, `ATLAS_ENCRYPTION_KEY` |
| `.env.prod.example` | Docker Compose (prod) | Toutes les variables serveur + `DOMAIN`, `ACME_EMAIL`, `POSTGRES_PASSWORD`, `ATLAS_ENCRYPTION_KEY` |

**Quand tu ajoutes une variable d'environnement :**
1. Ajouter la variable dans le(s) `.env.example` concerné(s) avec un commentaire explicatif
2. Si la variable est **obligatoire en prod**, ajouter une vérification de présence au démarrage (comme `BETTER_AUTH_SECRET` dans `auth.js`)
3. Mettre à jour ce tableau dans `CLAUDE.md` si la variable introduit une nouvelle catégorie

## Tests

**Règle : toute modification de la couche `src/db/` doit être couverte par un test.**

| Si tu modifies… | Fichier de test à mettre à jour |
|-----------------|--------------------------------|
| Logique de `queries.js` (mapping, CRUD, calculs) | `src/db/queries.crud.test.js` |
| Calculs STC / alertes (`computeAlerts`, etc.) | `src/db/queries.test.js` |
| `detectIncoherences.js` | `src/db/detectIncoherences.test.js` |
| `exportProject.js` / `importFromBackup.js` | fichiers `.test.js` correspondants |
| Stores Zustand (`src/stores/`) | fichiers `.test.js` dans `src/stores/` |
| Utilitaires (`src/utils/`) | fichiers `.test.js` dans `src/utils/` |

Après avoir ajouté ou modifié des tests, lancer `make test` et corriger les échecs avant de considérer la tâche terminée.

Les composants React (`src/components/`, `src/pages/`) ne nécessitent pas de tests unitaires sauf si la logique est non triviale et extractible.

## Tests E2E (Playwright)

**Règle : toute nouvelle fonctionnalité visible par l'utilisateur doit s'accompagner d'un test E2E.**

| Si tu ajoutes… | Test E2E à ajouter |
|----------------|-------------------|
| Nouvelle route / page | Smoke test dans `e2e/smoke.spec.js` (la page charge) |
| Nouveau CRUD (créer/éditer/supprimer) | Tests créer + supprimer dans le fichier spec de la feature |
| Nouveau filtre, toggle, ou interaction UI | Test dans le spec de la page concernée |
| Nouveau flux multi-pages | Test dans `e2e/flows.spec.js` |

**Conventions :**
- Fichiers dans `e2e/`, un par feature (`lore.spec.js`, `timeline.spec.js`, etc.)
- Import : `import { test, expect } from './fixtures.js'`
- Locators : privilégier `getByRole()`, `getByText()`, `getByPlaceholder()` — inspecter le DOM via MCP Chrome si les locators ne matchent pas
- Chaque test CRUD doit créer ses propres données et les nettoyer (pas dépendre de l'état d'un test précédent)
- Lancer `make e2e` (Docker) et corriger les échecs avant de considérer la tâche terminée
- `data-testid` : en ajouter uniquement quand les locators natifs (`getByRole`, `getByText`) sont insuffisants (inputs sans label, boutons ambigus, confirmations multi-étapes). Ne pas en mettre partout.
