/**
 * Générateurs de « livrables auteur » : documents HTML autonomes, stylés au
 * thème éditorial et optimisés pour l'impression (→ Enregistrer en PDF).
 * Ferment la boucle « analyse → écriture » en produisant des documents prêts à
 * transmettre (éditeur, co-auteur) ou à utiliser en révision.
 *
 * Tous consomment le payload serveur d'export (cf. fetchProjectExport), en
 * snake_case brut de DB — comme buildMarkdown.
 */

// ── Helpers ───────────────────────────────────────────────────────────────────

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;');

const parseJ = (v) => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (typeof v === 'string') { try { return JSON.parse(v); } catch { return []; } }
  return [];
};

const j = (arr) => (arr ?? []).filter(Boolean).map(esc).join(', ');

// Regroupe et trie les chapitres par tome. Source primaire : structure STC
// (résumés de chapitre) ; repli sur la timeline si aucun chapitre STC.
function chaptersFromPayload(payload) {
  const { stcChapters = [], timelineEvents = [] } = payload;
  if (stcChapters.length) {
    return stcChapters.map(ch => ({
      number: ch.number, title: ch.title, summary: ch.summary, volumeId: ch.volume_id,
    }));
  }
  const byCh = new Map();
  for (const e of timelineEvents) {
    const n = e.chapter_num ?? 0;
    if (!byCh.has(n)) byCh.set(n, { number: n, title: e.chapter_title, volumeId: e.volume_id, events: [] });
    byCh.get(n).events.push(e);
  }
  return [...byCh.values()].map(c => ({
    number: c.number,
    title:  c.title,
    volumeId: c.volumeId,
    summary: c.events
      .sort((a, b) => (a.scene_order ?? 0) - (b.scene_order ?? 0))
      .map(ev => ev.title).filter(Boolean).join(' · '),
  }));
}

// Enveloppe HTML autonome commune à tous les livrables.
function renderDocument({ docTitle, projectName, bodyHtml, t, lang }) {
  const date = new Date().toLocaleDateString(lang || 'fr');
  return `<!doctype html><html lang="${esc(lang || 'fr')}"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(docTitle)} — ${esc(projectName)}</title>
<style>
  :root{
    --paper:#faf7f0; --ink:#22242b; --soft:#5b5648; --mute:#8a8474;
    --green:#2f6d59; --gold:#9a7b3f; --rule:#ded7c5; --line:#ece6d8;
  }
  *{box-sizing:border-box;}
  html,body{margin:0;}
  body{background:var(--paper); color:var(--ink);
    font-family:"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
    font-size:15px; line-height:1.62; -webkit-font-smoothing:antialiased;
    -webkit-print-color-adjust:exact; print-color-adjust:exact;}
  .grot{font-family:"Helvetica Neue","Avenir Next",Arial,sans-serif;}
  .sheet{max-width:820px; margin:0 auto; padding:52px 60px 96px;}
  .hint{position:sticky; top:0; z-index:10; background:#22242b; color:#ece6d8;
    font-family:"Helvetica Neue",Arial,sans-serif; font-size:12px; letter-spacing:.06em;
    text-align:center; padding:9px 16px;}
  .masthead{display:flex; justify-content:space-between; align-items:baseline;
    border-bottom:2px solid var(--ink); padding-bottom:12px; gap:16px; flex-wrap:wrap;}
  .brand{font-family:"Helvetica Neue",Arial,sans-serif; font-weight:700; font-size:12px;
    letter-spacing:.22em; text-transform:uppercase;}
  .brand b{color:var(--green);}
  .date{font-family:"Helvetica Neue",Arial,sans-serif; font-size:11px; letter-spacing:.1em;
    text-transform:uppercase; color:var(--mute);}
  h1{font-weight:600; font-size:34px; letter-spacing:-.01em; margin:26px 0 4px; line-height:1.1;}
  .lede{color:var(--soft); font-style:italic; font-size:18px; margin:0 0 6px;}
  .count{font-family:"Helvetica Neue",Arial,sans-serif; font-size:12px; letter-spacing:.08em;
    text-transform:uppercase; color:var(--mute); margin:0 0 8px;}
  .rule{border:0; border-top:1px solid var(--rule); margin:22px 0 6px;}
  .entry{padding:20px 0; border-bottom:1px solid var(--line); break-inside:avoid;}
  .entry h2{font-weight:600; font-size:21px; margin:0 0 2px;}
  .entry .sub{font-family:"Helvetica Neue",Arial,sans-serif; font-size:11.5px; letter-spacing:.1em;
    text-transform:uppercase; color:var(--green); margin:0 0 10px;}
  dl{margin:0 0 8px; display:grid; grid-template-columns:auto 1fr; gap:3px 14px;}
  dt{font-family:"Helvetica Neue",Arial,sans-serif; font-size:11px; letter-spacing:.08em;
    text-transform:uppercase; color:var(--mute); white-space:nowrap;}
  dd{margin:0; color:var(--ink);}
  .desc{margin:8px 0 0; color:var(--ink);}
  .vol{margin:34px 0 4px; padding-bottom:6px; border-bottom:1px solid var(--rule);}
  .vol h2{font-weight:600; font-size:24px; margin:0; color:var(--green);}
  .vol p{margin:6px 0 0; color:var(--soft); font-style:italic;}
  .chap{padding:14px 0; break-inside:avoid;}
  .chap h3{font-weight:600; font-size:17px; margin:0 0 4px;}
  .chap p{margin:0; color:var(--ink);}
  .chap .empty{color:var(--mute); font-style:italic;}
  ul.check{list-style:none; margin:0; padding:0;}
  ul.check li{display:grid; grid-template-columns:22px 1fr; gap:10px; padding:11px 0;
    border-bottom:1px solid var(--line); break-inside:avoid;}
  ul.check .box{font-size:16px; color:var(--gold); line-height:1.4;}
  ul.check .lbl{font-weight:600;}
  ul.check .meta{display:block; font-family:"Helvetica Neue",Arial,sans-serif; font-size:11.5px;
    letter-spacing:.04em; color:var(--mute); margin-top:2px;}
  .none{color:var(--soft); font-style:italic; padding:24px 0;}
  @media print{
    .hint{display:none;}
    body{font-size:11.5pt;}
    .sheet{max-width:none; padding:0;}
    @page{margin:18mm;}
  }
</style></head><body>
<div class="hint grot">${esc(t('deliverables.printHint'))}</div>
<div class="sheet">
  <div class="masthead">
    <span class="brand">Atlas <b>Narratif</b></span>
    <span class="date">${esc(t('deliverables.exportedOn', { date }))}</span>
  </div>
  <h1>${esc(docTitle)}</h1>
  <p class="lede">${esc(projectName)}</p>
  ${bodyHtml}
</div>
</body></html>`;
}

