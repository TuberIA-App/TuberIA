import logger from '../utils/logger';

/**
 * Validate enviroment variables
 * @throws {Error} If critical env variables are missing
 */
export const validateEnv = () => {

    // These are the required ENV VARIABLES that we need to exist on .env file
    const requiredEnvVars = [
        'MONGODB_URI',
        'JWT_SECRET',
        'JWT_REFRESH_SECRET'
    ];

    const missing = [];

    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }

    // Checking if there is any missing env, and if so then throw an error and lgo it.
    if (missing.length > 0) {
        const errorMsg = `Missing required enviroment variables: ${missing.join(', ')}`;
        logger.error(errorMsg);
        throw new Error(errorMsg);
    }

    // Validating the JWT secrets length
    if (process.env.JWT_SECRET.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
    }

    if (process.env.JWT_REFRESH_SECRET.length < 32) {
        throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
    }

    logger.info('Enviroment variables validated successfully :)');

}