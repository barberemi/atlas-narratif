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
    sm: 'px-3 py-1.5 text-xs',
    md: 'py-3 text-sm',
  };

  const variants = {
    primary: isDisabled
      ? 'bg-[rgba(255,255,255,0.03)] text-slate-700 border border-[rgba(255,255,255,0.05)]'
      : 'bg-[#5cae8e] text-[#15171b] border border-[#5cae8e] hover:brightness-110',

    secondary: isDisabled
      ? 'bg-[rgba(255,255,255,0.03)] text-slate-700 border border-[rgba(255,255,255,0.05)]'
      : 'bg-[rgba(92,174,142,0.14)] text-[#5cae8e] border border-[rgba(92,174,142,0.4)] hover:bg-[rgba(92,174,142,0.24)] hover:border-[rgba(92,174,142,0.6)]',

    ghost: isDisabled
      ? 'bg-[rgba(255,255,255,0.02)] text-slate-700 border border-[rgba(255,255,255,0.05)]'
      : 'bg-[rgba(255,255,255,0.04)] text-atlas-soft border border-[rgba(255,255,255,0.08)] hover:bg-[rgba(255,255,255,0.08)] hover:text-slate-300',
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
        <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#5cae8e]/30 border-t-[#5cae8e] rounded-full flex-shrink-0" />
      )}
      {children}
    </button>
  );
}
