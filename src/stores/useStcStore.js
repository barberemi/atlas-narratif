import { createEntityStore } from './createEntityStore';
import {
  getStcChapters,
  insertStcChapter,
  updateStcChapter,
  deleteStcChapter,
} from '../db/queries';

export const useStcStore = createEntityStore({
  initialState: { chapters: null },
  fetchFn:  async (db, projectId) => ({ chapters: await getStcChapters(db, projectId) }),
  insertFn: insertStcChapter,
  updateFn: updateStcChapter,
  deleteFn: deleteStcChapter,
});
