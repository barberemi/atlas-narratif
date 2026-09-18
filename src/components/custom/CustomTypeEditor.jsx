import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { restoreCustomType } from '../../api/client';
import { useUndoableDelete } from '../../hooks/useUndoableDelete';
import { Field, Input } from '../ui/FormFields';
import SidePanel from '../ui/SidePanel';
import Icon from '../ui/Icon';

const ACCENT = '#a78bfa';
const PRESET_COLORS = ['#a78bfa', '#818cf8', '#60a5fa', '#34d399', '#f59e0b', '#ef4444', '#fb923c', '#e879f9', '#2dd4bf', '#94a3b8'];
const FIELD_TYPES = ['text', 'number', 'list'];

/**
 * Éditeur d'un type d'entité custom (couche 3) : label, icône, couleur et
 * schéma de champs (field_schema). Création (type=null) ou édition.
 */
export default function CustomTypeEditor({ type, onClose }) {
  const { t } = useTranslation();
  const isEdit = !!type;
  const saving     = useCustomEntityStore(s => s.saving);
  const saveType   = useCustomEntityStore(s => s.saveType);
  const removeType = useCustomEntityStore(s => s.removeType);
  const _reload    = useCustomEntityStore(s => s._reload);
  const _projectId = useCustomEntityStore(s => s._projectId);
  const undoableDelete = useUndoableDelete();

  const [data, setData] = useState(() => ({
    label:       type?.label ?? '',
    icon:        type?.icon ?? '',
    color:       type?.color ?? ACCENT,
    fieldSchema: type?.fieldSchema ?? [],
  }));
  const [confirmDelete, setConfirmDelete] = useState(false);

  const set = (key, value) => setData(prev => ({ ...prev, [key]: value }));

  const setField = (i, key, value) =>
    set('fieldSchema', data.fieldSchema.map((f, idx) => idx === i ? { ...f, [key]: value } : f));
  const addField = () => set('fieldSchema', [...data.fieldSchema, { key: '', label: '', type: 'text' }]);
  const removeField = (i) => set('fieldSchema', data.fieldSchema.filter((_, idx) => idx !== i));

  const canSave = data.label.trim().length > 0 && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    await saveType(isEdit ? type.id : null, {
      ...data,
      label: data.label.trim(),
      // On ne garde que les champs de schéma ayant une clé.
      fieldSchema: data.fieldSchema.filter(f => f.key?.trim()).map(f => ({ ...f, key: f.key.trim() })),
    });
    onClose();
  };

  const handleDelete = async () => {
    await undoableDelete({
      deleteFn:  () => removeType(type.id),
      restoreFn: (snapshot) => restoreCustomType(snapshot, _projectId),
      reloadFn:  _reload,
      label:     t('toast.deleted', { type: t('customType.singular'), name: type.label }),
    });
    onClose();
  };

  return (
    <SidePanel onClose={onClose} aria-label={t('customType.editorTitle')}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-atlas-line flex-shrink-0">
        <div>
          <p className="font-grotesk text-[10px] text-atlas-soft uppercase tracking-[0.2em]">
            {isEdit ? t('btn.save').toLowerCase() : t('btn.create').toLowerCase()}
          </p>
          <h2 className="font-serif text-base font-semibold text-white mt-0.5">
            {t('customType.singular')} <span style={{ color: ACCENT }}>custom</span>
          </h2>
        </div>
        <button onClick={onClose} className="w-7 h-7 flex items-center justify-center text-atlas-soft hover:text-white hover:bg-white/10 transition-all">
          <Icon name="close" size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <Field label={`${t('customType.label')} *`}>
          <Input accent={ACCENT} value={data.label} onChange={e => set('label', e.target.value)} placeholder={t('customType.labelPlaceholder')} autoFocus data-testid="ctype-label" />
        </Field>

        <div className="flex gap-3">
          <div className="w-24">
            <Field label={t('customType.icon')}>
              <Input accent={ACCENT} value={data.icon} onChange={e => set('icon', e.target.value)} placeholder="🗣️" maxLength={4} />
            </Field>
          </div>
          <div className="flex-1">
            <Field label={t('label.color')}>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {PRESET_COLORS.map(c => (
                  <button key={c} onClick={() => set('color', c)} className="w-5 h-5 rounded-full transition-transform hover:scale-110"
                    style={{ backgroundColor: c, outline: data.color === c ? '2px solid white' : 'none', outlineOffset: 1 }} />
                ))}
              </div>
            </Field>
          </div>
        </div>

        <Field label={t('customType.fieldSchema')}>
          <p className="text-[11px] text-atlas-mute mb-2">{t('customType.fieldSchemaHint')}</p>
          <div className="space-y-1.5">
            {data.fieldSchema.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <input value={f.key} onChange={e => setField(i, 'key', e.target.value)} placeholder={t('customType.fieldKey')}
                  className="w-[34%] px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600"
                  data-testid={`ctype-field-key-${i}`} />
                <input value={f.label ?? ''} onChange={e => setField(i, 'label', e.target.value)} placeholder={t('customType.fieldLabel')}
                  className="flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600" />
                <select value={f.type ?? 'text'} onChange={e => setField(i, 'type', e.target.value)}
                  className="px-1.5 py-1.5 rounded-lg text-xs text-slate-300 bg-atlas-ink border border-white/10 outline-none">
                  {FIELD_TYPES.map(ft => <option key={ft} value={ft}>{t(`customType.fieldType.${ft}`)}</option>)}
                </select>
                <button onClick={() => removeField(i)} className="w-6 h-6 flex items-center justify-center text-atlas-mute hover:text-red-400 flex-shrink-0">
                  <Icon name="close" size={12} />
                </button>
              </div>
            ))}
            <button onClick={addField} className="px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}45` }} data-testid="ctype-add-field">
              {t('customType.addField')}
            </button>
          </div>
        </Field>
      </div>

      <div className="flex-shrink-0 border-t border-atlas-line p-4 space-y-2">
        <button onClick={handleSave} disabled={!canSave} className="w-full py-2.5 text-sm font-black transition-all duration-200"
          style={{ backgroundColor: canSave ? ACCENT : `${ACCENT}25`, color: canSave ? '#15171b' : `${ACCENT}60`, cursor: canSave ? 'pointer' : 'not-allowed' }}
          data-testid="ctype-save">
          {saving ? t('btn.saving') : isEdit ? t('btn.save') : t('btn.create')}
        </button>

        {isEdit && !confirmDelete && (
          <button onClick={() => setConfirmDelete(true)} data-testid="ctype-delete"
            className="w-full py-2 rounded-lg text-xs font-bold text-atlas-mute hover:text-red-400 hover:bg-red-500/08 transition-all"
            style={{ border: '1px solid rgba(255,255,255,0.05)' }}>
            {t('customType.deleteWithEntities')}
          </button>
        )}
        {isEdit && confirmDelete && (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 rounded-lg text-xs font-bold text-atlas-soft border border-white/08 hover:bg-white/05">
              {t('btn.cancel')}
            </button>
            <button onClick={handleDelete} data-testid="ctype-confirm-delete" className="flex-1 py-2 rounded-lg text-xs font-black"
              style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}>
              {t('btn.confirm')}
            </button>
          </div>
        )}
      </div>
    </SidePanel>
  );
}
