import { useState, useRef, useEffect, useCallback } from 'react';
import lotrMapImage from '../../assets/ouest_terre_du_milieu.jpg';
import Icon from '../ui/Icon';

/**
 * Vignette « small multiple » (piste 3) : le fond de carte + le trajet COMPLET
 * d'un seul personnage, en petit, sans contrôle ni animation. Sert à comparer
 * plusieurs destins côte à côte d'un coup d'œil.
 *
 * Même transformation object-contain que MapCanvas (les coordonnées sont en % de
 * l'image, converties vers le conteneur) — répliquée ici volontairement pour
 * garder la vignette autonome et légère (pas de marqueurs animés / pins).
 */
export default function MiniJourneyMap({ journey = [], color, deathStepIndex = -1, mapSrc = null }) {
  const activeSrc = mapSrc ?? lotrMapImage;
  const containerRef = useRef(null);
  const imgRef = useRef(null);
  const [t, setT] = useState(null);

  const recompute = useCallback(() => {
    const c = containerRef.current;
    const img = imgRef.current;
    if (!c || !img || !img.naturalWidth) return;
    const cW = c.clientWidth, cH = c.clientHeight;
    const iW = img.naturalWidth, iH = img.naturalHeight;
    const cRatio = cW / cH, iRatio = iW / iH;
    let rW, rH, oX, oY;
    if (iRatio > cRatio) { rW = cW; rH = cW / iRatio; oX = 0; oY = (cH - rH) / 2; }
    else                 { rH = cH; rW = cH * iRatio; oX = (cW - rW) / 2; oY = 0; }
    setT({
      x: (pct) => (oX + (pct / 100) * rW) / cW * 100,
      y: (pct) => (oY + (pct / 100) * rH) / cH * 100,
    });
  }, []);

  useEffect(() => {
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [recompute]);

  const tx = (v) => (t ? t.x(v) : v);
  const ty = (v) => (t ? t.y(v) : v);

  const pts = journey.filter(s => s.x != null && s.y != null);
  const end = pts[pts.length - 1];
  const isDead = deathStepIndex >= 0 && deathStepIndex <= journey.length - 1;

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-atlas-ink">
      {/* Fond blurred autour du contain */}
      <div
        className="absolute inset-0 scale-110 blur-2xl opacity-30"
        style={{ backgroundImage: `url(${activeSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <img
        ref={imgRef}
        src={activeSrc}
        alt=""
        className="absolute inset-0 w-full h-full object-contain select-none"
        draggable={false}
        onLoad={recompute}
      />

      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* Trajet complet */}
        {pts.length > 1 && (
          <polyline
            points={pts.map(s => `${tx(s.x)},${ty(s.y)}`).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="1.1,0.7"
            strokeOpacity="0.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Étapes */}
        {pts.slice(0, -1).map((s, i) => (
          <circle key={i} cx={tx(s.x)} cy={ty(s.y)} r="0.7" fill={color} fillOpacity="0.55" />
        ))}
        {/* Départ */}
        {pts[0] && <circle cx={tx(pts[0].x)} cy={ty(pts[0].y)} r="1" fill="none" stroke={color} strokeWidth="0.5" />}
        {/* Fin */}
        {end && !isDead && (
          <circle cx={tx(end.x)} cy={ty(end.y)} r="1.3" fill={color} stroke="#fff" strokeWidth="0.45" />
        )}
      </svg>

      {/* Marqueur de mort en fin de trajet */}
      {end && isDead && (
        <span
          className="absolute -translate-x-1/2 -translate-y-1/2 leading-none"
          style={{ left: `${tx(end.x)}%`, top: `${ty(end.y)}%`, filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.9))' }}
        >
          <Icon name="death" size={13} />
        </span>
      )}
    </div>
  );
}
