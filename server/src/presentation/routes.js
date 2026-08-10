import { Hono } from 'hono';
import { AuthUseCases } from '../use_cases/AuthUseCases.js';
import { ContentUseCases } from '../use_cases/ContentUseCases.js';
import { AppError } from '../domain/errors/Errors.js';

export const createRouter = (userRepository, contentRepository) => {
    const app = new Hono();
    const authUseCases = new AuthUseCases(userRepository);
    const contentUseCases = new ContentUseCases(contentRepository);

    // Global Error Handler wrapper helper
    const handleUseCase = async (c, action) => {
        try {
            const result = await action();
            return c.json(result);
        } catch (error) {
            if (error instanceof AppError) {
                return c.json({ error: error.message }, error.statusCode);
            }
            console.error("Unhandled Presentation Error:", error);
            return c.json({ error: "Internal Server Error" }, 500);
        }
    };

    // ============================================================
    // AUTH ENDPOINTS
    // ============================================================
    app.post('/api/auth/login', async (c) => {
        const { email, password } = await c.req.json().catch(() => ({}));
        return handleUseCase(c, () => authUseCases.login(email, password));
    });

    app.post('/api/auth/register', async (c) => {
        const { name, email, password } = await c.req.json().catch(() => ({}));
        return handleUseCase(c, () => authUseCases.register(name, email, password));
    });

    // ============================================================
    // CONTENT ENDPOINTS
    // ============================================================
    app.get('/api/content/:type', (c) => {
        const type = c.req.param('type');
        const page = parseInt(c.req.query('page')) || 1;
        const limit = parseInt(c.req.query('limit')) || 50;
        const offset = (page - 1) * limit;

        c.header('Cache-Control', 'public, max-age=60'); // Edge Cache for 60 seconds
        return handleUseCase(c, () => contentUseCases.getContentListByType(type, limit, offset));
    });

    app.get('/api/content/:type/:slug', (c) => {
        const type = c.req.param('type');
        const slug = c.req.param('slug');
        c.header('Cache-Control', 'public, max-age=60'); // Edge Cache for 60 seconds
        return handleUseCase(c, () => contentUseCases.getContentDetail(slug, type));
    });

    return app;
};
