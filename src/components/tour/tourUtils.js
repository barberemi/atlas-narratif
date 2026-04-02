const STORAGE_KEY = 'atlas_tour_seen';

export function shouldShowWelcome() {
  return !localStorage.getItem(STORAGE_KEY);
}

export function markWelcomeSeen() {
  localStorage.setItem(STORAGE_KEY, '1');
}
