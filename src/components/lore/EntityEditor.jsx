import { useState, useEffect, useMemo } from 'react';
import { useLoreStore } from '../../stores/useLoreStore';
import { useTimelineStore } from '../../stores/useTimelineStore';
import { Field, Input, Textarea } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';

// ── Config par type ────────────────────────────────────────────────────────────
const TYPE_CONFIG = {
  character: { label: 'Personnage', accent: '#818cf8', saveAction: 'saveCharacter', removeAction: 'removeCharacter' },
  location:  { label: 'Lieu',       accent: '#60a5fa', saveAction: 'saveLocation',  removeAction: 'removeLocation'  },
  object:    { label: 'Objet',      accent: '#a78bfa', saveAction: 'saveObject',    removeAction: 'removeObject'    },
};

const PRESET_COLORS = [
  '#818cf8', '#60a5fa', '#34d399', '#f59e0b', '#ef4444',
  '#a78bfa', '#fb923c', '#e879f9', '#2dd4bf', '#94a3b8',
];

// ── Saisie de tags (Enter / virgule pour ajouter) ──────────────────────────────
function TagInput({ value, onChange, placeholder }) {
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
            style={{ color: '#64748b' }}
          >✕</button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }}
        onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600 min-w-24 flex-1"
      />
    </div>
  );
}

// ── Champs spécifiques au type ─────────────────────────────────────────────────
function CharacterFields({ data, set, accent }) {
  const events = useTimelineStore(s => s.events) ?? [];
  const groups = useLoreStore(s => s.groups) ?? [];

  return (
    <>
      <Field label="Couleur">
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

      <Field label="Origine">
        <Input accent={accent} value={data.origin ?? ''} onChange={e => set('origin', e.target.value)} placeholder="Lieu de naissance ou d'origine…" />
      </Field>

      <Field label="Alias">
        <TagInput
          value={data.aliases ?? []}
          onChange={v => set('aliases', v)}
          placeholder="Entrez un alias puis Entrée…"
          accent={accent}
        />
      </Field>

      <Field label="Description">
        <Textarea accent={accent} value={data.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Présentation du personnage…" />
      </Field>

      {/* Groupes d'appartenance */}
      {groups.length > 0 && (
        <Field label="Groupes d'appartenance">
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
                    color:           active ? g.color : '#475569',
                    border:          `1px solid ${active ? `${g.color}50` : 'rgba(255,255,255,0.08)'}`,
                  }}
                >
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: active ? g.color : '#334155' }} />
                  {g.name}
                  <span className="text-[10px] opacity-50">{g.type}</span>
                  {active && <span style={{ opacity: 0.6 }}>✓</span>}
                </button>
              );
            })}
          </div>
        </Field>
      )}

      <Field label="Décède lors de l'événement">
        <select
          value={data.deathEventId ?? ''}
          onChange={e => set('deathEventId', e.target.value === '' ? null : e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm text-white border border-white/10 outline-none"
          style={{ backgroundColor: '#0d1b2a' }}
          onFocus={e => { e.currentTarget.style.borderColor = `${accent}80`; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <option value="">— Vivant —</option>
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

function LocationFields({ data, set, accent }) {
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
          <Field label="Type">
            <Input accent={accent} value={data.type ?? ''} onChange={e => set('type', e.target.value)} placeholder="Ville, Forêt, Donjon…" />
          </Field>
        </div>
        <div className="flex-1">
          <Field label="Régime">
            <Input accent={accent} value={data.regime ?? ''} onChange={e => set('regime', e.target.value)} placeholder="Royaume, République…" />
          </Field>
        </div>
      </div>

      <Field label="Description">
        <Textarea accent={accent} value={data.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Description du lieu…" />
      </Field>

      <Field label="Habitants (noms)">
        <TagInput value={data.inhabitants ?? []} onChange={v => set('inhabitants', v)} placeholder="Nom d'un habitant… puis Entrée" accent={accent} />
      </Field>

      <Field label="Lieux clés">
        <TagInput value={data.keyPlaces ?? []} onChange={v => set('keyPlaces', v)} placeholder="Grande Salle, Tour nord… puis Entrée" accent={accent} />
      </Field>

      <Field label={`Personnages passés par ici (${(data.visitedBy ?? []).length})`}>
        {/* Chips sélectionnés */}
        {(data.visitedBy ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {(data.visitedBy ?? []).map(c => (
              <span
                key={c.id}
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
                style={{ backgroundColor: `${c.color}20`, color: c.color, border: `1px solid ${c.color}50` }}
                onClick={() => toggleVisitedBy(c)}
                title="Retirer"
              >
                {c.name.split(' ')[0]} <span style={{ opacity: 0.5 }}>✕</span>
              </span>
            ))}
          </div>
        )}
        <input
          value={charSearch}
          onChange={e => setCharSearch(e.target.value)}
          placeholder="Rechercher un personnage…"
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
                <span className="text-xs flex-1 truncate" style={{ color: selected ? '#e2e8f0' : '#64748b' }}>{c.name}</span>
                {selected && <span className="text-[10px]" style={{ color: c.color }}>✓</span>}
              </button>
            );
          })}
        </div>
      </Field>
    </>
  );
}

