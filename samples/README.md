# Jeux de données d'exemple

Datasets prêts à réimporter dans Atlas Narratif — utiles pour explorer l'outil ou
faire une démo sans repartir de zéro.

## `harry-potter-tome1.json` — Harry Potter, Tome 1 « À l'école des sorciers »

Jeu de données riche illustrant toutes les vues : 14 personnages, 8 lieux, 8 objets
(avec champs custom), 3 types custom (Maison, Sortilège, Créature) + 13 entités custom,
15 scènes → timeline, 8 chapitres → Save the Cat, 3 fils narratifs, 17 relations.

### Comment le réimporter

1. Page d'accueil → carte **« 02 J'ai un texte à analyser »** → **IMPORTER**.
2. Onglet **② Importer le résultat**.
3. Renseigner un **nom de projet** (ex. « Harry Potter — Tome 1 »).
4. Choisir le fichier `samples/harry-potter-tome1.json`.
5. **Importer le projet →**.

Le fichier suit le format de sortie du prompt d'analyse (`src/data/analysis_prompt.js`),
donc il passe par le même pipeline que n'importe quel export d'IA.

### Régénérer le fichier

La source de vérité est le module `src/data/hp_seed_data.js`. Pour régénérer le JSON
après une modification du module :

```bash
docker compose -f docker-compose.dev-full.yml exec frontend node samples/gen-hp-json.mjs
```
