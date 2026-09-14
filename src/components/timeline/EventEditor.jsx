import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoreStore }     from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { useThreadStore }   from '../../stores/useThreadStore';
import { useVolumeStore }   from '../../stores/useVolumeStore';
import { BEATS }            from '../../data/beats_config';
import { OUTCOMES }         from '../../data/outcome_config';
import { Field, Input, Textarea } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';
import Icon from '../ui/Icon';
import Term from '../ui/Term';
import { VIZ_STATUS } from '../../data/viz_palette';

const ACCENT = '#5cae8e';

// ── Sélecteur multi-entités ────────────────────────────────────────────────────

function EntitySelector({ label, items, selected, onToggle, getColor, getName, getId }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? items.filter(i => getName(i).toLowerCase().includes(q)) : items;
  }, [items, search, getName]);

  return (
    <Field label={`${label} (${selected.length})`}>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selected.map(item => {
            const color = getColor(item);
            return (
              <span
                key={getId(item)}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
                style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}50` }}
                onClick={() => onToggle(item)}
                title={t('eventEditor.remove')}
              >
                {getName(item).split(' ')[0]} <Icon name="close" size={12} style={{ opacity: 0.5 }} />
              </span>
            );
          })}
        </div>
      )}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('search.placeholder')}
        className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600 mb-1.5"
      />
      <div className="space-y-0.5 max-h-36 overflow-y-auto">
        {filtered.map(item => {
          const isSelected = selected.some(s => getId(s) === getId(item));
          const color      = getColor(item);
          return (
            <button
              key={getId(item)}
              onClick={() => onToggle(item)}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100"
              style={{
                backgroundColor: isSelected ? `${color}15` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? color + '40' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: isSelected ? color : '#334155' }} />
              <span className="text-xs flex-1 truncate" style={{ color: isSelected ? '#e2e8f0' : 'var(--color-atlas-soft)' }}>{getName(item)}</span>
              {isSelected && <Icon name="check" size={13} style={{ color }} />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-atlas-mute text-center py-2 italic">{t('empty.noSearch')}</p>
        )}
      </div>
    </Field>
  );
}

// ── Sélecteur lieu unique ──────────────────────────────────────────────────────

function LocationSelector({ locations, locationId, onChange }) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return q ? locations.filter(l => l.name.toLowerCase().includes(q)) : locations;
  }, [locations, search]);

  const selected = locations.find(l => l.id === locationId);

  return (
    <Field label={t('eventEditor.locationLabel')}>
      {selected && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
            style={{ backgroundColor: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
            onClick={() => onChange(null)}
            title={t('eventEditor.remove')}
          >
            <Icon name="location" size={12} /> {selected.name} <Icon name="close" size={12} style={{ opacity: 0.5 }} />
          </span>
        </div>
      )}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder={t('eventEditor.searchLocation')}
        className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600 mb-1.5"
      />
      <div className="space-y-0.5 max-h-36 overflow-y-auto">
        {filtered.map(loc => {
          const isSelected = locationId === loc.id;
          return (
            <button
              key={loc.id}
              onClick={() => { onChange(isSelected ? null : loc.id); setSearch(''); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100"
              style={{
                backgroundColor: isSelected ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isSelected ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.05)'}`,
              }}
            >
              <span className="text-xs flex-1 truncate inline-flex items-center gap-1" style={{ color: isSelected ? '#e2e8f0' : 'var(--color-atlas-soft)' }}><Icon name="location" size={12} /> {loc.name}</span>
              {isSelected && <Icon name="check" size={13} style={{ color: '#60a5fa' }} />}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-atlas-mute text-center py-2 italic">{t('empty.noSearch')}</p>
        )}
      </div>
    </Field>
  );
}

// ── initData ───────────────────────────────────────────────────────────────────

