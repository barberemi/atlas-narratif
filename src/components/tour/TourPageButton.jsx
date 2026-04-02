import { useLocation } from 'react-router-dom';
import { useTourStore } from '../../stores/useTourStore';
import { TOUR_STEPS } from '../../data/tour_steps';

export default function TourPageButton() {
  const location     = useLocation();
  const startAtRoute = useTourStore(s => s.startAtRoute);
  const active       = useTourStore(s => s.active);

  // N'affiche le bouton que si la page courante a une étape de tour
  const hasStep = TOUR_STEPS.some(s => s.route === location.pathname && s.dataKey !== null);
  if (!hasStep || active) return null;

  return (
    <button
      onClick={() => startAtRoute(location.pathname)}
      title="Revoir la présentation de cette page"
      className="fixed bottom-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-200 hover:scale-110"
      style={{
        zIndex:          7000,
        backgroundColor: 'rgba(63,81,181,0.2)',
        color:           '#818cf8',
        border:          '1px solid rgba(99,102,241,0.4)',
        boxShadow:       '0 4px 16px rgba(63,81,181,0.25)',
      }}
    >
      ?
    </button>
  );
}
