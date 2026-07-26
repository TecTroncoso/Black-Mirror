export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  source: 'System' | 'User' | 'Modules';
}

export interface Module {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  systemInstruction: string;
  category: 'Live' | 'VOD' | 'Series' | 'System';
  posterColor?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export enum AppView {
  AUTH = 'auth',
  SEARCH = 'search',
  HOME = 'home',
  LIVE = 'live',     // Chat
  VOD = 'vod',       // Modules List
  SETTINGS = 'settings'
}