function initData(event, chapters, defaultBeatId) {
  if (event) {
    return {
      chapter:        event.chapter,
      chapterTitle:   event.chapterTitle ?? '',
      title:          event.title ?? '',
      description:    event.description ?? '',
      locationId:     event.locationId ?? null,
      beatId:         event.beatId ?? null,
      povCharacterId: event.povCharacterId ?? null,
      sceneOrder:     event.sceneOrder ?? 0,
      sceneGoal:      event.sceneGoal     ?? '',
      sceneConflict:  event.sceneConflict ?? '',
      sceneOutcome:   event.sceneOutcome  ?? null,
      characters:      (event.entities ?? []).filter(e => e.entityType === 'character'),
      objects:         (event.entities ?? []).filter(e => e.entityType === 'object'),
      threadIds:       event.threadIds ?? [],
      isFlashback:     event.isFlashback ?? false,
      storyChapterRef: event.storyChapterRef ?? null,
    };
  }
  const maxChapter = chapters.length > 0 ? Math.max(...chapters.map(c => c.number)) : 0;
  return {
    chapter:        maxChapter + 1,
    chapterTitle:   '',
    title:          '',
    description:    '',
    locationId:     null,
    beatId:         defaultBeatId ?? null,
    povCharacterId: null,
    sceneOrder:     0,
    sceneGoal:      '',
    sceneConflict:  '',
    sceneOutcome:   null,
    characters:      [],
    objects:         [],
    threadIds:       [],
    isFlashback:     false,
    storyChapterRef: null,
  };
}

// ── EventEditor ────────────────────────────────────────────────────────────────

