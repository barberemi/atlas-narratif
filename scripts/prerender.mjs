/**
 * Postbuild prerender script.
 *
 * Loads each public route via Vite SSR, renders it to HTML with
 * react-dom/server, and writes static index.html files to dist/.
 *
 * Replaces vite-plugin-html-prerender + Puppeteer (~300 MB of Chromium)
 * with zero extra dependencies.
 */
import { createServer } from 'vite';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const dist = join(root, 'dist');

const staticRoutes = ['/', '/login', '/register', '/privacy', '/terms', '/blog'];

// Vite dev server in middleware mode — just for JSX/ESM transform, no HTTP
const vite = await createServer({
  root,
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'warn',
  optimizeDeps: { noDiscovery: true },
});

try {
  const { render } = await vite.ssrLoadModule('/src/entry-prerender.jsx');
  const template = readFileSync(join(dist, 'index.html'), 'utf-8');

  // Articles de blog : slugs importés depuis le registre pour rester synchro.
  // `blogSlugs` et `getSitemapEntries` n'incluent que les articles publiés
  // (garde-fou par date dans posts.js) — les articles programmés entrent au
  // build suivant leur date de publication.
  const { blogSlugs, getSitemapEntries } = await vite.ssrLoadModule(
    '/src/data/blog/posts.js',
  );
  const blogRoutes = blogSlugs.map((slug) => `/blog/${slug}`);
  const routes = [...staticRoutes, ...blogRoutes];

  console.log('Prerendering public pages...');

  for (const route of routes) {
    try {
      const html = render(route);
      const page = template.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`,
      );

      if (route === '/') {
        writeFileSync(join(dist, 'index.html'), page);
      } else {
        const outDir = join(dist, route.slice(1));
        mkdirSync(outDir, { recursive: true });
        writeFileSync(join(outDir, 'index.html'), page);
      }
      console.log(`  \u2713 ${route}`);
    } catch (err) {
      console.warn(`  \u2717 ${route} — skipped (${err.message})`);
    }
  }

  // Sitemap : injecter les articles publiés (gate par date au build) dans le
  // sitemap statique copié par Vite. DOMAIN_PLACEHOLDER reste (remplacé par
  // nginx au démarrage du conteneur).
  try {
    const sitemapPath = join(dist, 'sitemap.xml');
    const base = readFileSync(sitemapPath, 'utf-8');
    const entries = getSitemapEntries();
    const blogUrls = entries
      .map(
        ({ slug, date }) =>
          `  <url>\n    <loc>https://DOMAIN_PLACEHOLDER/blog/${slug}</loc>\n    <lastmod>${date}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`,
      )
      .join('\n');
    const merged = blogUrls
      ? base.replace('</urlset>', `${blogUrls}\n</urlset>`)
      : base;
    writeFileSync(sitemapPath, merged);
    console.log(`  ✓ sitemap.xml (${entries.length} article(s) publié(s))`);
  } catch (err) {
    console.warn(`  ✗ sitemap.xml — skipped (${err.message})`);
  }

  console.log('Prerender done.');
} finally {
  await vite.close();
}
