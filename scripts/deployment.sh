#!/bin/bash
set -euo pipefail

echo "---------------------------------"
echo "  TuberIA Deployment Automation  "
echo "---------------------------------"
echo ""

APP_DIR="$HOME/TuberIA"
cd "$APP_DIR"

echo "[1/5] Actualizando solo el código rastreado por Git (sin tocar .env ni secrets)..."
git fetch origin
git reset --hard origin/main
echo "[+] Codigo actualizado"

echo "[2/5] Verificando .env y secrets..."
[ -f .env ]     || { echo "ERROR: Falta .env"; exit 1; }
[ -d secrets ]  || { echo "ERROR: Falta carpeta secrets/"; exit 1; }
echo "[+] .env y secrets presentes"

echo "[3/5] Deteniendo contenedores..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml down || true

echo "[4/5] Reconstruyendo y levantando..."
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate

echo "[5/5] Limpiando imágenes antiguas..."
docker image prune -f --filter "dangling=true" >/dev/null 2>&1 || true

echo ""
echo "======================================="
echo "  TuberIA desplegada correctamente :D  "
echo "======================================="
