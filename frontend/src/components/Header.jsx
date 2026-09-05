import React from 'react';
import { Shield, Lock, User, LogOut, History, Sparkles } from 'lucide-react';

export default function Header({ authStatus, onLogin, onLogout, historyCount, onOpenHistory }) {
  return (
    <header className="border-b border-slate-800 bg-[#0f172a]/90 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl shadow-lg shadow-sky-500/10">
            <Shield className="w-6 h-6 text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">
                SOC Threat Hunter
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Enterprise PS-02
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous Phishing Investigation & Multi-Vector Threat Engine
            </p>
          </div>
        </div>

        {/* Action Controls & Authentication */}
        <div className="flex items-center gap-3">
          
          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 text-xs font-semibold shadow transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="bg-sky-500/20 text-sky-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-sky-500/30">
                {historyCount}
              </span>
            )}
          </button>

          {/* Zero Retention Security Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
            <Lock className="w-3.5 h-3.5" />
            <span>Zero-Retention Privacy Active</span>
          </div>

          {/* User Auth Pill */}
          {authStatus?.is_authenticated ? (
            <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-200">
                Gmail Connected
              </span>
              <button
                onClick={onLogout}
                title="Disconnect Gmail Account"
                className="text-slate-400 hover:text-red-400 transition-colors ml-1 p-1 hover:bg-slate-700 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-medium text-xs px-4 py-2 rounded-xl shadow-lg shadow-sky-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <User className="w-3.5 h-3.5" />
              <span>Connect Gmail</span>
            </button>
          )}

        </div>

      </div>
    </header>
  );
}
