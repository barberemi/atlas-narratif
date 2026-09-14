import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import { authClient } from '../lib/authClient';
import { exportAccountData, deleteAccount } from '../api/client';
import Button from '../components/ui/Button';
import { toast } from '../lib/toast';

export default function AccountPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [exporting, setExporting] = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [error, setError] = useState(null);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8 text-center">
        <p className="text-slate-400">{t('account.loginRequired')}</p>
        <Button onClick={() => navigate('/login')} size="sm">{t('nav.login')}</Button>
      </div>
    );
  }

  async function handleExport() {
    setExporting(true);
    setError(null);
    try {
      const data = await exportAccountData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `atlas-narratif-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err.message);
    } finally {
      setExporting(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await deleteAccount();
      await authClient.signOut();
      toast(t('account.accountDeleted'));
      navigate('/');
    } catch (err) {
      setError(err.message);
      setDeleting(false);
    }
  }

  return (
    <div className="flex-1 min-h-0 overflow-hidden">
      <div className="h-full max-w-[1280px] mx-auto flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-5 border-b border-atlas-line flex-shrink-0">
          <div className="flex-1">
            <p className="font-grotesk text-[10px] uppercase tracking-[0.2em] text-atlas-gold mb-1.5">{t('account.kicker')}</p>
            <h1 className="font-serif text-4xl font-semibold text-white tracking-tight leading-none">{t('account.title')}</h1>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto px-6 py-8">
          <div className="max-w-lg flex flex-col gap-8">

        {error && (
          <div className="text-sm px-3 py-2 rounded-none"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {/* ── Informations ── */}
        <section className="flex flex-col gap-3 p-4 rounded-none border border-atlas-line"
          style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}>
          <h2 className="font-serif text-base font-semibold text-white">{t('account.info')}</h2>
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <span className="text-atlas-soft">{t('label.name')}</span>
            <span className="text-slate-300">{user.name || '—'}</span>
            <span className="text-atlas-soft">Email</span>
            <span className="text-slate-300">{user.email}</span>
            <span className="text-atlas-soft">{t('account.createdAt')}</span>
            <span className="text-slate-300">{new Date(user.createdAt).toLocaleDateString(i18n.language)}</span>
          </div>
        </section>

        {/* ── Export des données ── */}
        <section className="flex flex-col gap-3 p-4 rounded-none border border-atlas-line"
          style={{ backgroundColor: 'rgba(255,255,255,0.025)' }}>
          <h2 className="font-serif text-base font-semibold text-white">{t('account.exportData')}</h2>
          <p className="text-xs text-atlas-soft">
            {t('account.exportDesc')}
          </p>
          <Button onClick={handleExport} loading={exporting} size="sm" variant="secondary">
            {exporting ? t('btn.exporting') : t('account.downloadData')}
          </Button>
        </section>

        {/* ── Suppression du compte ── */}
        <section className="flex flex-col gap-3 p-4 rounded-none border border-red-500/20"
          style={{ backgroundColor: 'rgba(239,68,68,0.04)' }}>
          <h2 className="font-serif text-base font-semibold text-red-400">{t('account.dangerZone')}</h2>
          <p className="text-xs text-atlas-soft">
            {t('account.deleteWarning')}
          </p>

          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="self-start px-3 py-1.5 text-sm rounded-none font-medium text-red-400 transition-colors hover:text-white hover:bg-red-600"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}
            >
              {t('account.deleteAccount')}
            </button>
          ) : (
            <div className="flex flex-col gap-3 p-3 rounded-none" style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}>
              <p className="text-sm text-red-300 font-medium">
                {t('account.deleteConfirmText')}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 text-sm rounded-none font-medium bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                >
                  {deleting ? t('account.deleting') : t('btn.confirm')}
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="px-3 py-1.5 text-sm rounded-none font-medium text-slate-400 hover:text-white transition-colors"
                >
                  {t('btn.cancel')}
                </button>
              </div>
            </div>
          )}
        </section>

        <div className="mt-4 border-t border-atlas-line pt-4 flex gap-4">
          <Link to="/privacy" className="text-xs text-atlas-soft hover:text-slate-300 transition-colors">{t('account.privacy')}</Link>
          <Link to="/terms" className="text-xs text-atlas-soft hover:text-slate-300 transition-colors">{t('account.terms')}</Link>
        </div>
          </div>
        </div>
      </div>
    </div>
  );
}
