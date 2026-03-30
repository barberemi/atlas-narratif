# Stack technique — Atlas Narratif

## Runtime & build
| Outil | Version | Rôle |
|-------|---------|------|
| React | 19.2 | UI, hooks, context |
| React Router | 7.13 | SPA routing (`<BrowserRouter>` implicite via `react-router-dom`) |
| Vite | 7.3 | Build tool, HMR, worker bundling |
| @vitejs/plugin-react | 5.1 | Babel/SWC transform pour JSX |

## Styling
- **Tailwind CSS 4.2** via PostCSS (`@tailwindcss/postcss`)
- Pas de `tailwind.config.js` étendu (config minimaliste)
- Couleur principale : `#3F51B5` (indigo Material)
- Dark theme : fond `#0B1621`, texte `slate-200`
- Pattern inline styles fréquent pour les couleurs dynamiques/opacités

## State management
- **Zustand 5** — stores indépendants, pas de store global monolithique
- Pattern : `createEntityStore.js` utilisé comme factory générique
- Chaque store charge ses données depuis PGlite au montage

## Base de données
- **PGlite 0.4** (`@electric-sql/pglite`) — PostgreSQL compilé en WASM
- Tourne dans un **Web Worker** (`pglite-worker.js`) pour ne pas bloquer le thread principal
- Persistance via **OPFS** (Origin Private File System) — données stockées localement dans le navigateur
- `SharedArrayBuffer` requis → headers COOP/COEP configurés dans `vite.config.js`
- API : `db.exec()` pour DDL, `db.query()` pour SELECT, paramètres positionnels `$1, $2…`

## IA / LLM
- **Pas de dépendance SDK** — l'analyse IA est déléguée à l'utilisateur (Claude.ai)
- Flux : `buildAnalysisPrompt()` génère un prompt auto-contenu → l'utilisateur le colle dans Claude.ai → il importe le JSON résultant via `importFromClaudeOutput()`
- Sources :
  - `src/data/analysis_prompt.js` — générateur du prompt d'analyse (mode manuscrit ou notes)
  - `src/db/importFromClaudeOutput.js` — import du fichier JSON produit par Claude

## Contraintes techniques notables
- **SharedArrayBuffer** : nécessite `Cross-Origin-Opener-Policy: same-origin` + `Cross-Origin-Embedder-Policy: require-corp` → configuré dans `vite.config.js` pour le dev, à répliquer en prod (nginx/Docker)
- **OPFS** : pas de support dans tous les navigateurs (Chrome/Edge OK, Firefox OK, Safari partiel)
- Pas de backend — 100% client-side, zéro serveur applicatif
- Export/import via fichiers JSON (`atlas_*.json`)

## Docker
- Image : `node:20-alpine`
- `npm run build` → `dist/` servi par nginx ou `vite preview`
- `docker-compose.yml` pour orchestration locale
