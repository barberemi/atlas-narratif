import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useLoreStore } from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { useChatStore } from '../../stores/useChatStore';
import { useStoreLoader } from '../../hooks/useStoreLoader';
import { useProject } from '../../db/ProjectContext';
import { answerQuery } from '../../chat/router';
import { askProject } from '../../api/client';
import { entityHrefById } from '../../utils/entityUtils';
import Icon from '../ui/Icon';
import AnswerText from './AnswerText';
import ChatThreadList from './ChatThreadList';

const ACCENT = '#5cae8e';

/**
 * Chat de requête sur le projet — multi-discussions.
 *
 * Colonne gauche : liste des threads (persistés localStorage par projet).
 * Colonne droite : conversation active. Niveau 1 (défaut) : routeur déterministe
 * local ; niveau 2 (« recherche approfondie ») : POST /projects/:id/ask.
 */
export default function ChatPanel() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { projectId } = useProject();
  useStoreLoader([useLoreStore, useTimelineStore, useCustomEntityStore]);

  const characters = useLoreStore(s => s.characters);
  const locations  = useLoreStore(s => s.locations);
  const objects    = useLoreStore(s => s.objects);
  const events     = useTimelineStore(s => s.events);
  const customEntities = useCustomEntityStore(s => s.entities);

  // ── Threads persistés ──────────────────────────────────────────────────────
  const loadChat   = useChatStore(s => s.load);
  const threads    = useChatStore(s => s.threads);
  const activeId   = useChatStore(s => s.activeId);
  const addMessage = useChatStore(s => s.addMessage);
  const newThread  = useChatStore(s => s.newThread);
  const setActive  = useChatStore(s => s.setActive);
  const renameThread = useChatStore(s => s.renameThread);
  const deleteThread = useChatStore(s => s.deleteThread);
  const togglePin    = useChatStore(s => s.togglePin);
  const [copiedIdx, setCopiedIdx] = useState(null);

  const copyAnswer = (text, idx) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(c => (c === idx ? null : c)), 1500);
    }).catch(() => {});
  };

  useEffect(() => { if (projectId) loadChat(projectId); }, [projectId, loadChat]);

  const active = threads.find(x => x.id === activeId) ?? null;
  const messages = active?.messages ?? [];

  const [input, setInput] = useState('');
  const [deep, setDeep] = useState(false);
  const [busy, setBusy] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const listRef = useRef(null);

  useEffect(() => { listRef.current?.scrollTo(0, listRef.current.scrollHeight); }, [messages]);

  const send = async () => {
    const question = input.trim();
    if (!question || busy) return;
    setInput('');
    addMessage({ role: 'user', text: question });

    if (deep) {
      setBusy(true);
      try {
        const res = await askProject(question, projectId);
        addMessage({ role: 'bot', text: res.answer, meta: `${res.provider}${res.context?.length ? ` · ${res.context.length} source(s)` : ''}`, sources: res.context ?? [] });
      } catch (e) {
        addMessage({ role: 'bot', text: String(e.message ?? e) });
      } finally {
        setBusy(false);
      }
    } else {
      const res = answerQuery(question, { characters, locations, objects, events, customEntities });
      // Mêmes pucettes de sources cliquables que le niveau 2 : les entités citées.
      const sources = (res.matches ?? [])
        .map(m => ({ id: m.id, name: m.name ?? m.title }))
        .filter(s => s.id && s.name);
      addMessage({ role: 'bot', text: res.answer, meta: res.intent, sources });
    }
  };

  return (
    <div className="h-full w-full flex bg-atlas-ink text-slate-200 overflow-hidden">
      <ChatThreadList
        threads={threads}
        activeId={activeId}
        onSelect={(id) => { setActive(id); setNavOpen(false); }}
        onNew={() => { newThread(); setNavOpen(false); }}
        onRename={renameThread}
        onDelete={deleteThread}
        onTogglePin={togglePin}
        open={navOpen}
        onRequestClose={() => setNavOpen(false)}
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setNavOpen(true)} data-testid="chat-nav-toggle" title={t('chat.threads')}
              className="md:hidden flex-shrink-0 w-8 h-8 flex items-center justify-center rounded border border-atlas-line text-atlas-soft hover:text-white">
              <Icon name="view" size={16} />
            </button>
            <div className="min-w-0">
              <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] mb-1.5" style={{ color: ACCENT }}>{t('chat.kicker')}</p>
              <h1 className="font-serif text-2xl font-semibold tracking-tight leading-none truncate">
                {active?.title || t('chat.title')}
              </h1>
            </div>
          </div>
          <label data-tour="chat-deep" className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0" title={t('chat.deepHint')}>
            <span className="font-grotesk text-[11px] font-bold uppercase tracking-[0.08em] transition-colors" style={{ color: deep ? ACCENT : 'var(--color-atlas-mute)' }}>
              {t('chat.deep')}
            </span>
            <span className="relative inline-block flex-shrink-0"
              style={{ width: 38, height: 22, borderRadius: 999, transition: 'background .2s',
                background: deep ? ACCENT : 'rgba(255,255,255,0.14)',
                boxShadow: deep ? `0 0 0 1px ${ACCENT}` : 'inset 0 0 0 1px rgba(255,255,255,0.12)' }}>
              <input type="checkbox" checked={deep} onChange={e => setDeep(e.target.checked)} data-testid="chat-deep-toggle"
                className="absolute inset-0 w-full h-full m-0 opacity-0 cursor-pointer" />
              <span className="absolute rounded-full"
                style={{ top: 3, left: deep ? 19 : 3, width: 16, height: 16, background: '#fff', transition: 'left .2s', boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }} />
            </span>
          </label>
        </header>

        <p className="px-6 pt-3 text-[11px] text-atlas-mute leading-relaxed flex-shrink-0" data-testid="chat-disclaimer">
          ℹ️ {t('chat.disclaimer')}{' '}
          <Link to="/privacy" className="underline hover:text-atlas-soft">{t('chat.disclaimerLink')}</Link>
        </p>

        <main ref={listRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-3">
          {messages.length === 0 && (
            <div className="text-atlas-mute text-sm space-y-1">
              <p className="font-serif italic">{t('chat.placeholder')}</p>
              <ul className="text-xs list-disc pl-5 mt-2 space-y-0.5">
                <li>{t('chat.example1')}</li>
                <li>{t('chat.example2')}</li>
                <li>{t('chat.example3')}</li>
              </ul>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[80%] px-3.5 py-2 rounded-2xl text-sm leading-relaxed"
                style={m.role === 'user'
                  ? { backgroundColor: `${ACCENT}22`, color: '#e2e8f0', border: `1px solid ${ACCENT}44` }
                  : { backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                data-testid={m.role === 'bot' ? 'chat-answer' : undefined}
              >
                {m.role === 'bot' ? <AnswerText text={m.text} /> : m.text}
                {m.sources?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2" data-testid="chat-sources">
                    {m.sources.map((s) => {
                      const href = entityHrefById(s.id);
                      const cls = 'text-[10px] px-1.5 py-0.5 rounded-full';
                      const style = { backgroundColor: `${ACCENT}18`, color: ACCENT, border: `1px solid ${ACCENT}40` };
                      return href
                        ? <button key={s.id} type="button" onClick={() => navigate(href)} className={`${cls} hover:brightness-125 transition`} style={style} title={s.name}>{s.name}</button>
                        : <span key={s.id} className={cls} style={style}>{s.name}</span>;
                    })}
                  </div>
                )}
                {m.meta && <span className="block mt-1 text-[10px] text-atlas-mute uppercase tracking-wider">{m.meta}</span>}
                {m.role === 'bot' && (
                  <button onClick={() => copyAnswer(m.text, i)} data-testid="chat-copy"
                    title={t('chat.copy')} className="mt-1 flex items-center gap-1 text-[10px] text-atlas-mute hover:text-atlas-soft transition-colors">
                    <Icon name={copiedIdx === i ? 'checkmark' : 'doc'} size={11} /> {copiedIdx === i ? t('chat.copied') : t('chat.copy')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </main>

        <div data-tour="chat-input" className="flex-shrink-0 border-t border-atlas-line p-4 flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); send(); } }}
            placeholder={t('chat.inputPlaceholder')}
            className="flex-1 px-3.5 py-2.5 text-sm bg-white/5 border border-atlas-line text-atlas-text placeholder-atlas-mute outline-none focus:border-[#5cae8e]"
            data-testid="chat-input"
            autoFocus
          />
          <button onClick={send} disabled={busy} className="px-4 py-2.5 text-sm font-black flex items-center gap-1.5" style={{ backgroundColor: ACCENT, color: '#15171b', opacity: busy ? 0.6 : 1 }} data-testid="chat-send">
            <Icon name="search" size={14} /> {busy ? t('chat.thinking') : t('chat.send')}
          </button>
        </div>
      </div>
    </div>
  );
}
