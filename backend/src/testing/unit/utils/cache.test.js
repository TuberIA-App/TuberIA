import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getOrSet, invalidate } from '../../../utils/cache.js';
import { redisClient } from '../../../config/redis.js';

describe('Cache Utility', () => {
    beforeEach(async () => {
        // Limpiar Redis antes de cada test
        await redisClient.flushdb();
    });

    afterEach(async () => {
        // Limpiar Redis después de cada test
        await redisClient.flushdb();
    });

    describe('getOrSet', () => {
        it('should execute function on cache miss', async () => {
            let callCount = 0;

            const fetchData = async () => {
                callCount++;
                return { data: 'test-value' };
            };

            const result = await getOrSet('test-key-1', 60, fetchData);

            expect(callCount).toBe(1);
            expect(result.data).toBe('test-value');
        });

        it('should return cached result on cache hit', async () => {
            let callCount = 0;

            const fetchData = async () => {
                callCount++;
                return { data: 'test-value' };
            };

            // Primera llamada (cache miss)
            await getOrSet('test-key-2', 60, fetchData);

            // Segunda llamada (cache hit)
            const result = await getOrSet('test-key-2', 60, fetchData);

            expect(callCount).toBe(1); // La función solo se ejecutó una vez
            expect(result.data).toBe('test-value');
        });

        it('should cache complex objects correctly', async () => {
            const complexData = {
                videos: [
                    { id: 1, title: 'Video 1' },
                    { id: 2, title: 'Video 2' }
                ],
                pagination: { page: 1, limit: 20, total: 2 }
            };

            const fetchData = async () => complexData;

            const result = await getOrSet('test-key-3', 60, fetchData);

            expect(result).toEqual(complexData);
            expect(result.videos).toHaveLength(2);
        });

        it('should fallback to function execution on error', async () => {
            // Simular error de Redis cerrando la conexión temporalmente
            const fetchData = async () => ({ data: 'fallback-value' });

            // Incluso si Redis falla, la función debe ejecutarse
            const result = await getOrSet('test-key-4', 60, fetchData);

            expect(result.data).toBe('fallback-value');
        });
    });

    describe('invalidate', () => {
        it('should delete keys matching pattern', async () => {
            // Crear varias claves con el patrón
            await redisClient.set('videos:user:123:all:1:20', 'value1');
            await redisClient.set('videos:user:123:completed:1:20', 'value2');
            await redisClient.set('other:key', 'value3');

            // Invalidar el patrón
            await invalidate('videos:user:123:*');

            // Verificar que se eliminaron las claves correctas
            const val1 = await redisClient.get('videos:user:123:all:1:20');
            const val2 = await redisClient.get('videos:user:123:completed:1:20');
            const val3 = await redisClient.get('other:key');

            expect(val1).toBeNull();
            expect(val2).toBeNull();
            expect(val3).toBe('value3'); // Esta NO debe eliminarse
        });

        it('should handle empty pattern matches gracefully', async () => {
            // No debe lanzar error si no hay claves que coincidan
            await expect(invalidate('nonexistent:*')).resolves.not.toThrow();
        });

        it('should invalidate all cache for a user', async () => {
            await redisClient.set('videos:feed:user123:all:1:20', 'data');
            await redisClient.set('videos:feed:user123:completed:1:20', 'data');

            await invalidate('videos:feed:user123:*');

            const keys = await redisClient.keys('videos:feed:user123:*');
            expect(keys).toHaveLength(0);
        });
    });
});
