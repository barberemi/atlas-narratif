import { create } from 'zustand';
import { TOUR_STEPS } from '../data/tour_steps';

export const useTourStore = create((set, get) => ({
  active:    false,
  stepIndex: 0,

  // Démarre le tour depuis une étape donnée (0 par défaut)
  start: (fromIndex = 0) => set({ active: true, stepIndex: fromIndex }),

  // Démarre le tour à l'étape correspondant à une route donnée
  startAtRoute: (route) => {
    const idx = TOUR_STEPS.findIndex(s => s.route === route);
    set({ active: true, stepIndex: idx >= 0 ? idx : 0 });
  },

  next: () => {
    const { stepIndex } = get();
    const next = stepIndex + 1;
    if (next >= TOUR_STEPS.length) {
      set({ active: false, stepIndex: 0 });
    } else {
      set({ stepIndex: next });
    }
  },

  prev: () => {
    const { stepIndex } = get();
    if (stepIndex > 0) set({ stepIndex: stepIndex - 1 });
  },

  stop: () => set({ active: false, stepIndex: 0 }),
}));
