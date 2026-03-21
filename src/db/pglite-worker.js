import { PGlite } from '@electric-sql/pglite';
import { worker } from '@electric-sql/pglite/worker';

// IndexedDB via le préfixe idb:// — plus simple qu'OPFS, sans contraintes
// de handles exclusifs. Migration vers OPFS possible plus tard.
worker({
  async init(options) {
    return new PGlite(`idb://${options.dataDir}`);
  },
});
