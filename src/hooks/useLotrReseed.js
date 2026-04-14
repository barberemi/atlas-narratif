import { useEffect, useRef, useState } from 'react';
import i18n from '../i18n';
import { useProject } from '../db/ProjectContext';
import { deleteProject, seedProjectViaApi } from '../api/client';
import { buildLotrSeedPayload } from '../db/seed.lotr';
import { toast } from '../lib/toast';

/**
 * Écoute les changements de langue i18n.
 * Si le projet actif est la démo LOTR, supprime et re-seede dans la nouvelle langue.
 */
export function useLotrReseed() {
  const { projectId, setProjectId, reloadProjects } = useProject();
  const [reseeding, setReseeding] = useState(false);

  const projectIdRef = useRef(projectId);
  const reseedingRef = useRef(false);

  useEffect(() => { projectIdRef.current = projectId; }, [projectId]);

  useEffect(() => {
    const handler = async (newLang) => {
      const currentId = projectIdRef.current;
      if (!currentId?.startsWith('lotr')) return;
      if (reseedingRef.current) return;

      const lang = newLang.split('-')[0] || 'fr';

      reseedingRef.current = true;
      setReseeding(true);

      try {
        await deleteProject(currentId);

        const payload = await buildLotrSeedPayload({ lang });
        const newId = await seedProjectViaApi(payload.meta, payload.data);

        await reloadProjects();

        // Force le cycle resetAll → loadAll dans ProjectContext
        // (le projectId peut être identique après delete+reseed)
        setProjectId(null);
        setTimeout(() => setProjectId(newId), 0);

        toast.success(i18n.t('toast.demoReseeded', { lang: lang.toUpperCase() }));
      } catch (err) {
        console.error('[useLotrReseed]', err);
        toast.error(err.message);
      } finally {
        reseedingRef.current = false;
        setReseeding(false);
      }
    };

    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, [reloadProjects, setProjectId]);

  return { reseeding };
}
