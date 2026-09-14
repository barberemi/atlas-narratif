import { useId, cloneElement, isValidElement } from 'react';

const DEFAULT_ACCENT = '#5cae8e';

export function Field({ label, required, children }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.16em] mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {isValidElement(children) ? cloneElement(children, { id, 'aria-required': required || undefined }) : children}
    </div>
  );
}

export function Input({ accent = DEFAULT_ACCENT, ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none transition-colors placeholder-slate-600"
      onFocus={e => { e.currentTarget.style.borderColor = `${accent}80`; }}
      onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
    />
  );
}

export function Textarea({ accent = DEFAULT_ACCENT, rows = 3, ...props }) {
  return (
    <textarea
      rows={rows}
      {...props}
      className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 leading-relaxed font-serif bg-white/5 border border-white/10 outline-none transition-colors placeholder-slate-700 resize-none"
      onFocus={e => { e.currentTarget.style.borderColor = `${accent}80`; }}
      onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
    />
  );
}
