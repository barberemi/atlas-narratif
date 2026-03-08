import { useRef, useCallback } from 'react';

export function useDragScroll() {
  const ref         = useRef(null);
  const isDown      = useRef(false);
  const startX      = useRef(0);
  const scrollStart = useRef(0);
  const hasDragged  = useRef(false);

  const onMouseDown = useCallback((e) => {
    isDown.current     = true;
    hasDragged.current = false;
    startX.current     = e.pageX - ref.current.offsetLeft;
    scrollStart.current = ref.current.scrollLeft;
    ref.current.style.cursor     = 'grabbing';
    ref.current.style.userSelect = 'none';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!isDown.current) return;
    const x     = e.pageX - ref.current.offsetLeft;
    const delta = x - startX.current;
    if (Math.abs(delta) > 4) hasDragged.current = true;
    ref.current.scrollLeft = scrollStart.current - delta;
  }, []);

  const stop = useCallback(() => {
    isDown.current = false;
    if (ref.current) {
      ref.current.style.cursor     = 'grab';
      ref.current.style.userSelect = '';
    }
  }, []);

  return {
    ref,
    hasDragged,
    onMouseDown,
    onMouseMove,
    onMouseUp:    stop,
    onMouseLeave: stop,
  };
}
