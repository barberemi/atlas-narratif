/**
 * Initialisation de la DB : schéma + seed.
 * Idempotent et protégé contre le double-appel React StrictMode
 * via le même pattern window-promise que getDb().
 */
import { applySchema } from './schema';

export function initDb(db) {
  if (!window.__atlas_init_promise) {
    window.__atlas_init_promise = _run(db).catch(err => {
      window.__atlas_init_promise = null; // permet un retry si erreur
      throw err;
    });
  }
  return window.__atlas_init_promise;
}

async function _run(db) {
  await applySchema(db);
}
