import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Deep-link « aller pile sur un élément » (depuis les sources/liens du chat, etc.).
 *
 * Lit `?focus=<id>` dans l'URL ; dès que `ready` (données de la page montées),
 * retient l'id ciblé un court instant, puis PURGE le param (`replace`) pour ne
 * pas re-déclencher au refresh ou au retour arrière.
 *
 * La carte cible se charge du scroll + du flash via `useFlashScroll` /
 * `useSettleFlash` lorsqu'elle reçoit `flash={item.id === flashId}`.
 *
 * @param {boolean} ready — true quand la liste est chargée et rendue
 * @returns {string|null} l'id ciblé (ou null)
 */
export function useFocusFlash(ready = true) {
  const [params, setParams] = useSearchParams();
  const [flashId, setFlashId] = useState(null);
  const consumed = useRef(false);
  const focus = params.get('focus');

  useEffect(() => {
    if (!focus || !ready || consumed.current) return;
    consumed.current = true;
    setFlashId(focus);
    // Purge le param en conservant les autres (tab, search, hero…).
    const next = new URLSearchParams(params);
    next.delete('focus');
    setParams(next, { replace: true });
    // `params`/`setParams` volontairement hors deps : on ne re-déclenche que
    // sur (focus, ready) — `consumed` garantit l'unicité.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus, ready]);

  // On garde l'id « armé » assez longtemps pour couvrir le scroll (jusqu'à ~1,5 s)
  // avant que la carte ne lance son animation ; l'extinction de l'animation
  // elle-même est gérée localement par useSettleFlash (timer indépendant).
  useEffect(() => {
    if (!flashId) return;
    const timer = setTimeout(() => setFlashId(null), 4000);
    return () => clearTimeout(timer);
  }, [flashId]);

  return flashId;
}

// Durée de l'animation de flash (doit correspondre à `.atlas-flash` dans index.css).
const FLASH_MS = 2400;
// Filet de sécurité : si le scroll ne « se stabilise » jamais, on flashe quand même.
const SETTLE_FALLBACK_MS = 1500;

/**
 * Renvoie un booléen `flashing` qui ne passe à vrai qu'une fois l'élément
 * IMMOBILISÉ dans le viewport (fin du scroll), pour que le scintillement soit
 * toujours vu en entier — même quand la cible est loin et le scroll long.
 *
 * Détecte la fin du scroll en observant la position de l'élément image par image
 * (rAF) jusqu'à stabilisation ; filet de sécurité à 1,5 s. Le timer d'extinction
 * est porté par `flashing` lui-même → survit à la disparition de `active`.
 *
 * @param {boolean} active — la carte est la cible du focus
 * @param {import('react').RefObject<HTMLElement>} ref — élément à surveiller
 * @param {boolean} [scroll=false] — si true, initie aussi le scrollIntoView
 * @returns {boolean}
 */
export function useSettleFlash(active, ref, scroll = false) {
  const [flashing, setFlashing] = useState(false);

  useEffect(() => {
    if (!active) return;
    let raf = 0;
    let fallback = 0;
    let started = false;
    let scrolled = false;
    let lastTop = null;
    let stableFrames = 0;

    const start = () => {
      if (started) return;
      started = true;
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
      setFlashing(true);
    };

    const tick = () => {
      const el = ref.current;
      if (el) {
        if (scroll && !scrolled) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
          scrolled = true;
        }
        const top = el.getBoundingClientRect().top;
        if (lastTop !== null && Math.abs(top - lastTop) < 0.5) stableFrames += 1;
        else stableFrames = 0;
        lastTop = top;
        // 3 frames consécutives immobiles ≈ scroll terminé.
        if (stableFrames >= 3) return start();
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    fallback = setTimeout(start, SETTLE_FALLBACK_MS);
    return () => { cancelAnimationFrame(raf); clearTimeout(fallback); };
  }, [active]); // `ref` stable

  // Extinction indépendante : une fois lancé, le flash va au bout de son animation.
  useEffect(() => {
    if (!flashing) return;
    const timer = setTimeout(() => setFlashing(false), FLASH_MS);
    return () => clearTimeout(timer);
  }, [flashing]);

  return flashing;
}

/**
 * Variante « scroll + flash » : pose le `ref` sur l'élément cible, initie le
 * scroll centré (vertical ET horizontal — utile pour la timeline) quand `flash`
 * devient vrai, et renvoie `flashing` synchronisé sur la fin du scroll.
 *
 * @param {boolean} flash
 * @returns {{ ref: import('react').RefObject<HTMLElement>, flashing: boolean }}
 */
export function useFlashScroll(flash) {
  const ref = useRef(null);
  const flashing = useSettleFlash(flash, ref, true);
  return { ref, flashing };
}
