import { useLocation, Link } from 'react-router-dom';

export default function VerifyEmailPage() {
  const { state } = useLocation();
  const email = state?.email;

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-[#0B1621] text-slate-200">
      <nav className="flex-shrink-0 flex items-center px-4 border-b border-white/10"
        style={{ height: 48, backgroundColor: 'rgba(11,22,33,0.97)' }}>
        <Link to="/" className="text-sm font-black tracking-tight transition-opacity duration-150 hover:opacity-70">
          Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm flex flex-col gap-6 text-center">

          <div className="text-5xl">✉️</div>

          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-black text-white tracking-tight">Vérifiez votre email</h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              Un lien de confirmation a été envoyé à{' '}
              {email
                ? <span className="text-indigo-300 font-semibold">{email}</span>
                : 'votre adresse email'
              }.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed mt-1">
              Cliquez sur le lien dans l'email pour activer votre compte.
              Vérifiez vos spams si vous ne le voyez pas.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to="/login"
              className="w-full py-3 rounded-xl text-sm font-black tracking-wide transition-all duration-200 flex items-center justify-center"
              style={{
                backgroundColor: 'rgba(63,81,181,0.15)',
                color: '#818cf8',
                border: '1px solid rgba(99,102,241,0.3)',
              }}
            >
              Retour à la connexion
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
