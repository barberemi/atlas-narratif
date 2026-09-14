import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon';
import { toast } from '../../lib/toast';
import { fetchProjectExport, exportBasename } from '../../db/exportProject';
import { buildMarkdown } from '../../utils/exportMarkdown';
import { buildCharacterBible, buildSynopsis, buildOpenPlantsChecklist } from '../../utils/deliverables';
import { openHtmlDocument, downloadBlob } from '../../utils/download';

// ── DeliverablesHub ───────────────────────────────────────────────────────────
// Hub « Livrables » : génère des documents prêts à transmettre à partir du
// payload d'export du projet. Ferme la boucle analyse → écriture (point 15).
// Les livrables HTML s'ouvrent dans un onglet imprimable (→ PDF) ; la bible
// complète reste un téléchargement Markdown.
export default function DeliverablesHub({ projectId, projectName, onClose }) {
  const { t, i18n } = useTranslation();
  const [payload, setPayload] = useState(null);
  const [error,   setError]   = useState(false);
  const [busy,    setBusy]    = useState(null);

  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    let alive = true;
    fetchProjectExport(projectId)
      .then(p => { if (alive) setPayload(p); })
      .catch(() => { if (alive) setError(true); });
    return () => { alive = false; };
  }, [projectId]);

  // Livrables HTML imprimables (ouverts dans un onglet → PDF).
  const HTML_ITEMS = [
    { key: 'characterBible', icon: 'user',  build: buildCharacterBible },
    { key: 'synopsis',       icon: 'book',  build: buildSynopsis },
    { key: 'openPlants',     icon: 'plant', build: buildOpenPlantsChecklist },
  ];

  const runHtml = (item) => {
    if (!payload || busy) return;
    setBusy(item.key);
    try {
      const html = item.build(payload, t, i18n.language);
      const win  = openHtmlDocument(html);
      if (!win) toast.error(t('deliverables.popupBlocked'));
    } catch {
      toast.error(t('deliverables.genError'));
    } finally {
      setBusy(null);
    }
  };

  const runMarkdown = () => {
    if (!payload || busy) return;
    setBusy('fullBible');
    try {
      downloadBlob(buildMarkdown(payload), `${exportBasename(projectName)}.md`, 'text/markdown;charset=utf-8');
    } catch {
      toast.error(t('deliverables.genError'));
    } finally {
      setBusy(null);
    }
  };

  const loading = !payload && !error;

  // Rendu via portal dans document.body : le <nav> parent a un backdrop-filter
  // qui en ferait le bloc conteneur des éléments position:fixed, décalant
  // l'overlay. Le portal l'ancre au viewport.
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center p-4 sm:p-8 overflow-y-auto"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-label={t('deliverables.hubTitle')}
        className="w-full max-w-lg rounded-none mt-8 mb-8"
        style={{ backgroundColor: '#1a1d22', border: '1px solid var(--color-atlas-line)', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* En-tête */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-atlas-line">
          <div>
            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">
              {t('deliverables.kicker')}
            </p>
            <h2 className="font-serif text-3xl font-semibold tracking-tight leading-none text-atlas-text">
              {t('deliverables.hubTitle')}
            </h2>
            <p className="text-sm text-atlas-soft font-serif italic mt-1.5">{t('deliverables.hubSubtitle')}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t('deliverables.close')}
            className="text-atlas-mute hover:text-slate-200 transition-colors flex-shrink-0"
          >
            <Icon name="close" size={18} />
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-5">
          {error ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--color-atlas-crit, #d98a7a)' }}>
              {t('deliverables.loadError')}
            </p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {HTML_ITEMS.map(item => (
                <DeliverableCard
                  key={item.key}
                  icon={item.icon}
                  title={t(`deliverables.${item.key}`)}
                  desc={t(`deliverables.${item.key}Desc`)}
                  actionLabel={t('deliverables.generate')}
                  busy={busy === item.key}
                  disabled={loading || (busy && busy !== item.key)}
                  loading={loading}
                  onAction={() => runHtml(item)}
                />
              ))}

              <div className="h-px w-full my-1" style={{ backgroundColor: 'var(--color-atlas-line)' }} />

              <DeliverableCard
                icon="import"
                title={t('deliverables.fullBible')}
                desc={t('deliverables.fullBibleDesc')}
                actionLabel={t('deliverables.download')}
                busy={busy === 'fullBible'}
                disabled={loading || (busy && busy !== 'fullBible')}
                loading={loading}
                onAction={runMarkdown}
              />
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}

function DeliverableCard({ icon, title, desc, actionLabel, busy, disabled, loading, onAction }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-3 rounded-none"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div
        className="w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-none"
        style={{ backgroundColor: 'rgba(92,174,142,0.1)', color: '#5cae8e' }}
      >
        <Icon name={icon} size={18} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-200 truncate">{title}</p>
        <p className="text-[11px] text-atlas-mute leading-snug">{desc}</p>
      </div>
      <button
        onClick={onAction}
        disabled={disabled || busy}
        className="flex-shrink-0 font-grotesk text-[11px] font-bold uppercase tracking-[0.08em] px-3 py-1.5 rounded-none transition-all"
        style={{
          backgroundColor: 'rgba(92,174,142,0.12)',
          color: '#5cae8e',
          border: '1px solid rgba(92,174,142,0.3)',
          opacity: (disabled || busy) ? 0.5 : 1,
          cursor: (disabled || busy) ? 'default' : 'pointer',
        }}
      >
        {busy ? '…' : (loading ? '…' : actionLabel)}
      </button>
    </div>
  );
}
