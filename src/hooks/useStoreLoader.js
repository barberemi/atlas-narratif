import { useEffect } from 'react';
import { useProject } from '../db/ProjectContext';

/**
 * Charge les stores passés en argument pour le projet actif.
 * Les guards idempotents dans chaque store empêchent les re-fetch inutiles.
 *
 * @param {Array} stores — tableau de stores Zustand ayant une méthode `load(projectId)`
 */
export function useStoreLoader(stores) {
  const { projectId } = useProject();
  useEffect(() => {
    if (!projectId) return;
    for (const store of stores) {
      store.getState().load(projectId);
    }
  // Les stores sont statiques par composant, projectId est la seule dépendance dynamique
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);
}
