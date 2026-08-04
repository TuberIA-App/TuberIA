#!/usr/bin/env bash
# ============================================================================
# MongoDB backup
# ============================================================================
#   ./scripts/backup-mongo.sh              # back up the production stack
#   COMPOSE_ENV=dev ./scripts/backup-mongo.sh
#
# The archive is STREAMED to the host over stdout rather than written to a
# mounted directory. In production mongod runs as uid 999 with cap_drop: ALL,
# so it holds neither ownership of a host directory created by the deploy user
# nor CAP_DAC_OVERRIDE to bypass the permission check - `mongodump --out
# /backups` fails with EACCES. Streaming needs no writable mount at all.
#
# Restore with:
#   gunzip -c mongo-backups/<file>.gz | docker compose ... exec -T mongo \
#     mongorestore --archive --username ... --password ... \
#     --authenticationDatabase admin --drop
# ============================================================================
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

BACKUP_DIR="./mongo-backups"
KEEP=7
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/mongo_backup_${TIMESTAMP}.archive.gz"

case "${COMPOSE_ENV:-prod}" in
    dev)  COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.dev.yml) ;;
    prod) COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml) ;;
    *) echo "COMPOSE_ENV must be 'dev' or 'prod'" >&2; exit 2 ;;
esac

[[ -f .env ]] || { echo "Missing .env" >&2; exit 1; }
set -a
# shellcheck source=/dev/null
source .env
set +a

: "${MONGO_USER:?MONGO_USER must be set in .env}"
: "${MONGO_PASSWORD:?MONGO_PASSWORD must be set in .env}"

mkdir -p "$BACKUP_DIR"

echo "Creating MongoDB backup: ${BACKUP_FILE}"

# -T disables TTY allocation, without which the binary archive on stdout would
# be corrupted by terminal line-ending translation.
docker compose "${COMPOSE_FILES[@]}" exec -T mongo \
    mongodump \
        --username "$MONGO_USER" \
        --password "$MONGO_PASSWORD" \
        --authenticationDatabase admin \
        --archive \
        --gzip \
        --quiet \
    > "$BACKUP_FILE"

# A mongodump that authenticates but dumps nothing still exits 0, so check the
# archive is plausibly sized rather than trusting the exit status alone.
size=$(stat -c '%s' "$BACKUP_FILE")
if (( size < 1024 )); then
    echo "ERROR: backup is only ${size} bytes - treating as failed" >&2
    rm -f "$BACKUP_FILE"
    exit 1
fi

echo "Backup completed: ${BACKUP_FILE} (${size} bytes)"

# Retain the newest $KEEP backups.
find "$BACKUP_DIR" -maxdepth 1 -name 'mongo_backup_*.archive.gz' -printf '%T@ %p\0' \
    | sort -zrn \
    | tail -z -n "+$((KEEP + 1))" \
    | cut -z -d' ' -f2- \
    | xargs -0 -r rm -f

echo "Old backups cleaned (keeping newest ${KEEP})"
