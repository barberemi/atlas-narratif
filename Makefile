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

prod-up: ## Build + démarrer la stack prod
	@echo "🔥 Démarrage de la stack prod…"
	$(DC_PROD) up -d --build

prod-down: ## Arrêter la stack prod
	@echo "🛑 Arrêt de la stack prod…"
	$(DC_PROD) down

prod-deploy: ## Déploiement complet (pull → build → health → prune)
	@echo ""
	@echo "🚀 \033[1mDéploiement Atlas Narratif\033[0m"
	@echo "\033[2m───────────────────────────────\033[0m"
	@echo ""
	@echo "📥 Pull du code…"
	git pull origin main
	@echo ""
	@echo "🔨 Build et redémarrage…"
	$(DC_PROD) up -d --build --remove-orphans
	@echo ""
	@echo "⏳ Health check…"
	@sleep 5
	@$(DC_PROD) exec api wget -qO- http://localhost:3001/api/health > /dev/null \
		&& echo "✅ API OK" \
		|| (echo "❌ Health check échoué" && exit 1)
	@echo ""
	@echo "🧹 Nettoyage images orphelines…"
	docker image prune -f
	@echo ""
	@echo "\033[32m\033[1m✅ Déploiement terminé\033[0m"
	@echo ""

prod-ps: ## État des services
	$(DC_PROD) ps

prod-logs: ## Logs de la stack prod
	$(DC_PROD) logs -f

prod-logs-s: ## Logs d'un service prod (s=…)
	$(DC_PROD) logs -f $(s)

prod-restart: ## Redémarrer un service (s=…)
	$(DC_PROD) restart $(s)

prod-health: ## Health check de l'API
	@$(DC_PROD) exec api wget -qO- http://localhost:3001/api/health \
		&& echo "✅ API OK" \
		|| (echo "❌ API KO" && exit 1)

prod-backup: ## Backup de la base PostgreSQL
	@mkdir -p backups
	docker exec $$($(DC_PROD) ps -q postgres) \
		pg_dump -U atlas atlas | gzip > backups/atlas_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Backup sauvegardé dans backups/"

prod-restore: ## Restaurer un backup (f=…)
	@test -f "$(f)" || (echo "Usage: make prod-restore f=backups/atlas_XXXXXXXX.sql.gz" && exit 1)
	gunzip -c "$(f)" | docker exec -i $$($(DC_PROD) ps -q postgres) psql -U atlas atlas
	@echo "✅ Restauration terminée depuis $(f)"

.PHONY: help dev stop logs logs-s dev-rebuild lint lint-do test server-test e2e e2e-file build install server-install server-add add prod-up prod-down prod-ps prod-logs prod-logs-s prod-restart prod-deploy prod-health prod-backup prod-restore
