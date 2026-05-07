## ─────────────────────────────────────────────────────────────
##  Atlas Narratif — Makefile
##  Tout passe par Docker — aucune commande locale.
## ─────────────────────────────────────────────────────────────

.DEFAULT_GOAL := help

DC = docker compose -f docker-compose.dev-full.yml
DC_PROD = docker compose -f docker-compose.prod.yml --env-file .env.prod

# ── Aide ─────────────────────────────────────────────────────

help: ## 📖 Afficher cette aide
	@echo ""
	@echo "  \033[1m📖  Atlas Narratif\033[0m  \033[2m— Commandes disponibles\033[0m"
	@echo "  \033[2m─────────────────────────────────────────────────\033[0m"
	@awk 'BEGIN {FS = ":.*##"} \
		/^##@/ { printf "\n  \033[1m%s\033[0m\n", substr($$0, 5) } \
		/^[a-zA-Z0-9_-]+:.*## / { printf "  \033[36m%-24s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@echo ""
	@echo "  \033[2mTout passe par Docker — aucune commande locale.\033[0m"
	@echo ""

##@ 🚀 Développement

dev: ## Lancer la stack dev (PostgreSQL + API + Frontend)
	@echo "🚀 Lancement de la stack dev…"
	$(DC) up -d
	@echo "✅ Stack dev prête — http://localhost:5173"

stop: ## Arrêter la stack dev
	@echo "🛑 Arrêt de la stack dev…"
	$(DC) down

dev-rebuild: ## Rebuild + relance (après changement de dépendances)
	@echo "🔄 Rebuild de la stack dev…"
	$(DC) up -d --build

logs: ## Logs de tous les services
	$(DC) logs -f

logs-s: ## Logs d'un service précis (s=api)
	$(DC) logs -f $(s)

##@ 🧪 Qualité

lint: ## Lancer ESLint
	$(DC) exec frontend npx eslint .

lint-do: ## ESLint avec auto-fix
	$(DC) exec frontend npx eslint . --fix

test: ## Tests unitaires frontend (Vitest)
	$(DC) exec frontend npx vitest run

server-test: ## Tests unitaires API (node --test)
	$(DC) exec api sh -c 'node --test src/*.test.js src/**/*.test.js'

e2e: ## Tests E2E (Playwright)
	$(DC) run --rm e2e npx playwright test --reporter=list

e2e-file: ## Tests E2E — un seul fichier (f=…)
	$(DC) run --rm e2e npx playwright test $(f) --reporter=list

build: ## Build de production
	$(DC) exec frontend npm run build

##@ 📦 Dépendances

install: ## npm install côté frontend
	$(DC) exec frontend npm install

server-install: ## npm install côté API
	$(DC) exec api npm install

add: ## Ajouter un package frontend (p=…)
	$(DC) exec frontend npm install $(p)

server-add: ## Ajouter un package API (p=…)
	$(DC) exec api npm install $(p)

##@ 🔥 Production

prod-up: ## Build + démarrer la stack prod complète (premier lancement ou après prod-down)
	@echo "🔥 Démarrage de la stack prod…"
	$(DC_PROD) up -d --build

prod-down: ## Arrêter la stack prod
	@echo "🛑 Arrêt de la stack prod…"
	$(DC_PROD) down

prod-ps: ## État des services
	$(DC_PROD) ps

prod-logs: ## Logs de la stack prod
	$(DC_PROD) logs -f $(s)

## Déploiement blue-green zero downtime : pull + build + swap
prod-deploy:
	@echo "── Pull du code ──"
	git pull origin main
	@echo "── Build des images (services toujours en ligne) ──"
	$(DC_PROD) build
	@$(MAKE) _bg-swap s=api healthurl=http://127.0.0.1:3001/health
	@$(MAKE) _bg-swap s=frontend healthurl=http://127.0.0.1:80/
	@echo "── Nettoyage images orphelines ──"
	docker image prune -f
	@echo "✓ Déploiement zero-downtime terminé"

## Swap blue-green rapide (sans git pull) — pour modifs directes sur le VPS
prod-swap:
	@echo "── Build des images ──"
	$(DC_PROD) build
	@$(MAKE) _bg-swap s=api healthurl=http://127.0.0.1:3001/health
	@$(MAKE) _bg-swap s=frontend healthurl=http://127.0.0.1:80/
	@echo "✓ Swap terminé"

## Blue-green swap interne
_bg-swap:
	@echo "── [$(s)] Scale up (ancien + nouveau) ──"
	@old_id=$$($(DC_PROD) ps -q $(s)); \
	$(DC_PROD) up -d --no-build --no-deps --scale $(s)=2 --no-recreate; \
	echo "── [$(s)] Attente healthcheck nouveau container (max 60s) ──"; \
	new_id=$$($(DC_PROD) ps -q $(s) | grep -v "$$old_id"); \
	for i in $$(seq 1 30); do \
		docker exec $$new_id wget -qO- $(healthurl) > /dev/null 2>&1 && break; \
		[ $$i -eq 30 ] && echo "✗ [$(s)] Healthcheck échoué" && exit 1; \
		sleep 2; \
	done; \
	echo "✓ [$(s)] Nouveau container healthy"; \
        echo "── [$(s)] Attente routage Traefik (10s) ──"; \
        sleep 10; \
	echo "── [$(s)] Suppression ancien container ──"; \
	docker stop $$old_id && docker rm $$old_id; \
	$(DC_PROD) up -d --no-build --no-deps --scale $(s)=1 --no-recreate; \
	echo "✓ [$(s)] Swap terminé"

prod-health: ## Health check de l'API
	@$(DC_PROD) exec -T api wget -qO- http://127.0.0.1:3001/api/health \
		&& echo "✅ API OK" \
		|| (echo "❌ API KO" && exit 1)

prod-backup: ## Backup de la base PostgreSQL
	@mkdir -p backups
	docker exec $$($(DC_PROD) ps -q postgres) \
		pg_dump --clean --if-exists -U atlas atlas | gzip > backups/atlas_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Backup sauvegardé dans backups/"

prod-restore: ## Restaurer un backup (f=…)
	@test -f "$(f)" || (echo "Usage: make prod-restore f=backups/atlas_XXXXXXXX.sql.gz" && exit 1)
	gunzip -c "$(f)" | docker exec -i $$($(DC_PROD) ps -q postgres) psql -U atlas atlas
	@echo "✅ Restauration terminée depuis $(f)"

.PHONY: dev stop logs logs-s dev-rebuild lint lint-do test server-test e2e e2e-file build install server-install server-add add prod-up prod-down prod-logs prod-deploy prod-swap _bg-swap prod-health prod-backup prod-restore
