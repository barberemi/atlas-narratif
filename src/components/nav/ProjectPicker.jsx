import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useProject } from '../../db/ProjectContext';
import Icon from '../ui/Icon';
import { deleteProject } from '../../api/client';
import DeliverablesHub from '../export/DeliverablesHub';
import { toast } from '../../lib/toast';

export default function ProjectPicker() {
  const { t } = useTranslation();
  const { projectId, setProjectId, projects, reloadProjects } = useProject();
  const [open,       setOpen]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [hubOpen,    setHubOpen]    = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setConfirmDel(null); } };
    const handleKey = (e) => { if (e.key === 'Escape') { setOpen(false); setConfirmDel(null); } };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('mousedown', handleClick); document.removeEventListener('keydown', handleKey); };
  }, [open]);

  const active = projects.find(p => p.id === projectId);

  const handleDelete = async (id) => {
    try {
      await deleteProject(id);
      await reloadProjects();
      if (id === projectId) {
        const remaining = projects.filter(p => p.id !== id);
        if (remaining.length) setProjectId(remaining[0].id);
      }
      setConfirmDel(null);
      toast(t('toast.projectDeleted'));
    } catch {
      // erreur toast global via api()
    }
  };

  if (!active) return null;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => { setOpen(v => !v); setConfirmDel(null); }}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-none font-semibold transition-all duration-150"
        style={{
          backgroundColor: open ? 'rgba(92,174,142,0.18)' : 'rgba(255,255,255,0.04)',
          color: open ? '#5cae8e' : 'var(--color-atlas-soft)',
          border: `1px solid ${open ? 'rgba(92,174,142,0.35)' : 'rgba(255,255,255,0.08)'}`,
          maxWidth: 280,
        }}
      >
        <span className="truncate">{active.name}</span>
        <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 rounded-none overflow-hidden z-50"
          style={{ width: 280, backgroundColor: '#1a1d22', border: '1px solid var(--color-atlas-line)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          <div className="p-2 space-y-0.5">
            {projects.map(p => {
              const isActive = p.id === projectId;
              const isDel    = confirmDel === p.id;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-none group"
                  style={{ backgroundColor: isActive ? 'rgba(92,174,142,0.15)' : 'transparent' }}
                >
                  <button
                    onClick={() => { if (!isActive) { setProjectId(p.id); setOpen(false); } }}
                    className="flex-1 text-left text-xs font-semibold truncate transition-colors"
                    style={{ color: isActive ? '#5cae8e' : '#94a3b8', cursor: isActive ? 'default' : 'pointer' }}
                  >
                    {isActive && <Icon name="checkmark" size={12} className="mr-1.5" />}
                    {p.name}
                  </button>

                  {!isActive && !isDel && (
                    <button
                      onClick={() => setConfirmDel(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-atlas-mute hover:text-red-400 transition-all w-5 h-5 flex items-center justify-center rounded"
                      title={t('project.deleteProject')}
                    ><Icon name="trash" size={12} /></button>
                  )}

                  {isDel && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-red-400">{t('project.confirmDelete')}</span>
                      <button onClick={() => handleDelete(p.id)} className="text-[9px] font-black text-red-400 hover:text-red-300 px-1">{t('project.yes')}</button>
                      <button onClick={() => setConfirmDel(null)} className="text-[9px] text-atlas-mute hover:text-slate-400 px-1">{t('project.no')}</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-2 pb-1">
            <button
              onClick={() => { setHubOpen(true); setOpen(false); }}
              className="w-full flex items-center gap-2 text-left text-xs px-2 py-2 rounded-none transition-all font-semibold"
              style={{ color: 'var(--color-atlas-soft)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--color-atlas-soft)'; }}
            >
              <Icon name="import" size={13} />
              {t('deliverables.export')}
            </button>
          </div>
        </div>
      )}

      {hubOpen && (
        <DeliverablesHub
          projectId={projectId}
          projectName={active.name}
          onClose={() => setHubOpen(false)}
        />
      )}
    </div>
  );
}
