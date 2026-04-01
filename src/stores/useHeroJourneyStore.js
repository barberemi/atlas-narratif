import { create } from 'zustand';

export const useHeroJourneyStore = create((set, get) => ({
  entries:    null,
  _db:        null,
  _projectId: null,

  load: async (db, projectId) => {
    set({ _db: db, _projectId: projectId });
    const { rows } = await db.query(
      `SELECT id, stage_key, character_id, chapter_num, summary, volume_id
       FROM hero_journey_entries
       WHERE project_id = $1
       ORDER BY stage_key`,
      [projectId],
    );
    const entries = rows.map(r => ({
      id:          r.id,
      stageKey:    r.stage_key,
      characterId: r.character_id ?? null,
      chapterNum:  r.chapter_num  ?? null,
      summary:     r.summary      ?? null,
      volumeId:    r.volume_id    ?? null,
    }));
    set({ entries });
  },

  saveEntry: async ({ stageKey, characterId, chapterNum, summary, volumeId }) => {
    const { _db, _projectId, entries } = get();
    if (!_db || !_projectId) return;

    // Chercher une entrée existante pour ce stageKey + characterId + volumeId
    const existing = (entries ?? []).find(
      e => e.stageKey === stageKey
        && e.characterId === (characterId ?? null)
        && (e.volumeId ?? null) === (volumeId ?? null),
    );

    if (existing) {
      // Mise à jour
      await _db.query(
        `UPDATE hero_journey_entries
         SET chapter_num = $1, summary = $2
         WHERE id = $3 AND project_id = $4`,
        [chapterNum ?? null, summary ?? null, existing.id, _projectId],
      );
      set({
        entries: (entries ?? []).map(e =>
          e.id === existing.id
            ? { ...e, chapterNum: chapterNum ?? null, summary: summary ?? null }
            : e,
        ),
      });
    } else {
      // Insertion
      const id = crypto.randomUUID();
      await _db.query(
        `INSERT INTO hero_journey_entries (id, project_id, stage_key, character_id, chapter_num, summary, volume_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [id, _projectId, stageKey, characterId ?? null, chapterNum ?? null, summary ?? null, volumeId ?? null],
      );
      const newEntry = {
        id,
        stageKey,
        characterId: characterId ?? null,
        chapterNum:  chapterNum  ?? null,
        summary:     summary     ?? null,
        volumeId:    volumeId    ?? null,
      };
      set({ entries: [...(entries ?? []), newEntry] });
    }
  },

  removeEntry: async (entryId) => {
    const { _db, _projectId, entries } = get();
    if (!_db || !_projectId) return;
    await _db.query(
      `DELETE FROM hero_journey_entries WHERE id = $1 AND project_id = $2`,
      [entryId, _projectId],
    );
    set({ entries: (entries ?? []).filter(e => e.id !== entryId) });
  },

  reset: () => set({ entries: null, _db: null, _projectId: null }),
}));
