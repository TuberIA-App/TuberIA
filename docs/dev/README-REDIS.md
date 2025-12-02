# Redis en TuberIA

## Comandos básicos

- Ver estado de Redis:
  ```powershell
  docker compose -f docker-compose.yml -f docker-compose.dev.yml logs redis
  docker compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli ping
  ```
- Acceder a la CLI de Redis:
  ```powershell
  docker compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli
  ```
- Ver claves almacenadas:
  ```powershell
  docker compose -f docker-compose.yml -f docker-compose.dev.yml exec redis redis-cli keys \*
  ```

## Scripts de backup y monitorización

- Backup manual:
  ```powershell
  ./scripts/backup-redis.ps1
  # O en Linux:
  ./scripts/backup-redis.sh
  ```
- Monitorización:
  ```powershell
  ./scripts/monitor-redis.ps1
  # O en Linux:
  ./scripts/monitor-redis.sh
  ```
- Los backups se guardan en `redis-backups/`.

## Troubleshooting común

### Redis no inicia
- Verifica logs: `docker compose -f docker-compose.yml -f docker-compose.dev.yml logs redis`
- Revisa puertos y volúmenes en docker-compose.dev.yml
- Elimina volúmenes si hay corrupción:
  ```powershell
  docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v
  docker compose -f docker-compose.yml -f docker-compose.dev.yml up
  ```

### Backend no conecta a Redis
- Revisa variables REDIS_HOST y REDIS_PORT en backend/.env
- Verifica que el servicio redis esté "healthy".
- Usa la CLI para probar conexión desde backend:
  ```powershell
  docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend sh
  # Dentro del contenedor:
  redis-cli -h redis -p 6379 ping
  ```

### Out of memory
- Revisa límites de memoria en docker-compose.dev.yml (sección deploy/resources).
- Reduce la carga o aumenta el límite temporalmente.

### Slow performance
- Verifica el uso de CPU/memoria con:
  ```powershell
  docker stats
  ```
- Revisa logs de Redis y backend.
- Considera limpiar claves antiguas o ajustar configuración.

---

**Más información y comandos avanzados:**
- https://redis.io/commands
- https://redis.io/docs/management/backup/
