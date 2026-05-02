import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NavDropdown({ labelKey, icon, items }) {
  const { t } = useTranslation();
  const label = t(labelKey);
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isChildActive = items.some(i => location.pathname === i.path);

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
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all duration-150"
        style={{
          backgroundColor: isChildActive || open ? 'rgba(63,81,181,0.18)' : 'transparent',
          color:            isChildActive || open ? '#818cf8'              : '#475569',
          border:           isChildActive || open ? '1px solid rgba(99,102,241,0.35)' : '1px solid transparent',
        }}
        onMouseEnter={e => { if (!isChildActive && !open) e.currentTarget.style.color = '#94a3b8'; }}
        onMouseLeave={e => { if (!isChildActive && !open) e.currentTarget.style.color = '#475569'; }}
      >
        <span>{icon}</span>
        <span className="hidden sm:inline">{label}</span>
        <span style={{ fontSize: 8, opacity: 0.6, marginLeft: 2 }}>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full mt-1.5 left-0 rounded-xl overflow-hidden z-50"
          style={{ minWidth: 180, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          <div className="p-1.5 flex flex-col gap-0.5">
            {items.map(({ path, labelKey: itemLabelKey, icon: itemIcon }) => {
              const itemLabel = t(itemLabelKey);
              const isActive = location.pathname === path;
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{ backgroundColor: isActive ? 'rgba(63,81,181,0.18)' : 'transparent', color: isActive ? '#818cf8' : '#94a3b8', textDecoration: 'none' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span>{itemIcon}</span>
                  <span>{itemLabel}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
