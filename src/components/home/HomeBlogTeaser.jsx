/**
 * Bloc « À lire » de la home : les trois derniers articles publiés.
 *
 * Tant qu'il n'y a pas d'utilisateurs à citer, les articles de fond sont le
 * substitut crédible au témoignage — et ils alimentent le maillage interne.
 *
 * ⚠️  `posts.js` pèse ~90 Ko (le corps HTML des articles est dans le module).
 *     Ce composant est donc chargé en différé depuis App.jsx pour qu'il parte
 *     dans son propre chunk et reste hors de la route d'accueil. Le prerender
 *     (HomePageSEO) l'importe directement : il a son propre bundle de build.
 */
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getAllPosts } from '../../data/blog/posts';

export default function HomeBlogTeaser() {
  const { t } = useTranslation();
  const posts = getAllPosts().slice(0, 3);
  if (!posts.length) return null;

  return (
    <section className="py-14 md:py-16" style={{ borderTop: '1px solid var(--color-atlas-line)' }}>
      <div
        className="flex items-center justify-between font-grotesk text-xs font-bold uppercase tracking-[0.2em] text-atlas-mute pb-3 mb-2"
        style={{ borderBottom: '1px solid var(--color-atlas-soft)' }}
      >
        <span>{t('home.readLabel')}</span>
        <Link to="/blog" className="transition-colors hover:text-atlas-green">
          {t('home.readAll')}
        </Link>
      </div>

      {posts.map((p) => (
        <Link
          key={p.slug}
          to={`/blog/${p.slug}`}
          className="group grid grid-cols-[2.5rem_1fr] md:grid-cols-[3rem_1fr_7rem] gap-x-5 gap-y-1 items-baseline py-6"
          style={{ borderBottom: '1px solid var(--color-atlas-line)' }}
        >
          <div className="text-xl leading-none" aria-hidden="true">{p.emoji}</div>
          <div>
            <h3 className="font-serif text-xl font-semibold text-atlas-text leading-snug transition-colors group-hover:text-atlas-green">
              {p.title}
            </h3>
            <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1">{p.excerpt}</p>
          </div>
          <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-mute whitespace-nowrap md:justify-self-end md:self-center">
            {p.readingTime}
          </span>
        </Link>
      ))}
    </section>
  );
}
