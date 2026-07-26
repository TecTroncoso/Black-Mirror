import express from 'express';
import cors from 'cors';
import { db, initDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Init DB
initDb();

// Random ID generator
const generateId = () => 'usr_' + Math.random().toString(36).substring(7);

// Login Endpoint
app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const result = await db.execute({
            sql: "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
            args: [email, password]
        });

        if (result.rows.length > 0) {
            // Return user without password
            res.json(result.rows[0]);
        } else {
            res.status(401).json({ error: "Invalid credentials" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Database error" });
    }
});

// Register Endpoint
app.post('/api/auth/register', async (req, res) => {
    const { name, email, password } = req.body;

    if (!email || !email.includes('@') || !password || password.length < 4) {
        return res.status(400).json({ error: 'Invalid email or password too short.' });
    }

    const id = generateId();

    try {
        await db.execute({
            sql: "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
            args: [id, name, email, password]
        });
        
        res.json({ id, name, email });
    } catch (error) {
        console.error(error);
        if (error.message.includes('UNIQUE constraint failed')) {
            res.status(409).json({ error: "Email already registered" });
        } else {
            res.status(500).json({ error: "Database error" });
        }
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`BlackMirror Backend running on http://localhost:${PORT}`);
});
