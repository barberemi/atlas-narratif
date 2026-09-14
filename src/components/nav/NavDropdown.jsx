import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon';

export default function NavDropdown({ labelKey, icon, items }) {
  const { t } = useTranslation();
  const label = t(labelKey);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isChildActive = items.some(i => location.pathname === i.path);
  const hasSections = items.some(i => i.section);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1.5 text-[11px] px-2 py-1.5 font-grotesk uppercase tracking-[0.1em] font-bold transition-colors duration-150"
        style={{
          backgroundColor: 'transparent',
          color:           isChildActive || open ? '#5cae8e' : '#a9a291',
          borderBottom:    isChildActive ? '2px solid #5cae8e' : '2px solid transparent',
        }}
        onMouseEnter={e => { if (!isChildActive && !open) e.currentTarget.style.color = '#ece7db'; }}
        onMouseLeave={e => { if (!isChildActive && !open) e.currentTarget.style.color = '#a9a291'; }}
      >
        <Icon name={icon} size={14} />
        <span className="hidden sm:inline">{label}</span>
        <span style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full mt-1.5 left-0 overflow-hidden z-50"
          style={{ minWidth: hasSections ? 250 : 180, backgroundColor: '#1a1d22', border: '1px solid var(--color-atlas-line)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {items.map((item, idx) => {
              const { path, labelKey: itemLabelKey, icon: itemIcon, section, sublabelKey, badgeKey } = item;
              const itemLabel = t(itemLabelKey);
              const isActive = location.pathname === path;
              // En-tête de section : affiché quand la section change (menus orchestrés).
              const showSection = section && section !== items[idx - 1]?.section;
              return (
                <div key={path}>
                  {showSection && (
                    <p className="font-grotesk text-[9px] font-bold uppercase tracking-[0.16em] text-atlas-mute px-3 pt-2 pb-1">
                      {t(section)}
                    </p>
                  )}
                  <NavLink
                    to={path}
                    onClick={() => setOpen(false)}
                    className={`flex ${sublabelKey ? 'items-start' : 'items-center'} gap-2 px-3 py-2 text-xs font-semibold transition-all duration-150`}
                    style={{ backgroundColor: isActive ? 'rgba(92,174,142,0.16)' : 'transparent', color: isActive ? '#5cae8e' : '#a9a291', textDecoration: 'none' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Icon name={itemIcon} size={15} className={sublabelKey ? 'mt-0.5 flex-shrink-0' : 'flex-shrink-0'} />
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="flex items-center gap-1.5">
                        {itemLabel}
                        {badgeKey && (
                          <span
                            className="font-grotesk text-[8px] font-bold uppercase tracking-[0.08em] px-1 py-0.5 rounded-sm"
                            style={{ backgroundColor: 'rgba(203,161,94,0.16)', color: 'var(--color-atlas-gold)' }}
                          >
                            {t(badgeKey)}
                          </span>
                        )}
                      </span>
                      {sublabelKey && (
                        <span className="text-[10px] font-normal leading-snug text-atlas-mute">{t(sublabelKey)}</span>
                      )}
                    </span>
                  </NavLink>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
