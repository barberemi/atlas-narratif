/**
 * Export d'un projet AtlasNarratif vers un fichier JSON téléchargeable.
 */

export async function exportProject(db, projectId) {
  // ── Métadonnées du projet ────────────────────────────────────────────────
  const { rows: projRows } = await db.query(
    `SELECT id, name, description, map_image, created_at FROM projects WHERE id = $1`,
    [projectId],
  );
  if (!projRows.length) throw new Error(`Projet introuvable : ${projectId}`);
  const proj = projRows[0];

  // ── Personnages ──────────────────────────────────────────────────────────
  const { rows: characters } = await db.query(
    `SELECT * FROM characters WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );

  // ── Lieux ────────────────────────────────────────────────────────────────
  const { rows: locations } = await db.query(
    `SELECT * FROM locations WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );

  // ── Objets ───────────────────────────────────────────────────────────────
  const { rows: objects } = await db.query(
    `SELECT * FROM objects WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );

  // ── Timeline ─────────────────────────────────────────────────────────────
  const { rows: timelineEvents } = await db.query(
    `SELECT * FROM timeline_events WHERE project_id = $1 ORDER BY chapter_num, id`,
    [projectId],
  );
  const { rows: eventEntities } = await db.query(
    `SELECT * FROM event_entities WHERE project_id = $1`,
    [projectId],
  );

  // ── Incohérences ─────────────────────────────────────────────────────────
  const { rows: incoherences } = await db.query(
    `SELECT * FROM incoherences WHERE project_id = $1`,
    [projectId],
  );
  const { rows: incoherenceLinks } = await db.query(
    `SELECT * FROM incoherence_links WHERE project_id = $1`,
    [projectId],
  );

  // ── Save the Cat ─────────────────────────────────────────────────────────
  const { rows: stcChapters } = await db.query(
    `SELECT * FROM stc_chapters WHERE project_id = $1 ORDER BY number`,
    [projectId],
  );
  const { rows: stcChapterBeats } = await db.query(
    `SELECT * FROM stc_chapter_beats WHERE project_id = $1`,
    [projectId],
  );
  const { rows: stcChapterEntities } = await db.query(
    `SELECT * FROM stc_chapter_entities WHERE project_id = $1`,
    [projectId],
  );

  // ── Trajets personnages ───────────────────────────────────────────────────
  const { rows: characterJourneys } = await db.query(
    `SELECT * FROM character_journeys WHERE project_id = $1 ORDER BY char_key, step_index`,
    [projectId],
  );

  // ── Assemblage ────────────────────────────────────────────────────────────
  const payload = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    project: {
      id:          proj.id,
      name:        proj.name,
      description: proj.description,
      mapImage:    proj.map_image,
      createdAt:   proj.created_at,
    },
    characters,
    locations,
    objects,
    timelineEvents,
    eventEntities,
    incoherences,
    incoherenceLinks,
    stcChapters,
    stcChapterBeats,
    stcChapterEntities,
    characterJourneys,
  };

  // ── Téléchargement ────────────────────────────────────────────────────────
  const slug     = proj.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 30);
  const date     = new Date().toISOString().slice(0, 10);
  const filename = `atlas_${slug}_${date}.json`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);

  return filename;
}
