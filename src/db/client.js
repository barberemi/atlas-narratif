import { PGliteWorker } from '@electric-sql/pglite/worker';

/**
 * Retourne le singleton PGlite via Web Worker + OPFS-AHP.
 *
 * La promesse est stockée sur window pour deux raisons :
 *  1. Survivre aux reloads HMR (Vite réinitialise les modules, pas window)
 *  2. Éviter le double appel React 18 StrictMode : les deux useEffect
 *     démarrent avant que le premier soit résolu — stocker la promesse
 *     (pas sa valeur) garantit qu'un seul worker est jamais créé.
 */
export function getDb() {
  if (!window.__atlas_db_promise) {
    window.__atlas_db_promise = PGliteWorker.create(
      new Worker(new URL('./pglite-worker.js', import.meta.url), { type: 'module' }),
      { dataDir: 'atlas-narratif' },
    );
  }
  return window.__atlas_db_promise;
}
