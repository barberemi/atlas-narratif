# Atlas Narratif — Guide de mise en production

---

## Partie 1 — Setup initial (one-shot)

Tout ce qui suit ne se fait **qu'une seule fois**, à la première mise en production.

### 1.1 Prérequis

- Un VPS Linux (Ubuntu 22.04+ recommandé), minimum 1 vCPU / 1 Go RAM
- Un domaine pointant vers l'IP du VPS (enregistrement DNS de type A)
- Accès SSH root ou sudo sur le VPS

### 1.2 Installer Docker + Git sur le VPS

```bash
# Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER
newgrp docker

# Git
apt install -y git

# Swap (4 Go) — filet de sécurité contre les OOM lors des builds Docker
fallocate -l 4G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

### 1.3 Créer un user dédié (optionnel mais recommandé)

```bash
useradd -m -s /bin/bash deploy
usermod -aG docker deploy
su - deploy
```

### 1.4 Clé SSH pour GitHub Actions

```bash
ssh-keygen -t ed25519 -C "github-actions-atlas" -f ~/.ssh/github_actions -N ""
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
# Afficher la clé privée → à copier dans GitHub Secrets
cat ~/.ssh/github_actions
```

### 1.5 Secrets GitHub Actions

Dans GitHub → **Settings → Secrets and variables → Actions → New repository secret** :

| Secret | Valeur                                          |
|---|-------------------------------------------------|
| `VPS_HOST` | IP ou domaine du VPS                            |
| `VPS_USER` | user SSH (ex: `truc`)                           |
| `VPS_SSH_KEY` | contenu de `~/.ssh/github_actions` (clé privée) |
| `DOMAIN` | ton domaine (ex: `atlas-narratif.com`)          |

### 1.6 Cloner le repo et configurer l'environnement

```bash
git clone git@github.com:<ton-org>/atlas-narratif.git /srv/atlas-narratif
cd /srv/atlas-narratif
mkdir -p backups
```

Créer `/srv/atlas-narratif/.env.prod` (**ne jamais committer ce fichier**) :

```env
# Domaine
DOMAIN=atlas.monsite.fr
ACME_EMAIL=toi@email.com

# PostgreSQL
POSTGRES_PASSWORD=un-mot-de-passe-long-et-random

# Better Auth (obligatoire, min 32 chars)
BETTER_AUTH_SECRET=une-chaine-random-min-32-chars

# Chiffrement au repos (recommandé)
# Chiffre les données narratives en base (AES-256-GCM)
# ⚠ CONSERVER CETTE CLÉ — sans elle, les données chiffrées sont irrécupérables
ATLAS_ENCRYPTION_KEY=une-cle-base64-32-bytes

# Traefik Dashboard — optionnel
# ⚠ Doubler chaque $ du hash → $2y → $$2y
TRAEFIK_DASHBOARD_AUTH=admin:$$2y$$05$$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (Resend) — optionnel
RESEND_API_KEY=re_xxxxxxxxxxxx
EMAIL_FROM=noreply@monsite.fr

# Google OAuth — optionnel
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Crisp (chat widget) — optionnel
VITE_CRISP_WEBSITE_ID=
```

Générer des secrets aléatoires :
```bash
# Secret Better Auth / Postgres / Encryption :
openssl rand -base64 32

# Credentials dashboard Traefik :
docker run --rm httpd:2-alpine htpasswd -nBb admin "mon-mot-de-passe"
# → Copier la sortie dans TRAEFIK_DASHBOARD_AUTH en doublant les $
```

### 1.7 Architecture réseau (Traefik)

Le trafic passe par deux proxies en chaîne :

```
Internet → Traefik (ports 80/443) → Nginx (port 80 interne) → API (port 3001)
                                          ↓
                                   fichiers statiques React
```

**Traefik v3.3** (mode Swarm) est le point d'entrée réseau. Il gère :
- **HTTPS automatique** via Let's Encrypt (HTTP challenge)
- **Redirection HTTP → HTTPS** automatique
- **Routage dynamique** via les labels Docker (pas de fichier de config externe)

Traefik découvre les services via le socket Docker et route le trafic selon les labels `traefik.*` définis dans `docker-compose.prod.yml`. Le service `frontend` et le dashboard Traefik sont exposés (`traefik.enable=true`), l'API reste interne.

#### Dashboard Traefik

Le dashboard est accessible à `https://traefik.<DOMAIN>` (ex : `https://traefik.atlas.monsite.fr`), protégé par BasicAuth.

**Prérequis DNS** : ajouter un enregistrement A pour `traefik.<DOMAIN>` pointant vers la même IP que `<DOMAIN>` (ou utiliser un wildcard `*.<DOMAIN>`).

Si `TRAEFIK_DASHBOARD_AUTH` est vide dans `.env.prod`, le dashboard reste inaccessible (Traefik retourne 401).

**Nginx** (dans le container `frontend`) gère :
- Le service des fichiers React (SPA fallback)
- Le proxy `/api/` et `/auth/` vers le service `api`
- Le rate limiting, les headers de sécurité, la compression gzip
- Le cache des assets (1 an pour `/assets/`, 1 jour pour `robots.txt` / `sitemap.xml`)

> Référence Traefik : https://doc.traefik.io/traefik/getting-started/docker/

### 1.8 Initialiser Docker Swarm

```bash
docker swarm init
```

Le VPS devient un manager Swarm à un seul nœud. C'est tout.

### 1.9 Premier lancement

```bash
cd /srv/atlas-narratif
make prod-up
```

Vérifier que tout tourne :
```bash
make prod-ps        # tous les services en 1/1
make prod-health
```

