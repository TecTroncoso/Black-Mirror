import React from 'react';
import { Search, Home, Tv, Film, Settings, User } from 'lucide-react';
import { AppView } from '../types';

interface NavBarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, setView }) => {
  const navItems = [
    { id: AppView.SEARCH, icon: Search, label: 'Search' },
    { id: AppView.HOME, icon: Home, label: 'Home' },
    { id: AppView.LIVE, icon: Tv, label: 'Live' },
    { id: AppView.VOD, icon: Film, label: 'VOD' },
    { id: AppView.SETTINGS, icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full h-20 md:relative md:h-screen md:w-24 flex flex-row md:flex-col items-center py-0 md:py-8 z-50">
      {/* Background for Sidebar */}
      <div className="absolute inset-0 md:inset-y-0 md:left-0 w-full md:w-24 h-full glass-panel border-t border-t-white/10 md:border-t-0 md:border-r md:border-r-white/5"></div>

      <div className="relative z-10 flex flex-row md:flex-col items-center justify-between md:justify-start h-full w-full px-4 md:px-0">
        <div className="hidden md:flex mb-10 p-3 bg-gradient-to-br from-tv-focus to-indigo-600 rounded-2xl shadow-[0_0_15px_rgba(59,130,246,0.5)]">
          <User size={20} className="text-white" />
        </div>
        
        <div className="flex-1 flex flex-row md:flex-col space-x-6 md:space-x-0 md:space-y-8 w-full items-center justify-around md:justify-center h-full">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                aria-label={item.label}
                className={`group flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 relative ${
                  isActive 
                    ? 'text-white scale-110' 
                    : 'text-tv-muted hover:text-white hover:scale-105'
                }`}
              >
                {/* Active Indicator Background */}
                {isActive && (
                  <div className="absolute inset-0 bg-tv-focus/20 rounded-xl blur-md -z-10"></div>
                )}
                
                <item.icon 
                  size={24} 
                  strokeWidth={isActive ? 2.5 : 2} 
                  className={`transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]' : ''}`}
                />
                
                <span className={`hidden md:block absolute left-full ml-4 px-2 py-1 bg-white text-black text-xs font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50`}>
                  {item.label}
                </span>

                {isActive && (
                    <>
                      {/* Desktop marker */}
                      <div className="hidden md:block absolute -left-5 top-1/2 -translate-y-1/2 w-1 h-6 bg-tv-focus rounded-r-full shadow-[0_0_10px_#3b82f6]"></div>
                      {/* Mobile marker */}
                      <div className="md:hidden absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-1 bg-tv-focus rounded-t-full shadow-[0_0_10px_#3b82f6]"></div>
                    </>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="hidden md:block mt-auto text-[10px] text-tv-muted font-mono tracking-widest opacity-30 rotate-90 mb-4 origin-center">
          V3.0
        </div>
      </div>
    </div>
  );
};