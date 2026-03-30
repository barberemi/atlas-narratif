import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useDb } from './DbContext';
import { getProjects } from './queries';
import { useLoreStore }     from '../stores/useLoreStore';
import { useIncStore }      from '../stores/useIncStore';
import { useTimelineStore } from '../stores/useTimelineStore';
import { useStcStore }      from '../stores/useStcStore';
import { useMapStore }          from '../stores/useMapStore';
import { useNotesStore }       from '../stores/useNotesStore';
import { useCharacterArcStore } from '../stores/useCharacterArcStore';
import { usePlantStore }        from '../stores/usePlantStore';
import { useThreadStore }      from '../stores/useThreadStore';
import { useArcStore }         from '../stores/useArcStore';
import { useHeroJourneyStore } from '../stores/useHeroJourneyStore';
import { useVolumeStore }      from '../stores/useVolumeStore';

const LS_KEY = 'atlas_active_project';

const ProjectCtx = createContext(null);

/** Charge toutes les données pour un projet donné.
 *  - Critique : lore, volumes, timeline, stc, incoherences → bloquant
 *  - Secondaire : map, arc, plants, threads, heroJourney, characterArc → différé (arrière-plan)
 */
async function loadAll(db, projectId) {
  await Promise.all([
    useLoreStore.getState().load(db, projectId),
    useVolumeStore.getState().load(db, projectId),
    useTimelineStore.getState().load(db, projectId),
    useStcStore.getState().load(db, projectId),
    useIncStore.getState().load(db, projectId),
  ]);

  // Stores secondaires : démarrés en arrière-plan sans bloquer l'affichage
  Promise.all([
    useMapStore.getState().load(db, projectId),
    useArcStore.getState().load(db, projectId),
    usePlantStore.getState().load(db, projectId),
    useThreadStore.getState().load(db, projectId),
    useHeroJourneyStore.getState().load(db, projectId),
    useCharacterArcStore.getState().load(db, projectId),
  ]);
}

/** Vide tous les stores avant de charger un autre projet. */
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
  const db = useDb();
  const [projects,      setProjects]     = useState([]);
  const [projectId,     setProjectIdRaw] = useState(null);
  const [loading,       setLoading]      = useState(true);

  const reloadProjects = useCallback(async () => {
    if (!db) return;
    const list = await getProjects(db);
    setProjects(list);
    return list;
  }, [db]);

  // Premier chargement : récupère les projets et choisit le projet actif
  useEffect(() => {
    if (!db) return;
    reloadProjects().then(list => {
      if (list?.length) {
        const saved  = localStorage.getItem(LS_KEY);
        const exists = list.find(p => p.id === saved);
        setProjectIdRaw(exists ? saved : list[0].id);
      }
      setLoading(false);
    });
  }, [db, reloadProjects]);

  // Quand le projet actif change → vide les stores et recharge tout
  useEffect(() => {
    if (!db || !projectId) return;
    resetAll();
    loadAll(db, projectId);
  }, [db, projectId]);

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
