import useSWRInfinite from 'swr/infinite';
import { ContentItem, ContentType } from '../domain/models';
import { contentService } from '../../infrastructure/services/contentService';

const PAGE_LIMIT = 50;

export const useContent = (contentType: ContentType) => {
    const getKey = (pageIndex: number, previousPageData: ContentItem[]) => {
        // If it's the end, return null to stop fetching
        if (previousPageData && !previousPageData.length) return null;
        // Key contains the content type and the page number
        return [contentType, pageIndex + 1];
    };

    const fetcher = async ([type, page]: [ContentType, number]) => {
        return await contentService.fetchContentList(type, page, PAGE_LIMIT);
    };

    const { data, error, size, setSize, isValidating } = useSWRInfinite(
        getKey,
        fetcher,
        {
            revalidateFirstPage: false, // Don't re-fetch the first page constantly if we have it in cache
            persistSize: true, // Keep the size when component unmounts
        }
    );

    // Deduplicate by slug to prevent repeated items across pages
    const items = data 
        ? [...new Map(data.flat().map(item => [item.slug, item])).values()] 
        : [];
    const isLoadingInitialData = !data && !error;
    const isLoadingMore = isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_LIMIT);

    return { 
        items, 
        error: error ? error.message : null, 
        isLoadingInitialData, 
        isLoadingMore,
        isReachingEnd,
        loadMore: () => setSize(size + 1)
    };
};
