# Charte éditoriale du blog — Atlas Narratif

Règles obligatoires pour tout article publié sur `/blog`. Générée sept. 2026, tenue à jour à chaque évolution.

## 🎯 Objectif de chaque article
Capter une **intention de recherche réelle** (SEO), apporter une vraie valeur au lecteur, puis **montrer l'outil** qui fait ce que l'article explique (CTA en fin, jamais en force). Le SEO paie en 3 à 6 mois : la qualité prime sur la quantité (rythme cible : 2 articles/mois).

## ✍️ Voix & ton
- **Tutoiement** systématique (registre atelier d'écriture).
- Personnalité : le pote scénariste érudit sur le craft (beats, arcs, amorces/paiements) mais jamais professoral.
- On parle **histoire** (« ton monde », « ta saga »), jamais **données** (« tes entrées »).
- L'anti-promesse identitaire : **l'outil structure, c'est toi qui écris**. Aucun texte généré à la place de l'auteur.

## ✅ Règles de forme (NON négociables)
1. **Pas de tiret cadratin `—` (em-dash).** C'est un marqueur « IA ». Le remplacer par un point, une virgule, deux-points, des parenthèses, ou reformuler. Idem pour le tiret demi-cadratin `–` en usage typographique de rupture.
2. **Un emoji par grande partie** (chaque titre de section `<h2>`), quand c'est pertinent et sobre. Pas d'emoji dans le corps de texte ni dans les `<h3>`. But : rythmer et rendre scannable, pas décorer à outrance.
3. **Des visuels dès que possible.** Chaque article vise **au moins un visuel** : image, capture annotée, schéma (SVG/CSS inline), GIF ou vidéo courte. Un diagramme inline (ex. structure en 3 actes) compte comme visuel et évite les assets manquants. Jamais de balise `<img>` cassée : si l'asset n'existe pas encore, utiliser un schéma inline ou un bloc illustré CSS.
4. **Métadonnées SEO complètes** : `meta_title` (≤ 60 car.), `meta_description` (≤ 155 car.), `slug` en kebab-case, date, temps de lecture, tags. Un `<h1>` unique, des `<h2>`/`<h3>` hiérarchisés.
5. **Français impeccable** : orthographe, typographie française (espaces insécables avant `: ; ? !`, guillemets « »), accords.

## 🔁 Relecture obligatoire (double passe)
Tout article, avant publication, **doit être relu par deux agents** :
1. **Agent « Expert Écriture de Blog »** (`ai/agents/blog-editor.md`) : SEO, structure, scannabilité, hook, CTA, respect de cette charte (tirets, emojis, visuels, méta).
2. **Agent « Écrivain »** (`ai/agents/writer.md`) : qualité de plume, cohérence de la voix, fluidité, justesse du craft narratif, français.

Les deux relectures sont **cumulatives** (pas l'une OU l'autre). L'article n'est publiable qu'après intégration des retours des deux. Consigner un court récap des retours dans la PR / le commit.

## 🧱 Structure type d'un article pilier
1. **Accroche empathique** (le moment de doute du lecteur).
2. **Pourquoi** (l'enjeu, désamorcer l'objection).
3. **Le cœur** (méthode, étapes, exemples tirés d'œuvres connues : Harry Potter, LOTR, Le Roi Lion, Star Wars).
4. **Cas saga / multi-tomes** quand pertinent (amorces & paiements, cohérence).
5. **Erreurs classiques** / **méthode pas-à-pas**.
6. **En résumé** + **CTA outil** (montrer, pas vendre).

## 🖼️ Images & captures annotées (workflow arrêté)
Convention pour illustrer un article. Objectif : des visuels qui **prouvent** que l'outil fait ce que le texte explique.

**Source privilégiée : captures réelles de l'app sur la démo LOTR** (`/demo` puis la vue concernée), pas des images génériques. Une capture par section-clé, reliée à ce que le paragraphe raconte :
- section Save the Cat → la **frise des beats** (`/savethecat`)
- section Voyage du Héros → la vue **`/heros`** (12 étapes en 3 phases)
- section saga / amorces → le **tracker d'amorces & paiements** (`/plants`) ou le **détecteur** (`/incoherences`)

**Annotations (obligatoires pour ce format) :** 1 à 2 par image, aux couleurs de marque (**vert `#5cae8e`**, **or `#cba15e`**), label + trait fin qui pointe l'élément.
- Le **trait est dessiné SOUS le label** (le label est repeint par-dessus) pour qu'aucun trait ne croise jamais le texte.
- Texte d'annotation court, orienté bénéfice, tutoiement.

**Capture (Chrome DevTools) :**
1. Ouvrir la démo, viewport desktop large (~1440), **masquer** le bandeau cookie et la bulle chat Crisp (les éléments `position:fixed`/`sticky` + tout ce qui matche `crisp`).
2. Injecter les annotations (overlay `position:fixed`, `z-index` élevé), vérifier qu'elles tiennent dans le cadre capturé (la hauteur réelle capturée est ~726 px CSS : placer les labels dans la moitié haute).
3. Screenshot PNG.

**Intégration :**
- Fichiers dans `public/blog/`, nommage kebab-case explicite (`save-the-cat-frise.png`…), **redimensionnés à ~1600 px de large** (≈ 250-400 Ko).
- Balisage : `<figure class="blog-figure"><img src="/blog/…png" alt="…" loading="lazy" /><figcaption>…</figcaption></figure>`.
- **`alt` descriptif** (SEO + accessibilité) ; **légende** en français avec la source (« démo LOTR »). Espaces insécables dans la légende visible (règle 5).
- Jamais d'`<img>` cassée : le fichier doit exister avant de committer.
- **Lightbox intégré** : toute image de `.blog-figure` est cliquable (agrandissement plein écran, fermeture clic/Échap) — géré par `BlogPostPage.jsx`, rien à ajouter par article.

**Style visuel :** les captures brutes de l'app sont sur fond charbon → elles s'intègrent naturellement au fond sombre de l'article. Le style `.blog-figure img` (carte + bordure) est déjà en place dans `src/index.css`.

## 🛠️ Implémentation technique
- Les articles vivent dans `src/data/blog/posts.js` (métadonnées + corps HTML first-party).
- Rendu : `/blog` (index) et `/blog/:slug` (article), pages publiques prérendues (`scripts/prerender.mjs`).
- Style de corps : classe `.prose-atlas` dans `src/index.css`.
- **Publication programmée** : le champ `date` fait office de date de sortie. Le garde-fou `isPublished` (`posts.js`) masque tout article dont la date n'est pas atteinte — index, prerender et sitemap. On peut donc committer les articles d'avance ; ils sortent à leur date. `draft: true` masque un article en toutes circonstances.
- **Sitemap** : généré au build (`getSitemapEntries` → `prerender.mjs`), articles publiés uniquement. Ne pas éditer les URLs d'articles à la main dans `public/sitemap.xml`.
- Logique couverte par `src/data/blog/posts.test.js`.
- Voir `ai/marketing/calendrier-editorial.md` pour le planning et le détail du garde-fou par date.
