import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createClient } from '@libsql/client/web';

const app = new Hono();
app.use('/*', cors());

// Helper to get db instance per request
const getDb = (env) => {
    return createClient({
        url: env.TURSO_DATABASE_URL,
        authToken: env.TURSO_AUTH_TOKEN
    });
};

// Random ID generator
const generateId = () => 'usr_' + Math.random().toString(36).substring(7);

// Setup Endpoint (Run this once to create/migrate the tables)
app.get('/api/setup', async (c) => {
    const db = getDb(c.env);
    try {
        // Users table
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);

        // New Universal Content table
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

        // Drop old tables
        const oldTables = ['animes', 'anime_generos', 'capitulos', 'proveedores'];
        for (const table of oldTables) {
            try {
                await db.execute(`DROP TABLE IF EXISTS ${table}`);
            } catch (e) {
                // Ignore errors
            }
        }

        return c.json({ message: "Database updated to Universal Content architecture successfully." });
    } catch (error) {
        console.error("Setup error:", error);
        return c.json({ error: "Failed to setup database." }, 500);
    }
});

// ============================================================
// AUTH ENDPOINTS
// ============================================================

// Login Endpoint
app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    const db = getDb(c.env);
    
    try {
        const result = await db.execute({
            sql: "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
            args: [email, password]
        });

        if (result.rows.length > 0) {
            return c.json(result.rows[0]);
        } else {
            return c.json({ error: "Invalid credentials" }, 401);
        }
    } catch (error) {
        console.error(error);
        return c.json({ error: "Database error" }, 500);
    }
});

// Register Endpoint
app.post('/api/auth/register', async (c) => {
    const { name, email, password } = await c.req.json();

    if (!email || !email.includes('@') || !password || password.length < 4) {
        return c.json({ error: 'Invalid email or password too short.' }, 400);
    }

    const id = generateId();
    const db = getDb(c.env);

    try {
        await db.execute({
            sql: "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
            args: [id, name, email, password]
        });
        
        return c.json({ id, name, email });
    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE constraint failed')) {
            return c.json({ error: "Email already registered" }, 409);
        } else {
            return c.json({ error: "Database error" }, 500);
        }
    }
});

// ============================================================
// CONTENT ENDPOINTS
// ============================================================

// Get all content by type (for grids)
app.get('/api/content/:type', async (c) => {
    const contentType = c.req.param('type');
    const validTypes = ['movie', 'series', 'anime', 'adult_anime'];

    if (!validTypes.includes(contentType)) {
        return c.json({ error: 'Invalid content type' }, 400);
    }

    const db = getDb(c.env);

    try {
        const result = await db.execute({
            sql: `SELECT slug, title as titulo, poster as portada, total_episodes as capitulos_total
                  FROM content
                  WHERE content_type = ?
                  ORDER BY title ASC`,
            args: [contentType]
        });

        const items = result.rows.map(row => ({
            slug: row.slug,
            titulo: row.titulo,
            portada: row.portada,
            capitulos_total: row.capitulos_total
        }));

        return c.json(items);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Database error" }, 500);
    }
});

// Get full detail of a content item (for viewing)
app.get('/api/content/:type/:slug', async (c) => {
    const contentType = c.req.param('type');
    const slug = c.req.param('slug');
    const db = getDb(c.env);

    try {
        const rs = await db.execute({
            sql: "SELECT details FROM content WHERE slug = ? AND content_type = ?",
            args: [slug, contentType]
        });

        if (rs.rows.length === 0) {
            return c.json({ error: "Content not found" }, 404);
        }

        // Parse the stored JSON details
        const detailsStr = rs.rows[0].details;
        const item = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr;

        // Ensure content_type is injected into the response for consistency
        item.content_type = contentType;
        
        return c.json(item);
    } catch (error) {
        console.error(error);
        return c.json({ error: "Database error" }, 500);
    }
});

export default app;
