import React, { useState, useEffect, useRef, useCallback } from 'react';
import { preload } from 'swr';
import { ContentItem, ContentType } from '../../core/domain/models';
import { useContent } from '../../core/useCases/useContent';
import { contentService } from '../../infrastructure/services/contentService';
import { Loader2, Play, Search } from 'lucide-react';

interface ContentGridViewProps {
    contentType: ContentType;
    title: string;
    onContentSelect?: (slug: string) => void;
}

const CONTENT_LABELS: Record<ContentType, string> = {
    movie: 'Movies',
    series: 'Series',
    anime: 'Anime',
    adult_anime: 'Adult Anime',
};

export const ContentGridView: React.FC<ContentGridViewProps> = ({ contentType, title, onContentSelect }) => {
    const { 
        items, 
        error, 
        isLoadingInitialData, 
        isLoadingMore, 
        isReachingEnd, 
        loadMore 
    } = useContent(contentType);
    
    const [searchQuery, setSearchQuery] = useState('');
    const observer = useRef<IntersectionObserver | null>(null);

    // Infinite scroll observer setup
    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (isLoadingMore) return;
        if (observer.current) observer.current.disconnect();
        
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isReachingEnd) {
                loadMore();
            }
        }, {
            rootMargin: '200px' // Load when 200px from the bottom
        });
        
        if (node) observer.current.observe(node);
    }, [isLoadingMore, isReachingEnd, loadMore]);

    // Client side filtering. NOTE: With pagination, this only filters *currently loaded* items.
    // Realistically, search should hit an API endpoint if the DB is massive.
    const filtered = items.filter(item =>
        item.titulo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-400 text-sm">Error: {error}</p>
            </div>
        );
    }

    if (isLoadingInitialData) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 text-tv-focus animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{title}</h1>
                    <p className="text-sm text-gray-400 mt-1">{items.length} titles loaded</p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder={`Search ${CONTENT_LABELS[contentType]}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-tv-focus/50 focus:ring-1 focus:ring-tv-focus/30 transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <p className="text-lg font-medium">No content found</p>
                    <p className="text-sm mt-1">
                        {items.length === 0 ? 'This category is empty. Run the scraper to populate it.' : 'Try a different search term.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map((item, index) => {
                        // Attach observer ref to the last element in the grid
                        if (index === filtered.length - 1) {
                            return <div ref={lastElementRef} key={item.slug}>
                                <ContentCard item={item} contentType={contentType} onClick={() => onContentSelect?.(item.slug)} />
                            </div>;
                        }
                        return <ContentCard key={item.slug} item={item} contentType={contentType} onClick={() => onContentSelect?.(item.slug)} />;
                    })}
                </div>
            )}
            
            {/* Loading Indicator for Infinite Scroll */}
            {isLoadingMore && !isLoadingInitialData && (
                <div className="flex justify-center py-6">
                    <Loader2 className="w-6 h-6 text-tv-focus animate-spin" />
                </div>
            )}
        </div>
    );
};

const ContentCard: React.FC<{ item: ContentItem; contentType: ContentType; onClick?: () => void }> = ({ item, contentType, onClick }) => {
    // Predictive prefetching on hover
    const handlePrefetch = () => {
        preload([contentType, item.slug], () => contentService.fetchContentDetail(contentType, item.slug));
    };

    return (
        <button 
            onClick={onClick}
            onMouseEnter={handlePrefetch}
            className="group relative flex flex-col rounded-2xl overflow-hidden bg-white/5 border border-white/5 hover:border-tv-focus/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] text-left w-full"
        >
            {/* Poster */}
            <div className="relative aspect-[2/3] w-full overflow-hidden">
                {item.portada ? (
                    <img
                        src={item.portada}
                        alt={item.titulo}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        <Play className="w-10 h-10 text-gray-600" />
                    </div>
                )}
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-tv-focus/90 flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 text-white fill-white" />
                        </div>
                        <span className="text-xs text-white font-medium">{item.capitulos_total} eps</span>
                    </div>
                </div>
            </div>
            {/* Info */}
            <div className="p-3 space-y-1">
                <h3 className="text-sm font-semibold text-white truncate group-hover:text-tv-focus transition-colors">{item.titulo}</h3>
                <p className="text-xs text-gray-500">{item.capitulos_total} episodes</p>
            </div>
        </button>
    );
};
