import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTourStore } from '../../stores/useTourStore';
import { TOUR_STEPS } from '../../data/tour_steps';

const PAD       = 10;
const TOOLTIP_W = 380;

function getTargetRect(dataKey, maxH = Infinity) {
  if (!dataKey) return null;
  const el = document.querySelector(`[data-tour="${dataKey}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null; // élément caché (display:none, collapsed…)
  const h = Math.min(r.height, maxH);
  return { x: r.left - PAD, y: r.top - PAD, w: r.width + PAD * 2, h: h + PAD * 2 };
}

export default function GuidedTour() {
  const { t } = useTranslation();
  const active    = useTourStore(s => s.active);
  const stepIndex = useTourStore(s => s.stepIndex);
  const next      = useTourStore(s => s.next);
  const prev      = useTourStore(s => s.prev);
  const stop      = useTourStore(s => s.stop);

  const navigate = useNavigate();
  const location = useLocation();

  const step   = TOUR_STEPS[stepIndex] ?? null;
  const isLast = stepIndex === TOUR_STEPS.length - 1;

  const [rect,      setRect]     = useState(null);
  const [animRect,  setAnimRect] = useState(null); // rect affiché avec transition CSS
  const [ready,     setReady]    = useState(false);
  const [vpSize,    setVpSize]   = useState({ w: window.innerWidth, h: window.innerHeight });
  const rafRef     = useRef(null);
  const stepRef    = useRef(step);
  const tooltipRef = useRef(null);
  const [tooltipH, setTooltipH] = useState(200);
  useLayoutEffect(() => { stepRef.current = step; });

  // Mesure la hauteur réelle de la tooltip après chaque étape
  useLayoutEffect(() => {
    if (tooltipRef.current) {
      setTooltipH(tooltipRef.current.getBoundingClientRect().height);
    }
  });

  // Navigation automatique à chaque changement d'étape
  useEffect(() => {
    if (!active || !step) return;
    if (location.pathname !== step.route) navigate(step.route);
  }, [active, stepIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Spotlight : attendre le rendu DOM, scroller si nécessaire, puis mesurer
  useEffect(() => {
    if (!active) { setRect(null); setReady(false); return; }
    setReady(false);
    cancelAnimationFrame(rafRef.current);
    let scrollTimer = null;

    const measure = () => {
      const s = stepRef.current;
      if (!s?.dataKey) { setRect(null); setReady(true); return; }
      const r = getTargetRect(s.dataKey, s.maxH);
      if (r) { setRect(r); setReady(true); }
      else   { rafRef.current = requestAnimationFrame(measure); }
    };

    let retries = 0;
    const MAX_RETRIES = 30; // ~500ms de tentatives avant abandon

    const attempt = () => {
      const s = stepRef.current;
      if (!s?.dataKey) { setRect(null); setReady(true); return; }
      const el = document.querySelector(`[data-tour="${s.dataKey}"]`);
      const r = el?.getBoundingClientRect();
      const visible = el && r && (r.width > 0 || r.height > 0);

      if (!visible) {
        if (++retries > MAX_RETRIES) { setRect(null); setReady(true); return; } // élément caché → tooltip sans spotlight
        rafRef.current = requestAnimationFrame(attempt);
        return;
      }

      // Si l'élément est hors du viewport, scroller vers lui puis mesurer
      const inView = r.top >= 0 && r.bottom <= window.innerHeight;
      if (!inView) {
        el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        scrollTimer = setTimeout(measure, 400);
      } else {
        measure();
      }
    };

    const t = setTimeout(attempt, 150);
    return () => { clearTimeout(t); clearTimeout(scrollTimer); cancelAnimationFrame(rafRef.current); };
  }, [active, stepIndex]);

  // Met à jour animRect seulement quand le nouveau rect est connu → transition CSS fluide
  useEffect(() => {
    if (ready && rect) setAnimRect(rect);
    if (!active)       setAnimRect(null);
  }, [ready, rect, active]);

  // Recalcul sur resize
  useEffect(() => {
    const onResize = () => {
      setVpSize({ w: window.innerWidth, h: window.innerHeight });
      const s = stepRef.current;
      if (s?.dataKey) { const r = getTargetRect(s.dataKey, s.maxH); if (r) setRect(r); }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  if (!active || !step) return null;

  // Ne rien afficher tant que la position n'est pas calculée (évite le flash en bas)
  const waitingForRect = !ready;

  const vw = vpSize.w;
  const vh = vpSize.h;
  const tw = Math.min(TOOLTIP_W, vw - 32);

  // Position tooltip basée sur animRect (suit la cible mesurée)
  const posRect = animRect ?? rect;
  let tooltipTop, tooltipLeft;
  if (!posRect) {
    tooltipTop  = Math.max(8, vh - tooltipH - 32);
    tooltipLeft = (vw - tw) / 2;
  } else {
    const below = posRect.y + posRect.h + 16;
    const above = posRect.y - tooltipH - 16;
    let preferred = below + tooltipH < vh - 16 ? below : above > 16 ? above : below;
    // Clamp de sécurité : toujours dans le viewport
    tooltipTop  = Math.max(8, Math.min(preferred, vh - tooltipH - 8));
    tooltipLeft = Math.max(16, Math.min(posRect.x + posRect.w / 2 - tw / 2, vw - tw - 16));
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9000, pointerEvents: 'none' }}>

      {/* Overlay SVG avec trou spotlight */}
      <svg
        width={vw} height={vh}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'all' }}
        onClick={stop}
      >
        <defs>
          <mask id="tour-mask">
            <rect x={0} y={0} width={vw} height={vh} fill="white" />
            {animRect && (
              <rect
                style={{ transition: 'x 0.35s ease, y 0.35s ease, width 0.35s ease, height 0.35s ease' }}
                x={animRect.x} y={animRect.y} width={animRect.w} height={animRect.h}
                rx={8} fill="black"
              />
            )}
          </mask>
        </defs>
        <rect x={0} y={0} width={vw} height={vh} fill="rgba(0,0,0,0.65)" mask="url(#tour-mask)" />
        {animRect && (
          <rect
            style={{ transition: 'x 0.35s ease, y 0.35s ease, width 0.35s ease, height 0.35s ease' }}
            x={animRect.x} y={animRect.y} width={animRect.w} height={animRect.h}
            rx={8} fill="none" stroke="rgba(99,102,241,0.8)" strokeWidth={2}
          />
        )}
      </svg>

      {/* Tooltip — caché tant que la position n'est pas calculée */}
      <div
        ref={tooltipRef}
        style={{
          position: 'absolute', top: tooltipTop, left: tooltipLeft, width: tw,
          pointerEvents: waitingForRect ? 'none' : 'all',
          opacity: waitingForRect ? 0 : 1,
          transition: 'opacity 0.15s ease',
          backgroundColor: 'rgba(11,22,33,0.97)',
          border: '1px solid rgba(99,102,241,0.35)',
          borderRadius: 16, padding: '20px 22px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(12px)',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2 gap-3">
          <div className="flex items-center gap-2">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8' }}
            >
              {stepIndex + 1} / {TOUR_STEPS.length}
            </span>
            <p className="text-sm font-black text-slate-100">{t(`narrative:tour.steps.${step.dataKey?.replace(/-/g, '_')}.title`, step.title)}</p>
          </div>
          <button onClick={stop} className="text-slate-600 hover:text-slate-400 transition-colors text-lg leading-none flex-shrink-0">×</button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed font-serif italic mb-4">
          {t(`narrative:tour.steps.${step.dataKey?.replace(/-/g, '_')}.desc`, step.description)}
        </p>

        {/* Barre de progression */}
        <div className="flex gap-1 mb-4">
          {TOUR_STEPS.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 rounded-full transition-all duration-300"
              style={{ backgroundColor: i <= stepIndex ? '#6366f1' : 'rgba(255,255,255,0.1)' }} />
          ))}
        </div>

        <div className="flex items-center gap-2">
          {stepIndex > 0 && (
            <button onClick={prev}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t('tour.prev')}
            </button>
          )}
          <div className="flex-1" />
          <button onClick={stop} className="text-xs text-slate-700 hover:text-slate-500 transition-colors">{t('tour.skip')}</button>
          <button onClick={next}
            className="px-4 py-1.5 rounded-lg text-xs font-black transition-all duration-150"
            style={{ backgroundColor: 'rgba(63,81,181,0.25)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' }}>
            {isLast ? t('tour.finish') : t('tour.next')}
          </button>
        </div>
      </div>
    </div>
  );
}
