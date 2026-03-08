import { useState } from 'react';
import Button from '../ui/Button';

const FilePicker = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    if (e.type === "dragenter" || e.type === "dragover") setIsDragging(true);
    else if (e.type === "dragleave") setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`
        relative group w-full max-w-2xl h-80 flex flex-col items-center justify-center rounded-[2rem] 
        transition-all duration-500 border-2 border-dashed
        ${isDragging 
          ? 'border-[#3F51B5FF] bg-[#3F51B5FF]/5 scale-[1.02] shadow-[0_0_30px_rgba(63,81,181,0.2)]' 
          : 'border-slate-800 bg-[#13212E]/50 backdrop-blur-sm hover:border-slate-700'}
      `}
    >
      <div className="text-center p-10 flex flex-col items-center">
        <span className={`text-6xl mb-6 transition-transform duration-300 ${isDragging ? 'scale-125 rotate-6' : 'group-hover:scale-110'}`}>
          📜
        </span>
        <h2 className="text-2xl font-bold text-white mb-2">Déposez votre manuscrit</h2>
        <p className="text-slate-400 text-sm mb-8 max-w-xs">
          L'IA va extraire automatiquement les personnages, les lieux et la chronologie.
        </p>
        
        <label className="cursor-pointer">
          <div className={`
            px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300
            bg-[#3F51B5FF] text-white shadow-[0_5px_15px_rgba(63,81,181,0.4)] 
            hover:shadow-[0_8px_20px_rgba(63,81,181,0.6)] hover:-translate-y-0.5
          `}>
          Parcourir les fichiers
          </div>
          <input 
            type="file" 
            className="hidden" 
            onChange={(e) => onFileSelect(e.target.files[0])} 
            accept=".txt,.md,.doc,.docx"
          />
        </label>
      </div>
    </div>
  );
};

export default FilePicker;