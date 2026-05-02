import { create } from 'zustand';

/**
 * Micro-store pour l'indicateur de sauvegarde global dans la TopNav.
 *
 * Les stores appellent `markSaving()` avant une opération API
 * et `markSaved()` après. La TopNav affiche :
 * - "Enregistrement…" quand `saving > 0`
 * - "Sauvegardé ✓" pendant 2s après la dernière sauvegarde
 * - rien sinon
 */
export const useSaveIndicator = create((set) => ({
  /** Nombre d'opérations en cours (permet les sauvegardes concurrentes) */
  saving: 0,
  /** Timestamp du dernier save terminé (pour afficher "Sauvegardé ✓" temporairement) */
  lastSavedAt: 0,

  markSaving: () => set(s => ({ saving: s.saving + 1 })),

  markSaved: () => set(s => ({
    saving: Math.max(0, s.saving - 1),
    lastSavedAt: Date.now(),
  })),
}));
