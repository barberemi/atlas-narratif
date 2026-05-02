## ─────────────────────────────────────────────────────────────
##  Atlas Narratif — Makefile
##  Tout passe par Docker — aucune commande locale.
## ─────────────────────────────────────────────────────────────

DC = docker compose -f docker-compose.dev-full.yml
DC_PROD = docker compose -f docker-compose.prod.yml --env-file .env.prod

# ── Dev ───────────────────────────────────────────────────────

## Lance toute la stack dev en arrière-plan (PostgreSQL + API + Frontend)
dev:
	$(DC) up -d

## Arrête la stack dev
stop:
	$(DC) down

## Logs de tous les services dev
logs:
	$(DC) logs -f

## Logs d'un service précis  (ex: make logs-s s=frontend)
logs-s:
	$(DC) logs -f $(s)

## Rebuild et relance la stack dev (utile après un changement de dépendances)
dev-rebuild:
	$(DC) up -d --build

# ── Qualité (dans les containers) ────────────────────────────

## Lance le linter (dans le container frontend)
lint:
	$(DC) exec frontend npx eslint .

## Lint avec auto-fix
lint-do:
	$(DC) exec frontend npx eslint . --fix

## Lance les tests (dans le container frontend)
test:
	$(DC) exec frontend npx vitest run

## Tests serveur (dans le container API)
server-test:
	$(DC) exec api sh -c 'node --test src/**/*.test.js'

## Tests E2E Playwright (dans le container e2e)
e2e:
	$(DC) run --rm e2e npx playwright test --reporter=list

## Tests E2E — un seul fichier  (ex: make e2e-file f=e2e/smoke.spec.js)
e2e-file:
	$(DC) run --rm e2e npx playwright test $(f) --reporter=list

## Build de production (dans le container frontend)
build:
	$(DC) exec frontend npm run build

# ── Dépendances (dans les containers) ────────────────────────

## npm install côté frontend
install:
	$(DC) exec frontend npm install

## npm install côté API
server-install:
	$(DC) exec api npm install

## Ajouter un package côté API  (ex: make server-add p=zod)
server-add:
	$(DC) exec api npm install $(p)

## Ajouter un package côté frontend  (ex: make add p=zustand)
add:
	$(DC) exec frontend npm install $(p)

# ── Prod (VPS) ────────────────────────────────────────────────

## Build et démarre la stack prod complète
prod-up:
	$(DC_PROD) up -d --build

## Arrête la stack prod (sans toucher aux volumes)
prod-down:
	$(DC_PROD) down

## État des services prod
prod-ps:
	$(DC_PROD) ps

## Logs de la stack prod
prod-logs:
	$(DC_PROD) logs -f

## Logs d'un service prod  (ex: make prod-logs-s s=api)
prod-logs-s:
	$(DC_PROD) logs -f $(s)

## Redémarrer un service prod  (ex: make prod-restart s=api)
prod-restart:
	$(DC_PROD) restart $(s)

## Déploiement complet : pull + rebuild + health check + prune
prod-deploy:
	@echo "── Pull du code ──"
	git pull origin main
	@echo "── Build et redémarrage ──"
	$(DC_PROD) up -d --build --remove-orphans
	@echo "── Attente health check (5s) ──"
	@sleep 5
	@$(DC_PROD) exec api wget -qO- http://localhost:3001/api/health > /dev/null \
		&& echo "✓ Health check OK" \
		|| (echo "✗ Health check échoué" && exit 1)
	@echo "── Nettoyage images orphelines ──"
	docker image prune -f
	@echo "✓ Déploiement terminé"

## Health check de l'API prod
prod-health:
	@$(DC_PROD) exec api wget -qO- http://localhost:3001/api/health \
		&& echo "✓ API OK" \
		|| (echo "✗ API KO" && exit 1)

## Backup de la base prod
prod-backup:
	@mkdir -p backups
	docker exec $$($(DC_PROD) ps -q postgres) \
		pg_dump -U atlas atlas | gzip > backups/atlas_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "✓ Backup sauvegardé dans backups/"

## Restaurer un backup  (ex: make prod-restore f=backups/atlas_20260501.sql.gz)
prod-restore:
	@test -f "$(f)" || (echo "Usage: make prod-restore f=backups/atlas_XXXXXXXX.sql.gz" && exit 1)
	gunzip -c "$(f)" | docker exec -i $$($(DC_PROD) ps -q postgres) psql -U atlas atlas
	@echo "✓ Restauration terminée depuis $(f)"

.PHONY: dev stop logs logs-s dev-rebuild lint lint-do test server-test e2e e2e-file build install server-install server-add add prod-up prod-down prod-ps prod-logs prod-logs-s prod-restart prod-deploy prod-health prod-backup prod-restore
