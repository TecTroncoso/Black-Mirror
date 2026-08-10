import { ContentItem, ContentDetail } from '../../domain/entities/Content.js';
import { NotFoundError } from '../../domain/errors/Errors.js';

export class TursoContentRepository {
    constructor(dbClient) {
        this.db = dbClient;
    }

    async findByType(contentType, limit = 50, offset = 0) {
        const result = await this.db.execute({
            sql: `SELECT slug, title as titulo, poster as portada, total_episodes as capitulos_total
                  FROM content
                  WHERE content_type = ?
                  ORDER BY title ASC
                  LIMIT ? OFFSET ?`,
            args: [contentType, limit, offset]
        });

        return result.rows.map(row => new ContentItem(
            row.slug,
            contentType,
            row.titulo,
            row.portada,
            row.capitulos_total
        ));
    }

    async findBySlugAndType(slug, contentType) {
        const rs = await this.db.execute({
            sql: "SELECT title, poster, total_episodes, details FROM content WHERE slug = ? AND content_type = ?",
            args: [slug, contentType]
        });

        if (rs.rows.length === 0) {
            return null;
        }

        const row = rs.rows[0];
        const detailsStr = row.details;
        const details = typeof detailsStr === 'string' ? JSON.parse(detailsStr) : detailsStr;

        return new ContentDetail(
            slug,
            contentType,
            row.title,
            row.poster,
            row.total_episodes,
            details
        );
    }
}
