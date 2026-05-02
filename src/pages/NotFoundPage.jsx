import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

const STARTER = "Il était une fois, un utilisateur perdu sur une page qui n'existait pas. Devant lui, un manuscrit vierge attendait d'être rempli...\n\n";

const CONFETTI_CHARS = ['✨', '📖', '🪶', '✍️', '📚', '🌟', '🎉', '📝'];

function Confetti() {
  const [particles] = useState(() =>
    Array.from({ length: 24 }, (_, i) => ({
      id: i,
      char: CONFETTI_CHARS[i % CONFETTI_CHARS.length],
      left: Math.random() * 100,
      delay: Math.random() * 0.8,
      duration: 1.5 + Math.random() * 1.5,
      size: 14 + Math.random() * 10,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {particles.map(p => (
        <span
          key={p.id}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: -30,
            fontSize: p.size,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        >
          {p.char}
        </span>
      ))}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
        }
        .animate-confetti-fall {
          animation-name: confetti-fall;
          animation-timing-function: ease-in;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
}

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [text, setText] = useState(STARTER);
  const [published, setPublished] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(text.length, text.length);
    }
  }, []);

  useEffect(() => {
    const added = text.length - STARTER.length;
    setCharCount(Math.max(0, added));
  }, [text]);

  function handlePublish() {
    setPublished(true);
    setTimeout(() => navigate('/'), 5000);
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center">
      {published && <Confetti />}

      <div className="flex flex-col items-center gap-2">
        <span className="text-4xl">📖</span>
        <p className="text-xs text-slate-600 uppercase tracking-widest">{t('notFound.chapter', 'Chapitre 404')}</p>
        <h1 className="text-xl font-black text-white">{t('notFound.title', 'Cette page n\'a pas encore \u00e9t\u00e9 \u00e9crite')}</h1>
        <p className="text-xs text-slate-500">{t('notFound.subtitle', 'Le manuscrit est vierge... \u00e0 vous de jouer.')}</p>
      </div>

      {!published ? (
        <div className="w-full max-w-lg flex flex-col gap-3">
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              rows={8}
              className="w-full px-5 py-4 rounded-xl text-sm leading-relaxed font-serif text-slate-300 outline-none resize-none transition-colors"
              style={{
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.08)',
                caretColor: '#818cf8',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
            />
            <span className="absolute bottom-2 right-3 text-[10px] text-slate-700">
              {charCount > 0 ? t('notFound.charsAdded', '{{count}} caract\u00e8re(s) ajout\u00e9(s)', { count: charCount }) : t('notFound.waitingInspiration', 'En attente d\'inspiration...')}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/')}
              className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
            >
              {t('notFound.backHome', 'Retour \u00e0 l\'accueil')}
            </button>
            <button
              onClick={handlePublish}
              disabled={charCount < 10}
              className="px-4 py-2 text-sm font-black rounded-lg transition-all disabled:opacity-30 disabled:cursor-default"
              style={{
                backgroundColor: charCount >= 10 ? 'rgba(63,81,181,0.25)' : 'rgba(63,81,181,0.08)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.3)',
                cursor: charCount >= 10 ? 'pointer' : undefined,
              }}
              onMouseEnter={e => { if (charCount >= 10) { e.currentTarget.style.backgroundColor = 'rgba(63,81,181,0.4)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; } }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = charCount >= 10 ? 'rgba(63,81,181,0.25)' : 'rgba(63,81,181,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; }}
            >
              {t('notFound.publish', 'Publier ce chapitre')}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <p className="text-sm text-indigo-300 font-serif italic">
            {t('notFound.published', 'Chapitre publi\u00e9 avec brio !')}
          </p>
          <p className="text-xs text-slate-600">{t('notFound.redirecting', 'Redirection vers l\'accueil dans un instant...')}</p>
          <style>{`
            @keyframes fade-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
            .animate-fade-in { animation: fade-in 0.5s ease-out; }
          `}</style>
        </div>
      )}
    </div>
  );
}
