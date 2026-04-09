/**
 * Composant Button unifié — Atlas Narratif
 *
 * variant : 'primary'   indigo plein   (actions principales, submit)
 *           'secondary' indigo léger   (actions secondaires, retour)
 *           'ghost'     transparent    (actions tertiaires, déconnexion)
 * size    : 'sm'  petit inline  (TopNav, badges)
 *           'md'  plein (défaut)
 * fullWidth : étire sur toute la largeur disponible
 * loading   : affiche un spinner + désactive le bouton
 */
export default function Button({
  children,
  onClick,
  type     = 'button',
  variant  = 'primary',
  size     = 'md',
  fullWidth = false,
  loading  = false,
  disabled = false,
  className = '',
  ...props
}) {
  const isDisabled = disabled || loading;

  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-black tracking-wide transition-all duration-200',
    isDisabled ? 'cursor-default' : 'cursor-pointer',
  ].join(' ');

  const sizes = {
    sm: 'px-3 py-1.5 rounded-lg text-xs',
    md: 'py-3 rounded-xl text-sm',
  };

  const variants = {
    primary: isDisabled
      ? 'bg-[rgba(255,255,255,0.03)] text-slate-700 border border-[rgba(255,255,255,0.05)]'
      : 'bg-[rgba(63,81,181,0.25)] text-[#818cf8] border border-[rgba(99,102,241,0.4)] hover:bg-[rgba(63,81,181,0.4)] hover:border-[rgba(99,102,241,0.6)]',

    secondary: isDisabled
      ? 'bg-[rgba(255,255,255,0.03)] text-slate-700 border border-[rgba(255,255,255,0.05)]'
      : 'bg-[rgba(63,81,181,0.15)] text-[#818cf8] border border-[rgba(99,102,241,0.3)] hover:bg-[rgba(63,81,181,0.25)] hover:border-[rgba(99,102,241,0.5)]',

    ghost: isDisabled
      ? 'bg-[rgba(255,255,255,0.02)] text-slate-700 border border-[rgba(255,255,255,0.05)]'
      : 'bg-[rgba(255,255,255,0.04)] text-slate-500 border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-slate-300',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full flex-shrink-0" />
      )}
      {children}
    </button>
  );
}
