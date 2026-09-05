import React, { useState } from 'react';
import { Shield, LayoutDashboard, Search, History, FileText, Settings, User, LogOut, Lock, Menu, X } from 'lucide-react';

export default function Navbar({ currentTab, onNavigate, authStatus, onLogin, onLogout, investigationsCount }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'analyze', label: 'Analyze', icon: Search },
    { id: 'investigations', label: 'Investigations', icon: History, count: investigationsCount },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="border-b border-aurora-border bg-aurora-surface/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Product Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-3 group text-left focus:outline-none"
            >
              <div className="p-2 rounded-xl bg-gradient-to-br from-aurora-violet/20 to-aurora-cyan/20 border border-aurora-violet/30 text-aurora-violet group-hover:border-aurora-cyan/50 transition-all shadow-sm">
                <Shield className="w-5 h-5 text-aurora-violet group-hover:text-aurora-cyan transition-colors" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-white font-mono">
                    Phishing Investigator
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-aurora-violet/15 text-aurora-violet border border-aurora-violet/30">
                    SaaS
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  AI-Powered Email Security & Threat Intelligence
                </p>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1.5 ml-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-aurora-cardElevated text-aurora-violet border border-aurora-borderLight shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-aurora-card'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-aurora-violet' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                    {item.count > 0 && (
                      <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-aurora-border text-slate-300">
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action: Connection Status & Public Login */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* In-Memory Privacy Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-security-safeBg border border-security-safeBorder text-security-safe text-xs font-medium">
              <Lock className="w-3.5 h-3.5" />
              <span>In-Memory Privacy Active</span>
            </div>

            {/* Google Authentication Pill */}
            {authStatus?.is_authenticated ? (
              <div className="flex items-center gap-2.5 bg-aurora-card border border-aurora-border rounded-xl px-3 py-1.5 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-security-safe animate-pulse" />
                <span className="text-xs font-semibold text-slate-200">
                  Gmail Connected
                </span>
                <button
                  onClick={onLogout}
                  title="Disconnect Account"
                  className="text-slate-400 hover:text-security-highRisk transition-colors p-1 hover:bg-aurora-surface rounded-md ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover text-white font-semibold text-xs px-4 py-2 rounded-xl shadow-lg shadow-aurora-violet/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <User className="w-3.5 h-3.5" />
                <span>Connect Gmail</span>
              </button>
            )}

          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-aurora-card border border-aurora-border text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-aurora-border bg-aurora-surface px-4 pt-3 pb-6 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-semibold text-left ${
                    isActive
                      ? 'bg-aurora-cardElevated text-aurora-violet border border-aurora-border'
                      : 'text-slate-400 hover:bg-aurora-card'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-aurora-border flex items-center justify-between">
            {authStatus?.is_authenticated ? (
              <div className="flex items-center justify-between w-full">
                <span className="text-xs text-security-safe font-semibold flex items-center gap-1.5">
                  <Lock className="w-4 h-4" /> Gmail Connected
                </span>
                <button
                  onClick={onLogout}
                  className="text-xs text-security-highRisk hover:underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="w-full bg-gradient-to-r from-aurora-violet to-aurora-cyan text-white font-bold text-xs py-2.5 rounded-xl text-center"
              >
                Connect Gmail
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
