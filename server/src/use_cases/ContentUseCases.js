import { ValidationError, NotFoundError } from '../domain/errors/Errors.js';

export class ContentUseCases {
    constructor(contentRepository) {
        this.contentRepository = contentRepository;
    }

    _isValidType(type) {
        const validTypes = ['movie', 'series', 'anime', 'adult_anime'];
        return validTypes.includes(type);
    }

    async getContentListByType(contentType, limit = 50, offset = 0) {
        if (!this._isValidType(contentType)) {
            throw new ValidationError('Invalid content type');
        }

        const items = await this.contentRepository.findByType(contentType, limit, offset);
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

        // If content is 'anime', hide 'hls' provider for now
        let processedDetails = detail.details;
        if (contentType === 'anime' && processedDetails && processedDetails.capitulos) {
            processedDetails.capitulos = processedDetails.capitulos.map(cap => ({
                ...cap,
                proveedores: cap.proveedores ? cap.proveedores.filter(p => p.nombre.toLowerCase() !== 'hls') : [],
                descargas: cap.descargas ? cap.descargas.filter(p => p.nombre.toLowerCase() !== 'hls') : []
            }));
        }

        // Return a fully constructed object containing all details
        return {
            slug: detail.slug,
            content_type: detail.contentType,
            titulo: detail.title,
            portada: detail.poster,
            capitulos_total: detail.totalEpisodes,
            ...processedDetails // Spread dynamic JSON details
        };
    }
}
