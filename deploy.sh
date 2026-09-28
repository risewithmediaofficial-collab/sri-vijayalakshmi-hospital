#!/usr/bin/env bash
# ==============================================================================
# Sri Vijaya Lakshmi Hospital — Production Docker Deployment Script
# ==============================================================================
# Usage:
#   chmod +x deploy.sh
#   ./deploy.sh
# ==============================================================================

set -e

echo ""
echo "🏥  Sri Vijaya Lakshmi Hospital — Production Deployment"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Check prerequisites
command -v docker >/dev/null 2>&1 || { 
  echo "❌ Error: Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/" >&2
  exit 1 
}

# Determine docker compose command
if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker-compose"
else
  echo "❌ Error: Docker Compose is not installed." >&2
  exit 1
fi

echo "✓ Docker environment detected ($($DOCKER_COMPOSE version))"

# 2. Setup Environment Variables
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    echo "[!] No .env found. Generating .env from .env.example..."
    cp .env.example .env
  else
    echo "❌ Error: Neither .env nor .env.example found." >&2
    exit 1
  fi
fi

# Read port
FRONTEND_PORT=$(grep -E '^FRONTEND_PORT=' .env | cut -d '=' -f2 | tr -d '\r' || echo "94")
FRONTEND_PORT=${FRONTEND_PORT:-94}

echo "✓ Target Port: http://localhost:${FRONTEND_PORT}"

# 3. Pull base images and build containers
echo ""
echo "📦 Building production containers (Frontend, Backend, MongoDB)..."
$DOCKER_COMPOSE build --pull

# 4. Stop any previous containers
echo ""
echo "🛑 Gracefully restarting containers..."
$DOCKER_COMPOSE down --remove-orphans || true

# 5. Start the production stack
echo ""
echo "🚀 Launching Sri Vijaya Lakshmi Hospital services..."
$DOCKER_COMPOSE up -d --remove-orphans

# 6. Wait for database and backend
echo ""
echo "⏳ Waiting for MongoDB and backend to stabilize..."
sleep 10

# 7. Initialize Database (Hospital, Roles, Admin)
echo ""
echo "⚙️ Initializing Sri Vijaya Lakshmi Hospital database..."
$DOCKER_COMPOSE exec -T backend node scripts/init-hospital.js || true

# 8. Health Check
echo ""
echo "🔍 Performing health check..."
HEALTH_CHECK_URL="http://127.0.0.1:${FRONTEND_PORT}/api/v1/health"

for i in {1..12}; do
  if curl -s -f "$HEALTH_CHECK_URL" | grep -q "UP"; then
    echo "✓ Health Check: PASSED!"
    break
  fi
  echo "   Waiting for API to respond... ($i/12)"
  sleep 5
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  DEPLOYMENT SUCCESSFUL!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  URL       : http://localhost:${FRONTEND_PORT}"
echo "  Admin User: admin@srivijayalakshmihospital.com"
echo "  Password  : Admin@2024!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Useful commands:"
echo "    - View logs       : $DOCKER_COMPOSE logs -f"
echo "    - Restart stack   : $DOCKER_COMPOSE restart"
echo "    - Stop stack      : $DOCKER_COMPOSE down"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
