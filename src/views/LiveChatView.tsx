import React from 'react';
import { Search as SearchIcon, Send, Mic } from 'lucide-react';
import { ChatMessage } from '../types';

interface LiveChatViewProps {
  chatHistory: ChatMessage[];
  promptInput: string;
  setPromptInput: (value: string) => void;
  isProcessing: boolean;
  onSendPrompt: () => void;
}

export const LiveChatView: React.FC<LiveChatViewProps> = ({
    chatHistory, promptInput, setPromptInput, isProcessing, onSendPrompt
}) => (
    <div className="flex flex-col h-full animate-slide-in pb-4">
        <div className="flex-1 bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden flex flex-col relative shadow-2xl">
            {/* Header of Chat Window */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-white/70">Mirror Link</span>
                </div>
                <span className="text-xs font-mono text-white/30">CH-001</span>
            </div>

            {/* Chat Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
                 {chatHistory.length === 0 && (
                     <div className="h-full flex flex-col items-center justify-center text-tv-muted opacity-30">
                         <div className="w-24 h-24 rounded-full border-4 border-white/10 flex items-center justify-center mb-4">
                            <Mic size={32} />
                         </div>
                         <p className="text-sm font-light tracking-widest uppercase">Awaiting Reflection</p>
                     </div>
                 )}
                 {chatHistory.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-5 rounded-2xl backdrop-blur-sm ${
                            msg.role === 'user' 
                            ? 'bg-tv-focus text-white rounded-tr-sm shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
                            : 'bg-white/5 text-gray-200 rounded-tl-sm border border-white/5'
                        }`}>
                            <p className="text-sm md:text-base leading-relaxed font-light">{msg.text}</p>
                        </div>
                    </div>
                 ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 md:p-6 bg-black/40 border-t border-white/5">
                <div className="flex items-center space-x-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 focus-within:border-tv-focus focus-within:ring-1 focus-within:ring-tv-focus/50 transition-all hover:bg-white/10">
                    <SearchIcon className="text-gray-400" size={20} />
                    <input 
                        type="text" 
                        value={promptInput}
                        onChange={(e) => setPromptInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendPrompt()}
                        placeholder="Ask the Mirror..."
                        className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-lg"
                        autoFocus
                    />
                    <button 
                        onClick={onSendPrompt}
                        disabled={isProcessing}
                        aria-label="Send prompt"
                        className="p-3 bg-tv-focus hover:bg-blue-400 rounded-xl text-white transition-all hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                    >
                        {isProcessing ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    </div>
);
