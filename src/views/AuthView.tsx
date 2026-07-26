import React, { useState } from 'react';
import { Mail, Lock, User, LogIn, UserPlus } from 'lucide-react';
import { loginUser, registerUser } from '../services/authService';
import { User as UserModel } from '../types';

interface AuthViewProps {
    onLoginSuccess: (user: UserModel) => void;
}

export const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsProcessing(true);

        try {
            let user: UserModel;
            if (isLogin) {
                user = await loginUser(email, password);
            } else {
                user = await registerUser(name, email, password);
            }
            onLoginSuccess(user);
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[100dvh] w-full p-4 absolute inset-0 z-50 animate-fade-in bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md bg-black/60 backdrop-blur-xl rounded-3xl border border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.15)] overflow-hidden">
                
                {/* Header */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-white/5">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-tv-focus animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.8)]"></div>
                        <span className="text-sm font-bold uppercase tracking-widest text-white/90">
                            {isLogin ? 'System Login' : 'Registration'}
                        </span>
                    </div>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div className="flex items-center space-x-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 focus-within:border-tv-focus focus-within:ring-1 focus-within:ring-tv-focus/50 transition-all">
                                <User className="text-gray-400" size={20} />
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Operative Name"
                                    required={!isLogin}
                                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-base"
                                />
                            </div>
                        )}
                        
                        <div className="flex items-center space-x-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 focus-within:border-tv-focus focus-within:ring-1 focus-within:ring-tv-focus/50 transition-all">
                            <Mail className="text-gray-400" size={20} />
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                required
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-base"
                            />
                        </div>

                        <div className="flex items-center space-x-4 bg-white/5 rounded-2xl px-5 py-4 border border-white/10 focus-within:border-tv-focus focus-within:ring-1 focus-within:ring-tv-focus/50 transition-all">
                            <Lock className="text-gray-400" size={20} />
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Access Code"
                                required
                                className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 font-medium text-base"
                            />
                        </div>

                        {error && (
                            <p className="text-red-400 text-sm font-medium animate-fade-in text-center">
                                {error}
                            </p>
                        )}

                        <button 
                            type="submit"
                            disabled={isProcessing}
                            className="w-full flex items-center justify-center space-x-3 p-4 bg-tv-focus hover:bg-blue-400 rounded-xl text-white font-bold tracking-wide transition-all hover:scale-[1.02] shadow-[0_0_15px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:hover:scale-100"
                        >
                            {isProcessing ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
                                    <span>{isLogin ? 'AUTHENTICATE' : 'INITIALIZE'}</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button 
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isLogin ? "Request new access credentials" : "Return to authentication portal"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
