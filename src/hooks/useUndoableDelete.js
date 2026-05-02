import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from '../lib/toast';

/**
 * Hook fournissant une fonction `undoableDelete` qui :
 * 1. Exécute la suppression (qui retourne un snapshot)
 * 2. Affiche un toast avec bouton "Annuler" pendant 6 secondes
 * 3. Si annulé : appelle restoreFn + reloadFn pour tout restaurer
 */
export function useUndoableDelete() {
  const { t } = useTranslation();
  return useCallback(async function undoableDelete({ deleteFn, restoreFn, reloadFn, label }) {
    const snapshot = await deleteFn();
    if (!snapshot) return;

    toast(label ?? t('toast.elementDeleted'), {
      action: {
        label: t('btn.cancel'),
        onClick: async () => {
          try {
            await restoreFn(snapshot);
            if (reloadFn) await reloadFn();
            toast.success(t('toast.restored'));
          } catch {
            toast.error(t('toast.restoreFailed'));
          }
        },
      },
      duration: 6000,
    });
  }, [t]);
}
