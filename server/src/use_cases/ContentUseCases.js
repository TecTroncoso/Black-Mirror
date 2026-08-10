import { ValidationError, NotFoundError } from '../domain/errors/Errors.js';

export class ContentUseCases {
    constructor(contentRepository) {
        this.contentRepository = contentRepository;
    }

    _isValidType(type) {
        const validTypes = ['movie', 'series', 'anime', 'adult_anime'];
        return validTypes.includes(type);
    }

    async getContentListByType(contentType) {
        if (!this._isValidType(contentType)) {
            throw new ValidationError('Invalid content type');
        }

        const items = await this.contentRepository.findByType(contentType);
        return items.map(item => ({
            slug: item.slug,
            titulo: item.title,
            portada: item.poster,
            capitulos_total: item.totalEpisodes
        }));
    }

    async getContentDetail(slug, contentType) {
        if (!this._isValidType(contentType)) {
            throw new ValidationError('Invalid content type');
        }

        const detail = await this.contentRepository.findBySlugAndType(slug, contentType);
        
        if (!detail) {
            throw new NotFoundError("Content not found");
        }

        // Return a fully constructed object containing all details
        return {
            slug: detail.slug,
            content_type: detail.contentType,
            titulo: detail.title,
            portada: detail.poster,
            capitulos_total: detail.totalEpisodes,
            ...detail.details // Spread dynamic JSON details
        };
    }
}
