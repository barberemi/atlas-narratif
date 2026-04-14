import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// Mock sonner toast — vi.mock est hoisted, on utilise vi.hoisted pour partager la référence
const { mockToast } = vi.hoisted(() => {
  const fn = vi.fn();
  fn.success = vi.fn();
  fn.error = vi.fn();
  return { mockToast: fn };
});

vi.mock('../lib/toast', () => ({ toast: mockToast }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key) => key }) }));

import { useUndoableDelete } from './useUndoableDelete';

beforeEach(() => {
  vi.clearAllMocks();
  mockToast.success = vi.fn();
  mockToast.error = vi.fn();
});

describe('useUndoableDelete', () => {
  it('retourne une fonction', () => {
    const { result } = renderHook(() => useUndoableDelete());
    expect(typeof result.current).toBe('function');
  });

  it('appelle deleteFn et affiche un toast', async () => {
    const snapshot = { entity: { id: 'char_1', name: 'Alice' } };
    const deleteFn = vi.fn().mockResolvedValue(snapshot);
    const restoreFn = vi.fn();

    const { result } = renderHook(() => useUndoableDelete());

    await act(async () => {
      await result.current({
        deleteFn,
        restoreFn,
        label: 'Personnage supprimé',
      });
    });

    expect(deleteFn).toHaveBeenCalled();
    expect(mockToast).toHaveBeenCalledWith('Personnage supprimé', expect.objectContaining({
      action: expect.objectContaining({ label: 'btn.cancel' }),
      duration: 6000,
    }));
  });

  it('ne montre pas de toast si deleteFn retourne null (entité introuvable)', async () => {
    const deleteFn = vi.fn().mockResolvedValue(null);
    const restoreFn = vi.fn();

    const { result } = renderHook(() => useUndoableDelete());

    await act(async () => {
      await result.current({ deleteFn, restoreFn, label: 'Supprimé' });
    });

    expect(deleteFn).toHaveBeenCalled();
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('appelle restoreFn + reloadFn quand Annuler est cliqué', async () => {
    const snapshot = { entity: { id: 'char_1' } };
    const deleteFn = vi.fn().mockResolvedValue(snapshot);
    const restoreFn = vi.fn().mockResolvedValue();
    const reloadFn = vi.fn().mockResolvedValue();

    const { result } = renderHook(() => useUndoableDelete());

    await act(async () => {
      await result.current({ deleteFn, restoreFn, reloadFn, label: 'Supprimé' });
    });

    // Récupérer le callback onClick de l'action du toast
    const toastCall = mockToast.mock.calls[0];
    const onClickUndo = toastCall[1].action.onClick;

    await act(async () => {
      await onClickUndo();
    });

    expect(restoreFn).toHaveBeenCalledWith(snapshot);
    expect(reloadFn).toHaveBeenCalled();
    expect(mockToast.success).toHaveBeenCalledWith('toast.restored');
  });

  it('affiche une erreur si la restauration échoue', async () => {
    const snapshot = { entity: { id: 'char_1' } };
    const deleteFn = vi.fn().mockResolvedValue(snapshot);
    const restoreFn = vi.fn().mockRejectedValue(new Error('fail'));
    const reloadFn = vi.fn();

    const { result } = renderHook(() => useUndoableDelete());

    await act(async () => {
      await result.current({ deleteFn, restoreFn, reloadFn, label: 'Supprimé' });
    });

    const onClickUndo = mockToast.mock.calls[0][1].action.onClick;

    await act(async () => {
      await onClickUndo();
    });

    expect(mockToast.error).toHaveBeenCalledWith('toast.restoreFailed');
    expect(reloadFn).not.toHaveBeenCalled();
  });

  it('utilise un label par défaut si non fourni', async () => {
    const deleteFn = vi.fn().mockResolvedValue({ entity: {} });
    const restoreFn = vi.fn();

    const { result } = renderHook(() => useUndoableDelete());

    await act(async () => {
      await result.current({ deleteFn, restoreFn });
    });

    expect(mockToast).toHaveBeenCalledWith('toast.elementDeleted', expect.any(Object));
  });
});
