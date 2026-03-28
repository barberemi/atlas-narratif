import { useState, useEffect, useRef } from 'react';
import { useDb } from '../../db/DbContext';
import { useProject } from '../../db/ProjectContext';
import { deleteProject } from '../../db/queries';
import { exportProject } from '../../db/exportProject';

export default function ProjectPicker() {
  const db = useDb();
  const { projectId, setProjectId, projects, reloadProjects } = useProject();
  const [open,       setOpen]       = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);
  const [exporting,  setExporting]  = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setConfirmDel(null); } };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const active = projects.find(p => p.id === projectId);

  const handleExport = async () => {
    if (!db || exporting) return;
    setExporting(true);
    try { await exportProject(db, projectId); }
    finally { setExporting(false); }
  };

  const handleDelete = async (id) => {
    if (!db) return;
    await deleteProject(db, id);
    await reloadProjects();
    if (id === projectId) {
      const remaining = projects.filter(p => p.id !== id);
      if (remaining.length) setProjectId(remaining[0].id);
    }
    setConfirmDel(null);
  };

  if (!active) return null;

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => { setOpen(v => !v); setConfirmDel(null); }}
        className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-semibold transition-all duration-150"
        style={{
          backgroundColor: open ? 'rgba(63,81,181,0.18)' : 'rgba(255,255,255,0.04)',
          color: open ? '#818cf8' : '#64748b',
          border: `1px solid ${open ? 'rgba(99,102,241,0.35)' : 'rgba(255,255,255,0.08)'}`,
          maxWidth: 180,
        }}
      >
        <span className="truncate">{active.name}</span>
        <span style={{ fontSize: 8, opacity: 0.7 }}>▾</span>
      </button>

      {open && (
        <div
          className="absolute top-full mt-1.5 left-0 rounded-xl overflow-hidden z-50"
          style={{ width: 260, backgroundColor: '#0d1b2a', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 12px 40px rgba(0,0,0,0.6)' }}
        >
          <div className="p-2 space-y-0.5">
            {projects.map(p => {
              const isActive = p.id === projectId;
              const isDel    = confirmDel === p.id;
              return (
                <div
                  key={p.id}
                  className="flex items-center gap-2 px-2 py-2 rounded-lg group"
                  style={{ backgroundColor: isActive ? 'rgba(63,81,181,0.15)' : 'transparent' }}
                >
                  <button
                    onClick={() => { if (!isActive) { setProjectId(p.id); setOpen(false); } }}
                    className="flex-1 text-left text-xs font-semibold truncate transition-colors"
                    style={{ color: isActive ? '#818cf8' : '#94a3b8', cursor: isActive ? 'default' : 'pointer' }}
                  >
                    {isActive && <span className="mr-1.5" style={{ fontSize: 9 }}>✓</span>}
                    {p.name}
                  </button>

                  {!isActive && !isDel && (
                    <button
                      onClick={() => setConfirmDel(p.id)}
                      className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-600 hover:text-red-400 transition-all w-5 h-5 flex items-center justify-center rounded"
                      title="Supprimer ce projet"
                    >🗑</button>
                  )}

                  {isDel && (
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-red-400">Supprimer ?</span>
                      <button onClick={() => handleDelete(p.id)} className="text-[9px] font-black text-red-400 hover:text-red-300 px-1">Oui</button>
                      <button onClick={() => setConfirmDel(null)} className="text-[9px] text-slate-600 hover:text-slate-400 px-1">Non</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="px-2 pb-1">
            <button
              onClick={handleExport}
              disabled={exporting}
              className="w-full flex items-center gap-2 text-left text-xs px-2 py-2 rounded-lg transition-all font-semibold"
              style={{ color: exporting ? '#334155' : '#64748b' }}
              onMouseEnter={e => { if (!exporting) e.currentTarget.style.color = '#94a3b8'; }}
              onMouseLeave={e => { if (!exporting) e.currentTarget.style.color = '#64748b'; }}
            >
              <span style={{ fontSize: 12 }}>↓</span>
              {exporting ? 'Export en cours…' : 'Exporter ce projet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