// ── Bible des personnages ─────────────────────────────────────────────────────

export function buildCharacterBible(payload, t, lang) {
  const { project = {}, characters = [], groups = [], characterGroups = [] } = payload;

  const groupsByChar = {};
  for (const cg of characterGroups) {
    const grp = groups.find(g => g.id === cg.group_id);
    if (!grp) continue;
    (groupsByChar[cg.character_id] ??= []).push(grp.name);
  }

  let body = '';
  if (!characters.length) {
    body = `<hr class="rule"><p class="none">${esc(t('deliverables.emptyCharacters'))}</p>`;
  } else {
    body = `<p class="count">${esc(t('deliverables.countCharacters', { count: characters.length }))}</p><hr class="rule">`;
    for (const c of characters) {
      const aliases = parseJ(c.aliases);
      const traits  = parseJ(c.traits);
      const affil   = parseJ(c.affiliations);
      const cGroups = groupsByChar[c.id] ?? [];
      const subParts = [c.role, c.race].filter(Boolean).map(esc);

      const rows = [];
      if (aliases.length) rows.push(`<div><dt>${esc(t('deliverables.fAliases'))}</dt><dd>${j(aliases)}</dd></div>`);
      if (c.origin)       rows.push(`<div><dt>${esc(t('deliverables.fOrigin'))}</dt><dd>${esc(c.origin)}</dd></div>`);
      if (traits.length)  rows.push(`<div><dt>${esc(t('deliverables.fTraits'))}</dt><dd>${j(traits)}</dd></div>`);
      if (affil.length)   rows.push(`<div><dt>${esc(t('deliverables.fAffiliations'))}</dt><dd>${j(affil)}</dd></div>`);
      if (cGroups.length) rows.push(`<div><dt>${esc(t('deliverables.fGroups'))}</dt><dd>${j(cGroups)}</dd></div>`);

      body += `<section class="entry">
        <h2>${esc(c.name)}</h2>
        ${subParts.length ? `<p class="sub">${subParts.join(' · ')}</p>` : ''}
        ${rows.length ? `<dl>${rows.join('')}</dl>` : ''}
        ${c.description ? `<p class="desc">${esc(c.description)}</p>` : ''}
      </section>`;
    }
  }

  return renderDocument({
    docTitle: t('deliverables.docCharacterBible'),
    projectName: project.name ?? '',
    bodyHtml: body, t, lang,
  });
}

