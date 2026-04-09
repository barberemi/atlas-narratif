# Stack technique — Atlas Narratif

## Frontend

| Outil | Version | Rôle |
|-------|---------|------|
| React | 19.x | UI, hooks, context |
| React Router | 7.x | SPA routing (`BrowserRouter`) |
| Vite | 7.x | Build tool, HMR |
| @vitejs/plugin-react | 5.x | JSX transform |
| Zustand | 5.x | State management |
| Tailwind CSS | 4.x | Styling via PostCSS |

## Backend (server/)

| Outil | Rôle |
|-------|------|
| **Hono** | Framework HTTP léger (Node 20) |
| **postgres.js** | Client PostgreSQL (tagged template SQL) |
| **Better Auth** | Auth complète : email/password, Google OAuth, email de vérification, reset password |
| **Resend** | Emails transactionnels (fallback console en dev si `RESEND_API_KEY` absent) |

### postgres.js — syntaxe
```js
// Requêtes paramétrées (safe)
const rows = await sql`SELECT * FROM t WHERE id = ${id}`;

// Colonnes dynamiques (unsafe, avec whitelist)
await sql.unsafe(`UPDATE t SET ${col} = $1 WHERE id = $2`, [val, id]);

// Transactions
await sql.begin(async tx => {
  await tx`INSERT INTO ...`;
  await tx`INSERT INTO ...`;
});

// Retourne directement un tableau de lignes (pas de { rows })
// JSONB est retourné comme objet JS parsé
```

## Auth — Better Auth v1.x

- Config dans `server/src/auth.js`
- `basePath: '/auth'` (⚠ différent du défaut `/api/auth`)
- Monté dans Hono : `app.on(['GET','POST'], '/auth/**', c => auth.handler(c.req.raw))`
- Client React : `createAuthClient` depuis `better-auth/react` (pas `better-auth/client`)
- `src/lib/authClient.js` expose `signIn`, `signUp`, `signOut`, `useSession`

## Couche API client (src/api/client.js)

Remplace les anciens appels PGlite directs. Toutes les fonctions d'accès aux données passent par `fetch()` vers le serveur Hono.

```js
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';
// En prod (Docker), VITE_API_URL="" → URLs relatives → nginx proxy vers api:3001
```

## Styling

- **Tailwind CSS 4** via PostCSS
- Couleur principale : `#3F51B5` (indigo Material)
- Dark theme : fond `#0B1621`, texte `slate-200`
- Pattern inline styles pour couleurs dynamiques/opacités

## Docker

### Dev
- **Option A** : `docker-compose.dev-full.yml up` → lance PostgreSQL + API (hot reload) + frontend en une commande. `env_file: ./server/.env` injecte les variables (dont `RESEND_API_KEY`).
- **Option B** : `docker-compose.dev-full.yml up postgres` seul → frontend et serveur lancés manuellement (`npm run dev` + `node --watch --env-file=.env src/index.js`)

### Prod
- `docker-compose.prod.yml` → stack complète : Traefik + nginx (frontend) + api + postgres
- `Dockerfile.prod` → build React avec `VITE_API_URL=""` (URLs relatives)
- `server/Dockerfile` → image Node 20 alpine pour l'API
- `nginx.prod.conf` → proxy `/api/` et `/auth/` vers `api:3001`, SPA fallback
- Traefik gère HTTPS + Let's Encrypt automatiquement

## Variables d'environnement

### server/.env (dev)
```
DATABASE_URL=postgresql://atlas:atlas_dev@localhost:5432/atlas
PORT=3001
FRONTEND_URL=http://localhost:5173
BETTER_AUTH_SECRET=...
BETTER_AUTH_URL=http://localhost:3001
GOOGLE_CLIENT_ID=          # optionnel
GOOGLE_CLIENT_SECRET=      # optionnel
RESEND_API_KEY=            # optionnel
EMAIL_FROM=...
```

### .env.prod (prod — voir .env.prod.example)
```
DOMAIN=atlas.tondomain.com
ACME_EMAIL=...
POSTGRES_PASSWORD=...
BETTER_AUTH_SECRET=...
GOOGLE_CLIENT_ID=          # optionnel
GOOGLE_CLIENT_SECRET=      # optionnel
RESEND_API_KEY=            # optionnel
EMAIL_FROM=...
```

## Ce qui n'est plus utilisé

- **PGlite / OPFS** — remplacé par PostgreSQL serveur. Les fichiers `src/db/` sont conservés pour le seed LOTR et les utilitaires de calcul (`computeAlerts`), mais plus aucun composant n'appelle PGlite directement.
- **SharedArrayBuffer / COOP-COEP headers** — plus nécessaires (supprimés de `nginx.prod.conf`)
- **DbContext / DbProvider** — supprimés de `App.jsx`
