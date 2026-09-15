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
  const { blogSlugs } = await vite.ssrLoadModule('/src/data/blog/posts.js');
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

  console.log('Prerender done.');
} finally {
  await vite.close();
}
