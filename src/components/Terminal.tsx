import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';
import { Terminal as TerminalIcon, XCircle, Search } from 'lucide-react';

interface TerminalProps {
  logs: LogEntry[];
  onClear: () => void;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-500';
      case 'WARN': return 'text-yellow-500';
      case 'DEBUG': return 'text-blue-500';
      default: return 'text-magisk-accent';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] font-mono text-xs md:text-sm relative rounded-lg overflow-hidden border border-magisk-divider shadow-inner">
      <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-magisk-divider">
        <div className="flex items-center space-x-2 text-magisk-subtext">
          <TerminalIcon size={14} />
          <span className="font-bold">Black Mirror Log</span>
        </div>
        <div className="flex space-x-2">
           <button aria-label="Search logs" className="p-1 hover:text-white text-magisk-subtext"><Search size={14}/></button>
           <button aria-label="Clear logs" onClick={onClear} className="p-1 hover:text-red-400 text-magisk-subtext"><XCircle size={14}/></button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
        {logs.length === 0 && <div className="text-magisk-subtext opacity-50 italic">-- No logs --</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex space-x-2 break-all hover:bg-white/5 p-0.5 rounded">
            <span className="text-gray-500 min-w-[70px]">{log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' })}</span>
            <span className={`font-bold min-w-[50px] ${getLevelColor(log.level)}`}>{log.level}</span>
            <span className="text-purple-400 min-w-[60px]">{log.source}</span>
            <span className="text-gray-300 flex-1">{log.message}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};