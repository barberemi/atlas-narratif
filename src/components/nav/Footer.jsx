import { Link } from 'react-router-dom';

export default function Footer({ onCookieClick }) {
  return (
    <footer className="flex-shrink-0 flex items-center justify-center gap-4 px-4 border-t border-atlas-line"
      style={{ height: 28, backgroundColor: 'rgba(21,23,27,0.97)' }}>
      <Link to="/blog" target="_blank" rel="noopener noreferrer" className="text-[10px] text-atlas-mute hover:text-slate-400 transition-colors">
        Blog
      </Link>
      <Link to="/privacy" className="text-[10px] text-atlas-mute hover:text-slate-400 transition-colors">
        Confidentialité
      </Link>
      <Link to="/terms" className="text-[10px] text-atlas-mute hover:text-slate-400 transition-colors">
        CGU
      </Link>
      {onCookieClick && (
        <button
          onClick={onCookieClick}
          className="text-[10px] text-atlas-mute hover:text-slate-400 transition-colors cursor-pointer"
        >
          Cookies
        </button>
      )}
    </footer>
  );
}
