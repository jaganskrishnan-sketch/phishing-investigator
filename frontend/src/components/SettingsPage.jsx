import React from 'react';
import { Settings, Shield, User, LogOut, Trash2, Lock, Eye, Database, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SettingsPage({
  authStatus,
  onLogin,
  onLogout,
  investigationsCount,
  onClearAllHistory
}) {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
          Application Settings & Privacy
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Manage your email connectivity, privacy parameters, and local data storage.
        </p>
      </div>

      {/* 1. Google Account Connection */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
          <User className="w-4 h-4 text-aurora-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Google Workspace / Gmail Account
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Connection Status:</span>
              {authStatus?.is_authenticated ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-security-safe bg-security-safeBg px-2.5 py-0.5 rounded-full border border-security-safeBorder">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Connected (Read-Only)
                </span>
              ) : (
                <span className="text-xs text-slate-400 bg-aurora-surface px-2.5 py-0.5 rounded-full border border-aurora-border">
                  Disconnected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Used solely to list and inspect suspect emails chosen by you. No emails or credentials are saved externally.
            </p>
          </div>

          {authStatus?.is_authenticated ? (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 bg-security-highRiskBg hover:bg-security-highRiskBg/80 border border-security-highRiskBorder text-security-highRisk text-xs font-semibold px-4 py-2 rounded-xl transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Account</span>
            </button>
          ) : (
            <button
              onClick={onLogin}
              className="flex items-center gap-1.5 bg-gradient-to-r from-aurora-violet to-aurora-cyan hover:from-aurora-violetHover hover:to-aurora-cyanHover text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-aurora-violet/20 transition-all"
            >
              <User className="w-3.5 h-3.5" />
              <span>Connect Gmail</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Privacy & Zero-Retention Disclosure */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
          <Lock className="w-4 h-4 text-security-safe" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Privacy & Security Architecture
          </h3>
        </div>

        <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
          <p className="p-3.5 rounded-xl bg-aurora-surface border border-aurora-border text-slate-300">
            <span className="font-bold text-white block mb-1">🛡️ In-Memory Security Guarantee:</span>
            Your email content is analyzed in-memory to identify potential security threats. We do not expose your credentials, OAuth secrets, or API keys. Tokens are stored strictly in encrypted session cookies and never shared.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3 rounded-xl bg-aurora-bg border border-aurora-border space-y-1">
              <span className="font-semibold text-slate-200 block">Least-Privilege Scopes:</span>
              <span className="text-slate-400 text-[11px]">
                We request strictly <code className="text-aurora-cyan">gmail.readonly</code>. We cannot compose, send, modify, or delete your emails.
              </span>
            </div>

            <div className="p-3 rounded-xl bg-aurora-bg border border-aurora-border space-y-1">
              <span className="font-semibold text-slate-200 block">Local History Storage:</span>
              <span className="text-slate-400 text-[11px]">
                Past investigation records are persisted exclusively in your local browser session cache.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Data Management */}
      <div className="bg-aurora-card border border-aurora-border rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-aurora-border">
          <Database className="w-4 h-4 text-aurora-cyan" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Local Data Storage & Management
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-sm font-bold text-white block">
              Stored Local Records: <span className="text-aurora-cyan font-mono">{investigationsCount}</span>
            </span>
            <p className="text-xs text-slate-400 mt-0.5">
              Clear your local investigation logs and report cache at any time.
            </p>
          </div>

          <button
            onClick={onClearAllHistory}
            disabled={investigationsCount === 0}
            className="flex items-center gap-1.5 bg-security-highRiskBg hover:bg-security-highRiskBg/80 disabled:opacity-40 border border-security-highRiskBorder text-security-highRisk text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Wipe All Local History</span>
          </button>
        </div>
      </div>

    </div>
  );
}
