import React, { useState } from 'react';
import { Play, ArrowLeft, BookmarkPlus, Share2, Star, ListVideo, Info, MessageSquare } from 'lucide-react';
import { useContentDetail } from '../../core/useCases/useContentDetail';
import { ContentType, Chapter, Provider } from '../../core/domain/models';

interface ContentDetailViewProps {
    contentType: ContentType;
    slug: string;
    onBack: () => void;
}

export const ContentDetailView: React.FC<ContentDetailViewProps> = ({ contentType, slug, onBack }) => {
    const { detail, isLoading, error } = useContentDetail(contentType, slug);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [activeTab, setActiveTab] = useState<'episodios' | 'info' | 'comentarios'>('episodios');

    // Auto-select first chapter and provider when data loads
    React.useEffect(() => {
        if (detail && detail.capitulos.length > 0 && !selectedChapter) {
            const firstChap = detail.capitulos[0];
            setSelectedChapter(firstChap);
            if (firstChap.proveedores && firstChap.proveedores.length > 0) {
                setSelectedProvider(firstChap.proveedores[0]);
            }
        }
    }, [detail, selectedChapter]);

    const handleChapterSelect = (chap: Chapter) => {
        setSelectedChapter(chap);
        if (chap.proveedores && chap.proveedores.length > 0) {
            setSelectedProvider(chap.proveedores[0]);
        } else {
            setSelectedProvider(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-12 h-12 border-4 border-tv-focus border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="text-red-500 text-5xl">⚠️</div>
                <h2 className="text-2xl font-bold text-white">Error Loading Content</h2>
                <p className="text-gray-400">{error || 'Unknown error occurred.'}</p>
                <button onClick={onBack} className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors">
                    Go Back
                </button>
            </div>
        );
    }

    const backdropUrl = detail.backdrop || detail.portada;

    return (
        <div className="flex flex-col h-full space-y-6">
            {/* Breadcrumb / Top Actions */}
            <div className="flex items-center space-x-4 text-sm font-medium">
                <button 
                    onClick={onBack} 
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Volver
                </button>
                <span className="text-gray-600">&gt;</span>
                <span className="text-gray-400 capitalize">{contentType.replace('_', ' ')}</span>
                <span className="text-gray-600">&gt;</span>
                <span className="text-white">{detail.titulo}</span>
            </div>

            {/* Main Content Layout */}
            <div className="flex flex-col lg:flex-row gap-8 min-h-0">
                
                {/* Left Side: Player & Info */}
                <div className="flex-1 flex flex-col min-w-0 space-y-6">
                    {/* Player Container */}
                    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl group flex flex-col">
                        {/* Provider Selector (if we have a selected provider) */}
                        {selectedProvider && selectedChapter?.proveedores && (
                            <div className="absolute top-4 left-4 z-20 flex items-center bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                                <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                                <select 
                                    className="bg-transparent text-white text-sm font-medium outline-none cursor-pointer appearance-none pr-4"
                                    value={selectedProvider.nombre}
                                    onChange={(e) => {
                                        const p = selectedChapter.proveedores.find(x => x.nombre === e.target.value);
                                        if (p) setSelectedProvider(p);
                                    }}
                                >
                                    {selectedChapter.proveedores.map(p => (
                                        <option key={p.nombre} value={p.nombre} className="bg-gray-900">{p.nombre}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Video Area */}
                        {selectedProvider ? (
                            <iframe 
                                src={selectedProvider.url} 
                                className="w-full h-full border-none"
                                allowFullScreen
                            />
                        ) : (
                            <div className="relative w-full h-full flex items-center justify-center">
                                {backdropUrl && (
                                    <img src={backdropUrl} alt="Backdrop" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                                )}
                                <div className="z-10 text-center">
                                    <button className="w-16 h-16 bg-tv-focus rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                                        <Play size={24} className="text-white ml-1" fill="currentColor" />
                                    </button>
                                    <p className="mt-4 font-semibold text-white">Selecciona un episodio para reproducir</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content Details Below Player */}
                    <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                        {/* Title, Badges, and Description */}
                        <div className="flex flex-col space-y-4 flex-1">
                            <h1 className="text-3xl font-bold text-white tracking-tight">{detail.titulo}</h1>
                            
                            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-300">
                                {detail.tipo && <span className="px-2 py-1 bg-white/10 rounded uppercase">{detail.tipo}</span>}
                                {detail.temporada && <span className="px-2 py-1 bg-white/10 rounded">{detail.temporada}</span>}
                                {detail.estado && (
                                    <span className="flex items-center">
                                        <span className="w-1.5 h-1.5 rounded-full bg-tv-focus mr-1.5"></span>
                                        {detail.estado}
                                    </span>
                                )}
                                {detail.categorias?.map(cat => (
                                    <span key={cat} className="px-2 py-1 border border-white/10 rounded text-gray-400 hover:text-white transition-colors cursor-pointer">{cat}</span>
                                ))}
                            </div>

                            <p className="text-gray-400 text-sm leading-relaxed max-w-3xl">
                                {detail.descripcion || detail.sinopsis_corta}
                            </p>
                        </div>

                        {/* Actions (Right Side) */}
                        <div className="flex flex-col gap-2 w-full md:w-48 flex-shrink-0 pt-2 md:pt-0">
                            <button className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/5 w-full">
                                <BookmarkPlus size={18} className="mr-3" />
                                Añadir a mi lista
                            </button>
                            <button className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/5 w-full">
                                <Star size={18} className="mr-3" />
                                Valorar
                            </button>
                            <button className="flex items-center justify-center px-4 py-3 bg-white/5 hover:bg-white/10 text-white rounded-lg transition-colors text-sm font-medium border border-white/5 w-full">
                                <Share2 size={18} className="mr-3" />
                                Compartir
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Side: Sidebar */}
                <div className="w-full lg:w-[350px] xl:w-[400px] flex flex-col flex-shrink-0 space-y-6">
                    {/* Poster Card */}
                    <div className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                        <img src={detail.portada} alt={detail.titulo} className="w-24 h-36 object-cover rounded-xl shadow-lg" />
                        <div className="flex flex-col justify-center">
                            <h3 className="font-bold text-white text-lg line-clamp-2">{detail.titulo}</h3>
                            <div className="flex items-center text-sm text-gray-400 mt-2">
                                <Star size={14} className="text-yellow-500 mr-1" fill="currentColor" />
                                <span className="font-medium text-white mr-1">4.8</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-white/10">
                        <button 
                            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'episodios' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('episodios')}
                        >
                            <div className="flex items-center justify-center">
                                <ListVideo size={16} className="mr-2" /> Episodios
                            </div>
                            {activeTab === 'episodios' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-tv-focus"></div>}
                        </button>
                        <button 
                            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'info' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('info')}
                        >
                            <div className="flex items-center justify-center">
                                <Info size={16} className="mr-2" /> Info
                            </div>
                            {activeTab === 'info' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-tv-focus"></div>}
                        </button>
                        <button 
                            className={`flex-1 pb-3 text-sm font-semibold transition-colors relative ${activeTab === 'comentarios' ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            onClick={() => setActiveTab('comentarios')}
                        >
                            <div className="flex items-center justify-center">
                                <MessageSquare size={16} className="mr-2" /> Comentarios
                            </div>
                            {activeTab === 'comentarios' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-tv-focus"></div>}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 min-h-[400px] overflow-y-auto pr-2 space-y-2 pb-10 custom-scrollbar">
                        {activeTab === 'episodios' && (
                            detail.capitulos.length > 0 ? (
                                detail.capitulos.map((cap) => (
                                    <button 
                                        key={cap.numero}
                                        onClick={() => handleChapterSelect(cap)}
                                        className={`w-full flex items-center p-3 rounded-xl transition-all border ${
                                            selectedChapter?.numero === cap.numero 
                                            ? 'bg-tv-focus/10 border-tv-focus/30 shadow-[inset_0_0_20px_rgba(59,130,246,0.1)]' 
                                            : 'bg-white/5 border-transparent hover:bg-white/10'
                                        }`}
                                    >
                                        <div className="relative w-24 aspect-video rounded-lg overflow-hidden bg-black/50 mr-4 flex-shrink-0">
                                            <img src={detail.portada} className="w-full h-full object-cover opacity-40 blur-[2px]" />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Play size={16} className={selectedChapter?.numero === cap.numero ? 'text-tv-focus' : 'text-white'} fill={selectedChapter?.numero === cap.numero ? 'currentColor' : 'none'} />
                                            </div>
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className={`text-sm font-bold ${selectedChapter?.numero === cap.numero ? 'text-tv-focus' : 'text-white'}`}>
                                                Episodio {cap.numero}
                                            </span>
                                            <span className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                                                {cap.titulo || `Episodio ${cap.numero}`}
                                            </span>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 text-sm font-medium">
                                    No hay episodios disponibles.
                                </div>
                            )
                        )}
                        
                        {activeTab === 'info' && (
                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-sm text-gray-300">
                                <p className="mb-2"><strong className="text-white">Estado:</strong> {detail.estado || 'Desconocido'}</p>
                                <p className="mb-2"><strong className="text-white">Temporada:</strong> {detail.temporada || 'Desconocida'}</p>
                                <p className="mb-2"><strong className="text-white">Vistas:</strong> {detail.vistas || 'N/A'}</p>
                            </div>
                        )}

                        {activeTab === 'comentarios' && (
                            <div className="text-center py-10 text-gray-500 text-sm font-medium">
                                Los comentarios estarán disponibles pronto.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
