#!/bin/bash
# Redis Monitoring Script
# Usage: ./scripts/monitor-redis.sh

echo "=== Redis Health Check ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli ping

echo ""
echo "=== Redis Info ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli INFO stats | grep -E "total_commands_processed|keyspace_hits|keyspace_misses"

echo ""
echo "=== Redis Memory ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli INFO memory | grep -E "used_memory_human|maxmemory_human|mem_fragmentation_ratio"

echo ""
echo "=== Connected Clients ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli CLIENT LIST

echo ""
echo "=== Slow Log (last 10) ==="
docker compose -f docker-compose.yml -f docker-compose.prod.yml exec redis redis-cli SLOWLOG GET 10
