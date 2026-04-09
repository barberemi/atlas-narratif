import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
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

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password,  setPassword]  = useState('');
  const [password2, setPassword2] = useState('');
  const [error,     setError]     = useState(null);
  const [loading,   setLoading]   = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (password !== password2) { setError('Les mots de passe ne correspondent pas.'); return; }
    setError(null);
    setLoading(true);
    try {
      const { error: err } = await authClient.resetPassword({ token, newPassword: password });
      if (err) { setError(err.message ?? 'Lien invalide ou expiré.'); return; }
      navigate('/login', { state: { reset: true } });
    } catch {
      setError('Erreur réseau, réessaie.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
        {NAV}
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="w-full max-w-sm text-center flex flex-col gap-4">
            <p className="text-sm text-slate-400">Lien invalide ou expiré.</p>
            <Link to="/forgot-password"
              className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
              Demander un nouveau lien
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputStyle = { backgroundColor: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)' };
  function focusStyle(e) { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; }
  function blurStyle(e)  { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
      {NAV}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-8">

          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-black text-white tracking-tight">Nouveau mot de passe</h1>
            <p className="text-sm text-slate-500">Choisissez un mot de passe sécurisé.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold">Nouveau mot de passe</label>
              <input type="password" required autoComplete="new-password" minLength={8}
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className="px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-500 font-semibold">Confirmer le mot de passe</label>
              <input type="password" required autoComplete="new-password"
                value={password2} onChange={e => setPassword2(e.target.value)}
                className="px-3 py-2.5 rounded-lg text-sm text-white outline-none transition-all"
                style={inputStyle} onFocus={focusStyle} onBlur={blurStyle} />
            </div>

            {error && (
              <div className="rounded-lg px-3 py-2.5 text-xs"
                style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                {error}
              </div>
            )}

            <Button type="submit" fullWidth loading={loading} disabled={loading}>
              {loading ? 'Enregistrement…' : 'Changer mon mot de passe →'}
            </Button>
          </form>

        </div>
      </div>
    </div>
  );
}
