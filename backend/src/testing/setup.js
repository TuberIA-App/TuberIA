import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file for testing
dotenv.config({ path: join(__dirname, '../../.env') });

// Import and verify secrets are loaded correctly
// This will throw an error if secrets are missing or invalid
try {
    await import('../config/secrets.js');
    console.log('[TEST SETUP] Secrets loaded successfully');
} catch (error) {
    console.error('[TEST SETUP] ERROR: Failed to load secrets:', error.message);
    process.exit(1);
}
