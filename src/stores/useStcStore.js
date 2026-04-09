import { createEntityStore } from './createEntityStore';
import {
  getStcChapters,
  insertStcChapter,
  updateStcChapter,
  deleteStcChapter,
} from '../api/client';

export const useStcStore = createEntityStore({
  initialState: { chapters: null },
  fetchFn:  async (projectId) => ({ chapters: await getStcChapters(projectId) }),
  insertFn: insertStcChapter,
  updateFn: updateStcChapter,
  deleteFn: deleteStcChapter,
});
