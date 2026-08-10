import useSWR from 'swr';
import { ContentDetail, ContentType } from '../domain/models';
import { contentService } from '../../infrastructure/services/contentService';

export const useContentDetail = (contentType: ContentType, slug: string) => {
    const fetcher = async () => {
        return await contentService.fetchContentDetail(contentType, slug);
    };

    // key is an array so it re-fetches when slug or type changes
    const { data, error, isLoading, mutate } = useSWR<ContentDetail>(
        [contentType, slug],
        fetcher,
        {
            revalidateOnFocus: false, // Don't constantly re-fetch when switching tabs
        }
    );

    return {
        detail: data,
        error: error ? error.message : null,
        isLoading,
        reload: mutate
    };
};
