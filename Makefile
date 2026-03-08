CONTAINER=atlas-narratif-app-1

# ─────────────────────────────────────────
#  Docker
# ─────────────────────────────────────────

## Lance les containers en arrière-plan
up:
	docker compose up -d --build

## Arrête et supprime les containers
down:
	docker compose down

## Arrête les containers sans les supprimer
stop:
	docker compose stop

## Redémarre les containers
restart:
	docker compose restart

## Affiche les logs en temps réel
logs:
	docker compose logs -f

## Affiche le statut des containers
ps:
	docker compose ps

# ─────────────────────────────────────────
#  Application (dans le container)
# ─────────────────────────────────────────

## Lance le serveur de développement Vite
start:
	docker compose exec app npm run dev -- --host

## Build l'application
build:
	docker compose exec app npm run build

## Lint du code
lint:
	docker compose exec app npm run lint

## Prévisualise le build de production
preview:
	docker compose exec app npm run preview -- --host

## Ouvre un shell dans le container
shell:
	docker compose exec app sh

## Installe les dépendances npm
install:
	docker compose exec app npm install

.PHONY: up down stop restart logs ps start build lint preview shell install
