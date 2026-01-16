.PHONY: help docker-build docker-up docker-down docker-logs docker-restart docker-clean local-setup local-run status

# Default target
help:
	@echo "AI Demos Dashboard - Available Commands:"
	@echo ""
	@echo "🐳 Docker Commands:"
	@echo "  make docker-build    - Build the Docker image"
	@echo "  make docker-up       - Start the dashboard in Docker"
	@echo "  make docker-down     - Stop the dashboard"
	@echo "  make docker-logs     - View Docker logs"
	@echo "  make docker-restart  - Restart the dashboard"
	@echo "  make docker-clean    - Clean up Docker resources"
	@echo ""
	@echo "💻 Local Commands:"
	@echo "  make local-setup     - Setup local environment"
	@echo "  make local-run       - Run dashboard locally"
	@echo "  make status          - Check setup status"
	@echo ""

# Docker commands
docker-build:
	@echo "🐳 Building Docker image..."
	docker-compose build

docker-up:
	@echo "🚀 Starting AI Demos Dashboard in Docker..."
	docker-compose up -d
	@echo "✅ Dashboard running at http://localhost:5000"

docker-down:
	@echo "⏹️  Stopping AI Demos Dashboard..."
	docker-compose down

docker-logs:
	@echo "📋 Showing Docker logs (Ctrl+C to exit)..."
	docker-compose logs -f

docker-restart:
	@echo "🔄 Restarting AI Demos Dashboard..."
	docker-compose restart

docker-clean:
	@echo "🧹 Cleaning up Docker resources..."
	docker-compose down -v
	docker system prune -f

# Local commands
local-setup:
	@echo "📦 Setting up local environment..."
	./setup.sh
	@echo "📦 Setting up all projects..."
	./setup_all_projects.sh

local-run:
	@echo "🚀 Starting AI Demos Dashboard locally..."
	@echo "Make sure to activate venv: source venv/bin/activate"
	python app.py

status:
	@echo "📊 Checking setup status..."
	./check_status.sh
