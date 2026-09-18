import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoreStore } from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { restoreCharacter, restoreLocation, restoreObject } from '../../api/client';
import { useUndoableDelete } from '../../hooks/useUndoableDelete';
import { Field, Input, Textarea } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';
import Icon from '../ui/Icon';

// ── Config par type ────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  character: { labelKey: 'label.characters', accent: '#5cae8e', saveAction: 'saveCharacter', removeAction: 'removeCharacter' },
  location:  { labelKey: 'label.locations',  accent: '#5cae8e', saveAction: 'saveLocation',  removeAction: 'removeLocation'  },
  object:    { labelKey: 'label.objects',    accent: '#5cae8e', saveAction: 'saveObject',    removeAction: 'removeObject'    },
};

const PRESET_COLORS = [
  '#818cf8', '#60a5fa', '#34d399', '#f59e0b', '#ef4444',
  '#a78bfa', '#fb923c', '#e879f9', '#2dd4bf', '#94a3b8',
];

// ── Saisie de tags (Enter / virgule pour ajouter) ──────────────────────────────
function TagInput({ value, onChange, placeholder, testId }) {
  const [input, setInput] = useState('');

  const add = () => {
    const tag = input.trim().replace(/,$/, '');
    if (!tag || value.includes(tag)) { setInput(''); return; }
    onChange([...value, tag]);
    setInput('');
  };

  return (
    <div
      className="rounded-lg p-2 flex flex-wrap gap-1.5 min-h-[38px]"
      style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      {value.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
          style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {tag}
          <button
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="hover:text-white ml-0.5 transition-colors"
            style={{ color: 'var(--color-atlas-soft)' }}
          ><Icon name="close" size={12} /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600 min-w-24 flex-1"
        {...(testId ? { 'data-testid': testId } : {})}
      />
    </div>
  );
}

// ── Champs custom (couche 2 : bag clé/valeur libre) ────────────────────────────
function CustomFields({ data, set, accent, t }) {
  const fields = data.customFields ?? {};
  const entries = Object.entries(fields);
  const [newKey, setNewKey] = useState('');
  const [newVal, setNewVal] = useState('');

  const setValue = (key, value) => set('customFields', { ...fields, [key]: value });
  const removeKey = (key) => {
    const next = { ...fields };
    delete next[key];
    set('customFields', next);
  };
  const addField = () => {
    const key = newKey.trim();
    if (!key || Object.prototype.hasOwnProperty.call(fields, key)) { setNewKey(''); setNewVal(''); return; }
    set('customFields', { ...fields, [key]: newVal.trim() });
    setNewKey('');
    setNewVal('');
  };

  // Une valeur importée peut être un tableau/objet : on l'affiche lisiblement en lecture-écriture texte.
  const displayVal = (v) => Array.isArray(v) ? v.join(', ') : (v && typeof v === 'object' ? JSON.stringify(v) : (v ?? ''));

  return (
    <Field label={t('label.customFields')}>
      <div className="space-y-1.5">
        {entries.length === 0 && (
          <p className="text-[11px] text-atlas-mute italic">{t('customFields.empty')}</p>
        )}
        {entries.map(([key, val]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span
              className="px-2 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 max-w-[38%] truncate"
              style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}
              title={key}
            >{key}</span>
            <input
              value={displayVal(val)}
              onChange={e => setValue(key, e.target.value)}
              className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none"
              data-testid={`custom-value-${key}`}
            />
            <button
              onClick={() => removeKey(key)}
              className="w-6 h-6 flex items-center justify-center rounded-lg text-atlas-mute hover:text-red-400 transition-colors flex-shrink-0"
              title={t('btn.delete')}
            ><Icon name="close" size={12} /></button>
          </div>
        ))}
        <div className="flex items-center gap-1.5 pt-1">
          <input
            value={newKey}
            onChange={e => setNewKey(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }}
            placeholder={t('customFields.keyPlaceholder')}
            className="w-[38%] px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600"
            data-testid="custom-new-key"
          />
          <input
            value={newVal}
            onChange={e => setNewVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addField(); } }}
            placeholder={t('customFields.valuePlaceholder')}
            className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600"
            data-testid="custom-new-value"
          />
          <button
            onClick={addField}
            className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors flex-shrink-0"
            style={{ backgroundColor: `${accent}20`, color: accent, border: `1px solid ${accent}45` }}
            data-testid="custom-add"
          >{t('customFields.add')}</button>
        </div>
      </div>
    </Field>
  );
}

