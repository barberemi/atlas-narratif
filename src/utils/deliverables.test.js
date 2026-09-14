import { describe, it, expect } from 'vitest';
import { buildCharacterBible, buildSynopsis, buildOpenPlantsChecklist } from './deliverables';

// Fake t : renvoie la clé + les options, suffisant pour vérifier la logique
// (sélection des données, échappement, structure) sans dépendre d'i18next.
const t = (k, o) => (o ? `${k} ${JSON.stringify(o)}` : k);

function payload(over = {}) {
  return {
    project: { name: 'Mon Roman' },
    volumes: [], characters: [], groups: [], characterGroups: [],
    stcChapters: [], timelineEvents: [], plantPayoffs: [],
    ...over,
  };
}

describe('buildCharacterBible', () => {
  it('inclut le nom, le rôle et la description du personnage', () => {
    const html = buildCharacterBible(payload({
      characters: [{ id: 'c1', name: 'Frodo', role: 'Protagoniste', race: 'Hobbit', description: 'Porteur de l’Anneau' }],
    }), t, 'fr');
    expect(html).toContain('Frodo');
    expect(html).toContain('Protagoniste');
    expect(html).toContain('Porteur de l’Anneau');
    expect(html).toContain('deliverables.docCharacterBible');
  });

  it('échappe le HTML dans les champs utilisateur', () => {
    const html = buildCharacterBible(payload({
      characters: [{ id: 'c1', name: '<script>alert(1)</script>' }],
    }), t, 'fr');
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('parse les alias/traits stockés en JSON string', () => {
    const html = buildCharacterBible(payload({
      characters: [{ id: 'c1', name: 'Aragorn', aliases: '["Grand-Pas","Elessar"]', traits: '["courageux"]' }],
    }), t, 'fr');
    expect(html).toContain('Grand-Pas');
    expect(html).toContain('Elessar');
    expect(html).toContain('courageux');
  });

  it('résout les groupes via characterGroups', () => {
    const html = buildCharacterBible(payload({
      characters: [{ id: 'c1', name: 'Gimli' }],
      groups: [{ id: 'g1', name: 'La Communauté' }],
      characterGroups: [{ character_id: 'c1', group_id: 'g1' }],
    }), t, 'fr');
    expect(html).toContain('La Communauté');
  });

  it('affiche un état vide sans personnage', () => {
    const html = buildCharacterBible(payload(), t, 'fr');
    expect(html).toContain('deliverables.emptyCharacters');
  });
});

describe('buildSynopsis', () => {
  it('rend les chapitres STC avec leur résumé', () => {
    const html = buildSynopsis(payload({
      stcChapters: [{ id: 's1', number: 1, title: 'Le Départ', summary: 'Frodo quitte la Comté', volume_id: null }],
    }), t, 'fr');
    expect(html).toContain('Le Départ');
    expect(html).toContain('Frodo quitte la Comté');
  });

  it('regroupe par tome quand il y a plusieurs volumes', () => {
    const html = buildSynopsis(payload({
      volumes: [{ id: 'v1', number: 1, title: 'La Communauté' }, { id: 'v2', number: 2, title: 'Les Deux Tours' }],
      stcChapters: [
        { id: 's2', number: 10, title: 'Fangorn', summary: 'x', volume_id: 'v2' },
        { id: 's1', number: 1,  title: 'La Comté', summary: 'y', volume_id: 'v1' },
      ],
    }), t, 'fr');
    expect(html).toContain('La Communauté');
    expect(html).toContain('Les Deux Tours');
    // Le tome 1 (La Comté) apparaît avant le tome 2 (Fangorn)
    expect(html.indexOf('La Comté')).toBeLessThan(html.indexOf('Fangorn'));
  });

  it('se rabat sur la timeline si aucun chapitre STC', () => {
    const html = buildSynopsis(payload({
      timelineEvents: [{ id: 'e1', chapter_num: 1, chapter_title: 'Bree', title: 'Rencontre à l’auberge', scene_order: 0 }],
    }), t, 'fr');
    expect(html).toContain('Bree');
    expect(html).toContain('Rencontre à l’auberge');
  });

  it('affiche un état vide sans chapitre', () => {
    expect(buildSynopsis(payload(), t, 'fr')).toContain('deliverables.emptyChapters');
  });
});

describe('buildOpenPlantsChecklist', () => {
  it('ne garde que les amorces non résolues (status open, sans payoff)', () => {
    const html = buildOpenPlantsChecklist(payload({
      plantPayoffs: [
        { id: 'p1', label: 'Amorce ouverte',  status: 'open',     plant_chapter_num: 2 },
        { id: 'p2', label: 'Amorce résolue',  status: 'resolved', plant_chapter_num: 3 },
        { id: 'p3', label: 'Amorce fermée',   status: 'closed',   plant_chapter_num: 4 },
      ],
    }), t, 'fr');
    expect(html).toContain('Amorce ouverte');
    expect(html).not.toContain('Amorce résolue');
    expect(html).not.toContain('Amorce fermée');
  });

  it('exclut une amorce qui a un payoff défini même si status open', () => {
    const html = buildOpenPlantsChecklist(payload({
      plantPayoffs: [{ id: 'p1', label: 'Déjà payée', status: 'open', plant_chapter_num: 1, payoff_chapter_num: 5 }],
    }), t, 'fr');
    expect(html).not.toContain('Déjà payée');
    expect(html).toContain('deliverables.emptyPlants');
  });

  it('traite un status absent sans payoff comme ouvert', () => {
    const html = buildOpenPlantsChecklist(payload({
      plantPayoffs: [{ id: 'p1', label: 'Sans statut', plant_chapter_num: 1 }],
    }), t, 'fr');
    expect(html).toContain('Sans statut');
  });

  it('trie par chapitre de pose', () => {
    const html = buildOpenPlantsChecklist(payload({
      plantPayoffs: [
        { id: 'p1', label: 'Tardive', status: 'open', plant_chapter_num: 9 },
        { id: 'p2', label: 'Précoce', status: 'open', plant_chapter_num: 1 },
      ],
    }), t, 'fr');
    expect(html.indexOf('Précoce')).toBeLessThan(html.indexOf('Tardive'));
  });

  it('affiche un état vide quand tout est résolu', () => {
    const html = buildOpenPlantsChecklist(payload({
      plantPayoffs: [{ id: 'p1', label: 'x', status: 'resolved', payoff_chapter_num: 2 }],
    }), t, 'fr');
    expect(html).toContain('deliverables.emptyPlants');
  });
});
