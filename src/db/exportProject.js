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

  // ── Groupes ───────────────────────────────────────────────────────────────
  const { rows: groups } = await db.query(
    `SELECT * FROM groups WHERE project_id = $1 ORDER BY name`,
    [projectId],
  );
  const { rows: characterGroups } = await db.query(
    `SELECT * FROM character_groups WHERE project_id = $1`,
    [projectId],
  );

  // ── Amorces narratives ────────────────────────────────────────────────────
  const { rows: plantPayoffs } = await db.query(
    `SELECT * FROM plant_payoffs WHERE project_id = $1`,
    [projectId],
  );

  // ── Arc émotionnel ────────────────────────────────────────────────────────
  const { rows: arcPoints } = await db.query(
    `SELECT * FROM arc_points WHERE project_id = $1 ORDER BY chapter_number`,
    [projectId],
  );

  // ── Fils narratifs ────────────────────────────────────────────────────────
  const { rows: narrativeThreads } = await db.query(
    `SELECT * FROM narrative_threads WHERE project_id = $1 ORDER BY sort_order`,
    [projectId],
  );

  // ── Arcs des personnages ──────────────────────────────────────────────────
  const { rows: characterArcAxes } = await db.query(
    `SELECT * FROM character_arc_axes WHERE project_id = $1 ORDER BY character_id, label`,
    [projectId],
  );
  const { rows: characterArcPoints } = await db.query(
    `SELECT * FROM character_arc_points WHERE project_id = $1 ORDER BY axis_id, chapter_num`,
    [projectId],
  );

  // ── Voyage du Héros ───────────────────────────────────────────────────────
  const { rows: heroJourneyEntries } = await db.query(
    `SELECT * FROM hero_journey_entries WHERE project_id = $1 ORDER BY stage_key`,
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
    groups,
    characterGroups,
    plantPayoffs,
    arcPoints,
    narrativeThreads,
    characterArcAxes,
    characterArcPoints,
    heroJourneyEntries,
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
