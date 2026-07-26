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

// Setup Endpoint (Run this once to create the table)
app.get('/api/setup', async (c) => {
    const db = getDb(c.env);
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);
        return c.json({ message: "Database table initialized successfully." });
    } catch (error) {
        console.error("Setup error:", error);
        return c.json({ error: "Failed to setup database." }, 500);
    }
});

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

export default app;
