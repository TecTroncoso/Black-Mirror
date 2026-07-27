import React, { useState, useEffect } from 'react';
import { NavBar } from './components/NavBar';
import { TopBar } from './components/TopBar';
import { AppView, LogEntry, Module, ChatMessage, User, UserSettings } from './types';
import { checkConnection, generateStreamResponse } from './services/aiService';
import { DEFAULT_MODULES } from './data/defaultModules';
import { getStoredUser, logoutUser } from './services/authService';

import { HomeView } from './views/HomeView';
import { LiveChatView } from './views/LiveChatView';
import { VodView } from './views/VodView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';
import { ContentGridView } from './views/ContentGridView';

const getStoredSettings = (): UserSettings => {
  try {
    const stored = localStorage.getItem('bm_settings');
    if (stored) return JSON.parse(stored);
  } catch {}
  return { adultContentEnabled: false };
};

export default function App() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [isConnected, setIsConnected] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [modules, setModules] = useState<Module[]>(DEFAULT_MODULES);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [promptInput, setPromptInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    checkConnection().then(setIsConnected);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('bm_settings', JSON.stringify(settings));
  }, [settings]);

  const toggleAdultContent = () => {
    setSettings(prev => ({ ...prev, adultContentEnabled: !prev.adultContentEnabled }));
    // If disabling and currently viewing adult content, redirect home
    if (settings.adultContentEnabled && view === AppView.ADULT_ANIME) {
      setView(AppView.HOME);
    }
  };

  const addLog = (level: LogEntry['level'], source: LogEntry['source'], message: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      level,
      source,
      message
    }]);
  };

  const handleToggleModule = (id: string) => {
    setModules(prev => prev.map(m => {
        if (m.id === id) {
            return { ...m, enabled: !m.enabled };
        }
        return { ...m, enabled: false }; 
    }));
    
    const target = modules.find(m => m.id === id);
    if (target && !target.enabled) {
        setView(AppView.LIVE);
        setChatHistory([{ role: 'model', text: `Switched to channel: ${target.name}. ${target.description}` }]);
    }
  };

  const getActiveSystemInstruction = () => {
    const enabled = modules.find(m => m.enabled);
    return enabled ? enabled.systemInstruction : "You are a helpful AI assistant.";
  };

  const handleSendPrompt = async () => {
    if (!promptInput.trim()) return;
    const prompt = promptInput;
    setPromptInput('');
    setIsProcessing(true);
    
    setChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
    const systemInstruction = getActiveSystemInstruction();

    try {
      let responseText = '';
      setChatHistory(prev => [...prev, { role: 'model', text: '...' }]);

      await generateStreamResponse(prompt, systemInstruction, chatHistory, (chunk) => {
        responseText += chunk;
        setChatHistory(prev => {
          const newHist = [...prev];
          const last = newHist[newHist.length - 1];
          if (last.role === 'model') last.text = responseText;
          return newHist;
        });
      });
    } catch (error: any) {
      setChatHistory(prev => [...prev, { role: 'model', text: `Error: ${error.message}` }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (!user) {
    return (
      <div className="flex flex-col min-h-[100dvh] w-full bg-tv-bg text-tv-text font-sans antialiased selection:bg-tv-focus selection:text-white">
        <div className="ambient-glow"></div>
        <AuthView onLoginSuccess={(loggedInUser) => {
            setUser(loggedInUser);
            setView(AppView.HOME);
        }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse md:flex-row h-[100dvh] w-full overflow-hidden bg-tv-bg text-tv-text font-sans antialiased selection:bg-tv-focus selection:text-white">
      {/* Global Background Ambient */}
      <div className="ambient-glow"></div>
      
      <NavBar currentView={view} setView={setView} adultContentEnabled={settings.adultContentEnabled} />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10 mb-20 md:mb-0 h-full">
        <TopBar isConnected={isConnected} currentTime={currentTime} />
        <div className="flex-1 px-4 md:px-12 pb-24 md:pb-6 overflow-y-auto overflow-x-hidden">
            {view === AppView.HOME && (
                <HomeView 
                    isConnected={isConnected} 
                    isProcessing={isProcessing} 
                    modules={modules} 
                    onAction={() => setView(AppView.LIVE)} 
                    onToggleModule={handleToggleModule} 
                />
            )}
            {view === AppView.SEARCH && (
                <LiveChatView 
                    chatHistory={chatHistory} 
                    promptInput={promptInput} 
                    setPromptInput={setPromptInput} 
                    isProcessing={isProcessing} 
                    onSendPrompt={handleSendPrompt} 
                />
            )} 
            {view === AppView.LIVE && (
                <LiveChatView 
                    chatHistory={chatHistory} 
                    promptInput={promptInput} 
                    setPromptInput={setPromptInput} 
                    isProcessing={isProcessing} 
                    onSendPrompt={handleSendPrompt} 
                />
            )}
            {view === AppView.VOD && (
                <VodView 
                    modules={modules} 
                    onToggleModule={handleToggleModule} 
                />
            )}
            {view === AppView.MOVIES && (
                <ContentGridView contentType="movie" title="Movies" />
            )}
            {view === AppView.SERIES && (
                <ContentGridView contentType="series" title="Series" />
            )}
            {view === AppView.ANIME && (
                <ContentGridView contentType="anime" title="Anime" />
            )}
            {view === AppView.ADULT_ANIME && settings.adultContentEnabled && (
                <ContentGridView contentType="adult_anime" title="Adult Anime" />
            )}
            {view === AppView.SETTINGS && (
                <div className="space-y-6">
                    <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl flex items-center justify-between">
                        <div className="space-y-1">
                            <h2 className="text-xl font-bold text-white tracking-wide">Operative Status</h2>
                            <p className="text-sm text-gray-400 font-light">Logged in as: {user.email}</p>
                        </div>
                        <button 
                            onClick={handleLogout}
                            className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl transition-all font-bold uppercase tracking-wider text-sm"
                        >
                            Disconnect
                        </button>
                    </div>

                    {/* Adult Content Toggle */}
                    <div className="bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h3 className="text-lg font-bold text-white">Content Preferences</h3>
                                <p className="text-sm text-gray-400 font-light">Manage what content is visible in your navigation.</p>
                            </div>
                        </div>
                        <div className="mt-5 flex items-center justify-between py-3 px-4 bg-white/5 rounded-xl border border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                                    <span className="text-lg">🔞</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">Show Adult Content</p>
                                    <p className="text-xs text-gray-500">Enables the Adult Anime category in navigation.</p>
                                </div>
                            </div>
                            <button
                                onClick={toggleAdultContent}
                                className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${
                                    settings.adultContentEnabled ? 'bg-tv-focus' : 'bg-white/10'
                                }`}
                            >
                                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                                    settings.adultContentEnabled ? 'translate-x-5' : 'translate-x-0'
                                }`}></div>
                            </button>
                        </div>
                    </div>

                    <SettingsView 
                        logs={logs} 
                        onClearLogs={() => setLogs([])} 
                    />
                </div>
            )}
        </div>
      </main>
    </div>
  );
}