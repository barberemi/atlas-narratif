import { Link } from 'react-router-dom';
import { getAllPosts } from '../../data/blog/posts';
import { BlogNav, BlogFooter } from './BlogChrome';

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-atlas-ink text-slate-200">
      <title>Le blog · Atlas Narratif</title>
      <meta
        name="description"
        content="Méthodes d'écriture, structure narrative, cohérence de saga : les guides d'Atlas Narratif pour construire ton roman sans étouffer ta plume."
      />
      <link rel="canonical" href="https://DOMAIN_PLACEHOLDER/blog" />

      <BlogNav />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-14 md:py-20">
          <header className="mb-12">
            <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.2em] text-atlas-green mb-4">
              Le blog
            </p>
            <h1
              className="font-serif font-semibold tracking-tight text-atlas-text mb-4"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 3.4rem)', lineHeight: 1.05 }}
            >
              Écrire avec une méthode
            </h1>
            <p className="font-serif text-atlas-soft leading-relaxed" style={{ fontSize: '1.15rem' }}>
              Des guides concrets sur la structure narrative, le craft et la cohérence des sagas.
              L&rsquo;outil structure, c&rsquo;est toi qui écris.
            </p>
          </header>

          <ul className="flex flex-col">
            {posts.map((post) => (
              <li key={post.slug} className="border-t border-atlas-line">
                <Link
                  to={`/blog/${post.slug}`}
                  className="group grid grid-cols-[3rem_1fr] md:grid-cols-[3.5rem_1fr_7rem] gap-x-5 gap-y-1 items-baseline py-7"
                >
                  <span className="text-3xl leading-none" aria-hidden="true">
                    {post.emoji}
                  </span>
                  <div>
                    <h2 className="font-serif text-xl md:text-2xl font-semibold text-atlas-text leading-snug transition-colors group-hover:text-atlas-green">
                      {post.title}
                    </h2>
                    <p className="text-sm text-atlas-soft font-serif leading-relaxed mt-1.5">
                      {post.excerpt}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="font-grotesk text-[10px] font-bold uppercase tracking-[0.1em] text-atlas-mute px-2 py-1 rounded"
                          style={{ border: '1px solid var(--color-atlas-line)' }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="col-start-2 md:col-start-3 font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute md:justify-self-end md:self-center whitespace-nowrap">
                    {post.readingTime}
                  </span>
                </Link>
              </li>
            ))}
            <li className="border-t border-atlas-line" />
          </ul>
        </div>

        <BlogFooter />
      </div>
    </div>
  );
}
