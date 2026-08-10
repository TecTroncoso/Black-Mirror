import { createClient } from '@libsql/client/web';

/**
 * Creates and returns a Turso database client instance.
 * @param {Object} env - The environment variables from Cloudflare Workers
 * @returns {import('@libsql/client/web').Client}
 */
export const getDbClient = (env) => {
    return createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN
    });
};
