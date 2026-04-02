import { useTourStore } from '../../stores/useTourStore';
import { markWelcomeSeen } from './tourUtils';

export default function WelcomeModal({ onClose }) {
  const start = useTourStore(s => s.start);

  const handleStartTour = () => {
    markWelcomeSeen();
    onClose();
    start(0);
  };

  const handleSkip = () => {
    markWelcomeSeen();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ zIndex: 8000, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="flex flex-col gap-6 max-w-md w-full mx-4 rounded-2xl p-8"
        style={{ backgroundColor: 'rgba(11,22,33,0.98)', border: '1px solid rgba(99,102,241,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
      >
        <div className="text-5xl text-center">🗺️</div>

        <div className="text-center">
          <h2 className="text-xl font-black text-slate-100 mb-2">
            Bienvenue dans Atlas<span style={{ color: '#3F51B5' }}>Narratif</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed font-serif italic">
            Vous explorez le projet <strong className="font-bold not-italic text-slate-300">Le Seigneur des Anneaux</strong> — un exemple complet pour découvrir toutes les fonctionnalités.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {[
            { icon: '📊', label: 'Dashboard, timeline et incohérences' },
            { icon: '🌍', label: 'Carte interactive et lore complet' },
            { icon: '🐱', label: 'Structure Save the Cat et Voyage du Héros' },
            { icon: '🧵', label: 'Arcs émotionnels, amorces et fils narratifs' },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-3 text-xs text-slate-400">
              <span className="text-base flex-shrink-0">{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleStartTour}
            className="w-full py-3 rounded-xl text-sm font-black transition-all duration-200"
            style={{ backgroundColor: 'rgba(63,81,181,0.25)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.4)' }}
          >
            Démarrer la visite guidée →
          </button>
          <button
            onClick={handleSkip}
            className="w-full py-2 text-xs text-slate-600 hover:text-slate-400 transition-colors"
          >
            Explorer seul
          </button>
        </div>
      </div>
    </div>
  );
}
