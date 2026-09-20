import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getProjects } from '../api/client';
import { useLoreStore }          from '../stores/useLoreStore';
import { useIncStore }           from '../stores/useIncStore';
import { useTimelineStore }      from '../stores/useTimelineStore';
import { useStcStore }           from '../stores/useStcStore';
import { useMapStore }           from '../stores/useMapStore';
import { useNotesStore }         from '../stores/useNotesStore';
import { useCharacterArcStore }  from '../stores/useCharacterArcStore';
import { usePlantStore }         from '../stores/usePlantStore';
import { useThreadStore }        from '../stores/useThreadStore';
import { useArcStore }           from '../stores/useArcStore';
import { useHeroJourneyStore }   from '../stores/useHeroJourneyStore';
import { useVolumeStore }        from '../stores/useVolumeStore';
import { useCustomEntityStore }  from '../stores/useCustomEntityStore';
import { useRelationStore }       from '../stores/useRelationStore';

const LS_KEY = 'atlas_active_project';

const ProjectCtx = createContext(null);

/** Charge uniquement les stores "core" nécessaires partout (lore + volumes + entités
 *  custom). Les entités custom sont référencées depuis les pages lore (wikilinks
 *  `[[…]]`, graphe de relations), donc leur cache doit être chaud partout.
 *  Les autres stores sont chargés à la demande via useStoreLoader() dans chaque page.
 */
async function loadCore(projectId) {
  await Promise.all([
    useLoreStore.getState().load(projectId),
    useVolumeStore.getState().load(projectId),
    useCustomEntityStore.getState().load(projectId),
    useRelationStore.getState().load(projectId),
  ]);
}

function resetAll() {
  useLoreStore.getState().reset();
  useIncStore.getState().reset();
  useTimelineStore.getState().reset();
  useStcStore.getState().reset();
  useMapStore.getState().reset();
  useNotesStore.getState().reset();
  useCharacterArcStore.getState().reset();
  usePlantStore.getState().reset();
  useThreadStore.getState().reset();
  useArcStore.getState().reset();
  useHeroJourneyStore.getState().reset();
  useVolumeStore.getState().reset();
  useCustomEntityStore.getState().reset();
  useRelationStore.getState().reset();
}

export function ProjectProvider({ children }) {
  const [projects,  setProjects]    = useState([]);
  const [projectId, setProjectIdRaw] = useState(null);
  const [loading,   setLoading]     = useState(true);
  const inflightRef = useRef(null);

  const reloadProjects = useCallback(async () => {
    // Dedup : si un appel est déjà en cours, retourner la même promise
    if (inflightRef.current) return inflightRef.current;
    const promise = getProjects().then(list => {
      setProjects(list);
      setProjectIdRaw(prev => list.find(p => p.id === prev) ? prev : (list[0]?.id ?? null));
      return list;
    }).finally(() => { inflightRef.current = null; });
    inflightRef.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    reloadProjects().then(list => {
      if (list?.length) {
        const saved  = localStorage.getItem(LS_KEY);
        const exists = list.find(p => p.id === saved);
        setProjectIdRaw(exists ? saved : list[0].id);
      }
      setLoading(false);
    });
  }, [reloadProjects]);

  useEffect(() => {
    if (!projectId) return;
    resetAll();
    loadCore(projectId);
  }, [projectId]);

  const setProjectId = (id) => {
    localStorage.setItem(LS_KEY, id);
    setProjectIdRaw(id);
  };

  return (
    <ProjectCtx.Provider value={{ projectId, setProjectId, projects, reloadProjects, loading }}>
      {children}
    </ProjectCtx.Provider>
  );
}

export function useProject() {
  return useContext(ProjectCtx);
}
