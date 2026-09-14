# Onboarding — Atlas Narratif

> Registre des sujets d'onboarding pour un développeur nouveau sur le projet, organisé en cursus (tronc → branches → capstone → culture). Chaque entrée est un catalogue ; le contenu de cours est généré à la demande sous `ai/onboarding/NN-<slug>.md`.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Environnement de dev Docker + Makefile (Day 1)
- **Type** : tronc
- **Niveau** : débutant
- **Périmètre** : lancer la stack complète (PostgreSQL + API Hono + frontend Vite), la tester et la relancer, sans jamais exécuter npm/node en local.
- **Prérequis** : aucun
- **Références** : `Makefile`, `docker-compose.dev-full.yml`, `ai/testing-quality.md`, `CLAUDE.md`

Règle absolue du projet : aucune commande ne tourne en local, tout passe par Docker via le `Makefile` (`make dev`, `make stop`, `make logs`, `make test`, `make lint`, `make build`). Le cours couvre le démarrage de la stack à trois services (frontend `5173`, API `3001`, Postgres `5432`), les cibles Makefile les plus utilisées, et pourquoi `make dev-rebuild` est nécessaire après un changement de dépendances. C'est le premier réflexe à acquérir : toute la doc et tous les scripts supposent ce mode d'exécution.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Cycle de vie d'une donnée : Postgres → API → store → composant
- **Type** : tronc
- **Niveau** : intermédiaire
- **Périmètre** : suivre une entité (personnage, événement…) de la table PostgreSQL jusqu'au rendu React, dans les deux sens (lecture et écriture).
- **Prérequis** : Environnement de dev Docker + Makefile (Day 1)
- **Références** : `ai/architecture/overview.md`, `server/src/routes/api.js`, `server/src/db-queries.js`, `src/api/client.js`, `src/db/ProjectContext.jsx`, `src/stores/createEntityStore.js`

Architecture 3-tiers sans BFF ni GraphQL : `React SPA ──HTTP──▸ Hono API ──SQL──▸ PostgreSQL`. Le cours trace le chemin de lecture (composant → `store.load(projectId)` → fetch `src/api/client.js` → route `server/src/routes/api.js` → requête `db-queries.js` → Postgres → hydratation du store) et le chemin d'écriture symétrique. Points clés : la factory `createEntityStore` qui standardise le CRUD des 12 stores Zustand, et `ProjectProvider.loadAll()` qui hydrate 5 stores critiques bloquants puis les stores secondaires en parallèle à chaque changement de projet. C'est le modèle mental partagé indispensable avant toute branche.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Topologie : modules, routes, stores et systèmes externes
- **Type** : tronc
- **Niveau** : débutant
- **Périmètre** : savoir quels modules existent (frontend / server / ai), où vivent les 12 stores et les routes, et quels systèmes externes le projet appelle.
- **Prérequis** : Environnement de dev Docker + Makefile (Day 1)
- **Références** : `ai/repo-map.md`, `src/App.jsx`, `server/src/index.js`, `server/src/auth.js`, `src/stores/`

