import React from 'react';
import { Settings } from 'lucide-react';
import { Terminal } from '../components/Terminal';
import { LogEntry } from '../../core/domain/models';

interface SettingsViewProps {
    logs: LogEntry[];
    onClearLogs: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ logs, onClearLogs }) => (
    <div className="h-full overflow-y-auto p-4 animate-fade-in pr-2">
        <h2 className="text-3xl font-bold text-white mb-8 tracking-tight">Settings</h2>
        <div className="grid gap-6 max-w-3xl">
            <div className="bg-tv-card p-6 rounded-2xl flex justify-between items-center cursor-pointer hover:bg-white/10 transition-colors border border-white/5 group">
                <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-tv-focus transition-colors">
                        <Settings size={20} />
                    </div>
                    <div>
                    <h4 className="font-bold text-white text-lg">Parental Control</h4>
                    <p className="text-sm text-gray-500">Restricted Mode enabled</p>
                    </div>
                </div>
                <div className="w-12 h-7 bg-white/10 rounded-full relative transition-colors group-hover:bg-green-500/20">
                    <div className="absolute right-1 top-1 w-5 h-5 bg-white rounded-full shadow-lg"></div>
                </div>
            </div>
        </div>
        
        <div className="mt-12">
        <h3 className="text-xl font-bold text-white mb-6">System Terminal</h3>
        <div className="h-80 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
            <Terminal logs={logs} onClear={onClearLogs} />
        </div>
        </div>
    </div>
);