export default function EventEditor({ event, chapters, onClose, defaultBeatId }) {
  const { t } = useTranslation();
  const isEdit = !!event;

  const saving      = useTimelineStore(s => s.saving);
  const saveEvent   = useTimelineStore(s => s.save);
  const removeEvent = useTimelineStore(s => s.remove);

  const allCharacters = useLoreStore(s => s.characters);
  const allLocations  = useLoreStore(s => s.locations);
  const allObjects    = useLoreStore(s => s.objects);
  const allThreads    = useThreadStore(s => s.threads) ?? [];

  const [data,          setData]          = useState(() => initData(event, chapters, defaultBeatId));
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setData(initData(event, chapters));
    setConfirmDelete(false);
  }, [event?.id]); // eslint-disable-line

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  // Suggestion de chapterTitle à partir des chapitres existants
  const chapterTitleSuggestion = useMemo(() => {
    const match = chapters.find(c => c.number === Number(data.chapter));
    return match?.title ?? '';
  }, [chapters, data.chapter]);

  // Auto-fill chapterTitle depuis les chapitres existants
  const handleChapterNumChange = (val) => {
    const num   = parseInt(val, 10);
    const match = chapters.find(c => c.number === num);
    set('chapter', isNaN(num) ? '' : num);
    if (match) set('chapterTitle', match.title);
  };

  // Sélecteurs entités
  const toggleCharacter = (char) => {
    const exists = data.characters.some(c => c.id === char.id);
    set('characters', exists
      ? data.characters.filter(c => c.id !== char.id)
      : [...data.characters, { id: char.id, entityType: 'character' }]
    );
  };

  const toggleObject = (obj) => {
    const exists = data.objects.some(o => o.id === obj.id);
    set('objects', exists
      ? data.objects.filter(o => o.id !== obj.id)
      : [...data.objects, { id: obj.id, entityType: 'object' }]
    );
  };

  // Merge entities pour la sauvegarde
  const buildEntities = () => [
    ...data.characters,
    ...data.objects,
    ...(data.locationId ? [{ id: data.locationId, entityType: 'location' }] : []),
  ];

  const handleSave = async () => {
    if (!data.title?.trim() || !data.chapter) return;
    await saveEvent(isEdit ? event.id : null, {
      chapter:        Number(data.chapter),
      chapterTitle:   data.chapterTitle.trim(),
      title:          data.title.trim(),
      description:    data.description ?? '',
      locationId:     data.locationId ?? null,
      beatId:         data.beatId ?? null,
      povCharacterId: data.povCharacterId ?? null,
      sceneOrder:     data.sceneOrder ? Number(data.sceneOrder) : 0,
      sceneGoal:      data.sceneGoal?.trim()     || null,
      sceneConflict:  data.sceneConflict?.trim() || null,
      sceneOutcome:   data.sceneOutcome ?? null,
      entities:        buildEntities(),
      threadIds:       data.threadIds ?? [],
      volumeId:        isEdit ? (event.volumeId ?? null) : (useVolumeStore.getState().activeVolumeId ?? null),
      isFlashback:     data.isFlashback ?? false,
      storyChapterRef: data.isFlashback ? (data.storyChapterRef ?? null) : null,
    });
    onClose();
  };

  const handleDelete = async () => {
    await removeEvent(event.id);
    onClose();
  };

  const canSave = data.title?.trim().length > 0 && !!data.chapter && !saving;

  // Helpers pour EntitySelector
  const getCharColor  = (c) => {
    const full = allCharacters.find(x => x.id === c.id);
    return full?.color ?? '#94a3b8';
  };
  const getCharName   = (c) => allCharacters.find(x => x.id === c.id)?.name ?? c.id;
  const getObjColor   = () => '#a78bfa';
  const getObjName    = (o) => allObjects.find(x => x.id === o.id)?.name ?? o.id;

  return (
    <SidePanel width={440} onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="font-grotesk text-[10px] uppercase tracking-[0.16em]" style={{ color: '#cba15e' }}>
              {isEdit ? t('eventEditor.editEvent') : t('eventEditor.newEvent')}
            </p>
            <h2 className="font-serif text-xl font-semibold text-white mt-1">
              Timeline <span className="italic" style={{ color: ACCENT }}>narrative</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-atlas-soft hover:text-white hover:bg-white/10 transition-all text-sm"
          ><Icon name="close" size={12} /></button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* Chapitre + Ordre */}
          <div className="flex gap-3">
            <div style={{ width: 90 }}>
              <Field label={`${t('label.chapters')} *`}>
                <Input
                  type="number"
                  min="1"
                  value={data.chapter}
                  onChange={e => handleChapterNumChange(e.target.value)}
                  placeholder="1"
                />
              </Field>
            </div>
            <div className="flex-1">
              <Field label={t('eventEditor.chapterTitle')}>
                <Input
                  value={data.chapterTitle}
                  onChange={e => set('chapterTitle', e.target.value)}
                  placeholder={chapterTitleSuggestion || t('eventEditor.chapterTitlePlaceholder')}
                />
              </Field>
            </div>
            <div style={{ width: 72 }}>
              <Field label={t('eventEditor.order')}>
                <Input
                  type="number"
                  min="1"
                  value={data.sceneOrder || ''}
                  onChange={e => set('sceneOrder', e.target.value === '' ? 0 : parseInt(e.target.value, 10))}
                  placeholder="—"
                />
              </Field>
            </div>
          </div>

          {/* Titre événement */}
          <Field label={`${t('eventEditor.eventTitle')} *`}>
            <Input
              value={data.title}
              onChange={e => set('title', e.target.value)}
              placeholder={t('eventEditor.eventTitlePlaceholder')}
              autoFocus
            />
          </Field>

          {/* Description */}
          <Field label={t('label.description')}>
            <Textarea
              rows={4}
              value={data.description}
              onChange={e => set('description', e.target.value)}
              placeholder={t('eventEditor.descriptionPlaceholder')}
            />
          </Field>

          {/* ── Anatomie de scène ── */}
          <div className="rounded-none p-4 space-y-4" style={{ backgroundColor: 'rgba(92,174,142,0.06)', border: '1px solid rgba(92,174,142,0.18)' }}>
            <p className="font-grotesk text-[10px] uppercase tracking-widest font-bold" style={{ color: ACCENT }}>{t('eventEditor.sceneAnatomy')}</p>

            <Field label={t('eventEditor.sceneGoal')}>
              <Textarea
                rows={2}
                value={data.sceneGoal}
                onChange={e => set('sceneGoal', e.target.value)}
                placeholder={t('eventEditor.sceneGoalPlaceholder')}
              />
            </Field>

            <Field label={t('eventEditor.sceneConflict')}>
              <Textarea
                rows={2}
                value={data.sceneConflict}
                onChange={e => set('sceneConflict', e.target.value)}
                placeholder={t('eventEditor.sceneConflictPlaceholder')}
              />
            </Field>

            <Field label={t('eventEditor.sceneOutcome')}>
              <div className="flex flex-wrap gap-1.5">
                {OUTCOMES.map(o => {
                  const active = data.sceneOutcome === o.id;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      onClick={() => set('sceneOutcome', active ? null : o.id)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                      style={{
                        backgroundColor: active ? `${o.color}20` : 'rgba(255,255,255,0.04)',
                        color:           active ? o.color : 'var(--color-atlas-mute)',
                        border:          `1px solid ${active ? `${o.color}50` : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span><Icon name={o.icon} size={13} /></span> {t(`outcome.${o.id}`, o.label)}
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>

          {/* Lieu */}
          <LocationSelector
            locations={allLocations}
            locationId={data.locationId}
            onChange={v => set('locationId', v)}
          />

          {/* POV */}
          <Field label={<Term id="pov">{t('eventEditor.pov')}</Term>}>
            {data.povCharacterId && (() => {
              const pov = allCharacters.find(c => c.id === data.povCharacterId);
              return pov ? (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: `${pov.color}20`, color: pov.color, border: `1px solid ${pov.color}50` }}
                    onClick={() => set('povCharacterId', null)}
                    title={t('eventEditor.removePov')}
                  >
                    <Icon name="pov" size={12} /> {pov.name.split(' ')[0]} <Icon name="close" size={12} style={{ opacity: 0.5 }} />
                  </span>
                </div>
              ) : null;
            })()}
            <select
              value={data.povCharacterId ?? ''}
              onChange={e => set('povCharacterId', e.target.value === '' ? null : e.target.value)}
              className="w-full px-3 py-2 rounded-none text-sm text-white border border-atlas-line outline-none"
              style={{ backgroundColor: 'var(--color-atlas-ink)' }}
              onFocus={e => { e.currentTarget.style.borderColor = `${ACCENT}80`; }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'var(--color-atlas-line)'; }}
            >
              <option value="">— {t('eventEditor.noPov')} —</option>
              {allCharacters.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          {/* Personnages */}
          <EntitySelector
            label={t('eventEditor.presentCharacters')}
            items={allCharacters}
            selected={data.characters}
            onToggle={toggleCharacter}
            getColor={getCharColor}
            getName={getCharName}
            getId={c => c.id}
          />

          {/* Beat STC */}
          <Field label={<Term id="beat">{t('eventEditor.beatStc')}</Term>}>
            {data.beatId && (() => {
              const beat = BEATS.find(b => b.id === data.beatId);
              return beat ? (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-xs cursor-pointer"
                    style={{ backgroundColor: `${beat.color}20`, color: beat.color, border: `1px solid ${beat.color}50` }}
                    onClick={() => set('beatId', null)}
                    title={t('eventEditor.remove')}
                  >
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: beat.color }} />
                    {t(`narrative:beats.${beat.id}.label`, beat.label)}
                    <Icon name="close" size={12} style={{ opacity: 0.5 }} />
                  </span>
                </div>
              ) : null;
            })()}
            <select
              value={data.beatId ?? ''}
              onChange={e => set('beatId', e.target.value === '' ? null : e.target.value)}
              className="w-full px-3 py-2 rounded-none text-sm text-white border border-atlas-line outline-none"
              style={{ backgroundColor: 'var(--color-atlas-ink)' }}
              onFocus={e => { e.currentTarget.style.borderColor = `${ACCENT}80`; }}
              onBlur={e  => { e.currentTarget.style.borderColor = 'var(--color-atlas-line)'; }}
            >
              <option value="">— {t('eventEditor.noBeat')} —</option>
              {BEATS.map(beat => (
                <option key={beat.id} value={beat.id}>
                  {t(`narrative:beats.${beat.id}.label`, beat.label)} ({beat.idealPercent}%)
                </option>
              ))}
            </select>
          </Field>

          {/* Objets */}
          <EntitySelector
            label={t('eventEditor.presentObjects')}
            items={allObjects}
            selected={data.objects}
            onToggle={toggleObject}
            getColor={getObjColor}
            getName={getObjName}
            getId={o => o.id}
          />

          {/* ── Flashback ── */}
          <div
            className="rounded-none p-4 space-y-3"
            style={{
              backgroundColor: data.isFlashback ? 'rgba(217,119,6,0.06)' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${data.isFlashback ? 'rgba(217,119,6,0.25)' : 'rgba(255,255,255,0.07)'}`,
              transition: 'all 0.2s',
            }}
          >
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <span
                className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  backgroundColor: data.isFlashback ? 'rgba(217,119,6,0.8)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${data.isFlashback ? 'rgba(217,119,6,0.9)' : 'rgba(255,255,255,0.15)'}`,
                }}
              >
                {data.isFlashback && <Icon name="check" size={11} className="text-white" />}
              </span>
              <input
                type="checkbox"
                className="sr-only"
                checked={data.isFlashback}
                onChange={e => set('isFlashback', e.target.checked)}
              />
              <div>
                <p className="text-xs font-bold flex items-center gap-1" style={{ color: data.isFlashback ? '#fbbf24' : 'var(--color-atlas-soft)' }}>
                  <Icon name="memory" size={13} /> {t('eventEditor.flashback')}
                </p>
                <p className="text-[10px] text-atlas-mute font-serif italic">
                  {t('eventEditor.flashbackHint')}
                </p>
              </div>
            </label>

            {data.isFlashback && (
              <div style={{ width: 140 }}>
                <Field label={t('eventEditor.diegeticPosition')}>
                  <Input
                    type="number"
                    value={data.storyChapterRef ?? ''}
                    onChange={e => set('storyChapterRef', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                    placeholder="ex : -5, 1, 3…"
                  />
                </Field>
                <p className="text-[9px] text-atlas-mute mt-1 font-serif italic">
                  {t('eventEditor.diegeticHint')}
                </p>
              </div>
            )}
          </div>

          {/* Fils narratifs */}
          {allThreads.length > 0 && (
            <Field label={`${t('label.threads')} (${data.threadIds.length})`}>
              <div className="flex flex-wrap gap-1.5">
                {allThreads.map(thread => {
                  const active = data.threadIds.includes(thread.id);
                  return (
                    <button
                      key={thread.id}
                      type="button"
                      onClick={() => {
                        const next = active
                          ? data.threadIds.filter(id => id !== thread.id)
                          : [...data.threadIds, thread.id];
                        set('threadIds', next);
                      }}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                      style={{
                        backgroundColor: active ? `${thread.color}20` : 'rgba(255,255,255,0.04)',
                        color:           active ? thread.color : 'var(--color-atlas-mute)',
                        border:          `1px solid ${active ? `${thread.color}50` : 'rgba(255,255,255,0.08)'}`,
                      }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: active ? thread.color : '#334155' }} />
                      {thread.name}
                      {active && <Icon name="check" size={12} style={{ opacity: 0.6 }} />}
                    </button>
                  );
                })}
              </div>
            </Field>
          )}

        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 p-4 space-y-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-2.5 rounded-lg text-sm font-black transition-all duration-200"
            style={{
              backgroundColor: canSave ? ACCENT : `${ACCENT}25`,
              color:           canSave ? '#15171b'  : `${ACCENT}60`,
              cursor:          canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? t('btn.saving') : isEdit ? t('btn.save') : t('eventEditor.createEvent')}
          </button>

          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2 rounded-lg text-xs font-bold text-atlas-mute hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {t('eventEditor.deleteEvent')}
            </button>
          )}

          {isEdit && confirmDelete && (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-atlas-soft border border-white/08 hover:bg-white/05 transition-all"
              >
                {t('btn.cancel')}
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg text-xs font-black transition-all duration-150"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: VIZ_STATUS.crit, border: '1px solid rgba(239,68,68,0.35)' }}
              >
                {t('btn.confirm')}
              </button>
            </div>
          )}
        </div>
    </SidePanel>
  );
}
