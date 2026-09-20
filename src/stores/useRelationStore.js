import { createEntityStore } from './createEntityStore';
import { getRelations, insertRelation, updateRelation, deleteRelation } from '../api/client';
import { setRelationCache } from '../utils/entityUtils';

/**
 * Relations explicites entre entités (Niveau 3). Alimente le cache module-level
 * (`setRelationCache`) consommé par `buildGraph` pour dessiner les arêtes.
 */
export const useRelationStore = createEntityStore({
  initialState: { relations: null },
  fetchFn: async (projectId) => {
    const relations = await getRelations(projectId);
    setRelationCache(relations);
    return { relations };
  },
  insertFn: insertRelation,
  updateFn: updateRelation,
  deleteFn: deleteRelation,
});