// ── Champs spécifiques au type ─────────────────────────────────────────────────
function CharacterFields({ data, set, accent, t }) {
  const events = useTimelineStore(s => s.events) ?? [];
  const groups = useLoreStore(s => s.groups) ?? [];

  return (
    <>
      <Field label={t('label.color')}>
        <div className="flex flex-wrap gap-1.5 mt-1">
          {PRESET_COLORS.map(c => (
            <button
              key={c}
              onClick={() => set('color', c)}
              className="w-5 h-5 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: data.color === c ? `2px solid white` : 'none',
                outlineOffset: 1,
              }}
            />
          ))}
        </div>
      </Field>

      <Field label={t('label.origin')}>
        <Input accent={accent} value={data.origin ?? ''} onChange={e => set('origin', e.target.value)} />
      </Field>

      <Field label={t('label.aliases')}>
        <TagInput
          value={data.aliases ?? []}
          onChange={v => set('aliases', v)}
          accent={accent}
          testId="tag-aliases"
        />
      </Field>

      <Field label={t('label.affiliations')}>
        <TagInput value={data.affiliations ?? []} onChange={v => set('affiliations', v)} testId="tag-affiliations" />
      </Field>

      <Field label={t('label.traits')}>
        <TagInput value={data.traits ?? []} onChange={v => set('traits', v)} testId="tag-traits" />
      </Field>

      <Field label={t('label.description')}>
        <Textarea accent={accent} value={data.description ?? ''} onChange={e => set('description', e.target.value)} />
      </Field>

      {groups.length > 0 && (
        <Field label={t('label.groups')}>
          <div className="flex flex-wrap gap-1.5">
            {groups.map(g => {
              const active = (data.groupIds ?? []).includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    const current = data.groupIds ?? [];
                    set('groupIds', active
                      ? current.filter(id => id !== g.id)
                      : [...current, g.id]
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all duration-150"
                  style={{
                    backgroundColor: active ? `${g.color}20` : 'rgba(255,255,255,0.04)',
                    color:           active ? g.color : 'var(--color-atlas-mute)',
                    border:          `1px solid ${active ? `${g.color}50` : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: active ? g.color : '#334155' }} />
                  {g.name}
                  <span className="text-[10px] opacity-50">{g.type}</span>
                  {active && <Icon name="checkmark" size={12} style={{ opacity: 0.6 }} />}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <Field label={t('entity.deathEvent')}>
        <select
          value={data.deathEventId ?? ''}
          onChange={e => set('deathEventId', e.target.value === '' ? null : e.target.value)}
          className="w-full px-3 py-2 rounded-none text-sm text-white border border-atlas-line outline-none"
          style={{ backgroundColor: 'var(--color-atlas-ink)' }}
          onFocus={e => { e.currentTarget.style.borderColor = `${accent}80`; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-atlas-line)'; }}
        >
          <option value="">— {t('entity.alive')} —</option>
          {events.map(evt => (
            <option key={evt.id} value={evt.id}>
              Ch.{evt.chapter} — {evt.title}
            </option>
          ))}
        </select>
      </Field>
    </>
  );
}

function LocationFields({ data, set, accent, t }) {
  const characters  = useLoreStore(s => s.characters);
  const [charSearch, setCharSearch] = useState('');

  const filteredChars = useMemo(() => {
    const q = charSearch.toLowerCase();
    return q ? characters.filter(c => c.name.toLowerCase().includes(q)) : characters;
  }, [characters, charSearch]);

  const toggleVisitedBy = (char) => {
    const current = data.visitedBy ?? [];
    const exists  = current.some(c => c.id === char.id);
    set('visitedBy', exists
      ? current.filter(c => c.id !== char.id)
      : [...current, { id: char.id, name: char.name, color: char.color }]
    );
  };

  return (
    <>
      <div className="flex gap-3">
        <div className="flex-1">
          <Field label={t('label.type')}>
            <Input accent={accent} value={data.type ?? ''} onChange={e => set('type', e.target.value)} />
          </Field>
        </div>
        <div className="flex-1">
          <Field label={t('label.regime')}>
            <Input accent={accent} value={data.regime ?? ''} onChange={e => set('regime', e.target.value)} />
          </Field>
        </div>
      </div>

      <Field label={t('label.description')}>
        <Textarea accent={accent} value={data.description ?? ''} onChange={e => set('description', e.target.value)} />
      </Field>

      <Field label={t('label.inhabitants')}>
        <TagInput value={data.inhabitants ?? []} onChange={v => set('inhabitants', v)} accent={accent} />
      </Field>

      <Field label={t('label.keyPlaces')}>
        <TagInput value={data.keyPlaces ?? []} onChange={v => set('keyPlaces', v)} accent={accent} />
      </Field>

      <Field label={`${t('entity.visitedBy')} (${(data.visitedBy ?? []).length})`}>
        {/* Chips sélectionnés */}
        {(data.visitedBy ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(data.visitedBy ?? []).map(c => (
              <span
                key={c.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
                style={{ backgroundColor: `${c.color}20`, color: c.color, border: `1px solid ${c.color}50` }}
                onClick={() => toggleVisitedBy(c)}
                title={t('eventEditor.remove')}
              >
                {c.name.split(' ')[0]} <Icon name="close" size={12} style={{ opacity: 0.5 }} />
              </span>
            ))}
          </div>
        )}
        <input
          value={charSearch}
          onChange={e => setCharSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600 mb-1.5"
        />
        <div className="space-y-0.5 max-h-40 overflow-y-auto">
          {filteredChars.map(c => {
            const selected = (data.visitedBy ?? []).some(v => v.id === c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleVisitedBy(c)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100"
                style={{
                  backgroundColor: selected ? `${c.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? c.color + '40' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selected ? c.color : '#334155' }} />
                <span className="text-xs flex-1 truncate" style={{ color: selected ? '#e2e8f0' : 'var(--color-atlas-soft)' }}>{c.name}</span>
                {selected && <Icon name="checkmark" size={12} style={{ color: c.color }} />}
              </button>
            );
          })}
        </div>
      </Field>
    </>
  );
}

function ObjectFields({ data, set, accent, t }) {
  const characters   = useLoreStore(s => s.characters);
  const [charSearch, setCharSearch] = useState('');

  const filteredChars = useMemo(() => {
    const q = charSearch.toLowerCase();
    return q ? characters.filter(c => c.name.toLowerCase().includes(q)) : characters;
  }, [characters, charSearch]);

  const selectHolder = (char) => {
    const alreadySelected = data.currentHolder === char.name;
    set('currentHolder', alreadySelected ? '' : char.name);
    setCharSearch('');
  };

  return (
    <>
      <Field label={t('label.type')}>
        <Input accent={accent} value={data.type ?? ''} onChange={e => set('type', e.target.value)} />
      </Field>
      <Field label={t('label.creator')}>
        <Input accent={accent} value={data.creator ?? ''} onChange={e => set('creator', e.target.value)} />
      </Field>

      <Field label={t('label.powers')}>
        <TagInput value={data.powers ?? []} onChange={v => set('powers', v)} />
      </Field>

      <Field label={t('label.holder')}>
        {/* Chip du personnage sélectionné */}
        {data.currentHolder && (() => {
          const char = characters.find(c => c.name === data.currentHolder);
          const color = char?.color ?? '#94a3b8';
          return (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
                style={{ backgroundColor: `${color}20`, color, border: `1px solid ${color}50` }}
                onClick={() => set('currentHolder', '')}
                title={t('eventEditor.remove')}
              >
                {data.currentHolder.split(' ')[0]} <Icon name="close" size={12} style={{ opacity: 0.5 }} />
              </span>
            </div>
          );
        })()}
        <input
          value={charSearch}
          onChange={e => setCharSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600 mb-1.5"
        />
        <div className="space-y-0.5 max-h-40 overflow-y-auto">
          {filteredChars.map(c => {
            const selected = data.currentHolder === c.name;
            return (
              <button
                key={c.id}
                onClick={() => selectHolder(c)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100"
                style={{
                  backgroundColor: selected ? `${c.color}15` : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${selected ? c.color + '40' : 'rgba(255,255,255,0.05)'}`,
                }}
              >
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: selected ? c.color : '#334155' }} />
                <span className="text-xs flex-1 truncate" style={{ color: selected ? '#e2e8f0' : 'var(--color-atlas-soft)' }}>{c.name}</span>
                {selected && <Icon name="checkmark" size={12} style={{ color: c.color }} />}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t('label.description')}>
        <Textarea accent={accent} value={data.description ?? ''} onChange={e => set('description', e.target.value)} />
      </Field>

      <Field label={t('label.status')}>
        <select
          value={data.status ?? 'active'}
          onChange={e => set('status', e.target.value)}
          className="w-full px-3 py-2 rounded-none text-sm text-white border border-atlas-line outline-none"
          style={{ backgroundColor: 'var(--color-atlas-ink)' }}
          onFocus={e => { e.currentTarget.style.borderColor = `${accent}80`; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-atlas-line)'; }}
        >
          <option value="active">{t('entity.active')}</option>
          <option value="lost">{t('entity.lost')}</option>
          <option value="destroyed">{t('entity.destroyed')}</option>
        </select>
      </Field>

      {(data.status === 'lost' || data.status === 'destroyed') && (
        <Field label={t('entity.sinceChapter')}>
          <Input
            accent={accent}
            type="number"
            min="1"
            value={data.statusChangedAtChapter ?? ''}
            onChange={e => set('statusChangedAtChapter', e.target.value === '' ? null : parseInt(e.target.value, 10))}
            placeholder="N° du chapitre"
          />
        </Field>
      )}
    </>
  );
}

// ── Données initiales selon le type ───────────────────────────────────────────
function initData(entityType, entity, groups = []) {
  if (entity) {
    const base = { ...entity, customFields: entity.customFields ?? {} };
    if (entityType === 'character') {
      base.groupIds = groups.filter(g => g.members.some(m => m.characterId === entity.id)).map(g => g.id);
    }
    return base;
  }
  if (entityType === 'character') return { name: '', color: '#818cf8', origin: '', aliases: [], affiliations: [], traits: [], description: '', deathEventId: null, groupIds: [], customFields: {} };
  if (entityType === 'location')  return { name: '', type: '', regime: '', description: '', inhabitants: [], visitedBy: [], keyPlaces: [], customFields: {} };
  return { name: '', type: '', creator: '', powers: [], currentHolder: '', description: '', status: 'active', statusChangedAtChapter: null, customFields: {} };
}

// ── EntityEditor ───────────────────────────────────────────────────────────────
export default function EntityEditor({ entity, entityType, onClose }) {
  const { t } = useTranslation();
  const cfg    = TYPE_CONFIG[entityType];
  const label  = t(cfg.labelKey);
  const isEdit = !!entity;

  const saving        = useLoreStore(s => s.saving);
  const saveCharacter = useLoreStore(s => s.saveCharacter);
  const saveLocation  = useLoreStore(s => s.saveLocation);
  const saveObject    = useLoreStore(s => s.saveObject);
  const removeCharacter = useLoreStore(s => s.removeCharacter);
  const removeLocation  = useLoreStore(s => s.removeLocation);
  const removeObject    = useLoreStore(s => s.removeObject);
  const groups          = useLoreStore(s => s.groups) ?? [];

  const saveAction    = entityType === 'character' ? saveCharacter : entityType === 'location' ? saveLocation : saveObject;
  const removeAction  = entityType === 'character' ? removeCharacter : entityType === 'location' ? removeLocation : removeObject;
  const restoreAction = entityType === 'character' ? restoreCharacter : entityType === 'location' ? restoreLocation : restoreObject;
  const _reload       = useLoreStore(s => s._reload);
  const undoableDelete = useUndoableDelete();

  const [data,          setData]          = useState(() => initData(entityType, entity, groups));
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    setData(initData(entityType, entity, groups));
    setConfirmDelete(false);
  }, [entity?.id, entityType]); // eslint-disable-line

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!data.name?.trim()) return;
    await saveAction(isEdit ? entity.id : null, { ...data, name: data.name.trim() });
    onClose();
  };

  const _projectId = useLoreStore(s => s._projectId);
  const handleDelete = async () => {
    await undoableDelete({
      deleteFn:  () => removeAction(entity.id),
      restoreFn: (snapshot) => restoreAction(snapshot, _projectId),
      reloadFn:  _reload,
      label:     t('toast.deleted', { type: label, name: entity.name }),
    });
    onClose();
  };

  const canSave = data.name?.trim().length > 0 && !saving;

  return (
    <SidePanel onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-atlas-line flex-shrink-0">
          <div>
            <p className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.2em]">
              {isEdit ? `${label} — ${t('btn.save').toLowerCase()}` : `${label} — ${t('btn.create').toLowerCase()}`}
            </p>
            <h2 className="font-serif text-base font-semibold text-white mt-0.5">
              Lore <span style={{ color: cfg.accent }}>Browser</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-none text-atlas-soft hover:text-white hover:bg-white/10 transition-all text-sm"
          ><Icon name="close" size={12} /></button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Nom (commun à tous les types) */}
          <Field label={`${t('label.name')} *`}>
            <Input
              accent={cfg.accent}
              value={data.name ?? ''}
              onChange={e => set('name', e.target.value)}
              placeholder={`${t('label.name')}…`}
              autoFocus
            />
          </Field>

          {/* Champs spécifiques au type */}
          {entityType === 'character' && <CharacterFields data={data} set={set} accent={cfg.accent} characterId={entity?.id} t={t} />}
          {entityType === 'location'  && <LocationFields  data={data} set={set} accent={cfg.accent} t={t} />}
          {entityType === 'object'    && <ObjectFields    data={data} set={set} accent={cfg.accent} t={t} />}

          {/* Champs custom (couche 2) — communs aux 3 types */}
          <CustomFields data={data} set={set} accent={cfg.accent} t={t} />
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-atlas-line p-4 space-y-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-2.5 rounded-none text-sm font-black transition-all duration-200"
            style={{
              backgroundColor: canSave ? cfg.accent : `${cfg.accent}25`,
              color:           canSave ? '#15171b'  : `${cfg.accent}60`,
              cursor:          canSave ? 'pointer'   : 'not-allowed',
            }}
          >
            {saving ? t('btn.saving') : isEdit ? t('btn.save') : `${t('btn.create')} ${label.toLowerCase()}`}
          </button>

          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              data-testid="delete-entity"
              className="w-full py-2 rounded-lg text-xs font-bold text-atlas-mute hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              {t('btn.delete')} {label.toLowerCase()}
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
                data-testid="confirm-delete"
                className="flex-1 py-2 rounded-lg text-xs font-black transition-all duration-150"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}
              >
                {t('btn.confirm')}
              </button>
            </div>
          )}
        </div>
    </SidePanel>
  );
}
