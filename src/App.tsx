import React, { useState, useEffect } from 'react';
import { NavBar } from './components/NavBar';
import { TopBar } from './components/TopBar';
import { AppView, LogEntry, Module, ChatMessage, User } from './types';
import { checkConnection, generateStreamResponse } from './services/aiService';
import { DEFAULT_MODULES } from './data/defaultModules';
import { getStoredUser, logoutUser } from './services/authService';

import { HomeView } from './views/HomeView';
import { LiveChatView } from './views/LiveChatView';
import { VodView } from './views/VodView';
import { SettingsView } from './views/SettingsView';
import { AuthView } from './views/AuthView';

export default function App() {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [view, setView] = useState<AppView>(AppView.HOME);
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
    <div className="flex flex-col-reverse md:flex-row min-h-[100dvh] w-full bg-tv-bg text-tv-text font-sans antialiased selection:bg-tv-focus selection:text-white">
      {/* Global Background Ambient */}
      <div className="ambient-glow"></div>
      
      <NavBar currentView={view} setView={setView} />
      
      <main className="flex-1 flex flex-col min-w-0 relative z-10 mb-20 md:mb-0">
        <TopBar isConnected={isConnected} currentTime={currentTime} />
        <div className="flex-1 min-h-0 px-4 md:px-12 pb-24 md:pb-6 overflow-hidden md:overflow-y-auto">
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