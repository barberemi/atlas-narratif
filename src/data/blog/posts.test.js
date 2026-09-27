import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
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

describe('blog — conformité à la charte (ai/marketing/blog-guidelines.md)', () => {
  const publicDir = resolve(process.cwd(), 'public');

  it('chaque image référencée existe dans public/ (aucune <img> cassée)', () => {
    for (const p of posts) {
      for (const [, src] of p.html.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        expect(existsSync(publicDir + src), `${p.slug} : ${src}`).toBe(true);
      }
    }
  });

  it('metaTitle ≤ 60 car., description ≤ 155 car.', () => {
    for (const p of posts) {
      expect(p.metaTitle.length, p.slug).toBeLessThanOrEqual(60);
      expect(p.description.length, p.slug).toBeLessThanOrEqual(155);
    }
  });

  it('aucun tiret cadratin ni demi-cadratin', () => {
    for (const p of posts) {
      expect(/[\u2013\u2014]/.test(p.title + p.description + p.excerpt + p.html), p.slug).toBe(false);
    }
  });

  it('les liens internes /blog/<slug> pointent vers un article existant', () => {
    const slugs = new Set(posts.map((p) => p.slug));
    for (const p of posts) {
      for (const [, slug] of p.html.matchAll(/href="\/blog\/([a-z0-9-]+)"/g)) {
        expect(slugs.has(slug), `${p.slug} → ${slug}`).toBe(true);
      }
    }
  });
});
