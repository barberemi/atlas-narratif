import { useState, useRef, useEffect, useCallback } from 'react';
import lotrMapImage from '../../assets/ouest_terre_du_milieu.jpg';

/**
 * Carte multi-personnages avec object-contain.
 * Les coordonnées sont stockées en % de l'image (0-100).
 * La transformation contain convertit ces % vers le conteneur à l'affichage.
 */
export default function MapCanvas({ characters, locations = [], onLocationClick, mapSrc = null, editMode = false, onMapClick, onPinRemove }) {
  const activeSrc = mapSrc ?? lotrMapImage;
  const [hoveredLoc, setHoveredLoc] = useState(null);
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
    if (iRatio > cRatio) {
      rW = cW; rH = cW / iRatio; oX = 0; oY = (cH - rH) / 2;
    } else {
      rH = cH; rW = cH * iRatio; oX = (cW - rW) / 2; oY = 0;
    }
    setT({
      x: (pct) => (oX + (pct / 100) * rW) / cW * 100,
      y: (pct) => (oY + (pct / 100) * rH) / cH * 100,
      ix: (pct) => ((pct / 100) * cW - oX) / rW * 100,
      iy: (pct) => ((pct / 100) * cH - oY) / rH * 100,
    });
  }, []);

  useEffect(() => {
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [recompute]);

  const tx = (v) => t ? t.x(v) : v;
  const ty = (v) => t ? t.y(v) : v;

  const handleContainerClick = (e) => {
    if (!editMode || !onMapClick) return;
    if (e.target.closest('button[data-pin]')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = (e.clientX - rect.left) / rect.width * 100;
    const cy = (e.clientY - rect.top) / rect.height * 100;
    if (t) {
      const imgX = t.ix(cx), imgY = t.iy(cy);
      if (imgX < 0 || imgX > 100 || imgY < 0 || imgY > 100) return;
      onMapClick(+imgX.toFixed(2), +imgY.toFixed(2));
    } else {
      onMapClick(+cx.toFixed(2), +cy.toFixed(2));
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-[#0B1621]"
      style={{ cursor: editMode ? 'crosshair' : 'default' }}
      onClick={handleContainerClick}
    >
      {/* Fond blurred de la carte (visible autour du contain) */}
      <div
        className="absolute inset-0 scale-110 blur-2xl opacity-30"
        style={{ backgroundImage: `url(${activeSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      {/* Carte principale */}
      <img
        ref={imgRef}
        src={activeSrc}
        alt="Carte"
        className="absolute inset-0 w-full h-full object-contain select-none"
        draggable={false}
        onLoad={recompute}
      />

      {/* SVG overlay — tracés de tous les personnages */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {characters.map(({ name }) => (
            <filter key={name} id={`glow-${name}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          ))}
        </defs>

        {characters.map(({ journey, currentStep, color, name }) => {
          // Filtrer les étapes sans coordonnées pour le rendu SVG
          const visited           = journey.slice(0, currentStep + 1);
          const visitedWithCoords = visited.filter(s => s.x != null && s.y != null);

          // Découper le trajet en segments : normal vs flashback
          const segments = [];
          for (let i = 1; i < visitedWithCoords.length; i++) {
            const prev    = visitedWithCoords[i - 1];
            const curr    = visitedWithCoords[i];
            const isFlash = prev.isFlashback || curr.isFlashback;
            const last    = segments[segments.length - 1];
            if (!last || last.isFlash !== isFlash) {
              segments.push({ isFlash, points: [prev, curr] });
            } else {
              if (last.points[last.points.length - 1] !== prev) last.points.push(prev);
              last.points.push(curr);
            }
          }

          return (
            <g key={name}>
              {/* Segments du trajet : normal (couleur personnage) ou flashback (ambre) */}
              {segments.map((seg, si) => seg.points.length > 1 && (
                <polyline
                  key={si}
                  points={seg.points.map(s => `${tx(s.x)},${ty(s.y)}`).join(' ')}
                  fill="none"
                  stroke={seg.isFlash ? '#d97706' : color}
                  strokeWidth={seg.isFlash ? '0.22' : '0.3'}
                  strokeDasharray={seg.isFlash ? '1.5,1.0' : '0.9,0.5'}
                  strokeOpacity={seg.isFlash ? '0.55' : '0.85'}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  filter={`url(#glow-${name})`}
                />
              ))}
              {/* Points des étapes passées (localisées) */}
              {visitedWithCoords.slice(0, -1).map((step, i) => (
                <circle
                  key={i}
                  cx={tx(step.x)}
                  cy={ty(step.y)}
                  r="0.6"
                  fill={step.isFlashback ? '#d97706' : color}
                  fillOpacity={step.isFlashback ? '0.35' : '0.55'}
                  filter={`url(#glow-${name})`}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Pins de lieux */}
      {locations.map((loc) => {
        const { x, y } = loc.coordinates;
        const isHovered = hoveredLoc === loc.id;
        return (
          <button
            key={loc.id}
            data-pin="true"
            onClick={(e) => {
              e.stopPropagation();
              if (editMode) onPinRemove?.(loc.id);
              else onLocationClick?.(loc.name);
            }}
            onMouseEnter={() => setHoveredLoc(loc.id)}
            onMouseLeave={() => setHoveredLoc(null)}
            className="absolute z-20 flex flex-col items-center"
            style={{
              left: `${tx(x)}%`,
              top: `${ty(y)}%`,
              transform: 'translate(-50%, -100%)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
            title={editMode ? `Retirer ${loc.name} de la carte` : loc.name}
          >
            {isHovered && (
              <span
                className="absolute whitespace-nowrap text-xs font-semibold px-2 py-1 rounded pointer-events-none"
                style={{
                  bottom: 'calc(100% + 4px)',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: editMode ? 'rgba(239,68,68,0.9)' : 'rgba(8,14,30,0.95)',
                  color: '#e2e8f0',
                  border: `1px solid ${editMode ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  backdropFilter: 'blur(4px)',
                  zIndex: 30,
                }}
              >
                {editMode ? `× Retirer` : loc.name}
              </span>
            )}
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <path
                d="M7 0C3.13 0 0 3.13 0 7c0 5.25 7 11 7 11s7-5.75 7-11c0-3.87-3.13-7-7-7z"
                fill={editMode ? (isHovered ? '#f87171' : 'rgba(248,113,113,0.7)') : (isHovered ? '#e2e8f0' : 'rgba(255,255,255,0.55)')}
                style={{ transition: 'fill 0.15s' }}
              />
              <circle cx="7" cy="7" r="2.5" fill="rgba(8,14,30,0.8)" />
            </svg>
          </button>
        );
      })}

      {/* Marqueurs animés — un par personnage */}
      {characters.map(({ journey, currentStep, color, name, deathStepIndex }) => {
        // Dernière étape localisée jusqu'au step courant
        const lastLocalized = journey
          .slice(0, currentStep + 1)
          .reverse()
          .find(s => s.x != null && s.y != null);

        if (!lastLocalized) return null;

        const hex = color.replace('#', '');
        const r   = parseInt(hex.slice(0, 2), 16);
        const g   = parseInt(hex.slice(2, 4), 16);
        const b   = parseInt(hex.slice(4, 6), 16);
        const rgb = `${r},${g},${b}`;

        const current       = journey[currentStep];
        const isMissing     = current?.isMissing || current?.x == null;
        const isDead        = deathStepIndex !== -1 && currentStep >= deathStepIndex;
        const isFlashback   = current?.isFlashback ?? false;
        const dotColor      = isFlashback ? '#d97706' : color;
        const dotRgb        = isFlashback ? '217,119,6' : rgb;

        return (
          <div
            key={name}
            className="absolute pointer-events-none z-10"
            style={{
              left: `${tx(lastLocalized.x)}%`,
              top:  `${ty(lastLocalized.y)}%`,
              transform: 'translate(-50%, -50%)',
              transition: 'left 0.9s cubic-bezier(0.4, 0, 0.2, 1), top 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isMissing ? 0.45 : 1,
            }}
          >
            {isDead ? (
              <span
                className="relative block text-xl leading-none select-none"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.9))' }}
              >
                💀
              </span>
            ) : (
              <>
                <span
                  className="absolute rounded-full animate-ping"
                  style={{ width: 32, height: 32, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: dotColor, opacity: isFlashback ? 0.2 : 0.3 }}
                />
                <span
                  className="absolute rounded-full"
                  style={{ width: 28, height: 28, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: `1.5px solid rgba(${dotRgb},0.45)` }}
                />
                {/* Second anneau ambre visible uniquement en flashback */}
                {isFlashback && (
                  <span
                    className="absolute rounded-full"
                    style={{ width: 20, height: 20, top: '50%', left: '50%', transform: 'translate(-50%, -50%)', border: '1.5px dashed rgba(217,119,6,0.7)' }}
                  />
                )}
                <span
                  className="relative block w-4 h-4 rounded-full border-2 z-10"
                  style={{
                    backgroundColor: isFlashback ? 'rgba(120,77,15,0.4)' : dotColor,
                    borderColor: isFlashback ? '#d97706' : 'white',
                    boxShadow: `0 0 8px rgba(${dotRgb},0.9), 0 0 22px rgba(${dotRgb},0.5), 0 2px 6px rgba(0,0,0,0.7)`,
                  }}
                />
              </>
            )}
            <span
              className="absolute whitespace-nowrap text-xs font-bold px-2 py-0.5 rounded"
              style={{
                top: 'calc(100% + 6px)', left: '50%', transform: 'translateX(-50%)',
                backgroundColor: 'rgba(8,14,30,0.92)',
                border: `1px solid ${isDead ? 'rgba(100,100,100,0.4)' : `rgba(${dotRgb},0.55)`}`,
                backdropFilter: 'blur(4px)',
                textShadow: '0 1px 3px rgba(0,0,0,0.9)',
                color: isDead ? '#64748b' : isFlashback ? '#fbbf24' : '#fff',
              }}
            >
              {isFlashback && '↩ '}{name}{isMissing && ' ·?'}
            </span>
          </div>
        );
      })}
    </div>
  );
}
