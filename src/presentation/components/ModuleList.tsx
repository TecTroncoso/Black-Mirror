import React from 'react';
import { Module } from '../../core/domain/models';
import { Play, Plus } from 'lucide-react';

interface ModuleListProps {
  modules: Module[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, onToggle }) => {
  return (
    <div className="md:pb-2">
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center tracking-tight">
        Installed Modules
        <span className="ml-4 text-xs font-normal text-tv-muted border border-tv-muted/30 px-2 py-0.5 rounded-full">
          {modules.length} Available
        </span>
      </h2>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {modules.map((mod) => (
          <div 
            key={mod.id} 
            onClick={() => onToggle(mod.id)}
            className={`group relative aspect-[2/3] bg-tv-card rounded-xl overflow-hidden cursor-pointer transition-all duration-500 ease-out hover:scale-105 hover:z-20 hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] border border-white/5 hover:border-tv-focus/50`}
          >
            {/* Poster Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${mod.posterColor || 'from-neutral-800 to-neutral-900'} transition-transform duration-700 group-hover:scale-110`}>
                <div className="absolute inset-0 flex items-center justify-center opacity-20 group-hover:opacity-10 transition-opacity">
                   {/* Abstract Pattern */}
                   <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent"></div>
                </div>
                 <div className="absolute inset-0 flex items-center justify-center">
                      <span className="hidden md:block text-4xl font-black text-white/10 uppercase tracking-tighter -rotate-90 scale-150">{mod.category}</span>
                      <span className="md:hidden absolute bottom-3 left-3 text-xs font-black text-white/20 uppercase tracking-tighter">{mod.category}</span>
                 </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>

            {/* Content info (Always visible but subtle) */}
            <div className="absolute inset-0 p-5 flex flex-col justify-end transition-all duration-300">
                
                {mod.enabled && (
                    <div className="absolute top-3 right-3">
                         <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse"></div>
                    </div>
                )}

                <div className="transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-white font-bold text-lg leading-tight mb-1 drop-shadow-md group-hover:text-tv-focus transition-colors">
                        {mod.name}
                    </h3>
                    <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-mono uppercase tracking-wider mb-2 opacity-80">
                        <span className="bg-white/10 px-1.5 py-0.5 rounded text-white">{mod.version}</span>
                        <span>{mod.category}</span>
                    </div>
                    
                    <p className="text-xs text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 h-0 group-hover:h-auto overflow-hidden">
                        {mod.description}
                    </p>
                </div>
            </div>
            
             {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                 <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg group-hover:scale-110 transition-transform">
                    <Play size={20} className="ml-1 text-white" fill="currentColor" />
                 </div>
            </div>
          </div>
        ))}
        
        {/* Add New Card */}
        <div className="group aspect-[2/3] rounded-xl border-2 border-dashed border-white/10 hover:border-tv-focus/50 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-white/5">
             <div className="w-14 h-14 rounded-full bg-tv-card group-hover:bg-tv-focus flex items-center justify-center mb-3 transition-colors shadow-lg">
                 <Plus size={24} className="text-gray-400 group-hover:text-white" />
             </div>
             <span className="text-sm font-medium text-gray-500 group-hover:text-white">Add Module</span>
        </div>
      </div>
    </div>
  );
};