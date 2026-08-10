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

export interface ContentItem {
  slug: string;
  titulo: string;
  portada: string;
  capitulos_total: number;
}

export interface ContentDetail extends ContentItem {
  url: string;
  backdrop: string;
  descripcion: string;
  sinopsis_corta: string;
  estado: string;
  tipo: string;
  temporada: string;
  vistas: string;
  content_type: ContentType;
  categorias: string[];
  capitulos: Chapter[];
}

export interface Chapter {
  numero: number;
  titulo: string;
  url: string;
  proveedores: Provider[];
  descargas: Provider[];
}

export interface Provider {
  nombre: string;
  url: string;
  dominio: string;
}

export type ContentType = 'movie' | 'series' | 'anime' | 'adult_anime';

export interface UserSettings {
  adultContentEnabled: boolean;
}

export enum AppView {
  AUTH = 'auth',
  SEARCH = 'search',
  HOME = 'home',
  LIVE = 'live',
  VOD = 'vod',
  MOVIES = 'movies',
  SERIES = 'series',
  ANIME = 'anime',
  ADULT_ANIME = 'adult_anime',
  SETTINGS = 'settings',
  DETAIL = 'detail'
}

export interface NavigationState {
  view: AppView;
  slug?: string;
  contentType?: ContentType;
}
