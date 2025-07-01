# Makefile for Docker Compose Project

# Variables
DOCKER_COMPOSE := docker-compose

# Targets
.PHONY: help
help:
	@echo "Please use 'make <target>' where <target> is one of"
	@echo "  gitlog				: show git logs"
	@echo "  up					: Start containers"
	@echo "  down				: Stop and remove containers, networks, volumes"
	@echo "  restart     		: Restart containers"
	@echo "  restart-frontend	: Restart frontend container"
	@echo "  restart-backend	: Restart backend container"
	@echo "  backend-shell		: Open a shell session in the backend container"
	@echo "  frontend-shell		: Open a shell session in the frontend container"
	@echo "  db-drop        	: Drop the database for Postgres and Mongo"
	@echo "  db-create      	: Create the database for Postgres"
	@echo "  migrate			: Run PostgreSQL migrations only"
	@echo "  migrate-fresh		: Reset both DBs and run migrations with seeds"
	@echo "  reset-mongo		: Reset MongoDB database only"
	@echo "  seeders			: Load all seeders"



gitlogs:
	git logs --oneline -n30

up:
	$(DOCKER_COMPOSE) up -d

down:
	$(DOCKER_COMPOSE) down

restart:
	$(DOCKER_COMPOSE) restart

restart-frontend:
	$(DOCKER_COMPOSE) restart client

restart-backend:
	$(DOCKER_COMPOSE) restart server

backend-shell:
	$(DOCKER_COMPOSE) exec -it server bash

frontend-shell:
	$(DOCKER_COMPOSE) exec -it client bash

db-drop:
	$(DOCKER_COMPOSE) exec -it server npm run db:drop && $(DOCKER_COMPOSE) exec -it server npm run reset:mongo

db-create:
	$(DOCKER_COMPOSE) exec -it server npm run db:create

migrate:
	$(DOCKER_COMPOSE) exec -it server npm run db:migrate

migrate-fresh:
	$(DOCKER_COMPOSE) exec -it server npm run db:migrate:fresh

reset-mongo:
	$(DOCKER_COMPOSE) exec -it server npm run reset:mongo

seeders:
	$(DOCKER_COMPOSE) exec -it server npm run db:seed:all

gitlog:
	git log --oneline -n10