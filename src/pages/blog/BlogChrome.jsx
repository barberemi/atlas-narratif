import { Link } from 'react-router-dom';

// En-tête / pied partagés des pages publiques du blog.
// Reprend la nav minimaliste des pages légales (thème atlas).
export function BlogNav() {
  return (
    <nav
      className="flex-shrink-0 flex items-center justify-between px-4 border-b border-atlas-line"
      style={{ height: 48, backgroundColor: 'rgba(21,23,27,0.97)' }}
    >
      <Link
        to="/"
        className="font-serif text-base font-bold tracking-tight text-atlas-text transition-opacity duration-150 hover:opacity-70"
      >
        Atlas <span style={{ color: 'var(--color-atlas-green)' }}>Narratif</span>
      </Link>
      <Link
        to="/blog"
        className="font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-soft transition-colors hover:text-atlas-text"
      >
        Le blog
      </Link>
    </nav>
  );
}

export function BlogFooter() {
  return (
    <footer className="flex-shrink-0 border-t border-atlas-line px-6 py-5 text-center">
      <p className="font-serif italic text-atlas-green text-sm mb-1">L&rsquo;atlas de ton roman.</p>
      <p className="font-grotesk text-[11px] uppercase tracking-[0.12em] text-atlas-mute">
        <Link to="/" className="hover:text-atlas-text transition-colors">
          Structure ton roman gratuitement
        </Link>
        {' · '}
        <Link to="/blog" className="hover:text-atlas-text transition-colors">
          Tous les articles
        </Link>
      </p>
    </footer>
  );
}
