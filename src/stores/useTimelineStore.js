import { createEntityStore } from './createEntityStore';
import {
  getTimelineEvents,
  insertTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '../db/queries';

export const useTimelineStore = createEntityStore({
  initialState: { events: null },
  fetchFn:  async (db, projectId) => ({ events: await getTimelineEvents(db, projectId) }),
  insertFn: insertTimelineEvent,
  updateFn: updateTimelineEvent,
  deleteFn: deleteTimelineEvent,
});
