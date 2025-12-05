# Redis Backup Script
# Usage: .\scripts\backup-redis.ps1

$BACKUP_DIR = ".\redis-backups"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_FILE = "redis_backup_$TIMESTAMP.rdb"

Write-Host "Creating Redis backup: $BACKUP_FILE" -ForegroundColor Cyan

# Create backup directory
New-Item -ItemType Directory -Force -Path $BACKUP_DIR | Out-Null

# Trigger Redis BGSAVE
Write-Host "Triggering BGSAVE..." -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli BGSAVE

# Wait for BGSAVE to complete
Write-Host "Waiting for BGSAVE to complete..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Copy dump.rdb from container
Write-Host "Copying backup from container..." -ForegroundColor Yellow
docker compose -f docker-compose.yml -f docker-compose.prod.yml cp redis:/data/dump.rdb "$BACKUP_DIR\$BACKUP_FILE"

Write-Host "Backup completed: $BACKUP_DIR\$BACKUP_FILE" -ForegroundColor Green

# Keep only last 7 backups
$backups = Get-ChildItem -Path $BACKUP_DIR -Filter "redis_backup_*.rdb" | Sort-Object LastWriteTime -Descending
if ($backups.Count -gt 7) {
    $backups | Select-Object -Skip 7 | Remove-Item -Force
    Write-Host "Old backups cleaned (keeping last 7)" -ForegroundColor Green
}