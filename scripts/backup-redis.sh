#!/usr/bin/env bash
# ============================================================================
# Redis backup
# ============================================================================
#   ./scripts/backup-redis.sh              # back up the production stack
#   COMPOSE_ENV=dev ./scripts/backup-redis.sh
#
# Redis holds BullMQ's job state, so this is a real backup, not a nicety:
# losing it means losing every queued and in-flight transcription.
#
# NOTE: periodic RDB snapshotting is switched off in production
# (`--save ""`) to avoid a fork() whose copy-on-write pages can OOM-kill a
# memory-capped Redis. An explicit BGSAVE, as issued here, still works and is
# exactly how an on-demand backup should be taken.
# ============================================================================
set -Eeuo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

BACKUP_DIR="./redis-backups"
KEEP=7
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="redis_backup_${TIMESTAMP}.rdb"

case "${COMPOSE_ENV:-prod}" in
    dev)  COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.dev.yml) ;;
    prod) COMPOSE_FILES=(-f docker-compose.yml -f docker-compose.prod.yml) ;;
    *) echo "COMPOSE_ENV must be 'dev' or 'prod'" >&2; exit 2 ;;
esac

compose() { docker compose "${COMPOSE_FILES[@]}" "$@"; }
redis_cli() { compose exec -T redis redis-cli "$@"; }

mkdir -p "$BACKUP_DIR"

echo "Creating Redis backup: $BACKUP_FILE"

# Record the current save point BEFORE asking for a new one. The previous
# version compared two LASTSAVE calls issued back to back inside the loop
# condition, which compares a value against itself - it could spin forever or
# exit immediately depending on timing, and never actually waited for BGSAVE.
LAST_SAVE_BEFORE="$(redis_cli LASTSAVE | tr -d '[:space:]')"

redis_cli BGSAVE

echo "Waiting for BGSAVE to complete..."
for _ in $(seq 1 60); do
    sleep 1
    current="$(redis_cli LASTSAVE | tr -d '[:space:]')"
    if [[ "$current" != "$LAST_SAVE_BEFORE" ]]; then
        echo "BGSAVE finished."
        break
    fi
done

if [[ "$(redis_cli LASTSAVE | tr -d '[:space:]')" == "$LAST_SAVE_BEFORE" ]]; then
    echo "ERROR: BGSAVE did not complete within 60s" >&2
    exit 1
fi

compose cp redis:/data/dump.rdb "$BACKUP_DIR/$BACKUP_FILE"
echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"

# Retain the newest $KEEP backups. `find -printf` + sort avoids parsing `ls`,
# which breaks on unusual filenames.
find "$BACKUP_DIR" -maxdepth 1 -name 'redis_backup_*.rdb' -printf '%T@ %p\0' \
    | sort -zrn \
    | tail -z -n "+$((KEEP + 1))" \
    | cut -z -d' ' -f2- \
    | xargs -0 -r rm -f

echo "Old backups cleaned (keeping newest $KEEP)"
