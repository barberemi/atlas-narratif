const STORAGE_PREFIX = 'atlas_tour_seen_';

export function shouldShowWelcome(projectId) {
  if (!projectId) return false;
  return !localStorage.getItem(`${STORAGE_PREFIX}${projectId}`);
}

export function markWelcomeSeen(projectId) {
  if (!projectId) return;
  localStorage.setItem(`${STORAGE_PREFIX}${projectId}`, '1');
}
