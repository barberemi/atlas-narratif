import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authClient } from '../../lib/authClient';
import Button from '../../components/ui/Button';

const NAV = (
  <nav className="flex-shrink-0 flex items-center px-4 border-b border-white/10"
    style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)' }}>
    <Link to="/" className="text-sm font-black tracking-tight transition-opacity duration-150 hover:opacity-70">
      Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
    </Link>
  </nav>
);

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (err) { setError(err.message ?? 'Erreur lors de l\'envoi'); return; }
      setSent(true);
    } catch {
      setError('Erreur réseau, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
        {NAV}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm flex flex-col gap-6 text-center">
            <div className="text-5xl">✉️</div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Email envoyé</h1>
              <p className="text-sm text-slate-400 leading-relaxed">
                Si <span className="text-indigo-300 font-semibold">{email}</span> correspond à un compte,
                vous recevrez un lien de réinitialisation dans quelques instants.
              </p>
            </div>
            <Link to="/login"
              className="w-full py-3 rounded-xl text-sm font-black tracking-wide flex items-center justify-center transition-all duration-200 cursor-pointer bg-[rgba(63,81,181,0.15)] text-[#818cf8] border border-[rgba(99,102,241,0.3)] hover:bg-[rgba(63,81,181,0.25)] hover:border-[rgba(99,102,241,0.5)]">
              Retour à la connexion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
      {NAV}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-8">

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Mot de passe oublié</h1>
            <p className="text-sm text-slate-500">
              Entrez votre email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold">Email</label>
              <input
                type="email" required autoComplete="email" value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-xs"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              {loading ? 'Envoi…' : 'Envoyer le lien →'}
            </Button>
          </form>

          <p className="text-center text-xs text-slate-600">
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              ← Retour à la connexion
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
