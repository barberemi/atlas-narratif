import { createContext, useContext, useState, useEffect } from 'react';
import { getDb }  from './client';
import { initDb } from './init';

const DbCtx = createContext(null);

export function DbProvider({ children }) {
  const [db, setDb] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getDb()
      .then(db => initDb(db).then(() => db))
      .then(db => { if (!cancelled) setDb(db); })
      .catch(err => console.error('[DbProvider]', err));
    return () => { cancelled = true; };
  }, []);

  return <DbCtx.Provider value={db}>{children}</DbCtx.Provider>;
}

/** Retourne l'instance PGlite, ou null tant que la DB n'est pas prête. */
export function useDb() {
  return useContext(DbCtx);
}