Carte du territoire. Le cours parcourt la structure `src/` (composants par domaine, `stores/`, `db/` legacy PGlite, `data/` seed & prompt) et `server/` (Hono, `auth.js`, `db.js`, `routes/`, `middleware/`), la table des routes de `src/App.jsx` (protégées par `<RequireProject>`), et les 12 stores domaine. Systèmes externes nommés dans la config : **PostgreSQL 16** (données), **Resend** (envoi d'emails en prod, cf. `server/package.json`), **Google OAuth** (connexion optionnelle env-gated dans `server/src/auth.js`), et **Crisp** (chat support, `VITE_CRISP_WEBSITE_ID`). Aucun repo compagnon détecté sur cette machine.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Pipeline d'import IA d'un manuscrit
- **Type** : branche
- **Niveau** : intermédiaire
- **Périmètre** : comprendre comment un manuscrit analysé par une IA externe devient un projet peuplé, du prompt jusqu'à la page de validation.
- **Prérequis** : Cycle de vie d'une donnée : Postgres → API → store → composant
- **Références** : `src/data/analysis_prompt.js`, `src/db/importFromAiOutput.js`, `src/api/importFromAiOutputViaApi.js`, `src/db/seed.generic.js`, `src/pages/ReviewPage.jsx`

Flux d'import #1 du produit. `analysis_prompt.js` décrit à l'utilisateur la structure JSON que n'importe quel outil IA (ChatGPT, Gemini, Claude…) doit produire ; `importFromAiOutput.js` normalise ce JSON (initialisation des clés manquantes, validation), puis `seed.generic.js` insère les données (les champs hors colonnes SQL passent par `extra` JSONB) avant redirection vers `/review`. Le cours insiste sur la triple cohérence à maintenir — `analysis_prompt.js` ↔ `importFromAiOutput.js` ↔ `seed.generic.js` ↔ `queries.js` — décrite dans `CLAUDE.md`, car toute modification du modèle de données doit être répercutée dans le prompt.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Le seed LOTR comme contrat de données
- **Cours** : ai/onboarding/01-le-seed-lotr-comme-contrat-de-donnees.md
- **Type** : branche
- **Niveau** : intermédiaire
- **Périmètre** : maîtriser le jeu de données de démonstration "Le Seigneur des Anneaux" et la règle qui impose d'y illustrer toute nouvelle fonctionnalité.
- **Prérequis** : Pipeline d'import IA d'un manuscrit
- **Références** : `src/data/lotr_seed_data.js`, `src/data/lotr_t2_seed_data.js`, `src/data/lotr_t3_seed_data.js`, `src/db/seed.lotr.js`, `src/db/seed.generic.js`

Connaissance tribale critique : le projet LOTR (trilogie complète, 3 tomes/volumes) sert de jeu de test exhaustif et **toute nouvelle table, champ ou store doit y être illustré**. Le cours explique le découpage par tome (`t2Characters`, `t3GroupsDB`, `t2TimelineDB` avec `volumeId`, plants cross-tomes via `plantVolumeId`/`payoffVolumeId`, extras indexés par `event_id`), comment `seed.lotr.js` fusionne T1+T2+T3 et assigne les `volumeId`, et la procédure de re-seed (supprimer le projet puis "Charger"). Sans cette discipline, les données de démo divergent silencieusement du schéma.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Authentification Better Auth & multi-tenancy
- **Type** : branche
- **Niveau** : avancé
- **Périmètre** : comprendre comment sessions authentifiées et appareils anonymes cohabitent pour scoper les projets côté serveur et client.
- **Prérequis** : Topologie : modules, routes, stores et systèmes externes
- **Références** : `server/src/auth.js`, `src/lib/authClient.js`, `server/src/middleware/requireIdentity.js`, `server/src/middleware/requireProjectOwner.js`, `src/App.jsx`

Sujet transverse serveur+client. Better Auth gère email+mot de passe et Google OAuth optionnel, avec sessions stockées en PostgreSQL (`server/src/auth.js`) et bindings React (`src/lib/authClient.js`, baseURL = `VITE_API_URL`). Le cours détaille le double scoping : chaque requête extrait un `userId` (session, cookie `credentials: 'include'`) et/ou un `deviceId` (header `X-Device-Id`) — un projet appartient soit à un utilisateur connecté, soit à un appareil anonyme. Il couvre aussi la chaîne de middleware (`requireAuth`, `requireIdentity`, `requireProjectOwner`) et les guards de route côté SPA (`<RequireProject>`, pages `/login` `/register` `/verify-email`).

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Détection d'incohérences narratives
- **Type** : branche
- **Niveau** : avancé
- **Périmètre** : comprendre la logique automatisée qui repère les contradictions dans un manuscrit et comment elle est exposée puis résolue dans l'UI.
- **Prérequis** : Cycle de vie d'une donnée : Postgres → API → store → composant
- **Références** : `src/db/detectIncoherences.js`, `src/db/detectIncoherences.test.js`, `src/data/severity_config.js`, `src/components/incoherences/`, `ai/docs/incoherences.md`

Logique métier dense et l'une des rares couvertes par des tests dédiés (`detectIncoherences.test.js` — toute modification de `detectIncoherences.js` doit y ajouter un cas). Le cours parcourt les règles de détection, les niveaux de sévérité (`severity_config.js`), et l'affichage/résolution via `IncoherencesBrowser` et ses cartes/actions de correction. Point d'attention : cette couche fait partie des calculs "purs" qui peuvent encore s'appuyer sur les résidus PGlite de `src/db/`.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Le filtre global par tome (volumes)
- **Type** : branche
- **Niveau** : intermédiaire
- **Périmètre** : comprendre le filtre transverse `activeVolumeId` qui restreint quasiment toutes les vues à un tome donné.
- **Prérequis** : Cycle de vie d'une donnée : Postgres → API → store → composant
- **Références** : `src/stores/useVolumeStore.js`, `src/hooks/useVolumeFilter.js`, `src/data/lotr_seed_data.js`

Mécanisme transverse facile à casser. `useVolumeStore` détient `activeVolumeId` (le tome actif) et le hook `useVolumeFilter` filtre les entités affichées dans la plupart des vues (timeline, STC, stats, carte…). Le cours montre pourquoi les données seed portent un `volumeId` (requis notamment pour les stats par tome dans les chapitres STC), et comment une nouvelle vue doit consommer ce filtre pour rester cohérente avec le sélecteur de tome global.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Capstone — Ajouter un champ à une entité de bout en bout
- **Type** : capstone
- **Niveau** : intermédiaire
- **Périmètre** : réaliser une première tâche réelle qui traverse tout le tronc : ajouter un nouveau champ à une entité et le faire vivre du schéma SQL jusqu'à l'UI, aux tests et au seed.
- **Prérequis** : Cycle de vie d'une donnée : Postgres → API → store → composant ; Pipeline d'import IA d'un manuscrit ; Le seed LOTR comme contrat de données
- **Références** : `server/db/init.sql`, `server/src/db-queries.js`, `src/api/client.js`, `src/db/seed.generic.js`, `src/data/analysis_prompt.js`, `CLAUDE.md`

Exercice guidé de synthèse (aucun tutoriel préexistant sous `ai/` — celui-ci est le premier). Le parcours suit la checklist implicite de `CLAUDE.md` : ajouter la colonne dans le schéma serveur (`server/db/init.sql`) et la requête (`db-queries.js`), l'exposer via `src/api/client.js` et le store, l'afficher dans le composant, puis fermer les trois boucles obligatoires du projet — répercuter le champ dans `analysis_prompt.js` (contrat d'import), l'insérer dans `seed.generic.js` + illustrer dans le seed LOTR, et ajouter un test. C'est le meilleur moyen de vérifier que le modèle mental du tronc est acquis.

<!-- proposé par l'audit onboarding (2026-07-29) -->
## Culture : portes qualité et règles de synchronisation
- **Type** : culture
- **Niveau** : débutant
- **Périmètre** : intérioriser les gates CI et les règles non négociables du projet (tests, seed, prompt, doc) pour ne jamais casser `main`.
- **Prérequis** : Environnement de dev Docker + Makefile (Day 1)
- **Références** : `.github/workflows/ci.yml`, `ai/testing-quality.md`, `CLAUDE.md`, `e2e/`

Les normes de l'équipe, à voir tôt. La CI impose trois gates bloquants sur chaque PR vers `main` : `npm run lint`, `npm run test:run`, `npm run build` (localement : `make lint && make test && make build`). Le cours couvre les règles impératives de `CLAUDE.md` : toute modif de `src/db/` doit être testée ; toute nouvelle fonctionnalité visible doit avoir un test E2E Playwright (`e2e/`, un spec par feature, `make e2e`) ; toute modif du modèle de données doit être répercutée dans le prompt d'analyse et le seed LOTR ; toute modif de code doit mettre à jour la doc `ai/docs/` concernée sans attendre qu'on le demande. Projet en JS pur : pas de gate de typage.
