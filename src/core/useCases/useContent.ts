import useSWR from 'swr';
import { ContentItem, ContentType } from '../domain/models';
import { contentService } from '../../infrastructure/services/contentService';

export const useContent = (contentType: ContentType) => {
    const fetcher = () => contentService.fetchContentList(contentType);

    const { data, error, isValidating } = useSWR(
        contentType,
        fetcher,
        {
            revalidateOnFocus: false,
        }
    );

    // Deduplicate by slug as safety net
    const items = data
        ? [...new Map(data.map(item => [item.slug, item])).values()]
        : [];

    return {
        items,
        error: error ? error.message : null,
        isLoading: !data && !error,
    };
};
