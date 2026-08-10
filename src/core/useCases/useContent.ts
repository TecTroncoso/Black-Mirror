import { useState, useEffect } from 'react';
import { ContentItem, ContentType } from '../domain/models';
import { contentService } from '../../infrastructure/services/contentService';

export const useContent = (contentType: ContentType) => {
    const [items, setItems] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let mounted = true;

        const fetchContent = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await contentService.fetchContentList(contentType);
                if (mounted) setItems(data);
            } catch (err: any) {
                if (mounted) setError(err.message || 'Unknown error occurred');
            } finally {
                if (mounted) setLoading(false);
            }
        };

        fetchContent();

        return () => {
            mounted = false;
        };
    }, [contentType]);

    return { items, loading, error };
};
