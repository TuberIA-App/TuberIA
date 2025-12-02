# Redis Monitoring Script
# Usage: .\scripts\monitor-redis.ps1

Write-Host "=== Redis Health Check ===" -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli ping

Write-Host "`n=== Redis Info ===" -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli INFO stats | Select-String -Pattern "total_commands_processed|keyspace_hits|keyspace_misses"

Write-Host "`n=== Redis Memory ===" -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli INFO memory | Select-String -Pattern "used_memory_human|maxmemory_human|mem_fragmentation_ratio"

Write-Host "`n=== Connected Clients ===" -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli CLIENT LIST

Write-Host "`n=== Slow Log (last 10) ===" -ForegroundColor Cyan
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli SLOWLOG GET 10