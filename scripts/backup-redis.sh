#!/bin/bash
# Redis Backup Script
# Usage: ./scripts/backup-redis.sh

BACKUP_DIR="./redis-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="redis_backup_${TIMESTAMP}.rdb"

echo "Creating Redis backup: $BACKUP_FILE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Trigger Redis BGSAVE
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli BGSAVE

# Wait for BGSAVE to complete
echo "Waiting for BGSAVE to complete..."
while [ "$(docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli LASTSAVE)" == "$(docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli LASTSAVE)" ]; do
  sleep 1
done

# Copy dump.rdb from container
docker compose -f docker-compose.yml -f docker-compose.prod.yml cp redis:/data/dump.rdb "$BACKUP_DIR/$BACKUP_FILE"

echo "Backup completed: $BACKUP_DIR/$BACKUP_FILE"

# Keep only last 7 backups
ls -t "$BACKUP_DIR"/redis_backup_*.rdb | tail -n +8 | xargs rm -f
echo "Old backups cleaned (keeping last 7)"
