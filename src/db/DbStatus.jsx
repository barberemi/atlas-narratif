/**
 * Composant de smoke test Phase 2 — à SUPPRIMER après validation.
 * Teste : schéma + seed + couche queries (lecture round-trip depuis DB).
 */
import { useState, useEffect } from 'react';
import { getDb }           from './client';
import { initDb }          from './init';
import {
  getCharacters, getLocations, getObjects,
  getTimelineEvents, getIncoherences, getStcChapters,
} from './queries';

export default function DbStatus() {
  const [status, setStatus] = useState('⏳ Initialisation…');
  const [lines,  setLines]  = useState([]);
  const [ok,     setOk]     = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus('⏳ Connexion + schéma…');
        const db = await getDb();
        await initDb(db);

        setStatus('⏳ Lecture via queries…');
        const [chars, locs, objs, evts, incs, stc] = await Promise.all([
          getCharacters(db),
          getLocations(db),
          getObjects(db),
          getTimelineEvents(db),
          getIncoherences(db),
          getStcChapters(db),
        ]);

        // Spot-checks
        const frodo = chars.find(c => c.id === 'char_frodo');
        if (!frodo) throw new Error('char_frodo introuvable dans la DB');
        if (!frodo.traits?.length) throw new Error('traits de Frodo manquants');

        const shire = locs.find(l => l.id === 'loc_shire');
        if (!shire) throw new Error('loc_shire introuvable');

        const ring = objs.find(o => o.id === 'obj_one_ring');
        if (!ring) throw new Error('obj_one_ring introuvable');

        const firstEvt = evts[0];
        if (!firstEvt?.entities?.length) throw new Error('entités du 1er événement manquantes');

        if (cancelled) return;
        setOk(true);
        setStatus('✅ Phase 2 — queries opérationnelles');
        setLines([
          `${chars.length} personnages  ·  traits Frodo : ${frodo.traits.join(', ')}`,
          `${locs.length} lieux  ·  1er lieu : ${shire.name}`,
          `${objs.length} objets  ·  porteur actuel Anneau : ${ring.currentHolder ?? '—'}`,
          `${evts.length} événements  ·  entités evt_001 : ${firstEvt.entities.length}`,
          `${incs.length} incohérences  ·  1ère sévérité : ${incs[0]?.severity}`,
          `${stc.length} chapitres STC  ·  beats ch1 : ${stc[0]?.beats?.join(', ')}`,
        ]);
      } catch (err) {
        if (cancelled) return;
        setOk(false);
        setStatus('❌ Échec Phase 2');
        setLines([err.message]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div
      style={{
        position: 'fixed', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, minWidth: 420,
        backgroundColor: ok === null ? '#1e293b' : ok ? '#052e16' : '#450a0a',
        border: `1px solid ${ok === null ? '#334155' : ok ? '#16a34a' : '#dc2626'}`,
        borderRadius: 12, padding: '12px 20px',
        fontFamily: 'monospace', fontSize: 13,
        color: ok === null ? '#94a3b8' : ok ? '#86efac' : '#fca5a5',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>{status}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ marginTop: 3, opacity: 0.75, fontSize: 11 }}>{l}</div>
      ))}
      <div style={{ marginTop: 6, opacity: 0.4, fontSize: 10 }}>DbStatus — Phase 2 (queries)</div>
    </div>
  );
}
