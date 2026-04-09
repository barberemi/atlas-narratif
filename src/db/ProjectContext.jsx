import { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const LS_KEY = 'atlas_active_project';

const ProjectCtx = createContext(null);

/** Charge toutes les données pour un projet donné.
 *  - Critique : lore, volumes, timeline, stc, incoherences → bloquant
 *  - Secondaire : map, arc, plants, threads, heroJourney, characterArc → différé
 */
async function loadAll(projectId) {
  await Promise.all([
    useLoreStore.getState().load(projectId),
    useVolumeStore.getState().load(projectId),
    useTimelineStore.getState().load(projectId),
    useStcStore.getState().load(projectId),
    useIncStore.getState().load(projectId),
  ]);

  Promise.all([
    useMapStore.getState().load(projectId),
    useArcStore.getState().load(projectId),
    usePlantStore.getState().load(projectId),
    useThreadStore.getState().load(projectId),
    useHeroJourneyStore.getState().load(projectId),
    useCharacterArcStore.getState().load(projectId),
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
}

export function ProjectProvider({ children }) {
  const [projects,  setProjects]    = useState([]);
  const [projectId, setProjectIdRaw] = useState(null);
  const [loading,   setLoading]     = useState(true);

  const reloadProjects = useCallback(async () => {
    const list = await getProjects();
    setProjects(list);
    setProjectIdRaw(prev => list.find(p => p.id === prev) ? prev : (list[0]?.id ?? null));
    return list;
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
    loadAll(projectId);
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
