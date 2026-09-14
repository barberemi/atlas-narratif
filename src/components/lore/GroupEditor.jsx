import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLoreStore } from '../../stores/useLoreStore';
import { setGroupMemberRole } from '../../api/client';
import { Field, Input, Textarea } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';
import Icon from '../ui/Icon';

const ACCENT = '#5cae8e';

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
  const { t } = useTranslation();
  const isEdit = !!group;

  const saving      = useLoreStore(s => s.saving);
  const saveGroup   = useLoreStore(s => s.saveGroup);
  const removeGroup = useLoreStore(s => s.removeGroup);
  const locations   = useLoreStore(s => s.locations);
  const characters  = useLoreStore(s => s.characters);
  const _projectId  = useLoreStore(s => s._projectId);
  const _reload     = useLoreStore(s => s._reload);

  const members = isEdit ? (group.members ?? []) : [];

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
      <div className="flex items-center justify-between px-5 py-4 border-b border-atlas-line flex-shrink-0">
        <div>
          <p className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.2em]">
            {isEdit ? t('group.edit') : t('group.new')}
          </p>
          <h2 className="font-serif text-base font-semibold text-white mt-0.5">
            Lore <span style={{ color: ACCENT }}>Browser</span>
          </h2>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-none text-atlas-soft hover:text-white hover:bg-white/10 transition-all text-sm"
        ><Icon name="close" size={12} /></button>
      </div>

      {/* Corps */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">

        {/* Nom */}
        <Field label={`${t('label.name')} *`}>
          <Input
            accent={ACCENT}
            value={data.name}
            onChange={e => set('name', e.target.value)}
            placeholder="Ex : Les Nains de la Montagne, Guilde des Ombres…"
            autoFocus
          />
        </Field>

        {/* Type — option C : suggestions + saisie libre */}
        <Field label={t('label.type')}>
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
                  color:           data.type === s ? ACCENT : 'var(--color-atlas-mute)',
                  border:          `1px solid ${data.type === s ? `${ACCENT}50` : 'rgba(255,255,255,0.08)'}`,
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </Field>

        {/* Couleur */}
        <Field label={t('label.color')}>
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
        <Field label={t('label.description')}>
          <Textarea
            accent={ACCENT}
            rows={3}
            value={data.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Culture, histoire, valeurs du groupe…"
          />
        </Field>

        {/* Lieu d'origine */}
        <Field label={t('group.homeland')}>
          {selectedLoc && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-none text-xs cursor-pointer"
                style={{ backgroundColor: 'rgba(92,174,142,0.12)', color: '#5cae8e', border: '1px solid rgba(92,174,142,0.3)' }}
                onClick={() => set('homelandId', null)}
                title={t('btn.delete')}
              >
                <Icon name="location" size={14} />{selectedLoc.name} <Icon name="close" size={12} style={{ opacity: 0.5 }} />
              </span>
            </div>
          )}
          <input
            value={locSearch}
            onChange={e => setLocSearch(e.target.value)}
            placeholder={t('group.searchLocation')}
            className="w-full px-3 py-2 rounded-none text-xs text-slate-300 bg-white/5 border border-atlas-line outline-none placeholder-slate-600 mb-1.5"
          />
          <div className="space-y-0.5 max-h-36 overflow-y-auto">
            {filteredLocs.map(loc => {
              const isSelected = data.homelandId === loc.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => { set('homelandId', isSelected ? null : loc.id); setLocSearch(''); }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-none text-left transition-all duration-100"
                  style={{
                    backgroundColor: isSelected ? 'rgba(92,174,142,0.1)' : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isSelected ? 'rgba(92,174,142,0.4)' : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  <span className="text-xs flex-1 truncate" style={{ color: isSelected ? '#e2e8f0' : 'var(--color-atlas-soft)' }}><Icon name="location" size={14} className="inline align-text-bottom mr-1" />{loc.name}</span>
                  {isSelected && <Icon name="checkmark" size={12} style={{ color: '#5cae8e' }} />}
                </button>
              );
            })}
            {filteredLocs.length === 0 && (
              <p className="text-xs text-atlas-mute text-center py-2 italic">{t('group.noLocationFound')}</p>
            )}
          </div>
        </Field>

        {isEdit && members.length > 0 && (
          <Field label={`${t('label.members')} (${members.length})`}>
            <div className="space-y-1.5">
              {members.map(m => {
                const char = characters.find(c => c.id === m.characterId);
                if (!char) return null;
                return (
                  <div key={m.characterId} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: char.color }} />
                    <span className="text-xs text-slate-300 w-24 truncate flex-shrink-0">{char.name.split(' ')[0]}</span>
                    <input
                      defaultValue={m.roleInGroup ?? ''}
                      placeholder={t('group.rolePlaceholder')}
                      className="flex-1 px-2 py-1 rounded text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600"
                      onBlur={async (e) => {
                        const val = e.target.value.trim() || null;
                        if (val !== (m.roleInGroup ?? null)) {
                          await setGroupMemberRole(group.id, m.characterId, val, _projectId);
                          _reload();
                        }
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </Field>
        )}

      </div>

      {/* Footer */}
      <div className="flex-shrink-0 border-t border-atlas-line p-4 space-y-2">
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="w-full py-2.5 rounded-none text-sm font-black transition-all duration-200"
          style={{
            backgroundColor: canSave ? ACCENT : `${ACCENT}25`,
            color:           canSave ? '#15171b' : `${ACCENT}60`,
            cursor:          canSave ? 'pointer' : 'not-allowed',
          }}
        >
          {saving ? t('btn.saving') : isEdit ? t('btn.save') : t('group.create')}
        </button>

        {isEdit && !confirmDelete && (
          <button
            onClick={() => setConfirmDelete(true)}
            className="w-full py-2 rounded-lg text-xs font-bold text-atlas-mute hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}
          >
            {t('group.delete')}
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
