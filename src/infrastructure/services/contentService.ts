import { ContentItem, ContentType } from '../../core/domain/models';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const contentService = {
    async fetchContentList(type: ContentType, page: number = 1, limit: number = 50): Promise<ContentItem[]> {
        const response = await fetch(`${API_BASE_URL}/api/content/${type}?page=${page}&limit=${limit}`);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${type} content`);
        }
        return await response.json();
    }
};
