import { Module } from '../core/domain/models';

export const DEFAULT_MODULES: Module[] = [
  {
    id: 'mod_assistant',
    name: 'Mirror AI',
    version: 'System',
    description: 'The core Black Mirror chat experience. Reflects your needs.',
    author: 'Mirror Team',
    enabled: true,
    systemInstruction: 'You are a helpful futuristic AI assistant named Mirror.',
    category: 'System',
    posterColor: 'from-slate-800 to-black'
  },
  {
    id: 'mod_cinema',
    name: 'Cinephile',
    version: '4K HDR',
    description: 'Expert in movies, series and entertainment recommendations.',
    author: 'Mirror Movies',
    enabled: false,
    systemInstruction: 'You are a movie expert. You give recommendations with IMDb ratings.',
    category: 'VOD',
    posterColor: 'from-red-900 to-rose-950'
  },
  {
    id: 'mod_coder',
    name: 'Dev Tools',
    version: 'v2.0',
    description: 'Advanced coding assistance for developers.',
    author: 'Mirror Dev',
    enabled: false,
    systemInstruction: 'You are a Senior Software Engineer.',
    category: 'Series',
    posterColor: 'from-blue-900 to-indigo-950'
  },
  {
    id: 'mod_sports',
    name: 'Sports Live',
    version: 'Live',
    description: 'Analysis and stats for all sports.',
    author: 'Mirror Sport',
    enabled: false,
    systemInstruction: 'You are a sports analyst. Concise and stat-heavy.',
    category: 'Live',
    posterColor: 'from-orange-900 to-amber-950'
  }
];
