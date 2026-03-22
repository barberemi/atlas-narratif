import { useState, useRef } from 'react';

const ACCEPT = '.txt,.md';

/**
 * Zone de dépôt d'un fichier texte.
 * Lit le contenu et appelle onContent(text, filename).
 */
export default function FilePicker({ onContent, disabled }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName,   setFileName]   = useState(null);
  const inputRef = useRef(null);

  const readFile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileName(file.name);
      onContent(e.target.result, file.name);
    };
    reader.readAsText(file, 'utf-8');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (e.type === 'dragenter' || e.type === 'dragover') setIsDragging(true);
    else setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    readFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className="relative group w-full flex flex-col items-center justify-center rounded-2xl transition-all duration-300 border-2 border-dashed cursor-pointer"
      style={{
        minHeight: 180,
        borderColor: isDragging
          ? 'rgba(63,81,181,0.7)'
          : fileName
            ? 'rgba(16,185,129,0.4)'
            : 'rgba(255,255,255,0.08)',
        backgroundColor: isDragging
          ? 'rgba(63,81,181,0.06)'
          : fileName
            ? 'rgba(16,185,129,0.04)'
            : 'rgba(255,255,255,0.02)',
        opacity: disabled ? 0.4 : 1,
        pointerEvents: disabled ? 'none' : 'auto',
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => readFile(e.target.files?.[0])}
      />

      {fileName ? (
        <div className="text-center p-6">
          <span className="text-3xl mb-3 block">✓</span>
          <p className="text-sm font-semibold" style={{ color: '#10b981' }}>{fileName}</p>
          <p className="text-xs text-slate-600 mt-1">Cliquer pour changer de fichier</p>
        </div>
      ) : (
        <div className="text-center p-8 flex flex-col items-center gap-3">
          <span className={`text-5xl transition-transform duration-300 ${isDragging ? 'scale-125' : 'group-hover:scale-105'}`}>
            📜
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-300">Déposez votre manuscrit</p>
            <p className="text-xs text-slate-600 mt-1">.txt ou .md — ou cliquez pour parcourir</p>
          </div>
        </div>
      )}
    </div>
  );
}
