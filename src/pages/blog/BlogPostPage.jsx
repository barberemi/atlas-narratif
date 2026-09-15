import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '../../data/blog/posts';
import { BlogNav, BlogFooter } from './BlogChrome';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return iso;
  }
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getPostBySlug(slug);

  // Lightbox : clic sur une image d'article → agrandissement plein écran
  const [zoom, setZoom] = useState(null);
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e) => { if (e.key === 'Escape') setZoom(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [zoom]);
  const handleProseClick = (e) => {
    const img = e.target.closest?.('.blog-figure img');
    if (img) setZoom({ src: img.getAttribute('src'), alt: img.getAttribute('alt') || '' });
  };

  if (!post) {
    return (
      <div className="h-screen overflow-hidden flex flex-col bg-atlas-ink text-slate-200">
        <title>Article introuvable · Atlas Narratif</title>
        <meta name="robots" content="noindex" />
        <BlogNav />
        <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-6">
          <div className="text-center">
            <p className="font-serif text-2xl text-atlas-text mb-3">Cet article n&rsquo;existe pas (encore).</p>
            <Link
              to="/blog"
              className="font-grotesk text-[12px] font-bold uppercase tracking-[0.12em] text-atlas-green hover:text-atlas-text transition-colors"
            >
              ← Retour au blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const url = `https://DOMAIN_PLACEHOLDER/blog/${post.slug}`;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.metaTitle || post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'fr',
    author: { '@type': 'Organization', name: 'Atlas Narratif' },
    publisher: {
      '@type': 'Organization',
      name: 'Atlas Narratif',
      logo: { '@type': 'ImageObject', url: 'https://DOMAIN_PLACEHOLDER/favicon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: 'https://DOMAIN_PLACEHOLDER/og-image.png',
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-atlas-ink text-slate-200">
      <title>{`${post.metaTitle || post.title} · Atlas Narratif`}</title>
      <meta name="description" content={post.description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="article" />
      <meta property="og:title" content={post.metaTitle || post.title} />
      <meta property="og:description" content={post.description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content="https://DOMAIN_PLACEHOLDER/og-image.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogNav />

      <div className="flex-1 min-h-0 overflow-y-auto">
        <article className="max-w-2xl mx-auto px-6 py-12 md:py-16">
          <header className="mb-10">
            <Link
              to="/blog"
              className="inline-block font-grotesk text-[11px] font-bold uppercase tracking-[0.12em] text-atlas-mute hover:text-atlas-text transition-colors mb-6"
            >
              ← Le blog
            </Link>
            <div className="text-4xl mb-4" aria-hidden="true">{post.emoji}</div>
            <h1
              className="font-serif font-semibold tracking-tight text-atlas-text mb-4"
              style={{ fontSize: 'clamp(2rem, 4.6vw, 3rem)', lineHeight: 1.08, textWrap: 'balance' }}
            >
              {post.title}
            </h1>
            <p className="font-grotesk text-[11px] font-bold uppercase tracking-[0.14em] text-atlas-mute">
              {formatDate(post.date)} · {post.readingTime} de lecture
            </p>
          </header>

          {/* Contenu first-party (voir ai/marketing/blog-guidelines.md) */}
          <div className="prose-atlas" onClick={handleProseClick} dangerouslySetInnerHTML={{ __html: post.html }} />
        </article>

        <BlogFooter />
      </div>

      {/* Lightbox */}
      {zoom && (
        <div
          onClick={() => setZoom(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image agrandie"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px', cursor: 'zoom-out',
          }}
        >
          <img
            src={zoom.src}
            alt={zoom.alt}
            style={{ maxWidth: '96vw', maxHeight: '92vh', borderRadius: 8, boxShadow: '0 8px 40px rgba(0,0,0,0.6)' }}
          />
          <button
            onClick={() => setZoom(null)}
            aria-label="Fermer"
            className="font-grotesk text-[11px] font-bold uppercase tracking-[0.12em]"
            style={{ position: 'fixed', top: 16, right: 20, color: 'var(--color-atlas-soft)', background: 'transparent' }}
          >
            Fermer ✕
          </button>
        </div>
      )}
    </div>
  );
}
