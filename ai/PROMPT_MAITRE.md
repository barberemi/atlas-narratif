# Prompt Maître — AtlasNarratif

Copiez-collez ce prompt au début d'une nouvelle session Claude Code pour lancer les agents.

---

## PROMPT À COPIER-COLLER

```
Je travaille sur AtlasNarratif, une application web d'aide à l'écriture narrative pour auteurs.
Le projet est dans /home/rbarbe/Sites/atlas-narratif.

Stack : React + Vite + TailwindCSS v4 + React Router v6. Données statiques dans src/data/. Pas de backend.

Objectif de l'application : aider les auteurs à gérer leur lore, visualiser les relations entre entités, suivre leur timeline narrative, détecter les incohérences, et analyser leur structure narrative (méthode Save the Cat).

Les instructions de chaque agent se trouvent dans /ai/agents/.
Les rapports doivent être écrits dans /ai/reports/.
La documentation doit être écrite dans /ai/docs/.

Lance les agents suivants EN PARALLÈLE, chacun avec son fichier d'instructions :

1. **Agent Cohérence** — lit /ai/agents/coherence.md, audite le code, écrit /ai/reports/coherence-report.md
2. **Agent Documentation** — lit /ai/agents/documentation.md, documente le projet, écrit dans /ai/docs/
3. **Agent Produit** — lit /ai/agents/product.md, analyse la valeur produit, écrit /ai/reports/product-report.md
4. **Agent Narratif** — lit /ai/agents/narrative.md, évalue la pertinence narrative, écrit /ai/reports/narrative-report.md
5. **Agent Migration Technique** — lit /ai/agents/tech-migration.md, conçoit la stratégie de migration vers SQLite multi-projet, écrit /ai/reports/tech-migration-report.md
6. **Agent Refactoring** — lit /ai/agents/refactoring.md, détecte les duplications et propose un plan de découpage en composants réutilisables, écrit /ai/reports/refactoring-report.md

Une fois tous les agents terminés, donne-moi un résumé consolidé des points les plus importants remontés par l'ensemble des agents.
```

---

## Agents disponibles

| Agent | Fichier instructions | Rapport de sortie |
|-------|---------------------|-------------------|
| Cohérence | `/ai/agents/coherence.md` | `/ai/reports/coherence-report.md` |
| Documentation | `/ai/agents/documentation.md` | `/ai/docs/*.md` |
| Produit | `/ai/agents/product.md` | `/ai/reports/product-report.md` |
| Narratif | `/ai/agents/narrative.md` | `/ai/reports/narrative-report.md` |
| Migration Technique | `/ai/agents/tech-migration.md` | `/ai/reports/tech-migration-report.md` |
| Refactoring | `/ai/agents/refactoring.md` | `/ai/reports/refactoring-report.md` |

## Quand utiliser ce prompt ?
- Après une session de développement importante pour faire le point
- Avant de démarrer une nouvelle phase fonctionnelle
- Quand tu te demandes si quelque chose manque ou si quelque chose est inutile
- Pour générer ou mettre à jour la documentation
