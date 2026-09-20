import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { useStoreLoader } from '../../hooks/useStoreLoader';
import { HeaderAction, HeaderSep } from '../ui/HeaderButton';
import DarkCard from '../ui/DarkCard';
import CustomFieldChips from '../ui/CustomFieldChips';
import WikiText from '../ui/WikiText';
import Skeleton from '../ui/Skeleton';
import Icon from '../ui/Icon';
import CustomTypeEditor from './CustomTypeEditor';
import CustomEntityEditor from './CustomEntityEditor';

const ACCENT = '#a78bfa';

function EntityCard({ entity, type, onClick }) {
  return (
    <div style={{ cursor: 'pointer' }} onClick={onClick}>
      <DarkCard color={type?.color ?? ACCENT} accent={type?.color ?? ACCENT}>
        <div className="p-4 flex flex-col gap-2">
          <h3 className="font-serif text-lg font-semibold text-atlas-text leading-tight">{entity.name}</h3>
          {entity.aliases?.length > 0 && (
            <p className="text-xs text-atlas-soft italic">{entity.aliases.slice(0, 3).join(' · ')}</p>
          )}
          {entity.description && (
            <p className="text-xs text-slate-400 leading-relaxed font-serif line-clamp-3"><WikiText text={entity.description} /></p>
          )}
          <CustomFieldChips fields={entity.customFields} />
        </div>
      </DarkCard>
    </div>
  );
}

/**
 * Navigateur des entités custom (couche 3) : onglets par type, grille d'entités,
 * éditeurs de type et d'entité. `/custom`.
 */
export default function CustomEntityBrowser() {
  const { t } = useTranslation();
  useStoreLoader([useCustomEntityStore]);
  const { types, entities, ready } = useCustomEntityStore();

  const [searchParams] = useSearchParams();
  const typeParam   = searchParams.get('type');
  const entityParam = searchParams.get('entity');

  const [activeTypeId, setActiveTypeId] = useState(null);
  // undefined = fermé, null = création, objet = édition
  const [typeEditor, setTypeEditor] = useState(undefined);
  const [entityEditor, setEntityEditor] = useState(undefined);

  // Deep-link `/custom?type=…&entity=…` (ex. clic sur un wikilink) : présélectionne
  // l'onglet du type et ouvre la fiche de l'entité, une fois les données chargées.
  useEffect(() => {
    if (!ready) return;
    if (entityParam) {
      const ent = entities.find(e => e.id === entityParam);
      if (ent) setEntityEditor(ent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, entityParam]);

  const activeType = useMemo(() => {
    if (!types.length) return null;
    // `activeTypeId` (clic utilisateur) prime, sinon le type du deep-link, sinon le 1er.
    return types.find(ty => ty.id === (activeTypeId ?? typeParam)) ?? types[0];
  }, [types, activeTypeId, typeParam]);

  const shownEntities = useMemo(
    () => entities.filter(e => e.typeId === activeType?.id),
    [entities, activeType],
  );

  if (!ready) return <Skeleton variant="card" />;

  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] mb-1.5" style={{ color: ACCENT }}>{t('customEntity.kicker')}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            {t('customEntity.title')} <span className="italic" style={{ color: ACCENT }}>custom</span>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">{t('customEntity.subtitle')}</p>
        </div>
        <div data-tour="custom-actions" className="flex items-center gap-4">
          <HeaderAction color={ACCENT} onClick={() => setTypeEditor(null)}>{t('customType.add')}</HeaderAction>
          {types.length > 0 && (
            <>
              <HeaderSep />
              <HeaderAction color={ACCENT} onClick={() => setEntityEditor(null)}>{t('customEntity.add')}</HeaderAction>
            </>
          )}
        </div>
      </header>

      {types.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-atlas-mute px-6 text-center">
          <p className="text-5xl mb-4">🗂️</p>
          <p className="font-serif italic text-lg mb-2">{t('customEntity.emptyTypes')}</p>
          <p className="text-sm max-w-md mb-5">{t('customEntity.emptyTypesHint')}</p>
          <button onClick={() => setTypeEditor(null)} className="px-4 py-2 text-sm font-bold" style={{ backgroundColor: ACCENT, color: '#15171b' }}>
            {t('customType.add')}
          </button>
        </div>
      ) : (
        <>
          {/* Onglets = types */}
          <div data-tour="custom-tabs" className="px-6 pt-4 flex-shrink-0">
            <nav className="flex gap-1 border-b border-atlas-line overflow-x-auto no-scrollbar">
              {types.map(ty => {
                const isActive = ty.id === activeType?.id;
                const count = entities.filter(e => e.typeId === ty.id).length;
                return (
                  <button key={ty.id} onClick={() => setActiveTypeId(ty.id)}
                    className="font-grotesk px-4 py-2.5 text-xs font-bold uppercase tracking-[0.08em] transition-all relative flex-shrink-0 whitespace-nowrap flex items-center gap-1.5"
                    style={{ color: isActive ? '#ece7db' : 'var(--color-atlas-mute)' }}>
                    {ty.icon && <span>{ty.icon}</span>}
                    {ty.label}
                    <span className="text-xs font-mono" style={{ color: isActive ? ACCENT : '#3a352d' }}>{count}</span>
                    {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5" style={{ backgroundColor: ACCENT }} />}
                  </button>
                );
              })}
            </nav>
            {activeType && (
              <div className="flex justify-end pt-2">
                <button onClick={() => setTypeEditor(activeType)} data-testid="edit-active-type"
                  className="flex items-center gap-1 text-[11px] text-atlas-mute hover:text-white transition-colors">
                  <Icon name="settings" size={12} /> {t('customType.edit')}
                </button>
              </div>
            )}
          </div>

          {/* Grille d'entités */}
          <main data-tour="custom-grid" className="flex-1 overflow-y-auto no-scrollbar px-6 py-6">
            {shownEntities.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-atlas-mute">
                <p className="text-4xl mb-4">◯</p>
                <p className="font-serif italic">{t('customEntity.emptyEntities')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {shownEntities.map(e => (
                  <EntityCard key={e.id} entity={e} type={activeType} onClick={() => setEntityEditor(e)} />
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* Éditeurs */}
      {typeEditor !== undefined && (
        <CustomTypeEditor type={typeEditor ?? undefined} onClose={() => setTypeEditor(undefined)} />
      )}
      {entityEditor !== undefined && activeType && (
        <CustomEntityEditor entity={entityEditor ?? undefined} type={activeType} types={types} onClose={() => setEntityEditor(undefined)} />
      )}
    </div>
  );
}
