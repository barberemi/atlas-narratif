# Atlas Narratif

**Outil d'analyse et de construction narrative pour auteurs.** Lore, timeline, carte interactive, arc émotionnel, détection d'incohérences, Voyage du Héros, Save the Cat.

---

## Architecture

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + React Router v7 + Vite 7 |
| Styling | Tailwind CSS 4 (dark theme, indigo `#3F51B5`) |
| State | Zustand 5 (un store par domaine) |
| API serveur | Hono (Node 20) |
| Base de données | PostgreSQL 16 |
| Auth | Better Auth (email/password, Google OAuth, email de vérification) |
| Email | Resend (fallback console en dev) |
| Conteneurisation | Docker + Docker Compose + Traefik (prod) |

---

## Lancer en développement

### Option A — Tout en Docker (recommandé)

```bash
docker compose -f docker-compose.dev-full.yml up
```

Lance PostgreSQL + l'API (hot reload) + le frontend en une seule commande.
Les emails sans `RESEND_API_KEY` s'affichent dans les logs du conteneur `api`.

### Option B — Natif (Node local)

**Prérequis :** Node.js 20+, Docker (pour PostgreSQL)

```bash
# 1. Base de données
docker compose -f docker-compose.dev-full.yml up postgres -d

# 2. Serveur API
cp server/.env.example server/.env   # valeurs par défaut suffisantes
cd server && npm install
node --watch --env-file=.env src/index.js

# 3. Frontend (depuis la racine)
npm install
npm run dev      # http://localhost:5173
```

> **Google OAuth en dev** : ajouter `http://localhost:3001/auth/callback/google` comme URI de redirection autorisée dans la Google Cloud Console.

---

## Déploiement en production (VPS)

### Prérequis

- Docker + Docker Compose installés sur le VPS
- Un domaine pointant vers le VPS

### Déployer

```bash
git clone <repo> && cd atlas-narratif

# Remplir les variables (domaine, mot de passe DB, secrets…)
cp .env.prod.example .env.prod
nano .env.prod

# Build et démarrage (Traefik gère le TLS automatiquement)
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Variables obligatoires dans `.env.prod` :

| Variable | Description |
|----------|-------------|
| `DOMAIN` | Nom de domaine (ex: `atlas.monsite.com`) |
| `ACME_EMAIL` | Email pour Let's Encrypt |
| `POSTGRES_PASSWORD` | Mot de passe PostgreSQL |
| `BETTER_AUTH_SECRET` | Secret JWT (min 32 chars, `openssl rand -base64 32`) |

Variables optionnelles : `GOOGLE_CLIENT_ID/SECRET` (OAuth Google), `RESEND_API_KEY` + `EMAIL_FROM` (emails transactionnels).

---

## Commandes utiles

```bash
npm run dev      # Frontend dev (port 5173)
npm run build    # Build production
npm run lint     # ESLint
npm run test:run # Tests unitaires
```

---

## Structure du projet

```
atlas-narratif/
├── src/                        # Frontend React
│   ├── App.jsx                 # Routing, layout, guards
│   ├── api/                    # Client fetch (remplace les appels PGlite directs)
│   │   ├── client.js           # Toutes les fonctions d'accès à l'API
│   │   └── importFromAiOutputViaApi.js
│   ├── components/             # Composants UI par domaine
│   ├── pages/                  # Pages auth (login, register…)
│   ├── stores/                 # Zustand stores (1 par domaine)
│   ├── db/                     # Utilitaires client : seed, export, import, détection incohérences
│   ├── lib/
│   │   └── authClient.js       # Client Better Auth (useSession, signIn…)
│   └── data/                   # Données seed LOTR, prompt d'analyse IA
├── server/                     # API Hono
│   ├── src/
│   │   ├── index.js            # Point d'entrée, montage Traefik/auth/api
│   │   ├── auth.js             # Config Better Auth
│   │   ├── db.js               # Connexion postgres.js
│   │   ├── db-queries.js       # Fonctions SQL serveur
│   │   ├── seed.js             # Seeder générique serveur
│   │   ├── middleware/
│   │   │   └── requireAuth.js
│   │   └── routes/
│   │       └── api.js          # Toutes les routes REST
│   ├── db/
│   │   └── init.sql            # Schéma SQL (Better Auth + tables app)
│   └── .env.example
├── docker-compose.dev-full.yml # PostgreSQL local pour le dev
├── docker-compose.prod.yml     # Stack prod complète (Traefik + nginx + api + postgres)
├── Dockerfile.prod             # Build frontend (nginx)
├── server/Dockerfile           # Build API (Node)
├── nginx.prod.conf             # nginx prod (proxy /api/ /auth/ → api)
└── .env.prod.example           # Template variables de prod
```

---

## Données de démonstration

Le projet "Le Seigneur des Anneaux" (Tomes 1 & 2) est intégré comme jeu de données de test. Depuis la page d'accueil, cliquer **"Charger la démo"** pour le seed automatiquement via l'API.
