import { describe, it, expect } from 'vitest';
import { posts, isPublished, getAllPosts, getSitemapEntries } from './posts';

describe('blog — garde-fou de publication (isPublished)', () => {
  const base = { slug: 's', date: '2026-10-06' };

  it('publie un article dont la date est atteinte', () => {
    expect(isPublished(base, '2026-10-06')).toBe(true); // le jour même
    expect(isPublished(base, '2026-10-07')).toBe(true); // après
  });

  it('masque un article programmé (date future)', () => {
    expect(isPublished(base, '2026-10-05')).toBe(false);
  });

  it('masque un brouillon même si la date est atteinte', () => {
    expect(isPublished({ ...base, draft: true }, '2026-12-01')).toBe(false);
  });
});

describe('blog — registre des articles', () => {
  it('chaque article a les champs requis et une date ISO', () => {
    for (const p of posts) {
      expect(p.slug).toMatch(/^[a-z0-9-]+$/);
      expect(p.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(typeof p.title).toBe('string');
      expect(typeof p.html).toBe('string');
    }
  });

  it('les slugs sont uniques', () => {
    const slugs = posts.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("getAllPosts n'expose que des articles publiés, triés du plus récent au plus ancien", () => {
    const list = getAllPosts();
    const today = new Date().toISOString().slice(0, 10);
    for (const p of list) expect(p.date <= today).toBe(true);
    const dates = list.map((p) => p.date);
    expect([...dates].sort((a, b) => (a < b ? 1 : -1))).toEqual(dates);
  });

  it('getSitemapEntries est aligné sur getAllPosts (mêmes slugs publiés)', () => {
    const sitemap = new Set(getSitemapEntries().map((e) => e.slug));
    const index = new Set(getAllPosts().map((p) => p.slug));
    expect(sitemap).toEqual(index);
  });
});
