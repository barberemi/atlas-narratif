import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { previewObsidianImport, previewObsidianZip, seedObsidianData } from '../../api/importFromObsidian';
import { useProject } from '../../db/ProjectContext';
import ImportPreview from './ImportPreview';

const ACCENT = '#a78bfa';

/**
 * Import d'un vault Obsidian (drag-drop de `.md` ou d'un `.zip`).
 * Flux : dépôt → aperçu de staging (ImportPreview, en mémoire) → confirmation → seed.
 */
export default function VaultImporter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { reloadProjects, setProjectId } = useProject();

  const [preview, setPreview] = useState(null); // { data, report }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = useCallback(async (fileList) => {
    setError(null);
    const files = [...fileList];
    const zip = files.find(f => /\.zip$/i.test(f.name));
    try {
      if (zip) {
        setPreview(await previewObsidianZip(await zip.arrayBuffer()));
        return;
      }
      const mdFiles = files.filter(f => /\.md$/i.test(f.name));
      if (mdFiles.length === 0) { setError(t('vault.noFiles')); return; }
      const parsed = await Promise.all(mdFiles.map(async f => ({
        path: f.webkitRelativePath || f.name,
        content: await f.text(),
      })));
      setPreview(previewObsidianImport(parsed));
    } catch (e) {
      setError(String(e.message ?? e));
    }
  }, [t]);

  const onDrop = useCallback((e) => { e.preventDefault(); handleFiles(e.dataTransfer.files); }, [handleFiles]);

  const confirmImport = async () => {
    if (!preview) return;
    setBusy(true);
    setError(null);
    try {
      const id = await seedObsidianData(preview.data, { name: t('vault.defaultName') });
      await reloadProjects?.();
      setProjectId?.(id);
      navigate('/review');
    } catch (e) {
      setError(String(e.message ?? e));
      setBusy(false);
    }
  };

  if (preview) {
    return (
      <div className="h-full overflow-y-auto">
        <ImportPreview
          data={preview.data}
          report={preview.report}
          busy={busy}
          onConfirm={confirmImport}
          onCancel={() => { setPreview(null); setError(null); }}
        />
        {error && <p className="text-sm text-red-400 text-center pb-4">{error}</p>}
      </div>
    );
  }

  return (
    <div className="h-full flex items-center justify-center p-6 text-slate-200">
      <div className="w-full max-w-xl">
        <div
          onDragOver={e => e.preventDefault()}
          onDrop={onDrop}
          className="border-2 border-dashed border-atlas-line rounded-xl p-10 text-center"
        >
          <p className="text-4xl mb-3">🗂️</p>
          <h1 className="font-serif text-2xl font-semibold text-white mb-1">{t('vault.title')}</h1>
          <p className="font-serif italic text-atlas-soft mb-5">{t('vault.subtitle')}</p>
          <label className="inline-block px-4 py-2 text-sm font-bold cursor-pointer rounded" style={{ backgroundColor: ACCENT, color: '#15171b' }}>
            {t('vault.choose')}
            <input type="file" accept=".md,.zip" multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
          </label>
          <p className="text-[11px] text-atlas-mute mt-3">{t('vault.formats')}</p>
        </div>
        {error && <p className="mt-4 text-sm text-red-400 text-center">{error}</p>}
      </div>
    </div>
  );
}
