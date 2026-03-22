import { useState, useEffect } from 'react';
import { useLoreStore } from '../../stores/useLoreStore';
import { Field, Input, Textarea } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';

const ACCENT = '#818cf8';

const PALETTE = [
  '#64748B', '#3F51B5', '#10B981', '#F59E0B', '#EF4444',
  '#8B5CF6', '#06B6D4', '#EC4899', '#F97316', '#84CC16',
];

const TYPE_SUGGESTIONS = [
  'Race', 'Clan', 'Faction', 'Guilde', 'Ordre',
  'Nation', 'Maison noble', 'Religion', 'Espèce', 'Autre',
];

function initData(group) {
  if (group) return {
    name:        group.name,
    type:        group.type        ?? 'autre',
    color:       group.color       ?? '#64748B',
    description: group.description ?? '',
    homelandId:  group.homelandId  ?? null,
  };
  return { name: '', type: '', color: '#64748B', description: '', homelandId: null };
}

export default function GroupEditor({ group, onClose }) {
  const isEdit = !!group;

  const saving      = useLoreStore(s => s.saving);
  const saveGroup   = useLoreStore(s => s.saveGroup);
  const removeGroup = useLoreStore(s => s.removeGroup);
  const locations   = useLoreStore(s => s.locations);

  const [data,          setData]          = useState(() => initData(group));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [locSearch,     setLocSearch]     = useState('');

  useEffect(() => {
    setData(initData(group));
    setConfirmDelete(false);
  }, [group?.id]); // eslint-disable-line

  const set = (k, v) => setData(prev => ({ ...prev, [k]: v }));

  const canSave = data.name.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    await saveGroup(isEdit ? group.id : null, {
      ...data,
      name:        data.name.trim(),
      description: data.description.trim() || null,
    });
    onClose();
  };

  const handleDelete = async () => {
    await removeGroup(group.id);
    onClose();
  };

  const filteredLocs = locations.filter(l =>
    !locSearch || l.name.toLowerCase().includes(locSearch.toLowerCase())
  );
  const selectedLoc = locations.find(l => l.id === data.homelandId);

  return (
    <SidePanel width={420} onClose={onClose}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
        <div>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest">
            {isEdit ? 'Modifier le groupe' : 'Nouveau groupe'}
          </p>
          <h2 className="text-sm font-black text-white mt-0.5">
            Lore <span style={{ color: ACCENT }}>Browser</span>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-sm"
        >✕</button>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Nom */}
        <Field label="Nom *">
          <Input
            accent={ACCENT}
            value={data.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex : Les Nains de la Montagne, Guilde des Ombres…"
            autoFocus
          />
        </Field>

        {/* Type — option C : suggestions + saisie libre */}
        <Field label="Type">
          <Input
            accent={ACCENT}
            list="group-type-suggestions"
            value={data.type}
            onChange={e => set('type', e.target.value)}
            placeholder="Race, Clan, Faction… ou saisie libre"
          />
          <datalist id="group-type-suggestions">
            {TYPE_SUGGESTIONS.map(s => <option key={s} value={s} />)}
          </datalist>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {TYPE_SUGGESTIONS.slice(0, 6).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => set('type', s)}
                className="px-2 py-0.5 rounded text-[10px] font-bold transition-all duration-150"
                style={{
                  backgroundColor: data.type === s ? `${ACCENT}20` : 'rgba(255,255,255,0.04)',
                  color:           data.type === s ? ACCENT : '#475569',
                  border:          `1px solid ${data.type === s ? `${ACCENT}50` : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Couleur */}
        <Field label="Couleur">
          <div className="flex flex-wrap gap-2 mt-1">
            {PALETTE.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => set('color', c)}
                className="w-6 h-6 rounded-full transition-all duration-150"
                style={{
                  backgroundColor: c,
                  outline:         data.color === c ? `2px solid ${c}` : 'none',
                  outlineOffset:   '2px',
                  opacity:         data.color === c ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </Field>

        {/* Description */}
        <Field label="Description">
          <Textarea
            accent={ACCENT}
            rows={3}
            value={data.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Culture, histoire, valeurs du groupe…"
          />
        </Field>

        {/* Lieu d'origine */}
        <Field label="Lieu d'origine">
          {selectedLoc && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded text-xs cursor-pointer"
                style={{ backgroundColor: 'rgba(96,165,250,0.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,0.3)' }}
                onClick={() => set('homelandId', null)}
                title="Retirer"
              >
                📍 {selectedLoc.name} <span style={{ opacity: 0.5 }}>✕</span>
              </span>
            </div>
          )}
          <input
            value={locSearch}
            onChange={e => setLocSearch(e.target.value)}
            placeholder="Rechercher un lieu…"
            className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600 mb-1.5"
          />
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {filteredLocs.map(loc => {
              const isSelected = data.homelandId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => { set('homelandId', isSelected ? null : loc.id); setLocSearch(''); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100"
                  style={{
                    backgroundColor: isSelected ? 'rgba(96,165,250,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'rgba(96,165,250,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span className="text-xs flex-1 truncate" style={{ color: isSelected ? '#e2e8f0' : '#64748b' }}>📍 {loc.name}</span>
                  {isSelected && <span className="text-[10px]" style={{ color: '#60a5fa' }}>✓</span>}
                </button>
              );
            })}
            {filteredLocs.length === 0 && (
              <p className="text-xs text-slate-600 text-center py-2 italic">Aucun lieu trouvé</p>
            )}
          </div>
        </Field>

      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-white/10 p-4 space-y-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-2.5 rounded-lg text-sm font-black transition-all duration-200"
          style={{
            backgroundColor: canSave ? ACCENT : `${ACCENT}25`,
            color:           canSave ? '#fff'  : `${ACCENT}60`,
            cursor:          canSave ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer le groupe'}
        </button>

        {isEdit && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          >
            Supprimer ce groupe
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
              Confirmer
            </button>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
