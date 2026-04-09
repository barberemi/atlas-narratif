## ─────────────────────────────────────────────────────────────
##  Atlas Narratif — Makefile
##  Raccourcis pour le développement local
## ─────────────────────────────────────────────────────────────

# ── Dev ───────────────────────────────────────────────────────

## Lance toute la stack dev en arrière-plan (PostgreSQL + API + Frontend)
dev:
	docker compose -f docker-compose.dev-full.yml up -d

## Arrête la stack dev
stop:
	docker compose -f docker-compose.dev-full.yml down

## Logs de tous les services dev
logs:
	docker compose -f docker-compose.dev-full.yml logs -f

## Logs d'un service précis  (ex: make logs-s s=frontend)
logs-s:
	docker compose -f docker-compose.dev-full.yml logs -f $(s)

## Rebuild et relance la stack dev (utile après un changement de dépendances)
dev-rebuild:
	docker compose -f docker-compose.dev-full.yml up -d --build

# ── Qualité ───────────────────────────────────────────────────

## Lance le linter
lint:
	npm run lint

## Lance les tests
test:
	npm run test:run

## Build de production (frontend uniquement)
build:
	npm run build

# ── Prod (VPS) ────────────────────────────────────────────────

## Build et démarre la stack prod complète
prod-up:
	docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build

## Arrête la stack prod
prod-down:
	docker compose -f docker-compose.prod.yml --env-file .env.prod down

## Logs de la stack prod
prod-logs:
	docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f

## Backup de la base prod
prod-backup:
	docker exec $$(docker compose -f docker-compose.prod.yml --env-file .env.prod ps -q postgres) \
		pg_dump -U atlas atlas | gzip > backups/atlas_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "Backup sauvegardé dans backups/"

.PHONY: dev stop logs logs-s dev-rebuild lint test build prod-up prod-down prod-logs prod-backup
