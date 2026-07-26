import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { db, initDb } from './db.js';

const app = new Hono();
app.use('/*', cors());

// Init DB
initDb();

// Random ID generator
const generateId = () => 'usr_' + Math.random().toString(36).substring(7);

// Login Endpoint
app.post('/api/auth/login', async (c) => {
    const { email, password } = await c.req.json();
    
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

const PORT = process.env.PORT || 3000;
console.log(`BlackMirror Backend (Hono Edge-Ready) running on http://localhost:${PORT}`);

serve({
  fetch: app.fetch,
  port: PORT
});
