import { useTranslation } from 'react-i18next';
import MiniJourneyMap from './MiniJourneyMap';

/**
 * Grille de « small multiples » (piste 3) : une vignette de carte par personnage
 * affiché, montrant son trajet complet. Comparer plusieurs destins côte à côte,
 * sans défilement pour quelques personnages (scroll interne au-delà).
 *
 * @param {Array<{key,label,color,journey,deathEventId}>} characters personnages affichés
 * @param {string|null} mapSrc fond de carte du projet
 */
export default function JourneyGrid({ characters, mapSrc }) {
  const { t } = useTranslation();
  if (!characters.length) return null;

  return (
    <div className="h-full overflow-y-auto px-6 md:px-16 py-4">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {characters.map(c => {
          const deathStepIndex = c.deathEventId
            ? c.journey.findIndex(s => s.eventId === c.deathEventId)
            : -1;
          return (
            <div key={c.key} className="flex flex-col">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-xs font-semibold truncate" style={{ color: c.color }}>{c.label}</span>
                <span className="ml-auto text-[10px] font-mono text-atlas-mute flex-shrink-0">
                  {c.journey.length} {t('map.steps')}
                </span>
              </div>
              <div
                className="relative w-full rounded-none overflow-hidden"
                style={{ aspectRatio: '1126 / 845', border: '1px solid var(--color-atlas-line)' }}
              >
                <MiniJourneyMap
                  journey={c.journey}
                  color={c.color}
                  deathStepIndex={deathStepIndex}
                  mapSrc={mapSrc}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
