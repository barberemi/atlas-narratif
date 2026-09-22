import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Icon from '../ui/Icon';

const ACCENT = '#5cae8e';

function relTime(ts, t) {
  if (!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return t('chat.now');
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} j`;
  return new Date(ts).toLocaleDateString();
}

const norm = (s) => String(s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/**
 * Panneau latéral : liste des discussions (threads) avec recherche, sélection,
 * création, renommage inline et suppression (confirmation en deux temps).
 * Responsive : tiroir coulissant sur mobile (piloté par `open`/`onRequestClose`),
 * statique dès `md`.
 */
export default function ChatThreadList({ threads, activeId, onSelect, onNew, onRename, onDelete, onTogglePin, open = false, onRequestClose }) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');
  const [confirming, setConfirming] = useState(null);
  const [query, setQuery] = useState('');

  const startRename = (th) => { setEditing(th.id); setDraft(th.title || ''); };
  const commitRename = () => { if (editing) onRename(editing, draft.trim()); setEditing(null); setDraft(''); };

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    const base = !q ? threads : threads.filter(th =>
      norm(th.title).includes(q) || (th.messages ?? []).some(m => norm(m.text).includes(q)));
    // Épinglés en tête, puis par date de mise à jour décroissante.
    return [...base].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [threads, query]);

  return (
    <>
      {/* Backdrop mobile */}
      {open && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={onRequestClose} aria-hidden="true" />}

      <aside
        className={`w-64 flex-shrink-0 border-r border-atlas-line flex flex-col bg-atlas-ink z-40 fixed inset-y-0 left-0 transition-transform duration-200 md:static md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}
        data-testid="chat-threadlist"
        data-tour="chat-threads"
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-atlas-line flex-shrink-0">
          <span className="font-grotesk text-[10px] font-bold uppercase tracking-[0.16em] text-atlas-soft">{t('chat.threads')}</span>
          <button onClick={onNew} data-testid="chat-new-thread" title={t('chat.newThread')}
            className="flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold leading-none"
            style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}40` }}>
            <span className="text-sm leading-none">+</span> {t('chat.newThreadShort')}
          </button>
        </div>

        {/* Recherche */}
        <div className="px-2 pt-2 flex-shrink-0">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('chat.searchThreads')}
            data-testid="chat-thread-search"
            className="w-full px-2.5 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600 focus:border-[#5cae8e]"
          />
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
          {threads.length === 0 && (
            <p className="text-[11px] text-atlas-mute italic px-2 py-4 text-center">{t('chat.noThreads')}</p>
          )}
          {threads.length > 0 && filtered.length === 0 && (
            <p className="text-[11px] text-atlas-mute italic px-2 py-4 text-center">{t('chat.noSearchResult')}</p>
          )}
          {filtered.map((th) => {
            const active = th.id === activeId;
            const isEditing = editing === th.id;
            const isConfirming = confirming === th.id;
            return (
              <div key={th.id} data-testid="chat-thread"
                onClick={() => !isEditing && onSelect(th.id)}
                className="group rounded-lg px-2.5 py-2 cursor-pointer transition-colors"
                style={{ backgroundColor: active ? `${ACCENT}18` : 'transparent', border: `1px solid ${active ? `${ACCENT}45` : 'transparent'}` }}>
                {isEditing ? (
                  <input
                    autoFocus value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setEditing(null); setDraft(''); } }}
                    onBlur={commitRename}
                    data-testid="chat-thread-rename-input"
                    className="w-full px-1.5 py-1 rounded text-xs text-slate-200 bg-white/10 border border-white/15 outline-none"
                  />
                ) : (
                  <div className="flex items-center gap-1.5">
                    {th.pinned && <span className="flex-shrink-0 text-[10px]" title={t('chat.pinned')}>📌</span>}
                    <span className="flex-1 min-w-0 truncate text-xs" style={{ color: active ? '#e2e8f0' : 'var(--color-atlas-soft)' }}>
                      {th.title || t('chat.untitled')}
                    </span>
                    {isConfirming ? (
                      <span className="flex items-center gap-0.5 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { onDelete(th.id); setConfirming(null); }} data-testid="chat-thread-delete-confirm" title={t('chat.delete')} className="p-1 text-red-400 hover:text-red-300"><Icon name="checkmark" size={14} /></button>
                        <button onClick={() => setConfirming(null)} title={t('btn.cancel')} className="p-1 text-atlas-mute hover:text-white"><Icon name="close" size={14} /></button>
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 flex-shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => onTogglePin(th.id)} data-testid="chat-thread-pin" title={th.pinned ? t('chat.unpin') : t('chat.pin')} className={`p-1 text-[13px] leading-none ${th.pinned ? '' : 'grayscale opacity-70 hover:opacity-100'}`}>📌</button>
                        <button onClick={() => startRename(th)} data-testid="chat-thread-rename" title={t('chat.rename')} className="p-1 text-atlas-mute hover:text-white"><Icon name="edit" size={13} /></button>
                        <button onClick={() => setConfirming(th.id)} data-testid="chat-thread-delete" title={t('chat.delete')} className="p-1 text-atlas-mute hover:text-red-400"><Icon name="trash" size={13} /></button>
                      </span>
                    )}
                  </div>
                )}
                {!isEditing && (
                  <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-atlas-mute">
                    <span>{relTime(th.updatedAt, t)}</span>
                    {th.messages?.length > 0 && <span>· {th.messages.length} msg</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
