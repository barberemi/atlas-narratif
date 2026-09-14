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
	$(DC) exec api sh -c 'node --test $$(find src -name "*.test.js")'

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

##@ 🔥 Production (Docker Swarm)

STACK = atlas

prod-up: ## Build + déployer la stack Swarm
	@echo "🔥 Build des images…"
	$(DC_PROD) build
	@echo "🚀 Déploiement Swarm…"
	@set -a; . ./.env.prod; set +a; \
	docker stack deploy -c docker-compose.prod.yml $(STACK)
	@echo "✅ Stack déployée"

prod-down: ## Supprimer la stack Swarm
	@echo "🛑 Suppression de la stack…"
	docker stack rm $(STACK)

prod-deploy: ## Déploiement zero downtime (pull + build + rolling update)
	@echo "📥 Pull du code…"
	git pull origin main
	@TAG=$$(date +%s); \
	echo "🔨 Build des images (tag: $$TAG)…"; \
	$(DC_PROD) build; \
	docker tag atlas-narratif-api:latest atlas-narratif-api:$$TAG; \
	docker tag atlas-narratif-frontend:latest atlas-narratif-frontend:$$TAG; \
	echo "🚀 Rolling update API…"; \
	docker service update --image atlas-narratif-api:$$TAG --detach=false $(STACK)_api; \
	echo "🚀 Rolling update Frontend…"; \
	docker service update --image atlas-narratif-frontend:$$TAG --detach=false $(STACK)_frontend
	@echo "🧹 Nettoyage images orphelines…"
	docker image prune -f
	@echo "✅ Déploiement terminé"

prod-swap: ## Swap rapide (sans git pull) — pour modifs directes sur le VPS
	@TAG=$$(date +%s); \
	echo "🔨 Build des images (tag: $$TAG)…"; \
	$(DC_PROD) build; \
	docker tag atlas-narratif-api:latest atlas-narratif-api:$$TAG; \
	docker tag atlas-narratif-frontend:latest atlas-narratif-frontend:$$TAG; \
	echo "🚀 Rolling update API…"; \
	docker service update --image atlas-narratif-api:$$TAG --detach=false $(STACK)_api; \
	echo "🚀 Rolling update Frontend…"; \
	docker service update --image atlas-narratif-frontend:$$TAG --detach=false $(STACK)_frontend
	@echo "✅ Swap terminé"

prod-ps: ## État des services
	docker stack services $(STACK)

prod-logs: ## Logs d'un service (ex: make prod-logs s=api)
	@test -n "$(s)" || (echo "Usage: make prod-logs s=api|frontend|postgres|traefik" && exit 1)
	docker service logs $(STACK)_$(s) -f

prod-health: ## Health check de l'API
	@docker exec $$(docker ps -q -f name=$(STACK)_api) \
		wget -qO- http://127.0.0.1:3001/health \
		&& echo "✅ API OK" \
		|| (echo "❌ API KO" && exit 1)

prod-backup: ## Backup de la base PostgreSQL
	@mkdir -p backups
	docker exec $$(docker ps -q -f name=$(STACK)_postgres) \
		pg_dump --clean --if-exists -U atlas atlas | gzip > backups/atlas_$$(date +%Y%m%d_%H%M%S).sql.gz
	@echo "✅ Backup sauvegardé dans backups/"

prod-restore: ## Restaurer un backup (f=…)
	@test -f "$(f)" || (echo "Usage: make prod-restore f=backups/atlas_XXXXXXXX.sql.gz" && exit 1)
	gunzip -c "$(f)" | docker exec -i $$(docker ps -q -f name=$(STACK)_postgres) psql -U atlas atlas
	@echo "✅ Restauration terminée depuis $(f)"

.PHONY: help dev stop logs logs-s dev-rebuild lint lint-do test server-test e2e e2e-file build install server-install server-add add prod-up prod-down prod-ps prod-logs prod-deploy prod-swap prod-health prod-backup prod-restore
