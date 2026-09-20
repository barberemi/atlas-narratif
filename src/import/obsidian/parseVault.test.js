import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';
import { parseVault, parseVaultZip, parseFrontmatter, extractWikilinks, extractInlineFields } from './parseVault';
import { mapToCanonical } from './mapToCanonical';
import { classifyType, mapField, fuzzyMatch } from './fieldMap';

// ── Fixtures : mini-vault synthétique ──────────────────────────────────────────
const VAULT = [
  {
    path: 'Personnages/Aragorn.md',
    content: `---
type: personnage
race: Homme
aliases: [Grands-Pas, Elessar]
---
Rôdeur du Nord, héritier d'Isildur. Ami de [[Gandalf]] et de [[Legolas]].
role:: Roi du Gondor
#personnage #dunedain`,
  },
  {
    path: 'Personnages/Gandalf.md',
    content: `---
type: personnage
race: Maia
---
Un magicien. Voyage avec [[Aragorn]].`,
  },
  {
    path: 'Lieux/Minas Tirith.md',
    content: `---
type: lieu
regime: Intendance
---
La cité blanche du Gondor.`,
  },
  {
    path: 'Langues/Quenya.md',
    content: `---
type: langue
famille: Eldarine
---
Le haut-elfique, langue de cérémonie.`,
  },
];

describe('parseFrontmatter', () => {
  it('sépare le frontmatter du corps et parse listes/scalaires', () => {
    const { frontmatter, body } = parseFrontmatter('---\ntype: perso\naliases: [A, B]\n---\nCorps.');
    expect(frontmatter.type).toBe('perso');
    expect(frontmatter.aliases).toEqual(['A', 'B']);
    expect(body.trim()).toBe('Corps.');
  });

  it('retourne le contenu brut sans frontmatter', () => {
    const { frontmatter, body } = parseFrontmatter('Juste du texte');
    expect(frontmatter).toEqual({});
    expect(body).toBe('Juste du texte');
  });
});

describe('extractWikilinks', () => {
  it('extrait cibles et alias', () => {
    expect(extractWikilinks('voir [[Cible]] et [[Autre|surnom]]')).toEqual([
      { target: 'Cible', alias: null },
      { target: 'Autre', alias: 'surnom' },
    ]);
  });
});

describe('extractInlineFields', () => {
  it('extrait les champs Dataview key:: value', () => {
    expect(extractInlineFields('role:: Roi\nautre:: valeur')).toEqual({ role: 'Roi', autre: 'valeur' });
  });
});

describe('fieldMap', () => {
  it('mappe des synonymes multilingues', () => {
    expect(mapField('nom')).toBe('name');
    expect(mapField('faction')).toBe('affiliations');
    expect(mapField('inconnu_xyz')).toBeNull();
  });
  it('classifie par type/tag/dossier', () => {
    expect(classifyType({ frontmatter: { type: 'personnage' } })).toBe('character');
    expect(classifyType({ tags: ['lieu'] })).toBe('location');
    expect(classifyType({ folder: 'Objets' })).toBe('object');
    expect(classifyType({ frontmatter: { type: 'langue' } })).toBeNull();
  });
  it('fuzzy tolère une faute de frappe', () => {
    expect(fuzzyMatch('name', 'nane')).toBe(true);
    expect(fuzzyMatch('name', 'xyzt')).toBe(false);
  });
});

describe('parseVaultZip', () => {
  it('lit les .md du zip et ignore les dossiers cachés', async () => {
    const zip = new JSZip();
    zip.file('Personnages/Aragorn.md', '---\ntype: personnage\nrace: Homme\n---\nRoi du Gondor.');
    zip.file('Lieux/Gondor.md', '---\ntype: lieu\n---\nRoyaume.');
    zip.file('.obsidian/app.json', '{}');
    const buf = await zip.generateAsync({ type: 'arraybuffer' });
    const notes = await parseVaultZip(buf);
    expect(notes).toHaveLength(2);
    expect(notes.map(n => n.title).sort()).toEqual(['Aragorn', 'Gondor']);
    expect(notes.find(n => n.title === 'Aragorn').frontmatter.race).toBe('Homme');
  });
});

describe('parseVault + mapToCanonical (bout en bout)', () => {
  const notes = parseVault(VAULT);
  const { data, report } = mapToCanonical(notes);

  it('parse toutes les notes markdown', () => {
    expect(notes).toHaveLength(4);
  });

  it('classe les entités dans le bon bucket', () => {
    expect(data.loreDB.characters.map(c => c.name).sort()).toEqual(['Aragorn', 'Gandalf']);
    expect(data.loreDB.locations.map(l => l.name)).toEqual(['Minas Tirith']);
    expect(data.customEntitiesDB.map(e => e.name)).toEqual(['Quenya']);
  });

  it('crée un type custom pour la langue', () => {
    expect(data.customTypesDB).toHaveLength(1);
    expect(data.customTypesDB[0].label).toBe('langue');
  });

  it('mappe les champs canoniques et range l\'inconnu en customFields', () => {
    const aragorn = data.loreDB.characters.find(c => c.name === 'Aragorn');
    expect(aragorn.race).toBe('Homme');
    expect(aragorn.aliases).toEqual(['Grands-Pas', 'Elessar']);
    expect(aragorn.role).toBe('Roi du Gondor'); // champ inline mappé
  });

  it('résout les wikilinks et signale les liens cassés', () => {
    // Aragorn → Gandalf (ok) + Legolas (absent du vault → cassé)
    const broken = report.brokenLinks.map(l => l.target);
    expect(broken).toContain('Legolas');
    expect(broken).not.toContain('Gandalf');
  });

  it('produit un rapport de comptage cohérent', () => {
    expect(report.counts).toMatchObject({ characters: 2, locations: 1, customEntities: 1, customTypes: 1 });
  });
});
