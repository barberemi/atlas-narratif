import { useState, useEffect, useMemo } from 'react';
import { BEATS } from '../../data/beats_config';
import { useLoreStore } from '../../stores/useLoreStore';

const ENTITY_TYPE_CONFIG = {
  character: { label: 'Personnages', color: (e) => e.color ?? '#818cf8' },
  location:  { label: 'Lieux',       color: ()  => '#60a5fa'             },
  object:    { label: 'Objets',      color: ()  => '#a78bfa'             },
};

/**
 * Panneau latéral pour créer ou éditer un chapitre Save the Cat.
 * Props :
 *   chapter      — null (création) ou objet chapitre (édition)
 *   nextNumber   — numéro suggéré pour un nouveau chapitre
 *   onSave       — ({ number, title, summary, beats, entities }) => void
 *   onDelete     — () => void  (absent en mode création)
 *   onClose      — () => void
 *   saving       — bool
 */
export default function ChapterEditor({ chapter, nextNumber, onSave, onDelete, onClose, saving }) {
  const isEdit = !!chapter;

  const [number,  setNumber]  = useState(isEdit ? chapter.number  : nextNumber);
  const [title,   setTitle]   = useState(isEdit ? chapter.title   : '');
  const [summary, setSummary] = useState(isEdit ? (chapter.summary ?? '') : '');
  const [beats,   setBeats]   = useState(new Set(isEdit ? chapter.beats : []));
  const [entities, setEntities] = useState(isEdit ? (chapter.entities ?? []) : []);
  const [entitySearch, setEntitySearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { characters, locations, objects } = useLoreStore();

  // Resync si le chapitre prop change
  useEffect(() => {
    setNumber(isEdit ? chapter.number : nextNumber); // eslint-disable-line react-hooks/set-state-in-effect
    setTitle(isEdit ? chapter.title : '');
    setSummary(isEdit ? (chapter.summary ?? '') : '');
    setBeats(new Set(isEdit ? chapter.beats : []));
    setEntities(isEdit ? (chapter.entities ?? []) : []);
    setEntitySearch('');
    setConfirmDelete(false);
  }, [chapter?.id, nextNumber]); // eslint-disable-line

  const toggleBeat = (beatId) => {
    setBeats(prev => {
      const next = new Set(prev);
      next.has(beatId) ? next.delete(beatId) : next.add(beatId);
      return next;
    });
  };

  const toggleEntity = (id, entityType) => {
    setEntities(prev => {
      const exists = prev.some(e => e.id === id && e.entityType === entityType);
      return exists
        ? prev.filter(e => !(e.id === id && e.entityType === entityType))
        : [...prev, { id, entityType }];
    });
  };

  // Toutes les entités avec leur meta, filtrées par la recherche
  const allEntities = useMemo(() => {
    const q = entitySearch.toLowerCase();
    const filter = (list, type) =>
      list
        .filter(e => !q || e.name.toLowerCase().includes(q))
        .map(e => ({ ...e, entityType: type }));
    return {
      character: filter(characters, 'character'),
      location:  filter(locations,  'location'),
      object:    filter(objects,    'object'),
    };
  }, [characters, locations, objects, entitySearch]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ number: Number(number), title: title.trim(), summary: summary.trim(), beats: [...beats], entities });
  };

  const canSave = title.trim().length > 0 && !saving;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col"
        style={{
          width: 420,
          backgroundColor: '#0d1b2a',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '-16px 0 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest">
              {isEdit ? 'Modifier le chapitre' : 'Nouveau chapitre'}
            </p>
            <h2 className="text-sm font-black text-white mt-0.5">
              Save the <span style={{ color: '#f97316' }}>Cat</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all text-sm"
          >
            ✕
          </button>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar">

          {/* Numéro + Titre */}
          <div className="flex gap-3">
            <div className="flex-shrink-0" style={{ width: 72 }}>
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Ch. n°</label>
              <input
                type="number" min={1} value={number}
                onChange={e => setNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-lg text-sm font-mono font-bold text-white bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition-colors"
                style={{ appearance: 'textfield' }}
              />
            </div>
            <div className="flex-1">
              <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Titre</label>
              <input
                type="text" value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Titre du chapitre…"
                className="w-full px-3 py-2 rounded-lg text-sm text-white bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition-colors placeholder-slate-600"
                autoFocus
              />
            </div>
          </div>

          {/* Résumé */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">Résumé</label>
            <textarea
              value={summary} onChange={e => setSummary(e.target.value)}
              placeholder="Ce qui se passe dans ce chapitre…"
              rows={3}
              className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 leading-relaxed font-serif bg-white/5 border border-white/10 outline-none focus:border-orange-500/50 transition-colors placeholder-slate-700 resize-none"
            />
          </div>

          {/* ── Sélecteur de beats ── */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-3">
              Beats narratifs
              <span className="ml-2 font-normal text-slate-700 normal-case">
                {beats.size > 0 ? `${beats.size} sélectionné${beats.size > 1 ? 's' : ''}` : 'aucun'}
              </span>
            </label>
            <div className="space-y-1">
              {BEATS.map(beat => {
                const selected = beats.has(beat.id);
                return (
                  <button
                    key={beat.id} onClick={() => toggleBeat(beat.id)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-100 text-left"
                    style={{
                      backgroundColor: selected ? `${beat.color}18` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${selected ? beat.color + '50' : 'rgba(255,255,255,0.06)'}`,
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all duration-100"
                      style={{ backgroundColor: selected ? beat.color : 'transparent', borderColor: selected ? beat.color : 'rgba(255,255,255,0.2)' }}
                    >
                      {selected && <span className="text-white text-[10px] leading-none font-bold">✓</span>}
                    </span>
                    <span className="text-[10px] font-mono font-bold flex-shrink-0"
                      style={{ color: selected ? beat.color : '#475569', minWidth: 16 }}>
                      {beat.number}
                    </span>
                    <span className="text-xs font-semibold flex-1" style={{ color: selected ? '#e2e8f0' : '#64748b' }}>
                      {beat.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-700 flex-shrink-0">{beat.idealPercent}%</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Sélecteur d'entités ── */}
          <div>
            <label className="block text-[10px] text-slate-500 uppercase tracking-widest mb-3">
              Entités présentes
              <span className="ml-2 font-normal text-slate-700 normal-case">
                {entities.length > 0 ? `${entities.length} liée${entities.length > 1 ? 's' : ''}` : 'aucune'}
              </span>
            </label>

            {/* Chips entités sélectionnées */}
            {entities.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {entities.map(e => {
                  const allList = e.entityType === 'character' ? characters : e.entityType === 'location' ? locations : objects;
                  const meta = allList.find(x => x.id === e.id);
                  if (!meta) return null;
                  const color = ENTITY_TYPE_CONFIG[e.entityType].color(meta);
                  return (
                    <button
                      key={`${e.entityType}-${e.id}`}
                      onClick={() => toggleEntity(e.id, e.entityType)}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all"
                      style={{ backgroundColor: `${color}18`, border: `1px solid ${color}50`, color }}
                      title="Retirer"
                    >
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      {meta.name}
                      <span className="opacity-50 ml-0.5">✕</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Recherche */}
            <input
              type="text"
              value={entitySearch}
              onChange={e => setEntitySearch(e.target.value)}
              placeholder="Rechercher un personnage, lieu, objet…"
              className="w-full px-3 py-2 rounded-lg text-xs text-slate-300 bg-white/5 border border-white/10 outline-none focus:border-indigo-500/50 transition-colors placeholder-slate-600 mb-2"
            />

            {/* Résultats groupés par type */}
            <div className="space-y-3 max-h-56 overflow-y-auto no-scrollbar">
              {Object.entries(ENTITY_TYPE_CONFIG).map(([type, cfg]) => {
                const list = allEntities[type];
                if (!list.length) return null;
                return (
                  <div key={type}>
                    <p className="text-[9px] text-slate-600 uppercase tracking-widest mb-1 px-1">{cfg.label}</p>
                    <div className="space-y-0.5">
                      {list.map(e => {
                        const selected = entities.some(x => x.id === e.id && x.entityType === type);
                        const color = cfg.color(e);
                        return (
                          <button
                            key={e.id}
                            onClick={() => toggleEntity(e.id, type)}
                            className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all duration-100"
                            style={{
                              backgroundColor: selected ? `${color}15` : 'rgba(255,255,255,0.02)',
                              border: `1px solid ${selected ? color + '40' : 'rgba(255,255,255,0.05)'}`,
                            }}
                          >
                            <span className="w-2 h-2 rounded-full flex-shrink-0"
                              style={{ backgroundColor: selected ? color : '#334155' }} />
                            <span className="text-xs flex-1 truncate"
                              style={{ color: selected ? '#e2e8f0' : '#64748b' }}>
                              {e.name}
                            </span>
                            {selected && <span className="text-[10px]" style={{ color }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
              {!Object.values(allEntities).some(l => l.length) && (
                <p className="text-xs text-slate-700 italic px-1">Aucune entité trouvée</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 border-t border-white/10 p-4 space-y-2">
          <button
            onClick={handleSave} disabled={!canSave}
            className="w-full py-2.5 rounded-lg text-sm font-black transition-all duration-200"
            style={{
              backgroundColor: canSave ? '#f97316' : 'rgba(249,115,22,0.15)',
              color: canSave ? '#fff' : '#f9731640',
              cursor: canSave ? 'pointer' : 'not-allowed',
            }}
          >
            {saving ? 'Enregistrement…' : isEdit ? 'Enregistrer les modifications' : 'Créer le chapitre'}
          </button>

          {isEdit && !confirmDelete && (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full py-2 rounded-lg text-xs font-bold text-slate-600 hover:text-red-400 hover:bg-red-500/08 transition-all duration-150"
              style={{ border: '1px solid rgba(255,255,255,0.05)' }}
            >
              Supprimer ce chapitre
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
                onClick={onDelete}
                className="flex-1 py-2 rounded-lg text-xs font-black transition-all duration-150"
                style={{ backgroundColor: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.35)' }}
              >
                Confirmer la suppression
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
