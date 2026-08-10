import { User } from '../domain/entities/User.js';
import { UnauthorizedError, ValidationError } from '../domain/errors/Errors.js';

export class AuthUseCases {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    // Helper for generating random IDs (moved from main index.js)
    _generateId() {
        return 'usr_' + Math.random().toString(36).substring(7);
    }

    async login(email, password) {
        if (!email || !password) {
            throw new ValidationError("Email and password are required");
        }

        const user = await this.userRepository.findByEmailAndPassword(email, password);
        
        if (!user) {
            throw new UnauthorizedError("Invalid credentials");
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email
        };
    }

    async register(name, email, password) {
        if (!email || !email.includes('@') || !password || password.length < 4) {
            throw new ValidationError("Invalid email or password too short.");
        }

        const id = this._generateId();
        const newUser = new User(id, name, email, password);
        
        await this.userRepository.save(newUser);

        return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email
        };
    }
}
