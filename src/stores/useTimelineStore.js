import { createEntityStore } from './createEntityStore';
import {
  getTimelineEvents,
  insertTimelineEvent,
  updateTimelineEvent,
  deleteTimelineEvent,
} from '../api/client';

export const useTimelineStore = createEntityStore({
  initialState: { events: null },
  fetchFn:  async (projectId) => ({ events: await getTimelineEvents(projectId) }),
  insertFn: insertTimelineEvent,
  updateFn: updateTimelineEvent,
  deleteFn: deleteTimelineEvent,
});
