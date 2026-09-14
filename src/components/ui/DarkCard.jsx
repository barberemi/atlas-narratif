import { hexToRgb } from '../../utils/color';

/**
 * Carte sombre réutilisable.
 * Props :
 *   color       — couleur hex pour le state highlighted (border / bg / shadow)
 *   highlighted — active le style coloré
 *   dimmed      — opacity 0.25
 *   onClick     — ajoute cursor-pointer + select-none
 *   className   — classes supplémentaires
 *   ref         — React 19 : ref passé directement
 */
export default function DarkCard({ ref, color, accent, highlighted, dimmed, onClick, className = '', style = {}, children }) {
  const rgb = color ? hexToRgb(color) : null;

  return (
    <div
      ref={ref}
      className={`rounded-none border overflow-hidden transition-all duration-300 relative${onClick ? ' cursor-pointer select-none' : ''}${className ? ` ${className}` : ''}`}
      style={{
        borderColor:     highlighted && rgb ? color             : 'transparent',
        backgroundColor: highlighted && rgb ? `rgba(${rgb},0.08)` : 'rgba(255,255,255,0.025)',
        boxShadow:       highlighted && rgb ? `0 0 20px rgba(${rgb},0.25)` : 'none',
        opacity:         dimmed ? 0.25 : 1,
        ...style,
      }}
      onClick={onClick}
    >
      {accent && <div className="absolute left-0 top-0 bottom-0 w-[3px] z-10" style={{ backgroundColor: accent }} />}
      {children}
    </div>
  );
}
