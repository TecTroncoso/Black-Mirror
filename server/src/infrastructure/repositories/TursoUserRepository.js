import { User } from '../../domain/entities/User.js';
import { ConflictError, NotFoundError } from '../../domain/errors/Errors.js';

export class TursoUserRepository {
    constructor(dbClient) {
        this.db = dbClient;
    }

    async findByEmailAndPassword(email, password) {
        const result = await this.db.execute({
            sql: "SELECT id, name, email FROM users WHERE email = ? AND password = ?",
            args: [email, password]
        });

        if (result.rows.length === 0) {
            return null;
        }

        const row = result.rows[0];
        // Note: Password is not returned from DB to prevent leaking, so we pass null or empty to entity
        return new User(row.id, row.name, row.email, null);
    }

    async save(user) {
        try {
            await this.db.execute({
                sql: "INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)",
                args: [user.id, user.name, user.email, user.password]
            });
            return user;
        } catch (error) {
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                throw new ConflictError("Email already registered");
            }
            throw error;
        }
    }
}
