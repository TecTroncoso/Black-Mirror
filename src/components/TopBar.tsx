import React from 'react';
import { Wifi, Bell } from 'lucide-react';

interface TopBarProps {
  isConnected: boolean;
  currentTime: Date;
}

export const TopBar: React.FC<TopBarProps> = ({ isConnected, currentTime }) => {
  return (
    <div className="flex justify-between items-center px-4 md:px-8 py-4 md:py-6 z-40 relative">
      <div className="flex items-center space-x-3 md:space-x-4">
         <div className="w-8 h-8 rounded bg-gradient-to-tr from-tv-focus to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
             <span className="font-bold text-white text-xs">B</span>
         </div>
         <div className="flex flex-col">
            <span className="font-bold text-base md:text-lg text-white tracking-wide leading-none">BLACK <span className="text-tv-focus font-light">MIRROR</span></span>
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
