import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../db/ProjectContext';
import { updateProject } from '../../api/client';
import { computeFirstRun } from '../../utils/firstRun';
import { toast } from '../../lib/toast';
import EntityEditor from '../lore/EntityEditor';
import EventEditor from '../timeline/EventEditor';
import Icon from '../ui/Icon';

/**
 * Checklist « premières minutes » — s'affiche en tête du dashboard tant que le
 * projet est quasi vide (cf. shouldShowFirstRun). Les 3 étapes se dérivent des
 * données réelles et se cochent seules ; aucun state persisté.
 *
 * @param {{ description?: string|null, charactersCount: number, eventsCount: number }} props
 */
export default function FirstRunChecklist({ description, charactersCount, eventsCount }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId, reloadProjects } = useProject();

  const { steps, doneCount, total } = computeFirstRun({ description, charactersCount, eventsCount });
  const byId = Object.fromEntries(steps.map(s => [s.id, s]));

  const [editor, setEditor]       = useState(null);   // null | 'character' | 'scene'
  const [logline, setLogline]     = useState(description ?? '');
  const [savingLog, setSavingLog] = useState(false);
  const [editingLog, setEditingLog] = useState(false);

  const loglineDone = byId.logline.done;
  const showLoglineForm = editingLog || !loglineDone;

  const saveLogline = async () => {
    const value = logline.trim();
    if (!value || savingLog) return;
    setSavingLog(true);
    try {
      await updateProject(projectId, { description: value });
      await reloadProjects();
      toast.success(t('firstRun.loglineSaved'));
      setEditingLog(false);
    } finally {
      setSavingLog(false);
    }
  };

  const pct = Math.round((doneCount / total) * 100);

  const STEP_META = {
    logline:    { icon: 'idea', label: t('firstRun.stepLogline') },
    characters: { icon: 'user', label: t('firstRun.stepCharacters', { count: byId.characters.count, target: byId.characters.target }) },
    scene:      { icon: 'event', label: t('firstRun.stepScene') },
  };

  return (
    <section
      className="rounded-none p-5 md:p-6 flex flex-col gap-5"
      style={{ border: '1px solid var(--color-atlas-line)', backgroundColor: 'rgba(92,174,142,0.04)' }}
      data-testid="first-run-checklist"
    >
      {/* En-tête + progression */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-grotesk text-[10px] font-bold uppercase tracking-[0.2em] text-atlas-gold mb-1.5">
            {t('firstRun.kicker')}
          </p>
          <h2 className="font-serif text-2xl font-semibold text-atlas-text leading-tight">
            {t('firstRun.title')}
          </h2>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">{t('firstRun.subtitle')}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-2xl font-black leading-none" style={{ color: 'var(--color-atlas-green)' }} data-testid="first-run-progress">
            {doneCount}<span className="text-sm text-atlas-mute font-normal">/{total}</span>
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: 'var(--color-atlas-green)' }}
        />
      </div>

      {/* Étapes */}
      <div className="flex flex-col">
        {/* Étape 1 — logline */}
        <div className="flex items-start gap-3 py-3" style={{ borderTop: '1px solid var(--color-atlas-line)' }}>
          <StepMark done={loglineDone} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Icon name={STEP_META.logline.icon} size={14} className="flex-shrink-0 text-atlas-soft" />
              <span className="text-sm font-semibold" style={{ color: loglineDone ? 'var(--color-atlas-mute)' : 'var(--color-atlas-text)' }}>
                {STEP_META.logline.label}
              </span>
            </div>
            {showLoglineForm ? (
              <div className="mt-2 flex flex-col gap-2">
                <textarea
                  value={logline}
                  onChange={e => setLogline(e.target.value)}
                  placeholder={t('firstRun.loglinePlaceholder')}
                  rows={2}
                  className="w-full px-3 py-2 text-sm text-atlas-text bg-transparent border border-atlas-line outline-none focus:border-atlas-green transition-colors resize-none"
                  data-testid="first-run-logline-input"
                />
                <div className="flex gap-2">
                  <button
                    onClick={saveLogline}
                    disabled={!logline.trim() || savingLog}
                    className="px-3 py-1.5 rounded-none text-xs font-black transition-all"
                    style={{
                      backgroundColor: logline.trim() ? 'var(--color-atlas-green)' : 'rgba(92,174,142,0.2)',
                      color: logline.trim() ? 'var(--color-atlas-ink)' : 'rgba(92,174,142,0.5)',
                      cursor: logline.trim() ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {savingLog ? t('btn.saving') : t('firstRun.loglineSave')}
                  </button>
                  {editingLog && (
                    <button
                      onClick={() => { setEditingLog(false); setLogline(description ?? ''); }}
                      className="px-3 py-1.5 rounded-none text-xs font-bold text-atlas-soft hover:text-atlas-text transition-colors"
                    >
                      {t('btn.cancel')}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <button
                onClick={() => { setEditingLog(true); setLogline(description ?? ''); }}
                className="mt-1 text-left text-sm text-atlas-soft font-serif italic hover:text-atlas-text transition-colors"
              >
                « {description} » <span className="not-italic text-[11px] text-atlas-green">· {t('firstRun.edit')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Étape 2 — personnages */}
        <StepRow
          done={byId.characters.done}
          icon={STEP_META.characters.icon}
          label={STEP_META.characters.label}
          actionLabel={t('firstRun.addCharacter')}
          onAction={() => setEditor('character')}
        />

        {/* Étape 3 — scène */}
        <StepRow
          done={byId.scene.done}
          icon={STEP_META.scene.icon}
          label={STEP_META.scene.label}
          actionLabel={t('firstRun.addScene')}
          onAction={() => setEditor('scene')}
        />
      </div>

      {/* Renvoi vers la démo LOTR comme modèle */}
      <div className="flex items-center gap-2 pt-1">
        <span className="text-base">💍</span>
        <button
          onClick={() => navigate('/demo')}
          className="text-xs font-grotesk font-bold uppercase tracking-[0.08em] text-atlas-soft hover:text-atlas-green transition-colors"
        >
          {t('firstRun.exploreDemo')} →
        </button>
      </div>

      {/* Éditeurs (créer sur place) */}
      {editor === 'character' && (
        <EntityEditor entity={null} entityType="character" onClose={() => setEditor(null)} />
      )}
      {editor === 'scene' && (
        <EventEditor event={undefined} chapters={[]} onClose={() => setEditor(null)} />
      )}
    </section>
  );
}

// ── Sous-composants ────────────────────────────────────────────────────────────

function StepMark({ done }) {
  return (
    <span
      className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{
        backgroundColor: done ? 'var(--color-atlas-green)' : 'transparent',
        border: done ? 'none' : '1.5px solid var(--color-atlas-mute)',
      }}
    >
      {done && <Icon name="checkmark" size={12} style={{ color: 'var(--color-atlas-ink)' }} />}
    </span>
  );
}

function StepRow({ done, icon, label, actionLabel, onAction }) {
  return (
    <div className="flex items-center gap-3 py-3" style={{ borderTop: '1px solid var(--color-atlas-line)' }}>
      <StepMark done={done} />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Icon name={icon} size={14} className="flex-shrink-0 text-atlas-soft" />
        <span className="text-sm font-semibold truncate" style={{ color: done ? 'var(--color-atlas-mute)' : 'var(--color-atlas-text)' }}>
          {label}
        </span>
      </div>
      {!done && (
        <button
          onClick={onAction}
          className="flex-shrink-0 px-3 py-1.5 rounded-none text-xs font-bold transition-all"
          style={{ backgroundColor: 'rgba(92,174,142,0.12)', color: 'var(--color-atlas-green)', border: '1px solid rgba(92,174,142,0.3)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
