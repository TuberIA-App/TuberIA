import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file for testing
dotenv.config({ path: join(__dirname, '../../.env') });

// Verify critical env vars are loaded
if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('ERROR: JWT secrets not loaded from .env file');
    process.exit(1);
}
