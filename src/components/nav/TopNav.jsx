import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useProject } from '../../db/ProjectContext';
import ProjectPicker from './ProjectPicker';
import NavDropdown from './NavDropdown';
import { NAV_GROUPS } from './navConfig';

export default function TopNav({ onSearchOpen }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { projects, loading } = useProject();
  const hasProjects  = !loading && projects.length > 0;
  const [mobileOpen, setMobileOpen] = useState(false);

  const allMobileItems = NAV_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.label })));

  return (
    <>
      <nav
        className="flex-shrink-0 flex items-center px-4 border-b border-white/10 gap-1"
        style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)', backdropFilter: 'blur(12px)', zIndex: 50 }}
      >
        <button
          onClick={() => navigate('/')}
          className="text-sm font-black tracking-tight flex-shrink-0 transition-opacity duration-150 hover:opacity-70"
        >
          Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
        </button>

        {hasProjects && (
          <>
            <div className="w-px h-5 bg-white/10 mx-2 flex-shrink-0" />
            <ProjectPicker />
            <div className="w-px h-5 bg-white/10 mx-2 flex-shrink-0" />
          </>
        )}

        {hasProjects && NAV_GROUPS.map(group => (
          <div key={group.key} className="hidden md:block">
            <NavDropdown label={group.label} icon={group.icon} items={group.items} />
          </div>
        ))}

        {hasProjects && (
          <button
            onClick={onSearchOpen}
            className="hidden md:flex items-center gap-2 ml-auto text-xs px-3 py-1.5 rounded-lg transition-all duration-150 flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.04)', color: '#475569', border: '1px solid rgba(255,255,255,0.08)' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            title="Recherche globale"
          >
            <span>🔍</span>
            <span>Rechercher</span>
            <kbd className="text-[10px] px-1 py-0.5 rounded font-mono" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>⌘K</kbd>
          </button>
        )}

        {hasProjects && (
          <button
            onClick={() => setMobileOpen(v => !v)}
            className="md:hidden ml-auto flex flex-col gap-1.5 p-2 rounded-lg transition-all"
            style={{ color: mobileOpen ? '#818cf8' : '#475569' }}
            aria-label="Menu"
          >
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : 'none' }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', opacity: mobileOpen ? 0 : 1 }} />
            <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
          </button>
        )}
      </nav>

      {mobileOpen && hasProjects && (
        <div className="md:hidden flex-shrink-0 border-b border-white/10" style={{ backgroundColor: 'rgba(11,22,33,0.98)', zIndex: 49 }}>
          <div className="px-3 py-2 flex flex-col gap-0.5">
            {allMobileItems.map(({ path, label, icon, group }) => {
              const isActive    = location.pathname === path;
              const isWarning   = path === '/incoherences';
              const activeColor = isWarning ? '#EF4444' : '#818cf8';
              const activeBg    = isWarning ? 'rgba(239,68,68,0.1)' : 'rgba(63,81,181,0.15)';
              return (
                <NavLink
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ backgroundColor: isActive ? activeBg : 'transparent', color: isActive ? activeColor : '#64748b', textDecoration: 'none' }}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                  {group && <span className="ml-auto text-[10px] text-slate-700 font-normal">{group}</span>}
                </NavLink>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}
