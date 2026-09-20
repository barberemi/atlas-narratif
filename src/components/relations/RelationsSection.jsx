import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useRelationStore } from '../../stores/useRelationStore';
import { useLoreStore } from '../../stores/useLoreStore';
import { useCustomEntityStore } from '../../stores/useCustomEntityStore';
import { restoreRelation } from '../../api/client';
import { useUndoableDelete } from '../../hooks/useUndoableDelete';
import { Field } from '../ui/FormFields';
import Icon from '../ui/Icon';

const ACCENT = '#e879f9'; // cohérent avec RELATION_COLORS.wikilink (graphe)

/**
 * Édition manuelle des relations explicites (Niveau 3) d'une entité : liste des
 * relations existantes (libellé éditable + sens togglable + suppression) et un
 * formulaire d'ajout (cible + libellé libre + orienté/symétrique).
 *
 * `entityId` doit exister (mode édition uniquement).
 */
export default function RelationsSection({ entityId, entityType }) {
  const { t } = useTranslation();
  const relations = useRelationStore(s => s.relations) ?? [];
  const saveRel   = useRelationStore(s => s.save);
  const removeRel = useRelationStore(s => s.remove);
  const reloadRel = useRelationStore(s => s._reload);
  const projectId = useRelationStore(s => s._projectId);
  const undoableDelete = useUndoableDelete();

  const characters     = useLoreStore(s => s.characters) ?? [];
  const locations      = useLoreStore(s => s.locations) ?? [];
  const objects        = useLoreStore(s => s.objects) ?? [];
  const customEntities = useCustomEntityStore(s => s.entities) ?? [];

  const allEntities = useMemo(() => [
    ...characters.map(e => ({ id: e.id, name: e.name, type: 'character' })),
    ...locations.map(e  => ({ id: e.id, name: e.name, type: 'location' })),
    ...objects.map(e    => ({ id: e.id, name: e.name, type: 'object' })),
    ...customEntities.map(e => ({ id: e.id, name: e.name, type: 'custom' })),
  ], [characters, locations, objects, customEntities]);
  const nameOf = (id) => allEntities.find(e => e.id === id)?.name ?? id;

  const mine = useMemo(
    () => relations.filter(r => r.sourceId === entityId || r.targetId === entityId),
    [relations, entityId],
  );

  const [targetId, setTargetId] = useState('');
  const [label, setLabel]       = useState('');
  const [directed, setDirected] = useState(true);
  const [search, setSearch]     = useState('');

  const candidates = allEntities.filter(e =>
    e.id !== entityId && e.name.toLowerCase().includes(search.toLowerCase()));

  const addRelation = async () => {
    if (!targetId) return;
    const tgt = allEntities.find(e => e.id === targetId);
    if (!tgt) return;
    await saveRel(null, {
      sourceId: entityId, sourceType: entityType,
      targetId, targetType: tgt.type,
      label: label.trim() || null, directed,
    });
    setTargetId(''); setLabel(''); setSearch(''); setDirected(true);
  };

  const updateLabel = async (rel, next) => {
    if ((rel.label ?? '') === next.trim()) return;
    await saveRel(rel.id, { ...rel, label: next.trim() || null });
  };
  const toggleDir = (rel) => saveRel(rel.id, { ...rel, directed: !rel.directed });
  const del = (rel) => undoableDelete({
    deleteFn:  () => removeRel(rel.id),
    restoreFn: (snap) => restoreRelation(snap, projectId),
    reloadFn:  reloadRel,
    label:     t('relations.deleted', { name: nameOf(rel.sourceId === entityId ? rel.targetId : rel.sourceId) }),
  });

  const inputCls = 'flex-1 min-w-0 px-2 py-1.5 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none placeholder-slate-600';
  const target = allEntities.find(e => e.id === targetId);

  return (
    <Field label={t('relations.section')}>
      {/* Relations existantes */}
      <div className="space-y-1.5" data-testid="relations-list">
        {mine.length === 0 && (
          <p className="text-[11px] text-atlas-mute italic">{t('relations.none')}</p>
        )}
        {mine.map(rel => {
          const outgoing = rel.sourceId === entityId;
          const otherId = outgoing ? rel.targetId : rel.sourceId;
          return (
            <div key={rel.id} className="flex items-center gap-1.5" data-testid="relation-row">
              <button onClick={() => toggleDir(rel)} title={t('relations.toggleDir')}
                className="w-6 flex-shrink-0 text-sm font-bold" style={{ color: ACCENT }}>
                {rel.directed ? (outgoing ? '→' : '←') : '↔'}
              </button>
              <span className="text-xs text-atlas-soft flex-shrink-0 max-w-[35%] truncate" title={nameOf(otherId)}>{nameOf(otherId)}</span>
              <input defaultValue={rel.label ?? ''} onBlur={e => updateLabel(rel, e.target.value)}
                placeholder={t('relations.labelPlaceholder')} className={inputCls} />
              <button onClick={() => del(rel)} title={t('btn.delete')} data-testid="relation-delete"
                className="w-6 h-6 flex items-center justify-center text-atlas-mute hover:text-red-400 flex-shrink-0">
                <Icon name="close" size={12} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Ajout d'une relation */}
      <div className="mt-2 pt-2 border-t border-white/5 space-y-1.5">
        {target ? (
          <div className="flex items-center gap-1.5">
            <span className="flex items-center gap-1 px-2 py-1 rounded text-xs flex-shrink-0 max-w-[35%] truncate"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}45` }} title={target.name}>
              {target.name}
              <button onClick={() => { setTargetId(''); setSearch(''); }} className="ml-0.5 hover:text-white"><Icon name="close" size={11} /></button>
            </span>
            <button onClick={() => setDirected(d => !d)} title={t('relations.toggleDir')}
              className="w-7 flex-shrink-0 text-sm font-bold" style={{ color: ACCENT }}>{directed ? '→' : '↔'}</button>
            <input value={label} onChange={e => setLabel(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRelation(); } }}
              placeholder={t('relations.labelPlaceholder')} className={inputCls} data-testid="relation-label" />
            <button onClick={addRelation} data-testid="relation-add"
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: `${ACCENT}20`, color: ACCENT, border: `1px solid ${ACCENT}45` }}>
              {t('relations.add')}
            </button>
          </div>
        ) : (
          <>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={t('relations.pickTarget')} className={`w-full ${inputCls}`} data-testid="relation-target-search" />
            {search && (
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {candidates.slice(0, 30).map(e => (
                  <button key={e.id} onClick={() => { setTargetId(e.id); setSearch(e.name); }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all"
                    style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
                    data-testid="relation-target-option">
                    <span className="text-xs flex-1 truncate text-atlas-soft">{e.name}</span>
                    <span className="text-[10px] text-atlas-mute uppercase">{t(`label.${e.type}`)}</span>
                  </button>
                ))}
                {candidates.length === 0 && <p className="text-[11px] text-atlas-mute italic px-1">{t('relations.noMatch')}</p>}
              </div>
            )}
          </>
        )}
      </div>
    </Field>
  );
}
