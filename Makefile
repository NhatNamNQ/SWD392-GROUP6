.PHONY: up down restart build logs test-all

# Start all services locally
up:
	docker-compose up -d

# Build and start services
build:
	docker-compose up -d --build

# Stop all services
down:
	docker-compose down

# Restart the application
restart:
	docker-compose restart

# View logs
logs:
	docker-compose logs -f
