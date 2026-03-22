/**
 * Import d'un projet AtlasNarratif depuis un fichier JSON exporté.
 * Les lignes sont des snapshots bruts de la DB — on les réinsère directement
 * après avoir remplacé le project_id original par un nouvel ID unique.
 */

export async function importFromBackup(db, file, { onProgress } = {}) {
  onProgress?.('Lecture du fichier…');

  const text = await file.text();
  let payload;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new Error('Fichier invalide — ce n\'est pas un JSON AtlasNarratif.');
  }

  // ── Validation minimale ────────────────────────────────────────────────────
  if (payload.version !== '1.0' || !payload.project?.name) {
    throw new Error('Format non reconnu. Utilise un fichier exporté depuis AtlasNarratif.');
  }

  const {
    project,
    characters         = [],
    locations          = [],
    objects            = [],
    timelineEvents     = [],
    eventEntities      = [],
    incoherences       = [],
    incoherenceLinks   = [],
    stcChapters        = [],
    stcChapterBeats    = [],
    stcChapterEntities = [],
    characterJourneys  = [],
    groups             = [],
    characterGroups    = [],
    plantPayoffs       = [],
    arcPoints          = [],
    narrativeThreads   = [],
    characterArcAxes   = [],
    characterArcPoints = [],
  } = payload;

  // ── Nouveau project_id unique ──────────────────────────────────────────────
  const slug      = project.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').slice(0, 20);
  const newId     = `${slug}_${Date.now()}`;
  // ── Insertion en transaction ───────────────────────────────────────────────
  onProgress?.('Création du projet…');
  await db.exec('BEGIN');
  try {
    // Projet
    await db.query(
      `INSERT INTO projects (id, name, description, map_image) VALUES ($1,$2,$3,$4)`,
      [newId, project.name, project.description ?? null, project.mapImage ?? null],
    );

    // Helpers
    const pid   = ()    => newId;
    const json  = (v)   => v === null || v === undefined ? null
                         : typeof v === 'string' ? v
                         : JSON.stringify(v);

    // Personnages
    onProgress?.('Import des personnages…');
    for (const r of characters) {
      await db.query(
        `INSERT INTO characters
           (id, project_id, name, aliases, origin, description, color, journey_key, extra)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.name,
          json(r.aliases), r.origin, r.description,
          r.color ?? '#64748b',
          r.journey_key ?? null,
          json(r.extra ?? {}),
        ],
      );
    }

    // Lieux
    onProgress?.('Import des lieux…');
    for (const r of locations) {
      await db.query(
        `INSERT INTO locations
           (id, project_id, name, type, regime, description, coordinates, extra)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.name,
          r.type, r.regime, r.description,
          json(r.coordinates), json(r.extra ?? {}),
        ],
      );
    }

    // Objets
    onProgress?.('Import des objets…');
    for (const r of objects) {
      await db.query(
        `INSERT INTO objects
           (id, project_id, name, type, description, creator, current_holder, extra)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.name,
          r.type, r.description, r.creator,
          r.current_holder ?? null, json(r.extra ?? {}),
        ],
      );
    }

    // Événements timeline
    onProgress?.('Import de la timeline…');
    for (const r of timelineEvents) {
      await db.query(
        `INSERT INTO timeline_events
           (id, project_id, chapter_num, chapter_title, title, description, location_id, extra,
            pov_character_id, thread_ids, scene_order, scene_goal, scene_conflict, scene_outcome)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(),
          r.chapter_num, r.chapter_title,
          r.title, r.description ?? null,
          r.location_id ?? null, json(r.extra ?? {}),
          r.pov_character_id ?? null,
          json(r.thread_ids ?? []),
          r.scene_order    ?? 0,
          r.scene_goal     ?? null,
          r.scene_conflict ?? null,
          r.scene_outcome  ?? null,
        ],
      );
    }
    for (const r of eventEntities) {
      await db.query(
        `INSERT INTO event_entities (event_id, project_id, entity_id, entity_type)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [r.event_id, pid(), r.entity_id, r.entity_type],
      );
    }

    // Incohérences
    onProgress?.('Import des incohérences…');
    for (const r of incoherences) {
      await db.query(
        `INSERT INTO incoherences
           (id, project_id, type, severity, title, explanation, resolved)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.type, r.severity,
          r.title, r.explanation ?? null,
          r.resolved ?? false,
        ],
      );
    }
    for (const r of incoherenceLinks) {
      await db.query(
        `INSERT INTO incoherence_links
           (incoherence_id, project_id, entity_id, entity_type, label)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.incoherence_id, pid(), r.entity_id, r.entity_type, r.label ?? null],
      );
    }

    // Save the Cat
    onProgress?.('Import Save the Cat…');
    for (const r of stcChapters) {
      await db.query(
        `INSERT INTO stc_chapters (id, project_id, number, title, summary)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.number, r.title, r.summary ?? null],
      );
    }
    for (const r of stcChapterBeats) {
      await db.query(
        `INSERT INTO stc_chapter_beats (chapter_id, project_id, beat_id)
         VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
        [r.chapter_id, pid(), r.beat_id],
      );
    }
    for (const r of stcChapterEntities) {
      await db.query(
        `INSERT INTO stc_chapter_entities (chapter_id, project_id, entity_id, entity_type)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [r.chapter_id, pid(), r.entity_id, r.entity_type],
      );
    }

    // Trajets personnages
    onProgress?.('Import des trajets…');
    for (const r of characterJourneys) {
      await db.query(
        `INSERT INTO character_journeys (project_id, char_key, step_index, data)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [pid(), r.char_key, r.step_index, json(r.data)],
      );
    }

    // Groupes
    onProgress?.('Import des groupes…');
    for (const r of groups) {
      await db.query(
        `INSERT INTO groups (id, project_id, name, type, color, description, homeland_id)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.name, r.type ?? 'autre', r.color ?? '#64748B', r.description ?? null, r.homeland_id ?? null],
      );
    }
    for (const r of characterGroups) {
      await db.query(
        `INSERT INTO character_groups (character_id, group_id, project_id, role_in_group)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [r.character_id, r.group_id, pid(), r.role_in_group ?? null],
      );
    }

    // Amorces
    onProgress?.('Import des amorces…');
    for (const r of plantPayoffs) {
      await db.query(
        `INSERT INTO plant_payoffs
           (id, project_id, label, type, plant_chapter_num, plant_event_id, payoff_chapter_num, payoff_event_id, entity_id, entity_type, status, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT DO NOTHING`,
        [
          r.id, pid(), r.label, r.type ?? 'information',
          r.plant_chapter_num ?? null, r.plant_event_id ?? null,
          r.payoff_chapter_num ?? null, r.payoff_event_id ?? null,
          r.entity_id ?? null, r.entity_type ?? null,
          r.status ?? 'open', r.notes ?? null,
        ],
      );
    }

    // Arc émotionnel
    for (const r of arcPoints) {
      await db.query(
        `INSERT INTO arc_points (project_id, chapter_number, intensity, note)
         VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`,
        [pid(), r.chapter_number, r.intensity, r.note ?? null],
      );
    }

    // Fils narratifs
    onProgress?.('Import des fils narratifs…');
    for (const r of narrativeThreads) {
      await db.query(
        `INSERT INTO narrative_threads (id, project_id, name, color, role, description, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.name, r.color ?? '#3F51B5', r.role ?? 'subplot', r.description ?? null, r.sort_order ?? 0],
      );
    }

    // Arcs des personnages
    for (const r of characterArcAxes) {
      await db.query(
        `INSERT INTO character_arc_axes (id, project_id, character_id, label, color)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [r.id, pid(), r.character_id, r.label, r.color ?? '#64748b'],
      );
    }
    for (const r of characterArcPoints) {
      await db.query(
        `INSERT INTO character_arc_points (project_id, axis_id, chapter_num, value, note)
         VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`,
        [pid(), r.axis_id, r.chapter_num, r.value, r.note ?? null],
      );
    }

    await db.exec('COMMIT');
  } catch (err) {
    await db.exec('ROLLBACK');
    throw err;
  }

  return newId;
}
