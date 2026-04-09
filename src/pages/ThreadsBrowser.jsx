import { useState, useMemo } from 'react';
import { useThreadStore }   from '../stores/useThreadStore';
import { useTimelineStore } from '../stores/useTimelineStore';

// ── Config ─────────────────────────────────────────────────────────────────────

const THREAD_ROLES = [
  { id: 'main',      label: 'Principale',  color: '#3F51B5' },
  { id: 'subplot_b', label: 'Intrigue B',  color: '#10B981' },
  { id: 'subplot_c', label: 'Intrigue C',  color: '#F59E0B' },
  { id: 'backstory', label: 'Backstory',   color: '#8B5CF6' },
  { id: 'subplot',   label: 'Subplot',     color: '#64748B' },
];

const PALETTE = [
  '#3F51B5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#EC4899', '#84CC16', '#F97316', '#64748B',
];

function getRoleConfig(roleId) {
  return THREAD_ROLES.find(r => r.id === roleId) ?? THREAD_ROLES[4];
}

// ── ThreadForm ─────────────────────────────────────────────────────────────────

function ThreadForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:        initial?.name        ?? '',
    color:       initial?.color       ?? '#3F51B5',
    role:        initial?.role        ?? 'subplot',
    description: initial?.description ?? '',
  });
  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const canSave = form.name.trim().length > 0;

  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ backgroundColor: 'rgba(63,81,181,0.06)', border: '1px solid rgba(63,81,181,0.2)' }}
    >
      <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: '#818cf8' }}>
        {initial ? 'Modifier le fil' : 'Nouveau fil narratif'}
      </p>

      {/* Nom */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Nom *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="Ex : Romance Aragorn/Arwen, Trahison de Saroumane…"
          autoFocus
          className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none"
          style={{ backgroundColor: '#0d1b2a' }}
        />
      </div>

      {/* Rôle */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Rôle</label>
        <div className="flex flex-wrap gap-1.5">
          {THREAD_ROLES.map(r => {
            const active = form.role === r.id;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => set('role', r.id)}
                className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                style={{
                  backgroundColor: active ? `${r.color}20` : 'rgba(255,255,255,0.04)',
                  color:           active ? r.color : '#475569',
                  border:          `1px solid ${active ? `${r.color}50` : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Couleur */}
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Couleur</label>
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
        <label className="block text-xs text-slate-400 mb-1.5">Description</label>
        <textarea
          rows={2}
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Résumé de l'intrigue, enjeux…"
          className="w-full px-3 py-2 rounded-lg text-sm text-slate-300 border border-white/10 outline-none resize-none"
          style={{ backgroundColor: '#0d1b2a' }}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500 border border-white/08 hover:bg-white/05 transition-all"
        >
          Annuler
        </button>
        <button
          onClick={() => canSave && onSave({ ...form, description: form.description.trim() || null })}
          disabled={!canSave}
          className="flex-1 py-2 rounded-lg text-xs font-black transition-all duration-150"
          style={{
            backgroundColor: canSave ? 'rgba(63,81,181,0.25)' : 'rgba(63,81,181,0.08)',
            color:           canSave ? '#818cf8' : 'rgba(129,140,248,0.3)',
            border:          `1px solid ${canSave ? 'rgba(99,102,241,0.4)' : 'rgba(99,102,241,0.1)'}`,
          }}
        >
          {initial ? 'Enregistrer' : 'Créer le fil'}
        </button>
      </div>
    </div>
  );
}

// ── ThreadCard ─────────────────────────────────────────────────────────────────

function ThreadCard({ thread, events, onEdit, onDelete }) {
  const [expanded,      setExpanded]      = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
      className="rounded-2xl overflow-hidden transition-all duration-150"
      style={{ border: `1px solid rgba(255,255,255,0.07)`, backgroundColor: 'rgba(255,255,255,0.02)' }}
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
            <span className="text-sm font-black text-white">{thread.name}</span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold"
              style={{
                backgroundColor: `${roleConfig.color}15`,
                color:           roleConfig.color,
                border:          `1px solid ${roleConfig.color}30`,
              }}
            >
              {roleConfig.label}
            </span>
            {chapterRange && (
              <span className="text-[10px] text-slate-500 font-mono">{chapterRange}</span>
            )}
          </div>
          {thread.description && (
            <p className="text-xs text-slate-500 font-serif italic mt-1 leading-relaxed">
              {thread.description}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-1.5">
            {threadEvents.length} événement{threadEvents.length !== 1 ? 's' : ''} taggé{threadEvents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {threadEvents.length > 0 && (
            <button
              onClick={() => setExpanded(v => !v)}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/08 transition-all text-[10px]"
              title={expanded ? 'Réduire' : 'Voir les événements'}
            >
              {expanded ? '▲' : '▼'}
            </button>
          )}
          <button
            onClick={() => onEdit(thread)}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-all duration-150"
            style={{
              backgroundColor: 'rgba(99,102,241,0.15)',
              color: '#818cf8',
              border: '1px solid rgba(99,102,241,0.3)',
              opacity: 0.4,
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => e.currentTarget.style.opacity = '0.4'}
            title="Modifier"
          >
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M8.5 1.5a1.414 1.414 0 0 1 2 2L3.5 10.5l-2.5.5.5-2.5L8.5 1.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs"
              title="Supprimer"
            >
              ✕
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 border border-white/08 hover:bg-white/05"
              >
                Non
              </button>
              <button
                onClick={() => onDelete(thread.id)}
                className="px-2 py-0.5 rounded text-[10px] font-bold transition-all"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}
              >
                Oui
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
  const threads      = useThreadStore(s => s.threads);
  const addThread    = useThreadStore(s => s.addThread);
  const editThread   = useThreadStore(s => s.editThread);
  const removeThread = useThreadStore(s => s.removeThread);

  const events = useTimelineStore(s => s.events);

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

  if (threads === null) return (
    <div className="h-full flex items-center justify-center">
      <span className="text-slate-600 font-serif italic">Chargement…</span>
    </div>
  );

  return (
    <div className="h-full w-full flex flex-col bg-[#0B1621] text-slate-200 overflow-hidden">

      {/* ── Header ── */}
      <header data-tour="threads-list" className="flex items-center justify-between px-6 py-3 border-b border-white/10 flex-shrink-0">
        <div className="flex-1">
          <h1 className="text-lg font-black tracking-tight">
            Fils <span style={{ color: '#3F51B5' }}>Narratifs</span>
          </h1>
          <p className="text-xs text-slate-500 font-serif italic">
            {threads.length} fil{threads.length !== 1 ? 's' : ''} · {taggedEventCount} événement{taggedEventCount !== 1 ? 's' : ''} taggé{taggedEventCount !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setEditingId(null); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all duration-150"
          style={{ backgroundColor: 'rgba(63,81,181,0.2)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.35)' }}
        >
          + Nouveau fil
        </button>
      </header>

      {/* ── Contenu ── */}
      <div data-tour="threads-cards" className="flex-1 overflow-y-auto no-scrollbar px-6 py-6 bg-[#0B1621]">
        <div className="flex flex-col gap-4 max-w-3xl mx-auto">

          {/* Formulaire création */}
          {showForm && (
            <ThreadForm
              onSave={handleSave}
              onCancel={handleCancelForm}
            />
          )}

          {/* Vide */}
          {threads.length === 0 && !showForm && (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
              <p className="text-4xl opacity-20">🧵</p>
              <p className="text-slate-500 font-serif italic text-sm">
                Aucun fil narratif pour l'instant.
              </p>
              <p className="text-slate-600 text-xs max-w-xs">
                Créez vos fils (intrigue principale, subplot B, backstory…) puis taggez vos événements depuis la Timeline.
              </p>
            </div>
          )}

          {/* Liste des fils */}
          {threads.map(thread => (
            editingId === thread.id ? (
              <ThreadForm
                key={thread.id}
                initial={thread}
                onSave={handleSave}
                onCancel={handleCancelForm}
              />
            ) : (
              <ThreadCard
                key={thread.id}
                thread={thread}
                events={events}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )
          ))}

        </div>
      </div>
    </div>
  );
}