Le certificat TLS Let's Encrypt peut prendre 1-2 min au premier lancement :
```bash
curl -vI https://atlas.monsite.fr 2>&1 | grep "SSL certificate"
```

### 1.9 SEO — Domaine

Le remplacement de `DOMAIN_PLACEHOLDER` par le vrai domaine est **automatique** au démarrage du container frontend. L'entrypoint nginx (`docker/nginx-entrypoint.sh`) remplace le placeholder dans `index.html`, `robots.txt` et `sitemap.xml` en utilisant la variable `DOMAIN` du `.env.prod`.

Rien à faire manuellement.

### 1.10 Checklist avant ouverture

- [ ] **DNS dashboard Traefik** : enregistrement A pour `traefik.<DOMAIN>` → même IP que le domaine principal
- [ ] **Dashboard Traefik** : vérifier l'accès à `https://traefik.<DOMAIN>` (BasicAuth)
- [ ] **HSTS** : vérifier que `Strict-Transport-Security` est bien présent dans les headers de réponse (`curl -sI https://<DOMAIN>`) — le header est activé par défaut dans `nginx.prod.conf`
- [ ] **Rotation credentials** : révoquer et régénérer les clés Google OAuth / Resend si elles ont été partagées
- [ ] **CSP** : tester que la carte (tuiles OSM), les fonts et les styles inline fonctionnent — ajuster `Content-Security-Policy` dans `nginx.prod.conf` si besoin
- [x] **Pages légales (RGPD)** : placeholders remplis (Barbé Rémi, Lyon, atlas-narratif.com, OVHcloud)

### 1.11 Backup automatique quotidien (cron)

```bash
crontab -e
# Ajouter :
0 3 * * * cd /srv/atlas-narratif && make prod-backup && find backups -name "*.sql.gz" -mtime +7 -delete
```

---

## Partie 2 — Déploiements continus (GitHub Actions)

Une fois le setup initial terminé, chaque push sur `main` déclenche un déploiement automatique.

### 2.1 Flux automatisé (Swarm, near-zero downtime)

```
git push → CI (lint + tests + build + e2e) → merge main → deploy.yml :
  1. Backup pg_dump (--clean --if-exists)
  2. git pull
  3. docker compose build (images — services toujours en ligne)
  4. docker service update (rolling update par service, 2 replicas)
  5. docker image prune
```

**Near-zero downtime** : chaque service a 2 replicas. Swarm met à jour un replica à la fois (`parallelism: 1, order: stop-first`), l'autre continue de servir. Quelques requêtes peuvent voir une erreur de 2-3s pendant le swap.

Le workflow `.github/workflows/deploy.yml` se déclenche **uniquement** quand le CI (`.github/workflows/ci.yml`) passe avec succès sur `main`.

### 2.2 Déploiement manuel

Sur le VPS :

```bash
cd /srv/atlas-narratif
make prod-backup
make prod-deploy       # git pull + build + rolling update + prune
```

Pour des modifications faites directement sur le VPS (sans git pull) :

```bash
make prod-swap          # build + rolling update (sans git pull ni prune)
```

### 2.3 Quand utiliser `make prod-up` (stack deploy complet)

`make prod-deploy` et `make prod-swap` ne mettent à jour que l'API et le frontend. Si tu modifies la config de **Traefik** ou **PostgreSQL** (dans `docker-compose.prod.yml`), il faut un redéploiement complet de la stack :

```bash
set -a; . ./.env.prod; set +a; docker stack deploy -c docker-compose.prod.yml atlas
```

Cas nécessitant un stack deploy complet :
- Changement de version Traefik ou PostgreSQL
- Modification des labels/commandes Traefik
- Modification des limites mémoire/CPU
- Modification des variables d'environnement dans `.env.prod`

### 2.4 Commandes utiles au quotidien

| Commande | Action |
|----------|--------|
| `make prod-deploy` | Déploiement near-zero downtime (pull + build + rolling update + prune) |
| `make prod-swap` | Swap rapide (build + rolling update, sans pull) |
| `make prod-up` | Build + stack deploy complet (Traefik/Postgres inclus) |
| `make prod-ps` | État des services Swarm |
| `make prod-logs s=api` | Logs d'un service |
| `make prod-health` | Health check de l'API |
| `make prod-backup` | Backup BDD (gzip dans `backups/`) |
| `make prod-restore f=backups/atlas_XXX.sql.gz` | Restaurer un backup |
| `make prod-down` | Supprimer la stack (volumes conservés) |

### 2.4 Rollback

En cas de problème après un déploiement :

```bash
# 1. Revenir au commit précédent
cd /srv/atlas-narratif
git log --oneline -5           # identifier le bon commit
git checkout <commit-hash>

# 2. Rebuild + redéployer
make prod-up

# 3. Si besoin, restaurer la BDD
make prod-restore f=backups/atlas_XXXXXXXX_pre-deploy.sql.gz
```

### 2.5 Migration depuis Docker Compose (one-shot)

Si la stack tourne encore en mode Docker Compose :

```bash
make prod-backup                  # sauvegarder la BDD
docker compose -f docker-compose.prod.yml --env-file .env.prod down   # arrêter compose
docker swarm init                 # activer Swarm
git pull origin main              # récupérer les fichiers Swarm
make prod-up                      # déployer en mode Swarm
make prod-ps                      # vérifier : tous en 1/1
make prod-health                  # vérifier : API OK
```

Les volumes (`postgres_data`, `letsencrypt`) persistent. Aucune donnée perdue.

### 2.6 Dangers — ne jamais faire en prod

```bash
# ⚠ Supprime la base de données :
docker stack rm atlas && docker volume rm atlas_postgres_data

# ⚠ Supprime les volumes inutilisés (dont potentiellement les certifs TLS) :
docker system prune -v
```
