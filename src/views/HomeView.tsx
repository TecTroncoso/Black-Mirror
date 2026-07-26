import React from 'react';
import { StatusCard } from '../components/StatusCard';
import { ModuleList } from '../components/ModuleList';
import { Module } from '../types';

interface HomeViewProps {
  isConnected: boolean;
  isProcessing: boolean;
  modules: Module[];
  onAction: () => void;
  onToggleModule: (id: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ isConnected, isProcessing, modules, onAction, onToggleModule }) => (
    <div className="animate-fade-in pr-2">
        <StatusCard
          title="Black Mirror OS"
          version="v4.0"
          isConnected={isConnected}
          onAction={onAction}
          isProcessing={isProcessing}
        />
        <div className="mt-10 md:mt-12">
            <ModuleList
                modules={modules}
                onToggle={onToggleModule}
                onDelete={() => {}}
            />
        </div>
    </div>
);
