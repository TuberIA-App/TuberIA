#!/bin/bash
set -euo pipefail

echo "---------------------------------"
echo "  TuberIA Deployment Automation  "
echo "---------------------------------"
echo ""

# Definimos la ruta base del proyecto una sola vez
APP_DIR="$HOME/TuberIA"

# Nos aseguramos de que el directorio del proyecto existe antes de intentar entrar
if [ ! -d "$APP_DIR" ]; then
    echo "ERROR: El directorio del proyecto no existe en $APP_DIR"
    exit 1
fi

echo "[INFO] Cambiando al directorio del proyecto: $APP_DIR"
cd "$APP_DIR"

echo "[1/5] Actualizando solo el código rastreado por Git (sin tocar .env ni secrets)..."
git fetch origin
git reset --hard origin/main
echo "[+] Código actualizado"

echo "[2/5] Verificando .env y secrets..."
# Usamos rutas absolutas para las comprobaciones, haciéndolas independientes del directorio actual
[ -f "$APP_DIR/.env" ]     || { echo "ERROR: Falta el archivo .env en $APP_DIR"; exit 1; }
[ -d "$APP_DIR/secrets" ]  || { echo "ERROR: Falta el directorio secrets/ en $APP_DIR"; exit 1; }
echo "[+] .env y secrets presentes"

echo "[3/5] Deteniendo contenedores..."
# Usamos rutas absolutas para los archivos de Docker Compose
docker compose -f "$APP_DIR/docker-compose.yml" -f "$APP_DIR/docker-compose.prod.yml" down || true

echo "[4/5] Reconstruyendo y levantando..."
docker compose -f "$APP_DIR/docker-compose.yml" -f "$APP_DIR/docker-compose.prod.yml" build --no-cache
docker compose -f "$APP_DIR/docker-compose.yml" -f "$APP_DIR/docker-compose.prod.yml" up -d --force-recreate

echo "[5/5] Limpiando imágenes antiguas..."
docker image prune -f --filter "dangling=true" >/dev/null 2>&1 || true

echo ""
echo "======================================="
echo "  TuberIA desplegada correctamente :D  "
echo "======================================="