import { ContentItem, ContentType, ContentDetail } from '../../core/domain/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const contentService = {
    async fetchContentList(type: ContentType): Promise<ContentItem[]> {
        const response = await fetch(`${API_BASE_URL}/api/content/${type}?limit=10000`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${type} content`);
        }
        return await response.json();
    },

    async fetchContentDetail(type: ContentType, slug: string): Promise<ContentDetail> {
        const response = await fetch(`${API_BASE_URL}/api/content/${type}/${slug}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch detail for ${slug}`);
        }
        return await response.json();
    }
};
