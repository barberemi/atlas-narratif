import { useVolumeStore } from '../stores/useVolumeStore';

/**
 * Retourne une fonction de filtrage basée sur le tome actif.
 *
 * Usage :
 *   const filterByVolume = useVolumeFilter();
 *   const visibleEvents = filterByVolume(events); // utilise 'volumeId' par défaut
 *
 * Règle :
 *   - activeVolumeId === null  → toute la série, pas de filtre
 *   - activeVolumeId !== null  → item.volumeId === null (rétrocompat) OU item.volumeId === activeVolumeId
 */
export function useVolumeFilter() {
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);

  return function filterByVolume(items, key = 'volumeId') {
    if (!activeVolumeId || !items) return items ?? [];
    return items.filter(item => item[key] == null || item[key] === activeVolumeId);
  };
}
