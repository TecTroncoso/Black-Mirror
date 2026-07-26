import { createClient } from '@libsql/client';
import dotenv from 'dotenv';

dotenv.config();

// En modo local (sin variables) creamos una base de datos local SQLite para probar
// Si querés conectarte a Turso en la nube, tenés que poner la URL y el TOKEN en el .env
const url = process.env.TURSO_DATABASE_URL || 'file:./local.db';
const authToken = process.env.TURSO_AUTH_TOKEN;

export const db = createClient({
  url,
  authToken,
});

// Initialize database table if it doesn't exist
export const initDb = async () => {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL
            )
        `);
        console.log("Database initialized successfully.");
    } catch (error) {
        console.error("Error initializing database:", error);
    }
};
