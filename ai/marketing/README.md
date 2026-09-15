# Marketing & communication — Atlas Narratif

Dossier des livrables marketing/comm produit (généré en collaboration IA, sept. 2026).

## Cadre retenu
- **Objectif 6 mois :** premier noyau d'utilisateurs actifs (activation + rétention).
- **Modèle :** gratuit pour l'instant.
- **Moyens :** solo, temps régulier, ~0 budget pub → tout en organique (contenu, communauté, SEO, product-led).
- **Accroche prioritaire :** « construire avec une méthode » (Save the Cat / Voyage du Héros). L'analyse de manuscrit = hook secondaire.

## Décisions de marque actées
- **Nom : « Atlas Narratif »** (deux mots), partout. EN : « Atlas Narrative ». ZH : 叙事图谱.
- **Ton : tutoiement** (registre atelier d'écriture / communautés d'auteurs).
- **Signature :** « L'atlas de ton roman. »
- **Titre héros (landing) :** « Structure ton roman. Garde ta plume. »
- **Value prop :** construis sur une vraie structure narrative, visualise ton histoire en entier, repère les incohérences avant tes lecteurs.

## Fichiers
| Fichier | Contenu |
|---------|---------|
| `blog-guidelines.md` | **Charte éditoriale du blog** (règles obligatoires : ton, pas de tiret cadratin, emoji par section, visuel, double relecture) |
| `calendrier-editorial.md` | **Planning 6 mois** (2 articles/mois, calé NaNoWriMo) + intentions SEO + canaux |
| `article-comment-structurer-un-roman.md` | Brouillon source du 1er article (converti et publié dans `src/data/blog/posts.js`) |
| `og-image-v2.html` / `.svg` / `.png` / `@2x.png` | Source + exports de l'OG image (charte actuelle) |
| `favicon-v2.svg` | Source du favicon (boussole, charte actuelle) |
| `assets-video-og-spec.md` | Script/storyboard vidéo démo (75 s + 15 s) + spec OG image |
| `og-image-variante-A.html` | Ancien gabarit OG (indigo, obsolète — gardé pour archive) |
| `da-brief.md` | Brief de direction artistique à transmettre à un freelance |

## Blog `/blog` (implémenté)
- Articles : `src/data/blog/posts.js` · Pages : `src/pages/blog/` · Style : `.prose-atlas` dans `src/index.css`.
- SEO : routes prérendues (`scripts/prerender.mjs`), `<title>`/`meta`/canonical/JSON-LD par page, `robots.txt` (autorise `/blog`) + `sitemap.xml` à jour.
- Relecture : agents `ai/agents/blog-editor.md` (Expert Écriture de Blog) + `ai/agents/writer.md` (Écrivain), obligatoires avant publication.

Le **plan complet à deux voix** (marketing growth + communication produit) est publié en artifact :
https://claude.ai/code/artifact/1dd733a2-f6b2-4e4d-a5cc-2b01e75adbcd

## Trois convictions
1. Le fossé = « le meilleur outil d'écriture structurée **en français**, gratuit ». Concurrents anglophones et payants.
2. La **démo partageable `/demo`** (implémentée) transforme chaque lien partagé en démonstration — sans mur d'inscription.
3. Viser **novembre (NaNoWriMo)** : le pic annuel où toute la cible planifie un roman.
