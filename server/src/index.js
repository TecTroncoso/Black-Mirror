import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { getDbClient } from './infrastructure/database/tursoClient.js';
import { TursoUserRepository } from './infrastructure/repositories/TursoUserRepository.js';
import { TursoContentRepository } from './infrastructure/repositories/TursoContentRepository.js';
import { createRouter } from './presentation/routes.js';

// The main application container
const app = new Hono();

app.use('/*', cors());

// This middleware injects dependencies on every request, since in Cloudflare Workers 
// environment variables (c.env) are only available per-request.
app.use('/api/*', async (c, next) => {
    // 1. Database Connection (Infrastructure)
    const dbClient = getDbClient(c.env);

    // 2. Repositories (Infrastructure)
    const userRepository = new TursoUserRepository(dbClient);
    const contentRepository = new TursoContentRepository(dbClient);

    // 3. Presentation (Router)
    // We attach the assembled router directly to this request context
    const router = createRouter(userRepository, contentRepository);
    
    // We forward the request to our Clean Architecture router
    return router.fetch(c.req.raw, c.env, c.executionCtx);
});

// Setup Endpoint (Kept outside Clean Architecture as it's a structural migration script)
app.get('/api/setup', async (c) => {
    const db = getDbClient(c.env);
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        await db.execute(`
            CREATE TABLE IF NOT EXISTS content (
                slug TEXT PRIMARY KEY,
                content_type TEXT NOT NULL,
                title TEXT NOT NULL,
                poster TEXT,
                total_episodes INTEGER DEFAULT 1,
                details TEXT NOT NULL
            )
        `);

        return c.json({ message: "Database updated to Universal Content architecture successfully." });
    } catch (error) {
        console.error("Setup error:", error);
        return c.json({ error: "Failed to setup database." }, 500);
    }
});

export default app;