function ObjectFields({ data, set, accent }) {
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
      <Field label="Type">
        <Input accent={accent} value={data.type ?? ''} onChange={e => set('type', e.target.value)} placeholder="Arme, Artefact, Bijou…" />
      </Field>
      <Field label="Créateur">
        <Input accent={accent} value={data.creator ?? ''} onChange={e => set('creator', e.target.value)} placeholder="Nom du créateur…" />
      </Field>

      <Field label="Détenteur actuel">
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
                title="Retirer"
              >
                {data.currentHolder.split(' ')[0]} <span style={{ opacity: 0.5 }}>✕</span>
              </span>
            </div>
          );
        })()}
        <input
          value={charSearch}
          onChange={e => setCharSearch(e.target.value)}
          placeholder="Rechercher un personnage…"
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
                <span className="text-xs flex-1 truncate" style={{ color: selected ? '#e2e8f0' : '#64748b' }}>{c.name}</span>
                {selected && <span className="text-[10px]" style={{ color: c.color }}>✓</span>}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label="Description">
        <Textarea accent={accent} value={data.description ?? ''} onChange={e => set('description', e.target.value)} placeholder="Description de l'objet…" />
      </Field>

      <Field label="Statut">
        <select
          value={data.status ?? 'active'}
          onChange={e => set('status', e.target.value)}
          className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none"
          style={{ backgroundColor: '#0d1b2a' }}
          onFocus={e => { e.currentTarget.style.borderColor = `${accent}80`; }}
          onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <option value="active">Actif</option>
          <option value="lost">Perdu</option>
          <option value="destroyed">Détruit</option>
        </select>
      </Field>

      {(data.status === 'lost' || data.status === 'destroyed') && (
        <Field label="Depuis le chapitre">
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
    const base = { ...entity };
    if (entityType === 'character') {
      base.groupIds = groups.filter(g => g.members.some(m => m.characterId === entity.id)).map(g => g.id);
    }
    return base;
  }
  if (entityType === 'character') return { name: '', color: '#818cf8', origin: '', aliases: [], description: '', deathEventId: null, groupIds: [] };
  if (entityType === 'location')  return { name: '', type: '', regime: '', description: '', inhabitants: [], visitedBy: [], keyPlaces: [] };
  return { name: '', type: '', creator: '', currentHolder: '', description: '', status: 'active', statusChangedAtChapter: null };
}

// ── EntityEditor ───────────────────────────────────────────────────────────────
export default function EntityEditor({ entity, entityType, onClose }) {
  const cfg    = TYPE_CONFIG[entityType];
  const isEdit = !!entity;

  const saving        = useLoreStore(s => s.saving);
  const saveCharacter = useLoreStore(s => s.saveCharacter);
  const saveLocation  = useLoreStore(s => s.saveLocation);
  const saveObject    = useLoreStore(s => s.saveObject);
  const removeCharacter = useLoreStore(s => s.removeCharacter);
  const removeLocation  = useLoreStore(s => s.removeLocation);
  const removeObject    = useLoreStore(s => s.removeObject);
  const groups          = useLoreStore(s => s.groups) ?? [];

  const saveAction   = entityType === 'character' ? saveCharacter : entityType === 'location' ? saveLocation : saveObject;
  const removeAction = entityType === 'character' ? removeCharacter : entityType === 'location' ? removeLocation : removeObject;

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

  const handleDelete = async () => {
    await removeAction(entity.id);
    onClose();
  };

  const canSave = data.name?.trim().length > 0 && !saving;

  return (
    <SidePanel onClose={onClose}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {isEdit ? `Modifier le ${cfg.label.toLowerCase()}` : `Nouveau ${cfg.label.toLowerCase()}`}
            </p>
            <h2 className="text-sm font-black text-white mt-0.5">
              Lore <span style={{ color: cfg.accent }}>Browser</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-sm"
          >✕</button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Nom (commun à tous les types) */}
          <Field label="Nom *">
            <Input
              accent={cfg.accent}
              value={data.name ?? ''}
              onChange={e => set('name', e.target.value)}
              placeholder={`Nom du ${cfg.label.toLowerCase()}…`}
              autoFocus
            />
          </Field>

          {/* Champs spécifiques au type */}
          {entityType === 'character' && <CharacterFields data={data} set={set} accent={cfg.accent} characterId={entity?.id} />}
          {entityType === 'location'  && <LocationFields  data={data} set={set} accent={cfg.accent} />}
          {entityType === 'object'    && <ObjectFields    data={data} set={set} accent={cfg.accent} />}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 border-t border-white/10 p-4 space-y-2">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="w-full py-2.5 rounded-lg text-sm font-black transition-all duration-200"
            style={{
              backgroundColor: canSave ? cfg.accent : `${cfg.accent}25`,
              color:           canSave ? '#fff'      : `${cfg.accent}60`,
              cursor:          canSave ? 'pointer'   : 'not-allowed',
            }}
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : `Créer le ${cfg.label.toLowerCase()}`}
          </button>

          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              Supprimer ce {cfg.label.toLowerCase()}
            </button>
          )}

          {isEdit && confirmDelete && (
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="flex-1 py-2 rounded-lg text-xs font-bold text-slate-500 border border-white/08 hover:bg-white/05 transition-all"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 rounded-lg text-xs font-black transition-all duration-150"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}
              >
                Confirmer la suppression
              </button>
            </div>
          )}
        </div>
    </SidePanel>
  );
}
