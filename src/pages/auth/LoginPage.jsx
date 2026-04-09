import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authClient } from '../../lib/authClient';
import { claimProjects } from '../../api/client';
import Button from '../../components/ui/Button';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.signIn.email({ email, password });
      if (err) { setError(err.message ?? 'Identifiants invalides'); return; }
      await claimProjects().catch(() => {});
      navigate('/');
    } catch {
      setError('Erreur réseau, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
      <nav className="flex-shrink-0 flex items-center px-4 border-b border-white/10"
        style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)' }}>
        <Link to="/" className="text-sm font-black tracking-tight transition-opacity duration-150 hover:opacity-70">
          Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-8">

          <h1 className="text-2xl font-black text-white tracking-tight">Connexion</h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'}
                onBlur={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-500 font-semibold">Mot de passe</label>
                <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                  Mot de passe oublié ?
                </Link>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
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
              {loading ? 'Connexion…' : 'Se connecter →'}
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-600">ou</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <button
              type="button"
              onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: window.location.origin + '/' })}
              className="flex items-center justify-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm text-slate-200 transition-colors hover:bg-white/5 cursor-pointer"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
              Continuer avec Google
            </button>
          </div>

          <p className="text-center text-xs text-slate-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
              Créer un compte
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
