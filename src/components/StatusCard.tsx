import React from 'react';
import { Play, Info, Cpu } from 'lucide-react';

interface StatusCardProps {
  title: string;
  version: string;
  isConnected: boolean;
  onAction?: () => void;
  actionLabel?: string;
  isProcessing?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  version,
  isConnected,
  onAction,
  actionLabel,
  isProcessing
}) => {
  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[400px] rounded-3xl overflow-hidden shadow-2xl group border border-white/5">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-black z-0">
          <img 
            src="https://images.unsplash.com/photo-1535498730771-e735b998cd29?q=80&w=2574&auto=format&fit=crop" 
            className="w-full h-full object-cover opacity-40 group-hover:opacity-50 group-hover:scale-105 transition-all duration-[2s]"
            alt="Hero Background"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent"></div>
      </div>

      <div className="absolute bottom-0 left-0 p-5 sm:p-8 md:p-12 z-20 max-w-3xl flex flex-col items-start">
        
        <div className="mb-4 flex items-center space-x-3 animate-fade-in">
           <span className="px-3 py-1 bg-white/10 backdrop-blur-md border border-white/10 rounded text-[10px] font-bold tracking-widest uppercase text-white shadow-sm">
             Featured AI
           </span>
           <span className={`flex items-center space-x-2 text-xs font-bold uppercase tracking-widest ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
              <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
              <span>{isConnected ? "System Online" : "Offline"}</span>
           </span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white mb-4 leading-none tracking-tighter drop-shadow-2xl animate-slide-in">
          {title}
        </h1>
        
        <p className="text-gray-400 text-sm sm:text-base md:text-lg mb-4 sm:mb-6 md:mb-8 max-w-xl font-light leading-relaxed animate-fade-in delay-100">
          Unlock the full potential of your device with neural processing. 
          Real-time analysis, system optimization, and intelligent media curation.
        </p>

        <div className="flex flex-col sm:flex-row w-full sm:w-auto sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 animate-fade-in delay-200">
          <button 
            onClick={onAction}
            className="group/btn w-full sm:w-auto justify-center relative overflow-hidden flex items-center space-x-3 bg-white text-black px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]"
          >
            {isProcessing ? (
                <Cpu size={24} className="animate-spin text-black" />
            ) : (
                <Play size={24} fill="currentColor" />
            )}
            <span className="uppercase tracking-wide text-sm">{actionLabel || "Initialize"}</span>
          </button>
          
          <button className="flex w-full sm:w-auto justify-center items-center space-x-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-xl font-bold backdrop-blur-md transition-all hover:border-white/30">
            <Info size={24} />
            <span className="uppercase tracking-wide text-sm">More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
};