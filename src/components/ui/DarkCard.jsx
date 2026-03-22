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
export default function DarkCard({ ref, color, highlighted, dimmed, onClick, className = '', style = {}, children }) {
  const rgb = color ? hexToRgb(color) : null;

  return (
    <div
      ref={ref}
      className={`rounded-xl border overflow-hidden transition-all duration-300 relative${onClick ? ' cursor-pointer select-none' : ''}${className ? ` ${className}` : ''}`}
      style={{
        borderColor:     highlighted && rgb ? color             : 'rgba(255,255,255,0.07)',
        backgroundColor: highlighted && rgb ? `rgba(${rgb},0.08)` : 'rgba(255,255,255,0.03)',
        boxShadow:       highlighted && rgb ? `0 0 20px rgba(${rgb},0.25)` : 'none',
        opacity:         dimmed ? 0.25 : 1,
        ...style,
      }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
