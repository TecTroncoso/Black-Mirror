import React from 'react';
import { Wifi, Bell } from 'lucide-react';

interface TopBarProps {
  isConnected: boolean;
  currentTime: Date;
  hidden?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({ isConnected, currentTime, hidden = false }) => {
  return (
    <div className={`flex justify-between items-center px-4 md:px-8 py-4 md:py-6 z-40 relative transition-[transform,opacity] duration-500 ease-in-out ${
      hidden ? '-translate-y-full opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
    }`}>
      <div className="flex items-center space-x-3 md:space-x-4">
         {/* Neon BM Logo */}
         <div className="relative flex items-center justify-center select-none font-['Orbitron']">
             {/* Glow behind */}
             <div className="absolute inset-0 bg-purple-600/50 blur-[10px] rounded-full scale-110 translate-x-1"></div>
             {/* Letters */}
             <div className="relative flex items-center font-black text-2xl md:text-3xl tracking-tighter">
                 <span className="text-white drop-shadow-md z-10 relative">B</span>
                 <span className="text-[#a855f7] -ml-2 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)] z-0 relative">M</span>
             </div>
         </div>
         {/* Brand Text */}
         <div className="flex flex-col justify-center mt-0.5 select-none font-['Orbitron']">
            <span className="font-bold text-base md:text-xl text-white tracking-[0.15em] leading-none uppercase">
                Black <span className="text-[#a855f7] font-semibold drop-shadow-[0_0_5px_rgba(168,85,247,0.5)]">Mirror</span>
            </span>
         </div>
      </div>
      <div className="flex items-center space-x-4 md:space-x-8">
        <div className="hidden md:flex items-center space-x-6 bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-md">
            <Wifi size={16} className={isConnected ? "text-green-500" : "text-red-500"} />
            <div className="w-px h-4 bg-white/10"></div>
            <span className="font-mono text-xs font-bold text-gray-300 tracking-wider">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
        </div>
        <button aria-label="Notifications" className="p-2 hover:bg-white/10 rounded-full transition-colors text-white relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
      </div>
    </div>
  );
};
