# Atlas Narratif — Guide de mise en production

## 1. Prérequis

- Un VPS Linux (Ubuntu 22.04+ recommandé), minimum 1 vCPU / 1 Go RAM
- Un domaine pointant vers l'IP du VPS (enregistrement A dans ton DNS)
- Accès SSH root ou sudo sur le VPS

---

## 2. Setup initial du VPS (une seule fois)

### Installer Docker + Git

```bash
# Docker
curl -fsSL https://get.docker.com | sh
# Ajouter ton user au groupe docker (évite le sudo)
usermod -aG docker $USER
newgrp docker

# Git
apt install -y git
```

### Créer un user dédié au déploiement (optionnel mais recommandé)

```bash
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
su - deploy
```

### Générer une clé SSH pour GitHub Actions

```bash
ssh-keygen -t ed25519 -C "github-actions-atlas" -f ~/.ssh/github_actions -N ""
# Autoriser cette clé à se connecter
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
# Afficher la clé privée → à copier dans GitHub Secrets
cat ~/.ssh/github_actions
```

### Cloner le repo

```bash
git clone git@github.com:<ton-org>/atlas-narratif.git /srv/atlas-narratif
cd /srv/atlas-narratif
```

### Créer le dossier de backups

```bash
mkdir -p /srv/atlas-narratif/backups
```

---

## 3. Fichier `.env.prod` sur le VPS

Créer `/srv/atlas-narratif/.env.prod` (ne jamais committer ce fichier) :

```env
# Domaine
DOMAIN=atlas.monsite.fr
ACME_EMAIL=toi@email.com

# PostgreSQL
POSTGRES_PASSWORD=un-mot-de-passe-long-et-random

# Better Auth
BETTER_AUTH_SECRET=une-chaine-random-min-32-chars

# Email (Resend) — optionnel
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@monsite.fr

# Google OAuth — optionnel
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Générer des secrets aléatoires :
```bash
openssl rand -base64 32
```

---

## 4. Secrets GitHub Actions

Dans GitHub → **Settings → Secrets and variables → Actions → New repository secret** :

| Secret | Valeur |
|---|---|
| `VPS_HOST` | IP ou domaine du VPS |
| `VPS_USER` | user SSH (ex: `deploy` ou `ubuntu`) |
| `VPS_SSH_KEY` | contenu de `~/.ssh/github_actions` (clé privée) |
| `DOMAIN` | ton domaine (ex: `atlas.monsite.fr`) |

---

## 5. Premier lancement manuel

Sur le VPS, une seule fois pour initialiser :

```bash
cd /srv/atlas-narratif
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Vérifier que tout tourne :
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod ps
```

---

## 6. SEO — Remplacer le placeholder domaine

Après avoir choisi ton domaine, remplacer `DOMAIN_PLACEHOLDER` par le vrai domaine dans :

```bash
sed -i 's|DOMAIN_PLACEHOLDER|atlas.monsite.fr|g' index.html public/robots.txt public/sitemap.xml
```

Fichiers concernés : `index.html` (canonical, OG, Twitter, JSON-LD), `public/robots.txt` (Sitemap), `public/sitemap.xml` (loc).

---

## 7. Vérifications post-déploiement

```bash
# Logs en direct
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Health check API
curl -sf https://atlas.monsite.fr/api/health

# Certificat TLS Let's Encrypt (peut prendre 1-2 min au premier lancement)
curl -vI https://atlas.monsite.fr 2>&1 | grep "SSL certificate"
```

---

## 8. Backup manuel

```bash
# Dump complet
docker compose -f docker-compose.prod.yml --env-file .env.prod \
  exec postgres pg_dump -U atlas atlas \
  | gzip > backups/atlas_$(date +%Y%m%d_%H%M%S)_manual.sql.gz
```

### Restaurer depuis un backup

```bash
gunzip -c backups/atlas_XXXXXXXX.sql.gz | \
  docker compose -f docker-compose.prod.yml --env-file .env.prod \
  exec -T postgres psql -U atlas atlas
```

### Backup automatique quotidien (cron)

```bash
crontab -e
# Ajouter :
0 3 * * * cd /srv/atlas-narratif && docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T postgres pg_dump -U atlas atlas | gzip > backups/atlas_$(date +\%Y\%m\%d).sql.gz && find backups -name "*.sql.gz" -mtime +7 -delete
```

---

## 9. Déployer manuellement (sans GitHub Actions)

```bash
cd /srv/atlas-narratif
git pull origin main
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build --remove-orphans
docker image prune -f
```

---

## 10. Commandes utiles au quotidien

```bash
# Voir l'état des services
make prod-logs   # ou :
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

# Redémarrer un service sans downtime
docker compose -f docker-compose.prod.yml --env-file .env.prod restart api

# Arrêter proprement (sans supprimer les volumes)
make prod-down

# ⚠ NE JAMAIS faire en prod :
# docker compose down -v       → supprime la base de données
# docker system prune -v       → supprime les volumes inutilisés
```

---

## 11. Flux automatisé (une fois GitHub Actions configuré)

```
git push → CI (lint + tests + build) → merge main → deploy.yml :
  1. Backup pg_dump
  2. git pull
  3. docker compose up -d --build
  4. Health check
  5. docker image prune
```

Tout merge sur `main` déclenche un déploiement automatique.
