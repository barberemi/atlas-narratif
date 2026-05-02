import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useVolumeStore } from '../../stores/useVolumeStore';

export default function VolumePicker() {
  const { t } = useTranslation();
  const volumes        = useVolumeStore(s => s.volumes) ?? [];
  const activeVolumeId = useVolumeStore(s => s.activeVolumeId);
  const setActiveVolume = useVolumeStore(s => s.setActiveVolume);
  const addVolume      = useVolumeStore(s => s.addVolume);
  const editVolume     = useVolumeStore(s => s.editVolume);
  const removeVolume   = useVolumeStore(s => s.removeVolume);

  const [open,       setOpen]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null); // volumeId en attente
  const [adding,     setAdding]     = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [formTitle,  setFormTitle]  = useState('');

  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const close = () => { setOpen(false); setConfirmDel(null); setAdding(false); setEditingId(null); };
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) close(); };
    const handleKey = (e) => { if (e.key === 'Escape') close(); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [open]);

  // Label du bouton déclencheur
  const activeVolume = volumes.find(v => v.id === activeVolumeId);
  const triggerLabel = activeVolumeId
    ? (activeVolume ? t('volume.tome', { number: activeVolume.number }) : `${t('volume.tome', { number: '?' })}`)
    : volumes.length > 0 ? t('volume.series') : null;

  // Pas de volumes et pas en train d'ajouter → affiche juste le "+" discret
  const showTrigger = volumes.length > 0 || null;

  const handleAdd = async () => {
    const title = formTitle.trim();
    if (!title) return;
    const nextNumber = volumes.length ? Math.max(...volumes.map(v => v.number)) + 1 : 1;
    await addVolume({ number: nextNumber, title });
    setFormTitle('');
    setAdding(false);
  };

  const handleEdit = async (volumeId) => {
    const title = formTitle.trim();
    if (!title) return;
    const vol = volumes.find(v => v.id === volumeId);
    await editVolume(volumeId, { ...vol, title });
    setEditingId(null);
    setFormTitle('');
  };

  const handleStartEdit = (vol) => {
    setEditingId(vol.id);
    setFormTitle(vol.title);
    setAdding(false);
    setConfirmDel(null);
  };

  const handleStartAdd = () => {
    setAdding(true);
    setFormTitle('');
    setEditingId(null);
    setConfirmDel(null);
  };

  return (
    <div ref={ref} className="relative flex-shrink-0">
      {/* ─── Bouton déclencheur ─── */}
      {showTrigger && (
        <button
          onClick={() => { setOpen(v => !v); setConfirmDel(null); setAdding(false); setEditingId(null); }}
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-150"
          style={{
            backgroundColor: open ? 'rgba(63,81,181,0.18)' : 'rgba(255,255,255,0.04)',
            color: open ? '#818cf8' : '#64748b',
            border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
          }}
          onMouseEnter={e => { if (!open) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)'; } }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; } }}
        >
          <span style={{ fontSize: 10 }}>📚</span>
          <span>{triggerLabel}</span>
          <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
        </button>
      )}

      {/* ─── Bouton "+" si aucun volume (entrée dans le feature) ─── */}
      {!showTrigger && (
        <button
          onClick={() => { setOpen(v => !v); setAdding(true); }}
          className="flex items-center gap-1 text-xs px-2 py-1.5 rounded-lg transition-all duration-150"
          style={{
            color: open ? '#818cf8' : '#475569',
            border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.06)'}`,
            backgroundColor: open ? 'rgba(63,81,181,0.1)' : 'transparent',
          }}
          onMouseEnter={e => { if (!open) { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; } }}
          onMouseLeave={e => { if (!open) { e.currentTarget.style.color = '#475569'; e.currentTarget.style.backgroundColor = 'transparent'; } }}
          title={t('volume.createVolumes')}
        >
          <span style={{ fontSize: 10 }}>📚</span>
          <span style={{ fontSize: 9 }}>+</span>
        </button>
      )}

      {/* ─── Dropdown ─── */}
      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 rounded-xl overflow-hidden z-50"
          style={{ width: 240, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          <div className="p-2 space-y-0.5">

            {/* Option "Toute la série" */}
            {volumes.length > 0 && (
              <button
                onClick={() => { setActiveVolume(null); setOpen(false); }}
                className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left text-xs font-semibold transition-all"
                style={{
                  backgroundColor: !activeVolumeId ? 'rgba(63,81,181,0.15)' : 'transparent',
                  color: !activeVolumeId ? '#818cf8' : '#64748b',
                }}
                onMouseEnter={e => { if (activeVolumeId) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)'; }}
                onMouseLeave={e => { if (activeVolumeId) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {!activeVolumeId && <span style={{ fontSize: 9 }}>✓</span>}
                <span>{t('volume.allSeries')}</span>
              </button>
            )}

            {/* Liste des volumes */}
            {volumes.map(v => {
              const isActive = v.id === activeVolumeId;
              const isDel    = confirmDel === v.id;
              const isEdit   = editingId  === v.id;

              return (
                <div
                  key={v.id}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-lg group"
                  style={{ backgroundColor: isActive ? 'rgba(63,81,181,0.15)' : 'transparent' }}
                >
                  {isEdit ? (
                    <form
                      className="flex items-center gap-1 w-full"
                      onSubmit={(e) => { e.preventDefault(); handleEdit(v.id); }}
                    >
                      <input
                        autoFocus
                        value={formTitle}
                        onChange={e => setFormTitle(e.target.value)}
                        className="flex-1 text-xs bg-transparent outline-none border-b"
                        style={{ color: '#cbd5e1', borderColor: 'rgba(99,102,241,0.5)' }}
                        placeholder={t('volume.titlePlaceholder')}
                      />
                      <button type="submit" className="text-[9px] text-indigo-400 font-black px-1">✓</button>
                      <button type="button" onClick={() => setEditingId(null)} className="text-[9px] text-slate-600 px-1">✕</button>
                    </form>
                  ) : isDel ? (
                    <div className="flex items-center gap-1 w-full">
                      <span className="text-[9px] text-red-400 flex-1">{t('volume.confirmDelete')}</span>
                      <button onClick={() => { removeVolume(v.id); setConfirmDel(null); }} className="text-[9px] font-black text-red-400 hover:text-red-300 px-1">{t('volume.yes')}</button>
                      <button onClick={() => setConfirmDel(null)} className="text-[9px] text-slate-600 hover:text-slate-400 px-1">{t('volume.no')}</button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => { setActiveVolume(v.id); setOpen(false); }}
                        className="flex-1 text-left text-xs font-semibold truncate transition-colors"
                        style={{ color: isActive ? '#818cf8' : '#94a3b8', cursor: isActive ? 'default' : 'pointer' }}
                        onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = '#cbd5e1'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = '#94a3b8'; }}
                      >
                        {isActive && <span className="mr-1.5" style={{ fontSize: 9 }}>✓</span>}
                        <span className="text-slate-500 mr-1">{v.number}.</span>
                        {v.title}
                      </button>
                      <button
                        onClick={() => handleStartEdit(v)}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-600 hover:text-slate-300 transition-all w-5 h-5 flex items-center justify-center rounded"
                        title={t('volume.rename')}
                      >✎</button>
                      <button
                        onClick={() => { setConfirmDel(v.id); setEditingId(null); }}
                        className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-600 hover:text-red-400 transition-all w-5 h-5 flex items-center justify-center rounded"
                        title={t('volume.deleteVolume')}
                      >🗑</button>
                    </>
                  )}
                </div>
              );
            })}

            {/* Formulaire d'ajout */}
            {adding ? (
              <form
                className="flex items-center gap-1 px-2 py-2"
                onSubmit={(e) => { e.preventDefault(); handleAdd(); }}
              >
                <input
                  autoFocus
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="flex-1 text-xs bg-transparent outline-none border-b"
                  style={{ color: '#cbd5e1', borderColor: 'rgba(99,102,241,0.5)' }}
                  placeholder={t('volume.titlePlaceholder')}
                />
                <button type="submit" className="text-[9px] text-indigo-400 font-black px-1">✓</button>
                <button type="button" onClick={() => setAdding(false)} className="text-[9px] text-slate-600 px-1">✕</button>
              </form>
            ) : (
              <button
                onClick={handleStartAdd}
                className="w-full flex items-center gap-2 text-left text-xs px-2 py-2 rounded-lg transition-all font-semibold"
                style={{ color: '#475569' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
              >
                <span>+</span>
                <span>{t('volume.addVolume')}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
