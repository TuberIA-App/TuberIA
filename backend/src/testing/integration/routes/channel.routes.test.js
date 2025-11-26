import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../../../app.js';
import User from '../../../model/User.js';

describe('Channel Routes Integration Tests', () => {
    let authToken;
    let testUser;

    beforeAll(async () => {
        // Conectar a DB de test
        const testMongoUri = process.env.MONGODB_TEST_URI
            ?.replace('tuberia-test', 'tuberia-test-channel-routes')
            || 'mongodb://mongo:mongo@localhost:27017/tuberia-test-channel-routes?authSource=admin';

        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.close();
        }

        await mongoose.connect(testMongoUri, {
            serverSelectionTimeoutMS: 5000
        });

        // Crear usuario de prueba y obtener token (si la ruta requiere auth)
        // Esto es opcional, solo si decides proteger la ruta
        testUser = await User.create({
            username: 'testuser',
            name: 'Test User',
            email: 'test@example.com',
            password: 'password123'
        });

        const tokens = testUser.generateAuthTokens();
        authToken = tokens.accessToken;
    });

    beforeEach(async () => {
        // Limpieza si es necesario
    });

    afterAll(async () => {
        // Limpiar y cerrar conexión
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe('GET /api/channels/search', () => {
        it('should return 400 if query parameter is missing', async () => {
            const response = await request(app)
                .get('/api/channels/search');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe('Validation failed');
        });

        it('should return 400 if query parameter is too short', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=a');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('should return 200 and channel info for valid username with @', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe('Channel found successfully');
            expect(response.body.data).toBeDefined();
            expect(response.body.data.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
            expect(response.body.data.name).toBeDefined();
            expect(response.body.data.username).toBe('@vegetta777');
            
            // Verificar que NO incluya followersCount
            expect(response.body.data).not.toHaveProperty('followersCount');
        }, 30000);

        it('should return 200 and channel info for valid username without @', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
        }, 30000);

        it('should return 200 and channel info for valid URL', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=https://youtube.com/@vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.channelId).toBe('UCam8T03EOFBsNdR0thrFHdQ');
        }, 30000);

        it('should return 404 for non-existent channel', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@thischanneldoesnotexist123456789');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        }, 30000);

        it('should return 400 for invalid YouTube URL', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=https://notayoutubeurl.com');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        }, 20000);

        it('should return description as null (not available in RSS)', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(200);
            expect(response.body.data.description).toBeNull();
        }, 30000);

        // Test opcional: si decides proteger la ruta con authMiddleware
        it.skip('should return 401 if no auth token is provided (protected route)', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        // Test opcional: si la ruta está protegida
        it.skip('should return 200 with valid auth token (protected route)', async () => {
            const response = await request(app)
                .get('/api/channels/search?q=@vegetta777')
                .set('Authorization', `Bearer ${authToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        }, 30000);
    });
});