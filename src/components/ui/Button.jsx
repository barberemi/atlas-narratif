const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const isPrimary = variant === 'primary';
  
  return (
    <button 
      onClick={onClick}
      className={`
        px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300
        ${isPrimary 
          ? 'bg-[#3F51B5FF] text-white shadow-[0_5px_15px_rgba(63,81,181,0.4)] hover:shadow-[0_8px_20px_rgba(63,81,181,0.6)] hover:-translate-y-0.5' 
          : 'bg-transparent border border-slate-700 text-slate-400 hover:border-slate-400 hover:text-white'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Button;