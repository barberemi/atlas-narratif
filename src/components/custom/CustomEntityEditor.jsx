import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { restoreCustomEntity } from '../../api/client';
import { useUndoableDelete } from '../../hooks/useUndoableDelete';
import { Field, Input, Textarea } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';
import Icon from '../ui/Icon';
import RelationsSection from '../relations/RelationsSection';

const ACCENT = '#a78bfa';

// ── Saisie de tags (Enter / virgule) ────────────────────────────────────────
function TagInput({ value, onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const tag = input.trim().replace(/,$/, '');
    if (!tag || value.includes(tag)) { setInput(''); return; }
    onChange([...value, tag]);
    setInput('');
  };
  return (
    <div className="rounded-lg p-2 flex flex-wrap gap-1.5 min-h-[38px]" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
      {value.map((tag, i) => (
        <span key={i} className="flex items-center gap-1 px-2 py-0.5 rounded text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.08)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }}>
          {tag}
          <button onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:text-white ml-0.5" style={{ color: 'var(--color-atlas-soft)' }}>
            <Icon name="close" size={12} />
          </button>
        </span>
      ))}
      <input value={input} onChange={e => setInput(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } }} onBlur={add}
        placeholder={value.length === 0 ? placeholder : ''}
        className="bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600 min-w-24 flex-1" />
    </div>
  );
}

function initData(entity, type) {
  if (entity) return { name: entity.name ?? '', typeId: entity.typeId, aliases: entity.aliases ?? [], description: entity.description ?? '', customFields: entity.customFields ?? {} };
  // Nouveau : pré-remplit les clés du schéma du type.
  const seeded = {};
  (type?.fieldSchema ?? []).forEach(f => { if (f.key) seeded[f.key] = ''; });
  return { name: '', typeId: type?.id ?? null, aliases: [], description: '', customFields: seeded };
}

/**
 * Éditeur d'une entité custom (couche 3). `type` = le type courant (pour le
 * schéma) ; `types` = liste complète (pour le sélecteur de type en édition).
 */
