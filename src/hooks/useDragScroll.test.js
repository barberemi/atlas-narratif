import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragScroll } from './useDragScroll';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Crée un faux élément DOM scrollable avec offsetLeft configurable. */
function makeFakeEl(offsetLeft = 0, scrollLeft = 0) {
  return {
    offsetLeft,
    scrollLeft,
    style: { cursor: '', userSelect: '' },
  };
}

function mousedown(pageX) { return { pageX }; }
function mousemove(pageX) { return { pageX }; }

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useDragScroll', () => {
  let result;

  beforeEach(() => {
    ({ result } = renderHook(() => useDragScroll()));
  });

  // ── API retournée ───────────────────────────────────────────────────────────

  it('expose ref, hasDragged et les 4 handlers', () => {
    expect(result.current.ref).toBeDefined();
    expect(result.current.hasDragged).toBeDefined();
    expect(typeof result.current.onMouseDown).toBe('function');
    expect(typeof result.current.onMouseMove).toBe('function');
    expect(typeof result.current.onMouseUp).toBe('function');
    expect(typeof result.current.onMouseLeave).toBe('function');
  });

  it('hasDragged est false au montage', () => {
    expect(result.current.hasDragged.current).toBe(false);
  });

  // ── onMouseDown ─────────────────────────────────────────────────────────────

  describe('onMouseDown', () => {
    it('passe le curseur en "grabbing"', () => {
      const el = makeFakeEl(0);
      result.current.ref.current = el;

      act(() => result.current.onMouseDown(mousedown(100)));

      expect(el.style.cursor).toBe('grabbing');
    });

    it('désactive la sélection de texte', () => {
      const el = makeFakeEl(0);
      result.current.ref.current = el;

      act(() => result.current.onMouseDown(mousedown(100)));

      expect(el.style.userSelect).toBe('none');
    });

    it('réinitialise hasDragged à false', () => {
      const el = makeFakeEl(0);
      result.current.ref.current = el;
      // Simuler un drag précédent
      result.current.hasDragged.current = true;

      act(() => result.current.onMouseDown(mousedown(100)));

      expect(result.current.hasDragged.current).toBe(false);
    });
  });

  // ── onMouseMove — seuil 4px ─────────────────────────────────────────────────

  describe('onMouseMove — seuil 4px', () => {
    beforeEach(() => {
      result.current.ref.current = makeFakeEl(0, 0);
      act(() => result.current.onMouseDown(mousedown(100)));
    });

    it('hasDragged reste false si déplacement ≤ 4px', () => {
      act(() => result.current.onMouseMove(mousemove(104))); // delta = 4
      expect(result.current.hasDragged.current).toBe(false);
    });

    it('hasDragged passe à true si déplacement > 4px', () => {
      act(() => result.current.onMouseMove(mousemove(105))); // delta = 5
      expect(result.current.hasDragged.current).toBe(true);
    });

    it('hasDragged passe à true pour un déplacement négatif > 4px', () => {
      act(() => result.current.onMouseMove(mousemove(95))); // delta = -5
      expect(result.current.hasDragged.current).toBe(true);
    });

    it('hasDragged reste false si déplacement exactement 4px', () => {
      act(() => result.current.onMouseMove(mousemove(104)));
      expect(result.current.hasDragged.current).toBe(false);
    });
  });

  // ── onMouseMove — scroll ────────────────────────────────────────────────────

  describe('onMouseMove — scroll', () => {
    it('applique scrollLeft = scrollStart - delta', () => {
      const el = makeFakeEl(0, 200); // scrollLeft initial = 200
      result.current.ref.current = el;

      act(() => result.current.onMouseDown(mousedown(100))); // startX = 100
      act(() => result.current.onMouseMove(mousemove(110))); // delta = 10

      expect(el.scrollLeft).toBe(190); // 200 - 10
    });

    it('scroll vers la gauche quand on déplace vers la droite', () => {
      const el = makeFakeEl(0, 300);
      result.current.ref.current = el;

      act(() => result.current.onMouseDown(mousedown(50)));
      act(() => result.current.onMouseMove(mousemove(80))); // delta = +30

      expect(el.scrollLeft).toBe(270); // 300 - 30
    });

    it('scroll vers la droite quand on déplace vers la gauche', () => {
      const el = makeFakeEl(0, 100);
      result.current.ref.current = el;

      act(() => result.current.onMouseDown(mousedown(80)));
      act(() => result.current.onMouseMove(mousemove(50))); // delta = -30

      expect(el.scrollLeft).toBe(130); // 100 - (-30)
    });

    it('prend en compte offsetLeft dans le calcul', () => {
      const el = makeFakeEl(20, 0); // offsetLeft = 20
      result.current.ref.current = el;

      act(() => result.current.onMouseDown(mousedown(120))); // startX = 120-20 = 100
      act(() => result.current.onMouseMove(mousemove(130))); // x = 130-20 = 110 → delta = 10

      expect(el.scrollLeft).toBe(-10); // 0 - 10
    });

    it('ignore onMouseMove si le bouton n\'est pas maintenu', () => {
      const el = makeFakeEl(0, 100);
      result.current.ref.current = el;
      // Pas de mousedown → isDown = false

      act(() => result.current.onMouseMove(mousemove(150)));

      expect(el.scrollLeft).toBe(100); // inchangé
    });
  });

  // ── onMouseUp / onMouseLeave ────────────────────────────────────────────────

  describe('onMouseUp / onMouseLeave', () => {
    beforeEach(() => {
      result.current.ref.current = makeFakeEl(0);
      act(() => result.current.onMouseDown(mousedown(100)));
    });

    it('onMouseUp remet le curseur en "grab"', () => {
      act(() => result.current.onMouseUp());
      expect(result.current.ref.current.style.cursor).toBe('grab');
    });

    it('onMouseUp réactive la sélection de texte', () => {
      act(() => result.current.onMouseUp());
      expect(result.current.ref.current.style.userSelect).toBe('');
    });

    it('onMouseLeave a le même effet que onMouseUp', () => {
      act(() => result.current.onMouseLeave());
      expect(result.current.ref.current.style.cursor).toBe('grab');
      expect(result.current.ref.current.style.userSelect).toBe('');
    });

    it('onMouseMove n\'a plus d\'effet après onMouseUp', () => {
      const el = result.current.ref.current;
      el.scrollLeft = 200;
      act(() => result.current.onMouseDown(mousedown(50)));
      act(() => result.current.onMouseUp());
      act(() => result.current.onMouseMove(mousemove(100)));
      expect(el.scrollLeft).toBe(200); // inchangé
    });

    it('onMouseUp fonctionne même si ref est null', () => {
      result.current.ref.current = null;
      expect(() => act(() => result.current.onMouseUp())).not.toThrow();
    });
  });
});
