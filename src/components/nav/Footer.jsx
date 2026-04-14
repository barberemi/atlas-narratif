import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="flex-shrink-0 flex items-center justify-center gap-4 px-4 border-t border-white/10"
      style={{ height: 28, backgroundColor: 'rgba(11,22,33,0.97)' }}>
      <Link to="/privacy" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
        Confidentialité
      </Link>
      <Link to="/terms" className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
        CGU
      </Link>
    </footer>
  );
}