export default function CustomEntityEditor({ entity, type, types, onClose }) {
  const { t } = useTranslation();
  const isEdit = !!entity;
  const saving      = useCustomEntityStore(s => s.saving);
  const saveEntity  = useCustomEntityStore(s => s.saveEntity);
  const removeEntity = useCustomEntityStore(s => s.removeEntity);
  const _reload     = useCustomEntityStore(s => s._reload);
  const _projectId  = useCustomEntityStore(s => s._projectId);
  const undoableDelete = useUndoableDelete();

  const [data, setData] = useState(() => initData(entity, type));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newKey, setNewKey] = useState('');

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));
  const setCustom = (key, value) => set('customFields', { ...data.customFields, [key]: value });
  const removeCustom = (key) => { const next = { ...data.customFields }; delete next[key]; set('customFields', next); };
  const addCustom = () => {
    const k = newKey.trim();
    if (!k || Object.prototype.hasOwnProperty.call(data.customFields, k)) { setNewKey(''); return; }
    setCustom(k, '');
    setNewKey('');
  };

  const activeType = types?.find(x => x.id === data.typeId) ?? type;
  const schemaKeys = (activeType?.fieldSchema ?? []).map(f => f.key).filter(Boolean);
  const extraKeys = Object.keys(data.customFields).filter(k => !schemaKeys.includes(k));

  const canSave = data.name.trim().length > 0 && !!data.typeId && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    await saveEntity(isEdit ? entity.id : null, { ...data, name: data.name.trim() });
    onClose();
  };

  const handleDelete = async () => {
    await undoableDelete({
      deleteFn:  () => removeEntity(entity.id),
      restoreFn: (snapshot) => restoreCustomEntity(snapshot, _projectId),
      reloadFn:  _reload,
      label:     t('toast.deleted', { type: activeType?.label ?? t('customEntity.singular'), name: entity.name }),
    });
    onClose();
  };

  const fieldLabel = (key) => (activeType?.fieldSchema ?? []).find(f => f.key === key)?.label || key;

  return (
    <SidePanel onClose={onClose} aria-label={t('customEntity.editorTitle')}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-atlas-line flex-shrink-0">
        <div>
          <p className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.2em]">
            {isEdit ? t('btn.save').toLowerCase() : t('btn.create').toLowerCase()}
          </p>
          <h2 className="font-serif text-base font-semibold text-white mt-0.5">
            {activeType?.icon ? `${activeType.icon} ` : ''}{activeType?.label ?? t('customEntity.singular')}
          </h2>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-atlas-soft hover:text-white hover:bg-white/10">
          <Icon name="close" size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <Field label={`${t('label.name')} *`}>
          <Input accent={ACCENT} value={data.name} onChange={e => set('name', e.target.value)} placeholder={`${t('label.name')}…`} autoFocus data-testid="cent-name" />
        </Field>

        {isEdit && types && types.length > 1 && (
          <Field label={t('customType.singular')}>
            <select value={data.typeId ?? ''} onChange={e => set('typeId', e.target.value)}
              className="w-full px-3 py-2 text-sm text-white border border-atlas-line outline-none" style={{ backgroundColor: 'var(--color-atlas-ink)' }}>
              {types.map(ty => <option key={ty.id} value={ty.id}>{ty.label}</option>)}
            </select>
          </Field>
        )}

        <Field label={t('label.aliases')}>
          <TagInput value={data.aliases} onChange={v => set('aliases', v)} placeholder={t('label.aliases')} />
        </Field>

        <Field label={t('label.description')}>
          <Textarea accent={ACCENT} value={data.description} onChange={e => set('description', e.target.value)} />
        </Field>

        {/* Champs du schéma du type */}
        {schemaKeys.map(key => (
          <Field key={key} label={fieldLabel(key)}>
            <Input accent={ACCENT} value={data.customFields[key] ?? ''} onChange={e => setCustom(key, e.target.value)} data-testid={`cent-field-${key}`} />
          </Field>
        ))}

        {/* Champs custom libres (hors schéma) */}
        <Field label={t('label.customFields')}>
          <div className="space-y-1.5">
            {extraKeys.map(key => (
              <div key={key} className="flex items-center gap-1.5">
                <span className="px-2 py-1.5 rounded-lg text-xs font-bold flex-shrink-0 max-w-[38%] truncate" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1', border: '1px solid rgba(255,255,255,0.1)' }} title={key}>{key}</span>
                <input value={data.customFields[key] ?? ''} onChange={e => setCustom(key, e.target.value)}
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none" />
                <button onClick={() => removeCustom(key)} className="w-6 h-6 flex items-center justify-center text-atlas-mute hover:text-red-400 flex-shrink-0">
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
            <div className="flex items-center gap-1.5 pt-1">
              <input value={newKey} onChange={e => setNewKey(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
                placeholder={t('customFields.keyPlaceholder')}
                className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600" />
              <button onClick={addCustom} className="px-2.5 py-1.5 rounded-lg text-xs font-bold" style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}45` }}>
                {t('customFields.add')}
              </button>
            </div>
          </div>
        </Field>

        {/* Relations explicites (Niveau 3) — édition uniquement */}
        {isEdit && <RelationsSection entityId={entity.id} entityType="custom" />}
      </div>

      <div className="flex-shrink-0 border-t border-atlas-line p-4 space-y-2">
        <button onClick={handleSave} disabled={!canSave} className="w-full py-2.5 text-sm font-black transition-all duration-200"
          style={{ backgroundColor: canSave ? ACCENT : `${ACCENT}25`, color: canSave ? '#15171b' : `${ACCENT}60`, cursor: canSave ? 'pointer' : 'not-allowed' }}
          data-testid="cent-save">
          {saving ? t('btn.saving') : isEdit ? t('btn.save') : t('btn.create')}
        </button>
        {isEdit && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)} data-testid="cent-delete"
            className="w-full py-2 rounded-lg text-xs font-bold text-atlas-mute hover:text-red-400 hover:bg-red-500/08 transition-all" style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            {t('btn.delete')}
          </button>
        )}
        {isEdit && confirmDelete && (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-atlas-soft border border-white/08 hover:bg-white/05">{t('btn.cancel')}</button>
            <button onClick={handleDelete} data-testid="cent-confirm-delete" className="flex-1 py-2 rounded-lg text-xs font-black" style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}>{t('btn.confirm')}</button>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
