import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useThreadStore }   from '../stores/useThreadStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useStoreLoader }   from '../hooks/useStoreLoader';
import { useFocusFlash, useFlashScroll } from '../hooks/useFocusFlash';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';
import Icon from '../components/ui/Icon';
import Term from '../components/ui/Term';
import { HeaderAction } from '../components/ui/HeaderButton';
import { VIZ_STATUS } from '../data/viz_palette';

// ── Config ─────────────────────────────────────────────────────────────────────

const THREAD_ROLES = [
  { id: 'main',      label: 'Principale',  color: '#3b82f6' },
  { id: 'subplot_b', label: 'Intrigue B',  color: '#10B981' },
  { id: 'subplot_c', label: 'Intrigue C',  color: '#F59E0B' },
  { id: 'backstory', label: 'Backstory',   color: '#8B5CF6' },
  { id: 'subplot',   label: 'Subplot',     color: '#64748B' },
];

const PALETTE = [
  '#3b82f6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#64748B',
];

function getRoleConfig(roleId) {
  return THREAD_ROLES.find(r => r.id === roleId) ?? THREAD_ROLES[4];
}

// ── ThreadForm ─────────────────────────────────────────────────────────────────

function ThreadForm({ initial, onSave, onCancel, t }) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? '',
    color:       initial?.color       ?? '#3b82f6',
    role:        initial?.role        ?? 'subplot',
    description: initial?.description ?? '',
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const canSave = form.name.trim().length > 0;

  return (
    <div
      className="p-5 space-y-4"
      style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderLeft: '2px solid var(--color-atlas-green)' }}
    >
      <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] font-bold text-atlas-green">
        {initial ? t('threads.editThread', 'Modifier le fil') : t('threads.newThread', 'Nouveau fil narratif')}
      </p>

      {/* Nom */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">{t('label.name')} *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder={t('threads.namePlaceholder')}
          autoFocus
          className="w-full px-3 py-2 rounded-none text-sm text-white border border-white/10 outline-none"
          style={{ backgroundColor: 'var(--color-atlas-ink)' }}
        />
      </div>

      {/* Rôle */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">{t('label.role')}</label>
        <div className="flex flex-wrap gap-1.5">
          {THREAD_ROLES.map(r => {
            const active = form.role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => set('role', r.id)}
                className="px-2.5 py-1 rounded-none text-xs font-bold transition-all duration-150"
                style={{
                  backgroundColor: active ? `${r.color}20` : 'rgba(255,255,255,0.04)',
                  color:           active ? r.color : 'var(--color-atlas-mute)',
                  border:          `1px solid ${active ? `${r.color}50` : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {t(`threads.role${r.id[0].toUpperCase()}${r.id.slice(1).replace(/_(\w)/g, (_, c) => c.toUpperCase())}`, r.label)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Couleur */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">{t('label.color')}</label>
        <div className="flex flex-wrap gap-2">
          {PALETTE.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => set('color', c)}
              className="w-6 h-6 rounded-full transition-all duration-150"
              style={{
                backgroundColor: c,
                outline:         form.color === c ? `2px solid ${c}` : 'none',
                outlineOffset:   '2px',
                opacity:         form.color === c ? 1 : 0.55,
              }}
            />
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">{t('label.description')}</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder={t('threads.descriptionPlaceholder', 'R\u00e9sum\u00e9 de l\'intrigue, enjeux\u2026')}
          className="w-full px-3 py-2 rounded-none text-sm text-slate-300 border border-white/10 outline-none resize-none"
          style={{ backgroundColor: 'var(--color-atlas-ink)' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] text-atlas-mute border border-atlas-line hover:text-atlas-soft transition-all"
        >
          {t('btn.cancel')}
        </button>
        <button
          onClick={() => canSave && onSave({ ...form, description: form.description.trim() || null })}
          disabled={!canSave}
          className="flex-1 py-2 font-grotesk text-[11px] font-bold uppercase tracking-[0.06em] transition-opacity duration-150 disabled:opacity-30"
          style={{ backgroundColor: 'var(--color-atlas-green)', color: 'var(--color-atlas-ink)' }}
        >
          {initial ? t('btn.save') : t('threads.createThread', 'Cr\u00e9er le fil')}
        </button>
      </div>
    </div>
  );
}

// ── ThreadCard ─────────────────────────────────────────────────────────────────

function ThreadCard({ thread, flash, events, onEdit, onDelete, t }) {
  const [expanded,      setExpanded]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { ref: flashRef, flashing } = useFlashScroll(flash);

  const roleConfig = getRoleConfig(thread.role);
  const threadEvents = useMemo(
    () => events.filter(e => (e.threadIds ?? []).includes(thread.id))
           .sort((a, b) => a.chapter - b.chapter || a.sceneOrder - b.sceneOrder),
    [events, thread.id],
  );

  // Chapitres couverts
  const chapterRange = useMemo(() => {
    if (!threadEvents.length) return null;
    const nums = [...new Set(threadEvents.map(e => e.chapter))];
    if (nums.length === 1) return `ch.${nums[0]}`;
    return `ch.${Math.min(...nums)} → ${Math.max(...nums)}`;
  }, [threadEvents]);

  return (
    <div
      ref={flashRef}
      className={`overflow-hidden transition-all duration-150${flashing ? ' atlas-flash' : ''}`}
      style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
    >
      {/* En-tête */}
      <div className="flex items-start gap-3 p-4">
        {/* Dot couleur */}
        <div
          className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
          style={{ backgroundColor: thread.color }}
        />

        {/* Contenu principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-base font-semibold text-atlas-text">{thread.name}</span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{
                backgroundColor: `${roleConfig.color}15`,
                color:           roleConfig.color,
                border:          `1px solid ${roleConfig.color}30`,
              }}
            >
              {t(`threads.role${thread.role[0].toUpperCase()}${thread.role.slice(1).replace(/_(\w)/g, (_, c) => c.toUpperCase())}`, roleConfig.label)}
            </span>
            {chapterRange && (
              <span className="text-[10px] text-atlas-soft font-mono">{chapterRange}</span>
            )}
          </div>
          {thread.description && (
            <p className="text-xs text-atlas-soft font-serif italic mt-1 leading-relaxed">
              {thread.description}
            </p>
          )}
          <p className="text-xs text-atlas-mute mt-1.5">
            {t('threads.taggedEvents', '{{count}} \u00e9v\u00e9nement(s) tagg\u00e9(s)', { count: threadEvents.length })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {threadEvents.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-6 h-6 rounded flex items-center justify-center text-atlas-soft hover:text-slate-300 hover:bg-white/08 transition-all text-[10px]"
              title={expanded ? t('threads.collapse', 'R\u00e9duire') : t('threads.showEvents', 'Voir les \u00e9v\u00e9nements')}
            >
              <Icon name={expanded ? 'chevronUp' : 'chevronDown'} size={12} />
            </button>
          )}
          <button
            onClick={() => onEdit(thread)}
            className="w-6 h-6 rounded-none flex items-center justify-center transition-all duration-150"
            style={{
              backgroundColor: 'rgba(92,174,142,0.15)',
              color: '#5cae8e',
              border: '1px solid rgba(92,174,142,0.3)',
              opacity: 0.4,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            title={t('threads.edit', 'Modifier')}
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-2.5.5.5-2.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-atlas-mute hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
              title={t('btn.delete')}
            >
              <Icon name="close" size={12} />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-atlas-soft border border-white/08 hover:bg-white/05"
              >
                {t('project.no')}
              </button>
              <button
                onClick={() => onDelete(thread.id)}
                className="px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: VIZ_STATUS.crit, border: '1px solid rgba(239,68,68,0.35)' }}
              >
                {t('project.yes')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Liste des événements */}
      {expanded && threadEvents.length > 0 && (
        <div
          className="border-t border-white/05 px-4 pb-3 pt-2 space-y-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.15)' }}
        >
          {threadEvents.map(evt => (
            <div key={evt.id} className="flex items-center gap-2 py-0.5">
              <span
                className="text-[10px] font-mono flex-shrink-0"
                style={{ color: thread.color, opacity: 0.7 }}
              >
                ch.{evt.chapter}
              </span>
              <span className="text-xs text-slate-400 truncate">{evt.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ThreadsBrowser ─────────────────────────────────────────────────────────────

export default function ThreadsBrowser() {
  const { t } = useTranslation();
  useStoreLoader([useThreadStore, useTimelineStore]);
  const _threads     = useThreadStore(s => s.threads);
  const threads      = _threads ?? [];
  const addThread    = useThreadStore(s => s.addThread);
  const editThread   = useThreadStore(s => s.editThread);
  const removeThread = useThreadStore(s => s.removeThread);

  const events = useTimelineStore(s => s.events) ?? [];

  // Deep-link « aller pile sur un fil » (?focus=<id> depuis le chat).
  const flashId = useFocusFlash(_threads != null);

  const [showForm,   setShowForm]   = useState(false);
  const [editingId,  setEditingId]  = useState(null);

  // Stats
  const taggedEventCount = useMemo(() => {
    const ids = new Set((threads ?? []).map(t => t.id));
    return (events ?? []).filter(e => (e.threadIds ?? []).some(id => ids.has(id))).length;
  }, [events, threads]);

  const handleSave = async (data) => {
    if (editingId) {
      await editThread(editingId, data);
      setEditingId(null);
    } else {
      await addThread(data);
      setShowForm(false);
    }
  };

  const handleEdit = (thread) => {
    setEditingId(thread.id);
    setShowForm(false);
  };

  const handleDelete = async (threadId) => {
    await removeThread(threadId);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  if (threads === null) return <Skeleton variant="list" />;

  return (
    <div className="h-full w-full max-w-[1280px] mx-auto flex flex-col bg-atlas-ink text-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <header data-tour="threads-list" className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
        <div className="flex-1">
          <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{'Écrire · fils narratifs'}</p>
          <h1 className="font-serif text-4xl font-semibold tracking-tight leading-none">
            <Term id="thread">{t('threads.titlePrefix', 'Fils')} <span className="italic" style={{ color: '#5cae8e' }}>{t('threads.titleHighlight', 'Narratifs')}</span></Term>
          </h1>
          <p className="text-sm text-atlas-soft font-serif italic mt-1">
            {t('threads.statsLine', '{{threadCount}} fil(s) \u00b7 {{eventCount}} \u00e9v\u00e9nement(s) tagg\u00e9(s)', { threadCount: threads.length, eventCount: taggedEventCount })}
          </p>
        </div>
        <HeaderAction onClick={() => { setShowForm(v => !v); setEditingId(null); }}>
          + {t('threads.newThreadBtn', 'Nouveau fil')}
        </HeaderAction>
      </header>

      {/* ── Contenu ── */}
      <div data-tour="threads-cards" className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 bg-atlas-ink">
        <div className="flex flex-col gap-4 max-w-5xl">

          {/* Formulaire création */}
          {showForm && (
            <ThreadForm
              onSave={handleSave}
              onCancel={handleCancelForm}
              t={t}
            />
          )}

          {/* Vide */}
          {threads.length === 0 && !showForm && (
            <EmptyState icon={<Icon name="thread" size={40} className="text-atlas-mute" />} title={t('threads.emptyTitle', 'Aucun fil narratif')} hint={t('threads.emptyHint', 'Cr\u00e9ez vos fils (intrigue principale, subplot B, backstory\u2026) puis taggez vos \u00e9v\u00e9nements depuis la Timeline.')} />
          )}

          {/* Liste des fils */}
          {threads.map(thread => (
            editingId === thread.id ? (
              <ThreadForm
                key={thread.id}
                initial={thread}
                onSave={handleSave}
                onCancel={handleCancelForm}
                t={t}
              />
            ) : (
              <ThreadCard
                key={thread.id}
                thread={thread}
                flash={thread.id === flashId}
                events={events}
                onEdit={handleEdit}
                onDelete={handleDelete}
                t={t}
              />
            )
          ))}

        </div>
      </div>
    </div>
  );
}
