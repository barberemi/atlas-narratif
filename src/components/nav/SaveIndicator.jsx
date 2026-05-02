import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSaveIndicator } from '../../stores/useSaveIndicator';

/**
 * Petit indicateur "Enregistrement…" / "Sauvegardé ✓" dans la TopNav.
 * Visible pendant 2s après la dernière sauvegarde, puis disparaît.
 */
export default function SaveIndicator() {
  const { t } = useTranslation();
  const saving      = useSaveIndicator(s => s.saving);
  const lastSavedAt = useSaveIndicator(s => s.lastSavedAt);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (lastSavedAt === 0) return;
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(timer);
  }, [lastSavedAt]);

  if (saving > 0) {
    return (
      <span className="text-[11px] text-slate-500 flex items-center gap-1.5 animate-pulse">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
        {t('saveIndicator.saving')}
      </span>
    );
  }

  if (showSaved) {
    return (
      <span className="text-[11px] text-emerald-500/80 flex items-center gap-1.5 transition-opacity duration-500">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
        {t('saveIndicator.saved')}
      </span>
    );
  }

  return null;
}
