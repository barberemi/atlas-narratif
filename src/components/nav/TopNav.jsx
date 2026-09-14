import { useState } from 'react';
import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../ui/Button';
import { useProject } from '../../db/ProjectContext';
import ProjectPicker from './ProjectPicker';
import VolumePicker  from './VolumePicker';
import SaveIndicator from './SaveIndicator';
import NavDropdown from './NavDropdown';
import Icon from '../ui/Icon';
import { NAV_GROUPS } from './navConfig';
import { authClient } from '../../lib/authClient';
import { useTourStore } from '../../stores/useTourStore';
import { TOUR_STEPS } from '../../data/tour_steps';
import { VIZ_STATUS } from '../../data/viz_palette';

const LANGS = [
  { code: 'fr', label: 'FR' },
  { code: 'en', label: 'EN' },
  { code: 'zh', label: '中文' },
];

export default function TopNav({ onSearchOpen }) {
  const { t, i18n } = useTranslation();
  const location  = useLocation();
  const navigate  = useNavigate();
  const { projects, loading, projectId } = useProject();
  const hasProjects  = !loading && projects.length > 0;
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = authClient.useSession();
  const user = session?.user;
  const startAtRoute = useTourStore(s => s.startAtRoute);
  const tourActive   = useTourStore(s => s.active);
  const hasPageTour  = !tourActive && !!projectId && TOUR_STEPS.some(s => s.route === location.pathname && s.dataKey !== null);

  return (
    <>
      <nav
        className="flex-shrink-0 flex items-center px-4 border-b gap-1"
        style={{ height: 48, backgroundColor: 'rgba(21,23,27,0.97)', backdropFilter: 'blur(12px)', zIndex: 50, borderBottomColor: 'var(--color-atlas-soft)' }}
      >
        <button
          onClick={() => navigate('/')}
          className="font-serif text-base font-bold tracking-tight flex-shrink-0 transition-opacity duration-150 hover:opacity-70 text-atlas-text"
        >
          Atlas <span style={{ color: 'var(--color-atlas-green)' }}>Narratif</span>
        </button>

        {hasProjects && (
          <div className="hidden md:flex items-center gap-1">
            <div className="w-px h-5 bg-white/10 mx-2 flex-shrink-0" />
            <ProjectPicker />
            <div className="w-px h-5 bg-white/10 mx-1 flex-shrink-0" />
            <VolumePicker />
            <SaveIndicator />
            <div className="w-px h-5 bg-white/10 mx-2 flex-shrink-0" />
          </div>
        )}

        {hasProjects && NAV_GROUPS.map(group => (
          <div key={group.key} className="hidden md:block">
            <NavDropdown labelKey={group.labelKey} icon={group.icon} items={group.items} />
          </div>
        ))}

        {hasProjects && (
          <button
            onClick={onSearchOpen}
            aria-label="Recherche globale"
            className="hidden md:flex items-center gap-2 font-grotesk text-[11px] uppercase tracking-[0.08em] px-3 py-1.5 transition-colors flex-shrink-0 border border-atlas-line text-atlas-mute hover:text-atlas-soft hover:border-atlas-soft"
            title="Recherche globale"
          >
            <Icon name="search" size={13} />
            <span>{t('search.label')}</span>
            <kbd className="text-[10px] px-1 py-0.5 font-mono text-atlas-mute" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid var(--color-atlas-line)' }}>⌘K</kbd>
          </button>
        )}

        {/* ── Bouton tour (desktop) ── */}
        {hasPageTour && (
          <div className="hidden md:block ml-auto flex-shrink-0">
            <Button
              onClick={() => startAtRoute(location.pathname)}
              size="sm" variant="ghost" title="Revoir la présentation de cette page" aria-label="Aide"
            >
              ?
            </Button>
          </div>
        )}

        {/* ── Sélecteur de langue ── */}
        <div className={`hidden md:flex items-center gap-0.5 flex-shrink-0 ${!hasPageTour ? 'ml-auto' : ''}`}>
          {LANGS.map(({ code, label: langLabel }) => (
            <button
              key={code}
              onClick={() => i18n.changeLanguage(code)}
              className="font-grotesk text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-[0.08em] transition-colors"
              style={{
                backgroundColor: i18n.language?.startsWith(code) ? 'rgba(92,174,142,0.18)' : 'transparent',
                color: i18n.language?.startsWith(code) ? 'var(--color-atlas-green)' : 'var(--color-atlas-mute)',
              }}
            >
              {langLabel}
            </button>
          ))}
        </div>

        {/* ── Bouton utilisateur (desktop) ── */}
        {user ? (
          <div className="hidden md:flex items-center gap-2 flex-shrink-0">
            <Link to="/account" className="text-xs text-atlas-mute truncate max-w-[140px] hover:text-atlas-soft transition-colors">{user.name || user.email}</Link>
            <Button
              onClick={async () => { await authClient.signOut(); navigate('/'); }}
              size="sm" variant="ghost" title={t('nav.logout')}
            >
              {t('nav.logout')}
            </Button>
          </div>
        ) : (
          <div className="hidden md:block flex-shrink-0">
            <button
              onClick={() => navigate('/login')}
              className="font-grotesk text-xs uppercase tracking-[0.08em] font-bold px-4 py-1.5 transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
            >
              {t('nav.login')}
            </button>
          </div>
        )}

        <button
          onClick={() => setMobileOpen(v => !v)}
          className="md:hidden ml-auto flex flex-col gap-1.5 p-2 rounded-lg transition-all"
          style={{ color: mobileOpen ? 'var(--color-atlas-green)' : 'var(--color-atlas-mute)' }}
          aria-label="Menu"
        >
          <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', transform: mobileOpen ? 'translateY(8px) rotate(45deg)' : 'none' }} />
          <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', opacity: mobileOpen ? 0 : 1 }} />
          <span className="block w-5 h-0.5 rounded-full transition-all" style={{ backgroundColor: 'currentColor', transform: mobileOpen ? 'translateY(-8px) rotate(-45deg)' : 'none' }} />
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden flex-shrink-0 border-b border-white/10 overflow-y-auto" style={{ backgroundColor: 'rgba(21,23,27,0.98)', zIndex: 49, maxHeight: 'calc(100dvh - 48px)' }}>

          {hasProjects && (
            <>
              {/* ── Projet & Tome ── */}
              <div className="px-3 pt-2 pb-1 flex items-center gap-2">
                <ProjectPicker />
                <VolumePicker />
              </div>

              {/* ── Routes par groupe ── */}
              <div className="px-3 py-1 flex flex-col gap-0.5">
                {NAV_GROUPS.map((group, gi) => (
                  <div key={group.key}>
                    {gi > 0 && <div className="border-t border-white/10 my-1" />}
                    <div className="px-3 pt-1.5 pb-0.5 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" style={{ color: 'var(--color-atlas-mute)' }}>
                      <Icon name={group.icon} size={12} /> {t(group.labelKey)}
                    </div>
                    {group.items.map(({ path, labelKey, icon }) => {
                      const isActive    = location.pathname === path;
                      const isWarning   = path === '/incoherences';
                      const activeColor = isWarning ? VIZ_STATUS.crit : '#5cae8e';
                      const activeBg    = isWarning ? 'rgba(239,68,68,0.1)' : 'rgba(92,174,142,0.15)';
                      return (
                        <NavLink
                          key={path}
                          to={path}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-semibold transition-all"
                          style={{ backgroundColor: isActive ? activeBg : 'transparent', color: isActive ? activeColor : 'var(--color-atlas-soft)', textDecoration: 'none' }}
                        >
                          <Icon name={icon} size={17} />
                          <span>{t(labelKey)}</span>
                        </NavLink>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Actions (toujours visibles) ── */}
          <div className="border-t border-white/10 px-3 py-2 flex flex-col gap-1">
            {hasProjects && (
              <button
                onClick={() => { onSearchOpen(); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-semibold transition-all"
                style={{ color: 'var(--color-atlas-soft)' }}
              >
                <Icon name="search" size={17} />
                <span>{t('search.label')}</span>
                <kbd className="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#475569' }}>⌘K</kbd>
              </button>
            )}

            {hasPageTour && (
              <button
                onClick={() => { startAtRoute(location.pathname); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-semibold transition-all"
                style={{ color: 'var(--color-atlas-soft)' }}
              >
                <Icon name="help" size={17} />
                <span>{t('nav.helpTour', 'Visite guidée')}</span>
              </button>
            )}

            <div className="flex items-center gap-1 px-3 py-2">
              {LANGS.map(({ code, label: langLabel }) => (
                <button
                  key={code}
                  onClick={() => { i18n.changeLanguage(code); setMobileOpen(false); }}
                  className="text-xs px-2.5 py-1 rounded-lg font-bold transition-all"
                  style={{
                    backgroundColor: i18n.language?.startsWith(code) ? 'rgba(92,174,142,0.2)' : 'rgba(255,255,255,0.04)',
                    color: i18n.language?.startsWith(code) ? '#5cae8e' : 'var(--color-atlas-mute)',
                  }}
                >
                  {langLabel}
                </button>
              ))}
            </div>

            {user ? (
              <NavLink
                to="/account"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-semibold transition-all"
                style={{ color: location.pathname === '/account' ? '#5cae8e' : 'var(--color-atlas-soft)', backgroundColor: location.pathname === '/account' ? 'rgba(92,174,142,0.15)' : 'transparent', textDecoration: 'none' }}
              >
                <Icon name="user" size={17} />
                <span className="truncate">{user.name || user.email}</span>
              </NavLink>
            ) : (
              <button
                onClick={() => { navigate('/login'); setMobileOpen(false); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-none text-sm font-semibold transition-all"
                style={{ color: 'var(--color-atlas-soft)' }}
              >
                <Icon name="key" size={17} />
                <span>{t('nav.login')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