// ── Synopsis par tome ─────────────────────────────────────────────────────────

export function buildSynopsis(payload, t, lang) {
  const { project = {}, volumes = [] } = payload;
  const chapters = chaptersFromPayload(payload);

  let body;
  if (!chapters.length) {
    body = `<hr class="rule"><p class="none">${esc(t('deliverables.emptyChapters'))}</p>`;
  } else {
    body = '<hr class="rule">';
    const sortedVols = [...volumes].sort((a, b) => (a.number ?? 0) - (b.number ?? 0));
    const multiVol = sortedVols.length > 1;

    const renderChapters = (list) => list
      .sort((a, b) => (a.number ?? 0) - (b.number ?? 0))
      .map(ch => `<div class="chap">
        <h3>${esc(t('deliverables.chapterN', { n: ch.number }))}${ch.title ? ` — ${esc(ch.title)}` : ''}</h3>
        ${ch.summary ? `<p>${esc(ch.summary)}</p>` : `<p class="empty">${esc(t('deliverables.noSummary'))}</p>`}
      </div>`).join('');

    if (multiVol) {
      for (const v of sortedVols) {
        const volChapters = chapters.filter(ch => ch.volumeId === v.id);
        if (!volChapters.length) continue;
        body += `<div class="vol">
          <h2>${esc(t('deliverables.volumeN', { n: v.number }))}${v.title ? ` — ${esc(v.title)}` : ''}</h2>
          ${v.description ? `<p>${esc(v.description)}</p>` : ''}
        </div>${renderChapters(volChapters)}`;
      }
      // Chapitres sans tome assigné
      const orphan = chapters.filter(ch => !sortedVols.some(v => v.id === ch.volumeId));
      if (orphan.length) body += renderChapters(orphan);
    } else {
      body += renderChapters(chapters);
    }
  }

  return renderDocument({
    docTitle: t('deliverables.docSynopsis'),
    projectName: project.name ?? '',
    bodyHtml: body, t, lang,
  });
}

// ── Checklist des amorces non résolues ────────────────────────────────────────

export function buildOpenPlantsChecklist(payload, t, lang) {
  const { project = {}, plantPayoffs = [], volumes = [] } = payload;
  const volMap = Object.fromEntries(volumes.map(v => [v.id, v.title]));

  // Une amorce est « en attente » si elle n'est pas marquée résolue et n'a pas
  // de payoff défini. Le seed utilise status 'open' / 'resolved' (cf. dashboard
  // qui filtre sur 'open') ; on accepte aussi 'closed' par prudence.
  const isResolved = (p) =>
    p.status === 'resolved' || p.status === 'closed' ||
    p.payoff_chapter_num != null || p.payoff_event_id != null;
  const open = plantPayoffs
    .filter(p => !isResolved(p))
    .sort((a, b) => (a.plant_chapter_num ?? 1e9) - (b.plant_chapter_num ?? 1e9));

  let body;
  if (!open.length) {
    body = `<hr class="rule"><p class="none">${esc(t('deliverables.emptyPlants'))}</p>`;
  } else {
    body = `<p class="count">${esc(t('deliverables.countPlants', { count: open.length }))}</p><hr class="rule"><ul class="check">`;
    for (const p of open) {
      const meta = [];
      if (p.type) meta.push(esc(p.type));
      if (p.plant_chapter_num != null) {
        const vol = p.plant_volume_id && volMap[p.plant_volume_id] ? ` (${esc(volMap[p.plant_volume_id])})` : '';
        meta.push(esc(t('deliverables.plantPosed', { n: p.plant_chapter_num })) + vol);
      }
      body += `<li>
        <span class="box">☐</span>
        <span><span class="lbl">${esc(p.label)}</span>
        ${meta.length ? `<span class="meta">${meta.join(' · ')}</span>` : ''}
        ${p.notes ? `<span class="meta">${esc(p.notes)}</span>` : ''}</span>
      </li>`;
    }
    body += '</ul>';
  }

  return renderDocument({
    docTitle: t('deliverables.docOpenPlants'),
    projectName: project.name ?? '',
    bodyHtml: body, t, lang,
  });
}
