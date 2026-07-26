import React from 'react';
import { ModuleList } from '../components/ModuleList';
import { Module } from '../types';

interface VodViewProps {
    modules: Module[];
    onToggleModule: (id: string) => void;
}

export const VodView: React.FC<VodViewProps> = ({ modules, onToggleModule }) => (
    <div className="h-full overflow-y-auto scrollbar-hide animate-fade-in pr-2">
        <ModuleList modules={modules} onToggle={onToggleModule} onDelete={() => {}} />
    </div>
);
